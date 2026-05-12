import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { 
  formatCurrency, 
  formatDate, 
  truncateId, 
  getStatusColor, 
  getPaymentStatusColor 
} from '../../utils/helpers';
import { Loader2, Search, Filter, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/orders/admin/all');
      if (res.data.success) {
        setOrders(res.data.orders || []);
      }
    } catch (err) {
      console.error('Fetch orders error:', err);
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId, newStatus) => {
    try {
      const res = await api.put(`/orders/${orderId}/status`, { orderStatus: newStatus });
      if (res.data.success) {
        setOrders(prev => prev.map(o => o._id === orderId ? { ...o, orderStatus: newStatus } : o));
        alert('Status updated successfully');
      }
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-amber-600" size={48} />
      </div>
    );
  }

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <div className="mb-10">
        <h1 className="text-4xl font-playfair font-bold text-slate-900">Manage Orders</h1>
        <p className="text-slate-500 mt-2">Track and update all customer orders.</p>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-400 text-xs font-bold uppercase tracking-widest">
                <th className="px-8 py-6">Order</th>
                <th className="px-8 py-6">Customer</th>
                <th className="px-8 py-6">Items</th>
                <th className="px-8 py-6">Total</th>
                <th className="px-8 py-6">Payment</th>
                <th className="px-8 py-6">Status</th>
                <th className="px-8 py-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {orders.length > 0 ? (
                orders.map((order) => (
                  <tr key={order._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="font-mono text-slate-400 text-sm">{truncateId(order._id)}</span>
                        <span className="text-[10px] text-slate-300 mt-1 uppercase font-bold">{formatDate(order.createdAt)}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900">{order.userId?.name || 'Unknown Customer'}</span>
                        <span className="text-xs text-slate-400">{order.address?.phone || 'No Phone'}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1">
                        {order.products?.map((p, i) => (
                          <span key={i} className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md w-fit">
                            {p?.title || 'Item'} x{p?.quantity || 1}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-8 py-6 font-bold text-slate-900">{formatCurrency(order.totalAmount || 0)}</td>
                    <td className="px-8 py-6">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${getPaymentStatusColor(order.paymentStatus)}`}>
                        {order.paymentStatus || 'pending'}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <select 
                        value={order.orderStatus || 'Pending'}
                        onChange={(e) => updateStatus(order._id, e.target.value)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold outline-none border border-transparent focus:border-amber-500 transition-all cursor-pointer ${getStatusColor(order.orderStatus)}`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Accepted">Accepted</option>
                        <option value="Preparing">Preparing</option>
                        <option value="Out for Delivery">Out for Delivery</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <Link to={`/admin/orders/${order._id}`} className="p-3 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-2xl transition-all inline-block">
                        <Eye size={20} />
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-8 py-20 text-center text-slate-400 font-medium">No orders found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
