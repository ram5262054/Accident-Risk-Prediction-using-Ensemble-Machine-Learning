import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

export default function AccidentHeatmap({ onLocationClick }) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const [loading, setLoading] = useState(true)
  const [hotspotCount, setHotspotCount] = useState(0)

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    // Initialize map centered on India
    const map = L.map(mapRef.current).setView([20.5937, 78.9629], 5)
    mapInstanceRef.current = map

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map)

    fetch('http://localhost:5000/api/hotspots')
      .then(res => res.json())
      .then(data => {
        if (data.hotspots) {
          setHotspotCount(data.hotspots.length)
          
          const topHotspots = data.hotspots.slice(0, 50)
          
          topHotspots.forEach(hotspot => {
            // Color based on severity
            const color = hotspot.severity === 'Fatal' ? '#ef4444' : 
                         hotspot.severity === 'Grievous' ? '#f59e0b' : '#22c55e'
            
            // Size based on accident count
            const radius = Math.min(8 + (hotspot.accidentCount / 10), 20)
            
            const marker = L.circleMarker([hotspot.latitude, hotspot.longitude], {
              radius: radius,
              fillColor: color,
              color: '#fff',
              weight: 2,
              opacity: 1,
              fillOpacity: 0.6
            }).addTo(map)
            
            // Add popup with risk info
            marker.bindPopup(`
              <div style="min-width: 200px;">
                <strong>${hotspot.city}, ${hotspot.state}</strong><br/>
                <span style="color: ${color}; font-weight: bold;">Risk Level: ${hotspot.riskScore}/100</span><br/>
                Severity: ${hotspot.severity}<br/>
                Accidents: ${hotspot.accidentCount}
              </div>
            `)
            
            // When marker is clicked, update dashboard risk
            marker.on('click', () => {
              if (onLocationClick) {
                onLocationClick({
                  city: hotspot.city,
                  state: hotspot.state,
                  riskScore: hotspot.riskScore,
                  latitude: hotspot.latitude,
                  longitude: hotspot.longitude
                })
              }
            })
          })
          setLoading(false)
        }
      })
      .catch(() => {
        setLoading(false)
      })

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [onLocationClick])

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full rounded-lg" />
      {loading && (
        <div className="absolute top-4 right-4 bg-white px-3 py-2 rounded-lg shadow-lg text-sm">
          Loading high-risk zones...
        </div>
      )}
      {!loading && hotspotCount > 0 && (
        <div className="absolute top-4 right-4 bg-blue-50 border border-blue-200 px-3 py-2 rounded-lg shadow-lg">
          <p className="text-xs font-medium text-blue-900">
            {Math.min(50, hotspotCount)} high-risk zones
          </p>
          <p className="text-xs text-blue-700">Click any location to see risk</p>
        </div>
      )}
    </div>
  )
}

