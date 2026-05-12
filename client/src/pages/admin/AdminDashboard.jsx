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
  Layers,
  ArrowUpRight,
  Activity
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
        setRecentOrders(orders.slice(0, 8)); // Show a bit more
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
    { label: 'Total Revenue', value: formatCurrency(stats.totalRevenue), icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: '+12.5%' },
    { label: "Today's Orders", value: stats.todayOrders, icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50', trend: 'Fresh' },
    { label: "Pending Action", value: stats.pendingOrders, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', trend: 'Priority' },
    { label: 'Inventory', value: productCount, icon: Package, color: 'text-purple-600', bg: 'bg-purple-50', trend: 'Healthy' },
  ];

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="animate-spin text-amber-600 mx-auto mb-4" size={48} />
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Assembling Dashboard</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 text-amber-600 font-bold text-xs uppercase tracking-widest mb-2">
            <Activity size={14} /> Live Operations
          </div>
          <h1 className="text-5xl font-playfair font-bold text-slate-900">Analytics Overview</h1>
        </div>
        <div className="flex gap-3">
          <div className="bg-white border border-slate-100 px-6 py-3 rounded-2xl shadow-sm text-sm font-bold text-slate-500">
            {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
        </div>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
        {statCards.map((card, i) => (
          <div key={i} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 group relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-32 h-32 ${card.bg} rounded-full -translate-y-1/2 translate-x-1/2 opacity-20 group-hover:scale-150 transition-transform`} />
            <div className="relative">
              <div className={`w-14 h-14 rounded-2xl ${card.bg} ${card.color} flex items-center justify-center mb-6 transition-transform group-hover:scale-110 shadow-lg shadow-current/5`}>
                <card.icon size={28} />
              </div>
              <p className="text-xs font-black text-slate-300 uppercase tracking-widest mb-1">{card.label}</p>
              <h3 className="text-3xl font-bold text-slate-900 mb-2">{card.value}</h3>
              <div className={`inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-1 rounded-lg ${card.bg} ${card.color}`}>
                <ArrowUpRight size={10} /> {card.trend}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Recent Orders */}
        <div className="lg:col-span-8 bg-white rounded-[3.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-10 border-b border-slate-50 flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-playfair font-bold text-slate-900">Recent Transactions</h2>
              <p className="text-slate-400 text-sm mt-1">Real-time update of your latest customer activity.</p>
            </div>
            <Link to="/admin/orders" className="px-6 py-3 bg-slate-50 hover:bg-amber-50 text-slate-600 hover:text-amber-600 rounded-2xl font-bold text-xs transition-all flex items-center gap-2 group">
              View All <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="flex-1">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-separate border-spacing-0">
                <thead>
                  <tr className="text-slate-300 text-[10px] font-black uppercase tracking-[0.2em]">
                    <th className="px-10 py-6 border-b border-slate-50">Order Details</th>
                    <th className="px-10 py-6 border-b border-slate-50">Customer</th>
                    <th className="px-10 py-6 border-b border-slate-50">Value</th>
                    <th className="px-10 py-6 border-b border-slate-50">Status</th>
                    <th className="px-10 py-6 border-b border-slate-50 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {recentOrders.map((order) => (
                    <tr key={order._id} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="px-10 py-6">
                        <span className="font-mono text-slate-300 text-[11px] block">{truncateId(order._id)}</span>
                        <span className="text-[10px] font-black text-slate-400 uppercase mt-1 block">{(order.products?.length || 0)} Items</span>
                      </td>
                      <td className="px-10 py-6 font-bold text-slate-900">{order.userId?.name || 'Guest User'}</td>
                      <td className="px-10 py-6 font-bold text-slate-900">{formatCurrency(order.totalAmount)}</td>
                      <td className="px-10 py-6">
                        <StatusBadge status={order.orderStatus} />
                      </td>
                      <td className="px-10 py-6 text-right">
                        <Link to={`/admin/orders/${order._id}`} className="text-amber-600 opacity-0 group-hover:opacity-100 font-black text-[10px] uppercase tracking-widest hover:underline transition-all">Details</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Top Performers */}
        <div className="lg:col-span-4 space-y-10">
          <div className="bg-slate-900 rounded-[3.5rem] p-10 text-white shadow-2xl shadow-slate-200">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-playfair font-bold">Top Sellers</h2>
              <Layers className="text-amber-500" size={24} />
            </div>
            <div className="space-y-6">
              {stats.topProducts?.length > 0 ? (
                stats.topProducts.map((p, i) => (
                  <div key={p._id} className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-3xl transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center font-bold text-amber-500">
                        {i + 1}
                      </div>
                      <div>
                        <p className="font-bold text-sm leading-none mb-1 group-hover:text-amber-400 transition-colors">{p.title}</p>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Performance Lead</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-amber-500 text-sm">{p.totalOrdered}</p>
                      <p className="text-[9px] text-slate-500 font-black uppercase">Units Sold</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 opacity-50">
                  <p className="text-sm font-bold">No sales data recorded yet.</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-amber-500 rounded-[3.5rem] p-10 text-slate-950 flex flex-col justify-between h-64 group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full translate-x-1/2 -translate-y-1/2" />
            <div className="relative">
              <h3 className="text-2xl font-playfair font-bold leading-tight">Need a quick<br />business review?</h3>
              <p className="text-slate-950/60 text-xs font-bold mt-2">Export your latest reports today.</p>
            </div>
            <button className="relative w-fit bg-slate-950 text-white px-8 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest shadow-xl shadow-slate-950/20 hover:scale-105 active:scale-95 transition-all">
              Download Report
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
