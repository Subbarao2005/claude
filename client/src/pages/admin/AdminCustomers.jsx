import { useState, useEffect } from 'react';
import api from '../../api/axios';
import AdminLayout from '../../components/AdminLayout';
import { 
  Loader2, 
  Search, 
  User, 
  ShoppingBag, 
  TrendingUp, 
  Calendar,
  X,
  History,
  Mail,
  Phone,
  ArrowRight
} from 'lucide-react';
import { formatCurrency, formatDate, truncateId } from '../../utils/helpers';
import StatusBadge from '../../components/admin/StatusBadge';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Detail Modal
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    const term = searchTerm.toLowerCase();
    setFilteredCustomers(
      customers.filter(c => 
        c.name?.toLowerCase().includes(term) || 
        c.email?.toLowerCase().includes(term) ||
        c.phone?.includes(term)
      )
    );
  }, [searchTerm, customers]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/auth/admin/users');
      if (res.data.success) {
        setCustomers(res.data.users || []);
      }
    } catch (err) {
      console.error('Fetch customers error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerHistory = async (userId) => {
    try {
      setOrdersLoading(true);
      const res = await api.get(`/auth/admin/users/${userId}/orders`);
      if (res.data.success) {
        setCustomerOrders(res.data.orders || []);
      }
    } catch (err) {
      console.error('Fetch customer orders error:', err);
    } finally {
      setOrdersLoading(false);
    }
  };

  const openCustomerDetail = (customer) => {
    setSelectedCustomer(customer);
    fetchCustomerHistory(customer._id);
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
          <h1 className="text-4xl font-playfair font-bold text-slate-900">Customer Base</h1>
          <p className="text-slate-500 mt-2">View and analyze your most loyal customers.</p>
        </div>
        <div className="relative w-full lg:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search customers..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                <th className="px-8 py-6">Customer</th>
                <th className="px-8 py-6">Email</th>
                <th className="px-8 py-6">Orders</th>
                <th className="px-8 py-6">Total Spent</th>
                <th className="px-8 py-6">Joined</th>
                <th className="px-8 py-6 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredCustomers.map((customer) => (
                <tr key={customer._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center text-amber-600 font-bold uppercase">
                        {customer.name?.charAt(0)}
                      </div>
                      <span className="font-bold text-slate-900">{customer.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-sm text-slate-500 font-medium">{customer.email}</td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full w-fit">
                      <ShoppingBag size={12} /> {customer.orderCount || 0}
                    </div>
                  </td>
                  <td className="px-8 py-6 font-bold text-slate-900">{formatCurrency(customer.totalSpent || 0)}</td>
                  <td className="px-8 py-6 text-xs text-slate-400 font-bold uppercase">{formatDate(customer.createdAt).split(',')[0]}</td>
                  <td className="px-8 py-6">
                    <div className="flex justify-center">
                      <button 
                        onClick={() => openCustomerDetail(customer)}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-100"
                      >
                        Insights <ArrowRight size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Detail Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[3rem] w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-in zoom-in duration-300">
            {/* Modal Header */}
            <div className="p-8 border-b border-slate-50 flex justify-between items-start">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-amber-50 rounded-3xl flex items-center justify-center text-amber-600 text-3xl font-playfair font-bold uppercase">
                  {selectedCustomer.name?.charAt(0)}
                </div>
                <div>
                  <h2 className="text-3xl font-playfair font-bold text-slate-900">{selectedCustomer.name}</h2>
                  <div className="flex gap-4 mt-2">
                    <span className="flex items-center gap-2 text-xs font-bold text-slate-400"><Mail size={14} /> {selectedCustomer.email}</span>
                    <span className="flex items-center gap-2 text-xs font-bold text-slate-400"><Calendar size={14} /> Joined {formatDate(selectedCustomer.createdAt)}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setSelectedCustomer(null)} className="p-3 hover:bg-slate-50 rounded-2xl text-slate-400 transition-colors">
                <X size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-8">
              {/* Customer Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="p-6 bg-indigo-50 rounded-3xl border border-indigo-100">
                  <div className="flex items-center gap-3 text-indigo-600 mb-2">
                    <ShoppingBag size={20} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Total Orders</span>
                  </div>
                  <h4 className="text-2xl font-bold text-slate-900">{selectedCustomer.orderCount || 0}</h4>
                </div>
                <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100">
                  <div className="flex items-center gap-3 text-emerald-600 mb-2">
                    <TrendingUp size={20} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Total Value</span>
                  </div>
                  <h4 className="text-2xl font-bold text-slate-900">{formatCurrency(selectedCustomer.totalSpent || 0)}</h4>
                </div>
                <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100">
                  <div className="flex items-center gap-3 text-amber-600 mb-2">
                    <History size={20} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Loyalty Tier</span>
                  </div>
                  <h4 className="text-2xl font-bold text-slate-900">{selectedCustomer.orderCount > 10 ? 'VIP' : 'Regular'}</h4>
                </div>
              </div>

              {/* Order History */}
              <div className="bg-slate-50 rounded-3xl p-6 overflow-hidden">
                <h3 className="text-xl font-playfair font-bold text-slate-900 mb-6 flex items-center gap-3">
                  <History className="text-amber-600" size={20} /> Order History
                </h3>
                {ordersLoading ? (
                  <div className="flex justify-center py-10"><Loader2 className="animate-spin text-amber-600" /></div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="text-[10px] font-black uppercase text-slate-300 border-b border-slate-200">
                          <th className="pb-4">Order ID</th>
                          <th className="pb-4">Items</th>
                          <th className="pb-4">Total</th>
                          <th className="pb-4">Status</th>
                          <th className="pb-4">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {customerOrders.map(order => (
                          <tr key={order._id} className="text-sm">
                            <td className="py-4 font-mono text-xs text-slate-400">{truncateId(order._id)}</td>
                            <td className="py-4">
                              <span className="font-medium text-slate-600 truncate max-w-[200px] block">
                                {order.products?.map(p => `${p.title} x${p.quantity}`).join(', ')}
                              </span>
                            </td>
                            <td className="py-4 font-bold text-slate-900">{formatCurrency(order.totalAmount)}</td>
                            <td className="py-4"><StatusBadge status={order.orderStatus} /></td>
                            <td className="py-4 text-xs text-slate-400">{formatDate(order.createdAt).split(',')[0]}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
