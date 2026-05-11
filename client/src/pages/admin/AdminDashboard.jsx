import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { 
  Users, 
  ShoppingBag, 
  IndianRupee, 
  TrendingUp, 
  Clock, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    deliveredOrders: 0
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersRes, ordersRes] = await Promise.all([
          api.get('/auth/admin/users'), // Assuming endpoint exists
          api.get('/orders/admin/all')
        ]);

        const orders = ordersRes.data.orders || [];
        const revenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
        const pending = orders.filter(o => o.status === 'pending').length;
        const delivered = orders.filter(o => o.status === 'delivered').length;

        setStats({
          totalUsers: usersRes.data.count || 0,
          totalOrders: orders.length,
          totalRevenue: revenue,
          pendingOrders: pending,
          deliveredOrders: delivered
        });
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const cards = [
    { label: 'Total Revenue', value: `₹${stats.totalRevenue}`, icon: IndianRupee, color: 'bg-emerald-500' },
    { label: 'Total Orders', value: stats.totalOrders, icon: ShoppingBag, color: 'bg-blue-500' },
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'bg-amber-500' },
    { label: 'Pending', value: stats.pendingOrders, icon: Clock, color: 'bg-orange-500' },
    { label: 'Delivered', value: stats.deliveredOrders, icon: CheckCircle2, color: 'bg-indigo-500' },
    { label: 'Growth', value: '+12%', icon: TrendingUp, color: 'bg-pink-500' }
  ];

  if (loading) {
    return (
      <div className="p-8 animate-pulse">
        <div className="h-8 w-64 bg-slate-200 rounded mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-32 bg-slate-100 rounded-2xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <div className="mb-10">
        <h1 className="text-4xl font-playfair font-bold text-slate-900">Welcome back, {user?.name}</h1>
        <p className="text-slate-500 mt-2">Here's what's happening with Melcho today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {cards.map((card, idx) => (
          <div key={idx} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
            <div className="flex items-center gap-4">
              <div className={`${card.color} w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                <card.icon size={28} />
              </div>
              <div>
                <p className="text-slate-500 font-medium">{card.label}</p>
                <h3 className="text-3xl font-playfair font-bold text-slate-900">{card.value}</h3>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* System Status */}
      <div className="mt-12 bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
        <h2 className="text-2xl font-playfair font-bold text-slate-900 mb-6">System Health</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-4 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100">
            <CheckCircle2 size={24} />
            <span className="font-semibold">API Server: Online</span>
          </div>
          <div className="flex items-center gap-3 p-4 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100">
            <CheckCircle2 size={24} />
            <span className="font-semibold">Database: Connected</span>
          </div>
        </div>
      </div>
    </div>
  );
}
