import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { formatCurrency, getStatusColor, getPaymentStatusColor, formatDate, truncateId } from '../../utils/helpers';
import { RefreshCw, Search } from 'lucide-react';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('All');
  const [paymentFilter, setPaymentFilter] = useState('All');
  const [search, setSearch] = useState('');

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders/admin/all');
      if (res.data.success) {
        setOrders(res.data.orders);
      }
    } catch (err) {
      console.error('Failed to fetch orders', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const res = await api.put(`/orders/${orderId}/status`, { status: newStatus });
      if (res.data.success) {
        setOrders(prev => prev.map(o => o._id === orderId ? { ...o, orderStatus: newStatus } : o));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchStatus = statusFilter === 'All' || o.orderStatus === statusFilter;
      const matchPayment = paymentFilter === 'All' || o.paymentStatus === paymentFilter;
      const matchSearch = (o.userId?.name || '').toLowerCase().includes(search.toLowerCase()) || 
                          o._id.includes(search);
      return matchStatus && matchPayment && matchSearch;
    });
  }, [orders, statusFilter, paymentFilter, search]);

  const orderStatuses = ["Pending", "Accepted", "Preparing", "Out for Delivery", "Delivered", "Rejected", "Cancelled"];

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-spin w-12 h-12 border-4 border-gray-300 border-t-gray-900 rounded-full"></div></div>;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="font-playfair text-3xl font-bold text-gray-900">Manage Orders</h1>
          <button 
            onClick={handleRefresh} 
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 text-gray-700 font-medium transition-colors disabled:opacity-50"
          >
            <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search customer or Order ID..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10 w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          
          <div className="flex gap-4 w-full md:w-auto">
            <select 
              value={statusFilter} 
              onChange={e => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-amber-500 w-full md:w-40"
            >
              <option value="All">All Statuses</option>
              {orderStatuses.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            
            <select 
              value={paymentFilter} 
              onChange={e => setPaymentFilter(e.target.value)}
              className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-amber-500 w-full md:w-48"
            >
              <option value="All">All Payments</option>
              <option value="pending">Pending</option>
              <option value="successful">Successful</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Order Info</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Customer</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Payment</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Status Update</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.map(order => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-mono text-sm text-gray-900">{truncateId(order._id)}</p>
                      <p className="text-xs text-gray-500 mt-1">{formatDate(order.createdAt)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900 text-sm">{order.userId?.name || 'Deleted User'}</p>
                      <p className="text-xs text-gray-500 truncate w-32">{order.products.map(p=>p.title).join(', ')}</p>
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900 text-sm">
                      {formatCurrency(order.totalAmount)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${getPaymentStatusColor(order.paymentStatus)}`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <select 
                        value={order.orderStatus}
                        onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                        className={`text-sm rounded-lg px-2 py-1 outline-none border focus:ring-2 focus:ring-amber-500 ${getStatusColor(order.orderStatus)}`}
                        disabled={order.orderStatus === 'Cancelled'}
                      >
                        {orderStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link to={`/admin/orders/${order._id}`} className="text-sm text-amber-600 hover:text-amber-800 font-bold bg-amber-50 px-3 py-1.5 rounded-md">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
                {filteredOrders.length === 0 && (
                  <tr><td colSpan="6" className="text-center py-12 text-gray-500">No orders match the filters.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
