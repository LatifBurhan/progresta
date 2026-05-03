'use client'

import { useEffect, useState } from 'react'
import { Bell, Check, CheckCircle, AlertCircle, Info, Trash2, Filter, X } from 'lucide-react'
import { getSupabaseBrowserClient } from '@/lib/supabase-client'

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

interface NotificationsClientProps {
  userId: string
}

export function NotificationsClient({ userId }: NotificationsClientProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')

  useEffect(() => {
    loadNotifications()
  }, [userId])

  const loadNotifications = async () => {
    try {
      setLoading(true)
      const supabase = getSupabaseBrowserClient()
      
      if (!supabase) {
        console.warn('Supabase client not available')
        return
      }
      
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Failed to load notifications:', error)
        return
      }

      if (data) {
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
      }
    } catch (error) {
      console.error('Error loading notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (id: string) => {
    // Update UI immediately
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )

    // Update database
    try {
      const supabase = getSupabaseBrowserClient()
      
      if (!supabase) return
      
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

    // Update database
    try {
      const supabase = getSupabaseBrowserClient()
      
      if (!supabase) return
      
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

  const deleteNotification = async (id: string) => {
    // Update UI immediately
    setNotifications(prev => prev.filter(n => n.id !== id))

    // Delete from database
    try {
      const supabase = getSupabaseBrowserClient()
      
      if (!supabase) return
      
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id)
        .eq('user_id', userId)

      if (error) {
        console.error('Failed to delete notification:', error)
      }
    } catch (error) {
      console.error('Error deleting notification:', error)
    }
  }

  const clearAll = async () => {
    if (!confirm('Hapus semua notifikasi?')) return

    // Update UI immediately
    setNotifications([])

    // Delete from database
    try {
      const supabase = getSupabaseBrowserClient()
      
      if (!supabase) return
      
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
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'border-red-500 bg-red-50'
      case 'high': return 'border-orange-500 bg-orange-50'
      case 'medium': return 'border-blue-500 bg-blue-50'
      default: return 'border-slate-300 bg-slate-50'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return <AlertCircle className="w-5 h-5 text-red-600" />
      case 'high': return <AlertCircle className="w-5 h-5 text-orange-600" />
      case 'medium': return <Info className="w-5 h-5 text-blue-600" />
      default: return <CheckCircle className="w-5 h-5 text-slate-600" />
    }
  }

  const getPriorityBadge = (priority: string) => {
    const colors = {
      urgent: 'bg-red-100 text-red-700',
      high: 'bg-orange-100 text-orange-700',
      medium: 'bg-blue-100 text-blue-700',
      low: 'bg-slate-100 text-slate-700',
    }
    return colors[priority as keyof typeof colors] || colors.low
  }

  const formatTimestamp = (timestamp: string): string => {
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

  // Filter notifications
  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread' && n.read) return false
    if (filter === 'read' && !n.read) return false
    if (priorityFilter !== 'all' && n.priority !== priorityFilter) return false
    return true
  })

  const unreadCount = notifications.filter(n => !n.read).length

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Memuat notifikasi...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Bell className="w-7 h-7" />
              Notifikasi
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              {unreadCount > 0 ? `${unreadCount} notifikasi belum dibaca` : 'Semua notifikasi sudah dibaca'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Tandai Semua Dibaca
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={clearAll}
                className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Hapus Semua
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 bg-white p-4 rounded-lg border border-slate-200">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-600" />
            <span className="text-sm font-medium text-slate-700">Filter:</span>
          </div>
          
          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Semua ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                filter === 'unread'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Belum Dibaca ({unreadCount})
            </button>
            <button
              onClick={() => setFilter('read')}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                filter === 'read'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Sudah Dibaca ({notifications.length - unreadCount})
            </button>
          </div>

          <div className="h-6 w-px bg-slate-300"></div>

          {/* Priority Filter */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPriorityFilter('all')}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                priorityFilter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Semua Prioritas
            </button>
            <button
              onClick={() => setPriorityFilter('urgent')}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                priorityFilter === 'urgent'
                  ? 'bg-red-600 text-white'
                  : 'bg-red-100 text-red-700 hover:bg-red-200'
              }`}
            >
              Urgent
            </button>
            <button
              onClick={() => setPriorityFilter('high')}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                priorityFilter === 'high'
                  ? 'bg-orange-600 text-white'
                  : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
              }`}
            >
              High
            </button>
          </div>

          {(filter !== 'all' || priorityFilter !== 'all') && (
            <button
              onClick={() => {
                setFilter('all')
                setPriorityFilter('all')
              }}
              className="ml-auto px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1"
            >
              <X className="w-4 h-4" />
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
          <Bell className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            {filter === 'unread' ? 'Tidak ada notifikasi belum dibaca' : 
             filter === 'read' ? 'Tidak ada notifikasi yang sudah dibaca' :
             'Tidak ada notifikasi'}
          </h3>
          <p className="text-sm text-slate-600">
            {notifications.length === 0 
              ? 'Notifikasi akan muncul di sini ketika ada update'
              : 'Coba ubah filter untuk melihat notifikasi lainnya'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`bg-white rounded-lg border-l-4 ${getPriorityColor(notification.priority)} p-5 hover:shadow-md transition-all ${
                !notification.read ? 'shadow-sm' : ''
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Priority Icon */}
                <div className="flex-shrink-0 mt-1">
                  {getPriorityIcon(notification.priority)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-slate-900">
                          {notification.title}
                        </h3>
                        {!notification.read && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 mb-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span>{formatTimestamp(notification.timestamp)}</span>
                        <span className={`px-2 py-0.5 rounded-full font-medium ${getPriorityBadge(notification.priority)}`}>
                          {notification.priority.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-3">
                    {notification.actionUrl && (
                      <button
                        onClick={() => handleNotificationClick(notification)}
                        className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        Lihat Detail
                      </button>
                    )}
                    {!notification.read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1"
                      >
                        <Check className="w-4 h-4" />
                        Tandai Dibaca
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className="ml-auto px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1"
                    >
                      <Trash2 className="w-4 h-4" />
                      Hapus
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
