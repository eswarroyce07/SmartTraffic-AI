import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { dashboardAPI } from '../api'
import AppLayout from '../components/common/AppLayout'
import { StatCard, Card, Spinner, EmptyState, PageHeader, Button, tooltipStyle, tooltipLabelStyle, tooltipItemStyle } from '../components/common/UI'
import { MdTraffic, MdSpeed, MdWarning, MdAnalytics, MdModelTraining, MdCheckCircle } from 'react-icons/md'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area, CartesianGrid,
} from 'recharts'

const CONGESTION_COLORS = { low: '#22c55e', medium: '#f59e0b', high: '#ef4444', critical: '#dc2626' }
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function DashboardPage() {
  const [stats, setStats] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.allSettled([dashboardAPI.stats(), dashboardAPI.analytics()])
      .then(([s, a]) => {
        if (s.status === 'fulfilled') setStats(s.value.data)
        if (a.status === 'fulfilled') setAnalytics(a.value.data)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <AppLayout title="Dashboard"><div style={{ display: 'flex', justifyContent: 'center', marginTop: 80 }}><Spinner size={36} /></div></AppLayout>

  const s = stats || {}
  const a = analytics || {}
  const congestionPie = Object.entries(s.congestion_distribution || {}).filter(([, v]) => v > 0).map(([name, value]) => ({ name, value }))
  const hourlyData = (a.hourly_distribution || []).map(d => ({ hour: `${d._id}h`, count: d.count, speed: d.avg_speed }))
  const dailyData = (a.daily_distribution || []).map(d => ({ day: DAYS[d._id] ?? d._id, count: d.count }))
  const hasData = s.total_records > 0

  return (
    <AppLayout title="Dashboard">
      <PageHeader
        title="Traffic Intelligence Dashboard"
        subtitle="Real-time urban traffic monitoring and analytics"
        actions={
          <Link to="/prediction">
            <Button variant="primary" size="sm"><MdModelTraining size={14} /> Run Prediction</Button>
          </Link>
        }
      />

      {/* KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: 24 }}>
        <StatCard title="Traffic Records" value={s.total_records?.toLocaleString() ?? '0'} subtitle="Total data points" icon={MdTraffic} color="blue" />
        <StatCard title="Avg Speed" value={`${s.average_speed_kmh ?? 0} km/h`} subtitle="Across all zones" icon={MdSpeed} color="green" />
        <StatCard title="ML Predictions" value={s.total_predictions?.toLocaleString() ?? '0'} subtitle="Congestion forecasts" icon={MdAnalytics} color="purple" />
        <StatCard title="Active Zones" value={s.active_congestion_zones ?? 0} subtitle="High/critical areas" icon={MdWarning} color="red" />
        <StatCard title="Model Accuracy" value={s.model_accuracy ? `${(s.model_accuracy * 100).toFixed(1)}%` : 'N/A'} subtitle={s.model_accuracy ? 'Best model score' : 'Train model first'} icon={MdCheckCircle} color="green" />
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        <Card>
          <p style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-1)', marginBottom: 18 }}>Hourly Traffic Volume</p>
          {hourlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={hourlyData}>
                <defs>
                  <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="hour" tick={{ fill: '#4a6080', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#4a6080', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} labelStyle={tooltipLabelStyle} itemStyle={tooltipItemStyle} />
                <Area type="monotone" dataKey="count" stroke="#3b82f6" fill="url(#blueGrad)" strokeWidth={2} dot={false} name="Vehicles" />
              </AreaChart>
            </ResponsiveContainer>
          ) : <EmptyState icon={MdAnalytics} title="No hourly data" description="Add traffic records to see patterns" />}
        </Card>

        <Card>
          <p style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-1)', marginBottom: 18 }}>Congestion Distribution</p>
          {congestionPie.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={congestionPie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={40}>
                  {congestionPie.map(entry => <Cell key={entry.name} fill={CONGESTION_COLORS[entry.name] || '#94a3b8'} />)}
                </Pie>
                <Legend formatter={v => <span style={{ color: '#8ba3c7', fontSize: 12, textTransform: 'capitalize' }}>{v}</span>} />
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          ) : <EmptyState icon={MdWarning} title="No congestion data" description="Upload a dataset to populate this chart" />}
        </Card>
      </div>

      <Card>
        <p style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-1)', marginBottom: 18 }}>Weekly Traffic Pattern</p>
        {dailyData.length > 0 ? (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={dailyData} barSize={30}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="day" tick={{ fill: '#4a6080', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#4a6080', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} labelStyle={tooltipLabelStyle} itemStyle={tooltipItemStyle} />
              <Bar dataKey="count" fill="#22c55e" radius={[5, 5, 0, 0]} name="Records" />
            </BarChart>
          </ResponsiveContainer>
        ) : <EmptyState icon={MdAnalytics} title="No weekly data" description="Upload a dataset to see weekly patterns" />}
      </Card>

      {!hasData && (
        <Card style={{ marginTop: 20, background: 'linear-gradient(135deg, rgba(59,130,246,0.06), rgba(139,92,246,0.06))', border: '1px solid rgba(59,130,246,0.15)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
            <div style={{ fontSize: 28, flexShrink: 0 }}>🚀</div>
            <div>
              <p style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-1)', marginBottom: 10 }}>Get Started in 3 Steps</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  <span>1. Go to <Link to="/prediction" style={{ color: '#60a5fa', fontWeight: 600, textDecoration: 'none' }}>Prediction</Link> → click <strong style={{ color: 'var(--text-1)' }}>Train Model</strong> to train the ML pipeline on synthetic data.</span>,
                  <span>2. Go to <Link to="/upload" style={{ color: '#60a5fa', fontWeight: 600, textDecoration: 'none' }}>Data Upload</Link> to upload a CSV dataset and populate the analytics charts.</span>,
                  <span>3. Use <Link to="/route" style={{ color: '#60a5fa', fontWeight: 600, textDecoration: 'none' }}>Route Optimizer</Link> to find optimal paths using Dijkstra or A* algorithms.</span>,
                ].map((step, i) => (
                  <p key={i} style={{ fontSize: 13.5, color: 'var(--text-2)' }}>{step}</p>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}
    </AppLayout>
  )
}
