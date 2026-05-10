import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/helpers';
import { Minus, Plus, ShoppingCart } from 'lucide-react';

export default function ProductCard({ product, showAddToCart = false }) {
  const { items, addToCart, updateQuantity } = useCart();
  
  const cartItem = items.find(item => item.product._id === product._id);
  const qtyInCart = cartItem ? cartItem.quantity : 0;

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-amber-100 flex flex-col h-full group">
      {/* Image */}
      <div className="relative h-56 w-full bg-amber-50 overflow-hidden">
        {product.image ? (
          <img 
            src={product.image} 
            alt={product.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-100 to-amber-200 text-amber-700 font-playfair text-6xl opacity-50">
            {product.title.charAt(0)}
          </div>
        )}
        <div className="absolute top-4 left-4">
          <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
            {product.category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2 gap-2">
          <h3 className="font-playfair font-bold text-xl text-gray-900 line-clamp-2 leading-tight">
            {product.title}
          </h3>
          <span className="font-bold text-amber-700 whitespace-nowrap text-lg">
            {formatCurrency(product.price)}
          </span>
        </div>
        
        <p className="text-gray-500 text-sm line-clamp-2 mb-6 flex-grow">
          {product.description || 'Delicious handcrafted dessert.'}
        </p>

        {showAddToCart && (
          <div className="mt-auto">
            {qtyInCart > 0 ? (
              <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-full p-1 shadow-inner">
                <button 
                  onClick={() => updateQuantity(product._id, qtyInCart - 1)}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-white text-amber-700 shadow hover:bg-amber-100 transition-colors"
                >
                  <Minus size={18} />
                </button>
                <span className="font-bold w-8 text-center text-gray-900">{qtyInCart}</span>
                <button 
                  onClick={() => updateQuantity(product._id, qtyInCart + 1)}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-amber-600 text-white shadow hover:bg-amber-700 transition-colors"
                >
                  <Plus size={18} />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => addToCart(product)}
                className="w-full flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white py-3 rounded-full font-semibold transition-colors shadow-md shadow-amber-200/50"
              >
                <ShoppingCart size={18} />
                Add to Cart
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
