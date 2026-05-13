import { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  Users, 
  LogOut, 
  Bell, 
  Search,
  Menu,
  X,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

export default function AdminLayout({ children }) {
  const { user, logout } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPendingCount = async () => {
      try {
        const res = await api.get('/orders/admin/stats');
        if (res.data.success) {
          setPendingCount(res.data.stats.pendingOrders || 0);
        }
      } catch (err) {
        console.error('Failed to fetch pending count');
      }
    };
    fetchPendingCount();
    const interval = setInterval(fetchPendingCount, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const navLinks = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Orders', path: '/admin/orders', icon: ShoppingBag, badge: pendingCount },
    { name: 'Products', path: '/admin/products', icon: Package },
    { name: 'Customers', path: '/admin/customers', icon: Users },
  ];

  const pageTitle = navLinks.find(link => location.pathname.startsWith(link.path))?.name || 'Overview';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-72 bg-gray-900 h-screen sticky top-0 overflow-y-auto no-scrollbar shadow-2xl">
        {/* Brand */}
        <div className="p-8 mb-4">
          <Link to="/" className="flex items-center gap-3">
             <div className="w-10 h-10 bg-amber-500 rounded-2xl flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20">
                <span className="text-xl">🍮</span>
             </div>
             <div>
                <h2 className="text-white font-playfair font-extrabold text-2xl tracking-tight">Melcho</h2>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Admin Panel</p>
             </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-2">
           <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-6 px-4">Main Navigation</p>
           {navLinks.map((link) => (
             <NavLink
               key={link.path}
               to={link.path}
               className={({ isActive }) => `
                 flex items-center justify-between px-5 py-4 rounded-[1.25rem] transition-all duration-300 group
                 ${isActive 
                   ? 'bg-amber-600 text-white shadow-xl shadow-amber-600/20 translate-x-2' 
                   : 'text-gray-400 hover:bg-gray-800 hover:text-white'}
               `}
             >
               <div className="flex items-center gap-4">
                 <link.icon size={20} className={({ isActive }) => isActive ? 'text-white' : 'text-gray-500 group-hover:text-amber-400'} />
                 <span className="text-sm font-bold tracking-wide">{link.name}</span>
               </div>
               {link.badge > 0 && (
                 <span className="px-2 py-0.5 bg-amber-500 text-slate-950 text-[10px] font-black rounded-full">
                    {link.badge}
                 </span>
               )}
             </NavLink>
           ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-6 mt-auto">
           <div className="bg-gray-800/50 rounded-[2rem] p-5 mb-6 border border-gray-800/80 flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-500 text-slate-950 rounded-full flex items-center justify-center font-black text-xl shadow-lg">
                 {user?.name?.[0].toUpperCase() || 'A'}
              </div>
              <div className="min-w-0">
                 <p className="text-white font-bold text-sm truncate">{user?.name || 'Admin User'}</p>
                 <p className="text-gray-500 text-[10px] truncate">{user?.email}</p>
              </div>
           </div>
           
           <button 
             onClick={logout}
             className="w-full flex items-center gap-4 px-6 py-4 text-gray-400 hover:text-red-400 hover:bg-red-400/5 rounded-2xl transition-all duration-300 group font-bold text-sm"
           >
             <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" /> Sign Out
           </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-[100] bg-gray-900 border-t border-gray-800 flex justify-around items-center h-20 px-4">
        {navLinks.map((link) => {
          const isActive = location.pathname.startsWith(link.path);
          return (
            <Link 
              key={link.path}
              to={link.path}
              className={`relative flex flex-col items-center justify-center w-16 h-16 transition-all ${isActive ? 'text-amber-500' : 'text-gray-500'}`}
            >
               <link.icon size={24} />
               <span className="text-[9px] font-black uppercase tracking-widest mt-1">{link.name}</span>
               {link.badge > 0 && (
                 <span className="absolute top-2 right-2 px-1.5 py-0.5 bg-amber-500 text-slate-950 text-[8px] font-black rounded-full border-2 border-gray-900">
                    {link.badge}
                 </span>
               )}
               {isActive && <div className="absolute -top-1 w-8 h-1 bg-amber-500 rounded-full" />}
            </Link>
          );
        })}
      </nav>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-24 bg-white/70 backdrop-blur-md border-b border-gray-200 flex items-center justify-between px-8 lg:px-12 sticky top-0 z-50">
           <div className="flex items-center gap-6">
              <button 
                onClick={() => setIsMobileOpen(true)}
                className="lg:hidden p-3 bg-gray-100 rounded-xl text-gray-600"
              >
                <Menu size={24} />
              </button>
              <div className="space-y-1">
                 <h2 className="text-3xl font-playfair font-extrabold text-slate-950">{pageTitle}</h2>
                 <div className="flex items-center gap-2 text-gray-400 text-[10px] font-black uppercase tracking-widest">
                    <Sparkles size={12} className="text-amber-500" /> Melcho Operations Hub
                 </div>
              </div>
           </div>

           <div className="flex items-center gap-4 lg:gap-8">
              <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-gray-100 border border-gray-200 rounded-2xl text-gray-400 group focus-within:ring-2 focus-within:ring-amber-500/20 transition-all">
                 <Search size={18} className="group-focus-within:text-amber-600 transition-colors" />
                 <input type="text" placeholder="Global search..." className="bg-transparent border-none outline-none text-sm font-medium text-slate-900 w-48" />
              </div>

              <div className="relative cursor-pointer group">
                 <div className="p-3 bg-white border border-gray-100 rounded-2xl text-gray-400 group-hover:text-amber-600 transition-all shadow-sm">
                    <Bell size={22} />
                 </div>
                 {pendingCount > 0 && (
                   <span className="absolute top-0 right-0 w-3 h-3 bg-amber-500 border-2 border-white rounded-full animate-pulse" />
                 )}
              </div>

              <div className="hidden sm:flex items-center gap-3 p-1.5 bg-gray-100 rounded-full border border-gray-200">
                 <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center text-slate-950 font-black">
                    {user?.name?.[0].toUpperCase() || 'A'}
                 </div>
                 <div className="pr-4">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none mb-1">Administrator</p>
                    <p className="text-xs font-bold text-slate-900 leading-none">{user?.name?.split(' ')[0]}</p>
                 </div>
              </div>
           </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-8 lg:p-12 pb-32 lg:pb-12 bg-gray-50 no-scrollbar">
          <div className="max-w-7xl mx-auto animate-fadeIn">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
