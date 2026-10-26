import AppLayout from '../components/common/AppLayout'
import { Card, PageHeader, Badge } from '../components/common/UI'
import { useAuth } from '../context/AuthContext'
import { MdPerson, MdEmail, MdShield, MdCalendarToday, MdVerified } from 'react-icons/md'

export default function ProfilePage() {
  const { user } = useAuth()
  const joinDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'N/A'

  return (
    <AppLayout title="Profile">
      <PageHeader title="My Profile" subtitle="Manage your account information" />

      <div style={{ maxWidth: 640, display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Avatar card */}
        <Card style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.06), rgba(139,92,246,0.06))', border: '1px solid rgba(59,130,246,0.15)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{
              width: 72, height: 72, borderRadius: 18, flexShrink: 0,
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 28, fontWeight: 800, color: '#fff',
              boxShadow: '0 8px 24px rgba(59,130,246,0.35)',
            }}>
              {user?.username?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <p style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-0.01em', marginBottom: 4 }}>
                {user?.full_name || user?.username}
              </p>
              <p style={{ fontSize: 13.5, color: 'var(--text-2)', marginBottom: 10 }}>{user?.email}</p>
              <Badge color={user?.role === 'admin' ? 'purple' : 'blue'}>
                {user?.role === 'admin' ? '⚡ Admin' : '👤 User'}
              </Badge>
            </div>
          </div>
        </Card>

        {/* Account details */}
        <Card>
          <p style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-1)', marginBottom: 18 }}>Account Details</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {[
              { icon: MdPerson,       label: 'Username',      value: user?.username },
              { icon: MdEmail,        label: 'Email Address', value: user?.email },
              { icon: MdShield,       label: 'Role',          value: user?.role },
              { icon: MdCalendarToday, label: 'Member Since', value: joinDate },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ width: 36, height: 36, borderRadius: 9, background: 'var(--accent-dim)', border: '1px solid var(--accent-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', flexShrink: 0 }}>
                  <Icon size={16} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 11.5, color: 'var(--text-3)', marginBottom: 2 }}>{label}</p>
                  <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)', textTransform: label === 'Role' ? 'capitalize' : 'none' }}>{value}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Security */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <MdVerified size={16} style={{ color: 'var(--green)' }} />
            <p style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-1)' }}>Security</p>
          </div>
          <p style={{ fontSize: 13.5, color: 'var(--text-2)', marginBottom: 14, lineHeight: 1.6 }}>
            Your account is secured with bcrypt password hashing and JWT authentication.
          </p>
          <div style={{ padding: '12px 16px', borderRadius: 10, background: 'var(--green-dim)', borderLeft: '3px solid var(--green)', fontSize: 13.5, color: 'var(--green)', fontWeight: 500 }}>
            ✓ Account is secure · JWT token expires in 24 hours
          </div>
        </Card>
      </div>
    </AppLayout>
  )
}
