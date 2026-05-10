import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const MOCK_PRODUCTS = [
  { _id: '1', title: 'Velvet Truffle Cake', description: 'Rich dark chocolate cake layered with Belgian truffle and topped with edible gold flakes.', price: 1200, category: 'Cakes', image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=600&auto=format&fit=crop' },
  { _id: '2', title: 'Strawberry Dream Pastry', description: 'Light sponge cake infused with fresh strawberries and vanilla bean mascarpone cream.', price: 250, category: 'Pastries', image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?q=80&w=600&auto=format&fit=crop' },
  { _id: '3', title: 'Classic Tiramisu', description: 'Authentic Italian dessert with espresso-soaked ladyfingers and creamy mascarpone.', price: 350, category: 'Puddings', image: 'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?q=80&w=600&auto=format&fit=crop' },
  { _id: '4', title: 'Macaron Box', description: 'Assorted box of 6 handcrafted French macarons in signature flavors.', price: 600, category: 'Specials', image: 'https://images.unsplash.com/photo-1569864358642-9d1684040f43?q=80&w=600&auto=format&fit=crop' },
  { _id: '5', title: 'Mango Cheesecake', description: 'New York style baked cheesecake topped with fresh Alphonso mango glaze.', price: 950, category: 'Cakes', image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?q=80&w=600&auto=format&fit=crop' },
  { _id: '6', title: 'Chocolate Lava Cake', description: 'Warm chocolate cake with a gooey, molten center. Perfect for cravings.', price: 280, category: 'Pastries', image: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?q=80&w=600&auto=format&fit=crop' }
];

export default function Menu() {
  const [products, setProducts] = useState(MOCK_PRODUCTS);
  const [category, setCategory] = useState('All');
  const { addToCart } = useCart();
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const categories = ['All', 'Cakes', 'Pastries', 'Puddings', 'Specials'];

  const filtered = category === 'All' ? products : products.filter(p => p.category === category);

  const handleAdd = (product) => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    addToCart(product);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0d0d0d', color: '#f5f5f5' }}>
      <Navbar />
      <div style={{ padding: '40px 32px' }}>
        <h1 style={{ textAlign: 'center', fontSize: '42px', fontWeight: 900, marginBottom: '32px' }}>Our Menu</h1>
        
        {/* Category Filters */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '48px', flexWrap: 'wrap' }}>
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              style={{
                padding: '8px 24px',
                borderRadius: '999px',
                border: '1px solid #333',
                background: category === c ? 'linear-gradient(135deg,#c8a96e,#e8c98a)' : '#111',
                color: category === c ? '#0d0d0d' : '#aaa',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '32px', maxWidth: '1200px', margin: '0 auto' }}>
          {filtered.map(product => (
            <div key={product._id} style={{ background: '#111', borderRadius: '16px', overflow: 'hidden', border: '1px solid #222', transition: 'transform 0.2s' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-8px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
              <div style={{ height: '240px', background: '#222', backgroundImage: `url(${product.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
              <div style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#f5f5f5', margin: 0 }}>{product.title}</h3>
                  <span style={{ fontSize: '18px', fontWeight: 900, color: '#c8a96e' }}>₹{product.price}</span>
                </div>
                <p style={{ color: '#aaa', fontSize: '14px', lineHeight: 1.6, marginBottom: '24px' }}>{product.description}</p>
                <button
                  onClick={() => handleAdd(product)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg,#c8a96e,#e8c98a)',
                    border: 'none',
                    color: '#0d0d0d',
                    fontWeight: 700,
                    fontSize: '16px',
                    cursor: 'pointer'
                  }}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
