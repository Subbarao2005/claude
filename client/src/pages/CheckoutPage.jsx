import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { MapPin, Phone, ShoppingBag, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { formatCurrency } from '../utils/helpers';

export default function CheckoutPage() {
  const { items, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [address, setAddress] = useState({
    street: '',
    city: '',
    pincode: '',
    phone: user?.phone || '',
    landmark: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validItems = (items || []).filter(item => item && item.product);

  useEffect(() => {
    if (validItems.length === 0) {
      navigate('/menu');
    }
  }, [validItems.length, navigate]);

  const updateAddress = (field, value) => {
    setAddress(prev => ({ ...prev, [field]: value }));
  };

  const validate = () => {
    if (!address.street.trim()) return 'Street address is required';
    if (!address.city.trim()) return 'City is required';
    if (!/^\d{6}$/.test(address.pincode.trim())) return 'Pincode must be 6 digits';
    if (!/^\d{10}$/.test(address.phone.trim())) return 'Phone must be 10 digits';
    if (validItems.length === 0) return 'Your cart is empty';
    if (!cartTotal || cartTotal <= 0) return 'Cart total must be greater than zero';
    return '';
  };

  const handlePayment = async () => {
    setLoading(true);
    setError('');

    try {
      const validationError = validate();
      if (validationError) {
        setError(validationError);
        return;
      }

      const orderPayload = {
        products: validItems.map(item => ({
          productId: item?.product?._id,
          title: item?.product?.title || 'Unknown Item',
          price: item?.product?.price || 0,
          quantity: item?.quantity || 1,
        })),
        totalAmount: cartTotal || 0,
        address: {
          street: address.street.trim(),
          city: address.city.trim(),
          pincode: address.pincode.trim(),
          phone: address.phone.trim(),
          landmark: address.landmark.trim(),
        },
      };

      console.log('Order payload:', orderPayload);

      const orderRes = await api.post('/orders', orderPayload);
      if (!orderRes.data.success) {
        throw new Error(orderRes.data.message || 'Order creation failed');
      }

      const createdOrder = orderRes.data.order;
      const orderId = createdOrder?._id;
      if (!orderId) {
        throw new Error('Order created but order id was missing');
      }

      const paymentRes = await api.post('/payment/create-order', {
        amount: cartTotal || 0,
        orderId,
      });
      if (!paymentRes.data.success) {
        throw new Error(paymentRes.data.message || 'Payment order creation failed');
      }

      const options = {
        key: paymentRes.data.keyId,
        amount: paymentRes.data.amount,
        currency: paymentRes.data.currency || 'INR',
        name: 'Melcho Desserts',
        description: 'Premium Dessert Order',
        order_id: paymentRes.data.razorpayOrderId,
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: address.phone,
        },
        theme: { color: '#D97706' },
        handler: async (response) => {
          setLoading(true);
          setError('');
          try {
            const verifyRes = await api.post('/payment/verify', {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              orderId,
            });

            if (verifyRes.data.success) {
              clearCart();
              navigate('/order-success', { state: { orderId, amount: cartTotal || 0 } });
            } else {
              setError(verifyRes.data.message || 'Payment verification failed');
            }
          } catch (err) {
            setError(err.response?.data?.message || 'Payment verification failed');
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => setLoading(false),
        },
      };

      if (!window.Razorpay) {
        throw new Error('Razorpay is not loaded. Please refresh and try again.');
      }

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-main pt-24 pb-24 animate-fadeIn">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <button
          onClick={() => navigate('/menu')}
          className="flex items-center gap-2 text-stone-400 hover:text-primary font-bold text-xs uppercase tracking-widest mb-8 transition-colors group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Menu
        </button>

        <div className="flex flex-col lg:flex-row gap-12 items-start">
          <div className="w-full lg:w-[60%] space-y-8">
            <div className="bg-white rounded-[2.5rem] p-10 border border-stone-100 shadow-sm space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-primary-light text-primary rounded-2xl flex items-center justify-center">
                  <MapPin size={28} />
                </div>
                <div>
                  <h1 className="text-3xl font-playfair font-extrabold text-stone-900">Delivery Details</h1>
                  <p className="text-stone-400 font-medium">All fields are editable. Enter your delivery address.</p>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-100 p-4 rounded-2xl text-red-600 text-sm font-bold">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Street Address</label>
                  <textarea
                    value={address.street}
                    onChange={(e) => updateAddress('street', e.target.value)}
                    rows={3}
                    required
                    className="w-full px-6 py-4 bg-stone-50 border border-stone-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 transition-all font-medium resize-none"
                    placeholder="House/Flat no., Building, Street, Area"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">City</label>
                  <input
                    type="text"
                    value={address.city}
                    onChange={(e) => updateAddress('city', e.target.value)}
                    required
                    className="w-full px-6 py-4 bg-stone-50 border border-stone-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 transition-all font-medium"
                    placeholder="Enter city"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Pincode</label>
                  <input
                    type="text"
                    maxLength={6}
                    value={address.pincode}
                    onChange={(e) => updateAddress('pincode', e.target.value.replace(/\D/g, ''))}
                    required
                    className="w-full px-6 py-4 bg-stone-50 border border-stone-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 transition-all font-medium"
                    placeholder="6-digit pincode"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Phone Number</label>
                  <div className="relative group">
                    <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-primary transition-colors" size={18} />
                    <input
                      type="tel"
                      value={address.phone}
                      onChange={(e) => updateAddress('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                      required
                      className="w-full pl-14 pr-6 py-4 bg-stone-50 border border-stone-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 transition-all font-medium"
                      placeholder="10-digit mobile"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Landmark</label>
                  <input
                    type="text"
                    value={address.landmark}
                    onChange={(e) => updateAddress('landmark', e.target.value)}
                    className="w-full px-6 py-4 bg-stone-50 border border-stone-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 transition-all font-medium"
                    placeholder="Optional landmark"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-[40%] lg:sticky lg:top-24 space-y-6">
            <div className="bg-white rounded-[2.5rem] p-10 border border-stone-100 shadow-xl space-y-8">
              <h2 className="text-2xl font-playfair font-extrabold text-stone-900 border-b border-stone-50 pb-6">Order Summary</h2>

              <div className="space-y-6 max-h-64 overflow-y-auto pr-2 no-scrollbar">
                {validItems.map((item, index) => (
                  <div key={item?.product?._id || `item-${index}`} className="flex justify-between items-center group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-stone-50 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center text-stone-300">
                        {item?.product?.image ? (
                          <img src={item?.product?.image} alt={item?.product?.title || 'Item'} className="w-full h-full object-cover" />
                        ) : (
                          <ShoppingBag size={20} />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-stone-900 text-sm group-hover:text-primary transition-colors">{item?.product?.title || 'Unknown Item'}</p>
                        <p className="text-xs text-stone-400 font-bold">Qty: {item?.quantity || 1}</p>
                      </div>
                    </div>
                    <span className="font-bold text-stone-900">{formatCurrency((item?.product?.price || 0) * (item?.quantity || 1))}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-4 pt-6 border-t border-stone-50">
                <div className="flex justify-between text-stone-400 text-xs font-black uppercase tracking-widest">
                  <span>Subtotal</span>
                  <span>{formatCurrency(cartTotal || 0)}</span>
                </div>
                <div className="flex justify-between text-stone-400 text-xs font-black uppercase tracking-widest">
                  <span>Delivery Fee</span>
                  <span className="text-emerald-600">Free</span>
                </div>
                <div className="h-px bg-stone-100" />
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-playfair font-extrabold text-stone-900">Total</span>
                  <span className="text-3xl font-bold text-primary">{formatCurrency(cartTotal || 0)}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handlePayment}
                disabled={loading}
                className="w-full py-6 bg-stone-900 text-white rounded-[2rem] font-bold text-lg shadow-2xl shadow-stone-900/20 hover:bg-primary transition-all active:scale-95 disabled:opacity-60 flex items-center justify-center gap-4 group"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" /> Please wait...
                  </>
                ) : (
                  <>
                    Pay {formatCurrency(cartTotal || 0)} <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
