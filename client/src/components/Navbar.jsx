import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ShoppingBag, Menu, X, User, LogOut } from 'lucide-react';

export default function Navbar({ onCartOpen }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, logout, user } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <span className="text-3xl font-playfair font-bold text-amber-600 transition-colors group-hover:text-amber-700">
              Melcho
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-gray-600 hover:text-amber-600 font-medium transition-colors">Home</Link>
            <Link to="/menu" className="text-gray-600 hover:text-amber-600 font-medium transition-colors">Menu</Link>
            
            {isAuthenticated ? (
              <>
                <Link to="/orders" className="text-gray-600 hover:text-amber-600 font-medium transition-colors">My Orders</Link>
                {user?.role === 'admin' && (
                  <Link to="/admin/dashboard" className="text-amber-700 font-bold hover:text-amber-800 transition-colors">Admin</Link>
                )}
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-1 text-gray-600 hover:text-red-500 font-medium transition-colors"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <Link to="/login" className="text-gray-600 hover:text-amber-600 font-medium transition-colors">Login</Link>
                <Link to="/register" className="bg-amber-600 text-white px-5 py-2 rounded-full font-medium hover:bg-amber-700 transition-all shadow-md shadow-amber-100">
                  Register
                </Link>
              </div>
            )}

            {/* Cart Icon */}
            <button 
              onClick={onCartOpen}
              className="relative p-2 text-gray-700 hover:text-amber-600 transition-colors"
            >
              <ShoppingBag size={24} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-4">
            <button 
              onClick={onCartOpen}
              className="relative p-2 text-gray-700"
            >
              <ShoppingBag size={24} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-gray-700"
            >
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 py-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex flex-col px-4 gap-4">
            <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium text-gray-700 py-2">Home</Link>
            <Link to="/menu" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium text-gray-700 py-2">Menu</Link>
            
            {isAuthenticated ? (
              <>
                <Link to="/orders" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium text-gray-700 py-2">My Orders</Link>
                {user?.role === 'admin' && (
                  <Link to="/admin/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-bold text-amber-700 py-2">Admin Dashboard</Link>
                )}
                <button 
                  onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                  className="text-lg font-medium text-red-500 py-2 text-left flex items-center gap-2"
                >
                  <LogOut size={20} /> Logout
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-3 pt-2">
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="text-center py-3 border border-amber-600 text-amber-600 rounded-xl font-medium">Login</Link>
                <Link to="/register" onClick={() => setIsMobileMenuOpen(false)} className="text-center py-3 bg-amber-600 text-white rounded-xl font-medium shadow-md">Register</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
