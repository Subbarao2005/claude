import { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Users, 
  Package, 
  TrendingUp, 
  Clock, 
  CheckCircle2,
  Loader2,
  ArrowRight,
  Calendar,
  Layers,
  ArrowUpRight,
  Activity,
  Plus
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import AdminLayout from '../../components/admin/AdminLayout';
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
  const [customerCount, setCustomerCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const [statsRes, ordersRes, productsRes, customersRes] = await Promise.allSettled([
        api.get('/orders/admin/stats'),
        api.get('/orders/admin/all'),
        api.get('/products/admin/all'),
        api.get('/auth/admin/customers')
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

      if (customersRes.status === 'fulfilled') {
        setCustomerCount(customersRes.value.data.customers?.length || 0);
      }
    } catch (err) {
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const metricCards = [
    { label: 'Total Orders', value: stats.totalOrders, subtext: `+${stats.todayOrders} today`, icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
    { label: 'Needs Attention', value: stats.pendingOrders, subtext: 'Requires action', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', pulse: stats.pendingOrders > 0 },
    { label: 'Total Revenue', value: formatCurrency(stats.totalRevenue), subtext: 'From paid orders', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
    { label: 'Delivered', value: stats.deliveredOrders, subtext: 'Completed', icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100' },
  ];

  if (loading) {
    return (
      <AdminLayout>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
           {[1,2,3,4].map(i => <div key={i} className="h-40 bg-white rounded-[2rem] animate-pulse" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           {[1,2].map(i => <div key={i} className="h-96 bg-white rounded-[3rem] animate-pulse" />)}
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
           <h2 className="text-xl text-gray-400 font-medium mb-1">Welcome back, Admin 👋</h2>
           <h1 className="text-5xl font-playfair font-extrabold text-slate-950">Dashboard Overview</h1>
        </div>
        <div className="flex gap-4">
           <div className="bg-white border border-gray-200 px-6 py-3 rounded-2xl shadow-sm text-sm font-bold text-gray-500 flex items-center gap-3">
              <Calendar size={18} /> {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
           </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
        {metricCards.map((card, i) => (
          <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-32 h-32 ${card.bg} rounded-full -translate-y-1/2 translate-x-1/2 opacity-20 group-hover:scale-150 transition-transform`} />
            <div className="relative z-10 flex flex-col h-full">
              <div className={`w-14 h-14 rounded-2xl ${card.bg} ${card.color} flex items-center justify-center mb-6 shadow-lg shadow-current/5`}>
                <card.icon size={28} className={card.pulse ? 'animate-pulse' : ''} />
              </div>
              <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">{card.label}</p>
              <h3 className="text-3xl font-bold text-slate-900 mb-2">{card.value}</h3>
              <p className="text-xs text-gray-400 font-bold">{card.subtext}</p>
              <div className={`h-1.5 w-12 rounded-full ${card.bg} mt-6`} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-16">
        {/* Recent Orders List */}
        <div className="lg:col-span-8 bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col">
           <div className="p-10 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
              <div>
                <h3 className="text-2xl font-playfair font-extrabold text-slate-950">Recent Orders</h3>
                <p className="text-gray-400 text-sm mt-1">Latest activity across your store.</p>
              </div>
              <Link to="/admin/orders" className="flex items-center gap-2 text-amber-600 font-bold text-xs uppercase tracking-widest hover:underline group">
                All Orders <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
           </div>
           <div className="flex-1 overflow-x-auto">
              <table className="w-full text-left">
                 <thead>
                    <tr className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">
                       <th className="px-10 py-6">Order Details</th>
                       <th className="px-10 py-6">Customer</th>
                       <th className="px-10 py-6">Amount</th>
                       <th className="px-10 py-6">Status</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-50">
                    {recentOrders.map((order) => (
                      <tr key={order._id} className="group hover:bg-gray-50 transition-colors">
                        <td className="px-10 py-6">
                           <span className="font-mono text-amber-600 text-[11px] block">#{truncateId(order._id)}</span>
                           <span className="text-[10px] text-gray-400 font-bold uppercase mt-1">{(order.products?.length || 0)} Items</span>
                        </td>
                        <td className="px-10 py-6 font-bold text-slate-900">{order.userId?.name || 'Guest User'}</td>
                        <td className="px-10 py-6 font-bold text-slate-900">{formatCurrency(order.totalAmount)}</td>
                        <td className="px-10 py-6">
                           <StatusBadge status={order.orderStatus} />
                        </td>
                      </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>

        {/* Top Products / Charts Placeholder */}
        <div className="lg:col-span-4 space-y-10">
           <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden h-full">
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="relative z-10">
                <div className="flex justify-between items-end mb-10">
                   <h3 className="text-2xl font-playfair font-extrabold italic">Best Sellers 🔥</h3>
                   <Activity size={24} className="text-amber-500" />
                </div>
                <div className="space-y-8">
                   {stats.topProducts?.slice(0, 5).map((p, i) => (
                      <div key={p._id} className="space-y-2">
                         <div className="flex justify-between text-xs font-bold">
                            <span className="text-gray-400">{p.title}</span>
                            <span className="text-amber-500">{p.totalOrdered} Sold</span>
                         </div>
                         <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-amber-500 rounded-full" 
                              style={{ width: `${(p.totalOrdered / (stats.topProducts[0]?.totalOrdered || 1)) * 100}%` }} 
                            />
                         </div>
                      </div>
                   ))}
                </div>
              </div>
           </div>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
         <Link to="/admin/products" className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-6 hover:border-amber-500 transition-all group">
            <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-all">
               <Plus size={24} />
            </div>
            <div>
               <p className="font-bold text-slate-900">New Product</p>
               <p className="text-xs text-gray-400 font-medium">Add to menu</p>
            </div>
         </Link>
         <Link to="/admin/orders?status=Pending" className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-6 hover:border-blue-500 transition-all group">
            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
               <Layers size={24} />
            </div>
            <div>
               <p className="font-bold text-slate-900">Pending</p>
               <p className="text-xs text-gray-400 font-medium">Check orders</p>
            </div>
         </Link>
         <Link to="/admin/customers" className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-6 hover:border-emerald-500 transition-all group">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all">
               <Users size={24} />
            </div>
            <div>
               <p className="font-bold text-slate-900">Customers</p>
               <p className="text-xs text-gray-400 font-medium">Manage users</p>
            </div>
         </Link>
         <Link to="/menu" target="_blank" className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-6 hover:border-purple-500 transition-all group">
            <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-all">
               <Activity size={24} />
            </div>
            <div>
               <p className="font-bold text-slate-900">View Store</p>
               <p className="text-xs text-gray-400 font-medium">Check customer UI</p>
            </div>
         </Link>
      </div>
    </AdminLayout>
  );
}
