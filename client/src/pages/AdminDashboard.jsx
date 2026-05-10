import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/admin/login'); };

  return (
    <div style={{ minHeight: '100vh', background: '#0d0d0d', color: '#f5f5f5', fontFamily: 'sans-serif' }}>
      <nav style={{ background: '#111', borderBottom: '1px solid #2a2a2a', padding: '0 32px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <span style={{ fontWeight: 900, fontSize: '20px', letterSpacing: '3px', background: 'linear-gradient(135deg,#c8a96e,#e8c98a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>MELCHO</span>
          <span style={{ marginLeft: '12px', fontSize: '12px', background: 'rgba(200,169,110,.1)', border: '1px solid rgba(200,169,110,.3)', borderRadius: '4px', padding: '2px 8px', color: '#c8a96e', fontWeight: 700 }}>ADMIN</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ color: '#c8a96e', fontSize: '14px' }}>👤 {user?.name}</span>
          <button onClick={handleLogout} style={{ background: 'transparent', border: '1px solid #2a2a2a', color: '#aaa', padding: '8px 16px', borderRadius: '20px', cursor: 'pointer', fontSize: '13px' }}>Logout</button>
        </div>
      </nav>

      <div style={{ padding: '40px 32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 900, marginBottom: '8px' }}>Admin Dashboard</h1>
        <p style={{ color: '#777', marginBottom: '40px' }}>Welcome back, {user?.name}. Manage your orders and deliveries below.</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: '20px', marginBottom: '40px' }}>
          {[
            { label: 'Total Orders', value: '—', icon: '📦' },
            { label: 'Active Orders', value: '—', icon: '🔄' },
            { label: "Today's Revenue", value: '—', icon: '💰' },
            { label: 'Delivered Today', value: '—', icon: '✅' },
          ].map((s) => (
            <div key={s.label} style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '16px', padding: '24px', textAlign: 'center' }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>{s.icon}</div>
              <div style={{ fontSize: '28px', fontWeight: 900, color: '#c8a96e', marginBottom: '4px' }}>{s.value}</div>
              <div style={{ fontSize: '13px', color: '#777' }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '16px', padding: '32px', textAlign: 'center' }}>
          <div style={{ fontSize: '40px', marginBottom: '16px' }}>🚧</div>
          <h2 style={{ marginBottom: '8px' }}>Orders management coming in Phase 2</h2>
          <p style={{ color: '#777', fontSize: '14px' }}>This dashboard will show all orders, statuses, and delivery management tools.</p>
        </div>
      </div>
    </div>
  );
}
