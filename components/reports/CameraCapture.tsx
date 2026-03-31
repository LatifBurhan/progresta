'use client'

import { useState, useRef, useEffect } from 'react'
import { Camera, X, RefreshCw, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CameraModal } from './CameraModal'

// Types and Interfaces
export interface CameraCaptureProps {
  onPhotoCapture: (file: File) => void
  onClose: () => void
  isOpen: boolean
  maxFileSize?: number // in bytes, default 5MB
  preferredCamera?: 'user' | 'environment'
}

interface CameraCaptureState {
  stream: MediaStream | null
  isStreaming: boolean
  error: string | null
  availableCameras: MediaDeviceInfo[]
  selectedCameraId: string | null
  isCapturing: boolean
  isSwitchingCamera: boolean
}

enum CameraErrorType {
  NOT_SUPPORTED = 'NOT_SUPPORTED',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  DEVICE_NOT_FOUND = 'DEVICE_NOT_FOUND',
  STREAM_ERROR = 'STREAM_ERROR',
  CAPTURE_ERROR = 'CAPTURE_ERROR'
}

interface CameraError {
  type: CameraErrorType
  message: string
  userMessage: string
  fallbackAvailable: boolean
}

const ERROR_MESSAGES = {
  NOT_SUPPORTED: 'Browser Anda tidak mendukung akses kamera. Silakan gunakan tombol upload untuk memilih foto dari galeri.',
  PERMISSION_DENIED: 'Akses kamera ditolak. Untuk menggunakan kamera, izinkan akses di pengaturan browser Anda. Atau gunakan tombol upload untuk memilih foto dari galeri.',
  DEVICE_NOT_FOUND: 'Kamera tidak ditemukan pada device Anda. Silakan gunakan tombol upload untuk memilih foto dari galeri.',
  STREAM_ERROR: 'Terjadi kesalahan pada kamera. Silakan coba lagi atau gunakan tombol upload.',
  CAPTURE_ERROR: 'Gagal mengambil foto. Silakan coba lagi.',
}

export function CameraCapture({
  onPhotoCapture,
  onClose,
  isOpen,
  maxFileSize = 5 * 1024 * 1024, // 5MB default
  preferredCamera = 'environment'
}: CameraCaptureProps) {
  const [state, setState] = useState<CameraCaptureState>({
    stream: null,
    isStreaming: false,
    error: null,
    availableCameras: [],
    selectedCameraId: null,
    isCapturing: false,
    isSwitchingCamera: false
  })

  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // Detect if mobile device
  const isMobileDevice = (): boolean => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    )
  }

  // Get camera constraints
  const getCameraConstraints = (deviceId?: string): MediaStreamConstraints => {
    const isMobile = isMobileDevice()
    
    const baseConstraints: MediaStreamConstraints = {
      audio: false,
      video: {
        width: { ideal: 1280, max: 1920 },
        height: { ideal: 720, max: 1080 }
      }
    }
    
    if (deviceId) {
      baseConstraints.video = {
        ...baseConstraints.video as MediaTrackConstraints,
        deviceId: { exact: deviceId }
      }
    } else if (isMobile) {
      // Prefer rear camera on mobile
      baseConstraints.video = {
        ...baseConstraints.video as MediaTrackConstraints,
        facingMode: preferredCamera
      }
    }
    
    return baseConstraints
  }

  // Handle camera errors
  const handleCameraError = (error: any): CameraError => {
    console.error('Camera error:', error)
    
    if (error.name === 'NotAllowedError') {
      return {
        type: CameraErrorType.PERMISSION_DENIED,
        message: error.message,
        userMessage: ERROR_MESSAGES.PERMISSION_DENIED,
        fallbackAvailable: true
      }
    }
    
    if (error.name === 'NotFoundError') {
      return {
        type: CameraErrorType.DEVICE_NOT_FOUND,
        message: error.message,
        userMessage: ERROR_MESSAGES.DEVICE_NOT_FOUND,
        fallbackAvailable: true
      }
    }
    
    if (error.name === 'NotSupportedError') {
      return {
        type: CameraErrorType.NOT_SUPPORTED,
        message: error.message,
        userMessage: ERROR_MESSAGES.NOT_SUPPORTED,
        fallbackAvailable: true
      }
    }
    
    return {
      type: CameraErrorType.STREAM_ERROR,
      message: error.message,
      userMessage: ERROR_MESSAGES.STREAM_ERROR,
      fallbackAvailable: true
    }
  }

  // Request camera access and initialize stream
  const requestCameraAccess = async (deviceId?: string) => {
    try {
      const constraints = getCameraConstraints(deviceId)
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      
      streamRef.current = stream
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      
      setState(prev => ({
        ...prev,
        stream,
        isStreaming: true,
        error: null,
        isSwitchingCamera: false
      }))
    } catch (error: any) {
      const cameraError = handleCameraError(error)
      setState(prev => ({
        ...prev,
        error: cameraError.userMessage,
        isStreaming: false,
        isSwitchingCamera: false
      }))
      
      // Close modal on error
      setTimeout(() => {
        onClose()
      }, 3000)
    }
  }

  // Get available cameras
  const getAvailableCameras = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      const cameras = devices.filter(device => device.kind === 'videoinput')
      setState(prev => ({ ...prev, availableCameras: cameras }))
    } catch (error) {
      console.error('Failed to enumerate devices:', error)
    }
  }

  // Cleanup function
  const cleanup = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    
    setState(prev => ({
      ...prev,
      stream: null,
      isStreaming: false,
      error: null
    }))
  }

  // Initialize camera when modal opens
  useEffect(() => {
    if (isOpen) {
      getAvailableCameras()
      requestCameraAccess()
    } else {
      cleanup()
    }
    
    return () => {
      cleanup()
    }
  }, [isOpen])

  // Cleanup on navigation
  useEffect(() => {
    const handleBeforeUnload = () => {
      cleanup()
    }
    
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [])

  // Generate filename for captured photo
  const generateCameraFilename = (): string => {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8)
    return `camera_capture_${timestamp}_${random}.jpg`
  }

  // Convert data URL to File object
  const dataURLtoFile = (dataURL: string, filename: string): File => {
    const arr = dataURL.split(',')
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg'
    const bstr = atob(arr[1])
    let n = bstr.length
    const u8arr = new Uint8Array(n)
    
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n)
    }
    
    return new File([u8arr], filename, { type: mime })
  }

  // Compress image if needed
  const compressImage = async (file: File): Promise<File> => {
    if (file.size <= maxFileSize) return file
    
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        
        // Calculate new dimensions maintaining aspect ratio
        const scale = Math.sqrt(maxFileSize / file.size)
        canvas.width = img.width * scale
        canvas.height = img.height * scale
        
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Failed to get canvas context'))
          return
        }
        
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(new File([blob], file.name, { type: 'image/jpeg' }))
          } else {
            reject(new Error('Failed to compress image'))
          }
        }, 'image/jpeg', 0.8)
      }
      
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = URL.createObjectURL(file)
    })
  }

  // Capture photo from video stream
  const capturePhoto = async () => {
    if (!videoRef.current || !state.isStreaming) return
    
    setState(prev => ({ ...prev, isCapturing: true }))
    
    try {
      const video = videoRef.current
      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        throw new Error('Failed to get canvas context')
      }
      
      ctx.drawImage(video, 0, 0)
      
      const dataURL = canvas.toDataURL('image/jpeg', 0.9)
      const filename = generateCameraFilename()
      let file = dataURLtoFile(dataURL, filename)
      
      // Compress if needed
      file = await compressImage(file)
      
      // Stop stream and cleanup
      cleanup()
      
      // Call callback with captured file
      onPhotoCapture(file)
      
      // Close modal
      onClose()
    } catch (error: any) {
      console.error('Capture error:', error)
      setState(prev => ({
        ...prev,
        error: ERROR_MESSAGES.CAPTURE_ERROR,
        isCapturing: false
      }))
    }
  }

  // Switch camera
  const switchCamera = async (deviceId: string) => {
    setState(prev => ({ ...prev, isSwitchingCamera: true }))
    cleanup()
    await requestCameraAccess(deviceId)
    setState(prev => ({ ...prev, selectedCameraId: deviceId }))
  }

  return (
    <CameraModal isOpen={isOpen} onClose={onClose} title="Ambil Foto">
      <div className="flex flex-col items-center justify-center bg-black min-h-[400px] md:min-h-[500px]">
        {/* Error Display */}
        {state.error && (
          <div className="absolute inset-0 flex items-center justify-center p-6 bg-black/90 z-10">
            <div className="text-center space-y-3 max-w-md">
              <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto">
                <X className="w-8 h-8 text-red-500" />
              </div>
              <p className="text-white text-sm">{state.error}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {!state.isStreaming && !state.error && (
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
            <p className="text-slate-400 text-sm">Memulai kamera...</p>
          </div>
        )}

        {/* Video Preview */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover ${state.isStreaming ? 'block' : 'hidden'}`}
        />

        {/* Camera Active Indicator */}
        {state.isStreaming && (
          <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-500 text-white px-3 py-1.5 rounded-full text-xs font-bold">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            Kamera Aktif
          </div>
        )}

        {/* Controls */}
        {state.isStreaming && (
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
            <div className="flex items-center justify-center gap-4">
              {/* Camera Switch Button */}
              {state.availableCameras.length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => {
                    const currentIndex = state.availableCameras.findIndex(
                      cam => cam.deviceId === state.selectedCameraId
                    )
                    const nextIndex = (currentIndex + 1) % state.availableCameras.length
                    switchCamera(state.availableCameras[nextIndex].deviceId)
                  }}
                  disabled={state.isSwitchingCamera}
                  className="rounded-full"
                >
                  <RefreshCw className={`w-5 h-5 ${state.isSwitchingCamera ? 'animate-spin' : ''}`} />
                </Button>
              )}

              {/* Capture Button */}
              <Button
                type="button"
                size="lg"
                onClick={capturePhoto}
                disabled={state.isCapturing}
                className="rounded-full bg-blue-500 hover:bg-blue-600 text-white px-8"
              >
                <Camera className="w-5 h-5 mr-2" />
                {state.isCapturing ? 'Mengambil...' : 'Ambil Foto'}
              </Button>

              {/* Cancel Button */}
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => {
                  cleanup()
                  onClose()
                }}
                className="rounded-full"
              >
                <X className="w-5 h-5 mr-2" />
                Batal
              </Button>
            </div>
          </div>
        )}
      </div>
    </CameraModal>
  )
}
