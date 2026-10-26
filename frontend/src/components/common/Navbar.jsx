import { useAuth } from '../../context/AuthContext'
import { MdNotifications } from 'react-icons/md'

export default function Navbar({ title = 'Dashboard' }) {
  const { user } = useAuth()
  const now = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })

  return (
    <header style={{
      height: 'var(--topbar-h)', flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 28px',
      background: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border)',
    }}>
      <div>
        <h1 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-1)', lineHeight: 1.2 }}>{title}</h1>
        <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>{now}</p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Live badge */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '5px 12px', borderRadius: 99,
          background: 'var(--green-dim)', border: '1px solid rgba(34,197,94,0.2)',
          fontSize: 12, fontWeight: 600, color: 'var(--green)',
        }}>
          <span className="pulse-dot" style={{
            width: 6, height: 6, borderRadius: '50%',
            background: 'var(--green)', display: 'inline-block',
          }} />
          Live
        </div>

        {/* Divider */}
        <div style={{ width: 1, height: 24, background: 'var(--border-strong)' }} />

        {/* User */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: '50%',
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 700, color: '#fff', flexShrink: 0,
          }}>
            {user?.username?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)', lineHeight: 1.2 }}>
              {user?.full_name || user?.username}
            </p>
            <p style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'capitalize' }}>{user?.role}</p>
          </div>
        </div>
      </div>
    </header>
  )
}
