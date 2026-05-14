import { useState, useEffect, useMemo } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  RefreshCw, 
  ArrowRight, 
  ChevronRight, 
  MoreVertical,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  X,
  Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import AdminLayout from '../../components/admin/AdminLayout';
import { formatCurrency, formatDate, truncateId } from '../../utils/helpers';
import StatusBadge from '../../components/admin/StatusBadge';
import toast from 'react-hot-toast';

const STATUS_TABS = [
  'All',
  'Pending',
  'Accepted',
  'Preparing',
  'Out for Delivery',
  'Delivered',
  'Rejected',
  'Cancelled'
];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeStatus, setActiveStatus] = useState('All');
  const [paymentFilter, setPaymentFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('All');
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  const fetchOrders = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      
      const res = await api.get('/orders/admin/all');
      if (res.data.success) {
        setOrders(Array.isArray(res.data.orders) ? res.data.orders.filter(order => order && order._id) : []);
        setLastRefreshed(new Date());
      }
    } catch (err) {
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    console.log('AdminOrders mounted successfully');
    return () => console.log('AdminOrders unmounting');
  }, []);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(() => fetchOrders(true), 60000);
    return () => clearInterval(interval);
  }, []);

  const filteredOrders = useMemo(() => {
    let result = [];
    try {
      result = (orders || []).filter(order => {
        if (!order || typeof order !== 'object') return false;
        if (!order._id) return false;
        
        const safeSearch = String(search || '').toLowerCase().trim();
        const orderIdStr = String(order._id || '').toLowerCase();
        const userNameStr = String(order.userId?.name || '').toLowerCase();
        const addressPhoneStr = String(order.address?.phone || '');
        const shippingPhoneStr = String(order.shippingAddress?.phone || '');

        const matchesSearch = safeSearch === '' || 
          orderIdStr.includes(safeSearch) || 
          userNameStr.includes(safeSearch) ||
          addressPhoneStr.includes(safeSearch) ||
          shippingPhoneStr.includes(safeSearch);
        
        const matchesStatus = activeStatus === 'All' || order.orderStatus === activeStatus;
        
        const matchesPayment = paymentFilter === 'All' || 
          (paymentFilter === 'Paid' && (order.paymentStatus === 'Paid' || order.paymentStatus === 'successful')) ||
          (paymentFilter === 'Pending' && (order.paymentStatus === 'Pending' || order.paymentStatus === 'pending'));

        const matchesDate = dateFilter === 'All' || (() => {
          try {
            const orderDate = new Date(order.createdAt);
            const today = new Date();
            if (dateFilter === 'Today') return orderDate.toDateString() === today.toDateString();
            if (dateFilter === 'This Week') {
              const weekAgo = new Date();
              weekAgo.setDate(today.getDate() - 7);
              return orderDate >= weekAgo;
            }
          } catch (e) {}
          return true;
        })();

        return matchesSearch && matchesStatus && matchesPayment && matchesDate;
      });
    } catch (e) {
      console.error('FILTER CRASH:', e);
    }
    return result;
  }, [orders, search, activeStatus, paymentFilter, dateFilter]);

  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-8">
           <div className="h-20 bg-white rounded-3xl animate-pulse" />
           <div className="h-96 bg-white rounded-[3rem] animate-pulse" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-12">
        <div className="space-y-1">
           <div className="flex items-center gap-3">
              <h1 className="text-4xl font-playfair font-extrabold text-slate-950">Orders Management</h1>
              <span className="px-3 py-1 bg-amber-500 text-slate-950 text-[10px] font-black rounded-full shadow-lg shadow-amber-500/10">
                 {filteredOrders.length} Results
              </span>
           </div>
           <p className="text-gray-400 font-medium">Monitor and process incoming dessert requests.</p>
        </div>
        <div className="flex items-center gap-4">
           <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest hidden md:block">Last updated: {lastRefreshed.toLocaleTimeString()}</p>
           <button 
             onClick={() => fetchOrders(true)}
             disabled={refreshing}
             className="p-4 bg-white border border-gray-100 rounded-2xl text-gray-500 hover:text-amber-600 shadow-sm transition-all active:scale-95 flex items-center gap-2"
           >
             <RefreshCw size={20} className={refreshing ? 'animate-spin' : ''} />
             <span className="hidden sm:inline font-bold text-xs uppercase tracking-widest">Refresh</span>
           </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm mb-12 space-y-8">
         <div className="flex flex-col xl:flex-row gap-6">
            {/* Search */}
            <div className="flex-grow relative group">
               <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-amber-500 transition-colors" size={20} />
               <input 
                 type="text"
                 placeholder="Search by Order ID, Customer Name, or Phone..."
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
                 className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-gray-50 rounded-2xl outline-none focus:ring-4 focus:ring-amber-500/5 transition-all font-medium text-slate-950"
               />
            </div>

            <div className="flex flex-wrap gap-4">
               {/* Payment Filter */}
               <div className="bg-gray-50 rounded-2xl px-5 py-2 border border-gray-100 flex items-center gap-4">
                  <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Payment</span>
                  <select 
                    value={paymentFilter}
                    onChange={(e) => setPaymentFilter(e.target.value)}
                    className="bg-transparent font-bold text-sm text-slate-900 outline-none cursor-pointer"
                  >
                     <option value="All">All Statuses</option>
                     <option value="Paid">Paid Only</option>
                     <option value="Pending">Pending Only</option>
                  </select>
               </div>

               {/* Date Filter */}
               <div className="bg-gray-50 rounded-2xl px-5 py-2 border border-gray-100 flex items-center gap-4">
                  <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Period</span>
                  <select 
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="bg-transparent font-bold text-sm text-slate-900 outline-none cursor-pointer"
                  >
                     <option value="All">Lifetime</option>
                     <option value="Today">Today Only</option>
                     <option value="This Week">Last 7 Days</option>
                  </select>
               </div>
            </div>
         </div>

         {/* Status Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
            {STATUS_TABS.map(tab => {
               let count = 0;
               try {
                 count = (Array.isArray(orders) ? orders : []).filter(o => {
                   if (!o || typeof o !== 'object') return false;
                   return tab === 'All' || String(o.orderStatus || '') === tab;
                 }).length;
               } catch(e) {}
               const isActive = activeStatus === tab;
               return (
                  <button
                    key={tab}
                    onClick={() => setActiveStatus(tab)}
                    className={`whitespace-nowrap px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all flex items-center gap-3 ${
                       isActive 
                        ? 'bg-amber-500 text-slate-950 shadow-xl shadow-amber-500/10' 
                        : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'
                    }`}
                  >
                     {tab}
                     <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                        isActive ? 'bg-slate-950/10 text-slate-950' : 'bg-gray-100 text-gray-400'
                     }`}>
                        {count}
                     </span>
                  </button>
               );
            })}
         </div>
      </div>

      {/* Orders Table/Cards */}
      <div className="bg-white rounded-[3.5rem] border border-gray-100 shadow-sm overflow-hidden">
         {/* Desktop Table */}
         <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                  <tr className="bg-gray-50/50 text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">
                     <th className="px-10 py-8">Order ID</th>
                     <th className="px-10 py-8">Customer Details</th>
                     <th className="px-10 py-8">Items</th>
                     <th className="px-10 py-8">Financials</th>
                     <th className="px-10 py-8">Current Status</th>
                     <th className="px-10 py-8 text-right">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-50">
                  {filteredOrders.length > 0 ? filteredOrders.filter(order => order && order._id).map((order) => (
                    <tr key={order._id} className="group hover:bg-amber-50/30 transition-colors">
                       <td className="px-10 py-8">
                          <span className="font-mono text-amber-600 font-bold text-sm block">#{truncateId(order._id)}</span>
                          <span className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold uppercase mt-1">
                             <Calendar size={12} /> {formatDate(order.createdAt)}
                          </span>
                       </td>
                       <td className="px-10 py-8">
                          <p className="font-black text-slate-900 text-base">{order.userId?.name || order.address?.name || order.shippingAddress?.name || 'Unknown'}</p>
                          <p className="text-xs text-gray-400 font-bold mt-0.5 flex items-center gap-1.5 italic">
                             <Clock size={12} /> Ordered {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                       </td>
                       <td className="px-10 py-8">
                          <div className="flex flex-wrap gap-1.5">
                             <span className="px-3 py-1 bg-gray-50 text-gray-600 text-[10px] font-bold rounded-lg border border-gray-100">
                                {(order.products || []).filter(p => p)[0]?.title || (order.products || []).filter(p => p)[0]?.product?.title || 'Item'}
                             </span>
                             {(order.products || []).filter(p => p).length > 1 && (
                                <span className="px-2 py-1 bg-amber-50 text-amber-600 text-[10px] font-black rounded-lg">
                                   +{(order.products || []).filter(p => p).length - 1} More
                                </span>
                             )}
                          </div>
                       </td>
                       <td className="px-10 py-8">
                          <p className="text-lg font-bold text-slate-950">{formatCurrency(order?.totalAmount || 0)}</p>
                          <div className={`inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest mt-1.5 ${order.paymentStatus === 'successful' || order.paymentStatus === 'Paid' ? 'text-emerald-500' : 'text-amber-500'}`}>
                             {order.paymentStatus === 'successful' || order.paymentStatus === 'Paid' ? <CheckCircle2 size={10} /> : <AlertCircle size={10} />}
                             {order?.paymentStatus || 'pending'}
                          </div>
                       </td>
                       <td className="px-10 py-8">
                          <StatusBadge status={order?.orderStatus || 'Pending'} />
                       </td>
                       <td className="px-10 py-8 text-right">
                          <Link 
                            to={`/admin/orders/${order._id}`}
                            className="p-4 bg-gray-50 group-hover:bg-amber-500 text-gray-400 group-hover:text-white rounded-2xl transition-all inline-flex items-center gap-2 group/btn"
                          >
                             <ChevronRight size={20} className="group-hover/btn:translate-x-1 transition-transform" />
                          </Link>
                       </td>
                    </tr>
                  )) : (
                    <tr>
                       <td colSpan={6} className="py-24 text-center">
                          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                             <ShoppingBag size={40} />
                          </div>
                          <p className="text-gray-400 font-bold text-sm">No orders matching your filters.</p>
                       </td>
                    </tr>
                  )}
               </tbody>
            </table>
         </div>

         {/* Mobile Cards */}
         <div className="lg:hidden p-6 space-y-6">
            {filteredOrders.length > 0 ? filteredOrders.filter(order => order && order._id).map((order) => (
              <Link 
                key={order._id}
                to={`/admin/orders/${order._id}`}
                className="block bg-gray-50/50 rounded-3xl p-6 border border-gray-100 hover:border-amber-500 transition-all"
              >
                <div className="flex justify-between items-start mb-6">
                   <div>
                      <p className="font-mono text-amber-600 font-bold text-xs">#{truncateId(order._id)}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">{formatDate(order.createdAt)}</p>
                   </div>
                   <StatusBadge status={order.orderStatus} />
                </div>
                <div className="space-y-4">
                   <div className="flex justify-between items-center">
                      <p className="font-black text-slate-950 text-lg">{order.userId?.name || order.address?.name || order.shippingAddress?.name || 'Unknown'}</p>
                      <p className="text-xl font-bold text-primary">{formatCurrency(order?.totalAmount || 0)}</p>
                   </div>
                   <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                         {(order.products || []).filter(p => p).length || 0} Items
                      </p>
                      <div className={`text-[10px] font-black uppercase tracking-widest ${order.paymentStatus === 'successful' || order.paymentStatus === 'Paid' ? 'text-emerald-500' : 'text-amber-500'}`}>
                         Payment: {order?.paymentStatus || 'pending'}
                      </div>
                   </div>
                </div>
              </Link>
            )) : (
              <div className="py-20 text-center text-gray-400 font-bold">No orders found.</div>
            )}
         </div>
      </div>
    </AdminLayout>
  );
}
