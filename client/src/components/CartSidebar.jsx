import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight } from 'lucide-react';

export default function CartSidebar({ isOpen, onClose }) {
  const { items, updateQuantity, removeFromCart, cartTotal, cartCount } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = () => {
    onClose();
    if (isAuthenticated) {
      navigate('/checkout');
    } else {
      navigate('/login', { state: { from: '/checkout' } });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end overflow-hidden">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Sidebar Content */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-500">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShoppingBag className="text-amber-600" size={24} />
            <h2 className="text-2xl font-playfair font-bold text-gray-900">Your Cart</h2>
            <span className="bg-amber-100 text-amber-700 px-3 py-0.5 rounded-full text-sm font-bold">
              {cartCount}
            </span>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-900"
          >
            <X size={24} />
          </button>
        </div>

        {/* Items List */}
        <div className="flex-grow overflow-y-auto p-6 space-y-6">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
              <div className="w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center mb-6">
                <ShoppingBag size={40} className="text-amber-200" />
              </div>
              <p className="text-xl font-playfair font-bold text-gray-900 mb-2">Cart is empty</p>
              <p className="text-gray-500 mb-8">Add some sweetness to your day!</p>
              <button 
                onClick={onClose}
                className="text-amber-600 font-bold hover:underline"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item._id} className="flex gap-4 group">
                <div className="w-20 h-20 bg-amber-50 rounded-2xl overflow-hidden flex-shrink-0 border border-amber-100">
                  {item.product.image ? (
                    <img src={item.product.image} alt={item.product.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-amber-200 text-3xl font-playfair">
                      {item.product.title.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-bold text-gray-900 leading-tight pr-4">{item.product.title}</h4>
                    <button 
                      onClick={() => removeFromCart(item._id)}
                      className="text-gray-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <p className="text-amber-600 font-bold mb-3">₹{item.product.price}</p>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex items-center bg-gray-50 rounded-lg p-0.5 border border-gray-100">
                      <button 
                        onClick={() => updateQuantity(item._id, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center rounded-md bg-white text-gray-600 shadow-sm hover:bg-amber-600 hover:text-white transition-all"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-8 text-center font-bold text-gray-800">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item._id, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center rounded-md bg-white text-gray-600 shadow-sm hover:bg-amber-600 hover:text-white transition-all"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <span className="text-gray-400 text-sm font-medium">Total: ₹{item.product.price * item.quantity}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-6 border-t border-gray-100 space-y-4">
            <div className="flex justify-between items-center text-xl font-playfair font-bold">
              <span className="text-gray-500">Subtotal</span>
              <span className="text-gray-900">₹{cartTotal}</span>
            </div>
            <p className="text-gray-400 text-xs text-center">Shipping and taxes calculated at checkout.</p>
            
            <div className="grid grid-cols-1 gap-3">
              <button 
                onClick={handleCheckout}
                className="w-full bg-amber-600 text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-amber-700 transition-all shadow-xl shadow-amber-200 group"
              >
                Checkout Now
                <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
              </button>
              <button 
                onClick={onClose}
                className="w-full py-4 text-gray-500 font-bold hover:text-gray-900 transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
