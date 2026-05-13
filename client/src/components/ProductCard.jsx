import { useCart } from '../context/CartContext';
import { Plus, Minus, Star } from 'lucide-react';
import { formatCurrency } from '../utils/helpers';
import toast from 'react-hot-toast';

export default function ProductCard({ product }) {
  const { items, addToCart, updateQuantity } = useCart();
  
  const cartItem = items.find(item => item._id === product._id);
  const qty = cartItem ? cartItem.quantity : 0;

  const categoryGradients = {
    'Bubble Waffle': 'from-amber-400 to-amber-600',
    'Croissants': 'from-orange-400 to-orange-600',
    'Melt-In Moments': 'from-rose-400 to-rose-600',
    'Add-On': 'from-indigo-400 to-indigo-600',
    'Fruitella': 'from-emerald-400 to-emerald-600',
    'Big Hero Bread': 'from-yellow-400 to-yellow-600',
    'Bun & Choco': 'from-stone-600 to-stone-800'
  };

  const categoryEmojis = {
    'Bubble Waffle': '🧇',
    'Croissants': '🥐',
    'Melt-In Moments': '🍮',
    'Add-On': '✨',
    'Fruitella': '🍓',
    'Big Hero Bread': '🍞',
    'Bun & Choco': '🍫'
  };

  const gradient = categoryGradients[product.category] || 'from-amber-500 to-primary-dark';
  const emoji = categoryEmojis[product.category] || '🍰';

  const handleAdd = () => {
    addToCart(product);
    if (qty === 0) toast.success(`${product.title} added to bag!`, {
        icon: '🛍️',
        style: { borderRadius: '1rem', background: '#1C1917', color: '#fff', fontWeight: 'bold' }
    });
  };

  return (
    <div className="group bg-white rounded-[2rem] overflow-hidden border border-stone-100 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 flex flex-col h-full animate-fadeIn">
      {/* Image Area */}
      <div className="relative h-56 overflow-hidden">
        {product.image ? (
          <img 
            src={product.image} 
            alt={product.title} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
            <span className="text-7xl drop-shadow-2xl">{emoji}</span>
          </div>
        )}
        
        {/* Overlay Badges */}
        <div className="absolute top-4 left-4">
          <span className="px-4 py-1.5 bg-white/90 backdrop-blur-md text-[10px] font-black uppercase tracking-widest text-stone-900 rounded-full shadow-lg">
            {product.category}
          </span>
        </div>

        {product.description?.toLowerCase().includes('must try') && (
          <div className="absolute top-4 right-4">
            <span className="px-3 py-1 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg animate-pulse">
              🔥 Must Try
            </span>
          </div>
        )}

        <div className="absolute bottom-4 left-4 flex items-center gap-1 px-2 py-1 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-black text-amber-600 shadow-md">
          <Star size={12} fill="currentColor" /> 4.9
        </div>
      </div>

      {/* Card Body */}
      <div className="p-6 flex flex-col flex-grow space-y-3">
        <h3 className="text-xl font-playfair font-bold text-stone-900 leading-tight group-hover:text-primary transition-colors">
          {product.title}
        </h3>
        
        <p className="text-sm text-stone-500 line-clamp-2 italic font-medium leading-relaxed flex-grow">
          {product.description || "Indulge in this handcrafted Melcho creation, made with premium ingredients and a touch of magic."}
        </p>

        <div className="flex items-center justify-between pt-4 border-t border-stone-50">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-stone-300 uppercase tracking-widest">Price</span>
            <span className="text-2xl font-bold text-primary">{formatCurrency(product.price)}</span>
          </div>

          <div className="relative">
            {qty === 0 ? (
              <button 
                onClick={handleAdd}
                className="px-6 py-3 bg-primary text-white font-bold text-xs uppercase tracking-widest rounded-full shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all active:scale-90 flex items-center gap-2"
              >
                <Plus size={16} /> Add
              </button>
            ) : (
              <div className="flex items-center bg-primary text-white rounded-full p-1 shadow-lg shadow-primary/20 animate-in zoom-in duration-300">
                <button 
                  onClick={() => updateQuantity(product._id, qty - 1)}
                  className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors"
                >
                  <Minus size={16} />
                </button>
                <span className="w-8 text-center font-bold text-lg">{qty}</span>
                <button 
                  onClick={() => updateQuantity(product._id, qty + 1)}
                  className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
