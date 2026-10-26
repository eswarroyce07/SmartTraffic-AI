import { useEffect, useState } from 'react'
import AppLayout from '../components/common/AppLayout'
import { Card, CongestionBadge, Spinner, Button, EmptyState, PageHeader, Input, Select } from '../components/common/UI'
import { trafficAPI } from '../api'
import toast from 'react-hot-toast'
import { MdTraffic, MdRefresh, MdSearch, MdAdd, MdClose } from 'react-icons/md'

const LOCATIONS = ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli', 'Vellore', 'Erode', 'Thoothukudi', 'Dindigul', 'Thanjavur', 'Kanchipuram', 'Tiruppur', 'Hosur', 'Nagercoil', 'Kumbakonam', 'Cuddalore', 'Namakkal', 'Karur']
const WEATHER = ['clear', 'rain', 'fog', 'snow', 'cloudy']
const ROAD_TYPES = ['urban', 'highway', 'residential', 'arterial']
const CONGESTION_LEVELS = ['low', 'medium', 'high', 'critical']

const defaultRecord = {
  location: 'Chennai', latitude: 13.0827, longitude: 80.2707,
  timestamp: new Date().toISOString().slice(0, 16),
  vehicle_count: 300, average_speed: 40, congestion_level: 'medium',
  weather_condition: 'clear', road_type: 'urban', incident: false,
}

export default function TrafficPage() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterLevel, setFilterLevel] = useState('all')
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState(defaultRecord)
  const [adding, setAdding] = useState(false)

  const load = () => {
    setLoading(true)
    trafficAPI.list(200).then(({ data }) => setRecords(Array.isArray(data) ? data : [])).catch(() => toast.error('Failed to load')).finally(() => setLoading(false))
  }
  useEffect(load, [])

  const handleAdd = async (e) => {
    e.preventDefault()
    setAdding(true)
    try {
      await trafficAPI.add({ ...form, timestamp: new Date(form.timestamp).toISOString(), vehicle_count: +form.vehicle_count, average_speed: +form.average_speed, latitude: +form.latitude, longitude: +form.longitude })
      toast.success('Record added')
      setShowAdd(false)
      setForm(defaultRecord)
      load()
    } catch (err) { toast.error(err.response?.data?.detail || 'Failed to add record') }
    finally { setAdding(false) }
  }

  const filtered = records.filter(r => {
    const matchSearch = !search || r.location?.toLowerCase().includes(search.toLowerCase())
    const matchLevel = filterLevel === 'all' || r.congestion_level === filterLevel
    return matchSearch && matchLevel
  })

  const COLS = ['Location', 'Timestamp', 'Vehicles', 'Avg Speed', 'Congestion', 'Weather', 'Road Type']

  return (
    <AppLayout title="Traffic Data">
      <PageHeader
        title="Traffic Records"
        subtitle={`${records.length} total records in the system`}
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="ghost" size="sm" onClick={load}><MdRefresh size={14} /> Refresh</Button>
            <Button variant="primary" size="sm" onClick={() => setShowAdd(true)}><MdAdd size={14} /> Add Record</Button>
          </div>
        }
      />

      {/* Modal */}
      {showAdd && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}>
          <div style={{ width: '100%', maxWidth: 560, borderRadius: 18, padding: '28px', background: 'var(--bg-surface)', border: '1px solid var(--border-strong)', boxShadow: 'var(--shadow-lg)' }} className="anim-fade-up">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
              <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-1)' }}>Add Traffic Record</p>
              <button onClick={() => setShowAdd(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: 4 }}><MdClose size={20} /></button>
            </div>
            <form onSubmit={handleAdd} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Select label="Location" value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))}>{LOCATIONS.map(l => <option key={l}>{l}</option>)}</Select>
              <Select label="Congestion" value={form.congestion_level} onChange={e => setForm(p => ({ ...p, congestion_level: e.target.value }))}>{CONGESTION_LEVELS.map(l => <option key={l}>{l}</option>)}</Select>
              <Select label="Weather" value={form.weather_condition} onChange={e => setForm(p => ({ ...p, weather_condition: e.target.value }))}>{WEATHER.map(w => <option key={w}>{w}</option>)}</Select>
              <Select label="Road Type" value={form.road_type} onChange={e => setForm(p => ({ ...p, road_type: e.target.value }))}>{ROAD_TYPES.map(r => <option key={r}>{r}</option>)}</Select>
              <Input label="Vehicle Count" type="number" value={form.vehicle_count} onChange={e => setForm(p => ({ ...p, vehicle_count: e.target.value }))} />
              <Input label="Avg Speed (km/h)" type="number" value={form.average_speed} onChange={e => setForm(p => ({ ...p, average_speed: e.target.value }))} />
              <Input label="Latitude" type="number" step="0.0001" value={form.latitude} onChange={e => setForm(p => ({ ...p, latitude: e.target.value }))} />
              <Input label="Longitude" type="number" step="0.0001" value={form.longitude} onChange={e => setForm(p => ({ ...p, longitude: e.target.value }))} />
              <div style={{ gridColumn: '1 / -1' }}>
                <Input label="Timestamp" type="datetime-local" value={form.timestamp} onChange={e => setForm(p => ({ ...p, timestamp: e.target.value }))} />
              </div>
              <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 10, marginTop: 4 }}>
                <Button type="button" variant="ghost" style={{ flex: 1, padding: '10px' }} onClick={() => setShowAdd(false)}>Cancel</Button>
                <Button type="submit" variant="primary" style={{ flex: 1, padding: '10px' }} loading={adding}>Add Record</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Card noPad>
        {/* Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <MdSearch size={15} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)', pointerEvents: 'none' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by location..."
              style={{ width: '100%', padding: '8px 12px 8px 34px', borderRadius: 8, background: 'var(--bg-input)', border: '1px solid var(--border-strong)', color: 'var(--text-1)', fontSize: 13.5 }} />
          </div>
          <select value={filterLevel} onChange={e => setFilterLevel(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: 8, background: 'var(--bg-input)', border: '1px solid var(--border-strong)', color: 'var(--text-1)', fontSize: 13.5, cursor: 'pointer' }}>
            <option value="all">All Levels</option>
            {CONGESTION_LEVELS.map(l => <option key={l} value={l} style={{ textTransform: 'capitalize' }}>{l}</option>)}
          </select>
          <span style={{ fontSize: 12.5, color: 'var(--text-3)', whiteSpace: 'nowrap' }}>{filtered.length} of {records.length}</span>
        </div>

        {loading ? <Spinner /> : filtered.length === 0 ? (
          <EmptyState icon={MdTraffic} title="No traffic records" description="Add records manually or upload a CSV dataset to populate this table." />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {COLS.map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '12px 16px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-3)', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => (
                  <tr key={r.id || i} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'background 0.1s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '13px 16px', fontWeight: 600, color: 'var(--text-1)', fontSize: 13.5 }}>{r.location}</td>
                    <td style={{ padding: '13px 16px', color: 'var(--text-2)', fontSize: 13, whiteSpace: 'nowrap' }}>{r.timestamp ? new Date(r.timestamp).toLocaleString() : '—'}</td>
                    <td style={{ padding: '13px 16px', fontWeight: 600, color: 'var(--text-1)', fontSize: 13.5 }}>{r.vehicle_count?.toLocaleString()}</td>
                    <td style={{ padding: '13px 16px', color: 'var(--text-1)', fontSize: 13.5 }}>{r.average_speed} km/h</td>
                    <td style={{ padding: '13px 16px' }}><CongestionBadge level={r.congestion_level} /></td>
                    <td style={{ padding: '13px 16px', color: 'var(--text-2)', fontSize: 13, textTransform: 'capitalize' }}>{r.weather_condition || '—'}</td>
                    <td style={{ padding: '13px 16px', color: 'var(--text-2)', fontSize: 13, textTransform: 'capitalize' }}>{r.road_type || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </AppLayout>
  )
}
