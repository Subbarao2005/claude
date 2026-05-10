import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useCart } from '../context/CartContext';

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, total } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (cart.length === 0) return;
    navigate('/checkout');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0d0d0d', color: '#f5f5f5' }}>
      <Navbar />
      <div style={{ padding: '40px 32px', maxWidth: '1000px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '36px', fontWeight: 900, marginBottom: '32px' }}>Your Cart</h1>
        
        {cart.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', background: '#111', borderRadius: '16px' }}>
            <div style={{ fontSize: '64px', marginBottom: '24px' }}>🛒</div>
            <h2 style={{ fontSize: '24px', color: '#aaa', marginBottom: '24px' }}>Your cart is empty</h2>
            <Link to="/menu" style={{ background: 'linear-gradient(135deg,#c8a96e,#e8c98a)', color: '#0d0d0d', padding: '12px 32px', borderRadius: '999px', fontSize: '16px', fontWeight: 700 }}>Browse Menu</Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '32px' }}>
            {/* Cart Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {cart.map(item => (
                <div key={item._id} style={{ display: 'flex', gap: '24px', background: '#111', padding: '20px', borderRadius: '16px', alignItems: 'center' }}>
                  <img src={item.image} alt={item.title} style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px' }} />
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '18px', margin: '0 0 8px 0' }}>{item.title}</h3>
                    <p style={{ color: '#c8a96e', fontWeight: 900, margin: 0 }}>₹{item.price}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#222', borderRadius: '8px', padding: '4px 8px' }}>
                    <button onClick={() => updateQuantity(item._id, -1)} style={{ background: 'transparent', border: 'none', color: '#f5f5f5', fontSize: '18px', cursor: 'pointer', width: '24px' }}>-</button>
                    <span style={{ fontWeight: 700, width: '20px', textAlign: 'center' }}>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item._id, 1)} style={{ background: 'transparent', border: 'none', color: '#f5f5f5', fontSize: '18px', cursor: 'pointer', width: '24px' }}>+</button>
                  </div>
                  <button onClick={() => removeFromCart(item._id)} style={{ background: 'transparent', border: 'none', color: '#ff4d4d', cursor: 'pointer', padding: '8px', fontSize: '20px' }} title="Remove item">🗑️</button>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div style={{ background: '#111', padding: '32px', borderRadius: '16px', height: 'fit-content', position: 'sticky', top: '100px' }}>
              <h2 style={{ fontSize: '20px', marginBottom: '24px', borderBottom: '1px solid #333', paddingBottom: '16px' }}>Order Summary</h2>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', color: '#aaa' }}>
                <span>Subtotal</span>
                <span>₹{total}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', color: '#aaa' }}>
                <span>Delivery Fee</span>
                <span>₹50</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px', paddingTop: '16px', borderTop: '1px dashed #333', fontSize: '24px', fontWeight: 900 }}>
                <span>Total</span>
                <span style={{ color: '#c8a96e' }}>₹{total + 50}</span>
              </div>
              <button
                onClick={handleCheckout}
                style={{
                  width: '100%',
                  padding: '16px',
                  marginTop: '32px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg,#c8a96e,#e8c98a)',
                  border: 'none',
                  color: '#0d0d0d',
                  fontWeight: 900,
                  fontSize: '16px',
                  cursor: 'pointer',
                  letterSpacing: '1px'
                }}
              >
                PROCEED TO CHECKOUT
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
