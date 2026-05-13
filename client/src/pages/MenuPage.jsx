import { useState, useEffect, useMemo } from 'react';
import ProductCard from '../components/ProductCard';
import api from '../api/axios';
import { Search, RotateCcw, Filter, UtensilsCrossed, Loader2, Sparkles } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export default function MenuPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  const query = new URLSearchParams(useLocation().search);
  const initialCat = query.get('category');

  useEffect(() => {
    if (initialCat) setSelectedCategory(initialCat);
  }, [initialCat]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/products');
      if (res.data.success) {
        setProducts(res.data.products);
      }
    } catch (err) {
      setError('Failed to load desserts. Please check your connection.');
      console.error('Menu fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category));
    return ['All', ...Array.from(cats)].sort();
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, search, selectedCategory]);

  return (
    <div className="min-h-screen bg-[#FDFCFB] pt-24 lg:pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 lg:gap-10 mb-12 lg:mb-20">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 lg:gap-3 text-amber-600 font-bold text-[10px] lg:text-xs uppercase tracking-[0.3em] mb-3 lg:mb-4">
              <Sparkles size={14} className="lg:w-4 lg:h-4" /> Curated Collections
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-8xl font-playfair font-black text-slate-950 leading-[1.1] lg:leading-[0.9]">
              The Dessert <br /><span className="text-amber-500 italic">Catalog</span>
            </h1>
          </div>
          <div className="relative w-full lg:w-96 group">
            <Search className="absolute left-5 lg:left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-amber-500 transition-colors" size={18} lg:size={20} />
            <input
              type="text"
              placeholder="What are you craving?"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-14 lg:pl-16 pr-5 lg:pr-6 py-4 lg:py-5 bg-white border border-slate-50 rounded-2xl lg:rounded-[2rem] outline-none focus:ring-4 focus:ring-amber-500/10 shadow-xl shadow-slate-200/20 transition-all font-medium text-slate-950 text-sm"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-4 lg:gap-6 mb-12 lg:mb-16 overflow-x-auto pb-4 no-scrollbar">
          <div className="p-3 bg-slate-950 text-white rounded-xl lg:rounded-2xl flex-shrink-0">
            <Filter size={20} />
          </div>
          <div className="flex gap-2 lg:gap-3">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`whitespace-nowrap px-6 lg:px-8 py-3 lg:py-4 rounded-xl lg:rounded-2xl font-bold text-[10px] lg:text-xs uppercase tracking-widest transition-all duration-300 ${
                  selectedCategory === cat 
                    ? 'bg-amber-500 text-slate-950 shadow-xl shadow-amber-500/20' 
                    : 'bg-white text-slate-400 hover:bg-slate-50 border border-slate-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-10">
            {[1, 2, 3, 4, 5, 6].map(n => (
              <div key={n} className="bg-white rounded-3xl lg:rounded-[3rem] h-[400px] lg:h-[500px] animate-pulse border border-slate-50 shadow-sm"></div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-24 lg:py-32 bg-white rounded-3xl lg:rounded-[4rem] border border-red-50/50 shadow-2xl shadow-slate-100 flex flex-col items-center px-6">
            <div className="w-16 h-16 lg:w-20 lg:h-20 bg-red-50 rounded-full flex items-center justify-center text-red-500 mb-6 lg:mb-8">
              <RotateCcw size={32} lg:size={40} />
            </div>
            <p className="text-slate-950 text-xl lg:text-2xl font-playfair font-bold mb-6 lg:mb-8">{error}</p>
            <button 
              onClick={fetchProducts}
              className="flex items-center gap-3 bg-slate-950 text-white px-8 lg:px-10 py-4 lg:py-5 rounded-2xl lg:rounded-[2rem] hover:bg-amber-500 hover:text-slate-950 transition-all duration-500 font-black text-[10px] lg:text-xs uppercase tracking-widest shadow-xl shadow-slate-900/10"
            >
              Retry Connection
            </button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-24 lg:py-32 bg-white rounded-3xl lg:rounded-[4rem] border border-slate-50 shadow-2xl shadow-slate-100 px-6">
            <div className="w-16 h-16 lg:w-20 lg:h-20 bg-amber-50 rounded-full flex items-center justify-center text-amber-500 mx-auto mb-6 lg:mb-8">
              <UtensilsCrossed size={32} lg:size={40} />
            </div>
            <h3 className="text-2xl lg:text-3xl font-playfair font-bold text-slate-950 mb-3">No desserts found</h3>
            <p className="text-slate-400 font-medium text-sm lg:text-base">Try exploring a different category or search term.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
            {filteredProducts.map(product => (
              <ProductCard key={product._id} product={product} showAddToCart={true} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
