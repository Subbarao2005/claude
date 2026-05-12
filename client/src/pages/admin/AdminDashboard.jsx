import { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Users, 
  Package, 
  TrendingUp, 
  Clock, 
  CheckCircle,
  Loader2,
  ArrowRight,
  Calendar,
  Layers
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import AdminLayout from '../../components/AdminLayout';
import { formatCurrency, formatDate, truncateId } from '../../utils/helpers';
import StatusBadge from '../../components/admin/StatusBadge';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    todayOrders: 0,
    weekOrders: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
    totalRevenue: 0,
    topProducts: []
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [productCount, setProductCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const [statsRes, ordersRes, productsRes] = await Promise.allSettled([
        api.get('/orders/admin/stats'),
        api.get('/orders/admin/all'),
        api.get('/products/admin/all')
      ]);
    
      if (statsRes.status === 'fulfilled' && statsRes.value.data.success) {
        setStats(statsRes.value.data.stats);
      }
    
      if (ordersRes.status === 'fulfilled') {
        const orders = ordersRes.value.data.orders || [];
        setRecentOrders(orders.slice(0, 5));
      }
    
      if (productsRes.status === 'fulfilled') {
        setProductCount(productsRes.value.data.products?.length || 0);
      }
    } catch (err) {
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: 'Total Revenue', value: formatCurrency(stats.totalRevenue), icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: "Today's Orders", value: stats.todayOrders, icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: "Weekly Orders", value: stats.weekOrders, icon: Layers, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Pending Action', value: stats.pendingOrders, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Total Products', value: productCount, icon: Package, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Delivered', value: stats.deliveredOrders, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ];

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
      <div className="mb-10">
        <h1 className="text-4xl font-playfair font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-2">Welcome back! Here's what's happening with Melcho today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {statCards.map((card, i) => (
          <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Top Products */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden h-fit">
          <div className="p-8 border-b border-slate-50">
            <h2 className="text-2xl font-playfair font-bold text-slate-900">Top Products</h2>
          </div>
          <div className="p-6 space-y-4">
            {stats.topProducts?.length > 0 ? (
              stats.topProducts.map((p, i) => (
                <div key={p._id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                  <div className="flex items-center gap-4">
                    <span className="w-8 h-8 flex items-center justify-center bg-white rounded-lg text-xs font-black text-slate-400">0{i+1}</span>
                    <span className="font-bold text-slate-800 truncate max-w-[150px]">{p.title}</span>
                  </div>
                  <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-black">{p.totalOrdered} Sold</span>
                </div>
              ))
            ) : (
              <p className="text-center text-slate-400 py-4">No data yet.</p>
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex justify-between items-center">
            <h2 className="text-2xl font-playfair font-bold text-slate-900">Recent Orders</h2>
            <Link to="/admin/orders" className="text-amber-600 font-bold flex items-center gap-2 hover:gap-3 transition-all">
              Manage All <ArrowRight size={18} />
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
                  <th className="px-8 py-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-8 py-5 font-mono text-slate-400 text-sm">{truncateId(order._id)}</td>
                    <td className="px-8 py-5 font-bold text-slate-900">{order.userId?.name || 'Unknown'}</td>
                    <td className="px-8 py-5 font-bold text-slate-900">{formatCurrency(order.totalAmount)}</td>
                    <td className="px-8 py-5">
                      <StatusBadge status={order.orderStatus} />
                    </td>
                    <td className="px-8 py-5">
                      <Link to={`/admin/orders/${order._id}`} className="text-amber-600 hover:underline font-bold text-sm">View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
