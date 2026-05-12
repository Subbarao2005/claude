import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  Users, 
  LogOut, 
  ChevronRight 
} from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function AdminLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const fetchPending = async () => {
      try {
        const res = await api.get('/orders/admin/all?status=Pending');
        setPendingCount(res.data.count || 0);
      } catch (err) {
        console.error('Failed to fetch pending count');
      }
    };
    fetchPending();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Orders', path: '/admin/orders', icon: ShoppingBag, badge: pendingCount },
    { name: 'Products', path: '/admin/products', icon: Package },
    { name: 'Customers', path: '/admin/customers', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-72 bg-slate-900 text-white fixed h-full flex flex-col shadow-2xl z-[50]">
        <div className="p-8 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-slate-900 font-playfair text-2xl font-bold">M</div>
            <div>
              <h1 className="text-xl font-playfair font-bold text-amber-500">Melcho Admin</h1>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Management Portal</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex items-center justify-between px-5 py-4 rounded-2xl transition-all duration-300 group
                ${isActive ? 'bg-amber-500 text-slate-900 shadow-lg shadow-amber-500/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
              `}
            >
              <div className="flex items-center gap-4">
                <item.icon size={22} className="transition-transform group-hover:scale-110" />
                <span className="font-bold tracking-wide">{item.name}</span>
              </div>
              {item.badge > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded-full animate-pulse">
                  {item.badge}
                </span >
              )}
              {item.badge === undefined && <ChevronRight size={16} className="opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0" />}
            </NavLink>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-4 px-2 mb-4">
            <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center font-bold text-amber-500 uppercase">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs text-slate-500 font-bold uppercase truncate">Administrator</p>
              <p className="text-sm font-bold text-white truncate">{user?.name || 'Admin User'}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 text-red-500 font-bold rounded-xl hover:bg-red-500 hover:text-white transition-all group"
          >
            <LogOut size={18} className="transition-transform group-hover:rotate-12" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-72 flex-1 min-h-screen relative">
        <div className="p-10">
          {children}
        </div>
      </main>
    </div>
  );
}
