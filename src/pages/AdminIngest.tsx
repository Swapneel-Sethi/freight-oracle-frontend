import React, { useState } from 'react'
import { useMutation } from '@tanstack/react-query'

export default function AdminIngest() {
  const [apiKey, setApiKey] = useState('')
  const [result, setResult] = useState<any>(null)

  const bootstrapMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/v1/ingest/admin-bootstrap', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-API-Key': apiKey,
        },
      })
      return res.json()
    },
    onSuccess: (data) => setResult(data),
    onError: (err: any) => setResult({ error: err.message }),
  })

  return (
    <div style={{ padding: '80px 24px', maxWidth: 1200, margin: '0 auto' }}>
      <h1 style={{ color: '#EDE6D6', fontSize: 28, marginBottom: 24 }}>Admin / Ingest</h1>
      
      <div style={{ background: '#12141C', border: '1px solid rgba(220,38,38,0.35)', borderRadius: 14, padding: 24 }}>
        <h3 style={{ color: '#EDE6D6', marginBottom: 16 }}>Full Database Bootstrap</h3>
        
        <div style={{ marginBottom: 16 }}>
          <label style={{ color: '#8B8FA3', fontSize: 12, display: 'block', marginBottom: 4 }}>API Key</label>
          <input
            type="password"
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
            placeholder="Enter API key"
            style={{ width: '100%', background: '#0B0E1A', color: '#EDE6D6', border: '1px solid rgba(220,38,38,0.35)', borderRadius: 14, padding: '10px', fontSize: 14 }}
          />
        </div>

        <button onClick={() => bootstrapMutation.mutate()} style={{ ...buttonStyle, marginBottom: 16 }} disabled={bootstrapMutation.isLoading}>
          {bootstrapMutation.isLoading ? 'Bootstrapping...' : '[DB] Bootstrap Database'}
        </button>

        {result && (
          <div style={{ background: '#0B0E1A', borderRadius: 14, padding: 16, marginTop: 16 }}>
            <pre style={{ color: '#EDE6D6', fontSize: 13, overflow: 'auto' }}>
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        <div style={{ marginTop: 24 }}>
          <h3 style={{ color: '#EDE6D6', marginBottom: 12 }}>Sample cURL Commands</h3>
          <div style={{ background: '#0B0E1A', borderRadius: 14, padding: 16 }}>
            <code style={{ color: '#8B8FA3', fontSize: 12 }}>
{`# Bootstrap demo data
curl -X POST http://localhost:8000/api/v1/ingest/admin-bootstrap \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: ${apiKey}"

# Ingest freight observations
curl -X POST http://localhost:8000/api/v1/ingest/freight \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: ${apiKey}" \\
  -d '[{"date":"2024-01-01","load_unlocode":"AUNTL","disch_unlocode":"INPDD","commodity":"THERMAL_COAL","vessel_class":"CAPESIZE","rate_usd_t":28.5,"source":"demo"}]'

# Ingest bunker prices
curl -X POST http://localhost:8000/api/v1/ingest/bunker \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: ${apiKey}" \\
  -d '[{"port_unlocode":"INPDD","date":"2024-01-01","vlsfo_usd_t":550,"mgo_usd_t":730}]'

# Generate forecast
curl -X POST http://localhost:8000/api/v1/models/forecast \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: ${apiKey}" \\
  -d '{"route":"AUNTL->INPDD","commodity":"THERMAL_COAL","vessel_class":"CAPESIZE","horizon_days":90}'

# Run scenario optimization
curl -X POST http://localhost:8000/api/v1/scenario/optimize \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: ${apiKey}" \\
  -d '{"load_unlocode":"AUNTL","disch_unlocode":"INPDD","commodity":"THERMAL_COAL","cargo_t":150000,"candidate_classes":["CAPESIZE","PANAMAX"]}'`}
            </code>
          </div>
        </div>
      </div>
    </div>
  )
}

const buttonStyle: React.CSSProperties = { background: '#DC2626', color: '#EDE6D6', border: 'none', borderRadius: 14, padding: '14px 32px', fontSize: 16, cursor: 'pointer', fontWeight: 700, width: '100%' }