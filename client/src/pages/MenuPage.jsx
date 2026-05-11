import { useState, useEffect, useMemo } from 'react';
import ProductCard from '../components/ProductCard';
import api from '../api/axios';
import { Search } from 'lucide-react';

const CATEGORIES = [
  'All',
  'Bubble Waffle',
  'Add-On',
  'The Big Hero Bread',
  'Fruitella',
  'Croissants',
  'Bun & Choco',
  'Melt-In Moments'
];

export default function MenuPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await api.get('/products');
        if (res.data.success) {
          setProducts(res.data.products);
        }
      } catch (err) {
        setError('Failed to load menu. Please try again later.');
        console.error('Menu fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchSearch = p.title.toLowerCase().includes(search.toLowerCase());
      const matchCat = category === 'All' || p.category === category;
      return matchSearch && matchCat;
    });
  }, [products, search, category]);

  return (
    <div className="min-h-screen bg-amber-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="font-playfair text-5xl font-bold text-gray-900 mb-6">Our Menu</h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">Explore our collection of handcrafted premium desserts.</p>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
          <div className="flex flex-wrap gap-3 justify-center md:justify-start">
            {CATEGORIES.map(c => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-5 py-2 rounded-full font-medium transition-all ${
                  category === c 
                    ? 'bg-amber-600 text-white shadow-md' 
                    : 'bg-white text-gray-600 hover:bg-amber-100 border border-amber-200'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-80">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={20} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search desserts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 w-full px-4 py-3 border border-amber-200 rounded-full focus:ring-2 focus:ring-amber-500 outline-none shadow-sm"
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-6 rounded-2xl mb-8 text-center border border-red-100">
            {error}
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(n => (
              <div key={n} className="bg-white h-[400px] rounded-2xl animate-pulse border border-amber-100 shadow-sm"></div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-amber-100 shadow-sm">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="font-playfair text-2xl font-bold text-gray-900 mb-2">No desserts found</h3>
            <p className="text-gray-500">Try adjusting your search or category filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map(product => (
              <ProductCard key={product._id} product={product} showAddToCart={true} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
