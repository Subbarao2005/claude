import { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Users, 
  Package, 
  TrendingUp, 
  Clock, 
  CheckCircle,
  Loader2,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { formatCurrency, formatDate, truncateId, getStatusColor } from '../../utils/helpers';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalUsers: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [ordersRes, productsRes, usersRes] = await Promise.allSettled([
        api.get('/orders/admin/all'),
        api.get('/products/admin/all'),
        api.get('/auth/admin/users')
      ]);
    
      const orders = ordersRes.status === 'fulfilled' ? ordersRes.value.data.orders || [] : [];
      const products = productsRes.status === 'fulfilled' ? productsRes.value.data.products || [] : [];
      const users = usersRes.status === 'fulfilled' ? usersRes.value.data.users || [] : [];
    
      setStats({
        totalOrders: orders.length,
        pendingOrders: orders.filter(o => (o.orderStatus || 'Pending') === 'Pending').length,
        completedOrders: orders.filter(o => (o.orderStatus || '').toLowerCase() === 'delivered').length,
        totalRevenue: orders
          .filter(o => (o.paymentStatus || '').toLowerCase() === 'successful')
          .reduce((sum, o) => sum + (o.totalAmount || 0), 0),
        totalProducts: products.length,
        totalUsers: users.length
      });
    
      setRecentOrders(orders.slice(0, 5));
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: 'Total Revenue', value: formatCurrency(stats.totalRevenue), icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Total Orders', value: stats.totalOrders, icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Pending Orders', value: stats.pendingOrders, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Total Products', value: stats.totalProducts, icon: Package, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Active Users', value: stats.totalUsers, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Completed', value: stats.completedOrders, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-amber-600" size={48} />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-10">
        <h1 className="text-4xl font-playfair font-bold text-slate-900">Dashboard Overview</h1>
        <p className="text-slate-500 mt-2">Real-time insights into your dessert business.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {statCards.map((card, i) => (
          <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm border-b-4 border-b-transparent hover:border-b-amber-500 transition-all group">
            <div className="flex items-center gap-6">
              <div className={`p-4 rounded-2xl ${card.bg} ${card.color} transition-transform group-hover:scale-110`}>
                <card.icon size={28} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">{card.label}</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">{card.value}</h3>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center">
          <h2 className="text-2xl font-playfair font-bold text-slate-900">Recent Orders</h2>
          <Link to="/admin/orders" className="text-amber-600 font-bold flex items-center gap-2 hover:gap-3 transition-all">
            View All <ArrowRight size={18} />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-400 text-xs font-bold uppercase tracking-widest">
                <th className="px-8 py-4">Order ID</th>
                <th className="px-8 py-4">Customer</th>
                <th className="px-8 py-4">Amount</th>
                <th className="px-8 py-4">Status</th>
                <th className="px-8 py-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-8 py-5 font-mono text-slate-400">{truncateId(order._id)}</td>
                    <td className="px-8 py-5 font-bold text-slate-900">{order.userId?.name || 'Unknown Customer'}</td>
                    <td className="px-8 py-5 font-bold text-slate-900">{formatCurrency(order.totalAmount || 0)}</td>
                    <td className="px-8 py-5">
                      <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${getStatusColor(order.orderStatus)}`}>
                        {order.orderStatus || 'Pending'}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-slate-500 text-sm">{formatDate(order.createdAt)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-8 py-10 text-center text-slate-400 font-medium">No recent orders found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
