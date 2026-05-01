'use client'

import { useEffect, useState } from 'react'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'

interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  duration?: number
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    // Global function to show toast
    (window as any).showToast = (toast: Omit<Toast, 'id'>) => {
      const id = crypto.randomUUID()
      const newToast = { ...toast, id }
      
      setToasts(prev => [...prev, newToast])

      // Auto remove after duration
      const duration = toast.duration || 5000
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }

    // Function for notification toasts
    (window as any).showNotificationToast = (notification: any) => {
      let toastType: 'success' | 'error' | 'warning' | 'info' = 'info'
      
      if (notification.priority === 'urgent' || notification.priority === 'high') {
        toastType = 'warning'
      }
      
      (window as any).showToast({
        type: toastType,
        title: notification.title,
        message: notification.message,
        duration: 5000
      })
    }

    return () => {
      delete (window as any).showToast
      delete (window as any).showNotificationToast
    }
  }, [])

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 pointer-events-none">
      {toasts.map(toast => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  )
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const [isExiting, setIsExiting] = useState(false)

  const handleClose = () => {
    setIsExiting(true)
    setTimeout(onClose, 300)
  }

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-orange-600" />
      case 'info':
        return <Info className="w-5 h-5 text-blue-600" />
    }
  }

  const getStyles = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-green-50 border-green-200'
      case 'error':
        return 'bg-red-50 border-red-200'
      case 'warning':
        return 'bg-orange-50 border-orange-200'
      case 'info':
        return 'bg-blue-50 border-blue-200'
    }
  }

  return (
    <div
      className={`
        pointer-events-auto
        w-96 max-w-[calc(100vw-2rem)]
        border-2 rounded-xl shadow-lg
        p-4
        ${getStyles()}
        ${isExiting ? 'animate-slide-out-right' : 'animate-slide-in-right'}
      `}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="flex-shrink-0 mt-0.5">
          {getIcon()}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-sm text-slate-900 mb-1">
            {toast.title}
          </h4>
          <p className="text-sm text-slate-700 leading-relaxed">
            {toast.message}
          </p>
        </div>

        {/* Close button */}
        <button
          onClick={handleClose}
          className="flex-shrink-0 p-1 hover:bg-white/50 rounded-lg transition-colors"
        >
          <X className="w-4 h-4 text-slate-400" />
        </button>
      </div>
    </div>
  )
}

// Helper functions for easy toast usage
export const toast = {
  success: (title: string, message: string, duration?: number) => {
    if (typeof window !== 'undefined' && 'showToast' in window) {
      (window as any).showToast({ type: 'success', title, message, duration })
    }
  },
  error: (title: string, message: string, duration?: number) => {
    if (typeof window !== 'undefined' && 'showToast' in window) {
      (window as any).showToast({ type: 'error', title, message, duration })
    }
  },
  warning: (title: string, message: string, duration?: number) => {
    if (typeof window !== 'undefined' && 'showToast' in window) {
      (window as any).showToast({ type: 'warning', title, message, duration })
    }
  },
  info: (title: string, message: string, duration?: number) => {
    if (typeof window !== 'undefined' && 'showToast' in window) {
      (window as any).showToast({ type: 'info', title, message, duration })
    }
  },
}
