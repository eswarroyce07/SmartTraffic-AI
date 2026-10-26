import { useState, useEffect } from 'react'
import AppLayout from '../components/common/AppLayout'
import { Card, Button, Select, PageHeader, Badge } from '../components/common/UI'
import { routeAPI } from '../api'
import toast from 'react-hot-toast'
import { MdAltRoute, MdTimer, MdStraighten, MdSwapVert, MdLocationOn, MdInfo } from 'react-icons/md'

const ALGO_INFO = {
  dijkstra: { label: 'Dijkstra', color: '#3b82f6', desc: 'Guaranteed shortest path by cumulative weight. Explores all nodes systematically.' },
  astar:    { label: 'A* Search', color: '#8b5cf6', desc: 'Heuristic-guided search using Haversine distance. Faster on large graphs.' },
}

export default function RoutePage() {
  const [locations, setLocations] = useState([])
  const [form, setForm] = useState({ source: '', destination: '', algorithm: 'dijkstra', optimize_for: 'time' })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    routeAPI.locations().then(({ data }) => {
      const locs = data.locations || []
      setLocations(locs)
      if (locs.length >= 2) setForm(p => ({ ...p, source: locs[0], destination: locs[1] }))
    }).catch(() => {})
  }, [])

  const swap = () => setForm(p => ({ ...p, source: p.destination, destination: p.source }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.source === form.destination) return toast.error('Source and destination must differ')
    setLoading(true)
    try {
      const { data } = await routeAPI.optimize(form)
      setResult(data)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Route optimization failed')
    } finally { setLoading(false) }
  }

  return (
    <AppLayout title="Route Optimizer">
      <PageHeader
        title="Intelligent Route Optimization"
        subtitle="Dijkstra & A* graph algorithms with real-time traffic weights"
      />

      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 24 }}>
        {/* Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card>
            <p style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-1)', marginBottom: 18 }}>Route Parameters</p>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ position: 'relative' }}>
                <Select label="Source" value={form.source} onChange={e => setForm(p => ({ ...p, source: e.target.value }))}>
                  {locations.map(l => <option key={l}>{l}</option>)}
                </Select>
                <button type="button" onClick={swap} style={{
                  position: 'absolute', right: 0, top: 22, padding: '6px', borderRadius: 7,
                  background: 'var(--accent-dim)', border: '1px solid var(--accent-border)',
                  color: 'var(--accent)', cursor: 'pointer',
                }} title="Swap">
                  <MdSwapVert size={16} />
                </button>
              </div>
              <Select label="Destination" value={form.destination} onChange={e => setForm(p => ({ ...p, destination: e.target.value }))}>
                {locations.map(l => <option key={l}>{l}</option>)}
              </Select>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <Select label="Algorithm" value={form.algorithm} onChange={e => setForm(p => ({ ...p, algorithm: e.target.value }))}>
                  <option value="dijkstra">Dijkstra</option>
                  <option value="astar">A* (A-Star)</option>
                </Select>
                <Select label="Optimize For" value={form.optimize_for} onChange={e => setForm(p => ({ ...p, optimize_for: e.target.value }))}>
                  <option value="time">Travel Time</option>
                  <option value="distance">Distance</option>
                </Select>
              </div>

              <div style={{ padding: '10px 14px', borderRadius: 9, background: 'var(--accent-dim)', border: '1px solid var(--accent-border)', fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.6 }}>
                <span style={{ color: '#60a5fa', fontWeight: 700 }}>{ALGO_INFO[form.algorithm]?.label}: </span>
                {ALGO_INFO[form.algorithm]?.desc}
              </div>

              <Button type="submit" variant="primary" loading={loading} style={{ width: '100%', padding: '11px' }}>
                <MdAltRoute size={16} /> {loading ? 'Optimizing...' : 'Find Optimal Route'}
              </Button>
            </form>
          </Card>

          {/* Algorithm comparison */}
          <Card>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 14 }}>Algorithm Comparison</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {Object.entries(ALGO_INFO).map(([key, info]) => (
                <div key={key} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px',
                  borderRadius: 9, border: `1px solid ${key === form.algorithm ? `${info.color}30` : 'var(--border)'}`,
                  background: key === form.algorithm ? `${info.color}08` : 'transparent',
                  transition: 'all 0.15s',
                }}>
                  <div style={{ width: 28, height: 28, borderRadius: 7, background: `${info.color}18`, border: `1px solid ${info.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: info.color, flexShrink: 0 }}>
                    {key === 'dijkstra' ? 'D' : 'A*'}
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)', marginBottom: 3 }}>{info.label}</p>
                    <p style={{ fontSize: 12, color: 'var(--text-3)', lineHeight: 1.5 }}>{info.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Results */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {result ? (
            <>
              {/* Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                {[
                  { icon: MdStraighten, value: result.total_distance_km, unit: 'km', label: 'Total Distance', color: '#3b82f6' },
                  { icon: MdTimer, value: result.estimated_time_minutes, unit: 'min', label: 'Travel Time', color: '#22c55e' },
                  { icon: MdAltRoute, value: result.path.length - 1, unit: 'hops', label: 'Route Segments', color: '#f59e0b' },
                ].map(({ icon: Icon, value, unit, label, color }) => (
                  <Card key={label} style={{ textAlign: 'center' }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}18`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', color }}>
                      <Icon size={20} />
                    </div>
                    <p style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-0.02em', lineHeight: 1 }}>{value}</p>
                    <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4 }}>{unit} · {label}</p>
                  </Card>
                ))}
              </div>

              {/* Path */}
              <Card>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                  <p style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-1)' }}>Optimal Route</p>
                  <Badge color="blue">{result.algorithm?.toUpperCase()}</Badge>
                </div>
                <div>
                  {result.path.map((node, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'stretch', gap: 14 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 20, flexShrink: 0 }}>
                        <div style={{
                          width: 12, height: 12, borderRadius: '50%', flexShrink: 0, marginTop: 4,
                          border: `2px solid ${i === 0 ? '#22c55e' : i === result.path.length - 1 ? '#ef4444' : '#3b82f6'}`,
                          background: (i === 0 || i === result.path.length - 1) ? (i === 0 ? '#22c55e' : '#ef4444') : 'transparent',
                        }} />
                        {i < result.path.length - 1 && (
                          <div style={{ width: 2, flex: 1, background: 'var(--border)', margin: '4px 0', minHeight: 24 }} />
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: i < result.path.length - 1 ? 0 : 0, minHeight: 36 }}>
                        <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-1)' }}>{node}</span>
                        {i === 0 && <Badge color="green">Start</Badge>}
                        {i === result.path.length - 1 && <Badge color="red">End</Badge>}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {result.alternative_routes?.length > 0 && (
                <Card>
                  <p style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-1)', marginBottom: 14 }}>Alternative Route</p>
                  {result.alternative_routes.map((alt, i) => (
                    <div key={i} style={{ padding: '14px', borderRadius: 10, background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                        <Badge color="yellow">{alt.algorithm?.toUpperCase()}</Badge>
                        <span style={{ fontSize: 12.5, color: 'var(--text-2)', fontWeight: 600 }}>
                          {alt.total_distance_km} km · {alt.estimated_time_minutes} min
                        </span>
                      </div>
                      <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6 }}>{alt.path.join(' → ')}</p>
                    </div>
                  ))}
                </Card>
              )}
            </>
          ) : (
            <Card style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
              <div style={{ textAlign: 'center' }}>
                <MdAltRoute size={60} style={{ color: 'var(--text-3)', marginBottom: 16, opacity: 0.3 }} />
                <p style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-1)', marginBottom: 8 }}>No Route Yet</p>
                <p style={{ fontSize: 13.5, color: 'var(--text-2)', maxWidth: 280 }}>Select source and destination, choose an algorithm, then click Find Optimal Route.</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
