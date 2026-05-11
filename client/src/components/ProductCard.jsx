import { useCart } from '../context/CartContext';
import { Plus, Minus, ShoppingCart } from 'lucide-react';

export default function ProductCard({ product, showAddToCart }) {
  const { items, addToCart, updateQuantity } = useCart();
  
  const cartItem = items.find(item => item._id === product._id);
  const quantity = cartItem ? cartItem.quantity : 0;

  return (
    <div className="group bg-white rounded-[2.5rem] overflow-hidden border border-amber-100 hover:shadow-2xl hover:shadow-amber-200/50 transition-all duration-500 flex flex-col h-full">
      {/* Image Section */}
      <div className="relative h-64 overflow-hidden bg-amber-50">
        {product.image ? (
          <img 
            src={product.image} 
            alt={product.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-amber-200 font-playfair text-8xl">
            {product.title.charAt(0)}
          </div>
        )}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-1 rounded-full text-amber-600 font-bold shadow-sm">
          ₹{product.price}
        </div>
        {product.category && (
          <div className="absolute top-4 left-4 bg-amber-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            {product.category}
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-8 flex flex-col flex-grow">
        <h3 className="text-2xl font-playfair font-bold text-gray-900 mb-2 group-hover:text-amber-600 transition-colors">
          {product.title}
        </h3>
        <p className="text-gray-500 text-sm line-clamp-2 mb-6 flex-grow">
          {product.description || 'Experience the premium taste of Melcho desserts.'}
        </p>

        {/* Action Button */}
        {showAddToCart && (
          <div className="mt-auto">
            {quantity === 0 ? (
              <button
                onClick={() => addToCart(product)}
                className="w-full bg-amber-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-amber-700 transition-all shadow-lg shadow-amber-200"
              >
                <ShoppingCart size={20} />
                Add to Cart
              </button>
            ) : (
              <div className="flex items-center justify-between bg-amber-50 rounded-2xl p-1 border border-amber-200">
                <button
                  onClick={() => updateQuantity(product._id, quantity - 1)}
                  className="w-12 h-12 flex items-center justify-center rounded-xl bg-white text-amber-600 hover:bg-amber-600 hover:text-white transition-all shadow-sm"
                >
                  <Minus size={20} />
                </button>
                <span className="font-bold text-xl text-gray-800">{quantity}</span>
                <button
                  onClick={() => updateQuantity(product._id, quantity + 1)}
                  className="w-12 h-12 flex items-center justify-center rounded-xl bg-white text-amber-600 hover:bg-amber-600 hover:text-white transition-all shadow-sm"
                >
                  <Plus size={20} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
