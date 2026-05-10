import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function Home() {
  const { isLoggedIn } = useAuth();

  return (
    <div style={{ minHeight: '100vh', background: '#0d0d0d', color: '#f5f5f5', fontFamily: 'sans-serif' }}>
      <Navbar />

      {/* Hero */}
      <div style={{ textAlign: 'center', padding: '120px 24px 80px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(200,169,110,.1)', border: '1px solid rgba(200,169,110,.25)', borderRadius: '999px', padding: '6px 16px', fontSize: '12px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#c8a96e', marginBottom: '28px' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#c8a96e', display: 'inline-block', animation: 'pulse 2s infinite' }}></span>
          Now Delivering Across the City
        </div>
        <h1 style={{ fontSize: 'clamp(42px,7vw,88px)', fontWeight: 900, lineHeight: 1.05, marginBottom: '24px', letterSpacing: '-2px' }}>
          Desserts That<br />Make You{' '}
          <span style={{ background: 'linear-gradient(135deg,#c8a96e,#e8c98a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Say Wow.</span>
        </h1>
        <p style={{ fontSize: '18px', color: '#aaa', marginBottom: '40px', maxWidth: '480px', margin: '0 auto 40px', lineHeight: 1.7 }}>
          Premium handcrafted cakes, pastries &amp; more — delivered warm to your door.
        </p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {isLoggedIn ? (
            <Link to="/menu" style={{ background: 'linear-gradient(135deg,#c8a96e,#e8c98a)', color: '#0d0d0d', padding: '16px 40px', borderRadius: '999px', fontSize: '16px', fontWeight: 700 }}>Order Now 🍰</Link>
          ) : (
            <Link to="/register" style={{ background: 'linear-gradient(135deg,#c8a96e,#e8c98a)', color: '#0d0d0d', padding: '16px 40px', borderRadius: '999px', fontSize: '16px', fontWeight: 700 }}>Get Started 🍰</Link>
          )}
        </div>
        <div style={{ marginTop: '80px', fontSize: '80px', animation: 'float 4s ease-in-out infinite' }}>🎂</div>
      </div>

      <style>{`
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-16px)}}
      `}</style>
    </div>
  );
}
