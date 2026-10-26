import { useState, useRef, useCallback } from 'react'
import AppLayout from '../components/common/AppLayout'
import { Card, Button, PageHeader, Badge } from '../components/common/UI'
import { predictionAPI } from '../api'
import toast from 'react-hot-toast'
import { MdUploadFile, MdCheckCircle, MdDescription, MdClose, MdCloudUpload } from 'react-icons/md'

const CSV_COLUMNS = ['hour', 'day_of_week', 'month', 'vehicle_count', 'average_speed', 'weather_condition', 'road_type', 'congestion_level']

export default function UploadPage() {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef()

  const handleFile = (f) => {
    if (!f?.name.endsWith('.csv')) return toast.error('Only CSV files accepted')
    setFile(f)
    setResult(null)
  }

  const onDrop = useCallback((e) => {
    e.preventDefault()
    setDragging(false)
    handleFile(e.dataTransfer.files[0])
  }, [])

  const handleUpload = async () => {
    if (!file) return toast.error('Select a CSV file first')
    setLoading(true)
    toast.loading('Uploading and training...', { id: 'upload' })
    try {
      const { data } = await predictionAPI.trainUpload(file)
      setResult(data.results)
      toast.success('Dataset uploaded and model trained!', { id: 'upload' })
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Upload failed', { id: 'upload' })
    } finally { setLoading(false) }
  }

  return (
    <AppLayout title="Data Upload">
      <PageHeader title="Dataset Upload & Training" subtitle="Upload a CSV dataset to train or retrain the ML models" />

      <div style={{ maxWidth: 760, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Upload card */}
        <Card>
          <p style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-1)', marginBottom: 18 }}>Upload Traffic Dataset</p>

          <div
            onDragOver={e => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            style={{
              border: `2px dashed ${dragging ? 'var(--accent)' : file ? 'var(--green)' : 'var(--border-strong)'}`,
              borderRadius: 14, padding: '48px 24px', textAlign: 'center', cursor: 'pointer',
              background: dragging ? 'var(--accent-dim)' : file ? 'var(--green-dim)' : 'var(--bg-elevated)',
              transition: 'all 0.2s',
            }}
          >
            <input ref={inputRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
            {file ? (
              <>
                <MdCheckCircle size={48} style={{ color: 'var(--green)', marginBottom: 12 }} />
                <p style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-1)', marginBottom: 4 }}>{file.name}</p>
                <p style={{ fontSize: 13, color: 'var(--text-3)' }}>{(file.size / 1024).toFixed(1)} KB · Click to change file</p>
              </>
            ) : (
              <>
                <MdCloudUpload size={48} style={{ color: 'var(--text-3)', marginBottom: 12, opacity: 0.5 }} />
                <p style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-1)', marginBottom: 6 }}>Drop your CSV file here</p>
                <p style={{ fontSize: 13.5, color: 'var(--text-2)' }}>or click to browse files</p>
              </>
            )}
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            {file && (
              <Button variant="ghost" onClick={() => { setFile(null); setResult(null) }}>
                <MdClose size={14} /> Clear
              </Button>
            )}
            <Button variant="primary" style={{ flex: 1, padding: '11px' }} onClick={handleUpload} disabled={!file} loading={loading}>
              <MdUploadFile size={16} /> {loading ? 'Training...' : 'Upload & Train Model'}
            </Button>
          </div>
        </Card>

        {/* Format guide */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <MdDescription size={16} style={{ color: 'var(--accent)' }} />
            <p style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-1)' }}>CSV Format Guide</p>
          </div>
          <p style={{ fontSize: 13.5, color: 'var(--text-2)', marginBottom: 14 }}>Your CSV must include these columns (in any order):</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
            {CSV_COLUMNS.map(col => (
              <span key={col} style={{ padding: '4px 12px', borderRadius: 6, background: 'var(--accent-dim)', color: '#60a5fa', fontSize: 12.5, fontWeight: 600, fontFamily: 'monospace', border: '1px solid var(--accent-border)' }}>
                {col}
              </span>
            ))}
          </div>
          <div style={{ padding: '14px 16px', borderRadius: 10, background: 'var(--bg-elevated)', border: '1px solid var(--border)', marginBottom: 12 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Example Row</p>
            <p style={{ fontSize: 12.5, fontFamily: 'monospace', color: 'var(--text-2)', lineHeight: 1.8 }}>
              {CSV_COLUMNS.join(',')}<br />
              8,1,6,450,25.5,clear,urban,high
            </p>
          </div>
          <div style={{ padding: '10px 14px', borderRadius: 9, background: 'rgba(245,158,11,0.08)', borderLeft: '3px solid var(--yellow)', fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.6 }}>
            <strong style={{ color: 'var(--yellow)' }}>Valid values: </strong>
            weather ∈ [clear, rain, fog, snow, cloudy] · road_type ∈ [urban, highway, residential, arterial] · congestion_level ∈ [low, medium, high, critical]
          </div>
        </Card>

        {/* Training results */}
        {result && (
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <p style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-1)' }}>Training Results</p>
              <Badge color="green">Best: {result.best_model}</Badge>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {Object.entries(result.models || {}).map(([name, m]) => (
                <div key={name} style={{ padding: '18px', borderRadius: 12, background: 'var(--bg-elevated)', border: `1px solid ${name === result.best_model ? 'rgba(34,197,94,0.25)' : 'var(--border)'}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-1)' }}>{name}</p>
                    {name === result.best_model && <Badge color="green">★ Best</Badge>}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {['accuracy', 'precision', 'recall', 'f1_score'].map(k => (
                      <div key={k} style={{ textAlign: 'center', padding: '10px 8px', borderRadius: 8, background: 'var(--bg-surface)' }}>
                        <p style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'capitalize', marginBottom: 4 }}>{k.replace('_', ' ')}</p>
                        <p style={{ fontSize: 18, fontWeight: 800, color: '#60a5fa' }}>{(m[k] * 100).toFixed(1)}%</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </AppLayout>
  )
}
