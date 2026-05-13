import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight } from 'lucide-react';
import { formatCurrency } from '../utils/helpers';
import { motion, AnimatePresence } from 'framer-motion';

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

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end overflow-hidden">
          {/* Overlay */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Sidebar Content */}
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="p-8 border-b border-stone-50 flex items-center justify-between bg-white sticky top-0 z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
                  <ShoppingBag size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-playfair font-extrabold text-stone-900">Your Cart</h2>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 mt-1">
                    {cartCount} Items Selected
                  </p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-3 bg-stone-50 hover:bg-stone-100 rounded-2xl transition-all text-stone-400 hover:text-stone-900"
              >
                <X size={20} />
              </button>
            </div>

            {/* Items List */}
            <div className="flex-grow overflow-y-auto p-8 space-y-8 no-scrollbar">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-20">
                  <div className="w-32 h-32 bg-stone-50 rounded-[3rem] flex items-center justify-center mb-10 group">
                    <ShoppingBag size={48} className="text-stone-200 group-hover:text-primary transition-colors duration-500" />
                  </div>
                  <h3 className="text-3xl font-playfair font-bold text-stone-900 mb-4">Your bag is empty</h3>
                  <p className="text-stone-400 font-medium mb-10 max-w-[240px] mx-auto">Add some delicious desserts to start your sweet journey!</p>
                  <button 
                    onClick={() => { navigate('/menu'); onClose(); }}
                    className="px-10 py-5 bg-primary text-white rounded-full font-bold text-xs uppercase tracking-widest shadow-2xl shadow-primary/20 hover:bg-primary-dark transition-all active:scale-95"
                  >
                    Browse Menu
                  </button>
                </div>
              ) : (
                items.map((item) => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={item._id} 
                    className="flex gap-6 group"
                  >
                    <div className="w-20 h-20 bg-stone-50 rounded-2xl overflow-hidden flex-shrink-0 border border-stone-50">
                      {item.product.image ? (
                        <img src={item.product.image} alt={item.product.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-stone-200 text-3xl font-playfair bg-gradient-to-br from-stone-50 to-stone-100">
                          🍰
                        </div>
                      )}
                    </div>
                    <div className="flex-grow flex flex-col justify-center min-w-0">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-stone-900 text-base leading-tight truncate pr-4 group-hover:text-primary transition-colors">
                          {item.product.title}
                        </h4>
                        <button 
                          onClick={() => removeFromCart(item._id)}
                          className="p-1 text-stone-300 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <p className="text-stone-400 text-xs font-bold mb-3">Unit Price: {formatCurrency(item.product.price)}</p>
                      
                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center bg-stone-50 rounded-xl p-1 border border-stone-100">
                          <button 
                            onClick={() => updateQuantity(item._id, item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-white text-stone-600 shadow-sm hover:bg-primary hover:text-white transition-all disabled:opacity-30"
                            disabled={item.quantity <= 1}
                          >
                            <Minus size={12} />
                          </button>
                          <span className="w-8 text-center font-black text-stone-900 text-sm">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item._id, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-white text-stone-600 shadow-sm hover:bg-primary hover:text-white transition-all"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                        <span className="font-bold text-primary">{formatCurrency(item.product.price * item.quantity)}</span>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Cart Summary */}
            {items.length > 0 && (
              <div className="p-8 bg-stone-50 border-t border-stone-100 space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-stone-400 text-xs font-black uppercase tracking-widest">
                    <span>Subtotal</span>
                    <span>{formatCurrency(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between items-center text-stone-400 text-xs font-black uppercase tracking-widest">
                    <span>Delivery</span>
                    <span className="text-emerald-600">Free</span>
                  </div>
                  <div className="h-px bg-stone-200" />
                  <div className="flex justify-between items-center text-stone-900">
                    <span className="text-2xl font-playfair font-extrabold">Total</span>
                    <span className="text-2xl font-bold">{formatCurrency(cartTotal)}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <button 
                    onClick={handleCheckout}
                    className="w-full bg-primary text-white py-5 rounded-2xl font-bold text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-4 hover:bg-primary-dark transition-all shadow-2xl shadow-primary/20 group active:scale-95"
                  >
                    Proceed to Checkout
                    <ArrowRight size={20} className="transition-transform group-hover:translate-x-2" />
                  </button>
                  <button 
                    onClick={onClose}
                    className="w-full text-stone-400 font-bold text-xs uppercase tracking-widest hover:text-stone-900 transition-colors"
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
