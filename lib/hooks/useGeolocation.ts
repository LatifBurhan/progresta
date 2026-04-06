interface GeolocationResult {
  latitude: number | null
  longitude: number | null
  error: GeolocationPositionError | null
}

export function useGeolocation() {
  const getCurrentPosition = async (): Promise<GeolocationResult> => {
    return new Promise((resolve) => {
      // Handle unsupported browsers
      if (!navigator.geolocation) {
        resolve({ latitude: null, longitude: null, error: null })
        return
      }

      // Set timeout to prevent indefinite waiting
      const timeoutId = setTimeout(() => {
        resolve({ latitude: null, longitude: null, error: null })
      }, 10000) // 10 second timeout

      navigator.geolocation.getCurrentPosition(
        (position) => {
          clearTimeout(timeoutId)
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            error: null
          })
        },
        (error) => {
          clearTimeout(timeoutId)
          // All errors result in null coordinates - silent failure
          resolve({ latitude: null, longitude: null, error })
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      )
    })
  }

  return { getCurrentPosition }
}
