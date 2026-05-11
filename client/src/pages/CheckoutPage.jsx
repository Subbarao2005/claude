import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { formatCurrency } from '../utils/helpers';

const loadRazorpay = () => new Promise(resolve => {
  const s = document.createElement("script");
  s.src = "https://checkout.razorpay.com/v1/checkout.js";
  s.onload = () => resolve(true);
  s.onerror = () => resolve(false);
  document.body.appendChild(s);
});

export default function CheckoutPage() {
  const { items, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    street: '',
    city: '',
    pincode: '',
    phone: '',
    landmark: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (items.length === 0) navigate('/menu');
  }, [items, navigate]);

  const handlePayment = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.street || !formData.city || !formData.pincode || !formData.phone) {
      return setError('Please fill all required address fields.');
    }

    setLoading(true);

    try {
      // 1. Create DB Order
      const orderData = {
        products: items.map(item => ({
          productId: item.product._id,
          title: item.product.title,
          price: item.product.price,
          quantity: item.quantity
        })),
        totalAmount: cartTotal,
        address: formData
      };

      const { data: orderRes } = await api.post('/orders', orderData);
      const orderId = orderRes.order._id;

      // 2. Create Razorpay Order (Backend)
      const { data: rzpRes } = await api.post('/payment/create-order', {
        amount: cartTotal,
        orderId: orderId
      });

      // 3. Load Razorpay Script
      const scriptLoaded = await loadRazorpay();
      if (!scriptLoaded) throw new Error('Razorpay SDK failed to load');

      // 4. Razorpay Options
      const options = {
        key: rzpRes.keyId,
        amount: rzpRes.amount, 
        currency: rzpRes.currency,
        name: "Melcho Desserts",
        description: `Order #${orderId.slice(-6).toUpperCase()}`,
        order_id: rzpRes.razorpayOrderId,
        handler: async function (response) {
          try {
            const { data: verifyRes } = await api.post('/payment/verify', {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              orderId
            });

            if (verifyRes.success) {
              clearCart();
              navigate('/order-success', { state: { orderId } });
            }
          } catch (err) {
            setError(err.response?.data?.message || 'Payment verification failed.');
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
          contact: formData.phone
        },
        theme: { color: "#d97706" }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (resp) => setError(resp.error.description));
      rzp.open();

    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) return null;

  return (
    <div className="min-h-screen bg-amber-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-playfair text-4xl font-bold text-gray-900 mb-8 text-center">Finalize Your Order</h1>
        {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-8 border border-red-100 max-w-2xl mx-auto">{error}</div>}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-7">
            <form id="checkout-form" onSubmit={handlePayment} className="bg-white p-8 rounded-3xl shadow-sm border border-amber-100 space-y-6">
              <h2 className="text-2xl font-playfair font-bold mb-6 border-b pb-4">Delivery Address</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input type="tel" required placeholder="Phone Number" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-amber-500" />
                <input type="text" required placeholder="Pincode" value={formData.pincode} onChange={e => setFormData({...formData, pincode: e.target.value})} className="w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-amber-500" />
              </div>
              <textarea required placeholder="Full Street Address" rows="3" value={formData.street} onChange={e => setFormData({...formData, street: e.target.value})} className="w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-amber-500 resize-none" />
              <input type="text" required placeholder="City" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-amber-500" />
            </form>
          </div>
          <div className="lg:col-span-5">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-amber-100 sticky top-24">
              <h2 className="text-2xl font-playfair font-bold mb-6 border-b pb-4">Order Summary</h2>
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item._id} className="flex justify-between text-sm">
                    <span className="text-gray-600">{item.product.title} x {item.quantity}</span>
                    <span className="font-bold">₹{item.product.price * item.quantity}</span>
                  </div>
                ))}
              </div>
              <div className="border-t pt-4 flex justify-between text-xl font-bold mb-8">
                <span>Total</span>
                <span className="text-amber-700">₹{cartTotal}</span>
              </div>
              <button type="submit" form="checkout-form" disabled={loading} className="w-full py-4 bg-amber-600 text-white rounded-xl font-bold text-lg hover:bg-amber-700 shadow-lg shadow-amber-200 disabled:opacity-70 transition-all">
                {loading ? "Processing Payment..." : `Securely Pay ₹${cartTotal}`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
