import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ShoppingCart, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navbar({ toggleCart }) {
  const { isAuthenticated, logout } = useAuth();
  const { cartCount } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-amber-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Left: Logo */}
          <Link to="/" className="font-playfair font-bold text-2xl text-amber-600 tracking-wider">
            Melcho
          </Link>

          {/* Center: Desktop Nav Links */}
          <div className="hidden md:flex space-x-8">
            <Link to="/" className="text-gray-600 hover:text-amber-600 font-medium transition-colors">Home</Link>
            <Link to="/menu" className="text-gray-600 hover:text-amber-600 font-medium transition-colors">Menu</Link>
          </div>

          {/* Right: Actions */}
          <div className="hidden md:flex items-center space-x-6">
            {isAuthenticated ? (
              <>
                <Link to="/orders" className="text-gray-600 hover:text-amber-600 font-medium transition-colors">My Orders</Link>
                <button onClick={toggleCart} className="relative text-gray-600 hover:text-amber-600 transition-colors">
                  <ShoppingCart size={24} />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-amber-600 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                      {cartCount}
                    </span>
                  )}
                </button>
                <button onClick={logout} className="text-gray-600 hover:text-amber-600 font-medium transition-colors">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-600 hover:text-amber-600 font-medium transition-colors">Login</Link>
                <Link to="/register" className="bg-amber-600 hover:bg-amber-700 text-white px-5 py-2 rounded-full font-medium transition-colors shadow-md shadow-amber-200">
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-4">
            {isAuthenticated && (
              <button onClick={toggleCart} className="relative text-gray-600">
                <ShoppingCart size={24} />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-amber-600 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                    {cartCount}
                  </span>
                )}
              </button>
            )}
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-600">
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-amber-100 py-4 px-4 space-y-4 shadow-lg">
          <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="block text-gray-600 font-medium hover:text-amber-600">Home</Link>
          <Link to="/menu" onClick={() => setIsMobileMenuOpen(false)} className="block text-gray-600 font-medium hover:text-amber-600">Menu</Link>
          {isAuthenticated ? (
            <>
              <Link to="/orders" onClick={() => setIsMobileMenuOpen(false)} className="block text-gray-600 font-medium hover:text-amber-600">My Orders</Link>
              <button onClick={() => { logout(); setIsMobileMenuOpen(false); }} className="block w-full text-left text-gray-600 font-medium hover:text-amber-600">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="block text-gray-600 font-medium hover:text-amber-600">Login</Link>
              <Link to="/register" onClick={() => setIsMobileMenuOpen(false)} className="block text-amber-600 font-medium">Register</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
