import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  LogOut, 
  X,
  ChevronRight
} from 'lucide-react';

export default function AdminSidebar({ isOpen, onClose }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const menuItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Orders', path: '/admin/orders', icon: ShoppingBag },
    { label: 'Products', path: '/admin/products', icon: Package },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 bottom-0 w-72 bg-slate-900 text-white z-[120] transition-transform duration-300
        lg:translate-x-0 lg:static lg:block
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-8 flex items-center justify-between">
            <Link to="/" className="text-3xl font-playfair font-bold text-amber-500">
              Melcho <span className="text-xs text-slate-400 block tracking-[0.2em] font-sans uppercase mt-1">Admin Panel</span>
            </Link>
            <button onClick={onClose} className="lg:hidden p-2 text-slate-400 hover:text-white">
              <X size={24} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-grow px-4 space-y-2 mt-4">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => onClose()}
                  className={`
                    flex items-center justify-between p-4 rounded-2xl transition-all group
                    ${isActive 
                      ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/20' 
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <item.icon size={22} className={isActive ? 'text-white' : 'text-slate-500 group-hover:text-amber-500'} />
                    <span className="font-bold">{item.label}</span>
                  </div>
                  {isActive && <ChevronRight size={18} />}
                </Link>
              );
            })}
          </nav>

          {/* Footer / Logout */}
          <div className="p-6 border-t border-slate-800">
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 p-4 text-red-400 hover:bg-red-500/10 rounded-2xl transition-all font-bold"
            >
              <LogOut size={22} />
              Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
