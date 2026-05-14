import { useState, useEffect } from 'react';
import api from '../../api/axios';
import AdminLayout from '../../components/admin/AdminLayout';
import StatusBadge from '../../components/admin/StatusBadge';
import { 
  Users, 
  Search, 
  Mail, 
  Phone, 
  Calendar, 
  ShoppingBag, 
  TrendingUp, 
  ChevronRight,
  Loader2,
  X,
  CreditCard,
  UserCheck,
  ArrowRight
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/auth/admin/customers');
      if (res.data.success) {
        setCustomers(res.data.customers);
      }
    } catch (err) {
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerOrders = async (userId) => {
    try {
      setOrdersLoading(true);
      const res = await api.get(`/orders/admin/customer/${userId}`);
      if (res.data.success) {
        setCustomerOrders(res.data.orders);
      }
    } catch (err) {
      toast.error('Failed to fetch order history');
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleViewOrders = (customer) => {
    setSelectedCustomer(customer);
    fetchCustomerOrders(customer._id);
  };

  const filteredCustomers = customers.filter(c => {
    const safeSearch = String(search || '').toLowerCase().trim();
    if (!safeSearch) return true;
    
    const nameStr = String(c.name || '').toLowerCase();
    const emailStr = String(c.email || '').toLowerCase();
    
    return nameStr.includes(safeSearch) || emailStr.includes(safeSearch);
  });

  const stats = {
    total: customers.length,
    active: customers.filter(c => c.orderCount > 0).length,
    highValue: customers.filter(c => c.totalSpent > 1000).length
  };

  if (loading) return (
    <AdminLayout>
       <div className="space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             {[1,2,3].map(i => <div key={i} className="h-32 bg-white rounded-3xl animate-pulse" />)}
          </div>
          <div className="h-[600px] bg-white rounded-[3rem] animate-pulse shadow-sm" />
       </div>
    </AdminLayout>
  );

  return (
    <AdminLayout>
      <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
           <h1 className="text-4xl font-playfair font-extrabold text-slate-950">Customer Base</h1>
           <p className="text-gray-400 font-medium">Relationships and transaction history for all users.</p>
        </div>
        <div className="flex gap-4">
           <div className="bg-white border border-gray-200 px-6 py-3 rounded-2xl shadow-sm text-sm font-bold text-gray-500 flex items-center gap-3">
              <Users size={18} /> {customers.length} Members
           </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-12">
         {[
           { label: 'Total Members', value: stats.total, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
           { label: 'Active Foodies', value: stats.active, icon: UserCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
           { label: 'Loyal High-Value', value: stats.highValue, icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50' }
         ].map((stat, i) => (
           <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center gap-6 group hover:shadow-xl transition-all">
              <div className={`w-14 h-14 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center shadow-lg shadow-current/5`}>
                 <stat.icon size={28} />
              </div>
              <div>
                 <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{stat.label}</p>
                 <p className="text-3xl font-bold text-slate-950">{stat.value}</p>
              </div>
           </div>
         ))}
      </div>

      {/* Search Bar */}
      <div className="mb-8 relative group max-w-xl">
         <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-amber-600 transition-colors" size={20} />
         <input 
           type="text"
           placeholder="Search by name or email..."
           value={search}
           onChange={(e) => setSearch(e.target.value)}
           className="w-full pl-16 pr-8 py-5 bg-white border border-gray-100 rounded-[2rem] outline-none focus:ring-4 focus:ring-amber-500/5 shadow-sm transition-all font-bold text-slate-950"
         />
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-[3.5rem] border border-gray-100 shadow-sm overflow-hidden">
         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                  <tr className="bg-gray-50/50 text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">
                     <th className="px-10 py-8">Customer Profile</th>
                     <th className="px-10 py-8">Contact</th>
                     <th className="px-10 py-8">Activity</th>
                     <th className="px-10 py-8">Total Spent</th>
                     <th className="px-10 py-8">Joined On</th>
                     <th className="px-10 py-8 text-right">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-50">
                  {filteredCustomers.length > 0 ? filteredCustomers.map((customer) => (
                    <tr key={customer._id} className="group hover:bg-gray-50 transition-colors">
                       <td className="px-10 py-8">
                          <div className="flex items-center gap-4">
                             <div className="w-14 h-14 bg-amber-500 text-slate-950 rounded-full flex items-center justify-center font-black text-xl shadow-lg shadow-amber-500/10">
                                {customer.name[0].toUpperCase()}
                             </div>
                             <div>
                                <p className="font-black text-slate-900 group-hover:text-amber-600 transition-colors">{customer.name}</p>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">ID: #{truncateId(customer._id)}</p>
                             </div>
                          </div>
                       </td>
                       <td className="px-10 py-8">
                          <div className="space-y-1">
                             <p className="text-sm font-bold text-slate-600 flex items-center gap-2">
                                <Mail size={14} className="text-gray-300" /> {customer.email}
                             </p>
                             <p className="text-sm font-bold text-slate-600 flex items-center gap-2">
                                <Phone size={14} className="text-gray-300" /> {customer.phone || 'No phone'}
                             </p>
                          </div>
                       </td>
                       <td className="px-10 py-8">
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-xl w-fit text-gray-500 font-black text-[10px] uppercase tracking-widest">
                             <ShoppingBag size={12} /> {customer.orderCount || 0} Orders
                          </div>
                       </td>
                       <td className="px-10 py-8">
                          <p className={`text-xl font-black ${customer.totalSpent > 0 ? 'text-emerald-600' : 'text-gray-300'}`}>
                             {formatCurrency(customer.totalSpent || 0)}
                          </p>
                       </td>
                       <td className="px-10 py-8">
                          <div className="text-gray-400 font-bold text-xs flex items-center gap-2">
                             <Calendar size={14} /> {formatDate(customer.createdAt)}
                          </div>
                       </td>
                       <td className="px-10 py-8 text-right">
                          <button 
                            onClick={() => handleViewOrders(customer)}
                            className="px-6 py-3 bg-gray-50 text-gray-400 font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-slate-900 hover:text-white transition-all group/btn flex items-center gap-2 ml-auto"
                          >
                             View History <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                          </button>
                       </td>
                    </tr>
                  )) : (
                    <tr>
                       <td colSpan={6} className="py-24 text-center">
                          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                             <Users size={40} />
                          </div>
                          <p className="text-gray-400 font-bold text-sm">No customers found.</p>
                       </td>
                    </tr>
                  )}
               </tbody>
            </table>
         </div>
      </div>

      {/* History Modal */}
      {selectedCustomer && (
         <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 sm:p-12">
            <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={() => setSelectedCustomer(null)} />
            <div className="relative w-full max-w-4xl bg-white rounded-[3.5rem] shadow-2xl overflow-hidden flex flex-col max-h-full animate-in zoom-in fade-in duration-300">
               <div className="p-10 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                  <div className="flex items-center gap-6">
                     <div className="w-16 h-16 bg-amber-500 text-slate-950 rounded-full flex items-center justify-center font-black text-2xl">
                        {selectedCustomer.name[0].toUpperCase()}
                     </div>
                     <div>
                        <h3 className="text-3xl font-playfair font-extrabold text-slate-950">{selectedCustomer.name}</h3>
                        <p className="text-stone-400 font-bold text-xs uppercase tracking-widest mt-1">Order History Log</p>
                     </div>
                  </div>
                  <button onClick={() => setSelectedCustomer(null)} className="p-4 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-red-500 transition-all">
                     <X size={24} />
                  </button>
               </div>
               
               <div className="flex-1 overflow-y-auto p-10 no-scrollbar">
                  {ordersLoading ? (
                    <div className="py-20 text-center space-y-4">
                       <Loader2 className="animate-spin text-amber-600 mx-auto" size={48} />
                       <p className="text-gray-400 font-black text-[10px] uppercase tracking-widest">Compiling history...</p>
                    </div>
                  ) : customerOrders.length === 0 ? (
                    <div className="py-20 text-center opacity-30">
                       <ShoppingBag size={64} className="mx-auto mb-6" />
                       <p className="text-xl font-playfair font-bold">No orders recorded yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                       {customerOrders.map(order => (
                          <div key={order._id} className="bg-gray-50 rounded-[2.5rem] p-8 border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6 group hover:border-amber-500 transition-all">
                             <div className="flex items-center gap-6">
                                <div className="p-4 bg-white rounded-2xl text-amber-600 shadow-sm">
                                   <CreditCard size={24} />
                                </div>
                                <div>
                                   <p className="font-mono text-xs text-amber-600 font-bold">#{truncateId(order._id)}</p>
                                   <p className="font-bold text-slate-900 mt-1">{formatDate(order.createdAt)}</p>
                                </div>
                             </div>
                             <div className="flex flex-col md:flex-row items-center gap-10">
                                <div className="text-center md:text-left">
                                   <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">Status</p>
                                   <StatusBadge status={order.orderStatus} />
                                </div>
                                <div className="text-center md:text-right">
                                   <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">Paid Amount</p>
                                   <p className="text-xl font-black text-slate-950">{formatCurrency(order.totalAmount)}</p>
                                </div>
                                <Link to={`/admin/orders/${order._id}`} className="p-3 bg-white border border-gray-100 rounded-xl text-gray-300 hover:text-amber-500 transition-all">
                                   <ArrowRight size={20} />
                                </Link>
                             </div>
                          </div>
                       ))}
                    </div>
                  )}
               </div>
            </div>
         </div>
      )}
    </AdminLayout>
  );
}
