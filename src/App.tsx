import React, { useState, useEffect } from 'react'
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
      refetchInterval: 30000, // 30s polling
      staleTime: 15000,
    },
  },
})

function App() {
  const { freightQ50, overhangScore } = useKpi()
  
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {/* Temple Night background scene */}
        {/* (Temporarily disabled for debugging) */}
        {/* <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1 }}>
          <TempleNightScene 
            freightQ50={freightQ50} 
            overhangScore={overhangScore} 
          />
        </div> */}
        
        {/* Navigation overlay */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <Navigation />
          
          {/* Page routes */}
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
    </QueryClientProvider>
  )
}

export default App