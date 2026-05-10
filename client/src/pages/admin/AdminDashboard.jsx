import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { formatCurrency, getStatusColor, formatDate, truncateId } from '../../utils/helpers';
import { Package, TrendingUp, Clock, ShoppingBag } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
    totalProducts: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersRes, productsRes] = await Promise.all([
          api.get('/orders/admin/all'),
          api.get('/products/admin/all')
        ]);

        if (ordersRes.data.success && productsRes.data.success) {
          const orders = ordersRes.data.orders;
          const products = productsRes.data.products;

          const pending = orders.filter(o => o.orderStatus === 'Pending').length;
          const completed = orders.filter(o => o.orderStatus === 'Delivered').length;
          const revenue = orders
            .filter(o => o.paymentStatus === 'successful')
            .reduce((sum, o) => sum + o.totalAmount, 0);

          setStats({
            totalOrders: orders.length,
            pendingOrders: pending,
            completedOrders: completed,
            totalRevenue: revenue,
            totalProducts: products.length
          });

          setRecentOrders(orders.slice(0, 5));
        }
      } catch (err) {
        console.error('Error fetching admin data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-spin w-12 h-12 border-4 border-gray-300 border-t-gray-900 rounded-full"></div></div>;

  const MetricCard = ({ title, value, icon, bgClass, textClass }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-6">
      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${bgClass} ${textClass}`}>
        {icon}
      </div>
      <div>
        <p className="text-gray-500 font-medium text-sm mb-1">{title}</p>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
          <div>
            <h1 className="font-playfair text-4xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
            <p className="text-gray-500">Welcome back. Here's what's happening today.</p>
          </div>
          <div className="flex gap-4">
            <Link to="/admin/orders" className="px-6 py-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-full font-bold shadow-sm transition-colors">
              Manage Orders
            </Link>
            <Link to="/admin/products" className="px-6 py-2 bg-gray-900 text-white hover:bg-gray-800 rounded-full font-bold shadow-md transition-colors">
              Manage Products
            </Link>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <MetricCard 
            title="Total Revenue" 
            value={formatCurrency(stats.totalRevenue)} 
            icon={<TrendingUp size={28} />} 
            bgClass="bg-green-50" textClass="text-green-600" 
          />
          <MetricCard 
            title="Pending Orders" 
            value={stats.pendingOrders} 
            icon={<Clock size={28} />} 
            bgClass="bg-yellow-50" textClass="text-yellow-600" 
          />
          <MetricCard 
            title="Total Orders" 
            value={stats.totalOrders} 
            icon={<Package size={28} />} 
            bgClass="bg-blue-50" textClass="text-blue-600" 
          />
          <MetricCard 
            title="Total Products" 
            value={stats.totalProducts} 
            icon={<ShoppingBag size={28} />} 
            bgClass="bg-purple-50" textClass="text-purple-600" 
          />
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="font-playfair text-2xl font-bold text-gray-900">Recent Orders</h2>
            <Link to="/admin/orders" className="text-amber-600 hover:text-amber-700 font-bold text-sm">View All</Link>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Order ID</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentOrders.map(order => (
                  <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">{truncateId(order._id)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{order.userId?.name || 'Unknown'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">{formatCurrency(order.totalAmount)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.orderStatus)}`}>
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(order.createdAt)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link to={`/admin/orders/${order._id}`} className="text-amber-600 hover:text-amber-900 bg-amber-50 px-3 py-1 rounded-md">View</Link>
                    </td>
                  </tr>
                ))}
                {recentOrders.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">No recent orders found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
