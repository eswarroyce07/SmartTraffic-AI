import { Link } from 'react-router-dom'
import { MdTraffic, MdAltRoute, MdAnalytics, MdMap, MdModelTraining, MdSecurity, MdArrowForward } from 'react-icons/md'

const FEATURES = [
  { icon: MdModelTraining, title: 'ML Congestion Prediction', desc: 'Random Forest & XGBoost models trained on real traffic patterns with 90%+ accuracy.', color: '#3b82f6' },
  { icon: MdAltRoute, title: 'Route Optimization', desc: 'Dijkstra & A* graph algorithms compute optimal routes with real-time traffic weights.', color: '#22c55e' },
  { icon: MdMap, title: 'Interactive Traffic Map', desc: 'OpenStreetMap integration with congestion zones, hotspots, and live route visualization.', color: '#f59e0b' },
  { icon: MdAnalytics, title: 'Real-time Analytics', desc: 'Hourly patterns, weekly trends, speed analysis, and congestion distribution charts.', color: '#8b5cf6' },
  { icon: MdTraffic, title: 'Traffic Data Management', desc: 'CSV dataset upload, manual record entry, and comprehensive traffic data tables.', color: '#ef4444' },
  { icon: MdSecurity, title: 'Secure Authentication', desc: 'JWT-based auth with bcrypt password hashing, role-based access, and protected routes.', color: '#06b6d4' },
]

const STATS = [
  { value: '90%+', label: 'Model Accuracy' },
  { value: '10', label: 'City Nodes' },
  { value: '2', label: 'ML Algorithms' },
  { value: '5K+', label: 'Training Samples' },
]

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', color: 'var(--text-1)' }}>

      {/* Navbar */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 48px', height: 64,
        background: 'rgba(6,11,24,0.85)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 9,
            background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(59,130,246,0.35)',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-1)' }}>SmartTraffic AI</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Link to="/login" style={{
            padding: '7px 18px', borderRadius: 8, fontSize: 13.5, fontWeight: 600,
            color: 'var(--text-2)', textDecoration: 'none', transition: 'color 0.15s',
          }}>Sign In</Link>
          <Link to="/register" style={{
            padding: '7px 18px', borderRadius: 8, fontSize: 13.5, fontWeight: 600,
            background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
            color: '#fff', textDecoration: 'none',
            boxShadow: '0 4px 12px rgba(59,130,246,0.35)',
          }}>Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ padding: '96px 48px 80px', textAlign: 'center', maxWidth: 860, margin: '0 auto', position: 'relative' }}>
        {/* Glow */}
        <div style={{
          position: 'absolute', top: 60, left: '50%', transform: 'translateX(-50%)',
          width: 600, height: 300, borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(59,130,246,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 7,
          padding: '6px 16px', borderRadius: 99, marginBottom: 28,
          background: 'rgba(59,130,246,0.10)', border: '1px solid rgba(59,130,246,0.25)',
          fontSize: 12.5, fontWeight: 600, color: '#60a5fa',
        }}>
          <span className="pulse-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: '#3b82f6', display: 'inline-block' }} />
          AI-Powered Urban Traffic Intelligence
        </div>

        <h1 style={{ fontSize: 56, fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: 24, color: 'var(--text-1)' }}>
          Predict Traffic.<br />
          <span style={{ background: 'linear-gradient(135deg, #60a5fa, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Optimize Routes.
          </span><br />
          Move Smarter.
        </h1>

        <p style={{ fontSize: 17, color: 'var(--text-2)', maxWidth: 560, margin: '0 auto 40px', lineHeight: 1.7 }}>
          Urban traffic congestion prediction using Machine Learning and intelligent route optimization
          with Dijkstra & A* algorithms — all in a real-time analytics dashboard.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <Link to="/register" style={{
            padding: '13px 32px', borderRadius: 10, fontSize: 15, fontWeight: 700,
            background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: '#fff',
            textDecoration: 'none', boxShadow: '0 6px 20px rgba(59,130,246,0.4)',
            display: 'inline-flex', alignItems: 'center', gap: 8,
          }}>
            Start for Free <MdArrowForward size={18} />
          </Link>
          <Link to="/login" style={{
            padding: '13px 32px', borderRadius: 10, fontSize: 15, fontWeight: 600,
            background: 'var(--bg-surface)', color: 'var(--text-1)',
            textDecoration: 'none', border: '1px solid var(--border-strong)',
          }}>
            Sign In
          </Link>
        </div>
      </section>

      {/* Stats bar */}
      <section style={{ padding: '0 48px 72px', maxWidth: 900, margin: '0 auto' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
          background: 'var(--bg-surface)', border: '1px solid var(--border)',
          borderRadius: 16, overflow: 'hidden',
        }}>
          {STATS.map(({ value, label }, i) => (
            <div key={label} style={{
              padding: '28px 24px', textAlign: 'center',
              borderRight: i < STATS.length - 1 ? '1px solid var(--border)' : 'none',
            }}>
              <p style={{ fontSize: 32, fontWeight: 800, color: '#60a5fa', letterSpacing: '-0.02em', lineHeight: 1 }}>{value}</p>
              <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 6 }}>{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '0 48px 80px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontSize: 36, fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-0.02em', marginBottom: 12 }}>
            Everything You Need
          </h2>
          <p style={{ fontSize: 15, color: 'var(--text-2)' }}>A complete traffic intelligence platform built for scale</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {FEATURES.map(({ icon: Icon, title, desc, color }) => (
            <div key={title} style={{
              padding: '28px 24px', borderRadius: 16,
              background: 'var(--bg-surface)', border: '1px solid var(--border)',
              transition: 'border-color 0.2s, transform 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = `${color}40`; e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)' }}
            >
              <div style={{
                width: 44, height: 44, borderRadius: 12, marginBottom: 18,
                background: `${color}18`, border: `1px solid ${color}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', color,
              }}>
                <Icon size={22} />
              </div>
              <h3 style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-1)', marginBottom: 8 }}>{title}</h3>
              <p style={{ fontSize: 13.5, color: 'var(--text-2)', lineHeight: 1.65 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '0 48px 80px', maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
        <div style={{
          padding: '56px 48px', borderRadius: 24,
          background: 'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(139,92,246,0.08))',
          border: '1px solid rgba(59,130,246,0.2)',
        }}>
          <h2 style={{ fontSize: 30, fontWeight: 800, color: 'var(--text-1)', marginBottom: 12, letterSpacing: '-0.02em' }}>
            Ready to Get Started?
          </h2>
          <p style={{ fontSize: 14.5, color: 'var(--text-2)', marginBottom: 28 }}>
            Create a free account and start predicting traffic congestion in minutes.
          </p>
          <Link to="/register" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '13px 32px', borderRadius: 10, fontSize: 15, fontWeight: 700,
            background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: '#fff',
            textDecoration: 'none', boxShadow: '0 6px 20px rgba(59,130,246,0.4)',
          }}>
            Create Free Account <MdArrowForward size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '24px 48px', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
        <p style={{ fontSize: 12.5, color: 'var(--text-3)' }}>
          SmartTraffic AI · Urban Traffic Intelligence Platform · Built with FastAPI, React & ML
        </p>
      </footer>
    </div>
  )
}
