import { useEffect, useRef } from 'react'
import L from 'leaflet'

export default function MapSelector({ onLocationSelect }) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markerRef = useRef(null)

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    const map = L.map(mapRef.current).setView([20.5937, 78.9629], 5)
    mapInstanceRef.current = map

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map)

    // Add click handler
    map.on('click', (e) => {
      const { lat, lng } = e.latlng
      
      // Remove existing marker
      if (markerRef.current) {
        map.removeLayer(markerRef.current)
      }

      // Add new marker
      markerRef.current = L.marker([lat, lng]).addTo(map)
      
      // Callback
      if (onLocationSelect) {
        onLocationSelect(lat, lng)
      }
    })

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [onLocationSelect])

  return <div ref={mapRef} className="w-full h-full rounded-lg" />
}
