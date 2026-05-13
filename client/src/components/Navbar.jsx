import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Menu, X, User } from 'lucide-react';
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
    { name: 'About', path: '/about' },
  ];

  const activeLink = (path) => location.pathname === path ? 'text-primary' : 'text-stone-600 hover:text-primary';

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 h-16 transition-all duration-300 ${
      scrolled ? 'bg-white shadow-md border-b border-stone-100' : 'bg-white border-b border-stone-50'
    }`}>
      <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Left: Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <span className="text-2xl font-playfair font-extrabold text-stone-900 group-hover:text-primary transition-colors">
            Melcho <span className="inline-block animate-bounce">🍮</span>
          </span>
        </Link>

        {/* Center: Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link 
              key={link.path} 
              to={link.path} 
              className={`font-semibold text-sm transition-colors ${activeLink(link.path)}`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-4">
          {/* Cart Icon */}
          <button 
            onClick={onCartOpen}
            className="relative p-2 text-stone-600 hover:text-primary transition-colors"
          >
            <ShoppingBag size={24} />
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 -mt-1 -mr-1 px-2 py-0.5 bg-primary text-white text-[10px] font-bold rounded-full shadow-lg animate-fadeIn">
                {cartCount}
              </span>
            )}
          </button>

          {/* User Actions */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <Link to="/orders" className="text-sm font-semibold text-stone-600 hover:text-primary transition-colors">My Orders</Link>
                <div className="w-10 h-10 bg-primary-light text-primary flex items-center justify-center rounded-full font-bold border border-primary/10">
                  {user?.name?.[0].toUpperCase()}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="px-4 py-2 text-sm font-semibold text-stone-600 hover:text-primary transition-colors">Login</Link>
                <Link to="/menu" className="px-6 py-2 bg-primary text-white text-sm font-bold rounded-full shadow-lg hover:bg-primary-dark transition-all active:scale-95">
                  Order Now
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-stone-600 hover:text-primary transition-colors"
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`fixed inset-0 top-16 bg-white z-40 md:hidden transition-all duration-500 transform ${
        isOpen ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'
      }`}>
        <div className="p-6 flex flex-col gap-6">
          {navLinks.map((link) => (
            <Link 
              key={link.path} 
              to={link.path} 
              onClick={() => setIsOpen(false)}
              className={`text-xl font-playfair font-bold border-b border-stone-50 pb-4 ${activeLink(link.path)}`}
            >
              {link.name}
            </Link>
          ))}
          {!isAuthenticated && (
            <div className="flex flex-col gap-4 pt-4">
              <Link 
                to="/login" 
                onClick={() => setIsOpen(false)}
                className="w-full py-4 text-center font-bold text-stone-600 border border-stone-100 rounded-2xl"
              >
                Login
              </Link>
              <Link 
                to="/menu" 
                onClick={() => setIsOpen(false)}
                className="w-full py-4 text-center font-bold text-white bg-primary rounded-2xl shadow-lg"
              >
                Order Now
              </Link>
            </div>
          )}
          {isAuthenticated && (
             <Link 
                to="/orders" 
                onClick={() => setIsOpen(false)}
                className="w-full py-4 text-center font-bold text-primary bg-primary-light rounded-2xl"
              >
                My Orders
              </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
