import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import RiskPredictor from './pages/RiskPredictor'
import HotspotExplorer from './pages/HotspotExplorer'
import Analytics from './pages/Analytics'
import WhatIfSimulator from './pages/WhatIfSimulator'
import RouteAnalyzer from './pages/RouteAnalyzer'

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/predict" element={<RiskPredictor />} />
          <Route path="/hotspots" element={<HotspotExplorer />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/simulator" element={<WhatIfSimulator />} />
          <Route path="/route-analyzer" element={<RouteAnalyzer />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
