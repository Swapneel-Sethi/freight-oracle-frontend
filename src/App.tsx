import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { TempleNightScene } from './three/TempleNightRenderer'
import CommandDashboard from './pages/CommandDashboard'
import ForecastStudio from './pages/ForecastStudio'
import ScenarioOptimizer from './pages/ScenarioOptimizer'
import DemurrageSimulator from './pages/DemurrageSimulator'
import FleetBallaster from './pages/FleetBallaster'
import CrisisWarRoom from './pages/CrisisWarRoom'
import AdminIngest from './pages/AdminIngest'
import Navigation from './components/Navigation'
import { useKpi } from './hooks/useKpi'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchInterval: 30000,
      staleTime: 15000,
    },
  },
})

function TempleSceneWithFallback(props: { freightQ50: number; overhangScore: number }) {
  const [webglFailed, setWebglFailed] = React.useState(false)

  React.useEffect(() => {
    try {
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
      if (!gl) setWebglFailed(true)
    } catch {
      setWebglFailed(true)
    }
  }, [])

  if (webglFailed) {
    return (
      <div style={{
        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
        background: 'radial-gradient(ellipse at 50% 30%, #1a0505 0%, #0B0E1A 60%)',
        zIndex: -1,
      }} />
    )
  }

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1 }}>
      <TempleNightScene freightQ50={props.freightQ50} overhangScore={props.overhangScore} />
    </div>
  )
}

function AppInner() {
  const { freightQ50, overhangScore } = useKpi()

  return (
    <BrowserRouter>
      <TempleSceneWithFallback freightQ50={freightQ50} overhangScore={overhangScore} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <Navigation />
        
        <Routes>
          <Route path="/" element={<CommandDashboard />} />
          <Route path="/forecast" element={<ForecastStudio />} />
          <Route path="/optimize" element={<ScenarioOptimizer />} />
          <Route path="/demurrage" element={<DemurrageSimulator />} />
          <Route path="/fleet" element={<FleetBallaster />} />
          <Route path="/warroom" element={<CrisisWarRoom />} />
          <Route path="/admin" element={<AdminIngest />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppInner />
    </QueryClientProvider>
  )
}

export default App
