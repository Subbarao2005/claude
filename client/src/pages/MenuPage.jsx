import { useState, useEffect, useMemo } from 'react';
import ProductCard from '../components/ProductCard';
import api from '../api/axios';
import { Search, X, SlidersHorizontal, RefreshCw, Filter, UtensilsCrossed, ChevronRight } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export default function MenuPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('name'); // 'name', 'low', 'high'
  
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
      const data = res.data;
      if (data.success && Array.isArray(data.products)) {
        const validProducts = data.products.filter(p =>
          p && p._id && p.title && typeof p.price === 'number'
        );
        setProducts(validProducts);
      } else {
        setProducts([]);
      }
    } catch (err) {
      setError('Failed to load desserts. Please check your connection.');
      setProducts([]);
      console.error('Menu fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const categories = useMemo(() => {
    const cats = new Set((products || []).filter(p => p && p.category).map(p => p.category));
    return ['All', ...Array.from(cats)].sort();
  }, [products]);

  const filteredAndSortedProducts = useMemo(() => {
    let result = (products || []).filter(p => {
      if (!p || !p._id || !p.title) return false;
      const matchesSearch = (p.title || '').toLowerCase().includes(search.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    if (sortBy === 'low') result.sort((a, b) => (a.price || 0) - (b.price || 0));
    else if (sortBy === 'high') result.sort((a, b) => (b.price || 0) - (a.price || 0));
    else if (sortBy === 'name') result.sort((a, b) => (a.title || '').localeCompare(b.title || ''));

    return result;
  }, [products, search, selectedCategory, sortBy]);

  const resetFilters = () => {
    setSearch('');
    setSelectedCategory('All');
    setSortBy('name');
  };

  return (
    <div className="min-h-screen bg-bg-main pt-24 pb-24 animate-fadeIn">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Page Header */}
        <div className="bg-gradient-to-r from-primary-light to-amber-100/50 rounded-[3rem] p-12 lg:p-20 mb-16 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/20 rounded-full blur-3xl" />
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-2 text-stone-500 font-bold text-xs uppercase tracking-widest">
              Home <ChevronRight size={12} /> <span className="text-primary">Menu</span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-playfair font-extrabold text-stone-900 leading-tight">
              Our <span className="text-primary italic">Menu</span>
            </h1>
            <p className="text-lg text-stone-600 font-medium max-w-lg">
              52+ handcrafted desserts made fresh daily with premium ingredients.
            </p>
          </div>
        </div>

        {/* Sticky Filter Bar */}
        <div className="sticky top-20 z-40 bg-white/80 backdrop-blur-xl border border-stone-100 rounded-3xl p-4 shadow-xl shadow-stone-200/20 mb-16 flex flex-col md:flex-row gap-6">
          {/* Search */}
          <div className="flex-grow relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-primary transition-colors" size={20} />
            <input
              type="text"
              placeholder="What are you craving today?"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-14 pr-12 py-4 bg-stone-50 border border-stone-50 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 transition-all font-medium text-stone-900"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-stone-400 hover:text-stone-900">
                <X size={16} />
              </button>
            )}
          </div>

          {/* Sort */}
          <div className="flex items-center gap-4 bg-stone-50 rounded-2xl px-6 py-4 border border-stone-50">
            <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">Sort By</span>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent font-bold text-sm text-stone-900 outline-none cursor-pointer"
            >
              <option value="name">Name: A to Z</option>
              <option value="low">Price: Low to High</option>
              <option value="high">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-4 mb-16 overflow-x-auto pb-6 no-scrollbar snap-x">
          <div className="p-4 bg-stone-900 text-white rounded-2xl flex-shrink-0">
            <SlidersHorizontal size={20} />
          </div>
          {categories.filter(cat => cat).map(cat => {
            const count = (products || []).filter(p => p && p.category === cat).length;
            const isAll = cat === 'All';
            const isActive = selectedCategory === cat;
            
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`whitespace-nowrap px-8 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all duration-300 flex items-center gap-3 snap-center ${
                  isActive 
                    ? 'bg-primary text-white shadow-2xl shadow-primary/30 -translate-y-1' 
                    : 'bg-white text-stone-400 hover:bg-stone-50 border border-stone-100 shadow-sm'
                }`}
              >
                {cat}
                {!isAll && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                    isActive ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-400'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
              <div key={n} className="bg-stone-100 rounded-[2.5rem] h-96 animate-pulse border border-stone-50 shadow-sm"></div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-32 bg-white rounded-[4rem] border border-stone-100 shadow-2xl shadow-stone-100 flex flex-col items-center px-6">
            <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center text-red-500 mb-8">
              <RefreshCw size={48} className="animate-spin-slow" />
            </div>
            <h2 className="text-3xl font-playfair font-bold text-stone-900 mb-4">Something went wrong</h2>
            <p className="text-stone-500 max-w-sm mx-auto mb-10 font-medium">Our server might be taking a quick nap. Please try again in a moment.</p>
            <button 
              onClick={fetchProducts}
              className="flex items-center gap-3 bg-stone-900 text-white px-12 py-5 rounded-full hover:bg-primary transition-all duration-500 font-bold text-sm uppercase tracking-widest shadow-xl shadow-stone-900/10"
            >
              Try Again
            </button>
          </div>
        ) : filteredAndSortedProducts.length === 0 ? (
          <div className="text-center py-32 bg-white rounded-[4rem] border border-stone-100 shadow-2xl shadow-stone-100 px-6">
            <div className="w-24 h-24 bg-primary-light rounded-full flex items-center justify-center text-primary mx-auto mb-8">
              <UtensilsCrossed size={48} />
            </div>
            <h3 className="text-3xl font-playfair font-bold text-stone-900 mb-3">No desserts found</h3>
            <p className="text-stone-400 font-medium mb-10">Try a different search or explore a different category.</p>
            <button 
              onClick={resetFilters}
              className="text-primary font-bold hover:underline"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {filteredAndSortedProducts
              .filter(product => product && product._id && product.title)
              .map(product => (
              <ProductCard key={product._id} product={product} showAddToCart={true} />
            ))}
          </div>
        )}
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow { animation: spin-slow 3s linear infinite; }
      `}} />
    </div>
  );
}
