import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Package,
  MapPin,
  Phone,
  Mail,
  User,
  CreditCard,
  Clock,
  CheckCircle,
  Copy,
  ExternalLink,
  AlertCircle,
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
  'Cancelled',
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
        const nextOrder = res.data.order || null;
        setOrder(nextOrder);
        setNewStatus(nextOrder?.orderStatus || 'Pending');
        setCancellationReason(nextOrder?.cancellationReason || '');
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
    if (newStatus === order?.orderStatus) return;
    if ((newStatus === 'Cancelled' || newStatus === 'Rejected') && cancellationReason.length < 10) {
      toast.error('Please provide a reason (min 10 chars)');
      return;
    }

    try {
      setUpdating(true);
      const res = await api.put(`/orders/admin/${id}/status`, {
        status: newStatus,
        reason: cancellationReason,
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

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex flex-col gap-8 animate-pulse">
          <div className="h-10 w-48 bg-gray-100 rounded-xl" />
          <div className="h-[600px] bg-white rounded-[3rem] border border-gray-50 shadow-sm" />
        </div>
      </AdminLayout>
    );
  }

  if (!order) {
    return (
      <AdminLayout>
        <div className="bg-white rounded-[3rem] p-12 text-center border border-gray-100">
          <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
          <h1 className="text-2xl font-bold text-slate-900">Order not found</h1>
        </div>
      </AdminLayout>
    );
  }

  const products = (order?.products || []).filter(item => item);
  const shippingAddress = order?.shippingAddress || {};

  return (
    <AdminLayout>
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
            <span className="font-mono text-amber-600 font-bold">#{truncateId(order?._id)}</span>
          </div>
        </div>
        <StatusBadge status={order?.orderStatus || 'Pending'} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-10">
          <div className="bg-white rounded-[3.5rem] border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-10 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
              <h3 className="text-2xl font-playfair font-extrabold text-slate-950">Ordered Items</h3>
              <span className="px-4 py-1.5 bg-white text-gray-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-gray-100">
                {products.length} Products
              </span>
            </div>
            <div className="p-10 overflow-x-auto">
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
                  {products.filter(item => item).map((item, i) => {
                    const title = item?.title || item?.product?.title || 'Item';
                    const quantity = item?.quantity || 1;
                    const price = item?.price || item?.product?.price || 0;

                    return (
                      <tr key={i} className="group">
                        <td className="py-8 font-black text-slate-900 group-hover:text-amber-600 transition-colors">{title}</td>
                        <td className="py-8 text-center font-bold text-gray-500">x{quantity}</td>
                        <td className="py-8 text-right font-bold text-gray-400">{formatCurrency(price)}</td>
                        <td className="py-8 text-right font-bold text-slate-900">{formatCurrency(price * quantity)}</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50/50">
                    <td colSpan={3} className="px-8 py-8 text-slate-900 font-extrabold text-xl font-playfair">Grand Total Collected</td>
                    <td className="px-8 py-8 text-right text-3xl font-black text-amber-600">{formatCurrency(order?.totalAmount || 0)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-[3.5rem] p-10 border border-gray-100 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-6">
              <div className="flex items-center gap-3 text-amber-600 font-playfair font-extrabold text-xl">
                <User size={22} /> Customer Information
              </div>
              <div className="p-5 bg-gray-50 rounded-3xl border border-gray-100 flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center font-black text-amber-600 shadow-sm">
                  {(shippingAddress?.name || order?.userId?.name || 'U')[0]?.toUpperCase() || 'U'}
                </div>
                <div>
                  <p className="font-black text-slate-900 leading-none mb-1">{shippingAddress?.name || order?.userId?.name || 'Unknown'}</p>
                  <p className="text-xs text-gray-400 font-bold italic flex items-center gap-1"><Mail size={12} /> {order?.userId?.email || 'guest@melcho.com'}</p>
                </div>
              </div>
              <div className="p-5 bg-gray-50 rounded-3xl border border-gray-100 flex items-center gap-4">
                <Phone size={20} className="text-amber-600" />
                <p className="font-bold text-slate-900">{shippingAddress?.phone || 'N/A'}</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-3 text-amber-600 font-playfair font-extrabold text-xl">
                <MapPin size={22} /> Shipping Destination
              </div>
              <div className="p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100 h-full">
                <p className="text-sm font-medium text-gray-600 leading-relaxed">
                  {shippingAddress?.address || 'Address unavailable'}<br />
                  {shippingAddress?.landmark && <span className="text-amber-600 font-bold text-xs italic">Near {shippingAddress?.landmark}</span>}<br />
                  <span className="font-black text-slate-900 mt-2 block tracking-tight">
                    {shippingAddress?.city || 'Hyderabad'}, Telangana {shippingAddress?.pincode || 'N/A'}
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[3.5rem] p-10 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 text-slate-900 font-playfair font-extrabold text-xl mb-8">
              <Clock size={22} /> Status History
            </div>
            <div className="space-y-4">
              {(order?.statusHistory || []).filter(h => h).map((entry, i) => (
                <div key={i} className="flex items-center justify-between rounded-2xl bg-gray-50 border border-gray-100 p-4">
                  <span className="font-bold text-slate-900">{entry?.status || 'Unknown'}</span>
                  <span className="text-xs font-bold text-gray-400">{formatDate(entry?.changedAt)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-10">
          <div className="bg-slate-900 rounded-[3.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
            <div className="relative z-10 space-y-8">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3 text-emerald-400 font-bold">
                  <CreditCard size={22} /> Transaction
                </div>
                <span className="px-4 py-1.5 bg-emerald-500/20 text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/30">
                  Verified
                </span>
              </div>
              <div className="flex justify-between items-end border-b border-white/5 pb-4">
                <div>
                  <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">Amount Paid</p>
                  <p className="text-3xl font-black text-white leading-none">{formatCurrency(order?.totalAmount || 0)}</p>
                </div>
                <p className="text-[10px] font-bold text-white/40">{formatDate(order?.createdAt)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">Receipt ID</p>
                <p className="text-[10px] font-mono text-amber-500 font-bold uppercase truncate flex items-center gap-2">
                  #RZP_{truncateId(order?._id)} <Copy size={12} /> <ExternalLink size={12} />
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[3.5rem] p-10 border border-gray-100 shadow-xl shadow-gray-100/50 space-y-8">
            <div className="flex items-center gap-3 text-slate-900 font-playfair font-extrabold text-xl">
              <CheckCircle size={22} /> Status Operations
            </div>
            <div className="grid grid-cols-1 gap-2">
              {STATUS_OPTIONS.filter(status => status).map(status => {
                const isCurrent = order?.orderStatus === status;
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

            {(newStatus === 'Rejected' || newStatus === 'Cancelled') && (
              <textarea
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                className="w-full p-5 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-red-500/5 transition-all text-sm font-medium resize-none min-h-[100px]"
                placeholder="Reason for cancellation or rejection"
              />
            )}

            <button
              onClick={handleUpdateStatus}
              disabled={updating || newStatus === order?.orderStatus}
              className="w-full py-5 bg-slate-900 text-white rounded-2xl font-bold text-sm uppercase tracking-widest shadow-2xl shadow-slate-900/20 hover:bg-amber-600 transition-all flex items-center justify-center gap-3 disabled:opacity-30 disabled:grayscale"
            >
              {updating ? 'Updating...' : 'Confirm Change'}
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
