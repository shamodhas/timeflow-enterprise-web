import { useEffect, useState, type KeyboardEvent } from "react"
import {
  CircleMarker,
  MapContainer,
  TileLayer,
  useMap,
  useMapEvents
} from "react-leaflet"
import "leaflet/dist/leaflet.css"

export interface MapCoordinates {
  latitude: number
  longitude: number
}

interface BranchMapPickerProps {
  value: MapCoordinates | null
  onChange: (coordinates: MapCoordinates) => void
}

interface SearchResult {
  lat: string
  lon: string
}

const DEFAULT_CENTER: [number, number] = [6.9016, 79.8607]

const MapClickPicker = ({
  onChange
}: Pick<BranchMapPickerProps, "onChange">) => {
  useMapEvents({
    click(event) {
      onChange({
        latitude: Number(event.latlng.lat.toFixed(6)),
        longitude: Number(event.latlng.lng.toFixed(6))
      })
    }
  })
  return null
}

const RecenterMap = ({ value }: Pick<BranchMapPickerProps, "value">) => {
  const map = useMap()
  const latitude = value?.latitude
  const longitude = value?.longitude

  useEffect(() => {
    if (latitude !== undefined && longitude !== undefined) {
      map.setView([latitude, longitude], Math.max(map.getZoom(), 15))
    }
  }, [map, latitude, longitude])

  return null
}

export const BranchMapPicker = ({
  value,
  onChange
}: BranchMapPickerProps) => {
  const [address, setAddress] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const searchAddress = async () => {
    const query = address.trim()
    if (!query) return

    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        q: query,
        format: "jsonv2",
        limit: "1"
      })
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?${params.toString()}`
      )
      if (!response.ok) {
        throw new Error(`Address search failed (${response.status}).`)
      }
      const results = (await response.json()) as SearchResult[]
      const result = results[0]
      if (!result) {
        setError("No matching place found. Try a more specific address.")
        return
      }
      onChange({
        latitude: Number(Number(result.lat).toFixed(6)),
        longitude: Number(Number(result.lon).toFixed(6))
      })
    } catch (searchError) {
      setError(
        searchError instanceof Error
          ? searchError.message
          : "Address search failed. Please try again."
      )
    } finally {
      setLoading(false)
    }
  }

  const center: [number, number] = value
    ? [value.latitude, value.longitude]
    : DEFAULT_CENTER

  return (
    <div className="sm:col-span-2">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-medium">Select branch location</p>
          <p className="text-xs text-slate-500">
            Search for an address or click the map to place the branch pin.
          </p>
        </div>
        {value && (
          <p className="font-mono text-xs text-slate-500">
            {value.latitude.toFixed(6)}, {value.longitude.toFixed(6)}
          </p>
        )}
      </div>
      <div className="mb-2 flex gap-2">
        <input
          aria-label="Search for a branch address"
          className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
          value={address}
          onChange={(event) => setAddress(event.target.value)}
          onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => {
            if (event.key === "Enter") {
              event.preventDefault()
              event.stopPropagation()
              void searchAddress()
            }
          }}
          placeholder="Search a place or address"
        />
        <button
          type="button"
          onClick={() => void searchAddress()}
          disabled={loading || !address.trim()}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {loading ? "Searching…" : "Search"}
        </button>
      </div>
      {error && <p className="mb-2 text-xs text-red-600">{error}</p>}
      <div className="h-[260px] overflow-hidden rounded-xl border sm:h-[340px] border-slate-300 dark:border-slate-700">
        <MapContainer
          center={center}
          zoom={13}
          scrollWheelZoom
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickPicker onChange={onChange} />
          <RecenterMap value={value} />
          {value && (
            <CircleMarker
              center={center}
              radius={9}
              pathOptions={{
                color: "#fff",
                weight: 3,
                fillColor: "#2563eb",
                fillOpacity: 1
              }}
            />
          )}
        </MapContainer>
      </div>
      <p className="mt-1 text-xs text-slate-500">
        Map data © OpenStreetMap contributors.
      </p>
    </div>
  )
}
