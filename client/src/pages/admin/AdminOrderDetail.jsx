import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { 
  ArrowLeft, 
  Package, 
  User, 
  MapPin, 
  Clock, 
  Truck, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  Mail,
  Phone
} from 'lucide-react';

export default function AdminOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await api.get(`/orders/${id}`);
        if (res.data.success) {
          setOrder(res.data.order);
        }
      } catch (err) {
        console.error('Failed to fetch order detail:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const updateStatus = async (newStatus) => {
    try {
      setUpdating(true);
      const res = await api.put(`/orders/admin/${id}/status`, { status: newStatus });
      if (res.data.success) {
        setOrder(res.data.order);
      }
    } catch (err) {
      alert('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-40">
        <Loader2 className="animate-spin text-amber-600" size={48} />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-8 text-center py-20">
        <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold">Order not found</h2>
        <button onClick={() => navigate('/admin/orders')} className="mt-4 text-amber-600 font-bold">Back to Orders</button>
      </div>
    );
  }

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <button 
        onClick={() => navigate('/admin/orders')}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-medium transition-colors mb-8"
      >
        <ArrowLeft size={20} />
        Back to Orders
      </button>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Content */}
        <div className="flex-grow space-y-8">
          {/* Order Status Card */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-playfair font-bold text-slate-900">Order #{order._id.slice(-8).toUpperCase()}</h1>
                <p className="text-slate-500 mt-1 flex items-center gap-2">
                  <Clock size={16} />
                  Placed on {new Date(order.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="flex gap-2">
                {['pending', 'processing', 'shipped', 'delivered'].map((s) => (
                  <button
                    key={s}
                    disabled={updating || order.status === s}
                    onClick={() => updateStatus(s)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      order.status === s 
                        ? 'bg-amber-600 text-white shadow-lg shadow-amber-100' 
                        : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {s.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Items Table */}
            <div className="border border-slate-100 rounded-3xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 text-left font-bold text-slate-700">Item</th>
                    <th className="px-6 py-4 text-center font-bold text-slate-700">Qty</th>
                    <th className="px-6 py-4 text-right font-bold text-slate-700">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {order.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="px-6 py-4 flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100">
                          {item.product?.image ? (
                            <img src={item.product.image} className="w-full h-full object-cover rounded-xl" />
                          ) : (
                            <Package size={20} className="text-slate-300" />
                          )}
                        </div>
                        <span className="font-bold text-slate-900">{item.product?.title || 'Unknown Product'}</span>
                      </td>
                      <td className="px-6 py-4 text-center font-bold text-slate-600">{item.quantity}</td>
                      <td className="px-6 py-4 text-right font-bold text-slate-900">₹{item.price * item.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-8 pt-8 border-t border-slate-100 flex justify-end">
              <div className="w-64 space-y-3">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal</span>
                  <span>₹{order.totalAmount}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Delivery</span>
                  <span className="text-emerald-600 font-bold">FREE</span>
                </div>
                <div className="flex justify-between text-2xl font-playfair font-bold text-slate-900 pt-3 border-t border-slate-100">
                  <span>Total</span>
                  <span>₹{order.totalAmount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:w-96 space-y-8">
          {/* Customer Info */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h3 className="text-xl font-playfair font-bold text-slate-900 mb-6 flex items-center gap-2">
              <User size={20} className="text-amber-600" />
              Customer
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <User size={18} className="text-slate-400" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">{order.user?.name || 'Guest'}</p>
                  <p className="text-xs text-slate-500">User ID: #{order.user?._id?.slice(-6).toUpperCase()}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Mail size={18} className="text-slate-400" />
                </div>
                <p className="text-sm font-medium text-slate-600 truncate">{order.user?.email}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Phone size={18} className="text-slate-400" />
                </div>
                <p className="text-sm font-medium text-slate-600">{order.user?.phone || 'No phone'}</p>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h3 className="text-xl font-playfair font-bold text-slate-900 mb-6 flex items-center gap-2">
              <MapPin size={20} className="text-amber-600" />
              Shipping
            </h3>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-slate-600 text-sm leading-relaxed font-medium">
              {order.shippingAddress || 'Store Pickup'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
