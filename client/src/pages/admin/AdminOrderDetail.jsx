import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import AdminLayout from '../../components/AdminLayout';
import StatusBadge from '../../components/admin/StatusBadge';
import ReasonModal from '../../components/admin/ReasonModal';
import { 
  formatCurrency, 
  formatDate, 
  truncateId 
} from '../../utils/helpers';
import { 
  Loader2, 
  ChevronLeft, 
  User, 
  MapPin, 
  Package, 
  Mail, 
  Phone,
  CreditCard,
  History,
  Clock,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';

const NEXT_STATUSES = {
  'Pending':          ['Accepted', 'Rejected'],
  'Accepted':         ['Preparing', 'Cancelled'],
  'Preparing':        ['Out for Delivery'],
  'Out for Delivery': ['Delivered'],
  'Delivered':        [],
  'Rejected':         [],
  'Cancelled':        []
};

export default function AdminOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [reasonModal, setReasonModal] = useState({ isOpen: false, nextStatus: null });

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

  const handleStatusChange = async (nextStatus, reason = '') => {
    if ((nextStatus === 'Rejected' || nextStatus === 'Cancelled') && !reason) {
      setReasonModal({ isOpen: true, nextStatus });
      return;
    }

    try {
      const res = await api.put(`/orders/${id}/status`, { 
        orderStatus: nextStatus,
        reason: reason 
      });
      if (res.data.success) {
        setOrder(res.data.order);
        setReasonModal({ isOpen: false, nextStatus: null });
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="animate-spin text-amber-600" size={48} />
        </div>
      </AdminLayout>
    );
  }

  if (!order) {
    return (
      <AdminLayout>
        <div className="text-center py-20">
          <h2 className="text-2xl font-playfair font-bold text-slate-900 mb-4">Order not found</h2>
          <Link to="/admin/orders" className="text-amber-600 font-bold hover:underline">Back to All Orders</Link>
        </div>
      </AdminLayout>
    );
  }

  const nextOptions = NEXT_STATUSES[order.orderStatus] || [];
  const daysSince = Math.floor((new Date() - new Date(order.createdAt)) / (1000 * 60 * 60 * 24));

  return (
    <AdminLayout>
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10">
        <div>
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-amber-600 font-bold mb-4 transition-colors group">
            <ChevronLeft size={20} className="transition-transform group-hover:-translate-x-1" /> Back
          </button>
          <div className="flex items-center gap-4">
            <h1 className="text-4xl font-playfair font-bold text-slate-900">Order {truncateId(order._id)}</h1>
            <StatusBadge status={order.orderStatus} />
          </div>
          <div className="flex items-center gap-4 mt-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
            <span className="flex items-center gap-1"><Clock size={14} /> {formatDate(order.createdAt)}</span>
            <span className="bg-slate-100 px-2 py-0.5 rounded">{daysSince === 0 ? 'Placed today' : `${daysSince} days ago`}</span>
          </div>
        </div>

        <div className="flex gap-4">
          {nextOptions.length > 0 ? (
            <div className="flex gap-2">
              {nextOptions.map(status => (
                <button
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  className={`px-6 py-3 rounded-xl font-bold text-sm shadow-lg transition-all active:scale-95 ${
                    status === 'Rejected' || status === 'Cancelled' 
                      ? 'bg-red-50 text-red-600 border border-red-100 hover:bg-red-100' 
                      : 'bg-amber-600 text-white hover:bg-amber-700 shadow-amber-200'
                  }`}
                >
                  Mark as {status}
                </button>
              ))}
            </div>
          ) : (
            <div className="px-6 py-3 bg-slate-100 text-slate-400 rounded-xl font-bold text-sm border border-slate-200">
              Order Process Completed
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Order Content */}
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
            <h3 className="text-xl font-playfair font-bold text-slate-900 mb-8 flex items-center gap-3">
              <Package className="text-amber-600" size={24} /> Items Summary
            </h3>
            <div className="space-y-6">
              {order.products?.map((item, i) => (
                <div key={i} className="flex justify-between items-center pb-6 border-b border-slate-50 last:border-0 last:pb-0">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-amber-600 font-playfair text-2xl font-bold">
                      {(item.title || 'I').charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 uppercase text-sm tracking-wide">{item.title}</h4>
                      <p className="text-xs text-slate-400 mt-1">₹{item.price} per unit</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-400 mb-1">x{item.quantity}</p>
                    <p className="font-bold text-slate-900">{formatCurrency(item.price * item.quantity)}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-10 pt-8 border-t border-slate-50 flex justify-between items-center">
              <span className="text-xl font-playfair font-bold text-slate-400 uppercase tracking-widest">Grand Total</span>
              <span className="text-3xl font-bold text-amber-600">{formatCurrency(order.totalAmount)}</span>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
            <h3 className="text-xl font-playfair font-bold text-slate-900 mb-8 flex items-center gap-3">
              <History className="text-amber-600" size={24} /> Activity Timeline
            </h3>
            <div className="space-y-8 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
              {order.statusHistory?.map((h, i) => (
                <div key={i} className="relative pl-12">
                  <div className={`absolute left-0 top-1 w-6 h-6 rounded-full border-4 border-white shadow-sm flex items-center justify-center ${
                    i === order.statusHistory.length - 1 ? 'bg-amber-500 scale-125' : 'bg-slate-200'
                  }`} />
                  <div className="flex flex-col">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-bold text-slate-900 uppercase text-xs tracking-wider">{h.status}</span>
                      <span className="text-[10px] font-black uppercase text-slate-300 bg-slate-50 px-2 py-0.5 rounded">by {h.changedBy}</span>
                    </div>
                    <span className="text-xs text-slate-400">{formatDate(h.changedAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Customer Profile */}
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-xl font-playfair font-bold text-slate-900 flex items-center gap-3">
                <User className="text-amber-600" size={24} /> Customer
              </h3>
              <Link to={`/admin/customers?id=${order.userId?._id}`} className="p-2 bg-slate-50 rounded-xl text-slate-400 hover:text-amber-600 transition-colors">
                <ExternalLink size={18} />
              </Link>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Name</p>
                <p className="font-bold text-slate-900">{order.userId?.name || 'Unknown User'}</p>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={14} className="text-slate-400" />
                <p className="text-sm font-medium text-slate-600">{order.userId?.email || 'No Email'}</p>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={14} className="text-slate-400" />
                <p className="text-sm font-medium text-slate-600">{order.userId?.phone || 'No Phone'}</p>
              </div>
            </div>
          </div>

          {/* Shipping */}
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
            <h3 className="text-xl font-playfair font-bold text-slate-900 mb-8 flex items-center gap-3">
              <MapPin className="text-amber-600" size={24} /> Delivery Location
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Full Address</p>
                <p className="font-bold text-slate-900 leading-relaxed">{order.address?.street}</p>
                <p className="font-bold text-slate-900">{order.address?.city}, {order.address?.pincode}</p>
              </div>
              {order.address?.landmark && (
                <div>
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Landmark</p>
                  <p className="font-medium text-slate-600">{order.address.landmark}</p>
                </div>
              )}
            </div>
          </div>

          {/* Payment */}
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
            <h3 className="text-xl font-playfair font-bold text-slate-900 mb-8 flex items-center gap-3">
              <CreditCard className="text-amber-600" size={24} /> Payment Intel
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400 uppercase">Status</span>
                <StatusBadge type="payment" status={order.paymentStatus} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Razorpay Order ID</p>
                <p className="font-mono text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg">{order.razorpayOrderId || 'N/A'}</p>
              </div>
              {order.razorpayPaymentId && (
                <div>
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Payment ID</p>
                  <p className="font-mono text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg">{order.razorpayPaymentId}</p>
                </div>
              )}
            </div>
          </div>

          {/* Rejection/Cancellation Reason */}
          {(order.rejectionReason || order.cancellationReason) && (
            <div className="bg-red-50 rounded-[2.5rem] p-8 border border-red-100">
              <h3 className="text-xl font-playfair font-bold text-red-900 mb-4 flex items-center gap-3">
                <ShieldAlert className="text-red-600" size={24} /> Issue Log
              </h3>
              <p className="text-sm text-red-700 font-medium leading-relaxed italic">
                "{order.rejectionReason || order.cancellationReason}"
              </p>
            </div>
          )}
        </div>
      </div>

      <ReasonModal 
        isOpen={reasonModal.isOpen}
        title={`Reason for ${reasonModal.nextStatus}`}
        onConfirm={(reason) => handleStatusChange(reasonModal.nextStatus, reason)}
        onCancel={() => setReasonModal({ isOpen: false, nextStatus: null })}
      />
    </AdminLayout>
  );
}
