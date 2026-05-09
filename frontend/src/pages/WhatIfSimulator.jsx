import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Shuffle, 
  TrendingDown, 
  TrendingUp,
  Lightbulb,
  CheckCircle,
  XCircle,
  BarChart3
} from 'lucide-react'

export default function WhatIfSimulator() {
  const [scenarios, setScenarios] = useState([])
  const [currentScenario, setCurrentScenario] = useState({
    name: '',
    interventions: []
  })

  const [location, setLocation] = useState({
    city: 'Delhi',
    state: 'Delhi',
    latitude: 28.6139,
    longitude: 77.2090
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

  const interventionOptions = [
    { 
      id: 'traffic_light', 
      name: 'Add Traffic Light', 
      icon: '🚦',
      impact: -15,
      cost: 'High',
      time: '3-6 months'
    },
    { 
      id: 'speed_limit', 
      name: 'Reduce Speed Limit', 
      icon: '⚠️',
      impact: -12,
      cost: 'Low',
      time: '1 week'
    },
    { 
      id: 'speed_camera', 
      name: 'Install Speed Camera', 
      icon: '📷',
      impact: -20,
      cost: 'Medium',
      time: '1 month'
    },
    { 
      id: 'road_widening', 
      name: 'Widen Road', 
      icon: '🛣️',
      impact: -18,
      cost: 'Very High',
      time: '12-18 months'
    },
    { 
      id: 'pedestrian_crossing', 
      name: 'Add Pedestrian Crossing', 
      icon: '🚶',
      impact: -10,
      cost: 'Medium',
      time: '2 months'
    },
    { 
      id: 'street_lighting', 
      name: 'Improve Street Lighting', 
      icon: '💡',
      impact: -8,
      cost: 'Medium',
      time: '1 month'
    },
    { 
      id: 'roundabout', 
      name: 'Convert to Roundabout', 
      icon: '🔄',
      impact: -25,
      cost: 'Very High',
      time: '6-12 months'
    },
    { 
      id: 'police_patrol', 
      name: 'Increase Police Patrol', 
      icon: '👮',
      impact: -14,
      cost: 'High (Recurring)',
      time: 'Immediate'
    }
  ]

  const [selectedInterventions, setSelectedInterventions] = useState([])
  const [simulationResult, setSimulationResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const toggleIntervention = (intervention) => {
    if (selectedInterventions.find(i => i.id === intervention.id)) {
      setSelectedInterventions(selectedInterventions.filter(i => i.id !== intervention.id))
    } else {
      setSelectedInterventions([...selectedInterventions, intervention])
    }
  }

  const runSimulation = async () => {
    setLoading(true)
    
    try {
      const response = await fetch('http://localhost:5000/api/simulate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          interventions: selectedInterventions,
          location: location
        })
      })
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }
      
      const data = await response.json()
      setSimulationResult(data)
    } catch (error) {
      console.error('Simulation error:', error)
      alert('Failed to simulate interventions. Please ensure the backend is running and models are trained.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">What-If Scenario Simulator</h2>
        <p className="text-gray-600 mt-1">Test different safety interventions and predict their impact on accident reduction</p>
      </div>

      {/* Instructions */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="card bg-purple-50 border-purple-200"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-3 flex-1">
            <Lightbulb className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-purple-900 mb-1">How it works:</h4>
              <p className="text-sm text-purple-800">
                Select location, choose interventions, and run simulation to see ML-predicted impact.
              </p>
            </div>
          </div>
          <div className="ml-4">
            <select
              value={location.city}
              onChange={(e) => {
                const city = indianCities.find(c => c.name === e.target.value)
                if (city) {
                  setLocation({
                    city: city.name,
                    state: city.state,
                    latitude: city.lat,
                    longitude: city.lon
                  })
                  setSimulationResult(null)
                }
              }}
              className="input-field min-w-[200px]"
            >
              {indianCities.map(city => (
                <option key={city.name} value={city.name}>
                  {city.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Baseline Stats - Compact */}
        {simulationResult && (
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="card bg-gradient-to-br from-danger-50 to-danger-100 border-danger-200">
              <p className="text-xs font-medium text-danger-700">Baseline Risk</p>
              <p className="text-3xl font-bold text-danger-900 mt-1">{simulationResult.baselineRisk}</p>
            </div>
            <div className="card bg-gradient-to-br from-warning-50 to-warning-100 border-warning-200">
              <p className="text-xs font-medium text-warning-700">Baseline Accidents</p>
              <p className="text-3xl font-bold text-warning-900 mt-1">{simulationResult.baselineAccidents}</p>
            </div>
            <div className="card bg-gradient-to-br from-success-50 to-success-100 border-success-200">
              <p className="text-xs font-medium text-success-700">New Risk</p>
              <p className="text-3xl font-bold text-success-900 mt-1">{simulationResult.newRisk}</p>
            </div>
            <div className="card bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200">
              <p className="text-xs font-medium text-primary-700">Reduction</p>
              <p className="text-3xl font-bold text-primary-900 mt-1">{simulationResult.riskReduction}</p>
            </div>
          </div>
        )}

        {/* Intervention Selection */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Shuffle className="h-5 w-5 text-primary-600" />
              Select Interventions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {interventionOptions.map((intervention) => {
                const isSelected = selectedInterventions.find(i => i.id === intervention.id)
                return (
                  <motion.button
                    key={intervention.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => toggleIntervention(intervention)}
                    className={`p-3 rounded-lg border-2 text-left transition-all ${
                      isSelected
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{intervention.icon}</span>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{intervention.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-gray-500">{intervention.cost}</span>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-xs text-gray-500">{intervention.time}</span>
                          </div>
                        </div>
                      </div>
                      {isSelected && (
                        <CheckCircle className="h-5 w-5 text-primary-600 flex-shrink-0" />
                      )}
                    </div>
                  </motion.button>
                )
              })}
            </div>

            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                {selectedInterventions.length} intervention{selectedInterventions.length !== 1 ? 's' : ''} selected
              </p>
              <button
                onClick={runSimulation}
                disabled={selectedInterventions.length === 0 || loading}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Running...
                  </span>
                ) : (
                  'Run Simulation'
                )}
              </button>
            </div>
          </div>

          {/* Selected Interventions Summary */}
          {selectedInterventions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card bg-gray-50"
            >
              <h4 className="font-semibold text-gray-900 mb-3">Selected Interventions</h4>
              <div className="space-y-2">
                {selectedInterventions.map((intervention) => (
                  <div key={intervention.id} className="flex items-center justify-between p-2 bg-white rounded">
                    <span className="text-sm text-gray-700">{intervention.icon} {intervention.name}</span>
                    <button
                      onClick={() => toggleIntervention(intervention)}
                      className="text-gray-400 hover:text-danger-600"
                    >
                      <XCircle className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Simulation Results */}
        <div className="space-y-6">
          {simulationResult ? (
            <>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="card bg-gradient-to-br from-success-50 to-success-100 border-success-200"
              >
                <div className="text-center">
                  <TrendingDown className="h-12 w-12 text-success-600 mx-auto mb-3" />
                  <p className="text-sm font-medium text-success-700">Predicted Risk Level</p>
                  <p className="text-5xl font-bold text-success-900 mt-2">{simulationResult.newRisk}</p>
                  <div className="flex items-center justify-center gap-2 mt-3">
                    <TrendingDown className="h-4 w-4 text-success-600" />
                    <span className="text-lg font-semibold text-success-700">
                      -{simulationResult.riskReduction} points
                    </span>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="card"
              >
                <h4 className="font-semibold text-gray-900 mb-4">Impact Analysis</h4>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Accident Reduction</span>
                      <span className="text-lg font-bold text-success-600">
                        -{simulationResult.accidentReduction} ({simulationResult.percentReduction}%)
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${simulationResult.percentReduction}%` }}
                        className="h-full bg-success-500"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Implementation Cost</span>
                      <span className="font-medium text-gray-900">
                        ₹{simulationResult.costInLakhs} Lakhs
                        {simulationResult.costInCrores >= 1 && (
                          <span className="text-xs text-gray-500 ml-1">
                            (₹{simulationResult.costInCrores} Cr)
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Implementation Time</span>
                      <span className="font-medium text-gray-900">
                        {simulationResult.implementationTime < 1 ? 'Immediate' : `${simulationResult.implementationTime} months`}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Cost-Effectiveness</span>
                      <span className="font-medium text-gray-900">
                        {simulationResult.costEffectiveness.toFixed(1)} accidents/₹Lakh
                      </span>
                    </div>
                    {simulationResult.mlPowered && (
                      <div className="pt-2 border-t border-gray-200">
                        <span className="inline-flex items-center gap-1 text-xs text-success-600 font-medium">
                          <CheckCircle className="h-3 w-3" />
                          ML-Powered Prediction
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="card bg-primary-50 border-primary-200"
              >
                <div className="flex items-start gap-3">
                  <Lightbulb className="h-5 w-5 text-primary-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-primary-900 mb-2">ML-Based Analysis</h4>
                    <p className="text-sm text-primary-800 mb-2">
                      {simulationResult.percentReduction > 40
                        ? 'Excellent combination! This set of interventions shows high effectiveness and should significantly reduce accidents.'
                        : simulationResult.percentReduction > 25
                        ? 'Good impact. Consider adding more high-impact interventions for better results.'
                        : 'Moderate impact. Try combining with speed cameras or roundabout conversion for better effectiveness.'}
                    </p>
                    {simulationResult.location && (
                      <div className="text-xs text-primary-700 mt-2 pt-2 border-t border-primary-200">
                        <p>Location: {simulationResult.location.city}, {simulationResult.location.state}</p>
                        <p>Nearby accidents analyzed: {simulationResult.location.nearbyAccidents}</p>
                        <p>Confidence: {(simulationResult.confidence * 100).toFixed(0)}%</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </>
          ) : (
            <div className="card h-full flex items-center justify-center">
              <div className="text-center text-gray-500">
                <BarChart3 className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">No Simulation Yet</p>
                <p className="text-sm mt-2">Select interventions and run simulation</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
