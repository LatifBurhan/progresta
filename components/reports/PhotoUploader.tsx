'use client'

import { useState, useRef, ChangeEvent } from 'react'
import { X, Upload, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { validatePhotoFiles } from '@/lib/validations/report-validation'

interface PhotoUploaderProps {
  maxPhotos?: number
  acceptedFormats?: string[]
  onFilesSelected: (files: File[]) => void
  initialPhotos?: string[]
  error?: string
}

export function PhotoUploader({
  maxPhotos = 5,
  acceptedFormats = ['image/jpeg', 'image/jpg', 'image/png'],
  onFilesSelected,
  initialPhotos = [],
  error
}: PhotoUploaderProps) {
  const [previews, setPreviews] = useState<string[]>(initialPhotos)
  const [files, setFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileInput = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files
    if (!selectedFiles || selectedFiles.length === 0) return

    // Validate files
    const validationError = validatePhotoFiles(selectedFiles)
    if (validationError) {
      alert(validationError)
      return
    }

    // Convert FileList to array
    const fileArray = Array.from(selectedFiles)
    
    // Generate previews
    const newPreviews: string[] = []
    fileArray.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        newPreviews.push(reader.result as string)
        if (newPreviews.length === fileArray.length) {
          setPreviews(newPreviews)
          setFiles(fileArray)
          onFilesSelected(fileArray)
        }
      }
      reader.readAsDataURL(file)
    })
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
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={handleButtonClick}
          className="w-full"
        >
          <Upload className="w-4 h-4 mr-2" />
          Pilih Foto (1-{maxPhotos})
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
          <p className="text-xs mt-1">JPG, PNG, atau JPEG (1-{maxPhotos} foto)</p>
        </div>
      )}
    </div>
  )
}
