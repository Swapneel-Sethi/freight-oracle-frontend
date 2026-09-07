import React, { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'

interface OptimizeOption {
  vessel_class: string
  feasible: boolean
  failing_constraint?: string
  freight_usd_t: number
  total_cost_usd: number
  total_days: number
  etas: string[]
}

export default function ScenarioOptimizer() {
  const [form, setForm] = useState({
    load: 'AUNTL',
    disch: 'INPDD',
    commodity: 'THERMAL_COAL',
    cargo_t: 150000,
    classes: ['CAPESIZE', 'PANAMAX', 'SUPRAMAX'],
  })

  const { data, isLoading } = useQuery({
    queryKey: ['optimize', form],
    queryFn: async () => {
      const res = await fetch('/api/v1/scenario/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      return res.json()
    },
    refetchInterval: 30000,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
  }

  return (
    <div style={{ padding: '80px 24px', maxWidth: 1200, margin: '0 auto' }}>
      <h1 style={{ color: '#EDE6D6', fontSize: 28, marginBottom: 24 }}>Scenario Optimizer</h1>
      
      <form onSubmit={handleSubmit} style={{ background: '#12141C', border: '1px solid rgba(220,38,38,0.35)', borderRadius: 14, padding: 24, marginBottom: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          <div>
            <label style={labelStyle}>Load Port</label>
            <select style={inputStyle} value={form.load} onChange={e => setForm({...form, load: e.target.value})}>
              {['AUNTL','ZARCB','AUGLT','AUHPT','AUPHE','IDSAM','IDBPN'].map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Discharge Port</label>
            <select style={inputStyle} value={form.disch} onChange={e => setForm({...form, disch: e.target.value})}>
              {['INPDD','INVIZ','INKAK','INMAA','INENR','INGGV','INGPA','INTUT'].map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Commodity</label>
            <select style={inputStyle} value={form.commodity} onChange={e => setForm({...form, commodity: e.target.value})}>
              <option value="THERMAL_COAL">Thermal Coal</option>
              <option value="COKING_COAL">Coking Coal</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Cargo (tonnes)</label>
            <input style={inputStyle} type="number" value={form.cargo_t} onChange={e => setForm({...form, cargo_t: Number(e.target.value)})} />
          </div>
          <div>
            <label style={labelStyle}>Candidate Classes</label>
            <select style={inputStyle} multiple value={form.classes} onChange={e => {
              const vals = Array.from(e.target.selectedOptions, o => o.value)
              setForm({...form, classes: vals})
            }}>
              {['CAPESIZE','PANAMAX','SUPRAMAX','ULTRAMAX','HANDYSIZE'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <button type="submit" style={buttonStyle}>Optimize</button>
      </form>

      {isLoading && <p style={{ color: '#8B8FA3' }}>Calculating optimal routes...</p>}
      
      {data?.options && (
        <div style={{ display: 'grid', gap: 16 }}>
          <h2 style={{ color: '#EDE6D6' }}>Ranked Options</h2>
          {data.options.map((opt: OptimizeOption, i: number) => (
            <div key={opt.vessel_class} style={{
              background: opt.feasible ? '#12141C' : '#1a0a0a',
              border: `1px solid ${opt.feasible ? 'rgba(220,38,38,0.35)' : '#DC2626'}`,
              borderRadius: 14,
              padding: 20,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#F59E0B', fontWeight: 700, fontSize: 18 }}>{opt.vessel_class}</span>
                <span style={{ color: opt.feasible ? '#10B981' : '#DC2626' }}>
                  {opt.feasible ? '✓ Feasible' : `✗ ${opt.failing_constraint}`}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 24, marginTop: 12, flexWrap: 'wrap' }}>
                <div><span style={{ color: '#8B8FA3' }}>Freight:</span> <span style={{ color: '#EDE6D6' }}>${opt.freight_usd_t.toFixed(2)}/t</span></div>
                <div><span style={{ color: '#8B8FA3' }}>Total Cost:</span> <span style={{ color: '#EDE6D6' }}>${opt.total_cost_usd.toLocaleString()}</span></div>
                <div><span style={{ color: '#8B8FA3' }}>Days:</span> <span style={{ color: '#EDE6D6' }}>{opt.total_days.toFixed(1)}</span></div>
              </div>
              {opt.etas && opt.etas.map((eta, j) => (
                <div key={j} style={{ color: '#8B8FA3', fontSize: 12, marginTop: 4 }}>{eta}</div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const labelStyle: React.CSSProperties = { display: 'block', color: '#8B8FA3', fontSize: 12, marginBottom: 4, textTransform: 'uppercase' }
const inputStyle: React.CSSProperties = { width: '100%', background: '#0B0E1A', color: '#EDE6D6', border: '1px solid rgba(220,38,38,0.35)', borderRadius: 14, padding: '10px', fontSize: 14 }
const buttonStyle: React.CSSProperties = { marginTop: 16, background: '#DC2626', color: '#EDE6D6', border: 'none', borderRadius: 14, padding: '12px 32px', fontSize: 16, cursor: 'pointer', fontWeight: 700 }