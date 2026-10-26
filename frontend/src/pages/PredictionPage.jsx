import { useState } from 'react'
import AppLayout from '../components/common/AppLayout'
import { Card, CongestionBadge, Spinner, Button, Select, Input, PageHeader, tooltipStyle, tooltipLabelStyle, tooltipItemStyle } from '../components/common/UI'
import { predictionAPI } from '../api'
import toast from 'react-hot-toast'
import { MdModelTraining, MdAutoAwesome, MdHistory, MdInfo, MdTune } from 'react-icons/md'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const LOCATIONS = ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli', 'Vellore', 'Erode', 'Thoothukudi', 'Dindigul', 'Thanjavur', 'Kanchipuram', 'Tiruppur', 'Hosur', 'Nagercoil', 'Kumbakonam', 'Cuddalore', 'Namakkal', 'Karur']
const WEATHER = ['clear', 'rain', 'fog', 'snow', 'cloudy']
const ROAD_TYPES = ['urban', 'highway', 'residential', 'arterial']
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const defaultForm = { location: 'Downtown', hour: 8, day_of_week: 1, month: 6, weather_condition: 'clear', road_type: 'urban', vehicle_count: 300, average_speed: 40 }
const CONGESTION_COLORS = { low: '#22c55e', medium: '#f59e0b', high: '#ef4444', critical: '#dc2626' }

export default function PredictionPage() {
  const [form, setForm] = useState(defaultForm)
  const [result, setResult] = useState(null)
  const [modelInfo, setModelInfo] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [training, setTraining] = useState(false)
  const [tab, setTab] = useState('predict')

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handlePredict = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await predictionAPI.predict({ ...form, hour: +form.hour, day_of_week: +form.day_of_week, month: +form.month, vehicle_count: +form.vehicle_count, average_speed: +form.average_speed })
      setResult(data)
      setHistory(h => [{ ...data, id: Date.now(), form: { ...form } }, ...h].slice(0, 10))
      setTab('predict')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Prediction failed. Train the model first.')
    } finally { setLoading(false) }
  }

  const handleTrain = async () => {
    setTraining(true)
    toast.loading('Training ML models on 5000 samples...', { id: 'train' })
    try {
      const { data } = await predictionAPI.train()
      setModelInfo(data.results)
      toast.success('Model trained successfully!', { id: 'train' })
      setTab('model')
    } catch { toast.error('Training failed', { id: 'train' }) }
    finally { setTraining(false) }
  }

  const handleModelInfo = async () => {
    try {
      const { data } = await predictionAPI.modelInfo()
      setModelInfo(data)
      setTab('model')
    } catch { toast.error('No trained model found. Train first.') }
  }

  const featureData = modelInfo
    ? Object.entries(modelInfo.models?.[modelInfo.best_model]?.feature_importance || {})
        .map(([name, value]) => ({ name: name.replace(/_/g, ' '), value: +(value * 100).toFixed(1) }))
        .sort((a, b) => b.value - a.value)
    : []

  return (
    <AppLayout title="Traffic Prediction">
      <PageHeader
        title="Congestion Prediction"
        subtitle="ML-powered traffic congestion forecasting using Random Forest & XGBoost"
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="ghost" size="sm" onClick={handleModelInfo}><MdInfo size={14} /> Model Info</Button>
            <Button variant="primary" size="sm" onClick={handleTrain} loading={training}>
              <MdModelTraining size={14} /> {training ? 'Training...' : 'Train Model'}
            </Button>
          </div>
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Left: Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
              <MdTune size={16} style={{ color: 'var(--accent)' }} />
              <p style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-1)' }}>Input Parameters</p>
            </div>
            <form onSubmit={handlePredict} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Select label="Location" value={form.location} onChange={e => set('location', e.target.value)}>
                  {LOCATIONS.map(o => <option key={o}>{o}</option>)}
                </Select>
                <Select label="Weather" value={form.weather_condition} onChange={e => set('weather_condition', e.target.value)}>
                  {WEATHER.map(o => <option key={o}>{o}</option>)}
                </Select>
                <Select label="Road Type" value={form.road_type} onChange={e => set('road_type', e.target.value)}>
                  {ROAD_TYPES.map(o => <option key={o}>{o}</option>)}
                </Select>
                <Input label="Hour (0–23)" type="number" min={0} max={23} value={form.hour} onChange={e => set('hour', e.target.value)} />
                <Input label="Day of Week (0=Sun)" type="number" min={0} max={6} value={form.day_of_week} onChange={e => set('day_of_week', e.target.value)} />
                <Input label="Month (1–12)" type="number" min={1} max={12} value={form.month} onChange={e => set('month', e.target.value)} />
                <Input label="Vehicle Count" type="number" min={0} max={1000} value={form.vehicle_count} onChange={e => set('vehicle_count', e.target.value)} />
                <Input label="Avg Speed (km/h)" type="number" min={0} max={200} value={form.average_speed} onChange={e => set('average_speed', e.target.value)} />
              </div>
              <Button type="submit" variant="primary" loading={loading} style={{ width: '100%', padding: '11px' }}>
                <MdAutoAwesome size={16} /> {loading ? 'Predicting...' : 'Predict Congestion'}
              </Button>
            </form>
          </Card>

          {history.length > 0 && (
            <Card>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <MdHistory size={15} style={{ color: 'var(--text-3)' }} />
                <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)' }}>Recent Predictions</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 220, overflowY: 'auto' }}>
                {history.map(h => (
                  <div key={h.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 12px', borderRadius: 8, background: 'var(--bg-elevated)' }}>
                    <div>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>{h.location}</span>
                      <span style={{ fontSize: 12, color: 'var(--text-3)', marginLeft: 8 }}>{h.form.hour}:00 · {DAYS[h.form.day_of_week]}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <CongestionBadge level={h.predicted_congestion} />
                      <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{(h.confidence * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Right: Results */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {(result || modelInfo) && (
            <div style={{ display: 'flex', gap: 4, padding: 4, borderRadius: 10, background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
              {result && (
                <button onClick={() => setTab('predict')} style={{
                  flex: 1, padding: '7px', borderRadius: 7, fontSize: 12.5, fontWeight: 600, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                  background: tab === 'predict' ? 'var(--accent)' : 'transparent',
                  color: tab === 'predict' ? '#fff' : 'var(--text-2)',
                }}>Prediction Result</button>
              )}
              {modelInfo && (
                <button onClick={() => setTab('model')} style={{
                  flex: 1, padding: '7px', borderRadius: 7, fontSize: 12.5, fontWeight: 600, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                  background: tab === 'model' ? 'var(--accent)' : 'transparent',
                  color: tab === 'model' ? '#fff' : 'var(--text-2)',
                }}>Model Performance</button>
              )}
            </div>
          )}

          {tab === 'predict' && result && (
            <Card>
              <p style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-1)', marginBottom: 18 }}>Prediction Result</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {[
                  { label: 'Location', value: result.location },
                  { label: 'Congestion Level', value: <CongestionBadge level={result.predicted_congestion} /> },
                  { label: 'Confidence', value: <span style={{ fontWeight: 700, color: 'var(--green)' }}>{(result.confidence * 100).toFixed(1)}%</span> },
                ].map(({ label, value }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ fontSize: 13.5, color: 'var(--text-2)' }}>{label}</span>
                    <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-1)' }}>{value}</span>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-3)' }}>Confidence</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)' }}>{(result.confidence * 100).toFixed(1)}%</span>
                </div>
                <div style={{ width: '100%', height: 6, borderRadius: 99, background: 'var(--bg-elevated)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: 99, transition: 'width 0.6s ease', width: `${result.confidence * 100}%`, background: CONGESTION_COLORS[result.predicted_congestion] || 'var(--accent)' }} />
                </div>
              </div>

              <div style={{ marginTop: 16, padding: '12px 16px', borderRadius: 10, background: 'rgba(59,130,246,0.08)', borderLeft: '3px solid var(--accent)', fontSize: 13.5, color: 'var(--text-2)', lineHeight: 1.6 }}>
                💡 {result.recommendation}
              </div>
            </Card>
          )}

          {tab === 'model' && modelInfo && (
            <>
              <Card>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                  <p style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-1)' }}>Model Comparison</p>
                  <span style={{ padding: '3px 10px', borderRadius: 99, background: 'var(--green-dim)', color: 'var(--green)', fontSize: 12, fontWeight: 600, border: '1px solid rgba(34,197,94,0.2)' }}>
                    Best: {modelInfo.best_model}
                  </span>
                </div>
                {Object.entries(modelInfo.models || {}).map(([name, m]) => (
                  <div key={name} style={{ marginBottom: 16, padding: '14px', borderRadius: 10, background: 'var(--bg-elevated)', border: `1px solid ${name === modelInfo.best_model ? 'rgba(34,197,94,0.2)' : 'var(--border)'}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)' }}>{name}</p>
                      {name === modelInfo.best_model && <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, background: 'var(--green-dim)', color: 'var(--green)', fontWeight: 600 }}>★ Best</span>}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                      {['accuracy', 'precision', 'recall', 'f1_score'].map(metric => (
                        <div key={metric} style={{ textAlign: 'center', padding: '10px 6px', borderRadius: 8, background: 'var(--bg-surface)' }}>
                          <p style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'capitalize', marginBottom: 4 }}>{metric.replace('_', ' ')}</p>
                          <p style={{ fontSize: 16, fontWeight: 800, color: '#60a5fa' }}>{(m[metric] * 100).toFixed(1)}%</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </Card>

              {featureData.length > 0 && (
                <Card>
                  <p style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-1)', marginBottom: 18 }}>Feature Importance</p>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={featureData} layout="vertical" barSize={10}>
                      <XAxis type="number" tick={{ fill: '#4a6080', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis type="category" dataKey="name" tick={{ fill: '#8ba3c7', fontSize: 10 }} axisLine={false} tickLine={false} width={110} />
                      <Tooltip contentStyle={tooltipStyle} formatter={v => [`${v}%`, 'Importance']} />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                        {featureData.map((_, i) => <Cell key={i} fill={`hsl(${220 - i * 14}, 70%, ${62 - i * 2}%)`} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              )}
            </>
          )}

          {!result && !modelInfo && (
            <Card style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 320 }}>
              <div style={{ textAlign: 'center' }}>
                <MdAutoAwesome size={52} style={{ color: 'var(--text-3)', marginBottom: 16, opacity: 0.4 }} />
                <p style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-1)', marginBottom: 6 }}>Ready to Predict</p>
                <p style={{ fontSize: 13.5, color: 'var(--text-2)', maxWidth: 260 }}>Train the model first, then fill in the parameters and click Predict.</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
