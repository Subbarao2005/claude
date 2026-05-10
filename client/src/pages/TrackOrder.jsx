import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function TrackOrder() {
  const { id } = useParams();

  return (
    <div style={{ minHeight: '100vh', background: '#0d0d0d', color: '#f5f5f5' }}>
      <Navbar />
      <div style={{ padding: '60px 32px', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{ fontSize: '80px', marginBottom: '24px', animation: 'bounce 2s infinite' }}>🛵</div>
        <h1 style={{ fontSize: '32px', fontWeight: 900, marginBottom: '16px', color: '#c8a96e' }}>Order Placed Successfully!</h1>
        <p style={{ color: '#aaa', fontSize: '16px', marginBottom: '40px' }}>Your order <strong>#{id}</strong> is being prepared by our chefs.</p>
        
        <div style={{ background: '#111', padding: '32px', borderRadius: '16px', textAlign: 'left', marginBottom: '40px' }}>
          <h3 style={{ borderBottom: '1px solid #333', paddingBottom: '16px', marginBottom: '24px' }}>Order Status</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#c8a96e', boxShadow: '0 0 10px #c8a96e' }}></div>
              <div>
                <h4 style={{ margin: 0, fontSize: '16px' }}>Order Confirmed</h4>
                <p style={{ margin: 0, color: '#aaa', fontSize: '12px' }}>We've received your order.</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', opacity: 0.5 }}>
              <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#333' }}></div>
              <div>
                <h4 style={{ margin: 0, fontSize: '16px' }}>Preparing</h4>
                <p style={{ margin: 0, color: '#aaa', fontSize: '12px' }}>Chef is baking your desserts.</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', opacity: 0.5 }}>
              <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#333' }}></div>
              <div>
                <h4 style={{ margin: 0, fontSize: '16px' }}>Out for Delivery</h4>
                <p style={{ margin: 0, color: '#aaa', fontSize: '12px' }}>Rider is on the way.</p>
              </div>
            </div>
          </div>
        </div>

        <Link to="/menu" style={{ background: '#222', color: '#f5f5f5', padding: '12px 32px', borderRadius: '999px', fontSize: '16px', fontWeight: 700, border: '1px solid #333' }}>Back to Menu</Link>

        <style>{`
          @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        `}</style>
      </div>
    </div>
  );
}
