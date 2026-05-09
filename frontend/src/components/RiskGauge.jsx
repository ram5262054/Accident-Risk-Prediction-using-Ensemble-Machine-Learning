import { motion } from 'framer-motion'

export default function RiskGauge({ value }) {
  const getColor = (val) => {
    if (val >= 70) return '#ef4444'
    if (val >= 40) return '#f59e0b'
    return '#22c55e'
  }

  const getLabel = (val) => {
    if (val >= 70) return 'HIGH RISK'
    if (val >= 40) return 'MEDIUM RISK'
    return 'LOW RISK'
  }

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-48 h-48">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="96"
            cy="96"
            r="80"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="16"
          />
          <motion.circle
            cx="96"
            cy="96"
            r="80"
            fill="none"
            stroke={getColor(value)}
            strokeWidth="16"
            strokeDasharray={`${value * 5.03} 503`}
            strokeLinecap="round"
            initial={{ strokeDasharray: '0 503' }}
            animate={{ strokeDasharray: `${value * 5.03} 503` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="text-5xl font-bold"
            style={{ color: getColor(value) }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: 'spring' }}
          >
            {value}
          </motion.span>
          <span className="text-sm text-gray-500 mt-1">/ 100</span>
        </div>
      </div>
      <div
        className="mt-4 px-4 py-2 rounded-full font-semibold text-sm"
        style={{
          backgroundColor: `${getColor(value)}20`,
          color: getColor(value)
        }}
      >
        {getLabel(value)}
      </div>
    </div>
  )
}
