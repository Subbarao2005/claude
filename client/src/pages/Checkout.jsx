import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function Checkout() {
  const { cart, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!address || !phone) return alert('Please fill in all details');
    
    setLoading(true);
    // Mocking an order placement
    setTimeout(() => {
      setLoading(false);
      clearCart();
      navigate('/track/mock-order-id-12345');
    }, 1500);
  };

  if (cart.length === 0) {
    navigate('/menu');
    return null;
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0d0d0d', color: '#f5f5f5' }}>
      <Navbar />
      <div style={{ padding: '40px 32px', maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 900, marginBottom: '32px' }}>Checkout</h1>
        
        <form onSubmit={handlePlaceOrder} style={{ background: '#111', padding: '32px', borderRadius: '16px' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '24px', color: '#c8a96e' }}>Delivery Details</h2>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#aaa', fontSize: '14px' }}>Name</label>
            <input type="text" value={user?.name || ''} readOnly style={{ width: '100%', padding: '12px', background: '#222', border: '1px solid #333', color: '#aaa', borderRadius: '8px', cursor: 'not-allowed' }} />
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#aaa', fontSize: '14px' }}>Phone Number</label>
            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Enter 10-digit mobile number" style={{ width: '100%', padding: '12px', background: '#222', border: '1px solid #333', color: '#f5f5f5', borderRadius: '8px' }} required />
          </div>
          
          <div style={{ marginBottom: '32px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#aaa', fontSize: '14px' }}>Delivery Address</label>
            <textarea value={address} onChange={e => setAddress(e.target.value)} placeholder="Complete address with landmark" rows="3" style={{ width: '100%', padding: '12px', background: '#222', border: '1px solid #333', color: '#f5f5f5', borderRadius: '8px', resize: 'vertical' }} required></textarea>
          </div>

          <h2 style={{ fontSize: '20px', marginBottom: '24px', color: '#c8a96e', borderTop: '1px solid #333', paddingTop: '24px' }}>Payment Method</h2>
          <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
            <div style={{ flex: 1, padding: '16px', border: '1px solid #c8a96e', borderRadius: '8px', background: 'rgba(200,169,110,0.1)', textAlign: 'center', cursor: 'pointer' }}>
              <strong>Cash on Delivery</strong>
            </div>
            {/* Pay Online mock option */}
            <div style={{ flex: 1, padding: '16px', border: '1px solid #333', borderRadius: '8px', background: '#222', textAlign: 'center', cursor: 'not-allowed', color: '#666' }}>
              <strong>Pay Online</strong><br/><small>(Coming Soon)</small>
            </div>
          </div>
          
          <div style={{ borderTop: '1px solid #333', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 900 }}>Total: <span style={{ color: '#c8a96e' }}>₹{total + 50}</span></div>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '16px 48px',
                borderRadius: '8px',
                background: loading ? '#555' : 'linear-gradient(135deg,#c8a96e,#e8c98a)',
                border: 'none',
                color: '#0d0d0d',
                fontWeight: 900,
                fontSize: '16px',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Placing Order...' : 'PLACE ORDER'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
