'use client'

import { useEffect, useState } from 'react'
import { Bell, X, Check, AlertCircle, Info, CheckCircle } from 'lucide-react'
import { getSupabaseBrowserClient } from '@/lib/supabase-client'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  timestamp: string
  actionUrl?: string
  data?: any
  read?: boolean
}

interface NotificationBellProps {
  userId: string
}

export function NotificationBell({ userId }: NotificationBellProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [isRealtimeEnabled, setIsRealtimeEnabled] = useState(false)
  const [isDevelopment, setIsDevelopment] = useState(false)

  // Check if we're in development mode (client-side only to avoid hydration mismatch)
  useEffect(() => {
    setIsDevelopment(window.location.hostname === 'localhost')
  }, [])

  useEffect(() => {
    if (!userId) return

    // Load existing notifications from database
    const loadNotifications = async () => {
      try {
        const supabase = getSupabaseBrowserClient()
        
        // Check if supabase client is available
        if (!supabase) {
          console.warn('Supabase client not available')
          return
        }
        
        // Note: This app uses custom JWT auth, not Supabase Auth
        // So we skip the Supabase session check and rely on userId prop
        if (!userId) {
          console.warn('No userId provided, skipping notification load')
          return
        }
        
        console.log('Loading notifications for user:', userId)
        
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(50)

        if (error) {
          console.error('Failed to load notifications:', error)
          console.error('Error details:', JSON.stringify(error, null, 2))
          return
        }

        console.log('Loaded notifications:', data?.length || 0)

        if (data && data.length > 0) {
          const formattedNotifications = data.map(n => ({
            id: n.id,
            type: n.type,
            title: n.title,
            message: n.message,
            priority: n.priority as 'low' | 'medium' | 'high' | 'urgent',
            timestamp: n.created_at,
            actionUrl: n.action_url,
            data: n.data,
            read: n.read,
          }))
          
          setNotifications(formattedNotifications)
          setUnreadCount(formattedNotifications.filter(n => !n.read).length)
        }
      } catch (error) {
        console.error('Error loading notifications:', error)
      }
    }

    loadNotifications()

    // Disable realtime in development to avoid transformAlgorithm error
    // This error occurs due to Next.js hot reloading interfering with Supabase Realtime streams
    if (isDevelopment) {
      console.log('Realtime notifications disabled in development mode')
      setIsRealtimeEnabled(false)
      return
    }

    let channel: any = null
    let isSubscribed = false

    const setupChannel = async () => {
      try {
        // Initialize Supabase client for realtime
        const supabase = getSupabaseBrowserClient()
        
        if (!supabase) {
          console.warn('Supabase client not available for realtime')
          setIsRealtimeEnabled(false)
          return
        }

        // Subscribe to realtime notifications
        channel = supabase
          .channel(`notifications:${userId}`, {
            config: {
              broadcast: { self: true }
            }
          })
          .on('broadcast', { event: 'notification' }, (payload) => {
            if (!isSubscribed) return
            
            try {
              const notification = payload.payload as Notification
              
              // Add to notifications list
              setNotifications(prev => [notification, ...prev].slice(0, 50))
              setUnreadCount(prev => prev + 1)

              // Show toast notification
              showToast(notification)
            } catch (error) {
              console.error('Error handling notification:', error)
            }
          })
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              isSubscribed = true
              setIsRealtimeEnabled(true)
              console.log('Notification channel subscribed')
            } else if (status === 'CHANNEL_ERROR') {
              isSubscribed = false
              setIsRealtimeEnabled(false)
              console.error('Notification channel error')
            } else if (status === 'CLOSED') {
              isSubscribed = false
              setIsRealtimeEnabled(false)
            }
          })
      } catch (error) {
        console.error('Failed to setup notification channel:', error)
        setIsRealtimeEnabled(false)
      }
    }

    setupChannel()

    return () => {
      isSubscribed = false
      if (channel) {
        try {
          channel.unsubscribe()
        } catch (error) {
          // Silently fail - channel might already be closed
        }
      }
    }
  }, [userId, isDevelopment])

  const showToast = (notification: Notification) => {
    // Trigger toast notification
    if (typeof window !== 'undefined' && 'showNotificationToast' in window) {
      try {
        (window as any).showNotificationToast(notification)
      } catch (error) {
        console.error('Error showing toast:', error)
      }
    }
  }

  const markAsRead = async (id: string) => {
    // Update UI immediately
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
    setUnreadCount(prev => Math.max(0, prev - 1))

    // Update database
    try {
      const supabase = getSupabaseBrowserClient()
      
      if (!supabase) {
        console.warn('Supabase client not available')
        return
      }
      
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id)
        .eq('user_id', userId)

      if (error) {
        console.error('Failed to mark notification as read:', error)
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    // Update UI immediately
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setUnreadCount(0)

    // Update database
    try {
      const supabase = getSupabaseBrowserClient()
      
      if (!supabase) {
        console.warn('Supabase client not available')
        return
      }
      
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', userId)
        .eq('read', false)

      if (error) {
        console.error('Failed to mark all notifications as read:', error)
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  const clearAll = async () => {
    // Update UI immediately
    setNotifications([])
    setUnreadCount(0)

    // Delete from database
    try {
      const supabase = getSupabaseBrowserClient()
      
      if (!supabase) {
        console.warn('Supabase client not available')
        return
      }
      
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', userId)

      if (error) {
        console.error('Failed to clear notifications:', error)
      }
    } catch (error) {
      console.error('Error clearing notifications:', error)
    }
  }

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id)
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl
    }
    setIsOpen(false)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-50'
      case 'high': return 'text-orange-600 bg-orange-50'
      case 'medium': return 'text-blue-600 bg-blue-50'
      default: return 'text-slate-600 bg-slate-50'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return <AlertCircle className="w-4 h-4" />
      case 'high': return <AlertCircle className="w-4 h-4" />
      case 'medium': return <Info className="w-4 h-4" />
      default: return <CheckCircle className="w-4 h-4" />
    }
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button 
          className="relative p-2 hover:bg-slate-100 rounded-lg transition-colors"
          title={isRealtimeEnabled ? 'Notifikasi (Realtime Aktif)' : 'Notifikasi (Development Mode)'}
        >
          <Bell className="w-5 h-5 text-slate-600" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
          {/* Development mode indicator */}
          {!isRealtimeEnabled && isDevelopment && (
            <span className="absolute -bottom-1 -right-1 w-2 h-2 bg-orange-400 rounded-full" title="Realtime disabled in dev mode" />
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-96 max-h-[600px] overflow-hidden p-0">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900">Notifikasi</h3>
            {unreadCount > 0 && (
              <p className="text-xs text-slate-500">{unreadCount} belum dibaca</p>
            )}
            {!isRealtimeEnabled && isDevelopment && (
              <p className="text-xs text-orange-600 mt-1">⚠️ Dev mode: Realtime disabled</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                Tandai semua
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={clearAll}
                className="p-1 hover:bg-slate-100 rounded"
                title="Hapus semua"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="overflow-y-auto max-h-[500px]">
          {notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-500">Tidak ada notifikasi</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-4 hover:bg-slate-50 cursor-pointer transition-colors ${
                    !notification.read ? 'bg-blue-50/30' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Priority Icon */}
                    <div className={`p-2 rounded-lg ${getPriorityColor(notification.priority)}`}>
                      {getPriorityIcon(notification.priority)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="font-semibold text-sm text-slate-900 line-clamp-1">
                          {notification.title}
                        </h4>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-sm text-slate-600 line-clamp-2 mb-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-slate-400">
                        {formatTimestamp(notification.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 p-3 text-center">
            <button
              onClick={() => {
                setIsOpen(false)
                window.location.href = '/dashboard/notifications'
              }}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Lihat semua notifikasi
            </button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Baru saja'
  if (diffMins < 60) return `${diffMins} menit yang lalu`
  if (diffHours < 24) return `${diffHours} jam yang lalu`
  if (diffDays < 7) return `${diffDays} hari yang lalu`
  
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  })
}
