import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { 
  Package,
  ShoppingBag, 
  ChevronRight, 
  Clock, 
  CheckCircle, 
  XCircle, 
  RotateCcw,
  Loader2,
  Calendar,
  CreditCard
} from 'lucide-react';
import { formatCurrency, formatDate, truncateId } from '../utils/helpers';
import StatusBadge from '../components/admin/StatusBadge';

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/orders/my-orders');
      if (res.data.success) {
        setOrders(Array.isArray(res.data.orders) ? res.data.orders.filter(order => order && order._id) : []);
      }
    } catch (err) {
      setError('Failed to load your orders. Please check your connection.');
      console.error('Order history error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-main pt-32 pb-24 px-6">
        <div className="max-w-4xl mx-auto space-y-8">
           <div className="h-12 w-48 bg-stone-100 rounded-2xl animate-pulse" />
           {[1,2,3].map(i => (
             <div key={i} className="h-64 bg-white rounded-[2.5rem] border border-stone-50 animate-pulse shadow-sm" />
           ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-main pt-32 pb-24 animate-fadeIn">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="flex justify-between items-end mb-12">
           <div className="space-y-2">
              <h1 className="text-5xl font-playfair font-extrabold text-stone-900">My Orders</h1>
              <p className="text-stone-500 font-medium">History of your sweet moments with Melcho.</p>
           </div>
           <div className="px-6 py-2 bg-primary-light text-primary font-black text-xs uppercase tracking-widest rounded-full border border-primary/10">
              {(orders || []).length} Total
           </div>
        </div>

        {error ? (
          <div className="bg-white rounded-[3rem] p-20 text-center border border-stone-100 shadow-xl shadow-stone-200/20">
             <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-8">
                <RotateCcw size={32} />
             </div>
             <h2 className="text-2xl font-playfair font-bold text-stone-900 mb-4">{error}</h2>
             <button 
                onClick={fetchOrders}
                className="px-10 py-4 bg-stone-900 text-white rounded-full font-bold text-xs uppercase tracking-widest shadow-xl hover:bg-primary transition-all"
             >
                Retry Fetching
             </button>
          </div>
        ) : (orders || []).length === 0 ? (
          <div className="bg-white rounded-[4rem] p-24 text-center border border-stone-100 shadow-xl shadow-stone-200/20">
             <div className="w-32 h-32 bg-stone-50 text-stone-200 rounded-[3rem] flex items-center justify-center mx-auto mb-10">
                <ShoppingBag size={56} />
             </div>
             <h2 className="text-3xl font-playfair font-bold text-stone-900 mb-4">No orders yet 🍰</h2>
             <p className="text-stone-400 font-medium max-w-xs mx-auto mb-10">Your order history will appear here once you start your sweet journey.</p>
             <Link 
                to="/menu"
                className="inline-flex px-12 py-6 bg-primary text-white rounded-full font-bold text-sm uppercase tracking-widest shadow-2xl shadow-primary/20 hover:bg-primary-dark transition-all active:scale-95"
             >
                Start Ordering
             </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {(orders || []).filter(order => order && order._id).map((order) => (
              <Link 
                key={order._id}
                to={`/orders/${order._id}`}
                className="group block bg-white rounded-[2.5rem] p-8 border border-stone-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-500"
              >
                <div className="flex flex-col md:flex-row justify-between gap-6">
                  {/* Left: Info */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-stone-50 rounded-2xl text-stone-400 group-hover:bg-primary group-hover:text-white transition-all">
                        <ShoppingBag size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-stone-300 uppercase tracking-widest">Order ID</p>
                        <p className="font-mono font-bold text-stone-900 text-sm">#{truncateId(order._id)}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                       <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest px-1">Items Ordered</p>
                       <div className="flex flex-wrap gap-2">
                          {(order?.products || []).filter(item => item && (item.title || item.product?.title)).slice(0, 2).map((item, i) => (
                             <span key={i} className="px-4 py-2 bg-stone-50 rounded-xl text-stone-600 text-xs font-bold border border-stone-50">
                                {item?.title || item?.product?.title || 'Item'} x{item?.quantity || 1}
                             </span>
                          ))}
                          {(order?.products || []).filter(item => item).length > 2 && (
                             <span className="px-4 py-2 bg-primary-light text-primary rounded-xl text-[10px] font-black uppercase">
                                +{(order?.products || []).filter(item => item).length - 2} More
                             </span>
                          )}
                       </div>
                    </div>
                  </div>

                  {/* Right: Status & Total */}
                  <div className="flex flex-row md:flex-col justify-between items-end gap-4 min-w-[200px]">
                     <StatusBadge status={order?.orderStatus || 'Pending'} />
                     
                     <div className="text-right space-y-1">
                        <p className="text-[10px] font-black text-stone-300 uppercase tracking-widest">Grand Total</p>
                        <p className="text-2xl font-bold text-primary">{formatCurrency(order?.totalAmount || 0)}</p>
                        <div className="flex items-center gap-2 text-stone-400 text-[10px] font-bold justify-end">
                           <CreditCard size={10} /> Paid via Razorpay
                        </div>
                     </div>

                     <div className="hidden md:flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest group-hover:gap-4 transition-all">
                        View Details <ChevronRight size={14} />
                     </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-stone-50 flex justify-between items-center text-stone-400">
                   <div className="flex items-center gap-2 text-xs font-medium">
                      <Calendar size={14} /> {formatDate(order?.createdAt)}
                   </div>
                   <div className="flex items-center gap-2 text-xs font-medium">
                      <Clock size={14} /> Express Delivery
                   </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
