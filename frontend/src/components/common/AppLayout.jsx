import Sidebar from './Sidebar'
import Navbar from './Navbar'

export default function AppLayout({ children, title }) {
  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg-base)' }}>
      <Sidebar />
      <div style={{
        display: 'flex', flexDirection: 'column', flex: 1,
        marginLeft: 'var(--sidebar-w)', overflow: 'hidden',
        minWidth: 0,
      }}>
        <Navbar title={title} />
        <main style={{
          flex: 1, overflowY: 'auto', overflowX: 'hidden',
          padding: '28px 28px 40px',
        }} className="anim-fade-up">
          {children}
        </main>
      </div>
    </div>
  )
}
