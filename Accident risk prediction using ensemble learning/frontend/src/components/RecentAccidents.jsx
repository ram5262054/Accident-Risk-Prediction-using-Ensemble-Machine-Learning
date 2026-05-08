import { useState, useEffect } from 'react'
import { Clock, MapPin } from 'lucide-react'

export default function RecentAccidents() {
  const [accidents, setAccidents] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(true)
    fetch('http://localhost:5000/api/dashboard')
      .then(res => res.json())
      .then(data => {
        if (data.recentAccidents) {
          setAccidents(data.recentAccidents.slice(0, 4))
        }
        setIsLoading(false)
      })
      .catch(() => {
        setIsLoading(false)
      })
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="p-3 bg-gray-50 rounded-lg animate-pulse">
            <div className="h-4 w-32 bg-gray-200 rounded mb-2" />
            <div className="h-3 w-24 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    )
  }

  if (accidents.length === 0) {
    return (
      <div className="text-center py-8">
        <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <p className="text-sm text-gray-500">No recent accidents</p>
        <p className="text-xs text-gray-400 mt-1">Data will appear when backend is running</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {accidents.map((accident) => (
        <div key={accident.datetime} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="h-4 w-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-900">{accident.city}, {accident.state}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3 text-gray-400" />
              <span className="text-xs text-gray-500">{new Date(accident.datetime).toLocaleString()}</span>
            </div>
          </div>
          <span className={`px-2 py-1 text-xs font-medium rounded ${
            accident.severity === 'Severe' ? 'bg-danger-100 text-danger-700' :
            accident.severity === 'Moderate' ? 'bg-warning-100 text-warning-700' :
            'bg-success-100 text-success-700'
          }`}>
            {accident.severity}
          </span>
        </div>
      ))}
    </div>
  )
}
