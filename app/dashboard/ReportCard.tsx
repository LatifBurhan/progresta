'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image'
import { 
  MapPin, 
  Clock, 
  AlertTriangle, 
  Edit, 
  Trash2,
  Timer,
  User,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

interface Report {
  id: string
  userId: string
  reportDate: string
  reportTime: string
  period: string
  location: string
  hasIssue: boolean
  issueDesc: string | null
  totalHours: number
  user: {
    email: string
    profile: {
      name: string | null
      fotoProfil: string | null
    } | null
    division: {
      name: string
      color: string
    } | null
  }
  reportDetails: Array<{
    id: string
    task: string
    progress: string
    evidence: string | null
    hoursSpent: number
    project: {
      name: string
    }
  }>
}

interface ReportCardProps {
  report: Report
  currentUserId: string
  onDelete: (reportId: string) => void
  formatDate: (date: string) => string
  formatTime: (time: string) => string
}

interface LightboxProps {
  images: string[]
  currentIndex: number
  onClose: () => void
  onNext: () => void
  onPrev: () => void
}

function Lightbox({ images, currentIndex, onClose, onNext, onPrev }: LightboxProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
      <div className="relative w-full h-full flex items-center justify-center p-4">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
        >
          <X className="w-8 h-8" />
        </button>

        {/* Navigation Buttons */}
        {images.length > 1 && (
          <>
            <button
              onClick={onPrev}
              className="absolute left-4 text-white hover:text-gray-300 z-10"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
            <button
              onClick={onNext}
              className="absolute right-4 text-white hover:text-gray-300 z-10"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          </>
        )}

        {/* Image */}
        <div className="relative max-w-4xl max-h-full">
          <Image
            src={images[currentIndex]}
            alt="Evidence"
            width={800}
            height={600}
            className="object-contain max-h-[90vh] w-auto"
            unoptimized
          />
        </div>

        {/* Image Counter */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white bg-black bg-opacity-50 px-3 py-1 rounded-full text-sm">
            {currentIndex + 1} / {images.length}
          </div>
        )}
      </div>
    </div>
  )
}

export default function ReportCard({ 
  report, 
  currentUserId, 
  onDelete, 
  formatDate, 
  formatTime 
}: ReportCardProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  
  const isOwner = report.userId === currentUserId
  const userName = report.user.profile?.name || report.user.email.split('@')[0]
  const userAvatar = report.user.profile?.fotoProfil

  // Get all evidence images
  const evidenceImages = report.reportDetails
    .map(detail => detail.evidence)
    .filter(evidence => evidence !== null) as string[]

  const openLightbox = (imageUrl: string) => {
    const index = evidenceImages.indexOf(imageUrl)
    setLightboxIndex(index >= 0 ? index : 0)
    setLightboxOpen(true)
  }

  const nextImage = () => {
    setLightboxIndex((prev) => (prev + 1) % evidenceImages.length)
  }

  const prevImage = () => {
    setLightboxIndex((prev) => (prev - 1 + evidenceImages.length) % evidenceImages.length)
  }

  const getLocationBadge = (location: string) => {
    const badges = {
      'Al-Wustho': { label: '🏢 WFO', color: 'bg-blue-100 text-blue-800' },
      'WFA': { label: '🏠 WFA', color: 'bg-green-100 text-green-800' },
      'Client Site': { label: '🏛️ Client', color: 'bg-purple-100 text-purple-800' }
    }
    return badges[location as keyof typeof badges] || { label: location, color: 'bg-gray-100 text-gray-800' }
  }

  const locationBadge = getLocationBadge(report.location)

  return (
    <>
      <Card className={`${report.hasIssue ? 'border-red-200 bg-red-50' : 'border-gray-200'} hover:shadow-lg transition-all duration-200`}>
        <CardContent className="p-0">
          {/* Header - Instagram Style */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              {/* User Avatar */}
              {userAvatar ? (
                <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-gray-200">
                  <Image
                    src={userAvatar}
                    alt={userName}
                    fill
                    className="object-cover"
                    sizes="48px"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center border-2 border-gray-200">
                  <span className="text-lg font-bold text-white">
                    {userName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}

              {/* User Info */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900">{userName}</h3>
                  {report.user.division && (
                    <Badge 
                      variant="outline" 
                      className="text-xs px-2 py-0.5"
                      style={{ 
                        borderColor: report.user.division.color,
                        color: report.user.division.color 
                      }}
                    >
                      {report.user.division.name}
                    </Badge>
                  )}
                  <Badge className={`text-xs px-2 py-0.5 ${locationBadge.color}`}>
                    {locationBadge.label}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span>{formatDate(report.reportDate)} • {formatTime(report.reportTime)}</span>
                  <span>📅 {report.period}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            {isOwner && (
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-2"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(report.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Issue Alert */}
          {report.hasIssue && (
            <div className="mx-4 mt-4 p-3 bg-red-100 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span className="font-medium text-red-800">⚠️ KENDALA</span>
              </div>
              <p className="text-sm text-red-700">{report.issueDesc}</p>
            </div>
          )}

          {/* Body - Project Details */}
          <div className="p-4 space-y-4">
            {report.reportDetails.map((detail, index) => (
              <div key={detail.id} className="border-l-4 border-blue-200 pl-4 pb-4 last:pb-0">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900 flex items-center gap-2">
                    <span className="text-blue-600">#{index + 1}</span>
                    {detail.project.name}
                  </h4>
                  <Badge variant="outline" className="text-xs">
                    {detail.hoursSpent}j
                  </Badge>
                </div>
                
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">📝 Task:</span>
                    <p className="text-gray-600 mt-1 leading-relaxed">{detail.task}</p>
                  </div>
                  
                  <div>
                    <span className="font-medium text-gray-700">✅ Progress:</span>
                    <p className="text-gray-600 mt-1 leading-relaxed">{detail.progress}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer - Evidence Images */}
          {evidenceImages.length > 0 && (
            <div className="border-t border-gray-100">
              <div className="p-4">
                <h5 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  📸 Bukti Kerja ({evidenceImages.length})
                </h5>
                <div className={`grid gap-2 ${
                  evidenceImages.length === 1 ? 'grid-cols-1' :
                  evidenceImages.length === 2 ? 'grid-cols-2' :
                  'grid-cols-3'
                }`}>
                  {evidenceImages.map((imageUrl, index) => (
                    <div 
                      key={index}
                      className="relative aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => openLightbox(imageUrl)}
                    >
                      <Image
                        src={imageUrl}
                        alt={`Evidence ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 33vw, 200px"
                        unoptimized
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Footer Stats */}
          <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between text-sm text-gray-500">
            <span>Total: {report.totalHours} jam</span>
            <span>
              {report.reportDetails.length} project{report.reportDetails.length > 1 ? 's' : ''}
              {evidenceImages.length > 0 && ` • ${evidenceImages.length} foto`}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Lightbox */}
      {lightboxOpen && evidenceImages.length > 0 && (
        <Lightbox
          images={evidenceImages}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
          onNext={nextImage}
          onPrev={prevImage}
        />
      )}
    </>
  )
}