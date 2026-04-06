import { generateGoogleMapsUrl } from '@/lib/overtime/location'

interface LocationLinkProps {
  clockInLat: number | null
  clockInLng: number | null
  clockOutLat: number | null
  clockOutLng: number | null
  className?: string
}

export function LocationLink({
  clockInLat,
  clockInLng,
  clockOutLat,
  clockOutLng,
  className = ''
}: LocationLinkProps) {
  const clockInLocation = clockInLat && clockInLng 
    ? { latitude: clockInLat, longitude: clockInLng } 
    : null
  
  const clockOutLocation = clockOutLat && clockOutLng 
    ? { latitude: clockOutLat, longitude: clockOutLng } 
    : null

  const mapsUrl = generateGoogleMapsUrl(clockInLocation, clockOutLocation)

  if (!mapsUrl) {
    return null
  }

  return (
    <a
      href={mapsUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1 ${className}`}
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
      Lihat Lokasi
    </a>
  )
}
