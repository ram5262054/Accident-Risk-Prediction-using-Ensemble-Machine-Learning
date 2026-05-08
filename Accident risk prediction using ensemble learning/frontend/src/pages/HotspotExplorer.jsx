import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Filter, TrendingUp, AlertCircle, Calendar, Activity } from 'lucide-react'
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

export default function HotspotExplorer() {
  const [hotspots, setHotspots] = useState([])
  const [selectedHotspot, setSelectedHotspot] = useState(null)
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ total: 0, severe: 0, moderate: 0, minor: 0 })

  useEffect(() => {
    fetchHotspots()
  }, [])

  const fetchHotspots = async () => {
    setLoading(true)
    try {
      const response = await fetch('http://localhost:5000/api/hotspots')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      const hotspotsData = data.hotspots || []
      setHotspots(hotspotsData)
      
      // Calculate stats
      const severe = hotspotsData.filter(h => h.severity === 'Fatal').length
      const moderate = hotspotsData.filter(h => h.severity === 'Grievous').length
      const minor = hotspotsData.filter(h => h.severity === 'Minor').length
      setStats({ total: hotspotsData.length, severe, moderate, minor })
      
      setLoading(false)
    } catch (error) {
      console.error('Error fetching hotspots:', error)
      alert('Failed to load hotspots. Please ensure the backend is running.')
      setLoading(false)
    }
  }

  const filteredHotspots = hotspots.filter(h => {
    if (filter === 'all') return true
    if (filter === 'severe') return h.severity === 'Fatal'
    if (filter === 'moderate') return h.severity === 'Grievous'
    if (filter === 'minor') return h.severity === 'Minor'
    return true
  })

  // Calculate bubble radius based on accident count
  const getBubbleRadius = (count) => {
    const minRadius = 8
    const maxRadius = 30
    const minCount = Math.min(...hotspots.map(h => h.accidentCount || 1))
    const maxCount = Math.max(...hotspots.map(h => h.accidentCount || 1))
    
    if (maxCount === minCount) return minRadius
    
    const normalized = (count - minCount) / (maxCount - minCount)
    return minRadius + (normalized * (maxRadius - minRadius))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Hotspot Explorer</h2>
          <p className="text-gray-600 mt-1">Explore and analyze accident hotspots across Indian cities</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="input-field"
          >
            <option value="all">All Severities ({stats.total})</option>
            <option value="severe">Fatal ({stats.severe})</option>
            <option value="moderate">Grievous ({stats.moderate})</option>
            <option value="minor">Minor ({stats.minor})</option>
          </select>
        </div>
      </div>

      {/* Quick Guide */}
      {!loading && filteredHotspots.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="card bg-blue-50 border-blue-200"
        >
          <div className="flex items-start justify-between">
            <p className="text-sm text-blue-800">
              <strong>Tip:</strong> Click on any bubble to see detailed information. Larger bubbles = more accidents in that area. Hover over bubbles for quick info.
            </p>
            <div className="flex items-center gap-4 ml-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-danger-500"></div>
                <span className="text-xs text-blue-800">Fatal</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-warning-500"></div>
                <span className="text-xs text-blue-800">Grievous</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-success-500"></div>
                <span className="text-xs text-blue-800">Minor</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2"
        >
          <div className="card h-[600px]">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Hotspot Map</h3>
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              </div>
            ) : (
              <MapContainer
                center={[20.5937, 78.9629]}
                zoom={5}
                style={{ height: '100%', width: '100%' }}
                className="rounded-lg"
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; OpenStreetMap contributors'
                />
                {filteredHotspots.map((hotspot, idx) => {
                  const radius = getBubbleRadius(hotspot.accidentCount || 1)
                  return (
                    <CircleMarker
                      key={idx}
                      center={[hotspot.latitude, hotspot.longitude]}
                      radius={radius}
                      fillColor={
                        hotspot.severity === 'Fatal' ? '#ef4444' :
                        hotspot.severity === 'Grievous' ? '#f59e0b' : '#22c55e'
                      }
                      color="#fff"
                      weight={2}
                      opacity={1}
                      fillOpacity={0.6}
                      eventHandlers={{
                        click: () => setSelectedHotspot(hotspot),
                        mouseover: (e) => {
                          e.target.setStyle({ fillOpacity: 0.9 })
                        },
                        mouseout: (e) => {
                          e.target.setStyle({ fillOpacity: 0.6 })
                        }
                      }}
                    >
                      <Popup>
                        <div className="p-2 min-w-[220px]">
                          <p className="font-semibold text-lg mb-2">{hotspot.city}, {hotspot.state}</p>
                          <div className="space-y-1">
                            <p className="text-sm">
                              <span className="font-medium">Risk Category:</span>{' '}
                              <span className={`font-bold ${
                                hotspot.severity === 'Fatal' ? 'text-danger-600' :
                                hotspot.severity === 'Grievous' ? 'text-warning-600' :
                                'text-success-600'
                              }`}>
                                {hotspot.severity}
                              </span>
                              {hotspot.riskScore && (
                                <span className="ml-2 text-xs text-gray-600">
                                  ({hotspot.riskScore}/100)
                                </span>
                              )}
                            </p>
                            <p className="text-sm">
                              <span className="font-medium">Total Accidents:</span> {hotspot.accidentCount}
                            </p>
                            {hotspot.dominantSeverity && (
                              <p className="text-xs text-gray-600">
                                Most common: {hotspot.dominantSeverity}
                              </p>
                            )}
                            <p className="text-sm text-gray-600">
                              {hotspot.latitude.toFixed(4)}, {hotspot.longitude.toFixed(4)}
                            </p>
                            {hotspot.severityBreakdown && (
                              <div className="mt-2 pt-2 border-t">
                                <p className="text-xs font-medium mb-1">Severity Breakdown:</p>
                                {Object.entries(hotspot.severityBreakdown).map(([sev, count]) => {
                                  const percentage = ((count / hotspot.accidentCount) * 100).toFixed(0)
                                  return (
                                    <div key={sev} className="flex justify-between items-center text-xs">
                                      <span className={
                                        sev === 'Fatal' ? 'text-danger-600 font-medium' :
                                        sev === 'Grievous' ? 'text-warning-600 font-medium' :
                                        'text-success-600'
                                      }>
                                        {sev}:
                                      </span>
                                      <span className="text-gray-700">
                                        {count} ({percentage}%)
                                      </span>
                                    </div>
                                  )
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      </Popup>
                    </CircleMarker>
                  )
                })}
              </MapContainer>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-danger-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-danger-600" />
                  <span className="text-sm font-medium text-danger-900">Total Hotspots</span>
                </div>
                <span className="text-2xl font-bold text-danger-600">{filteredHotspots.length}</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Fatal</span>
                  <span className="font-semibold text-danger-600">
                    {filteredHotspots.filter(h => h.severity === 'Fatal').length}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Grievous</span>
                  <span className="font-semibold text-warning-600">
                    {filteredHotspots.filter(h => h.severity === 'Grievous').length}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Minor</span>
                  <span className="font-semibold text-success-600">
                    {filteredHotspots.filter(h => h.severity === 'Minor').length}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {selectedHotspot && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="card bg-primary-50 border-primary-200"
            >
              <h3 className="text-lg font-semibold text-primary-900 mb-3">Selected Hotspot</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary-600" />
                  <span className="text-sm text-primary-800 font-medium">
                    {selectedHotspot.city}, {selectedHotspot.state}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary-600" />
                  <span className="text-sm text-primary-800">
                    Risk Level: <span className={`font-semibold ${
                      selectedHotspot.severity === 'Fatal' ? 'text-danger-600' :
                      selectedHotspot.severity === 'Grievous' ? 'text-warning-600' :
                      'text-success-600'
                    }`}>{selectedHotspot.severity}</span>
                    {selectedHotspot.riskScore && (
                      <span className="ml-1 text-xs">({selectedHotspot.riskScore}/100)</span>
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-primary-600" />
                  <span className="text-sm text-primary-800">
                    Total Accidents: <span className="font-semibold">{selectedHotspot.accidentCount}</span>
                  </span>
                </div>
                <div className="text-xs text-primary-700">
                  {selectedHotspot.latitude.toFixed(4)}, {selectedHotspot.longitude.toFixed(4)}
                </div>
                {selectedHotspot.severityBreakdown && (
                  <div className="pt-2 border-t border-primary-200">
                    <p className="text-xs font-medium text-primary-900 mb-2">Severity Breakdown:</p>
                    <div className="space-y-1">
                      {Object.entries(selectedHotspot.severityBreakdown).map(([sev, count]) => {
                        const percentage = ((count / selectedHotspot.accidentCount) * 100).toFixed(0)
                        return (
                          <div key={sev} className="flex justify-between text-xs">
                            <span className={
                              sev === 'Fatal' ? 'text-danger-600 font-semibold' :
                              sev === 'Grievous' ? 'text-warning-600 font-semibold' :
                              'text-success-600'
                            }>{sev}:</span>
                            <span className="text-primary-800 font-medium">
                              {count} ({percentage}%)
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Recommendations</h3>
            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-primary-600 mt-0.5">•</span>
                Increase patrol in high-severity zones
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-primary-600 mt-0.5">•</span>
                Install speed cameras at hotspots
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-primary-600 mt-0.5">•</span>
                Improve street lighting
              </li>
            </ul>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Top 5 Dangerous Hotspots</h3>
            <div className="space-y-2">
              {filteredHotspots.slice(0, 5).map((hotspot, idx) => (
                <div 
                  key={idx}
                  onClick={() => setSelectedHotspot(hotspot)}
                  className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900">{hotspot.city}</span>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                      hotspot.severity === 'Fatal' ? 'bg-danger-100 text-danger-700' :
                      hotspot.severity === 'Grievous' ? 'bg-warning-100 text-warning-700' :
                      'bg-success-100 text-success-700'
                    }`}>
                      {hotspot.severity}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                    <span>{hotspot.accidentCount} accidents</span>
                    {hotspot.riskScore && (
                      <span className="font-medium">Risk: {hotspot.riskScore}/100</span>
                    )}
                  </div>
                  {hotspot.severityBreakdown && (
                    <div className="flex gap-2 text-xs mt-2">
                      {hotspot.severityBreakdown.Fatal > 0 && (
                        <span className="text-danger-600">F:{hotspot.severityBreakdown.Fatal}</span>
                      )}
                      {hotspot.severityBreakdown.Grievous > 0 && (
                        <span className="text-warning-600">G:{hotspot.severityBreakdown.Grievous}</span>
                      )}
                      {hotspot.severityBreakdown.Minor > 0 && (
                        <span className="text-success-600">M:{hotspot.severityBreakdown.Minor}</span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
