import { useEffect, useState } from 'react'
import AppLayout from '../components/common/AppLayout'
import { Card, Spinner, StatCard, PageHeader, tooltipStyle, tooltipLabelStyle, tooltipItemStyle } from '../components/common/UI'
import { dashboardAPI } from '../api'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, LineChart, Line,
} from 'recharts'
import { MdTrendingUp, MdAccessTime, MdCalendarToday, MdAnalytics } from 'react-icons/md'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const EmptyChart = () => (
  <div style={{ height: 240, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
    <MdAnalytics size={36} style={{ color: 'var(--text-3)', opacity: 0.4 }} />
    <p style={{ fontSize: 13, color: 'var(--text-3)' }}>No data yet — upload a dataset first</p>
  </div>
)

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    dashboardAPI.analytics().then(({ data }) => setAnalytics(data)).catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) return <AppLayout title="Analytics"><div style={{ display: 'flex', justifyContent: 'center', marginTop: 80 }}><Spinner size={36} /></div></AppLayout>

  const hourly = (analytics?.hourly_distribution || []).map(d => ({ hour: `${d._id}h`, count: d.count, speed: +(d.avg_speed || 0).toFixed(1) }))
  const daily  = (analytics?.daily_distribution  || []).map(d => ({ day: DAYS[d._id] || String(d._id), count: d.count }))

  const peakHour   = hourly.length > 0 ? hourly.reduce((a, b) => a.count > b.count ? a : b).hour : '—'
  const busiestDay = daily.length  > 0 ? daily.reduce((a, b)  => a.count > b.count ? a : b).day  : '—'
  const avgSpeed   = hourly.length > 0 ? (hourly.reduce((s, d) => s + d.speed, 0) / hourly.length).toFixed(1) : 0

  return (
    <AppLayout title="Analytics">
      <PageHeader title="Traffic Analytics" subtitle="Hourly patterns, weekly trends, and speed analysis" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <StatCard title="Peak Hour"        value={peakHour}   subtitle="Highest traffic volume"  icon={MdAccessTime}   color="red"    />
        <StatCard title="Busiest Day"      value={busiestDay} subtitle="Most traffic activity"   icon={MdCalendarToday} color="yellow" />
        <StatCard title="Total Predictions" value={(analytics?.total_predictions || 0).toLocaleString()} subtitle="ML forecasts made" icon={MdAnalytics} color="purple" />
        <StatCard title="Avg Speed"        value={`${avgSpeed} km/h`} subtitle="Across all hours" icon={MdTrendingUp}  color="green"  />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        <Card>
          <p style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-1)', marginBottom: 18 }}>Hourly Traffic Volume</p>
          {hourly.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={hourly}>
                <defs>
                  <linearGradient id="blueG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="hour" tick={{ fill: '#4a6080', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#4a6080', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} labelStyle={tooltipLabelStyle} itemStyle={tooltipItemStyle} />
                <Area type="monotone" dataKey="count" stroke="#3b82f6" fill="url(#blueG)" strokeWidth={2} dot={false} name="Vehicles" />
              </AreaChart>
            </ResponsiveContainer>
          ) : <EmptyChart />}
        </Card>

        <Card>
          <p style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-1)', marginBottom: 18 }}>Average Speed by Hour</p>
          {hourly.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={hourly}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="hour" tick={{ fill: '#4a6080', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#4a6080', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} labelStyle={tooltipLabelStyle} itemStyle={tooltipItemStyle} formatter={v => [`${v} km/h`, 'Avg Speed']} />
                <Line type="monotone" dataKey="speed" stroke="#22c55e" strokeWidth={2.5} dot={false} name="Speed" />
              </LineChart>
            </ResponsiveContainer>
          ) : <EmptyChart />}
        </Card>
      </div>

      <Card>
        <p style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-1)', marginBottom: 18 }}>Weekly Traffic Distribution</p>
        {daily.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={daily} barSize={34}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="day" tick={{ fill: '#4a6080', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#4a6080', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} labelStyle={tooltipLabelStyle} itemStyle={tooltipItemStyle} />
              <Bar dataKey="count" fill="#f59e0b" radius={[5, 5, 0, 0]} name="Records" />
            </BarChart>
          </ResponsiveContainer>
        ) : <EmptyChart />}
      </Card>
    </AppLayout>
  )
}
