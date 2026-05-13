import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import {
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Phone,
  AlertCircle,
  ArrowLeft,
  CreditCard,
} from 'lucide-react';
import { formatCurrency, formatDate, truncateId } from '../utils/helpers';
import StatusBadge from '../components/admin/StatusBadge';
import toast from 'react-hot-toast';

const STATUS_STEPS = [
  { id: 'Pending', label: 'Placed', icon: Clock },
  { id: 'Accepted', label: 'Confirmed', icon: CheckCircle },
  { id: 'Preparing', label: 'Preparing', icon: Package },
  { id: 'Out for Delivery', label: 'On the Way', icon: Truck },
  { id: 'Delivered', label: 'Delivered', icon: CheckCircle },
];

export default function OrderTrackingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOrder = async () => {
    try {
      const res = await api.get(`/orders/${id}`);
      if (res.data.success) {
        setOrder(res.data.order || null);
      }
    } catch (err) {
      setError('Failed to load order details.');
      console.error('Fetch order error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
    const interval = setInterval(fetchOrder, 30000);
    return () => clearInterval(interval);
  }, [id]);

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;

    try {
      const res = await api.put(`/orders/${id}/cancel`);
      if (res.data.success) {
        toast.success('Order cancelled successfully');
        fetchOrder();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cancellation failed');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-main flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-stone-400 font-black text-[10px] uppercase tracking-widest">Loading your order...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-bg-main pt-32 pb-24 px-6 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-[3rem] p-12 text-center border border-stone-100 shadow-xl">
          <AlertCircle size={64} className="text-red-500 mx-auto mb-8" />
          <h2 className="text-3xl font-playfair font-extrabold text-stone-900 mb-4">{error || 'Order not found'}</h2>
          <button onClick={() => navigate('/orders')} className="text-primary font-bold hover:underline">Back to History</button>
        </div>
      </div>
    );
  }

  const products = (order?.products || []).filter(item => item);
  const shippingAddress = order?.shippingAddress || {};
  const currentStepIndex = STATUS_STEPS.findIndex(step => step.id === order?.orderStatus);
  const isCancelled = order?.orderStatus === 'Cancelled' || order?.orderStatus === 'Rejected';

  return (
    <div className="min-h-screen bg-bg-main pt-24 lg:pt-32 pb-24 animate-fadeIn">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div className="space-y-2">
            <button
              onClick={() => navigate('/orders')}
              className="flex items-center gap-2 text-stone-400 hover:text-primary font-bold text-xs uppercase tracking-widest transition-colors group"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Orders
            </button>
            <h1 className="text-4xl lg:text-6xl font-playfair font-extrabold text-stone-900 leading-tight">
              Track Your <span className="text-primary italic">Treats</span>
            </h1>
            <p className="text-stone-500 font-bold text-sm">
              Order Reference: <span className="text-stone-900 font-mono">#{truncateId(order?._id)}</span>
            </p>
          </div>
          <StatusBadge status={order?.orderStatus || 'Pending'} />
        </div>

        <div className="bg-white rounded-[3rem] p-10 lg:p-16 border border-stone-100 shadow-xl shadow-stone-200/20 mb-12">
          {isCancelled ? (
            <div className="flex flex-col items-center justify-center py-10 text-center space-y-6">
              <div className="w-24 h-24 bg-red-50 text-red-500 rounded-full flex items-center justify-center">
                <XCircle size={48} />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-playfair font-extrabold text-stone-900">Order {order?.orderStatus || 'Cancelled'}</h2>
                <p className="text-stone-500 font-medium max-w-sm">Reason: {order?.cancellationReason || 'Admin decision or user request'}</p>
              </div>
              <Link to="/menu" className="px-10 py-4 bg-stone-900 text-white rounded-full font-bold text-xs uppercase tracking-widest hover:bg-primary transition-all">Order Something Else</Link>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row justify-between relative gap-12 lg:gap-0">
              <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-stone-100 -translate-y-1/2 z-0 rounded-full" />
              {STATUS_STEPS.filter(step => step).map((step, index) => {
                const isCompleted = index < currentStepIndex;
                const isCurrent = index === currentStepIndex;
                const StepIcon = step.icon;

                return (
                  <div key={step.id} className="relative z-10 flex flex-row lg:flex-col items-center gap-6 lg:gap-4 lg:w-1/5">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center border-4 transition-all duration-500 ${
                      isCompleted ? 'bg-emerald-500 border-emerald-500 text-white' :
                      isCurrent ? 'bg-white border-primary text-primary shadow-2xl shadow-primary/30 animate-pulse' :
                      'bg-white border-stone-50 text-stone-200'
                    }`}>
                      {isCompleted ? <CheckCircle size={32} /> : <StepIcon size={32} />}
                    </div>
                    <div className="text-left lg:text-center space-y-1">
                      <p className={`font-bold text-sm lg:text-base ${isCurrent ? 'text-primary' : isCompleted ? 'text-emerald-600' : 'text-stone-400'}`}>
                        {step.label || 'Unknown'}
                      </p>
                      {isCurrent && <p className="text-[10px] font-black uppercase tracking-widest text-primary-dark">Processing</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7 bg-white rounded-[2.5rem] border border-stone-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-stone-50 flex justify-between items-center">
              <h3 className="text-2xl font-playfair font-extrabold text-stone-900">Order Content</h3>
              <span className="px-4 py-1.5 bg-stone-50 text-stone-400 rounded-full text-[10px] font-black uppercase tracking-widest">
                {products.length} Items
              </span>
            </div>
            <div className="p-8">
              <table className="w-full">
                <tbody className="divide-y divide-stone-50">
                  {products.filter(item => item).map((item, i) => {
                    const title = item?.title || item?.product?.title || 'Item';
                    const quantity = item?.quantity || 1;
                    const price = item?.price || item?.product?.price || 0;

                    return (
                      <tr key={i} className="group">
                        <td className="py-6 font-bold text-stone-900 group-hover:text-primary transition-colors">{title}</td>
                        <td className="py-6 text-center font-bold text-stone-400">{quantity}</td>
                        <td className="py-6 text-right font-bold text-stone-900">{formatCurrency(price)}</td>
                        <td className="py-6 text-right font-bold text-stone-900">{formatCurrency(price * quantity)}</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={3} className="pt-8 text-stone-400 font-bold text-sm">Total Paid</td>
                    <td className="pt-8 text-right text-2xl font-playfair font-black text-primary">{formatCurrency(order?.totalAmount || 0)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-8">
            <div className="bg-white rounded-[2.5rem] p-8 border border-stone-100 shadow-sm space-y-6">
              <div className="flex items-center gap-4 text-primary font-playfair font-bold text-xl">
                <MapPin size={24} /> Delivery Address
              </div>
              <div className="space-y-4 pt-2">
                <div>
                  <p className="text-[10px] font-black text-stone-300 uppercase tracking-widest">Customer</p>
                  <p className="font-bold text-stone-900">{shippingAddress?.name || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-stone-300 uppercase tracking-widest">Address</p>
                  <p className="font-medium text-stone-600 leading-relaxed">
                    {shippingAddress?.address || 'Address unavailable'}<br />
                    {shippingAddress?.landmark && <span className="text-stone-400 text-xs italic">Near {shippingAddress?.landmark}</span>}<br />
                    {shippingAddress?.city || 'Hyderabad'} - {shippingAddress?.pincode || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-stone-300 uppercase tracking-widest">Phone</p>
                  <p className="font-bold text-stone-900 flex items-center gap-2"><Phone size={14} /> {shippingAddress?.phone || 'N/A'}</p>
                </div>
              </div>
            </div>

            <div className="bg-stone-900 rounded-[2.5rem] p-8 text-white shadow-xl shadow-stone-200">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3 text-amber-500 font-bold">
                  <CreditCard size={20} /> Payment Details
                </div>
                <span className="px-3 py-1 bg-emerald-500 text-white rounded-full text-[10px] font-black uppercase">Verified</span>
              </div>
              <div className="flex justify-between items-end border-b border-white/5 pb-4">
                <div>
                  <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">Amount Paid</p>
                  <p className="text-2xl font-bold">{formatCurrency(order?.totalAmount || 0)}</p>
                </div>
                <p className="text-[10px] font-bold text-white/50">{formatDate(order?.createdAt)}</p>
              </div>
            </div>

            {(order?.orderStatus === 'Pending' || order?.orderStatus === 'Accepted') && (
              <button
                onClick={handleCancelOrder}
                className="w-full py-5 border-2 border-red-50 text-red-500 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-red-50 transition-all flex items-center justify-center gap-3"
              >
                <XCircle size={18} /> Cancel Order
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
