/**
 * Calculate duration between two dates and return a human-readable string.
 * Example: "2 jam 30 menit"
 */
export function calculateDuration(startTime: Date, endTime: Date): string {
  const diffMs = endTime.getTime() - startTime.getTime()
  const totalMinutes = Math.floor(diffMs / (1000 * 60))
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  if (hours > 0 && minutes > 0) {
    return `${hours} jam ${minutes} menit`
  } else if (hours > 0) {
    return `${hours} jam`
  } else {
    return `${minutes} menit`
  }
}

/**
 * Format a PostgreSQL interval string to a human-readable string.
 * Handles formats like "02:30:00", "2 hours 30 minutes", "1 hour", etc.
 */
export function formatDurationFromInterval(interval: string): string {
  // Try HH:MM:SS format first (e.g. "02:30:00")
  const hhmmss = interval.match(/^(\d+):(\d{2}):(\d{2})$/)
  if (hhmmss) {
    const hours = parseInt(hhmmss[1], 10)
    const minutes = parseInt(hhmmss[2], 10)
    if (hours > 0 && minutes > 0) return `${hours} jam ${minutes} menit`
    if (hours > 0) return `${hours} jam`
    return `${minutes} menit`
  }

  // Try PostgreSQL verbose format (e.g. "2 hours 30 mins", "1 hour", "45 minutes")
  let hours = 0
  let minutes = 0

  const hoursMatch = interval.match(/(\d+)\s+hours?/)
  const minsMatch = interval.match(/(\d+)\s+mins?(?:utes?)?/)

  if (hoursMatch) hours = parseInt(hoursMatch[1], 10)
  if (minsMatch) minutes = parseInt(minsMatch[1], 10)

  if (hours > 0 && minutes > 0) return `${hours} jam ${minutes} menit`
  if (hours > 0) return `${hours} jam`
  if (minutes > 0) return `${minutes} menit`

  return interval
}
