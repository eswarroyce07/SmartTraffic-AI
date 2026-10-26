import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup, Polyline, Tooltip as MapTooltip } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import AppLayout from '../components/common/AppLayout'
import { Card, Button, Select, PageHeader } from '../components/common/UI'
import { dashboardAPI, routeAPI } from '../api'
import { NODE_COORDS, TN_CENTER } from '../utils/mapData'
import toast from 'react-hot-toast'
import { MdMap, MdFilterList, MdMyLocation, MdStraighten, MdTimer } from 'react-icons/md'

// All road edges derived from backend CITY_GRAPH (auto-deduped)
const ROAD_EDGES = [
  // Chennai
  ['Chennai','Vellore'],['Chennai','Kanchipuram'],['Chennai','Cuddalore'],
  ['Chennai','Hosur'],['Chennai','Tiruvallur'],['Chennai','Chengalpattu'],['Chennai','Villupuram'],
  // Tiruvallur
  ['Tiruvallur','Vellore'],['Tiruvallur','Ranipet'],
  // Vellore
  ['Vellore','Salem'],['Vellore','Kanchipuram'],['Vellore','Tiruchirappalli'],
  ['Vellore','Ranipet'],['Vellore','Tirupattur'],
  // Ranipet
  ['Ranipet','Kanchipuram'],
  // Tirupattur
  ['Tirupattur','Krishnagiri'],['Tirupattur','Dharmapuri'],
  // Kanchipuram
  ['Kanchipuram','Cuddalore'],['Kanchipuram','Chengalpattu'],
  // Chengalpattu
  ['Chengalpattu','Villupuram'],
  // Cuddalore
  ['Cuddalore','Kumbakonam'],['Cuddalore','Thanjavur'],['Cuddalore','Villupuram'],['Cuddalore','Nagapattinam'],
  // Villupuram
  ['Villupuram','Tiruvannamalai'],['Villupuram','Kallakurichi'],
  // Kallakurichi
  ['Kallakurichi','Salem'],['Kallakurichi','Tiruvannamalai'],
  // Tiruvannamalai
  ['Tiruvannamalai','Vellore'],['Tiruvannamalai','Salem'],
  // Hosur
  ['Hosur','Salem'],['Hosur','Coimbatore'],['Hosur','Erode'],['Hosur','Krishnagiri'],
  // Krishnagiri
  ['Krishnagiri','Dharmapuri'],['Krishnagiri','Salem'],
  // Dharmapuri
  ['Dharmapuri','Salem'],
  // Salem
  ['Salem','Erode'],['Salem','Namakkal'],['Salem','Tiruchirappalli'],
  // Erode
  ['Erode','Coimbatore'],['Erode','Tiruppur'],['Erode','Karur'],['Erode','Namakkal'],
  // Coimbatore
  ['Coimbatore','Tiruppur'],['Coimbatore','Dindigul'],['Coimbatore','Ooty'],['Coimbatore','Pollachi'],
  // Ooty
  ['Ooty','Nilgiris'],['Ooty','Pollachi'],
  // Nilgiris
  ['Nilgiris','Coimbatore'],
  // Pollachi
  ['Pollachi','Palani'],['Pollachi','Dindigul'],
  // Tiruppur
  ['Tiruppur','Dindigul'],['Tiruppur','Karur'],
  // Namakkal
  ['Namakkal','Tiruchirappalli'],['Namakkal','Karur'],
  // Karur
  ['Karur','Tiruchirappalli'],['Karur','Dindigul'],
  // Tiruchirappalli
  ['Tiruchirappalli','Thanjavur'],['Tiruchirappalli','Kumbakonam'],['Tiruchirappalli','Dindigul'],
  ['Tiruchirappalli','Madurai'],['Tiruchirappalli','Ariyalur'],['Tiruchirappalli','Perambalur'],['Tiruchirappalli','Pudukkottai'],
  // Ariyalur
  ['Ariyalur','Perambalur'],['Ariyalur','Kumbakonam'],
  // Perambalur
  ['Perambalur','Salem'],
  // Thanjavur
  ['Thanjavur','Kumbakonam'],['Thanjavur','Madurai'],['Thanjavur','Nagapattinam'],['Thanjavur','Mayiladuthurai'],
  // Kumbakonam
  ['Kumbakonam','Nagapattinam'],['Kumbakonam','Mayiladuthurai'],
  // Mayiladuthurai
  ['Mayiladuthurai','Nagapattinam'],
  // Pudukkottai
  ['Pudukkottai','Madurai'],['Pudukkottai','Ramanathapuram'],
  // Dindigul
  ['Dindigul','Madurai'],['Dindigul','Palani'],['Dindigul','Theni'],
  // Palani
  ['Palani','Theni'],
  // Theni
  ['Theni','Madurai'],
  // Madurai
  ['Madurai','Tirunelveli'],['Madurai','Thoothukudi'],['Madurai','Virudhunagar'],
  ['Madurai','Sivakasi'],['Madurai','Ramanathapuram'],
  // Virudhunagar
  ['Virudhunagar','Sivakasi'],['Virudhunagar','Tirunelveli'],['Virudhunagar','Thoothukudi'],
  // Sivakasi
  ['Sivakasi','Thoothukudi'],['Sivakasi','Tirunelveli'],
  // Ramanathapuram
  ['Ramanathapuram','Thoothukudi'],
  // Tirunelveli
  ['Tirunelveli','Thoothukudi'],['Tirunelveli','Nagercoil'],['Tirunelveli','Tenkasi'],
  // Thoothukudi
  ['Thoothukudi','Nagercoil'],
  // Tenkasi
  ['Tenkasi','Nagercoil'],
  // Nagercoil
  ['Nagercoil','Kanyakumari'],
  // Chennai suburbs
  ['Ambattur','Chennai'],['Ambattur','Avadi'],['Ambattur','Porur'],['Ambattur','Tiruvallur'],
  ['Avadi','Chennai'],['Avadi','Tiruvallur'],
  ['Tambaram','Chennai'],['Tambaram','Chengalpattu'],['Tambaram','Chromepet'],['Tambaram','Pallavaram'],
  ['Porur','Chennai'],['Porur','Kanchipuram'],
  ['Chromepet','Pallavaram'],['Chromepet','Chennai'],
  ['Pallavaram','Chennai'],
  ['Vandalur','Tambaram'],['Vandalur','Chengalpattu'],
  ['Sholinganallur','Chennai'],['Sholinganallur','Tambaram'],
  ['Perambur','Chennai'],['Perambur','Ambattur'],
  ['Guindy','Chennai'],['Guindy','Tambaram'],
  ['Velachery','Chennai'],['Velachery','Tambaram'],
  ['Adyar','Chennai'],['Adyar','Velachery'],
  ['Mylapore','Chennai'],['Mylapore','Adyar'],
  ['Egmore','Chennai'],['Egmore','Perambur'],
  ['Anna Nagar','Chennai'],['Anna Nagar','Ambattur'],
  ['Madipakkam','Velachery'],['Madipakkam','Tambaram'],
  ['Maraimalai Nagar','Tambaram'],['Maraimalai Nagar','Chengalpattu'],
  // Pondicherry region
  ['Pondicherry','Cuddalore'],['Pondicherry','Villupuram'],['Pondicherry','Tindivanam'],
  ['Karaikal','Nagapattinam'],['Karaikal','Mayiladuthurai'],
  ['Tindivanam','Villupuram'],['Tindivanam','Chengalpattu'],
  ['Gingee','Villupuram'],['Gingee','Tiruvannamalai'],
  ['Ulundurpet','Villupuram'],['Ulundurpet','Kallakurichi'],
  // South TN
  ['Sankarankovil','Tirunelveli'],['Sankarankovil','Tenkasi'],['Sankarankovil','Kovilpatti'],
  ['Ambasamudram','Tirunelveli'],['Ambasamudram','Tenkasi'],
  ['Papanasam','Tirunelveli'],['Papanasam','Ambasamudram'],
  ['Pattukkottai','Thanjavur'],['Pattukkottai','Aranthangi'],
  ['Karaikudi','Sivaganga'],['Karaikudi','Pudukkottai'],['Karaikudi','Devakottai'],
  ['Sivaganga','Madurai'],['Sivaganga','Ramanathapuram'],['Sivaganga','Manamadurai'],
  ['Paramakudi','Ramanathapuram'],['Paramakudi','Virudhunagar'],
  ['Rameswaram','Mandapam'],['Rameswaram','Ramanathapuram'],
  ['Mandapam','Ramanathapuram'],
  ['Sattur','Virudhunagar'],['Sattur','Kovilpatti'],
  ['Kovilpatti','Thoothukudi'],
  ['Tiruchendur','Thoothukudi'],['Tiruchendur','Nagercoil'],
  ['Courtallam','Tenkasi'],['Courtallam','Shenkottai'],
  ['Shenkottai','Tenkasi'],
  ['Kadayanallur','Tenkasi'],['Kadayanallur','Sankarankovil'],
  ['Vallioor','Tirunelveli'],['Vallioor','Nagercoil'],
  ['Nanguneri','Tirunelveli'],['Nanguneri','Nagercoil'],
  ['Cheranmahadevi','Tirunelveli'],['Cheranmahadevi','Ambasamudram'],
  ['Alangulam','Tenkasi'],['Alangulam','Tirunelveli'],
  // Delta / Cauvery
  ['Vriddhachalam','Cuddalore'],['Vriddhachalam','Villupuram'],['Vriddhachalam','Kallakurichi'],
  ['Chidambaram','Cuddalore'],['Chidambaram','Sirkazhi'],['Chidambaram','Vriddhachalam'],
  ['Sirkazhi','Mayiladuthurai'],
  ['Vedaranyam','Nagapattinam'],['Vedaranyam','Thiruvarur'],
  ['Thiruvarur','Kumbakonam'],['Thiruvarur','Nagapattinam'],['Thiruvarur','Mannargudi'],
  ['Mannargudi','Thanjavur'],['Mannargudi','Needamangalam'],
  ['Needamangalam','Thiruvarur'],
  ['Nannilam','Mayiladuthurai'],['Nannilam','Thiruvarur'],
  ['Orathanadu','Thanjavur'],['Orathanadu','Pattukkottai'],
  ['Aranthangi','Pudukkottai'],
  // Trichy region
  ['Musiri','Tiruchirappalli'],['Musiri','Karur'],
  ['Lalgudi','Tiruchirappalli'],['Lalgudi','Ariyalur'],
  ['Manapparai','Tiruchirappalli'],['Manapparai','Dindigul'],
  ['Thuraiyur','Tiruchirappalli'],['Thuraiyur','Perambalur'],
  ['Jayankondam','Ariyalur'],['Jayankondam','Bhuvanagiri'],
  ['Bhuvanagiri','Chidambaram'],
  ['Sendurai','Ariyalur'],['Sendurai','Perambalur'],
  // Salem region
  ['Mettur','Salem'],['Mettur','Bhavani'],
  ['Attur','Salem'],['Attur','Rasipuram'],
  ['Rasipuram','Namakkal'],
  ['Tiruchengode','Namakkal'],['Tiruchengode','Erode'],
  ['Bhavani','Erode'],['Bhavani','Gobichettipalayam'],
  ['Gobichettipalayam','Erode'],['Gobichettipalayam','Sathyamangalam'],
  ['Sathyamangalam','Coimbatore'],
  ['Sankari','Salem'],['Sankari','Tiruchengode'],
  ['Omalur','Salem'],['Omalur','Mettur'],
  // Coimbatore region
  ['Kangeyam','Tiruppur'],['Kangeyam','Dharapuram'],
  ['Dharapuram','Udumalaipettai'],['Dharapuram','Palladam'],
  ['Udumalaipettai','Pollachi'],
  ['Palladam','Coimbatore'],['Palladam','Tiruppur'],
  ['Avinashi','Tiruppur'],['Avinashi','Coimbatore'],
  ['Mettupalayam','Coimbatore'],['Mettupalayam','Ooty'],
  ['Coonoor','Ooty'],['Coonoor','Mettupalayam'],
  ['Kotagiri','Ooty'],['Kotagiri','Coonoor'],
  ['Valparai','Pollachi'],['Valparai','Coimbatore'],
  ['Gudalur','Ooty'],['Gudalur','Nilgiris'],
  // Dindigul region
  ['Kodaikanal','Dindigul'],['Kodaikanal','Batlagundu'],
  ['Periyakulam','Theni'],['Periyakulam','Bodinayakanur'],
  ['Bodinayakanur','Theni'],
  ['Andipatti','Theni'],['Andipatti','Madurai'],
  ['Cumbum','Theni'],['Cumbum','Bodinayakanur'],
  ['Batlagundu','Dindigul'],
  ['Natham','Dindigul'],['Natham','Madurai'],
  ['Oddanchatram','Dindigul'],['Oddanchatram','Palani'],
  ['Vedasandur','Dindigul'],['Vedasandur','Karur'],
  // Karur / Trichy
  ['Kulithalai','Karur'],['Kulithalai','Tiruchirappalli'],
  ['Manamadurai','Madurai'],
  ['Devakottai','Sivaganga'],
  // Pudukkottai region
  ['Thirumayam','Pudukkottai'],['Thirumayam','Karaikudi'],
  ['Alangudi','Pudukkottai'],['Alangudi','Aranthangi'],
]

const CONGESTION_COLOR = { low: '#22c55e', medium: '#f59e0b', high: '#ef4444', critical: '#dc2626' }

export default function MapPage() {
  const [heatmapPoints, setHeatmapPoints] = useState([])
  const [locations, setLocations] = useState([])
  const [route, setRoute] = useState(null)
  const [form, setForm] = useState({ source: 'Chennai', destination: 'Madurai', algorithm: 'dijkstra' })
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    dashboardAPI.heatmap().then(({ data }) => setHeatmapPoints(data.points || [])).catch(() => {})
    routeAPI.locations().then(({ data }) => {
      setLocations(data.locations || [])
    }).catch(() => {})
  }, [])

  const handleRoute = async () => {
    if (form.source === form.destination) return toast.error('Source and destination must differ')
    setLoading(true)
    try {
      const { data } = await routeAPI.optimize({ ...form, optimize_for: 'time' })
      setRoute(data)
      toast.success(`Route: ${data.path.join(' → ')}`)
    } catch { toast.error('Route not found') }
    finally { setLoading(false) }
  }

  // Build route polyline coords
  const routeCoords = (route?.path || []).map(n => NODE_COORDS[n]).filter(Boolean)

  // Build route edge set for highlighting
  const routeEdges = new Set()
  if (route?.path) {
    for (let i = 0; i < route.path.length - 1; i++) {
      routeEdges.add(`${route.path[i]}|${route.path[i + 1]}`)
      routeEdges.add(`${route.path[i + 1]}|${route.path[i]}`)
    }
  }

  const filteredPoints = filter === 'all' ? heatmapPoints : heatmapPoints.filter(p => p.congestion_level === filter)

  return (
    <AppLayout title="Live Map">
      <PageHeader
        title="Tamil Nadu Traffic Map"
        subtitle="Interactive road network with real-time congestion zones and route visualization"
      />

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20 }}>
        {/* Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 14 }}>
              <MdMyLocation size={14} style={{ color: 'var(--accent)' }} />
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-3)' }}>Route Planner</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Select label="Source City" value={form.source} onChange={e => setForm(p => ({ ...p, source: e.target.value }))}>
                {(locations.length ? locations : Object.keys(NODE_COORDS)).map(l => <option key={l}>{l}</option>)}
              </Select>
              <Select label="Destination City" value={form.destination} onChange={e => setForm(p => ({ ...p, destination: e.target.value }))}>
                {(locations.length ? locations : Object.keys(NODE_COORDS)).map(l => <option key={l}>{l}</option>)}
              </Select>
              <Select label="Algorithm" value={form.algorithm} onChange={e => setForm(p => ({ ...p, algorithm: e.target.value }))}>
                <option value="dijkstra">Dijkstra</option>
                <option value="astar">A* (A-Star)</option>
              </Select>
              <Button variant="primary" style={{ width: '100%', padding: '10px' }} onClick={handleRoute} loading={loading}>
                <MdMap size={14} /> {loading ? 'Finding...' : 'Show Route'}
              </Button>
            </div>

            {route && (
              <div style={{ marginTop: 14, padding: '12px 14px', borderRadius: 10, background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                <p style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-1)', marginBottom: 8 }}>Route Found</p>
                <div style={{ display: 'flex', gap: 14, marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12.5, color: 'var(--text-2)' }}>
                    <MdStraighten size={13} style={{ color: 'var(--accent)' }} />
                    {route.total_distance_km} km
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12.5, color: 'var(--text-2)' }}>
                    <MdTimer size={13} style={{ color: 'var(--green)' }} />
                    {route.estimated_time_minutes} min
                  </div>
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-3)', lineHeight: 1.7 }}>
                  {route.path.join(' → ')}
                </p>
              </div>
            )}
          </Card>

          {/* Congestion filter */}
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 14 }}>
              <MdFilterList size={14} style={{ color: 'var(--accent)' }} />
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-3)' }}>Congestion Filter</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {['all', 'low', 'medium', 'high', 'critical'].map(level => (
                <button key={level} onClick={() => setFilter(level)} style={{
                  display: 'flex', alignItems: 'center', gap: 9, width: '100%',
                  padding: '8px 10px', borderRadius: 8, fontSize: 13, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                  background: filter === level ? 'var(--accent-dim)' : 'transparent',
                  color: filter === level ? '#60a5fa' : 'var(--text-2)',
                  transition: 'all 0.15s',
                }}>
                  {level !== 'all' && <span style={{ width: 8, height: 8, borderRadius: '50%', background: CONGESTION_COLOR[level], flexShrink: 0 }} />}
                  <span style={{ textTransform: 'capitalize', flex: 1, textAlign: 'left' }}>{level === 'all' ? 'All Levels' : level}</span>
                  {level !== 'all' && <span style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600 }}>{heatmapPoints.filter(p => p.congestion_level === level).length}</span>}
                </button>
              ))}
            </div>
          </Card>

          {/* Legend */}
          <Card>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-3)', marginBottom: 12 }}>Map Legend</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#3b82f6', flexShrink: 0 }} />
                <span style={{ fontSize: 12.5, color: 'var(--text-2)' }}>City Node</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 20, height: 2, background: 'rgba(148,163,184,0.3)', flexShrink: 0 }} />
                <span style={{ fontSize: 12.5, color: 'var(--text-2)' }}>Road Connection</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 20, height: 3, background: '#f59e0b', borderRadius: 2, flexShrink: 0 }} />
                <span style={{ fontSize: 12.5, color: 'var(--text-2)' }}>Optimal Route</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#22c55e', flexShrink: 0 }} />
                <span style={{ fontSize: 12.5, color: 'var(--text-2)' }}>Start City</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ef4444', flexShrink: 0 }} />
                <span style={{ fontSize: 12.5, color: 'var(--text-2)' }}>End City</span>
              </div>
              {Object.entries(CONGESTION_COLOR).map(([level, color]) => (
                <div key={level} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, flexShrink: 0 }} />
                  <span style={{ fontSize: 12.5, color: 'var(--text-2)', textTransform: 'capitalize' }}>{level} congestion</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Map */}
        <div style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid var(--border)', height: 620 }}>
          <MapContainer center={TN_CENTER} zoom={7} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
            />

            {/* All road edges — grey base layer */}
            {ROAD_EDGES.map(([a, b]) => {
              const ca = NODE_COORDS[a]
              const cb = NODE_COORDS[b]
              if (!ca || !cb) return null
              const isOnRoute = routeEdges.has(`${a}|${b}`)
              return (
                <Polyline
                  key={`${a}-${b}`}
                  positions={[ca, cb]}
                  pathOptions={{
                    color: isOnRoute ? '#f59e0b' : 'rgba(148,163,184,0.25)',
                    weight: isOnRoute ? 5 : 1.5,
                    opacity: isOnRoute ? 1 : 0.7,
                    dashArray: isOnRoute ? undefined : undefined,
                  }}
                />
              )
            })}

            {/* City nodes */}
            {Object.entries(NODE_COORDS).map(([name, coords]) => {
              const isStart = route?.source === name
              const isEnd   = route?.destination === name
              const isOnRoute = route?.path?.includes(name)
              return (
                <CircleMarker
                  key={name}
                  center={coords}
                  radius={isStart || isEnd ? 11 : isOnRoute ? 9 : 7}
                  pathOptions={{
                    color: isStart ? '#22c55e' : isEnd ? '#ef4444' : isOnRoute ? '#f59e0b' : '#3b82f6',
                    fillColor: isStart ? '#22c55e' : isEnd ? '#ef4444' : isOnRoute ? '#f59e0b' : '#1d4ed8',
                    fillOpacity: 0.95,
                    weight: 2,
                  }}
                >
                  <MapTooltip permanent direction="top" offset={[0, -8]}>
                    <span style={{ fontSize: 11, fontWeight: 700 }}>{name}</span>
                  </MapTooltip>
                  <Popup>
                    <div>
                      <strong style={{ fontSize: 13 }}>{name}</strong><br />
                      <span style={{ fontSize: 11, color: '#8ba3c7' }}>
                        {coords[0].toFixed(4)}°N, {coords[1].toFixed(4)}°E
                      </span>
                      {isStart && <><br /><span style={{ color: '#22c55e', fontWeight: 600, fontSize: 12 }}>▶ Route Start</span></>}
                      {isEnd   && <><br /><span style={{ color: '#ef4444', fontWeight: 600, fontSize: 12 }}>⬛ Route End</span></>}
                    </div>
                  </Popup>
                </CircleMarker>
              )
            })}

            {/* Congestion heatmap points */}
            {filteredPoints.map((pt, i) => (
              <CircleMarker key={i} center={[pt.latitude, pt.longitude]} radius={6}
                pathOptions={{ color: CONGESTION_COLOR[pt.congestion_level] || '#94a3b8', fillColor: CONGESTION_COLOR[pt.congestion_level] || '#94a3b8', fillOpacity: 0.7, weight: 1 }}>
                <Popup>
                  <strong>Congestion:</strong> {pt.congestion_level}<br />
                  <strong>Vehicles:</strong> {pt.vehicle_count}
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        </div>
      </div>
    </AppLayout>
  )
}
