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

  // If cart is empty, redirect
  useEffect(() => {
    if (items.length === 0) {
      navigate('/menu');
    }
  }, [items, navigate]);

  const handlePayment = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.street || !formData.city || !formData.pincode || !formData.phone) {
      return setError('Please fill all required address fields.');
    }

    setLoading(true);

    try {
      // 1. Create order in our DB
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

      const orderRes = await api.post('/orders', orderData);
      if (!orderRes.data.success) throw new Error(orderRes.data.message || 'Failed to place order');
      const orderId = orderRes.data.order._id;

      // 2. Load Razorpay
      const resRazorpay = await loadRazorpay();
      if (!resRazorpay) throw new Error('Razorpay SDK failed to load');

      // 3. Create Razorpay order
      const paymentRes = await api.post('/payment/create-order', {
        amount: cartTotal,
        orderId: orderId
      });
      
      if (!paymentRes.data.success) throw new Error('Failed to initiate payment');

      const { razorpayOrderId, amount, currency, keyId } = paymentRes.data;

      // 4. Open Razorpay Checkout
      const options = {
        key: keyId,
        amount: amount.toString(),
        currency: currency,
        name: "Melcho Desserts",
        description: `Order #${orderId.slice(-8)}`,
        order_id: razorpayOrderId,
        handler: async function (response) {
          try {
            // 5. Verify payment
            const verifyRes = await api.post('/payment/verify', {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              orderId: orderId
            });

            if (verifyRes.data.success) {
              clearCart();
              navigate('/order-success', { state: { orderId, total: cartTotal, items: items.length } });
            } else {
              setError('Payment verification failed.');
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
        theme: {
          color: "#d97706" // amber-600
        }
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.on('payment.failed', function (response) {
        setError(response.error.description || 'Payment failed. Please try again.');
      });
      rzp1.open();

    } catch (err) {
      setError(err.message || 'An error occurred during checkout');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) return null;

  return (
    <div className="min-h-screen bg-amber-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-playfair text-4xl font-bold text-gray-900 mb-8">Checkout</h1>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-8 border border-red-100">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Form */}
          <div className="lg:col-span-7">
            <form id="checkout-form" onSubmit={handlePayment} className="bg-white p-8 rounded-3xl shadow-sm border border-amber-100 space-y-6">
              <h2 className="font-playfair text-2xl font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">Delivery Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input type="text" value={user?.name || ''} readOnly className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                  <input type="tel" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="10-digit mobile number" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Street Address *</label>
                <textarea required rows="2" value={formData.street} onChange={e => setFormData({...formData, street: e.target.value})} placeholder="House/Flat No, Building Name, Street" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none resize-none" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                  <input type="text" required value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} placeholder="City" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pincode *</label>
                  <input type="text" required value={formData.pincode} onChange={e => setFormData({...formData, pincode: e.target.value})} placeholder="6-digit PIN" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Landmark (Optional)</label>
                <input type="text" value={formData.landmark} onChange={e => setFormData({...formData, landmark: e.target.value})} placeholder="Near famous place" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none" />
              </div>
            </form>
          </div>

          {/* Summary */}
          <div className="lg:col-span-5">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-amber-100 sticky top-24">
              <h2 className="font-playfair text-2xl font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">Order Summary</h2>
              
              <div className="space-y-4 mb-6 max-h-[40vh] overflow-y-auto pr-2">
                {items.map((item) => (
                  <div key={item.product._id} className="flex justify-between items-start text-sm">
                    <div>
                      <p className="font-medium text-gray-900">{item.product.title}</p>
                      <p className="text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-medium text-gray-900">{formatCurrency(item.product.price * item.quantity)}</p>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-4 mb-8">
                <div className="flex justify-between items-center text-xl font-bold">
                  <span className="text-gray-900">Total to Pay</span>
                  <span className="text-amber-700">{formatCurrency(cartTotal)}</span>
                </div>
              </div>

              <button
                type="submit"
                form="checkout-form"
                disabled={loading}
                className="w-full py-4 px-4 rounded-xl shadow-lg shadow-amber-200 text-lg font-bold text-white bg-amber-600 hover:bg-amber-700 focus:outline-none transition-colors disabled:opacity-70 flex justify-center items-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Processing...
                  </>
                ) : (
                  `Pay ${formatCurrency(cartTotal)} securely`
                )}
              </button>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
