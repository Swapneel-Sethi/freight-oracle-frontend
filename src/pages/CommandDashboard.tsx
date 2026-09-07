import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { LineChart, Line, AreaChart, Area, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts'

interface DashboardData {
  total_ports: number
  total_vessels: number
  total_routes: number
  avg_q50_rate: number
  bunker_vlsfo: number
  bunker_mgo: number
  overhang_score: number
}

export default function CommandDashboard() {
  const { data, isLoading } = useQuery<DashboardData>({
    queryKey: ['dashboard'],
    queryFn: () => fetch('/api/v1/dashboard/summary').then(r => r.json()),
    refetchInterval: 30000,
  })

  // Rate history chart data (simulated for demo)
  const rateHistory = [
    { date: '2024-01', rate: 22.5 },
    { date: '2024-02', rate: 23.1 },
    { date: '2024-03', rate: 21.8 },
    { date: '2024-04', rate: 24.2 },
    { date: '2024-05', rate: 26.5 },
    { date: '2024-06', rate: 28.3 },
    { date: '2024-07', rate: 27.1 },
    { date: '2024-08', rate: 25.8 },
    { date: '2024-09', rate: 29.4 },
    { date: '2024-10', rate: 32.1 },
    { date: '2024-11', rate: 35.6 },
    { date: '2024-12', rate: 31.2 },
  ]

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Command Dashboard</h1>
      
      <div style={styles.kpiGrid}>
        <KPICard label="Avg Freight Q50" value={`$${data?.avg_q50_rate?.toFixed(2) ?? '--'}`} unit="USD/t" trend="+4.2%" />
        <KPICard label="Total Ports" value={data?.total_ports ?? '--'} unit="East Coast India" />
        <KPICard label="Total Vessels" value={data?.total_vessels ?? '--'} unit="Fleet" />
        <KPICard label="Routes" value={data?.total_routes ?? '--'} unit="Flagship" />
        <KPICard label="VLSFO Bunker" value={`$${data?.bunker_vlsfo?.toFixed(0) ?? '--'}`} unit="USD/t" />
        <KPICard label="Overhang Score" value={data?.overhang_score?.toFixed(1) ?? '--'} unit="/100" />
      </div>

      <div style={styles.chartsRow}>
        <div style={styles.chartBox}>
          <h3 style={styles.chartTitle}>Freight Rate Trend (Q50)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={rateHistory}>
              <defs>
                <linearGradient id="rateGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#DC2626" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#DC2626" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" stroke="#8B8FA3" fontSize={11} />
              <YAxis stroke="#8B8FA3" fontSize={11} />
              <Tooltip contentStyle={{ background: '#12141C', border: '1px solid rgba(220,38,38,0.35)', color: '#EDE6D6' }} />
              <Area type="monotone" dataKey="rate" stroke="#DC2626" fill="url(#rateGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div style={styles.chartBox}>
          <h3 style={styles.chartTitle}>Vessel Distribution by Class</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={[
              { class: 'Handysize', count: 50 },
              { class: 'Supramax', count: 60 },
              { class: 'Ultramax', count: 30 },
              { class: 'Panamax', count: 40 },
              { class: 'Capesize', count: 20 },
            ]}>
              <XAxis dataKey="class" stroke="#8B8FA3" fontSize={11} />
              <YAxis stroke="#8B8FA3" fontSize={11} />
              <Tooltip contentStyle={{ background: '#12141C', border: '1px solid rgba(220,38,38,0.35)', color: '#EDE6D6' }} />
              <Bar dataKey="count" fill="#F59E0B" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

function KPICard({ label, value, unit, trend }: { label: string; value: string; unit: string; trend?: string }) {
  return (
    <div style={styles.kpiCard}>
      <span style={styles.kpiLabel}>{label}</span>
      <span style={styles.kpiValue}>{value}</span>
      <span style={styles.kpiUnit}>{unit}</span>
      {trend && <span style={styles.kpiTrend}>{trend}</span>}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: { padding: '80px 24px 24px', maxWidth: 1200, margin: '0 auto' },
  title: { color: '#EDE6D6', fontSize: 28, fontWeight: 700, marginBottom: 24 },
  kpiGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 32 },
  kpiCard: { background: '#12141C', border: '1px solid rgba(220,38,38,0.35)', borderRadius: 14, padding: '20px', display: 'flex', flexDirection: 'column' },
  kpiLabel: { color: '#8B8FA3', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 },
  kpiValue: { color: '#F59E0B', fontSize: 28, fontWeight: 700 },
  kpiUnit: { color: '#8B8FA3', fontSize: 11 },
  kpiTrend: { color: '#10B981', fontSize: 12 },
  chartsRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 },
  chartBox: { background: '#12141C', border: '1px solid rgba(220,38,38,0.35)', borderRadius: 14, padding: 20 },
  chartTitle: { color: '#EDE6D6', fontSize: 16, marginBottom: 16 },
}