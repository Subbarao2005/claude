import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axios';
import { 
  formatCurrency, 
  formatDate, 
  truncateId, 
  getStatusColor, 
  getPaymentStatusColor 
} from '../../utils/helpers';
import { 
  Loader2, 
  ChevronLeft, 
  User, 
  MapPin, 
  Package, 
  Mail, 
  Phone 
} from 'lucide-react';

export default function AdminOrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/orders/${id}`);
      if (res.data.success) {
        setOrder(res.data.order);
      }
    } catch (err) {
      console.error('Fetch order error:', err);
      setError('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-amber-600" size={48} />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-playfair font-bold text-slate-900">Order not found</h2>
        <Link to="/admin/orders" className="text-amber-600 font-bold mt-4 inline-block underline">Back to Orders</Link>
      </div>
    );
  }

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <Link to="/admin/orders" className="flex items-center gap-2 text-slate-400 hover:text-amber-600 font-bold mb-8 transition-colors group">
        <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Back to Orders
      </Link>

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-playfair font-bold text-slate-900">Order {truncateId(order._id)}</h1>
          <p className="text-slate-500 mt-2 tracking-widest uppercase text-xs font-bold">{formatDate(order.createdAt)}</p>
        </div>
        <div className="flex gap-4">
          <span className={`px-6 py-2 rounded-2xl text-sm font-bold shadow-sm ${getPaymentStatusColor(order.paymentStatus)}`}>
            {(order.paymentStatus || 'pending').toUpperCase()}
          </span>
          <span className={`px-6 py-2 rounded-2xl text-sm font-bold shadow-sm ${getStatusColor(order.orderStatus)}`}>
            {(order.orderStatus || 'Pending').toUpperCase()}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Items Card */}
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
            <h3 className="text-xl font-playfair font-bold text-slate-900 mb-8 flex items-center gap-3">
              <Package className="text-amber-600" size={24} /> Ordered Items
            </h3>
            <div className="space-y-6">
              {order.products?.map((item, i) => (
                <div key={i} className="flex justify-between items-center pb-6 border-b border-slate-50 last:border-0 last:pb-0">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-amber-600 font-playfair text-2xl font-bold">
                      {(item?.title || 'I').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">{(item?.title || 'Unknown Item').toUpperCase()}</h4>
                      <p className="text-sm text-slate-400">Qty: {item?.quantity || 1} @ {formatCurrency(item?.price || 0)} each</p>
                    </div>
                  </div>
                  <p className="font-bold text-slate-900">{formatCurrency((item?.price || 0) * (item?.quantity || 1))}</p>
                </div>
              ))}
            </div>
            <div className="mt-10 pt-8 border-t border-slate-50">
              <div className="flex justify-between items-center text-2xl font-bold text-slate-900">
                <span>Total Amount</span>
                <span className="text-amber-600">{formatCurrency(order.totalAmount || 0)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Customer Info Card */}
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
            <h3 className="text-xl font-playfair font-bold text-slate-900 mb-8 flex items-center gap-3">
              <User className="text-amber-600" size={24} /> Customer Information
            </h3>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-slate-50 rounded-xl text-slate-400"><User size={18} /></div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Full Name</p>
                  <p className="font-bold text-slate-900">{order.userId?.name || 'Unknown User'}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-slate-50 rounded-xl text-slate-400"><Mail size={18} /></div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Email Address</p>
                  <p className="font-bold text-slate-900">{order.userId?.email || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Info Card */}
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
            <h3 className="text-xl font-playfair font-bold text-slate-900 mb-8 flex items-center gap-3">
              <MapPin className="text-amber-600" size={24} /> Delivery Address
            </h3>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-slate-50 rounded-xl text-slate-400"><MapPin size={18} /></div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Street Address</p>
                  <p className="font-bold text-slate-900 leading-relaxed">{order.address?.street || 'N/A'}</p>
                  <p className="font-bold text-slate-900 mt-1">{order.address?.city || 'N/A'}, {order.address?.pincode || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-slate-50 rounded-xl text-slate-400"><Phone size={18} /></div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Contact Number</p>
                  <p className="font-bold text-slate-900">{order.address?.phone || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
