import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { MdEmail, MdLock, MdPerson, MdArrowForward } from 'react-icons/md'

const FIELDS = [
  { key: 'full_name', label: 'Full Name', type: 'text', icon: MdPerson, placeholder: 'John Doe', required: false },
  { key: 'username', label: 'Username', type: 'text', icon: MdPerson, placeholder: 'johndoe', required: true },
  { key: 'email', label: 'Email Address', type: 'email', icon: MdEmail, placeholder: 'you@example.com', required: true },
  { key: 'password', label: 'Password', type: 'password', icon: MdLock, placeholder: '••••••••', required: true },
]

export default function RegisterPage() {
  const { register, loading } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', email: '', password: '', full_name: '' })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters')
    try {
      await register(form)
      toast.success('Account created! Welcome aboard.')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Registration failed')
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg-base)' }}>

      {/* Left panel */}
      <div style={{
        width: '42%', flexDirection: 'column', justifyContent: 'space-between',
        padding: '48px 52px', background: 'var(--bg-surface)', borderRight: '1px solid var(--border)',
        position: 'relative', overflow: 'hidden',
      }} className="lg-flex">
        <style>{`.lg-flex { display: flex !important; } @media(max-width:900px){.lg-flex{display:none!important}}`}</style>

        <div style={{
          position: 'absolute', bottom: -80, left: -80, width: 360, height: 360, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.10) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(59,130,246,0.35)',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-1)' }}>SmartTraffic AI</span>
        </Link>

        <div>
          <p style={{ fontSize: 36, fontWeight: 800, color: 'var(--text-1)', lineHeight: 1.15, letterSpacing: '-0.02em', marginBottom: 16 }}>
            Join the Future<br />
            <span style={{ background: 'linear-gradient(135deg, #a78bfa, #60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              of Urban Mobility
            </span>
          </p>
          <p style={{ fontSize: 14.5, color: 'var(--text-2)', lineHeight: 1.7 }}>
            Get access to ML-powered traffic predictions, route optimization, and real-time analytics.
          </p>
          <div style={{
            marginTop: 28, padding: '16px 20px', borderRadius: 12,
            background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)',
          }}>
            <p style={{ fontSize: 13, color: '#60a5fa', fontWeight: 600 }}>✓ Free to use · No credit card required</p>
          </div>
        </div>

        <p style={{ fontSize: 12, color: 'var(--text-3)' }}>Powered by Random Forest & XGBoost</p>
      </div>

      {/* Right panel */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div style={{ width: '100%', maxWidth: 400 }} className="anim-fade-up">

          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-0.02em', marginBottom: 8 }}>
              Create account
            </h2>
            <p style={{ fontSize: 14, color: 'var(--text-2)' }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: '#60a5fa', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {FIELDS.map(({ key, label, type, icon: Icon, placeholder, required }) => (
              <div key={key}>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--text-2)', marginBottom: 7 }}>
                  {label} {!required && <span style={{ color: 'var(--text-3)', fontWeight: 400 }}>(optional)</span>}
                </label>
                <div style={{ position: 'relative' }}>
                  <Icon size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)', pointerEvents: 'none' }} />
                  <input
                    type={type} required={required} value={form[key]} placeholder={placeholder}
                    onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                    style={{
                      width: '100%', padding: '10px 12px 10px 36px', borderRadius: 9,
                      background: 'var(--bg-input)', border: '1px solid var(--border-strong)',
                      color: 'var(--text-1)', fontSize: 14,
                    }}
                  />
                </div>
              </div>
            ))}

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '12px', borderRadius: 9, fontSize: 14.5, fontWeight: 700,
              background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: '#fff',
              border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1, marginTop: 4,
              boxShadow: '0 4px 16px rgba(59,130,246,0.35)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              fontFamily: 'inherit',
            }}>
              {loading ? 'Creating account...' : <><span>Create Account</span><MdArrowForward size={17} /></>}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: 12.5, color: 'var(--text-3)', marginTop: 28 }}>
            <Link to="/" style={{ color: 'var(--text-3)', textDecoration: 'none' }}>← Back to home</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
