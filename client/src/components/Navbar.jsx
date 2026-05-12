import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  ShoppingBag, 
  User, 
  Menu, 
  X, 
  Heart,
  ChevronDown,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar({ onCartOpen }) {
  const { user, isAuthenticated, logout } = useAuth();
  const { items, cartCount } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Menu', path: '/menu' },
    { name: 'Order Track', path: '/orders' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${
      scrolled 
        ? 'py-4 bg-white/80 backdrop-blur-xl shadow-lg shadow-slate-200/50 border-b border-slate-100' 
        : 'py-6 bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-12 h-12 bg-slate-900 rounded-[1.25rem] flex items-center justify-center text-white font-playfair text-2xl font-black shadow-xl shadow-slate-900/10 group-hover:scale-105 group-hover:rotate-3 transition-all duration-500">
            M
          </div>
          <span className={`text-2xl font-playfair font-black tracking-tight transition-colors duration-500 ${
            scrolled ? 'text-slate-900' : 'text-slate-900' // Keeping it dark for visibility on all backgrounds
          }`}>
            Melcho<span className="text-amber-500">.</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-10">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`relative text-sm font-bold uppercase tracking-widest transition-all duration-300 group ${
                location.pathname === link.path ? 'text-amber-600' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {link.name}
              <span className={`absolute -bottom-2 left-0 h-0.5 bg-amber-500 transition-all duration-500 ${
                location.pathname === link.path ? 'w-full' : 'w-0 group-hover:w-full'
              }`} />
            </Link>
          ))}
        </div>

        {/* Action Icons */}
        <div className="flex items-center gap-4 lg:gap-8">
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-100">
            <Sparkles size={12} className="animate-pulse" />
            Fresh Everyday
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <div className="relative group">
                <button className="p-3 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-2xl transition-all flex items-center gap-2">
                  <User size={20} />
                  <span className="hidden lg:inline text-xs font-bold uppercase tracking-wider">{user?.name?.split(' ')[0]}</span>
                  <ChevronDown size={14} className="group-hover:rotate-180 transition-transform duration-300" />
                </button>
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-3xl shadow-2xl border border-slate-50 p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                  <Link to="/orders" className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-2xl transition-all">
                    Order History
                  </Link>
                  {user?.role === 'admin' && (
                    <Link to="/admin/dashboard" className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-amber-600 hover:bg-amber-50 rounded-2xl transition-all">
                      Admin Dashboard
                    </Link>
                  )}
                  <button 
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                  >
                    Log Out
                  </button>
                </div>
              </div>
            ) : (
              <Link to="/login" className="p-3 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-2xl transition-all">
                <User size={20} />
              </Link>
            )}

            <button 
              onClick={onCartOpen}
              className="relative p-3 bg-slate-900 text-white rounded-2xl shadow-xl shadow-slate-900/20 hover:scale-105 active:scale-95 transition-all duration-300"
            >
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-amber-500 text-slate-950 text-[10px] font-black flex items-center justify-center rounded-full border-2 border-white shadow-lg">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-3 text-slate-900 hover:bg-slate-50 rounded-2xl transition-all"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-0 top-24 bg-white/95 backdrop-blur-xl z-[90] lg:hidden animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex flex-col items-center justify-center h-full space-y-10">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className="text-4xl font-playfair font-bold text-slate-900 hover:text-amber-600 transition-colors"
              >
                {link.name}
              </Link>
            ))}
            <div className="w-20 h-0.5 bg-slate-100" />
            {!isAuthenticated && (
              <Link to="/login" onClick={() => setIsOpen(false)} className="text-2xl font-bold text-slate-400">
                Login / Register
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
