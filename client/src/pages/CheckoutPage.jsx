import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { 
  MapPin, 
  Phone, 
  User, 
  ChevronRight, 
  ShieldCheck, 
  CreditCard, 
  Loader2,
  ArrowLeft,
  ArrowRight,
  Truck
} from 'lucide-react';
import { formatCurrency } from '../utils/helpers';

export default function CheckoutPage() {
  const { items, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: '',
    city: 'Hyderabad',
    pincode: '',
    landmark: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (items.length === 0) {
      toast.error('Your cart is empty');
      navigate('/menu');
    }
  }, [items, navigate]);

  const validate = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Full name is required';
    if (!/^\d{10}$/.test(formData.phone)) newErrors.phone = '10-digit phone required';
    if (formData.address.length < 10) newErrors.address = 'Address must be at least 10 chars';
    if (formData.city !== 'Hyderabad') newErrors.city = 'We only deliver in Hyderabad';
    if (!/^\d{6}$/.test(formData.pincode)) newErrors.pincode = '6-digit pincode required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePayment = async () => {
    if (!validate()) {
      toast.error('Please fix form errors');
      return;
    }

    setLoading(true);
    try {
      // 1. Create order on server
      const orderRes = await api.post('/orders', {
        products: (items || []).filter(i => i && i.product).map(i => ({ 
          product: i?.product?._id, 
          quantity: i?.quantity || 1,
          title: i?.product?.title || 'Unknown Item',
          price: i?.product?.price || 0
        })),
        totalAmount: cartTotal,
        shippingAddress: {
          name: formData.name,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          pincode: formData.pincode,
          landmark: formData.landmark
        }
      });

      if (orderRes.data.success) {
        const { orderId, amount, key } = orderRes.data;

        // 2. Open Razorpay
        const options = {
          key: key,
          amount: amount,
          currency: "INR",
          name: "Melcho Desserts",
          description: "Premium Dessert Order",
          order_id: orderId,
          handler: async (response) => {
            try {
              const verifyRes = await api.post('/orders/verify', {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              });

              if (verifyRes.data.success) {
                toast.success('Payment Successful! 🎉');
                clearCart();
                navigate('/order-success', { state: { orderId: verifyRes.data.orderId, amount: cartTotal } });
              }
            } catch (err) {
              toast.error('Payment verification failed');
            }
          },
          prefill: {
            name: formData.name,
            email: user?.email,
            contact: formData.phone
          },
          theme: { color: "#D97706" }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Order creation failed');
    } finally {
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
          {/* Left: Shipping Form */}
          <div className="w-full lg:w-[60%] space-y-8">
            <div className="bg-white rounded-[2.5rem] p-10 border border-stone-100 shadow-sm space-y-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-primary-light text-primary rounded-2xl flex items-center justify-center">
                  <MapPin size={28} />
                </div>
                <div>
                   <h1 className="text-3xl font-playfair font-extrabold text-stone-900">Delivery Details</h1>
                   <p className="text-stone-400 font-medium">Where should we send your treats?</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Full Name</label>
                  <div className="relative group">
                    <User className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-primary transition-colors" size={18} />
                    <input 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className={`w-full pl-14 pr-6 py-4 bg-stone-50 border rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 transition-all font-medium ${errors.name ? 'border-red-400' : 'border-stone-100'}`}
                      placeholder="Your name"
                    />
                  </div>
                  {errors.name && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Phone Number</label>
                  <div className="relative group">
                    <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-primary transition-colors" size={18} />
                    <input 
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className={`w-full pl-14 pr-6 py-4 bg-stone-50 border rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 transition-all font-medium ${errors.phone ? 'border-red-400' : 'border-stone-100'}`}
                      placeholder="10-digit mobile"
                    />
                  </div>
                  {errors.phone && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.phone}</p>}
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Street Address</label>
                  <textarea 
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    rows={3}
                    className={`w-full px-6 py-4 bg-stone-50 border rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 transition-all font-medium resize-none ${errors.address ? 'border-red-400' : 'border-stone-100'}`}
                    placeholder="House/Flat no., Building, Street, Area"
                  />
                  {errors.address && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.address}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">City</label>
                  <input 
                    readOnly
                    value={formData.city}
                    className="w-full px-6 py-4 bg-stone-100 border border-stone-100 rounded-2xl text-stone-500 font-bold cursor-not-allowed"
                  />
                  <p className="text-[9px] text-primary font-bold ml-1">Currently serving Hyderabad only</p>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Pincode</label>
                  <input 
                    type="text"
                    maxLength={6}
                    value={formData.pincode}
                    onChange={(e) => setFormData({...formData, pincode: e.target.value.replace(/\D/g, '')})}
                    className={`w-full px-6 py-4 bg-stone-50 border rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 transition-all font-medium ${errors.pincode ? 'border-red-400' : 'border-stone-100'}`}
                    placeholder="6-digit pincode"
                  />
                  {errors.pincode && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.pincode}</p>}
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Landmark (Optional)</label>
                  <input 
                    value={formData.landmark}
                    onChange={(e) => setFormData({...formData, landmark: e.target.value})}
                    className="w-full px-6 py-4 bg-stone-50 border border-stone-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 transition-all font-medium"
                    placeholder="Near landmark, metro station, etc."
                  />
                </div>
              </div>
            </div>

            <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-[2rem] flex items-center gap-4 text-emerald-700">
               <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Truck size={20} />
               </div>
               <p className="font-bold text-sm">You qualify for <span className="underline">Free Express Delivery</span> on this order!</p>
            </div>
          </div>

          {/* Right: Order Summary */}
          <div className="w-full lg:w-[40%] lg:sticky lg:top-24 space-y-6">
            <div className="bg-white rounded-[2.5rem] p-10 border border-stone-100 shadow-xl space-y-8">
              <h2 className="text-2xl font-playfair font-extrabold text-stone-900 border-b border-stone-50 pb-6">Order Summary</h2>
              
              <div className="space-y-6 max-h-64 overflow-y-auto pr-2 no-scrollbar">
                {(items || []).filter(item => item && item.product).map((item, index) => (
                  <div key={item?.product?._id || `item-${index}`} className="flex justify-between items-center group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-stone-50 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center text-xl">
                        {item?.product?.image ? <img src={item?.product?.image} className="w-full h-full object-cover" /> : 'Item'}
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
                  <span>{formatCurrency(cartTotal)}</span>
                </div>
                <div className="flex justify-between text-stone-400 text-xs font-black uppercase tracking-widest">
                  <span>Delivery Fee</span>
                  <span className="text-emerald-600">Free</span>
                </div>
                <div className="h-px bg-stone-100" />
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-playfair font-extrabold text-stone-900">Total</span>
                  <span className="text-3xl font-bold text-primary">{formatCurrency(cartTotal)}</span>
                </div>
              </div>

              <button 
                onClick={handlePayment}
                disabled={loading}
                className="w-full py-6 bg-stone-900 text-white rounded-[2rem] font-bold text-lg shadow-2xl shadow-stone-900/20 hover:bg-primary transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-4 group"
              >
                {loading ? <Loader2 className="animate-spin" /> : (
                  <>
                    Pay {formatCurrency(cartTotal)} <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-stone-300 text-[10px] font-black uppercase tracking-widest">
                 <ShieldCheck size={14} /> Secured by Razorpay
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
