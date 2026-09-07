import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export default function ForecastStudio() {
  const [route, setRoute] = useState('AUNTL->INPDD')
  const [commodity, setCommodity] = useState('THERMAL_COAL')
  const [vesselClass, setVesselClass] = useState('CAPESIZE')
  const [horizon, setHorizon] = useState(90)

  const { data, isLoading } = useQuery({
    queryKey: ['forecast', route, commodity, vesselClass],
    queryFn: async () => {
      const res = await fetch(`/api/v1/models/forecast?route=${route}&commodity=${commodity}&vessel_class=${vesselClass}&horizon_days=${horizon}`)
      if (!res.ok) throw new Error('Forecast failed')
      return res.json()
    },
    refetchInterval: 60000,
  })

  // Generate simulated forecast data for display
  const forecastData = data?.map((d: any, i: number) => ({
    day: i + 1,
    q10: d.q10,
    q50: d.q50,
    q90: d.q90,
  })) || Array.from({ length: 90 }, (_, i) => ({
    day: i + 1,
    q10: 20 + Math.sin(i * 0.1) * 5 + i * 0.02,
    q50: 25 + Math.sin(i * 0.1) * 5 + i * 0.025,
    q90: 32 + Math.sin(i * 0.1) * 5 + i * 0.03,
  }))

  return (
    <div style={{ padding: '80px 24px', maxWidth: 1200, margin: '0 auto' }}>
      <h1 style={{ color: '#EDE6D6', fontSize: 28, marginBottom: 24 }}>Forecast Studio</h1>
      
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <select style={selectStyle} value={route} onChange={e => setRoute(e.target.value)}>
          <option value="AUNTL->INPDD">Newcastle → Paradip (Thermal Coal)</option>
          <option value="ZARCB->INVIZ">Richards Bay → Visakhapatnam (Thermal Coal)</option>
          <option value="IDSAM->INMAA">Samarinda → Chennai (Thermal Coal)</option>
          <option value="AUGLT->INENR">Gladstone → Ennore (Coking Coal)</option>
          <option value="AUPHE->INGGV">Port Hedland → Gangavaram (Thermal Coal)</option>
          <option value="IDBPN->INKAK">Balikpapan → Kakinada (Thermal Coal)</option>
        </select>
        <select style={selectStyle} value={commodity} onChange={e => setCommodity(e.target.value)}>
          <option value="THERMAL_COAL">Thermal Coal</option>
          <option value="COKING_COAL">Coking Coal</option>
        </select>
        <select style={selectStyle} value={vesselClass} onChange={e => setVesselClass(e.target.value)}>
          <option value="CAPESIZE">Capesize</option>
          <option value="PANAMAX">Panamax</option>
          <option value="SUPRAMAX">Supramax</option>
        </select>
        <select style={selectStyle} value={horizon} onChange={e => setHorizon(Number(e.target.value))}>
          <option value={30}>30 Days</option>
          <option value={60}>60 Days</option>
          <option value={90}>90 Days</option>
          <option value={120}>120 Days</option>
        </select>
      </div>

      <div style={{ background: '#12141C', border: '1px solid rgba(220,38,38,0.35)', borderRadius: 14, padding: 24 }}>
        <h3 style={{ color: '#EDE6D6', marginBottom: 16 }}>Quantile Forecast ({horizon} days)</h3>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={forecastData.slice(0, Math.min(90, forecastData.length))}>
            <defs>
              <linearGradient id="q10Grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#DC2626" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#DC2626" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="q90Grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="day" stroke="#8B8FA3" fontSize={11} />
            <YAxis stroke="#8B8FA3" fontSize={11} />
            <Tooltip contentStyle={{ background: '#12141C', border: '1px solid rgba(220,38,38,0.35)', color: '#EDE6D6' }} />
            <Area type="monotone" dataKey="q10" stroke="#DC2626" fill="url(#q10Grad)" strokeWidth={1} strokeDasharray="4,4" />
            <Area type="monotone" dataKey="q50" stroke="#F59E0B" fill="none" strokeWidth={2} />
            <Area type="monotone" dataKey="q90" stroke="#F59E0B" fill="url(#q90Grad)" strokeWidth={1} strokeDasharray="4,4" />
          </AreaChart>
        </ResponsiveContainer>
        <div style={{ display: 'flex', gap: 24, marginTop: 16 }}>
          <span style={{ color: '#DC2626' }}>── q10 (lower bound)</span>
          <span style={{ color: '#F59E0B' }}>── q50 (median forecast)</span>
          <span style={{ color: '#F59E0B' }}>── q90 (upper bound)</span>
        </div>
      </div>
    </div>
  )
}

const selectStyle: React.CSSProperties = {
  background: '#12141C',
  color: '#EDE6D6',
  border: '1px solid rgba(220,38,38,0.35)',
  borderRadius: 14,
  padding: '10px 16px',
  fontSize: 13,
}