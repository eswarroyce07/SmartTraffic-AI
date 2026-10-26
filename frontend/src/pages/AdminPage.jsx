import { useEffect, useState } from 'react'
import AppLayout from '../components/common/AppLayout'
import { Card, StatCard, Button, PageHeader, Badge, Spinner } from '../components/common/UI'
import { dashboardAPI, predictionAPI } from '../api'
import { useAuth } from '../context/AuthContext'
import { Navigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { MdModelTraining, MdStorage, MdCheckCircle, MdWarning, MdAnalytics, MdCircle } from 'react-icons/md'

const HEALTH_ITEMS = (modelInfo) => [
  { label: 'API Server',       status: 'Operational', color: 'green' },
  { label: 'ML Pipeline',      status: modelInfo ? 'Operational' : 'Needs Training', color: modelInfo ? 'green' : 'yellow' },
  { label: 'Route Optimizer',  status: 'Operational', color: 'green' },
  { label: 'Database',         status: 'Operational', color: 'green' },
  { label: 'Authentication',   status: 'Operational', color: 'green' },
]

export default function AdminPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [modelInfo, setModelInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [training, setTraining] = useState(false)

  useEffect(() => {
    if (user?.role !== 'admin') return
    Promise.allSettled([dashboardAPI.stats(), predictionAPI.modelInfo()])
      .then(([s, m]) => {
        if (s.status === 'fulfilled') setStats(s.value.data)
        if (m.status === 'fulfilled') setModelInfo(m.value.data)
      })
      .finally(() => setLoading(false))
  }, [])

  const handleRetrain = async () => {
    setTraining(true)
    toast.loading('Retraining models...', { id: 'retrain' })
    try {
      const { data } = await predictionAPI.train()
      setModelInfo(data.results)
      toast.success('Models retrained successfully!', { id: 'retrain' })
    } catch { toast.error('Retraining failed', { id: 'retrain' }) }
    finally { setTraining(false) }
  }

  if (user?.role !== 'admin') return <Navigate to="/dashboard" replace />
  if (loading) return <AppLayout title="Admin"><div style={{ display: 'flex', justifyContent: 'center', marginTop: 80 }}><Spinner size={36} /></div></AppLayout>

  const s = stats || {}

  return (
    <AppLayout title="Admin Dashboard">
      <PageHeader
        title="Admin Dashboard"
        subtitle="System management, model control, and platform health"
        actions={
          <Button variant="primary" size="sm" onClick={handleRetrain} loading={training}>
            <MdModelTraining size={14} /> Retrain Models
          </Button>
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <StatCard title="Traffic Records"   value={s.total_records?.toLocaleString() ?? '0'} icon={MdStorage}      color="blue"   />
        <StatCard title="Total Predictions" value={s.total_predictions?.toLocaleString() ?? '0'} icon={MdAnalytics} color="purple" />
        <StatCard title="Active Zones"      value={s.active_congestion_zones ?? 0}           icon={MdWarning}      color="red"    />
        <StatCard title="Model Accuracy"    value={s.model_accuracy ? `${(s.model_accuracy * 100).toFixed(1)}%` : 'N/A'} icon={MdCheckCircle} color="green" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* ML Model Status */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
            <MdModelTraining size={16} style={{ color: 'var(--accent)' }} />
            <p style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-1)' }}>ML Model Status</p>
          </div>
          {modelInfo ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: 9, background: 'var(--bg-elevated)' }}>
                <span style={{ fontSize: 13.5, color: 'var(--text-2)' }}>Active Model</span>
                <Badge color="green">{modelInfo.best_model}</Badge>
              </div>
              {Object.entries(modelInfo.models || {}).map(([name, m]) => (
                <div key={name} style={{ padding: '14px', borderRadius: 10, background: 'var(--bg-elevated)', border: `1px solid ${name === modelInfo.best_model ? 'rgba(34,197,94,0.2)' : 'var(--border)'}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)' }}>{name}</p>
                    {name === modelInfo.best_model && <Badge color="green">★ Best</Badge>}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
                    {['accuracy', 'precision', 'recall', 'f1_score'].map(k => (
                      <div key={k} style={{ textAlign: 'center', padding: '8px 4px', borderRadius: 7, background: 'var(--bg-surface)' }}>
                        <p style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'capitalize', marginBottom: 3 }}>{k.replace('_', ' ')}</p>
                        <p style={{ fontSize: 14, fontWeight: 800, color: '#60a5fa' }}>{(m[k] * 100).toFixed(1)}%</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <Button variant="secondary" style={{ width: '100%', padding: '10px' }} onClick={handleRetrain} loading={training}>
                <MdModelTraining size={14} /> Retrain on Synthetic Data
              </Button>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <MdModelTraining size={44} style={{ color: 'var(--text-3)', marginBottom: 12, opacity: 0.3 }} />
              <p style={{ fontSize: 13.5, color: 'var(--text-2)', marginBottom: 14 }}>No trained model found</p>
              <Button variant="primary" onClick={handleRetrain} loading={training}>
                <MdModelTraining size={14} /> Train Now
              </Button>
            </div>
          )}
        </Card>

        {/* System Health */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
            <MdCheckCircle size={16} style={{ color: 'var(--green)' }} />
            <p style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-1)' }}>System Health</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {HEALTH_ITEMS(modelInfo).map(({ label, status, color }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: 9, background: 'var(--bg-elevated)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <MdCircle size={8} style={{ color: color === 'green' ? 'var(--green)' : 'var(--yellow)', flexShrink: 0 }} />
                  <span style={{ fontSize: 13.5, color: 'var(--text-2)' }}>{label}</span>
                </div>
                <Badge color={color}>{status}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {s.congestion_distribution && Object.keys(s.congestion_distribution).length > 0 && (
        <Card>
          <p style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-1)', marginBottom: 18 }}>Congestion Level Breakdown</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
            {Object.entries(s.congestion_distribution).map(([level, count]) => {
              const colorMap = { low: 'green', medium: 'yellow', high: 'red', critical: 'red' }
              return (
                <div key={level} style={{ padding: '20px', borderRadius: 12, background: 'var(--bg-elevated)', textAlign: 'center', border: '1px solid var(--border)' }}>
                  <p style={{ fontSize: 30, fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-0.02em', marginBottom: 8 }}>{count}</p>
                  <Badge color={colorMap[level] || 'blue'}>{level}</Badge>
                </div>
              )
            })}
          </div>
        </Card>
      )}
    </AppLayout>
  )
}
