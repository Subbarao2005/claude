import { useCart } from '../context/CartContext';
import { ShoppingBag, Plus, Sparkles, Star } from 'lucide-react';
import { formatCurrency } from '../utils/helpers';

export default function ProductCard({ product, showAddToCart = true }) {
  const { addToCart } = useCart();

  const fallbackImage = "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&q=80&w=400";

  return (
    <div className="group bg-white rounded-3xl lg:rounded-[2.5rem] p-3 lg:p-4 shadow-sm hover:shadow-2xl transition-all duration-700 border border-slate-100 flex flex-col h-full relative overflow-hidden gpu">
      {/* Decorative Accent */}
      <div className="absolute -top-12 -right-12 w-24 h-24 bg-amber-50 rounded-full group-hover:scale-150 transition-transform duration-700 opacity-50" />
      
      {/* Image Container */}
      <div className="relative h-48 sm:h-56 lg:h-64 w-full mb-4 lg:mb-6 rounded-2xl lg:rounded-[2rem] overflow-hidden">
        <img 
          src={product.image || fallbackImage} 
          alt={product.title} 
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Category Tag */}
        <div className="absolute top-3 left-3 lg:top-4 lg:left-4">
          <span className="px-3 py-1 lg:px-4 lg:py-1.5 bg-white/90 backdrop-blur-md rounded-full text-[9px] lg:text-[10px] font-black uppercase tracking-widest text-slate-900 shadow-lg">
            {product.category}
          </span>
        </div>

        {/* Rating */}
        <div className="absolute top-3 right-3 lg:top-4 lg:right-4 px-2 py-0.5 lg:px-3 lg:py-1 bg-amber-500 text-slate-950 rounded-full text-[9px] lg:text-[10px] font-black flex items-center gap-1 shadow-lg shadow-amber-500/20">
          <Star size={10} fill="currentColor" /> 4.9
        </div>
      </div>

      {/* Content */}
      <div className="px-1 lg:px-2 flex-1 flex flex-col">
        <div className="flex justify-between items-start gap-4 mb-2">
          <h3 className="text-lg lg:text-xl font-playfair font-bold text-slate-950 leading-tight group-hover:text-amber-600 transition-colors duration-500">
            {product.title}
          </h3>
        </div>
        
        <p className="text-xs lg:text-sm text-slate-400 line-clamp-2 mb-4 lg:mb-6 flex-1 italic leading-relaxed">
          {product.description || "Indulge in this handcrafted Melcho creation, made with premium ingredients and a touch of magic."}
        </p>

        <div className="flex items-center justify-between mt-auto pt-3 lg:pt-4 border-t border-slate-50">
          <div className="flex flex-col">
            <span className="text-[9px] lg:text-[10px] font-black text-slate-300 uppercase tracking-widest">Price</span>
            <span className="text-xl lg:text-2xl font-bold text-slate-950">{formatCurrency(product.price)}</span>
          </div>

          {showAddToCart && (
            <button 
              onClick={() => addToCart(product)}
              className="flex items-center gap-2 lg:gap-3 px-4 lg:px-6 py-3 lg:py-4 bg-slate-950 text-white rounded-xl lg:rounded-2xl font-bold text-[10px] lg:text-xs uppercase tracking-widest hover:bg-amber-500 hover:text-slate-950 hover:shadow-xl hover:shadow-amber-200 transition-all duration-500 group/btn active:scale-95"
            >
              <Plus size={16} className="transition-transform group-hover/btn:rotate-90 duration-500" />
              <span className="hidden sm:inline">Add to Bag</span>
              <span className="sm:hidden">Add</span>
            </button>
          )}
        </div>
      </div>

      {/* Out of Stock Overlay */}
      {!product.availability && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] flex items-center justify-center z-10">
          <div className="bg-red-50 text-red-600 px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-widest border border-red-100 shadow-xl">
            Sold Out
          </div>
        </div>
      )}
    </div>
  );
}
