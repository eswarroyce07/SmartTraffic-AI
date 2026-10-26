// ── Design tokens ────────────────────────────────────────────────────────────
const COLOR = {
  blue:   { bg: 'rgba(59,130,246,0.10)',  color: '#60a5fa',  border: 'rgba(59,130,246,0.2)' },
  green:  { bg: 'rgba(34,197,94,0.10)',   color: '#4ade80',  border: 'rgba(34,197,94,0.2)' },
  yellow: { bg: 'rgba(245,158,11,0.10)',  color: '#fbbf24',  border: 'rgba(245,158,11,0.2)' },
  red:    { bg: 'rgba(239,68,68,0.10)',   color: '#f87171',  border: 'rgba(239,68,68,0.2)' },
  purple: { bg: 'rgba(139,92,246,0.10)',  color: '#a78bfa',  border: 'rgba(139,92,246,0.2)' },
  cyan:   { bg: 'rgba(6,182,212,0.10)',   color: '#22d3ee',  border: 'rgba(6,182,212,0.2)' },
}

const CONGESTION = {
  low:      { bg: 'rgba(34,197,94,0.10)',  color: '#4ade80',  dot: '#22c55e' },
  medium:   { bg: 'rgba(245,158,11,0.10)', color: '#fbbf24',  dot: '#f59e0b' },
  high:     { bg: 'rgba(239,68,68,0.10)',  color: '#f87171',  dot: '#ef4444' },
  critical: { bg: 'rgba(220,38,38,0.12)',  color: '#fca5a5',  dot: '#dc2626' },
}

// ── Card ─────────────────────────────────────────────────────────────────────
export function Card({ children, className = '', style = {}, onClick, noPad }) {
  return (
    <div
      onClick={onClick}
      className={className}
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: noPad ? 0 : '20px 22px',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        cursor: onClick ? 'pointer' : undefined,
        ...style,
      }}
      onMouseEnter={onClick ? e => {
        e.currentTarget.style.borderColor = 'var(--border-strong)'
        e.currentTarget.style.boxShadow = 'var(--shadow-md)'
      } : undefined}
      onMouseLeave={onClick ? e => {
        e.currentTarget.style.borderColor = 'var(--border)'
        e.currentTarget.style.boxShadow = 'none'
      } : undefined}
    >
      {children}
    </div>
  )
}

// ── StatCard ─────────────────────────────────────────────────────────────────
export function StatCard({ title, value, subtitle, icon: Icon, color = 'blue', trend }) {
  const c = COLOR[color] || COLOR.blue
  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-3)', marginBottom: 8 }}>
            {title}
          </p>
          <p style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-1)', lineHeight: 1, letterSpacing: '-0.02em' }}>
            {value}
          </p>
          {subtitle && (
            <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 6 }}>{subtitle}</p>
          )}
          {trend !== undefined && (
            <p style={{ fontSize: 12, marginTop: 4, fontWeight: 600, color: trend >= 0 ? 'var(--green)' : 'var(--red)' }}>
              {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
            </p>
          )}
        </div>
        {Icon && (
          <div style={{
            width: 44, height: 44, borderRadius: 12, flexShrink: 0,
            background: c.bg, border: `1px solid ${c.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: c.color,
          }}>
            <Icon size={20} />
          </div>
        )}
      </div>
    </Card>
  )
}

// ── CongestionBadge ───────────────────────────────────────────────────────────
export function CongestionBadge({ level }) {
  const s = CONGESTION[level] || { bg: 'rgba(148,163,184,0.1)', color: '#94a3b8', dot: '#94a3b8' }
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 10px', borderRadius: 99,
      background: s.bg, color: s.color,
      fontSize: 12, fontWeight: 600, textTransform: 'capitalize',
      border: `1px solid ${s.dot}30`,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.dot, flexShrink: 0 }} />
      {level}
    </span>
  )
}

// ── Badge ─────────────────────────────────────────────────────────────────────
export function Badge({ children, color = 'blue' }) {
  const c = COLOR[color] || COLOR.blue
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '3px 10px', borderRadius: 99,
      background: c.bg, color: c.color,
      fontSize: 12, fontWeight: 600,
      border: `1px solid ${c.border}`,
    }}>
      {children}
    </span>
  )
}

// ── Button ────────────────────────────────────────────────────────────────────
const BTN_VARIANTS = {
  primary:   { background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: '#fff', border: 'none', shadow: '0 4px 12px rgba(59,130,246,0.35)' },
  secondary: { background: 'rgba(59,130,246,0.10)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.25)', shadow: 'none' },
  ghost:     { background: 'transparent', color: 'var(--text-2)', border: '1px solid var(--border-strong)', shadow: 'none' },
  danger:    { background: 'rgba(239,68,68,0.10)', color: '#f87171', border: '1px solid rgba(239,68,68,0.25)', shadow: 'none' },
  success:   { background: 'rgba(34,197,94,0.10)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.25)', shadow: 'none' },
}
const BTN_SIZES = {
  sm: { padding: '6px 14px', fontSize: 12 },
  md: { padding: '8px 18px', fontSize: 13.5 },
  lg: { padding: '11px 24px', fontSize: 14 },
}

export function Button({ children, onClick, disabled, variant = 'primary', size = 'md', className = '', type = 'button', loading, style: extraStyle = {} }) {
  const v = BTN_VARIANTS[variant] || BTN_VARIANTS.primary
  const s = BTN_SIZES[size] || BTN_SIZES.md
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={className}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7,
        borderRadius: 9, fontWeight: 600, cursor: 'pointer',
        transition: 'all 0.15s', fontFamily: 'inherit',
        opacity: (disabled || loading) ? 0.55 : 1,
        ...v, ...s, ...extraStyle,
      }}
    >
      {loading && (
        <span style={{
          width: 13, height: 13, borderRadius: '50%',
          border: '2px solid currentColor', borderTopColor: 'transparent',
          animation: 'spin 0.7s linear infinite', display: 'inline-block', flexShrink: 0,
        }} />
      )}
      {children}
    </button>
  )
}

// ── PageHeader ────────────────────────────────────────────────────────────────
export function PageHeader({ title, subtitle, actions }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 24 }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-0.02em', lineHeight: 1.2 }}>{title}</h1>
        {subtitle && <p style={{ fontSize: 13.5, color: 'var(--text-2)', marginTop: 5 }}>{subtitle}</p>}
      </div>
      {actions && <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>{actions}</div>}
    </div>
  )
}

// ── Input ─────────────────────────────────────────────────────────────────────
export function Input({ label, error, ...props }) {
  return (
    <div>
      {label && (
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }}>
          {label}
        </label>
      )}
      <input
        style={{
          width: '100%', padding: '9px 12px', borderRadius: 8,
          background: 'var(--bg-input)', border: `1px solid ${error ? 'var(--red)' : 'var(--border-strong)'}`,
          color: 'var(--text-1)', fontSize: 13.5,
        }}
        {...props}
      />
      {error && <p style={{ fontSize: 11, color: 'var(--red)', marginTop: 4 }}>{error}</p>}
    </div>
  )
}

// ── Select ────────────────────────────────────────────────────────────────────
export function Select({ label, children, ...props }) {
  return (
    <div>
      {label && (
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }}>
          {label}
        </label>
      )}
      <select
        style={{
          width: '100%', padding: '9px 12px', borderRadius: 8,
          background: 'var(--bg-input)', border: '1px solid var(--border-strong)',
          color: 'var(--text-1)', fontSize: 13.5, cursor: 'pointer',
        }}
        {...props}
      >
        {children}
      </select>
    </div>
  )
}

// ── Spinner ───────────────────────────────────────────────────────────────────
export function Spinner({ size = 28 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{
        width: size, height: size, borderRadius: '50%',
        border: '2.5px solid var(--border-strong)',
        borderTopColor: 'var(--accent)',
        animation: 'spin 0.7s linear infinite',
      }} />
    </div>
  )
}

// ── EmptyState ────────────────────────────────────────────────────────────────
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', textAlign: 'center' }}>
      {Icon && <Icon size={44} style={{ color: 'var(--text-3)', marginBottom: 14, opacity: 0.5 }} />}
      <p style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-1)', marginBottom: 6 }}>{title}</p>
      {description && <p style={{ fontSize: 13, color: 'var(--text-2)', maxWidth: 320 }}>{description}</p>}
      {action && <div style={{ marginTop: 16 }}>{action}</div>}
    </div>
  )
}

// ── SectionTitle ──────────────────────────────────────────────────────────────
export function SectionTitle({ children }) {
  return (
    <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)', marginBottom: 14 }}>{children}</p>
  )
}

// ── Divider ───────────────────────────────────────────────────────────────────
export function Divider() {
  return <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />
}

// ── Recharts tooltip style ────────────────────────────────────────────────────
export const tooltipStyle = {
  background: '#111d35',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 10,
  fontSize: 12,
  boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
}
export const tooltipLabelStyle = { color: '#f0f6ff', fontWeight: 600, marginBottom: 4 }
export const tooltipItemStyle  = { color: '#8ba3c7' }
