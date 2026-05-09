import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  RefreshCw, 
  Database, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  Settings,
  Activity,
  TrendingUp
} from 'lucide-react'

export default function Admin() {
  const [modelStatus, setModelStatus] = useState(null)
  const [retraining, setRetraining] = useState(false)
  const [retrainResult, setRetrainResult] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchModelStatus()
  }, [])

  const fetchModelStatus = async () => {
    setLoading(true)
    try {
      const response = await fetch('http://localhost:5000/api/admin/model-status')
      if (response.ok) {
        const data = await response.json()
        setModelStatus(data)
      } else {
        console.error('Failed to fetch model status')
        alert('Failed to load model status. Please ensure the backend is running.')
      }
    } catch (error) {
      console.error('Error fetching model status:', error)
      alert('Cannot connect to backend. Please start the backend server.')
    } finally {
      setLoading(false)
    }
  }

  const handleRetrain = async (modelType) => {
    if (!confirm(`Are you sure you want to retrain ${modelType} model(s)? This may take several minutes.`)) {
      return
    }

    setRetraining(true)
    setRetrainResult(null)

    try {
      const response = await fetch('http://localhost:5000/api/admin/retrain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ model_type: modelType })
      })

      const data = await response.json()
      setRetrainResult(data)
      
      if (data.success) {
        // Refresh model status after successful retrain
        setTimeout(() => {
          fetchModelStatus()
        }, 1000)
      }
    } catch (error) {
      console.error('Retrain error:', error)
      setRetrainResult({
        success: false,
        message: `Error: ${error.message}`
      })
    } finally {
      setRetraining(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Admin Panel</h2>
        <p className="text-gray-600 mt-1">Manage ML models and system configuration</p>
      </div>

      {/* Model Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-3 card text-center py-12">
            <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading model status...</p>
          </div>
        ) : modelStatus ? (
          <>
            <ModelStatusCard
              title="Ensemble Model"
              status={modelStatus.ensemble_model}
              icon={TrendingUp}
              color="primary"
            />
            <ModelStatusCard
              title="Intervention Model"
              status={modelStatus.intervention_model}
              icon={Activity}
              color="success"
            />
            <ModelStatusCard
              title="Data Status"
              status={modelStatus.data}
              icon={Database}
              color="warning"
            />
          </>
        ) : (
          <div className="col-span-3 card text-center py-12">
            <AlertCircle className="h-12 w-12 text-danger-500 mx-auto mb-4" />
            <p className="text-gray-600">Failed to load model status</p>
            <button onClick={fetchModelStatus} className="btn-primary mt-4">
              Retry
            </button>
          </div>
        )}
      </div>

      {/* Retrain Section */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <RefreshCw className="h-5 w-5 text-primary-600" />
          Model Retraining
        </h3>
        
        <div className="space-y-4">
          <div className="bg-warning-50 border border-warning-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-warning-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-warning-900">Important Notice</p>
                <p className="text-sm text-warning-700 mt-1">
                  Retraining models will take 3-5 minutes. The system will continue to use existing models during training.
                  Models will be automatically reloaded after successful training.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => handleRetrain('ensemble')}
              disabled={retraining}
              className="btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {retraining ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Training...
                </span>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 inline mr-2" />
                  Retrain Ensemble
                </>
              )}
            </button>

            <button
              onClick={() => handleRetrain('intervention')}
              disabled={retraining}
              className="btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {retraining ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Training...
                </span>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 inline mr-2" />
                  Retrain Intervention
                </>
              )}
            </button>

            <button
              onClick={() => handleRetrain('all')}
              disabled={retraining}
              className="btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-primary-600 to-primary-700"
            >
              {retraining ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Training...
                </span>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 inline mr-2" />
                  Retrain All Models
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Retrain Result */}
      {retrainResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`card ${
            retrainResult.success 
              ? 'bg-success-50 border-success-200' 
              : 'bg-danger-50 border-danger-200'
          }`}
        >
          <div className="flex items-start gap-3">
            {retrainResult.success ? (
              <CheckCircle className="h-6 w-6 text-success-600 flex-shrink-0" />
            ) : (
              <XCircle className="h-6 w-6 text-danger-600 flex-shrink-0" />
            )}
            <div className="flex-1">
              <h4 className={`font-semibold ${
                retrainResult.success ? 'text-success-900' : 'text-danger-900'
              }`}>
                {retrainResult.success ? 'Training Successful' : 'Training Failed'}
              </h4>
              <p className={`text-sm mt-1 ${
                retrainResult.success ? 'text-success-700' : 'text-danger-700'
              }`}>
                {retrainResult.message}
              </p>
              
              {retrainResult.details && (
                <div className="mt-3 space-y-2">
                  {Object.entries(retrainResult.details).map(([model, result]) => (
                    <div key={model} className="text-sm">
                      <span className="font-medium capitalize">{model}:</span>{' '}
                      <span className={result.success ? 'text-success-700' : 'text-danger-700'}>
                        {result.success ? '✓ Success' : '✗ Failed'}
                      </span>
                      {result.error && (
                        <div className="text-xs text-danger-600 mt-1 ml-4">
                          {result.error}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* System Info */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary-600" />
          System Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-700">Backend API</p>
            <p className="text-lg font-semibold text-gray-900 mt-1">http://localhost:5000</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-700">Frontend</p>
            <p className="text-lg font-semibold text-gray-900 mt-1">http://localhost:3000</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-700">Model Directory</p>
            <p className="text-sm text-gray-900 mt-1 font-mono">./models/</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-700">Data Directory</p>
            <p className="text-sm text-gray-900 mt-1 font-mono">./data/</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={fetchModelStatus}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
          >
            <RefreshCw className="h-4 w-4 inline mr-2" />
            Refresh Status
          </button>
          <button
            onClick={() => window.open('http://localhost:5000/api/health', '_blank')}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
          >
            <Activity className="h-4 w-4 inline mr-2" />
            Check API Health
          </button>
        </div>
      </div>
    </div>
  )
}

function ModelStatusCard({ title, status, icon: Icon, color }) {
  const isLoaded = status?.loaded || false
  const colorClasses = {
    primary: 'from-primary-500 to-primary-600',
    success: 'from-success-500 to-success-600',
    warning: 'from-warning-500 to-warning-600'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <div className="flex items-center gap-2 mt-2">
            {isLoaded ? (
              <>
                <CheckCircle className="h-4 w-4 text-success-600" />
                <span className="text-sm text-success-600 font-medium">Loaded</span>
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4 text-danger-600" />
                <span className="text-sm text-danger-600 font-medium">Not Loaded</span>
              </>
            )}
          </div>
        </div>
        <div className={`p-3 rounded-lg bg-gradient-to-br ${colorClasses[color]}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>

      <div className="space-y-2 text-sm">
        {status?.models && (
          <div>
            <span className="text-gray-600">Models:</span>
            <span className="ml-2 text-gray-900 font-medium">
              {status.models.join(', ').toUpperCase()}
            </span>
          </div>
        )}
        {status?.features && (
          <div>
            <span className="text-gray-600">Features:</span>
            <span className="ml-2 text-gray-900 font-medium">
              {status.features.length}
            </span>
          </div>
        )}
        {status?.records !== undefined && (
          <div>
            <span className="text-gray-600">Records:</span>
            <span className="ml-2 text-gray-900 font-medium">
              {status.records.toLocaleString()}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  )
}
