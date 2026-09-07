import React, { useState } from 'react'
import { useMutation } from '@tanstack/react-query'

interface WarRoomResult {
  before_after: {
    option: string
    before: { freight_usd_t?: number; total_cost_usd?: number; total_days?: number; p_demurrage?: number; expected_cost_usd?: number }
    after: { freight_usd_t?: number; total_cost_usd?: number; total_days?: number; p_demurrage?: number; expected_cost_usd?: number }
    delta: { freight_usd_t?: number; total_cost_usd?: number; total_days?: number; p_demurrage?: number; expected_cost_usd?: number }
  }[]
  recommendations: string[]
}

export default function CrisisWarRoom() {
  const [form, setForm] = useState({
    bunker_mult: 1.0,
    closed_ports: [] as string[],
    closure_days: 0,
    diversion_cape_nm: 0,
    war_risk_pct: 0,
    demand_shock_pct: 0,
  })

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/v1/warroom/crisis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      return res.json()
    },
  })

  const togglePort = (port: string) => {
    setForm(prev => ({
      ...prev,
      closed_ports: prev.closed_ports.includes(port)
        ? prev.closed_ports.filter(p => p !== port)
        : [...prev.closed_ports, port],
    }))
  }

  const ports = ['INPDD','INVIZ','INKAK','INMAA','INENR','INGGV','INGPA','INTUT']

  return (
    <div style={{ padding: '80px 24px', maxWidth: 1200, margin: '0 auto' }}>
      <h1 style={{ color: '#EDE6D6', fontSize: 28, marginBottom: 24 }}>[CRISIS] Crisis War Room</h1>
      
      <div style={{ background: '#12141C', border: '1px solid rgba(220,38,38,0.35)', borderRadius: 14, padding: 24, marginBottom: 24 }}>
        <h3 style={{ color: '#DC2626', marginBottom: 16 }}>Crisis Parameters</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          <div>
            <label style={labelStyle}>Bunker Multiplier: {form.bunker_mult}x</label>
            <input type="range" min="0.5" max="3" step="0.1" value={form.bunker_mult} onChange={e => setForm({...form, bunker_mult: Number(e.target.value)})} style={{ width: '100%' }} />
          </div>
          <div>
            <label style={labelStyle}>Closure Days</label>
            <input type="number" value={form.closure_days} onChange={e => setForm({...form, closure_days: Number(e.target.value)})} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Diversion (NM)</label>
            <input type="number" value={form.diversion_cape_nm} onChange={e => setForm({...form, diversion_cape_nm: Number(e.target.value)})} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>War Risk %: {form.war_risk_pct}%</label>
            <input type="range" min="0" max="100" step="5" value={form.war_risk_pct} onChange={e => setForm({...form, war_risk_pct: Number(e.target.value)})} style={{ width: '100%' }} />
          </div>
          <div>
            <label style={labelStyle}>Demand Shock %: {form.demand_shock_pct}%</label>
            <input type="range" min="-50" max="50" step="5" value={form.demand_shock_pct} onChange={e => setForm({...form, demand_shock_pct: Number(e.target.value)})} style={{ width: '100%' }} />
          </div>
        </div>
        
        <div style={{ marginTop: 16 }}>
          <label style={labelStyle}>Closed Ports</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {ports.map(p => (
              <button key={p} onClick={() => togglePort(p)} style={{
                background: form.closed_ports.includes(p) ? '#DC2626' : '#0B0E1A',
                color: '#EDE6D6',
                border: '1px solid rgba(220,38,38,0.35)',
                borderRadius: 8,
                padding: '6px 12px',
                cursor: 'pointer',
                fontSize: 12,
              }}>{p}</button>
            ))}
          </div>
        </div>
        
        <button onClick={() => mutation.mutate()} style={{ ...buttonStyle, marginTop: 16 }} disabled={mutation.isLoading}>
          {mutation.isLoading ? 'Running Crisis Simulation...' : '[CRISIS] Trigger Crisis'}
        </button>
      </div>

      {mutation.data && (
        <div>
          <h2 style={{ color: '#EDE6D6', marginBottom: 16 }}>Before / After Impact</h2>
          <div style={{ display: 'grid', gap: 12 }}>
            {mutation.data.before_after.map((ba, i) => (
              <div key={i} style={{ background: '#12141C', border: '1px solid rgba(220,38,38,0.35)', borderRadius: 14, padding: 20 }}>
                <h4 style={{ color: '#F59E0B', marginBottom: 8 }}>{ba.option}</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                  <div>
                    <span style={{ color: '#8B8FA3', fontSize: 11 }}>BEFORE</span>
                    <div style={{ color: '#EDE6D6' }}>
                      Freight: ${ba.before.freight_usd_t?.toFixed(2)}/t<br />
                      Cost: ${ba.before.total_cost_usd?.toLocaleString()}<br />
                      P(Demurrage): {((ba.before.p_demurrage ?? 0) * 100).toFixed(0)}%
                    </div>
                  </div>
                  <div>
                    <span style={{ color: '#8B8FA3', fontSize: 11 }}>AFTER</span>
                    <div style={{ color: '#EDE6D6' }}>
                      Freight: ${ba.after.freight_usd_t?.toFixed(2)}/t<br />
                      Cost: ${ba.after.total_cost_usd?.toLocaleString()}<br />
                      P(Demurrage): {((ba.after.p_demurrage ?? 0) * 100).toFixed(0)}%
                    </div>
                  </div>
                  <div>
                    <span style={{ color: '#8B8FA3', fontSize: 11 }}>DELTA</span>
                    <div style={{ color: '#DC2626' }}>
                      Freight Δ: ${ba.delta.freight_usd_t?.toFixed(2)}/t<br />
                      Cost Δ: ${ba.delta.total_cost_usd?.toLocaleString()}<br />
                      P(Demurrage) Δ: {(ba.delta.p_demurrage ?? 0).toFixed(3)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ ...cardStyle, marginTop: 16 }}>
            <h3 style={{ color: '#DC2626', marginBottom: 12 }}>⚡ Recommendations</h3>
            {mutation.data.recommendations.map((rec, i) => (
              <div key={i} style={{ color: '#EDE6D6', marginBottom: 8, paddingLeft: 16, borderLeft: '3px solid #DC2626' }}>
                {rec}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

const labelStyle: React.CSSProperties = { display: 'block', color: '#8B8FA3', fontSize: 12, marginBottom: 4, textTransform: 'uppercase' }
const inputStyle: React.CSSProperties = { width: '100%', background: '#0B0E1A', color: '#EDE6D6', border: '1px solid rgba(220,38,38,0.35)', borderRadius: 14, padding: '10px', fontSize: 14 }
const buttonStyle: React.CSSProperties = { background: '#DC2626', color: '#EDE6D6', border: 'none', borderRadius: 14, padding: '14px 32px', fontSize: 16, cursor: 'pointer', fontWeight: 700, width: '100%' }
const cardStyle: React.CSSProperties = { background: '#12141C', border: '1px solid rgba(220,38,38,0.35)', borderRadius: 14, padding: 20 }