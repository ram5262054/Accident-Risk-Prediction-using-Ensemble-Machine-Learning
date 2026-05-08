import { useState } from 'react'
import { motion } from 'framer-motion'
import { Route, MapPin, AlertTriangle, TrendingDown, Navigation, Zap, Shield, BarChart3 } from 'lucide-react'
import { MapContainer, TileLayer, Polyline, CircleMarker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

export default function RouteAnalyzer() {
  const [startPoint, setStartPoint] = useState('')
  const [endPoint, setEndPoint] = useState('')
  const [routes, setRoutes] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [selectedRoute, setSelectedRoute] = useState('safest')

  const popularRoutes = [
    { start: 'Connaught Place, Delhi', end: 'India Gate, Delhi', label: 'CP to India Gate' },
    { start: 'Andheri, Mumbai', end: 'Bandra, Mumbai', label: 'Andheri to Bandra' },
    { start: 'Koramangala, Bangalore', end: 'Whitefield, Bangalore', label: 'Koramangala to Whitefield' },
  ]

  const cityCoords = {
    'Connaught Place': [28.6315, 77.2167],
    'India Gate': [28.6129, 77.2295],
    'Andheri': [19.1136, 72.8697],
    'Bandra': [19.0596, 72.8295],
    'Koramangala': [12.9352, 77.6245],
    'Whitefield': [12.9698, 77.7499],
    'T Nagar': [13.0418, 80.2341],
    'Anna Nagar': [13.0878, 80.2088],
    'Salt Lake': [22.5958, 88.4355],
    'Park Street': [22.5542, 88.3516],
    'Hitech City': [17.4474, 78.3772],
    'Banjara Hills': [17.4126, 78.4479],
    'Kothrud': [18.5074, 73.8077],
    'Hinjewadi': [18.5912, 73.7389],
    'Vastrapur': [23.0395, 72.5248],
    'Satellite': [23.0258, 72.5098]
  }

  const indianLocations = [
    'Connaught Place, Delhi',
    'India Gate, Delhi',
    'Andheri, Mumbai',
    'Bandra, Mumbai',
    'Koramangala, Bangalore',
    'Whitefield, Bangalore',
    'T Nagar, Chennai',
    'Anna Nagar, Chennai',
    'Salt Lake, Kolkata',
    'Park Street, Kolkata',
    'Hitech City, Hyderabad',
    'Banjara Hills, Hyderabad',
    'Kothrud, Pune',
    'Hinjewadi, Pune',
    'Vastrapur, Ahmedabad',
    'Satellite, Ahmedabad'
  ]

  const analyzeRoutes = async () => {
    setAnalyzing(true)
    
    try {
      const response = await fetch('http://localhost:5000/api/route-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          start: startPoint,
          end: endPoint
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        setRoutes(data.routes)
        setSelectedRoute('safest')
      } else {
        console.error('Route analysis failed')
        alert('Failed to analyze routes. Please ensure backend is running.')
      }
    } catch (error) {
      console.error('Route analysis error:', error)
      alert('Failed to analyze routes. Please ensure backend is running.')
    } finally {
      setAnalyzing(false)
    }
  }

  const selectPopularRoute = (route) => {
    setStartPoint(route.start)
    setEndPoint(route.end)
  }

  const getRouteIcon = (key) => {
    if (key === 'safest') return Shield
    if (key === 'fastest') return Zap
    return BarChart3
  }

  const getRouteColor = (key) => {
    if (key === 'safest') return '#22c55e'
    if (key === 'fastest') return '#ef4444'
    return '#f59e0b'
  }

  const generateRoutePath = (start, end, routeType) => {
    const startCity = start.split(',')[0].trim()
    const endCity = end.split(',')[0].trim()
    const startCoords = cityCoords[startCity] || [28.6139, 77.2090]
    const endCoords = cityCoords[endCity] || [28.6139, 77.2090]

    // Generate different paths for each route type
    const midLat = (startCoords[0] + endCoords[0]) / 2
    const midLon = (startCoords[1] + endCoords[1]) / 2
    const latDiff = endCoords[0] - startCoords[0]
    const lonDiff = endCoords[1] - startCoords[1]

    if (routeType === 'safest') {
      // Curved path avoiding direct route (safer, longer)
      return [
        startCoords,
        [startCoords[0] + latDiff * 0.25, startCoords[1] + lonDiff * 0.25 - 0.03],
        [midLat + 0.02, midLon - 0.02],
        [endCoords[0] - latDiff * 0.25, endCoords[1] - lonDiff * 0.25 - 0.03],
        endCoords
      ]
    } else if (routeType === 'fastest') {
      // Direct straight path (fastest, riskier)
      return [startCoords, endCoords]
    } else {
      // Slightly curved (balanced)
      return [
        startCoords,
        [midLat, midLon + 0.015],
        endCoords
      ]
    }
  }

  const getRiskColor = (score) => {
    if (score < 30) return 'success'
    if (score < 60) return 'warning'
    return 'danger'
  }

  const getRiskLabel = (score) => {
    if (score < 30) return 'LOW RISK'
    if (score < 60) return 'MEDIUM RISK'
    return 'HIGH RISK'
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Route Safety Analyzer</h2>
        <p className="text-gray-600 mt-1">Compare safety of different routes between two locations in India</p>
      </div>

      {/* Instructions */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="card bg-blue-50 border-blue-200"
      >
        <div className="flex items-start gap-3">
          <Route className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-900 mb-1">How it works:</h4>
            <p className="text-sm text-blue-800">
              Enter starting point and destination to compare three different routes. ML model analyzes safety, speed, and risk for each option.
            </p>
          </div>
        </div>
      </motion.div>

      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Enter Route Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Starting Point
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={startPoint}
                onChange={(e) => setStartPoint(e.target.value)}
                placeholder="e.g., Connaught Place, Delhi"
                list="start-locations"
                className="input-field pl-10"
              />
              <datalist id="start-locations">
                {indianLocations.map(loc => (
                  <option key={loc} value={loc} />
                ))}
              </datalist>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Destination
            </label>
            <div className="relative">
              <Navigation className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={endPoint}
                onChange={(e) => setEndPoint(e.target.value)}
                placeholder="e.g., India Gate, Delhi"
                list="end-locations"
                className="input-field pl-10"
              />
              <datalist id="end-locations">
                {indianLocations.map(loc => (
                  <option key={loc} value={loc} />
                ))}
              </datalist>
            </div>
          </div>
        </div>
        <button
          onClick={analyzeRoutes}
          disabled={!startPoint || !endPoint || analyzing}
          className="mt-4 btn-primary w-full md:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {analyzing ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Analyzing Routes...
            </span>
          ) : (
            'Analyze Routes'
          )}
        </button>
      </div>

      {routes && (
        <>
          {/* Map Visualization */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">Route Comparison Map</h3>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-1 bg-green-500 rounded"></div>
                  <span className="text-gray-600">Safest</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-1 bg-orange-500 rounded"></div>
                  <span className="text-gray-600">Balanced</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-1 bg-red-500 rounded"></div>
                  <span className="text-gray-600">Fastest</span>
                </div>
              </div>
            </div>
            <div className="h-[400px] rounded-lg overflow-hidden border border-gray-200">
              <MapContainer
                center={cityCoords[startPoint.split(',')[0].trim()] || [20.5937, 78.9629]}
                zoom={12}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; OpenStreetMap contributors'
                />
                
                {/* Draw all 3 routes */}
                {Object.entries(routes).map(([key, route]) => {
                  const path = generateRoutePath(startPoint, endPoint, key)
                  const color = getRouteColor(key)
                  const isSelected = selectedRoute === key
                  
                  return (
                    <Polyline
                      key={key}
                      positions={path}
                      pathOptions={{
                        color: color,
                        weight: isSelected ? 6 : 4,
                        opacity: isSelected ? 1 : 0.5,
                        dashArray: key === 'balanced' ? '10, 5' : null
                      }}
                      eventHandlers={{
                        click: () => setSelectedRoute(key)
                      }}
                    >
                      <Popup>
                        <div className="p-2">
                          <p className="font-semibold">{route.name}</p>
                          <p className="text-sm">Risk: {route.riskScore}/100</p>
                          <p className="text-sm">Distance: {route.distance}</p>
                          <p className="text-sm">Time: {route.time}</p>
                          <p className="text-sm">Hotspots: {route.hotspots}</p>
                        </div>
                      </Popup>
                    </Polyline>
                  )
                })}
                
                {/* Start marker */}
                <CircleMarker
                  center={cityCoords[startPoint.split(',')[0].trim()] || [20.5937, 78.9629]}
                  radius={10}
                  fillColor="#3b82f6"
                  color="#fff"
                  weight={3}
                  fillOpacity={1}
                >
                  <Popup>
                    <div className="p-1">
                      <p className="font-semibold text-sm">Start</p>
                      <p className="text-xs">{startPoint}</p>
                    </div>
                  </Popup>
                </CircleMarker>
                
                {/* End marker */}
                <CircleMarker
                  center={cityCoords[endPoint.split(',')[0].trim()] || [20.5937, 78.9629]}
                  radius={10}
                  fillColor="#ef4444"
                  color="#fff"
                  weight={3}
                  fillOpacity={1}
                >
                  <Popup>
                    <div className="p-1">
                      <p className="font-semibold text-sm">Destination</p>
                      <p className="text-xs">{endPoint}</p>
                    </div>
                  </Popup>
                </CircleMarker>
              </MapContainer>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Click on any route to highlight it. Thicker lines show the selected route.
            </p>
          </motion.div>

          {/* Route Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(routes).map(([key, route], index) => {
            const riskColor = getRiskColor(route.riskScore)
            const isSelected = selectedRoute === key
            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setSelectedRoute(key)}
                className={`card cursor-pointer transition-all ${
                  isSelected ? 'ring-2 ring-primary-500 shadow-lg' : 'hover:shadow-md'
                }`}
              >
                
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-3 rounded-lg ${
                    key === 'safest' ? 'bg-success-100' :
                    key === 'fastest' ? 'bg-danger-100' :
                    'bg-warning-100'
                  }`}>
                    {key === 'safest' && <Shield className="h-6 w-6 text-success-600" />}
                    {key === 'fastest' && <Zap className="h-6 w-6 text-danger-600" />}
                    {key === 'balanced' && <BarChart3 className="h-6 w-6 text-warning-600" />}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{route.name}</h3>
                    <p className="text-sm text-gray-500">{route.description}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Distance</span>
                    <span className="font-semibold text-gray-900">{route.distance}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Est. Time</span>
                    <span className="font-semibold text-gray-900">{route.time}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Hotspots</span>
                    <span className="font-semibold text-gray-900">{route.hotspots}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Risk Score</span>
                    <span className={`text-lg font-bold text-${riskColor}-600`}>
                      {route.riskScore}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${route.riskScore}%` }}
                      transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
                      className={`h-full bg-${riskColor}-500`}
                    />
                  </div>
                  <div className={`mt-2 text-center text-xs font-semibold text-${riskColor}-700`}>
                    {getRiskLabel(route.riskScore)}
                  </div>
                  {route.mlPowered && (
                    <div className="mt-2 text-center">
                      <span className="inline-flex items-center gap-1 text-xs text-success-600 font-medium">
                        ✓ ML Predicted Risk
                      </span>
                    </div>
                  )}
                </div>

                <button 
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedRoute(key)
                  }}
                  className={`mt-4 w-full ${
                    isSelected ? 'btn-primary' : 'btn-secondary'
                  }`}
                >
                  {isSelected ? 'Selected Route' : 'Select This Route'}
                </button>
              </motion.div>
            )
          })}
        </div>

        {/* Safety Recommendation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card bg-primary-50 border-primary-200"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-primary-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-primary-900 mb-2">Safety Recommendation</h4>
              <p className="text-sm text-primary-800 mb-3">
                The safest route is recommended despite being slightly longer. It avoids {routes.fastest.hotspots - routes.safest.hotspots} additional hotspots and reduces accident risk by {routes.fastest.riskScore - routes.safest.riskScore} points.
              </p>
              <div className="grid grid-cols-3 gap-4 mt-3 pt-3 border-t border-primary-200">
                <div className="text-center">
                  <p className="text-xs text-primary-700 mb-1">Time Difference</p>
                  <p className="text-lg font-bold text-primary-900">
                    +{parseInt(routes.safest.time) - parseInt(routes.fastest.time)} min
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-primary-700 mb-1">Risk Reduction</p>
                  <p className="text-lg font-bold text-success-600">
                    -{routes.fastest.riskScore - routes.safest.riskScore}%
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-primary-700 mb-1">Hotspots Avoided</p>
                  <p className="text-lg font-bold text-success-600">
                    {routes.fastest.hotspots - routes.safest.hotspots}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
        </>
      )}

      {!routes && !analyzing && (
        <div className="card text-center py-12">
          <Route className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-900">No Routes Analyzed Yet</p>
          <p className="text-sm text-gray-500 mt-2">
            Enter starting point and destination to compare route safety
          </p>
        </div>
      )}
    </div>
  )
}
