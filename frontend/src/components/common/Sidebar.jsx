import { NavLink } from 'react-router-dom'
import {
  MdDashboard, MdTraffic, MdAnalytics, MdMap,
  MdModelTraining, MdAltRoute, MdUploadFile, MdLogout,
  MdAdminPanelSettings, MdPerson,
} from 'react-icons/md'
import { useAuth } from '../../context/AuthContext'

const NAV = [
  { to: '/dashboard',  icon: MdDashboard,     label: 'Dashboard' },
  { to: '/traffic',    icon: MdTraffic,        label: 'Traffic Data' },
  { to: '/prediction', icon: MdModelTraining,  label: 'Prediction' },
  { to: '/route',      icon: MdAltRoute,       label: 'Route Optimizer' },
  { to: '/map',        icon: MdMap,            label: 'Live Map' },
  { to: '/analytics',  icon: MdAnalytics,      label: 'Analytics' },
  { to: '/upload',     icon: MdUploadFile,     label: 'Data Upload' },
]

export default function Sidebar() {
  const { logout, user } = useAuth()

  return (
    <aside style={{
      position: 'fixed', left: 0, top: 0, height: '100vh',
      width: 'var(--sidebar-w)', display: 'flex', flexDirection: 'column',
      background: 'var(--bg-surface)', borderRight: '1px solid var(--border)',
      zIndex: 50,
    }}>

      {/* Brand */}
      <div style={{
        padding: '20px 20px 18px',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10, flexShrink: 0,
          background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(59,130,246,0.35)',
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div>
          <p style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-1)', lineHeight: 1.2 }}>SmartTraffic AI</p>
          <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>Analytics Platform</p>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-3)', padding: '8px 10px 6px', textTransform: 'uppercase' }}>
          Navigation
        </p>
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} style={({ isActive }) => ({
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '9px 12px', borderRadius: 9, fontSize: 13.5,
            fontWeight: isActive ? 600 : 500, textDecoration: 'none',
            transition: 'all 0.15s',
            background: isActive ? 'linear-gradient(135deg, rgba(59,130,246,0.18), rgba(99,102,241,0.12))' : 'transparent',
            color: isActive ? '#60a5fa' : 'var(--text-2)',
            border: isActive ? '1px solid rgba(59,130,246,0.2)' : '1px solid transparent',
            boxShadow: isActive ? '0 2px 8px rgba(59,130,246,0.1)' : 'none',
          })}
          onMouseEnter={e => { if (!e.currentTarget.style.background.includes('gradient')) e.currentTarget.style.background = 'var(--bg-hover)' }}
          onMouseLeave={e => { if (!e.currentTarget.style.background.includes('gradient')) e.currentTarget.style.background = 'transparent' }}
          >
            <Icon size={16} style={{ flexShrink: 0 }} />
            {label}
          </NavLink>
        ))}

        {user?.role === 'admin' && (
          <>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-3)', padding: '14px 10px 6px', textTransform: 'uppercase' }}>
              Admin
            </p>
            <NavLink to="/admin" style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 12px', borderRadius: 9, fontSize: 13.5,
              fontWeight: isActive ? 600 : 500, textDecoration: 'none',
              transition: 'all 0.15s',
              background: isActive ? 'linear-gradient(135deg, rgba(139,92,246,0.18), rgba(99,102,241,0.12))' : 'transparent',
              color: isActive ? '#a78bfa' : 'var(--text-2)',
              border: isActive ? '1px solid rgba(139,92,246,0.2)' : '1px solid transparent',
            })}>
              <MdAdminPanelSettings size={16} />
              Admin Panel
            </NavLink>
          </>
        )}
      </nav>

      {/* User footer */}
      <div style={{ padding: '10px', borderTop: '1px solid var(--border)' }}>
        <NavLink to="/profile" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 9, textDecoration: 'none', marginBottom: 4, transition: 'background 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 700, color: '#fff',
          }}>
            {user?.username?.[0]?.toUpperCase() || 'U'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.full_name || user?.username}
            </p>
            <p style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'capitalize' }}>{user?.role}</p>
          </div>
        </NavLink>
        <button onClick={logout} style={{
          display: 'flex', alignItems: 'center', gap: 10, width: '100%',
          padding: '9px 12px', borderRadius: 9, fontSize: 13.5, fontWeight: 500,
          background: 'transparent', border: 'none', cursor: 'pointer',
          color: 'var(--red)', transition: 'background 0.15s',
        }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--red-dim)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
          <MdLogout size={16} />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
