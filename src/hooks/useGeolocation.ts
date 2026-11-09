import { useState } from "react"

export interface GeolocationCoordinates {
  latitude: number
  longitude: number
}

export const useGeolocation = () => {
  const [coords, setCoords] = useState<GeolocationCoordinates | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const request = (): Promise<GeolocationCoordinates | null> => {
    setLoading(true)

    if (typeof navigator === "undefined" || !navigator.geolocation) {
      const message = "Geolocation is not supported by this browser."
      setError(message)
      setCoords(null)
      setLoading(false)
      return Promise.resolve(null)
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const result = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }
          setCoords(result)
          setError(null)
          setLoading(false)
          resolve(result)
        },
        (positionError) => {
          setError(positionError.message)
          setCoords(null)
          setLoading(false)
          resolve(null)
        },
        { enableHighAccuracy: true, timeout: 10000 }
      )
    })
  }

  return { coords, error, loading, request }
}
