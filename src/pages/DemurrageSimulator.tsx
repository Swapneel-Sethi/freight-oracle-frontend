import React, { useState } from 'react'
import { useMutation } from '@tanstack/react-query'

interface DemurrageResult {
  p_demurrage: number
  expected_cost_usd: number
  p10_cost_usd: number
  p50_cost_usd: number
  p90_cost_usd: number
  histogram_bins: number[]
  driver_attribution: { driver: string; contribution: number; details: string }[]
  dispatch_earned_usd: number
}

export default function DemurrageSimulator() {
  const [form, setForm] = useState({
    disch: 'INPDD',
    cargo_t: 150000,
    discharge_rate_tpd: 25000,
    laytime: 5,
    demurrage_usd_day: 25000,
    dispatch_usd_day: 12500,
    month: 'October',
  })

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/v1/demurrage/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      return res.json()
    },
  })

  return (
    <div style={{ padding: '80px 24px', maxWidth: 1200, margin: '0 auto' }}>
      <h1 style={{ color: '#EDE6D6', fontSize: 28, marginBottom: 24 }}>Demurrage Simulator</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, background: '#12141C', border: '1px solid rgba(220,38,38,0.35)', borderRadius: 14, padding: 24, marginBottom: 24 }}>
        <div>
          <label style={labelStyle}>Discharge Port</label>
          <select style={inputStyle} value={form.disch} onChange={e => setForm({...form, disch: e.target.value})}>
            {['INPDD','INVIZ','INKAK','INMAA','INENR','INGGV','INGPA','INTUT'].map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Cargo (tonnes)</label>
          <input style={inputStyle} type="number" value={form.cargo_t} onChange={e => setForm({...form, cargo_t: Number(e.target.value)})} />
        </div>
        <div>
          <label style={labelStyle}>Discharge Rate (tpd)</label>
          <input style={inputStyle} type="number" value={form.discharge_rate_tpd} onChange={e => setForm({...form, discharge_rate_tpd: Number(e.target.value)})} />
        </div>
        <div>
          <label style={labelStyle}>Laytime (days)</label>
          <input style={inputStyle} type="number" value={form.laytime} onChange={e => setForm({...form, laytime: Number(e.target.value)})} />
        </div>
        <div>
          <label style={labelStyle}>Demurrage Rate ($/day)</label>
          <input style={inputStyle} type="number" value={form.demurrage_usd_day} onChange={e => setForm({...form, demurrage_usd_day: Number(e.target.value)})} />
        </div>
        <div>
          <label style={labelStyle}>Dispatch ($/day)</label>
          <input style={inputStyle} type="number" value={form.dispatch_usd_day} onChange={e => setForm({...form, dispatch_usd_day: Number(e.target.value)})} />
        </div>
        <div>
          <label style={labelStyle}>Month</label>
          <select style={inputStyle} value={form.month} onChange={e => setForm({...form, month: e.target.value})}>
            {['January','February','March','April','May','June','July','August','September','October','November','December'].map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
      </div>

      <button onClick={() => mutation.mutate()} style={buttonStyle} disabled={mutation.isLoading}>
        {mutation.isLoading ? 'Running Monte Carlo (5000 iterations)...' : 'Run Simulation'}
      </button>

      {mutation.data && (
        <div style={{ marginTop: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            <div style={cardStyle}>
              <span style={{ color: '#8B8FA3', fontSize: 12 }}>P(Demurrage)</span>
              <span style={{ color: '#DC2626', fontSize: 32, fontWeight: 700 }}>{(mutation.data.p_demurrage * 100).toFixed(1)}%</span>
            </div>
            <div style={cardStyle}>
              <span style={{ color: '#8B8FA3', fontSize: 12 }}>Expected Cost</span>
              <span style={{ color: '#F59E0B', fontSize: 32, fontWeight: 700 }}>${mutation.data.expected_cost_usd.toLocaleString()}</span>
            </div>
            <div style={cardStyle}>
              <span style={{ color: '#8B8FA3', fontSize: 12 }}>P10 / P50 / P90</span>
              <span style={{ color: '#EDE6D6', fontSize: 20, fontWeight: 700 }}>
                ${mutation.data.p10_cost_usd.toLocaleString()} / ${mutation.data.p50_cost_usd.toLocaleString()} / ${mutation.data.p90_cost_usd.toLocaleString()}
              </span>
            </div>
            <div style={cardStyle}>
              <span style={{ color: '#8B8FA3', fontSize: 12 }}>Dispatch Earned</span>
              <span style={{ color: '#10B981', fontSize: 32, fontWeight: 700 }}>${mutation.data.dispatch_earned_usd.toLocaleString()}</span>
            </div>
          </div>

          <div style={{ ...cardStyle, marginTop: 16 }}>
            <h3 style={{ color: '#EDE6D6', marginBottom: 12 }}>Driver Attribution</h3>
            {mutation.data.driver_attribution.map((d, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ color: '#EDE6D6' }}>{d.driver}: {d.details}</span>
                <span style={{ color: '#DC2626' }}>{(d.contribution * 100).toFixed(1)}%</span>
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
const buttonStyle: React.CSSProperties = { background: '#DC2626', color: '#EDE6D6', border: 'none', borderRadius: 14, padding: '12px 32px', fontSize: 16, cursor: 'pointer', fontWeight: 700, width: '100%' }
const cardStyle: React.CSSProperties = { background: '#12141C', border: '1px solid rgba(220,38,38,0.35)', borderRadius: 14, padding: 20, display: 'flex', flexDirection: 'column', gap: 8 }