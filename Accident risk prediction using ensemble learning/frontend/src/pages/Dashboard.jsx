import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  AlertTriangle, 
  MapPin, 
  Activity,
  Shield,
  RefreshCw
} from 'lucide-react'
import AccidentHeatmap from '../components/AccidentHeatmap'
import RiskGauge from '../components/RiskGauge'
import RecentAccidents from '../components/RecentAccidents'
import TemporalChart from '../components/TemporalChart'

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedLocation, setSelectedLocation] = useState(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/dashboard')
      
      if (response.ok) {
        const data = await response.json()
        
        if (data.stats) {
          setStats(data.stats)
        }
        setIsConnected(true)
        setIsLoading(false)
      } else {
        setIsConnected(false)
        setIsLoading(false)
      }
    } catch (error) {
      setIsConnected(false)
      setIsLoading(false)
    }
  }

  const handleLocationClick = (location) => {
    setSelectedLocation(location)
    // Update the current risk with the clicked location's risk
    if (stats) {
      setStats({
        ...stats,
        currentRisk: location.riskScore,
        predictionCity: location.city
      })
    }
  }

  const statCards = [
    {
      title: 'Current Risk Level',
      value: stats?.currentRisk,
      unit: '/100',
      icon: AlertTriangle,
      color: 'danger',
      trend: stats?.currentRisk > 70 ? 'High Alert' : 'Normal',
      description: stats?.predictionCity ? `Risk for ${stats.predictionCity}` : 'Click map location',
      mlPowered: false
    },
    {
      title: "Today's Incidents",
      value: stats?.todayAccidents,
      unit: '',
      icon: Activity,
      color: 'warning',
      trend: stats?.todayAccidents > 150 ? '+12%' : '-8%',
      description: 'Compared to yesterday'
    },
    {
      title: 'High-Risk Zones',
      value: stats?.activeHotspots,
      unit: ' areas',
      icon: MapPin,
      color: 'primary',
      trend: 'Monitored',
      description: 'Accident-prone locations'
    },
    {
      title: 'Total Accidents',
      value: stats?.totalAccidents ? Math.floor(stats.totalAccidents / 1000) + 'K' : '--',
      unit: '',
      icon: Shield,
      color: 'success',
      trend: 'Historical',
      description: 'Database records'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Connection Error Banner */}
      {!isConnected && !isLoading && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card bg-danger-50 border-2 border-danger-200"
        >
          <div className="flex items-start gap-4">
            <AlertTriangle className="h-6 w-6 text-danger-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-danger-900 mb-2">Backend Server Not Running</h3>
              <p className="text-sm text-danger-700 mb-3">
                The application cannot connect to the backend API. Please start the backend server to use the system.
              </p>
              <div className="bg-white rounded-lg p-4 border border-danger-200">
                <p className="text-sm font-medium text-gray-900 mb-2">To start the backend:</p>
                <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
                  <li>Open a terminal in the project directory</li>
                  <li>Run: <code className="px-2 py-1 bg-gray-100 rounded text-danger-600 font-mono">python api/production_app.py</code></li>
                  <li>Wait for "Running on http://localhost:5000" message</li>
                  <li>Refresh this page</li>
                </ol>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Traffic Safety Overview</h2>
          <p className="text-gray-600 mt-1">Real-time accident monitoring and risk assessment for India</p>
        </div>
        <div className="flex items-center gap-3">
          {isLoading ? (
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" />
              <span className="text-sm font-medium">Loading...</span>
            </div>
          ) : isConnected ? (
            <>
              <button
                onClick={fetchDashboardData}
                className="flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                <span className="text-sm font-medium">Refresh</span>
              </button>
              <div className="flex items-center gap-2 px-4 py-2 bg-success-50 text-success-700 rounded-lg">
                <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium">Connected</span>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2 px-4 py-2 bg-danger-50 text-danger-700 rounded-lg">
              <div className="w-2 h-2 bg-danger-500 rounded-full" />
              <span className="text-sm font-medium">Disconnected</span>
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <StatCard {...stat} isLoading={isLoading} isConnected={isConnected} />
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Heatmap - Takes 2 columns */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2"
        >
          <div className="card h-[600px]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Live Accident Heatmap</h3>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Click any location to see risk level</span>
              </div>
            </div>
            <AccidentHeatmap onLocationClick={handleLocationClick} />
          </div>
        </motion.div>

        {/* Risk Gauge & Recent Accidents */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-6"
        >
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Risk Assessment</h3>
            {isLoading ? (
              <div className="flex items-center justify-center h-48">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-sm text-gray-500">Loading risk data...</p>
                </div>
              </div>
            ) : !isConnected ? (
              <div className="flex items-center justify-center h-48">
                <div className="text-center">
                  <AlertTriangle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">No data available</p>
                  <p className="text-xs text-gray-400 mt-1">Start backend to view</p>
                </div>
              </div>
            ) : (
              <RiskGauge value={stats?.currentRisk || 0} />
            )}
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Incidents</h3>
            <RecentAccidents />
          </div>
        </motion.div>
      </div>

      {/* Temporal Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Accident Patterns - Last 24 Hours</h3>
          <TemporalChart />
        </div>
      </motion.div>
    </div>
  )
}

function StatCard({ title, value, unit, icon: Icon, color, trend, description, isLoading, isConnected }) {
  const colorClasses = {
    danger: 'from-danger-500 to-danger-600',
    warning: 'from-warning-500 to-warning-600',
    primary: 'from-primary-500 to-primary-600',
    success: 'from-success-500 to-success-600'
  }

  return (
    <div className="stat-card group cursor-pointer">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          
          {isLoading ? (
            <div className="mt-2">
              <div className="h-9 w-20 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-32 bg-gray-100 rounded animate-pulse mt-2" />
            </div>
          ) : !isConnected || value === null || value === undefined ? (
            <div className="mt-2">
              <p className="text-2xl font-bold text-gray-300">--</p>
              <p className="text-xs text-gray-400 mt-2">No data</p>
            </div>
          ) : (
            <>
              <div className="flex items-baseline mt-2">
                <p className="text-3xl font-bold text-gray-900">{value}</p>
                {unit && <span className="ml-1 text-lg text-gray-500">{unit}</span>}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className={`text-xs font-medium ${
                  trend.startsWith('+') ? 'text-danger-600' : 'text-success-600'
                }`}>
                  {trend}
                </span>
                <span className="text-xs text-gray-500">{description}</span>
              </div>
            </>
          )}
        </div>
        <div className={`p-3 rounded-lg bg-gradient-to-br ${colorClasses[color]} ${
          isLoading || !isConnected ? 'opacity-50' : 'group-hover:scale-110'
        } transition-transform`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  )
}
