import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  MapPin, 
  Calendar, 
  Cloud, 
  Car, 
  AlertCircle,
  TrendingUp,
  Info
} from 'lucide-react'
import MapSelector from '../components/MapSelector'

export default function RiskPredictor() {
  const [formData, setFormData] = useState({
    latitude: 28.6139,
    longitude: 77.2090,
    datetime: new Date().toISOString().slice(0, 16),
    weather: 'Clear',
    traffic: 'moderate',
    state: 'Delhi',
    city: 'Delhi'
  })

  const indianCities = [
    { name: 'Delhi', lat: 28.6139, lon: 77.2090, state: 'Delhi' },
    { name: 'Mumbai', lat: 19.0760, lon: 72.8777, state: 'Maharashtra' },
    { name: 'Bangalore', lat: 12.9716, lon: 77.5946, state: 'Karnataka' },
    { name: 'Chennai', lat: 13.0827, lon: 80.2707, state: 'Tamil Nadu' },
    { name: 'Kolkata', lat: 22.5726, lon: 88.3639, state: 'West Bengal' },
    { name: 'Hyderabad', lat: 17.3850, lon: 78.4867, state: 'Telangana' },
    { name: 'Pune', lat: 18.5204, lon: 73.8567, state: 'Maharashtra' },
    { name: 'Ahmedabad', lat: 23.0225, lon: 72.5714, state: 'Gujarat' },
    { name: 'Jaipur', lat: 26.9124, lon: 75.7873, state: 'Rajasthan' },
    { name: 'Lucknow', lat: 26.8467, lon: 80.9462, state: 'Uttar Pradesh' }
  ]

  const [prediction, setPrediction] = useState(null)
  const [loading, setLoading] = useState(false)

  const handlePredict = async () => {
    setLoading(true)
    
    try {
      const response = await fetch('http://localhost:5000/api/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }
      
      const data = await response.json()
      setPrediction(data)
    } catch (error) {
      console.error('Prediction error:', error)
      alert('Failed to predict risk. Please ensure the backend is running and models are trained.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">AI Risk Predictor</h2>
        <p className="text-gray-600 mt-1">Predict accident risk with explainable AI - Select a location and conditions to get started</p>
      </div>

      {/* Quick Start Guide */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="card bg-primary-50 border-primary-200"
      >
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-primary-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-primary-900 mb-1">How to use:</h4>
            <ol className="text-sm text-primary-800 space-y-1 list-decimal list-inside">
              <li>Select an Indian city from the dropdown or click on the map</li>
              <li>Choose date, time, weather, and traffic conditions</li>
              <li>Click "Predict Risk" to see AI-powered risk assessment</li>
            </ol>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          {/* Location Selection */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary-600" />
              Select Location
            </h3>
            <div className="space-y-4">
              {/* Indian City Quick Select */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quick Select Indian City
                </label>
                <select
                  onChange={(e) => {
                    const city = indianCities.find(c => c.name === e.target.value)
                    if (city) {
                      setFormData({ 
                        ...formData, 
                        latitude: city.lat, 
                        longitude: city.lon,
                        city: city.name,
                        state: city.state
                      })
                    }
                  }}
                  className="input-field"
                >
                  <option value="">Select a city...</option>
                  {indianCities.map(city => (
                    <option key={city.name} value={city.name}>
                      {city.name}, {city.state}
                    </option>
                  ))}
                </select>
              </div>
              <div className="h-64 bg-gray-100 rounded-lg overflow-hidden">
                <MapSelector 
                  onLocationSelect={(lat, lng) => {
                    setFormData({ ...formData, latitude: lat, longitude: lng })
                  }}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) })}
                    className="input-field"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Conditions */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary-600" />
              Conditions
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={formData.datetime}
                  onChange={(e) => setFormData({ ...formData, datetime: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Weather Conditions
                </label>
                <select
                  value={formData.weather}
                  onChange={(e) => setFormData({ ...formData, weather: e.target.value })}
                  className="input-field"
                >
                  <option value="clear">Clear</option>
                  <option value="rain">Rain</option>
                  <option value="fog">Fog</option>
                  <option value="snow">Snow</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Traffic Density
                </label>
                <select
                  value={formData.traffic}
                  onChange={(e) => setFormData({ ...formData, traffic: e.target.value })}
                  className="input-field"
                >
                  <option value="light">Light</option>
                  <option value="moderate">Moderate</option>
                  <option value="heavy">Heavy</option>
                </select>
              </div>
            </div>
          </div>

          <button
            onClick={handlePredict}
            disabled={loading}
            className="w-full btn-primary py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Analyzing...
              </span>
            ) : (
              'Predict Risk'
            )}
          </button>
        </motion.div>

        {/* Prediction Results */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          {prediction ? (
            <>
              {/* Risk Score */}
              <div className="card">
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-600 mb-2">Predicted Risk Score</p>
                  <div className="relative inline-block">
                    <svg className="w-40 h-40">
                      <circle
                        cx="80"
                        cy="80"
                        r="70"
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="12"
                      />
                      <circle
                        cx="80"
                        cy="80"
                        r="70"
                        fill="none"
                        stroke={prediction.riskScore > 70 ? '#ef4444' : prediction.riskScore > 40 ? '#f59e0b' : '#22c55e'}
                        strokeWidth="12"
                        strokeDasharray={`${prediction.riskScore * 4.4} 440`}
                        strokeLinecap="round"
                        transform="rotate(-90 80 80)"
                        className="transition-all duration-1000"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-4xl font-bold text-gray-900">{prediction.riskScore}</span>
                      <span className="text-sm text-gray-500">/ 100</span>
                    </div>
                  </div>
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mt-4 ${
                    prediction.riskLevel === 'HIGH' ? 'bg-danger-100 text-danger-700' :
                    prediction.riskLevel === 'MEDIUM' ? 'bg-warning-100 text-warning-700' :
                    'bg-success-100 text-success-700'
                  }`}>
                    <AlertCircle className="h-4 w-4" />
                    <span className="font-semibold">{prediction.riskLevel} RISK</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Confidence: {(prediction.confidence * 100).toFixed(0)}%
                  </p>
                </div>
              </div>

              {/* AI Explainability */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary-600" />
                  Why This Prediction?
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  AI model identified these contributing factors:
                </p>
                <div className="space-y-3">
                  {prediction.factors.map((factor, index) => (
                    <motion.div
                      key={factor.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="space-y-2"
                    >
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-gray-700">{factor.name}</span>
                        <span className="text-gray-900 font-semibold">{factor.contribution}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${factor.contribution}%` }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className={`h-full ${
                              factor.contribution > 30 ? 'bg-danger-500' :
                              factor.contribution > 15 ? 'bg-warning-500' :
                              'bg-primary-500'
                            }`}
                          />
                        </div>
                        <span className="text-xs text-gray-500 w-24 text-right">{factor.value}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Similar Incidents */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Info className="h-5 w-5 text-primary-600" />
                  Similar Historical Incidents
                </h3>
                <div className="space-y-2">
                  {prediction.similarIncidents.map((incident, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{incident.date}</p>
                        <p className="text-xs text-gray-500">{incident.distance} away</p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded ${
                        incident.severity === 'Severe' ? 'bg-danger-100 text-danger-700' :
                        incident.severity === 'Moderate' ? 'bg-warning-100 text-warning-700' :
                        'bg-success-100 text-success-700'
                      }`}>
                        {incident.severity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              <div className="card bg-primary-50 border-primary-200">
                <h3 className="text-lg font-semibold text-primary-900 mb-3">
                  Safety Recommendations
                </h3>
                <ul className="space-y-2">
                  {prediction.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-primary-800">
                      <span className="text-primary-600 mt-0.5">•</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </>
          ) : (
            <div className="card h-full flex items-center justify-center">
              <div className="text-center text-gray-500">
                <AlertCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">No Prediction Yet</p>
                <p className="text-sm mt-2">Fill in the details and click "Predict Risk"</p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
