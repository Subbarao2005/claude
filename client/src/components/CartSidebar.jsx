import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight, Sparkles } from 'lucide-react';
import { formatCurrency } from '../utils/helpers';

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
    <div className="fixed inset-0 z-[200] flex justify-end overflow-hidden">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-500"
        onClick={onClose}
      />

      {/* Sidebar Content */}
      <div className="relative w-full max-w-md bg-white h-full shadow-[0_0_80px_rgba(0,0,0,0.1)] flex flex-col animate-in slide-in-from-right duration-700 ease-out">
        {/* Header */}
        <div className="p-10 border-b border-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-500 text-slate-950 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20">
              <ShoppingBag size={24} />
            </div>
            <div>
              <h2 className="text-3xl font-playfair font-bold text-slate-950">Your Bag</h2>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mt-1">
                {cartCount} Items Selected
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all text-slate-400 hover:text-slate-900"
          >
            <X size={20} />
          </button>
        </div>

        {/* Items List */}
        <div className="flex-grow overflow-y-auto p-10 space-y-10 no-scrollbar">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="w-32 h-32 bg-slate-50 rounded-[3rem] flex items-center justify-center mb-10 group">
                <ShoppingBag size={48} className="text-slate-200 group-hover:text-amber-500 transition-colors duration-500" />
              </div>
              <h3 className="text-3xl font-playfair font-bold text-slate-950 mb-4">Your bag is empty</h3>
              <p className="text-slate-400 font-medium mb-10 max-w-[240px] mx-auto">Looks like you haven't added any sweets to your bag yet.</p>
              <button 
                onClick={onClose}
                className="px-10 py-5 bg-slate-950 text-white rounded-3xl font-bold text-xs uppercase tracking-widest shadow-2xl shadow-slate-900/20 hover:bg-amber-500 hover:text-slate-950 transition-all duration-500"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item._id} className="flex gap-6 group animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="w-24 h-24 bg-slate-50 rounded-[2rem] overflow-hidden flex-shrink-0 border border-slate-50">
                  <img src={item.product.image || "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&q=80&w=400"} alt={item.product.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                </div>
                <div className="flex-grow flex flex-col justify-center">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-slate-950 text-lg leading-tight group-hover:text-amber-600 transition-colors">{item.product.title}</h4>
                    <button 
                      onClick={() => removeFromCart(item._id)}
                      className="p-2 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center bg-slate-50 rounded-2xl p-1 border border-slate-100">
                      <button 
                        onClick={() => updateQuantity(item._id, item.quantity - 1)}
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm hover:bg-slate-950 hover:text-white transition-all disabled:opacity-30"
                        disabled={item.quantity <= 1}
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-10 text-center font-black text-slate-900">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item._id, item.quantity + 1)}
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm hover:bg-slate-950 hover:text-white transition-all"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <span className="text-lg font-bold text-slate-950">{formatCurrency(item.product.price * item.quantity)}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-10 bg-slate-50 border-t border-slate-100 rounded-t-[3rem] space-y-8">
            <div className="space-y-4">
              <div className="flex justify-between items-center text-slate-400 text-xs font-black uppercase tracking-widest">
                <span>Subtotal</span>
                <span>{formatCurrency(cartTotal)}</span>
              </div>
              <div className="flex justify-between items-center text-slate-950">
                <span className="text-3xl font-playfair font-bold">Total</span>
                <span className="text-3xl font-bold">{formatCurrency(cartTotal)}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 px-6 py-4 bg-amber-500/10 text-amber-700 rounded-2xl border border-amber-500/20 text-xs font-bold leading-relaxed">
              <Sparkles size={18} className="flex-shrink-0" />
              You're only ₹500 away from Free Shipping!
            </div>
            
            <div className="space-y-4">
              <button 
                onClick={handleCheckout}
                className="w-full bg-slate-950 text-white py-6 rounded-[2rem] font-bold text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-4 hover:bg-amber-500 hover:text-slate-950 transition-all duration-500 shadow-2xl shadow-slate-950/20 group"
              >
                Proceed to Checkout
                <ArrowRight size={20} className="transition-transform group-hover:translate-x-2" />
              </button>
              <button 
                onClick={onClose}
                className="w-full text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-slate-950 transition-colors"
              >
                Back to Menu
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
