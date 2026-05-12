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
  ArrowUpDown
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
  
  // Modal state for reason input
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

    if (filterStatus !== 'All') {
      result = result.filter(o => o.orderStatus === filterStatus);
    }

    if (filterPayment !== 'All') {
      result = result.filter(o => o.paymentStatus === filterPayment.toLowerCase());
    }

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
          <Loader2 className="animate-spin text-amber-600" size={48} />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-playfair font-bold text-slate-900">Manage Orders</h1>
          <p className="text-slate-500 mt-2">Filter, track, and update all customer orders.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchOrders} className="p-4 bg-white border border-slate-200 text-slate-600 rounded-2xl hover:bg-slate-50 transition-all">
            <RefreshCw size={20} />
          </button>
          <button onClick={exportToCSV} className="flex items-center gap-2 px-6 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-200">
            <Download size={20} /> Export CSV
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search orders..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none"
          />
        </div>
        
        <select 
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 font-bold text-slate-600"
        >
          <option value="All">All Statuses</option>
          {Object.keys(NEXT_STATUSES).map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        <select 
          value={filterPayment}
          onChange={(e) => setFilterPayment(e.target.value)}
          className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 font-bold text-slate-600"
        >
          <option value="All">All Payments</option>
          <option value="Successful">Successful</option>
          <option value="Pending">Pending</option>
          <option value="Failed">Failed</option>
        </select>

        <div className="flex items-center justify-center text-slate-400 text-sm font-bold">
          {filteredOrders.length} orders found
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                <th className="px-8 py-6">Order</th>
                <th className="px-8 py-6">Customer</th>
                <th className="px-8 py-6">Items</th>
                <th className="px-8 py-6">Amount</th>
                <th className="px-8 py-6">Payment</th>
                <th className="px-8 py-6">Status</th>
                <th className="px-8 py-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredOrders.map((order) => {
                const nextOptions = NEXT_STATUSES[order.orderStatus] || [];
                
                return (
                  <tr key={order._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="font-mono text-slate-400 text-xs">{truncateId(order._id)}</span>
                        <span className="text-[10px] text-slate-300 font-black mt-1 uppercase">{formatDate(order.createdAt)}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900">{order.userId?.name || 'Unknown'}</span>
                        <span className="text-xs text-slate-400">{order.address?.phone || 'No Phone'}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-wrap gap-1">
                        {order.products?.map((p, i) => (
                          <span key={i} className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-bold text-slate-500 whitespace-nowrap">
                            {p.title} x{p.quantity}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-8 py-6 font-bold text-slate-900">{formatCurrency(order.totalAmount)}</td>
                    <td className="px-8 py-6">
                      <StatusBadge type="payment" status={order.paymentStatus} />
                    </td>
                    <td className="px-8 py-6">
                      {nextOptions.length > 0 ? (
                        <select 
                          value={order.orderStatus}
                          onChange={(e) => handleStatusChange(order._id, order.orderStatus, e.target.value)}
                          className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-bold outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
                        >
                          <option value={order.orderStatus}>{order.orderStatus}</option>
                          {nextOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      ) : (
                        <span className="px-3 py-1.5 bg-slate-100 text-slate-400 rounded-lg text-[10px] font-black uppercase tracking-widest">
                          Final: {order.orderStatus}
                        </span>
                      )}
                    </td>
                    <td className="px-8 py-6">
                      <Link to={`/admin/orders/${order._id}`} className="p-3 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all inline-block">
                        <Eye size={20} />
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
        title={`Reason for ${reasonModal.nextStatus}`}
        onConfirm={(reason) => updateStatusRequest(reasonModal.orderId, reasonModal.nextStatus, reason)}
        onCancel={() => setReasonModal({ isOpen: false, orderId: null, nextStatus: null })}
      />
    </AdminLayout>
  );
}
