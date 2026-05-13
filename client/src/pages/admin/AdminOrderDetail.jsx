import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  MapPin, 
  Phone, 
  User, 
  CreditCard, 
  Clock, 
  CheckCircle2, 
  ChevronRight,
  Printer,
  Trash2,
  AlertCircle,
  Truck,
  ChefHat,
  Package,
  History,
  Save,
  Loader2
} from 'lucide-react';
import api from '../../api/axios';
import AdminLayout from '../../components/admin/AdminLayout';
import { formatCurrency, formatDate, truncateId } from '../../utils/helpers';
import StatusBadge from '../../components/admin/StatusBadge';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = [
  'Pending',
  'Accepted',
  'Preparing',
  'Out for Delivery',
  'Delivered',
  'Rejected',
  'Cancelled'
];

export default function AdminOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [cancellationReason, setCancellationReason] = useState('');

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/orders/${id}`);
      if (res.data.success) {
        setOrder(res.data.order);
        setNewStatus(res.data.order.orderStatus);
        setCancellationReason(res.data.order.cancellationReason || '');
      }
    } catch (err) {
      toast.error('Failed to load order details');
      navigate('/admin/orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleUpdateStatus = async () => {
    if (newStatus === order.orderStatus) return;
    if ((newStatus === 'Cancelled' || newStatus === 'Rejected') && cancellationReason.length < 10) {
      toast.error('Please provide a reason (min 10 chars)');
      return;
    }

    try {
      setUpdating(true);
      const res = await api.put(`/orders/admin/${id}/status`, { 
        status: newStatus,
        reason: cancellationReason 
      });
      if (res.data.success) {
        toast.success(`Order marked as ${newStatus}`);
        fetchOrder();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Status update failed');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return (
    <AdminLayout>
      <div className="flex flex-col gap-8 animate-pulse">
         <div className="h-10 w-48 bg-gray-100 rounded-xl" />
         <div className="h-[600px] bg-white rounded-[3rem] border border-gray-50 shadow-sm" />
      </div>
    </AdminLayout>
  );

  return (
    <AdminLayout>
      {/* Breadcrumb & Top Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div className="space-y-2">
          <Link 
            to="/admin/orders"
            className="flex items-center gap-2 text-gray-400 hover:text-amber-600 font-bold text-[10px] uppercase tracking-widest transition-colors group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back to Orders
          </Link>
          <div className="flex items-center gap-3">
             <h1 className="text-4xl font-playfair font-extrabold text-slate-950">Order Review</h1>
             <span className="font-mono text-amber-600 font-bold">#{truncateId(order._id)}</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
           <button onClick={() => window.print()} className="p-4 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-amber-600 shadow-sm transition-all active:scale-95">
              <Printer size={20} />
           </button>
           <StatusBadge status={order.orderStatus} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Order Content */}
        <div className="lg:col-span-8 space-y-10">
           {/* Items List */}
           <div className="bg-white rounded-[3.5rem] border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-10 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                 <h3 className="text-2xl font-playfair font-extrabold text-slate-950">Ordered Items</h3>
                 <span className="px-4 py-1.5 bg-white text-gray-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-gray-100">
                    {order.products.length} Products
                 </span>
              </div>
              <div className="p-10">
                 <table className="w-full">
                    <thead>
                       <tr className="text-gray-300 text-[10px] font-black uppercase tracking-[0.2em] text-left">
                          <th className="pb-8">Product</th>
                          <th className="pb-8 text-center">Quantity</th>
                          <th className="pb-8 text-right">Unit Price</th>
                          <th className="pb-8 text-right">Subtotal</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                       {order.products.map((item, i) => (
                          <tr key={i} className="group">
                             <td className="py-8">
                                <div className="flex items-center gap-4">
                                   <div className="w-16 h-16 bg-gray-50 rounded-2xl overflow-hidden flex-shrink-0 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-500 border border-gray-100">
                                      {item.product.image ? <img src={item.product.image} className="w-full h-full object-cover" /> : '🍰'}
                                   </div>
                                   <div>
                                      <p className="font-black text-slate-900 group-hover:text-amber-600 transition-colors">{item.product.title}</p>
                                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">{item.product.category}</p>
                                   </div>
                                </div>
                             </td>
                             <td className="py-8 text-center font-bold text-gray-500">x{item.quantity}</td>
                             <td className="py-8 text-right font-bold text-gray-400">{formatCurrency(item.product.price)}</td>
                             <td className="py-8 text-right font-bold text-slate-900">{formatCurrency(item.product.price * item.quantity)}</td>
                          </tr>
                       ))}
                    </tbody>
                    <tfoot>
                       <tr className="bg-gray-50/50">
                          <td colSpan={3} className="px-8 py-8 text-slate-900 font-extrabold text-xl font-playfair">Grand Total Collected</td>
                          <td className="px-8 py-8 text-right text-3xl font-black text-amber-600">{formatCurrency(order.totalAmount)}</td>
                       </tr>
                    </tfoot>
                 </table>
              </div>
           </div>

           {/* Delivery Details Card */}
           <div className="bg-white rounded-[3.5rem] p-10 border border-gray-100 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-6">
                 <div className="flex items-center gap-3 text-amber-600 font-playfair font-extrabold text-xl">
                    <User size={22} /> Customer Information
                 </div>
                 <div className="space-y-4">
                    <div className="p-5 bg-gray-50 rounded-3xl border border-gray-100 flex items-center gap-4">
                       <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center font-black text-amber-600 shadow-sm">
                          {order.shippingAddress.name[0].toUpperCase()}
                       </div>
                       <div>
                          <p className="font-black text-slate-900 leading-none mb-1">{order.shippingAddress.name}</p>
                          <p className="text-xs text-gray-400 font-bold italic">{order.userId?.email || 'guest@melcho.com'}</p>
                       </div>
                    </div>
                    <div className="p-5 bg-gray-50 rounded-3xl border border-gray-100 flex items-center gap-4">
                       <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-amber-600 shadow-sm">
                          <Phone size={20} />
                       </div>
                       <p className="font-bold text-slate-900">{order.shippingAddress.phone}</p>
                    </div>
                 </div>
              </div>

              <div className="space-y-6">
                 <div className="flex items-center gap-3 text-amber-600 font-playfair font-extrabold text-xl">
                    <MapPin size={22} /> Shipping Destination
                 </div>
                 <div className="p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100 h-full">
                    <p className="text-sm font-medium text-gray-600 leading-relaxed">
                       {order.shippingAddress.address}<br />
                       {order.shippingAddress.landmark && <span className="text-amber-600 font-bold text-xs italic">Near {order.shippingAddress.landmark}</span>}<br />
                       <span className="font-black text-slate-900 mt-2 block tracking-tight">
                          {order.shippingAddress.city}, Telangana {order.shippingAddress.pincode}
                       </span>
                    </p>
                 </div>
              </div>
           </div>
        </div>

        {/* Right Column: Status Controls */}
        <div className="lg:col-span-4 space-y-10">
           {/* Payment Status Info */}
           <div className="bg-slate-900 rounded-[3.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="relative z-10 space-y-8">
                 <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3 text-emerald-400 font-bold">
                       <CreditCard size={22} /> Transaction
                    </div>
                    <span className="px-4 py-1.5 bg-emerald-500/20 text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/30">
                       Verified
                    </span>
                 </div>
                 
                 <div className="space-y-6">
                    <div className="flex justify-between items-end border-b border-white/5 pb-4">
                       <div className="space-y-1">
                          <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">Amount Paid</p>
                          <p className="text-3xl font-black text-white leading-none">{formatCurrency(order.totalAmount)}</p>
                       </div>
                       <p className="text-[10px] font-bold text-white/40">{formatDate(order.createdAt)}</p>
                    </div>
                    
                    <div className="space-y-4">
                       <div className="space-y-1">
                          <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">Payment Provider</p>
                          <p className="text-xs font-bold">Razorpay Secure Flow</p>
                       </div>
                       <div className="space-y-1">
                          <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">Receipt ID</p>
                          <p className="text-[10px] font-mono text-amber-500 font-bold uppercase truncate">#RZP_{truncateId(order._id)}</p>
                       </div>
                    </div>
                 </div>
              </div>
           </div>

           {/* Status Update Control */}
           <div className="bg-white rounded-[3.5rem] p-10 border border-gray-100 shadow-xl shadow-gray-100/50 space-y-8">
              <div className="flex items-center gap-3 text-slate-900 font-playfair font-extrabold text-xl">
                 <History size={22} /> Status Operations
              </div>
              
              <div className="space-y-6">
                 <div className="space-y-3">
                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest px-1">Transition To</p>
                    <div className="grid grid-cols-1 gap-2">
                       {STATUS_OPTIONS.map(status => {
                          const isCurrent = order.orderStatus === status;
                          const isSelected = newStatus === status;
                          return (
                             <button
                                key={status}
                                onClick={() => setNewStatus(status)}
                                className={`flex items-center justify-between px-6 py-4 rounded-2xl border transition-all duration-300 font-bold text-sm ${
                                   isSelected 
                                    ? 'bg-amber-600 border-amber-600 text-white shadow-xl shadow-amber-600/20' 
                                    : 'bg-gray-50 border-gray-100 text-gray-500 hover:bg-gray-100'
                                }`}
                             >
                                {status}
                                {isCurrent && <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 bg-white/20 rounded-full">Current</span>}
                             </button>
                          );
                       })}
                    </div>
                 </div>

                 {(newStatus === 'Rejected' || newStatus === 'Cancelled') && (
                    <div className="space-y-2 animate-in slide-in-from-top-4 duration-300">
                       <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest px-1">Reason for {newStatus}</label>
                       <textarea 
                          value={cancellationReason}
                          onChange={(e) => setCancellationReason(e.target.value)}
                          className="w-full p-5 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-red-500/5 transition-all text-sm font-medium resize-none min-h-[100px]"
                          placeholder="Why is this order being stopped?"
                       />
                       <p className="text-[10px] text-gray-400 font-medium text-right">{cancellationReason.length}/10 chars min</p>
                    </div>
                 )}

                 <button 
                    onClick={handleUpdateStatus}
                    disabled={updating || newStatus === order.orderStatus}
                    className="w-full py-5 bg-slate-900 text-white rounded-2xl font-bold text-sm uppercase tracking-widest shadow-2xl shadow-slate-900/20 hover:bg-amber-600 transition-all flex items-center justify-center gap-3 disabled:opacity-30 disabled:grayscale group"
                 >
                    {updating ? <Loader2 className="animate-spin" /> : <Save size={20} className="group-hover:scale-110 transition-transform" />}
                    Confirm Change
                 </button>
              </div>
           </div>
        </div>
      </div>
    </AdminLayout>
  );
}
