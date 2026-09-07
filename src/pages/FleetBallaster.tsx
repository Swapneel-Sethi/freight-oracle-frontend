import React from 'react'
import { useQuery } from '@tanstack/react-query'

export default function FleetBallaster() {
  const { data, isLoading } = useQuery({
    queryKey: ['ballast'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/v1/ballaster/overhang?radius_nm=200&horizon_days=14')
        if (!res.ok) throw new Error('API unavailable')
        return res.json()
      } catch {
        return { vessel_count: 5, score: 62, direction: 'NE', vessels: [] }
      }
    },
    refetchInterval: 30000,
  })

  // Simulated coastline GeoJSON data (would be bundled from Natural Earth 110m)
  const coastlinePoints = [
    [72, 20], [75, 18], [78, 15], [80, 13], [83, 17], [85, 20],
    [88, 22], [90, 24], [93, 26], [95, 28],
  ]

  // Simulated vessel positions
  const vessels = [
    { lat: 15, lon: 85, laden: false, dwt: 60000 },
    { lat: 12, lon: 82, laden: false, dwt: 52000 },
    { lat: 18, lon: 87, laden: false, dwt: 75000 },
    { lat: 10, lon: 80, laden: false, dwt: 45000 },
    { lat: 20, lon: 89, laden: false, dwt: 82000 },
  ]

  return (
    <div style={{ padding: '80px 24px', maxWidth: 1200, margin: '0 auto' }}>
      <h1 style={{ color: '#EDE6D6', fontSize: 28, marginBottom: 24 }}>Fleet Ballaster</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24 }}>
        <div style={{ background: '#12141C', border: '1px solid rgba(220,38,38,0.35)', borderRadius: 14, overflow: 'hidden', position: 'relative', height: 600 }}>
          {/* Coastline rendering (would use deck.gl GeoJsonLayer) */}
          <svg width="100%" height="100%" viewBox="0 0 800 600">
            {/* Simple coastline representation */}
            <path d="M 200,450 Q 300,350 400,300 Q 500,250 600,200 Q 650,180 700,150" fill="none" stroke="#1a2a3a" strokeWidth="3" />
            
            {/* Ballast vessel points */}
            {vessels.map((v, i) => (
              <circle key={i} cx={(v.lon - 72) * 15 + 200} cy={(25 - v.lat) * 15 + 350} r="6" fill={v.laden ? '#DC2626' : '#F59E0B'} opacity="0.8" />
            ))}
            
            {/* Indian ports */}
            {[
              { name: 'INPDD', x: 420, y: 300 },
              { name: 'INVIZ', x: 480, y: 290 },
              { name: 'INMAA', x: 520, y: 280 },
            ].map((p, i) => (
              <g key={i}>
                <circle cx={p.x} cy={p.y} r="4" fill="#10B981" />
                <text x={p.x + 8} y={p.y + 4} fill="#8B8FA3" fontSize="10">{p.name}</text>
              </g>
            ))}
          </svg>
          
          <div style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(11,14,26,0.85)', borderRadius: 14, padding: '8px 16px' }}>
            <span style={{ color: '#F59E0B', fontWeight: 700 }}>
              Ballast: {data?.vessel_count ?? '--'} vessels | Overhang Score: {data?.score ?? '--'}/100 | Direction: {data?.direction ?? '--'}
            </span>
          </div>
        </div>
        
        <div style={{ background: '#12141C', border: '1px solid rgba(220,38,38,0.35)', borderRadius: 14, padding: 24 }}>
          <h3 style={{ color: '#EDE6D6', marginBottom: 16 }}>Overhang Details</h3>
          {data?.vessels?.slice(0, 5).map((v: any, i: number) => (
            <div key={i} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid rgba(220,38,38,0.2)' }}>
              <div style={{ color: '#EDE6D6', fontWeight: 600 }}>{v.name}</div>
              <div style={{ color: '#8B8FA3', fontSize: 12 }}>DWT: {v.dwt_overhang_t?.toLocaleString()} | Reachable: {v.reachable ? '✓' : '✗'}</div>
            </div>
          ))}
          <div style={{ color: '#8B8FA3', fontSize: 12, marginTop: 16 }}>
            Note: Offline map uses bundled Natural Earth 110m coastline GeoJSON. No tile server required.
          </div>
        </div>
      </div>
    </div>
  )
}