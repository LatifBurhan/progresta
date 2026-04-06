/**
 * Location utilities for overtime location tracking
 * Generates Google Maps URLs for displaying clock in/out locations
 */

interface LocationCoordinates {
  latitude: number
  longitude: number
}

/**
 * Generates a Google Maps URL with markers for overtime locations
 * 
 * @param clockInLocation - Clock in coordinates (latitude, longitude)
 * @param clockOutLocation - Clock out coordinates (latitude, longitude)
 * @returns Google Maps URL with markers, or null if no locations provided
 * 
 * @example
 * // Single location (clock in only)
 * generateGoogleMapsUrl({ latitude: -6.2088, longitude: 106.8456 }, null)
 * // Returns: "https://www.google.com/maps/search/?api=1&query=-6.2088,106.8456"
 * 
 * @example
 * // Two locations (clock in and clock out)
 * generateGoogleMapsUrl(
 *   { latitude: -6.2088, longitude: 106.8456 },
 *   { latitude: -6.2146, longitude: 106.8451 }
 * )
 * // Returns: "https://www.google.com/maps/search/?api=1&markers=-6.2088,106.8456&markers=-6.2146,106.8451"
 */
export function generateGoogleMapsUrl(
  clockInLocation: LocationCoordinates | null,
  clockOutLocation: LocationCoordinates | null
): string | null {
  // Return null if no locations provided
  if (!clockInLocation && !clockOutLocation) {
    return null
  }

  const baseUrl = 'https://www.google.com/maps/search/?api=1'
  
  // Handle two locations - use markers parameter
  if (clockInLocation && clockOutLocation) {
    const markers = [
      `markers=${clockInLocation.latitude},${clockInLocation.longitude}`,
      `markers=${clockOutLocation.latitude},${clockOutLocation.longitude}`
    ]
    return `${baseUrl}&${markers.join('&')}`
  }
  
  // Handle single location - use query parameter
  const location = clockInLocation || clockOutLocation!
  return `${baseUrl}&query=${location.latitude},${location.longitude}`
}
