import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { formatCurrency } from '../utils/helpers';
import { Loader2, ShieldCheck, AlertCircle, CreditCard } from 'lucide-react';

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ street: '', city: '', pincode: '', phone: '', landmark: '' });

  useEffect(() => { if (items.length === 0) navigate('/menu'); }, [items, navigate]);

  const initiatePayment = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError('');
    setLoading(true);

    try {
      // 1. Create Internal Order
      const { data: orderRes } = await api.post('/orders', {
        products: items.map(i => ({ productId: i.product._id, title: i.product.title, price: i.product.price, quantity: i.quantity })),
        totalAmount: cartTotal,
        address: formData
      });
      const orderId = orderRes.order._id;

      // 2. Initialize Razorpay Order
      const { data: rzpRes } = await api.post('/payment/create-order', { amount: cartTotal, orderId });
      const scriptLoaded = await loadRazorpay();
      if (!scriptLoaded) throw new Error('Razorpay SDK failed to load. Please check your connection.');

      // 3. Robust Options with UI Preference for UPI/Cards
      const options = {
        key: rzpRes.keyId,
        amount: rzpRes.amount,
        currency: rzpRes.currency,
        name: "Melcho",
        description: `Order #${orderId.slice(-6).toUpperCase()}`,
        image: "https://res.cloudinary.com/dmshfpt8v/image/upload/v1715492000/melcho-logo.png",
        order_id: rzpRes.razorpayOrderId,
        modal: {
          confirm_close: true,
          ondismiss: function() { setLoading(false); }
        },
        // Force specific methods and layout to avoid flaky QR-only behavior
        method: {
          upi: true,
          card: true,
          netbanking: true,
          wallet: false
        },
        config: {
          display: {
            blocks: {
              upi: {
                name: "Pay via UPI ID / Mobile Number",
                instruments: [{ method: "upi" }]
              },
              other: {
                name: "Other Payment Methods",
                instruments: [{ method: "card" }, { method: "netbanking" }]
              }
            },
            sequence: ["block.upi", "block.other"],
            preferences: { show_default_blocks: false }
          }
        },
        handler: async function (response) {
          try {
            setLoading(true);
            const { data: vRes } = await api.post('/payment/verify', {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              orderId
            });
            if (vRes.success) {
              clearCart();
              navigate('/order-success', { state: { orderId } });
            }
          } catch (err) {
            setError(err.response?.data?.message || "Payment verification failed. Please contact support.");
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
          contact: formData.phone
        },
        theme: { color: "#d97706" },
        retry: { enabled: true, max_count: 3 }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', async function (response) {
        setLoading(false);
        setError(response.error.description);
        await api.post('/payment/failure', {
          orderId,
          razorpayOrderId: rzpRes.razorpayOrderId,
          errorData: response.error
        });
      });
      rzp.open();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setLoading(false);
    }
  };

  if (items.length === 0) return null;

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Address Form */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
              <div className="bg-amber-600 p-8 text-white">
                <h1 className="text-3xl font-playfair font-bold">Delivery Details</h1>
                <p className="text-amber-100 mt-1">Where should we bring your desserts?</p>
              </div>
              
              <form id="checkout-form" onSubmit={initiatePayment} className="p-8 space-y-6">
                {error && (
                  <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl flex items-center gap-3 text-sm animate-shake">
                    <AlertCircle size={20} /> {error}
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase ml-1">Phone Number</label>
                    <input type="tel" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none" placeholder="10-digit mobile" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase ml-1">Pincode</label>
                    <input type="text" required value={formData.pincode} onChange={e => setFormData({...formData, pincode: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none" placeholder="6-digit PIN" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1">Street Address</label>
                  <textarea required rows="3" value={formData.street} onChange={e => setFormData({...formData, street: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none resize-none" placeholder="House No, Building, Area" />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1">City</label>
                  <input type="text" required value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none" />
                </div>
              </form>
            </div>
          </div>

          {/* Sidebar Summary */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-8 sticky top-24">
              <h2 className="text-2xl font-playfair font-bold text-slate-900 mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-8 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {items.map((item) => (
                  <div key={item._id} className="flex justify-between items-center text-sm">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-800">{item.product.title}</span>
                      <span className="text-slate-400">Qty: {item.quantity}</span>
                    </div>
                    <span className="font-bold text-slate-900">₹{item.product.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-100 pt-6 space-y-3 mb-8">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal</span>
                  <span>₹{cartTotal}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Delivery</span>
                  <span className="text-emerald-600 font-bold uppercase text-[10px] bg-emerald-50 px-2 py-1 rounded-full">Free</span>
                </div>
                <div className="flex justify-between text-2xl font-bold text-slate-900 pt-2">
                  <span>Total</span>
                  <span className="text-amber-600">₹{cartTotal}</span>
                </div>
              </div>

              <button
                type="submit"
                form="checkout-form"
                disabled={loading}
                className="w-full bg-slate-900 text-white py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={24} />
                    Processing...
                  </>
                ) : (
                  <>
                    <ShieldCheck size={24} />
                    Pay ₹{cartTotal} Securely
                  </>
                )}
              </button>
              
              <div className="mt-6 flex items-center justify-center gap-2 text-slate-400 text-xs">
                <CreditCard size={14} />
                <span>Protected by Razorpay 256-bit SSL</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
