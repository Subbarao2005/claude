import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/helpers';
import { useNavigate } from 'react-router-dom';
import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';

export default function CartSidebar({ isOpen, onClose }) {
  const { items, updateQuantity, removeFromCart, cartTotal } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleCheckout = () => {
    onClose(); // Close sidebar first
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/checkout' } } });
    } else {
      navigate('/checkout');
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className="fixed inset-y-0 right-0 w-full md:w-[400px] bg-white shadow-2xl z-50 flex flex-col transform transition-transform duration-300">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-amber-50">
          <h2 className="font-playfair font-bold text-2xl text-gray-900 flex items-center gap-2">
            <ShoppingBag className="text-amber-600" />
            Your Cart
          </h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-amber-100 text-gray-500 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
              <ShoppingBag size={64} className="text-gray-200" />
              <p className="text-lg">Your cart is empty</p>
              <button 
                onClick={() => { onClose(); navigate('/menu'); }}
                className="px-6 py-2 bg-amber-100 text-amber-800 rounded-full font-medium hover:bg-amber-200 transition-colors"
              >
                Browse Menu
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {items.map(({ product, quantity }) => (
                <div key={product._id} className="flex gap-4 p-4 border border-amber-100 rounded-2xl shadow-sm relative">
                  <div className="w-20 h-20 rounded-xl bg-amber-50 overflow-hidden flex-shrink-0">
                    {product.image ? (
                      <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-amber-300 font-playfair text-2xl">
                        {product.title.charAt(0)}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-gray-900 line-clamp-1 pr-6">{product.title}</h4>
                      <p className="text-amber-700 font-semibold">{formatCurrency(product.price)}</p>
                    </div>
                    
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center bg-gray-50 rounded-lg border border-gray-200">
                        <button 
                          onClick={() => updateQuantity(product._id, quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-amber-600 transition-colors"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-8 text-center text-sm font-bold text-gray-900">{quantity}</span>
                        <button 
                          onClick={() => updateQuantity(product._id, quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-amber-600 transition-colors"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <p className="font-bold text-gray-900">{formatCurrency(product.price * quantity)}</p>
                    </div>
                  </div>

                  <button 
                    onClick={() => removeFromCart(product._id)}
                    className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-6 border-t border-gray-100 bg-gray-50">
            <div className="flex justify-between items-center mb-6">
              <span className="text-gray-500 font-medium">Subtotal</span>
              <span className="font-playfair font-bold text-2xl text-gray-900">{formatCurrency(cartTotal)}</span>
            </div>
            
            <button 
              onClick={handleCheckout}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white py-4 rounded-xl font-bold text-lg transition-colors shadow-lg shadow-amber-200/50"
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </>
  );
}
