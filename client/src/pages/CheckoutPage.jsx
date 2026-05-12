import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Loader2, ShieldCheck, AlertCircle, MapPin, Phone, Landmark } from 'lucide-react';
import TestPaymentInfo from '../components/TestPaymentInfo';

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.error('Failed to load Razorpay script');
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

export default function CheckoutPage() {
  const { items, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [address, setAddress] = useState({
    street: '',
    city: '',
    pincode: '',
    phone: user?.phone || '',
    landmark: ''
  });
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (items.length === 0) navigate('/menu');
  }, [items, navigate]);

  const validateForm = () => {
    if (!address.street.trim()) return 'Street address is required';
    if (!address.city.trim()) return 'City is required';
    if (!/^\d{6}$/.test(address.pincode)) return 'Enter valid 6-digit pincode';
    if (!/^\d{10}$/.test(address.phone)) return 'Enter valid 10-digit phone number';
    return null;
  };

  const handlePayment = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    if (items.length === 0) {
      setError('Your cart is empty');
      return;
    }

    setPaymentLoading(true);
    setError(null);

    try {
      // Step 1: Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load payment gateway. Check internet connection.');
      }

      // Step 2: Create order in our DB first
      const orderPayload = {
        products: items.map(i => ({
          productId: i.product._id,
          title: i.product.title,
          price: i.product.price,
          quantity: i.quantity
        })),
        totalAmount: cartTotal,
        address: {
          street: address.street,
          city: address.city,
          pincode: address.pincode,
          phone: address.phone,
          landmark: address.landmark || ''
        }
      };

      const orderRes = await api.post('/orders', orderPayload);

      if (!orderRes.data.success) {
        throw new Error(orderRes.data.message || 'Failed to create order');
      }

      const dbOrderId = orderRes.data.order._id;

      // Step 3: Create Razorpay order
      const razorpayRes = await api.post('/payment/create-order', {
        amount: cartTotal,
        orderId: dbOrderId
      });

      if (!razorpayRes.data.success) {
        throw new Error(razorpayRes.data.message || 'Failed to initialize payment');
      }

      const { razorpayOrderId, amount, currency, keyId } = razorpayRes.data;

      // Step 4: Open Razorpay checkout
      const options = {
        key: keyId || import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: amount,
        currency: currency,
        name: 'Melcho',
        description: 'Premium Dessert Order',
        order_id: razorpayOrderId,
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: address.phone || ''
        },
        theme: {
          color: '#D97706'
        },
        handler: async (response) => {
          // Step 5: Verify payment on success
          try {
            const verifyRes = await api.post('/payment/verify', {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              orderId: dbOrderId
            });

            if (verifyRes.data.success) {
              clearCart();
              navigate('/order-success', {
                state: {
                  orderId: dbOrderId,
                  amount: cartTotal
                }
              });
            } else {
              setError('Payment verification failed. Contact support.');
            }
          } catch (verifyErr) {
            console.error('Verify error:', verifyErr);
            setError('Payment done but verification failed. Contact support with order ID: ' + dbOrderId);
          }
        },
        modal: {
          ondismiss: () => {
            setPaymentLoading(false);
            setError('Payment cancelled. Your order was not placed.');
          }
        }
      };

      const razorpayInstance = new window.Razorpay(options);

      razorpayInstance.on('payment.failed', (response) => {
        console.error('Payment failed:', response.error);
        setError(`Payment failed: ${response.error.description}`);
        setPaymentLoading(false);
      });

      razorpayInstance.open();

    } catch (err) {
      console.error('Payment error:', err);
      setError(err.message || 'Payment failed. Please try again.');
    } finally {
      setPaymentLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7">
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
            <h1 className="text-3xl font-playfair font-bold text-slate-900 mb-8">Checkout</h1>
            
            {error && (
              <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl flex items-center gap-3 text-sm border border-red-100">
                <AlertCircle size={20} /> {error}
              </div>
            )}

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <MapPin size={14} /> Street Address
                </label>
                <input
                  type="text"
                  value={address.street}
                  onChange={e => setAddress({...address, street: e.target.value})}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                  placeholder="House No, Building, Street Name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    City
                  </label>
                  <input
                    type="text"
                    value={address.city}
                    onChange={e => setAddress({...address, city: e.target.value})}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                    placeholder="City"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    Pincode
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={address.pincode}
                    onChange={e => setAddress({...address, pincode: e.target.value})}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                    placeholder="6 digits"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <Phone size={14} /> Phone
                  </label>
                  <input
                    type="text"
                    maxLength={10}
                    value={address.phone}
                    onChange={e => setAddress({...address, phone: e.target.value})}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                    placeholder="10 digits"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <Landmark size={14} /> Landmark
                  </label>
                  <input
                    type="text"
                    value={address.landmark}
                    onChange={e => setAddress({...address, landmark: e.target.value})}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                    placeholder="Optional"
                  />
                </div>
              </div>
            </div>
            
            <TestPaymentInfo />
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 sticky top-8">
            <h2 className="text-2xl font-playfair font-bold text-slate-900 mb-6">Order Summary</h2>
            <div className="space-y-4 mb-8">
              {items.map((item) => (
                <div key={item._id} className="flex justify-between items-center text-sm">
                  <span className="text-slate-600 font-medium">{item.product.title} x {item.quantity}</span>
                  <span className="font-bold text-slate-900">₹{item.product.price * item.quantity}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-slate-100 pt-6 mb-8">
              <div className="flex justify-between items-center text-2xl font-bold text-slate-900">
                <span>Total Amount</span>
                <span className="text-amber-600">₹{cartTotal}</span>
              </div>
            </div>
            <button
              onClick={handlePayment}
              disabled={paymentLoading || items.length === 0}
              className="w-full py-5 bg-amber-600 text-white rounded-2xl font-bold text-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl shadow-amber-100 flex items-center justify-center gap-3"
            >
              {paymentLoading ? (
                <>
                  <Loader2 className="animate-spin" size={24} />
                  Processing...
                </>
              ) : (
                <>
                  <ShieldCheck size={24} />
                  Pay ₹{cartTotal}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
