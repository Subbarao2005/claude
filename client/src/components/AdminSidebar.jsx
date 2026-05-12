import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  Users, 
  Settings, 
  LogOut,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const menuItems = [
  { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/admin/orders', icon: ShoppingBag, label: 'Orders' },
  { path: '/admin/products', icon: Package, label: 'Products' },
  { path: '/admin/customers', icon: Users, label: 'Customers' },
];

export default function AdminSidebar() {
  const location = useLocation();
  const { logout } = useAuth();

  return (
    <aside className="w-72 h-screen bg-slate-950 text-slate-400 flex flex-col sticky top-0 border-r border-slate-900">
      {/* Brand */}
      <div className="p-8 border-b border-slate-900/50">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-amber-500 rounded-2xl flex items-center justify-center text-slate-950 font-playfair text-xl font-black shadow-lg shadow-amber-500/20">
            M
          </div>
          <div>
            <h2 className="text-white font-playfair font-bold text-lg leading-tight">Melcho</h2>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500/70">Management</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-6 space-y-2">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 mb-4 px-4">Main Menu</p>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center justify-between group px-4 py-3.5 rounded-2xl transition-all duration-300 ${
                isActive 
                ? 'bg-amber-500 text-slate-950 font-bold shadow-xl shadow-amber-500/10' 
                : 'hover:bg-slate-900 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon size={20} className={isActive ? 'text-slate-950' : 'text-slate-500 group-hover:text-amber-500 transition-colors'} />
                <span className="text-sm tracking-wide">{item.label}</span>
              </div>
              {isActive && <ChevronRight size={16} className="text-slate-950" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-6 border-t border-slate-900/50">
        <div className="bg-slate-900/40 rounded-3xl p-5 mb-6 border border-slate-800/50">
          <div className="flex items-center gap-2 text-amber-500 mb-2">
            <Sparkles size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">Support</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">Need help managing your store? Contact technical support.</p>
        </div>

        <button 
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3.5 text-slate-400 hover:text-red-400 hover:bg-red-400/5 rounded-2xl transition-all duration-300 group"
        >
          <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-bold">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
