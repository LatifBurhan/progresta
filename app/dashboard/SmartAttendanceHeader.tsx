'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Clock, Calendar, Timer, AlertCircle } from 'lucide-react'

interface AttendanceData {
  clockIn: string | null
  clockOut: string | null
  workDuration: number
  totalHours: number
  isOvertime: boolean
  reportCount: number
  lastUpdated: string
}

interface SmartAttendanceHeaderProps {
  userId: string
}

export default function SmartAttendanceHeader({ userId }: SmartAttendanceHeaderProps) {
  const [attendance, setAttendance] = useState<AttendanceData>({
    clockIn: null,
    clockOut: null,
    workDuration: 0,
    totalHours: 0,
    isOvertime: false,
    reportCount: 0,
    lastUpdated: ''
  })
  const [loading, setLoading] = useState(true)

  const fetchAttendance = async () => {
    try {
      const response = await fetch(`/api/attendance/today?userId=${userId}`)
      const data = await response.json()
      
      if (data.success) {
        setAttendance(data.attendance)
      }
    } catch (error) {
      console.error('Failed to fetch attendance:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAttendance()
    
    // Refresh every 5 minutes
    const interval = setInterval(fetchAttendance, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [userId])

  const formatTime = (timeString: string | null) => {
    if (!timeString) return '--:--'
    
    return new Intl.DateTimeFormat('id-ID', {
      timeZone: 'Asia/Jakarta',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(timeString))
  }

  const formatDuration = (clockIn: string | null, clockOut: string | null) => {
    if (!clockIn || !clockOut) return '--:--'
    
    const start = new Date(clockIn)
    const end = new Date(clockOut)
    const diffMs = end.getTime() - start.getTime()
    const diffHours = diffMs / (1000 * 60 * 60)
    
    const h = Math.floor(diffHours)
    const m = Math.round((diffHours - h) * 60)
    return `${h}j ${m}m`
  }

  const getCurrentDate = () => {
    return new Intl.DateTimeFormat('id-ID', {
      timeZone: 'Asia/Jakarta',
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date())
  }

  if (loading) {
    return (
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-4xl mx-auto p-4">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border-b shadow-sm sticky top-16 z-20">
      <div className="max-w-4xl mx-auto p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              Absensi Hari Ini
            </h2>
            <p className="text-sm text-gray-600">{getCurrentDate()}</p>
          </div>
          
          {attendance.reportCount > 0 && (
            <div className="text-right">
              <p className="text-sm text-gray-600">Laporan Hari Ini</p>
              <p className="text-lg font-semibold text-blue-600">
                {attendance.reportCount} laporan
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Clock In */}
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4 text-center">
              <Clock className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <p className="text-xs text-green-700 font-medium mb-1">MASUK</p>
              <p className="text-lg font-bold text-green-800">
                {formatTime(attendance.clockIn)}
              </p>
            </CardContent>
          </Card>

          {/* Clock Out */}
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4 text-center">
              <Clock className="w-6 h-6 text-red-600 mx-auto mb-2" />
              <p className="text-xs text-red-700 font-medium mb-1">PULANG</p>
              <p className="text-lg font-bold text-red-800">
                {formatTime(attendance.clockOut)}
              </p>
            </CardContent>
          </Card>

          {/* Work Duration */}
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4 text-center">
              <Timer className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <p className="text-xs text-blue-700 font-medium mb-1">DURASI KERJA</p>
              <p className="text-lg font-bold text-blue-800">
                {formatDuration(attendance.clockIn, attendance.clockOut)}
              </p>
            </CardContent>
          </Card>

          {/* Overtime Status */}
          <Card className={`${
            attendance.isOvertime 
              ? 'border-orange-200 bg-orange-50' 
              : 'border-gray-200 bg-gray-50'
          }`}>
            <CardContent className="p-4 text-center">
              <AlertCircle className={`w-6 h-6 mx-auto mb-2 ${
                attendance.isOvertime ? 'text-orange-600' : 'text-gray-400'
              }`} />
              <p className={`text-xs font-medium mb-1 ${
                attendance.isOvertime ? 'text-orange-700' : 'text-gray-600'
              }`}>
                LEMBUR
              </p>
              <p className={`text-lg font-bold ${
                attendance.isOvertime ? 'text-orange-800' : 'text-gray-500'
              }`}>
                {attendance.isOvertime ? 'YA' : 'TIDAK'}
              </p>
            </CardContent>
          </Card>
        </div>

        {attendance.reportCount === 0 && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800 text-center">
              📝 Belum ada laporan hari ini. Mulai dengan membuat laporan pertama!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}