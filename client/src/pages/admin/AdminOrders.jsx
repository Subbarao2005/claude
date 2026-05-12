import { useState, useEffect } from 'react';
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
  Search, 
  Filter, 
  Eye, 
  RefreshCw, 
  Download, 
  ChevronRight,
  ArrowUpDown,
  ShoppingBag,
  Activity
} from 'lucide-react';
import { Link } from 'react-router-dom';

const NEXT_STATUSES = {
  'Pending':          ['Accepted', 'Rejected'],
  'Accepted':         ['Preparing', 'Cancelled'],
  'Preparing':        ['Out for Delivery'],
  'Out for Delivery': ['Delivered'],
  'Delivered':        [],
  'Rejected':         [],
  'Cancelled':        []
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterPayment, setFilterPayment] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [reasonModal, setReasonModal] = useState({ isOpen: false, orderId: null, nextStatus: null });

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [orders, filterStatus, filterPayment, searchTerm]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/orders/admin/all');
      if (res.data.success) {
        setOrders(res.data.orders || []);
      }
    } catch (err) {
      console.error('Fetch orders error:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...orders];
    if (filterStatus !== 'All') result = result.filter(o => o.orderStatus === filterStatus);
    if (filterPayment !== 'All') result = result.filter(o => o.paymentStatus === filterPayment.toLowerCase());
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(o => 
        o._id.toLowerCase().includes(term) || 
        o.userId?.name?.toLowerCase().includes(term) ||
        o.address?.phone?.includes(term)
      );
    }
    setFilteredOrders(result);
  };

  const handleStatusChange = async (orderId, currentStatus, nextStatus) => {
    if (nextStatus === 'Rejected' || nextStatus === 'Cancelled') {
      setReasonModal({ isOpen: true, orderId, nextStatus });
      return;
    }
    await updateStatusRequest(orderId, nextStatus);
  };

  const updateStatusRequest = async (orderId, nextStatus, reason = '') => {
    try {
      const res = await api.put(`/orders/${orderId}/status`, { 
        orderStatus: nextStatus,
        reason: reason 
      });
      if (res.data.success) {
        setOrders(prev => prev.map(o => o._id === orderId ? { ...o, orderStatus: nextStatus } : o));
        setReasonModal({ isOpen: false, orderId: null, nextStatus: null });
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  const exportToCSV = () => {
    const headers = ['Order ID,Customer,Email,Phone,Amount,Payment,Status,Date\n'];
    const rows = filteredOrders.map(o => 
      `${o._id},${o.userId?.name || 'Unknown'},${o.userId?.email || ''},${o.address?.phone || ''},${o.totalAmount},${o.paymentStatus},${o.orderStatus},${o.createdAt}\n`
    );
    const blob = new Blob([...headers, ...rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `melcho-orders-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="animate-spin text-amber-600 mx-auto mb-4" size={48} />
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Retrieving Transactions</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-12">
        <div>
          <div className="flex items-center gap-2 text-amber-600 font-bold text-xs uppercase tracking-widest mb-2">
            <ShoppingBag size={14} /> Order Fulfillment
          </div>
          <h1 className="text-5xl font-playfair font-bold text-slate-900">Manage Orders</h1>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={fetchOrders} 
            className="p-4 bg-white border border-slate-100 text-slate-400 rounded-2xl hover:text-amber-600 hover:bg-amber-50 hover:border-amber-100 transition-all shadow-sm"
          >
            <RefreshCw size={20} />
          </button>
          <button 
            onClick={exportToCSV} 
            className="flex items-center gap-3 px-8 py-4 bg-slate-950 text-white font-bold rounded-[1.5rem] hover:bg-amber-500 hover:text-slate-950 transition-all shadow-xl shadow-slate-900/10 text-sm uppercase tracking-widest"
          >
            <Download size={20} /> Export Report
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm mb-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-amber-500 transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Search ID or Phone..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-50 rounded-2xl focus:ring-4 focus:ring-amber-500/10 focus:bg-white outline-none transition-all font-medium text-slate-900"
          />
        </div>
        
        <div className="relative">
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full pl-6 pr-12 py-4 bg-slate-50 border border-slate-50 rounded-2xl outline-none focus:ring-4 focus:ring-amber-500/10 focus:bg-white font-bold text-slate-600 appearance-none transition-all"
          >
            <option value="All">All Statuses</option>
            {Object.keys(NEXT_STATUSES).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <Filter className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={18} />
        </div>

        <div className="relative">
          <select 
            value={filterPayment}
            onChange={(e) => setFilterPayment(e.target.value)}
            className="w-full pl-6 pr-12 py-4 bg-slate-50 border border-slate-50 rounded-2xl outline-none focus:ring-4 focus:ring-amber-500/10 focus:bg-white font-bold text-slate-600 appearance-none transition-all"
          >
            <option value="All">All Payments</option>
            <option value="Successful">Successful</option>
            <option value="Pending">Pending</option>
            <option value="Failed">Failed</option>
          </select>
          <Activity className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={18} />
        </div>

        <div className="flex items-center justify-center bg-amber-50 text-amber-600 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl border border-amber-100 px-6">
          {filteredOrders.length} Orders Listed
        </div>
      </div>

      <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-0">
            <thead>
              <tr className="bg-slate-50/50 text-slate-300 text-[10px] font-black uppercase tracking-[0.2em]">
                <th className="px-10 py-8 border-b border-slate-50">Transaction ID</th>
                <th className="px-10 py-8 border-b border-slate-50">Customer</th>
                <th className="px-10 py-8 border-b border-slate-50">Menu Items</th>
                <th className="px-10 py-8 border-b border-slate-50">Revenue</th>
                <th className="px-10 py-8 border-b border-slate-50">Payment</th>
                <th className="px-10 py-8 border-b border-slate-50">Flow Control</th>
                <th className="px-10 py-8 border-b border-slate-50 text-right">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredOrders.map((order) => {
                const nextOptions = NEXT_STATUSES[order.orderStatus] || [];
                
                return (
                  <tr key={order._id} className="group hover:bg-slate-50/50 transition-all duration-300">
                    <td className="px-10 py-8">
                      <span className="font-mono text-slate-400 text-[11px] block">{truncateId(order._id)}</span>
                      <span className="text-[10px] text-slate-300 font-black mt-1.5 uppercase tracking-wider">{formatDate(order.createdAt)}</span>
                    </td>
                    <td className="px-10 py-8">
                      <p className="font-bold text-slate-900 group-hover:text-amber-600 transition-colors">{order.userId?.name || 'Guest User'}</p>
                      <p className="text-[10px] font-black text-slate-400 uppercase mt-1 tracking-widest">{order.address?.phone || 'No Contact'}</p>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex flex-wrap gap-2">
                        {order.products?.map((p, i) => (
                          <span key={i} className="px-3 py-1 bg-white border border-slate-100 rounded-full text-[10px] font-bold text-slate-500 shadow-sm">
                            {p.title} <span className="text-amber-500">×{p.quantity}</span>
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-10 py-8 font-bold text-slate-900 text-lg">{formatCurrency(order.totalAmount)}</td>
                    <td className="px-10 py-8">
                      <StatusBadge type="payment" status={order.paymentStatus} />
                    </td>
                    <td className="px-10 py-8">
                      {nextOptions.length > 0 ? (
                        <div className="relative inline-block w-full max-w-[140px]">
                          <select 
                            value={order.orderStatus}
                            onChange={(e) => handleStatusChange(order._id, order.orderStatus, e.target.value)}
                            className="w-full bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest outline-none focus:ring-4 focus:ring-amber-500/10 cursor-pointer shadow-sm appearance-none hover:border-amber-500 transition-all"
                          >
                            <option value={order.orderStatus}>{order.orderStatus}</option>
                            {nextOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                          </select>
                          <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 rotate-90 pointer-events-none" size={14} />
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-950 text-white rounded-xl text-[9px] font-black uppercase tracking-widest">
                          <div className="w-1 h-1 bg-amber-500 rounded-full" />
                          {order.orderStatus}
                        </div>
                      )}
                    </td>
                    <td className="px-10 py-8 text-right">
                      <Link to={`/admin/orders/${order._id}`} className="p-4 text-slate-300 hover:text-amber-600 hover:bg-amber-50 rounded-2xl transition-all inline-block group/view">
                        <Eye size={22} className="group-hover/view:scale-110 transition-transform" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <ReasonModal 
        isOpen={reasonModal.isOpen}
        title={`Action: ${reasonModal.nextStatus}`}
        onConfirm={(reason) => updateStatusRequest(reasonModal.orderId, reasonModal.nextStatus, reason)}
        onCancel={() => setReasonModal({ isOpen: false, orderId: null, nextStatus: null })}
      />
    </AdminLayout>
  );
}
