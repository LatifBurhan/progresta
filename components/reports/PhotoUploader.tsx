'use client'

import { useState, useRef, ChangeEvent, useEffect } from 'react'
import { X, Upload, Image as ImageIcon, Camera, Clipboard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { validatePhotoFiles } from '@/lib/validations/report-validation'
import { CameraCapture } from './CameraCapture'

interface PhotoUploaderProps {
  maxPhotos?: number
  acceptedFormats?: string[]
  onFilesSelected: (files: File[]) => void
  initialPhotos?: string[]
  error?: string
  enableCamera?: boolean
}

export function PhotoUploader({
  maxPhotos = 5,
  acceptedFormats = ['image/jpeg', 'image/jpg', 'image/png'],
  onFilesSelected,
  initialPhotos = [],
  error,
  enableCamera = true
}: PhotoUploaderProps) {
  const [previews, setPreviews] = useState<string[]>(initialPhotos)
  const [files, setFiles] = useState<File[]>([])
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false)
  const [cameraSupported, setCameraSupported] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Check camera support
  useEffect(() => {
    const checkCameraSupport = () => {
      const supported = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
      setCameraSupported(supported)
    }
    checkCameraSupport()
  }, [])

  // Handle paste from clipboard
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      // Only handle paste if container is focused or if paste happens anywhere on page
      if (!containerRef.current) return
      
      // Check if max photos reached
      if (files.length >= maxPhotos) {
        alert(`Maksimal ${maxPhotos} foto sudah tercapai. Hapus foto yang ada untuk menambah foto baru.`)
        return
      }

      const items = e.clipboardData?.items
      if (!items) return

      // Find image items in clipboard
      const imageItems = Array.from(items).filter(item => item.type.startsWith('image/'))
      
      if (imageItems.length === 0) return

      // Prevent default paste behavior
      e.preventDefault()

      // Process each image
      for (const item of imageItems) {
        if (files.length >= maxPhotos) {
          alert(`Maksimal ${maxPhotos} foto. Beberapa foto tidak ditambahkan.`)
          break
        }

        const blob = item.getAsFile()
        if (!blob) continue

        // Create File object with proper name
        const timestamp = Date.now()
        const file = new File([blob], `pasted_image_${timestamp}.png`, { type: blob.type })

        // Validate file
        const validationError = validatePhotoFiles([file])
        if (validationError) {
          alert(validationError)
          continue
        }

        // Add to files
        const newFiles = [...files, file]
        
        // Generate preview
        const reader = new FileReader()
        reader.onloadend = () => {
          setPreviews(prev => [...prev, reader.result as string])
          setFiles(newFiles)
          onFilesSelected(newFiles)
        }
        reader.readAsDataURL(file)
      }
    }

    // Add paste event listener to document
    document.addEventListener('paste', handlePaste)
    
    return () => {
      document.removeEventListener('paste', handlePaste)
    }
  }, [files, maxPhotos, onFilesSelected])

  const handleFileInput = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files
    if (!selectedFiles || selectedFiles.length === 0) return

    // Check if adding these files would exceed max
    const totalFiles = files.length + selectedFiles.length
    if (totalFiles > maxPhotos) {
      alert(`Maksimal ${maxPhotos} foto. Anda sudah memiliki ${files.length} foto.`)
      return
    }

    // Validate files
    const validationError = validatePhotoFiles(selectedFiles)
    if (validationError) {
      alert(validationError)
      return
    }

    // Convert FileList to array and merge with existing files
    const fileArray = Array.from(selectedFiles)
    const newFiles = [...files, ...fileArray]
    
    // Generate previews for new files
    const newPreviews: string[] = []
    fileArray.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        newPreviews.push(reader.result as string)
        if (newPreviews.length === fileArray.length) {
          setPreviews([...previews, ...newPreviews])
          setFiles(newFiles)
          onFilesSelected(newFiles)
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const handleCameraCapture = (file: File) => {
    // Add captured file to existing files
    const newFiles = [...files, file]
    
    // Generate preview for captured photo
    const reader = new FileReader()
    reader.onloadend = () => {
      const newPreviews = [...previews, reader.result as string]
      setPreviews(newPreviews)
      setFiles(newFiles)
      onFilesSelected(newFiles)
    }
    reader.readAsDataURL(file)
    
    // Close camera modal
    setIsCameraModalOpen(false)
  }

  const openCameraModal = () => {
    if (files.length >= maxPhotos) {
      alert(`Maksimal ${maxPhotos} foto sudah tercapai. Hapus foto yang ada untuk menambah foto baru.`)
      return
    }
    setIsCameraModalOpen(true)
  }

  const closeCameraModal = () => {
    setIsCameraModalOpen(false)
  }

  const removePhoto = (index: number) => {
    const newPreviews = previews.filter((_, i) => i !== index)
    const newFiles = files.filter((_, i) => i !== index)
    setPreviews(newPreviews)
    setFiles(newFiles)
    onFilesSelected(newFiles)
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div 
      ref={containerRef}
      className="space-y-3"
      tabIndex={0}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
    >
      <div className="flex items-center gap-2">
        {/* Camera Button */}
        {enableCamera && cameraSupported && (
          <Button
            type="button"
            variant="outline"
            onClick={openCameraModal}
            disabled={files.length >= maxPhotos}
            className="flex-1"
          >
            <Camera className="w-4 h-4 mr-2" />
            Ambil Foto
          </Button>
        )}

        {/* File Picker Button */}
        <Button
          type="button"
          variant="outline"
          onClick={handleButtonClick}
          disabled={files.length >= maxPhotos}
          className="flex-1"
        >
          <Upload className="w-4 h-4 mr-2" />
          Pilih Foto
        </Button>
        
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedFormats.join(',')}
          multiple
          onChange={handleFileInput}
          className="hidden"
        />
      </div>

      {/* Paste Indicator */}
      <div className="flex items-center justify-center gap-2 py-2 px-3 bg-blue-50 border border-blue-200 rounded-lg">
        <Clipboard className="w-4 h-4 text-blue-600" />
        <p className="text-xs text-blue-700 font-medium">
          Atau tekan <kbd className="px-1.5 py-0.5 bg-white border border-blue-300 rounded text-xs font-mono">Ctrl+V</kbd> untuk paste foto dari clipboard
        </p>
      </div>

      {/* Max photos reached message */}
      {files.length >= maxPhotos && (
        <p className="text-sm text-amber-600 font-medium">
          Maksimal {maxPhotos} foto sudah tercapai
        </p>
      )}

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {previews.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {previews.map((preview, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden border bg-muted">
                <img
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                type="button"
                onClick={() => removePhoto(index)}
                className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {previews.length === 0 && (
        <div className="border-2 border-dashed rounded-lg p-8 text-center text-muted-foreground">
          <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Belum ada foto dipilih</p>
          <p className="text-xs mt-1">JPG, PNG, atau JPEG (Opsional, maks {maxPhotos} foto)</p>
        </div>
      )}

      {/* Camera Capture Component */}
      {enableCamera && cameraSupported && (
        <CameraCapture
          isOpen={isCameraModalOpen}
          onClose={closeCameraModal}
          onPhotoCapture={handleCameraCapture}
          maxFileSize={5 * 1024 * 1024}
        />
      )}
    </div>
  )
}
