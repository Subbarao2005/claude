import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Zap, Clock, ShoppingBag, ChevronRight, Sparkles } from 'lucide-react';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';

export default function LandingPage() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showWarmingMessage, setShowWarmingMessage] = useState(false);

  const categories = [
    { name: 'Bubble Waffle', emoji: '🧇', count: 12 },
    { name: 'Add-On', emoji: '✨', count: 8 },
    { name: 'Big Hero Bread', emoji: '🍞', count: 6 },
    { name: 'Fruitella', emoji: '🍓', count: 5 },
    { name: 'Croissants', emoji: '🥐', count: 7 },
    { name: 'Bun & Choco', emoji: '🍫', count: 9 },
    { name: 'Melt-In Moments', emoji: '🍮', count: 5 },
  ];

  const steps = [
    { icon: '🍽️', title: 'Browse Menu', desc: 'Explore 52+ handcrafted desserts across 7 categories' },
    { icon: '🛒', title: 'Add to Cart', desc: 'Select your favorites and customize your order' },
    { icon: '🚀', title: 'Fast Delivery', desc: 'Get your desserts delivered fresh to your door' }
  ];

  const testimonials = [
    { name: 'Priya Sharma', initial: 'P', review: 'The Bubble Waffle with Triple Chocolate is absolutely divine! Best dessert in Hyderabad by far. Will order again!' },
    { name: 'Rahul Mehta', initial: 'R', review: 'Biscoff Cheesecake from the Melt-In Moments menu is out of this world. Fast delivery and perfectly packed.' },
    { name: 'Ananya Reddy', initial: 'A', review: 'The Croissant with Ferrero Rocher is my weekly treat. Amazing quality and taste!' }
  ];

  useEffect(() => {
    const timer = setTimeout(() => setShowWarmingMessage(true), 5000);
    const fetchFeatured = async () => {
      try {
        const res = await api.get('/products');
        if (res.data.success && Array.isArray(res.data.products)) {
          const valid = res.data.products
            .filter(p => p && p._id && p.title)
            .slice(0, 6);
          setFeaturedProducts(valid);
        } else {
          setFeaturedProducts([]);
        }
      } catch (err) {
        setFeaturedProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col animate-fadeIn">
      {/* Hero Section */}
      <section className="relative min-h-[calc(100vh-64px)] flex items-center overflow-hidden px-4 sm:px-6 lg:px-12 bg-gradient-to-br from-[#FFFBF5] via-[#FEF3C7] to-[#FDE68A]">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-10 gap-12 items-center py-12 lg:py-0">
          <div className="lg:col-span-6 z-10 space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/50 backdrop-blur-sm rounded-full text-primary font-bold text-xs uppercase tracking-widest border border-primary/20">
              <Sparkles size={16} /> Premium Desserts in Hyderabad
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-[80px] font-playfair font-extrabold text-stone-900 leading-[1.1] tracking-tight">
              Handcrafted Desserts, <br className="hidden md:block" /> 
              <span className="text-primary-dark">Delivered</span> to You.
            </h1>
            <p className="text-lg md:text-xl text-stone-600 max-w-xl font-medium leading-relaxed">
              Experience the art of dessert making. From golden bubble waffles to buttery croissants, Melcho brings you a symphony of flavors delivered straight to your heart.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link to="/menu" className="group px-10 py-5 bg-primary text-white rounded-full font-bold text-lg shadow-2xl shadow-primary/30 flex items-center justify-center gap-3 hover:bg-primary-dark transition-all active:scale-95">
                Order Now <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/menu" className="px-10 py-5 bg-white/30 backdrop-blur-sm border-2 border-primary text-primary rounded-full font-bold text-lg hover:bg-white/50 transition-all text-center">
                View Menu
              </Link>
            </div>
            <div className="flex flex-wrap gap-6 pt-8 border-t border-primary/10">
              <div className="flex items-center gap-2 text-stone-700 font-semibold"><span className="text-xl">⚡</span> Fast Delivery</div>
              <div className="flex items-center gap-2 text-stone-700 font-semibold"><span className="text-xl">🍰</span> Fresh Daily</div>
              <div className="flex items-center gap-2 text-stone-700 font-semibold"><span className="text-xl">⭐</span> 4.8 Rated</div>
            </div>
          </div>

          <div className="lg:col-span-4 relative hidden lg:flex justify-center items-center">
            <div className="relative w-80 h-80 bg-white rounded-full shadow-[0_0_100px_rgba(217,119,6,0.2)] flex items-center justify-center animate-[float_6s_ease-in-out_infinite]">
              <span className="text-[140px] drop-shadow-2xl">🧇</span>
              {/* Floating Mini Cards */}
              <div className="absolute -top-10 -right-10 bg-white p-4 rounded-2xl shadow-xl border border-stone-50 animate-[bounce_4s_ease-in-out_infinite]">
                <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Trending</p>
                <p className="font-bold text-stone-900">Bubble Waffle</p>
                <p className="text-primary font-bold">₹199</p>
              </div>
              <div className="absolute -bottom-10 -left-10 bg-white p-4 rounded-2xl shadow-xl border border-stone-50 animate-[bounce_5s_ease-in-out_infinite]">
                <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Selection</p>
                <p className="font-bold text-stone-900">52+ Sweet Delights</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Showcase */}
      <section className="py-24 px-6 lg:px-12 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-4xl lg:text-5xl font-playfair font-extrabold text-stone-900">Explore Our Menu</h2>
              <p className="text-stone-500 mt-2 font-medium">Select a category to see more</p>
            </div>
            <Link to="/menu" className="hidden sm:flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all">
              Browse All <ChevronRight size={20} />
            </Link>
          </div>
          
          <div className="flex lg:grid lg:grid-cols-7 gap-6 overflow-x-auto no-scrollbar pb-6 lg:pb-0 snap-x">
            {categories.map((cat, i) => (
              <Link 
                key={i}
                to={`/menu?category=${encodeURIComponent(cat.name)}`}
                className="flex-shrink-0 w-44 lg:w-full bg-white border border-stone-100 p-8 rounded-[2rem] text-center shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 snap-center group"
              >
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-500">{cat.emoji}</div>
                <h3 className="font-bold text-stone-900 leading-tight mb-1">{cat.name}</h3>
                <p className="text-xs text-stone-400 font-bold uppercase tracking-widest">{cat.count} items</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Bestsellers */}
      {(loading || featuredProducts.length > 0) && (
        <section className="py-24 px-6 lg:px-12 bg-bg-main">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-4xl lg:text-5xl font-playfair font-extrabold text-stone-900">Our Bestsellers</h2>
              <p className="text-stone-500 max-w-2xl mx-auto font-medium">The most loved desserts in Hyderabad, crafted with premium ingredients and a touch of magic.</p>
            </div>

            {loading && showWarmingMessage && (
              <div className="text-center text-stone-500 font-bold mb-8">
                Loading... our server is warming up, please wait
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {loading ? (
                Array(6).fill(0).map((_, i) => (
                  <div key={i} className="h-96 bg-stone-100 animate-pulse rounded-3xl" />
                ))
              ) : (
                featuredProducts
                  .filter(p => p && p._id)
                  .map(product => (
                    <ProductCard key={product._id} product={product} showAddToCart={true} />
                  ))
              )}
            </div>
          </div>
        </section>
      )}

      {/* How It Works */}
      <section className="py-24 px-6 lg:px-12 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-20">
             <h2 className="text-4xl lg:text-5xl font-playfair font-extrabold text-stone-900">How Melcho Works</h2>
          </div>
          
          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Desktop Connector Line */}
            <div className="hidden md:block absolute top-12 left-1/4 right-1/4 h-0.5 border-t-2 border-dashed border-stone-200" />
            
            {steps.map((step, i) => (
              <div key={i} className="relative z-10 flex flex-col items-center text-center space-y-6">
                <div className="w-24 h-24 bg-primary text-white text-3xl font-bold rounded-full flex items-center justify-center shadow-2xl shadow-primary/30 border-8 border-white">
                  {i + 1}
                </div>
                <div className="text-4xl">{step.icon}</div>
                <h3 className="text-2xl font-bold text-stone-900">{step.title}</h3>
                <p className="text-stone-500 font-medium leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6 lg:px-12 bg-bg-main overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-playfair font-extrabold text-stone-900">What Our Customers Say</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-stone-100 flex flex-col space-y-6 hover:shadow-lg transition-all">
                <div className="text-primary flex gap-1">
                  {Array(5).fill(0).map((_, j) => <Star key={j} size={20} fill="currentColor" />)}
                </div>
                <p className="text-stone-600 font-medium italic leading-relaxed flex-grow">"{t.review}"</p>
                <div className="flex items-center gap-4 pt-6 border-t border-stone-50">
                  <div className="w-12 h-12 bg-primary-light text-primary flex items-center justify-center rounded-full font-bold text-lg">
                    {t.initial}
                  </div>
                  <div className="font-bold text-stone-900">{t.name}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="px-6 lg:px-12 mb-12">
        <div className="max-w-7xl mx-auto bg-gradient-to-r from-primary-dark to-primary rounded-[3rem] p-12 lg:p-24 text-center text-white space-y-8 relative overflow-hidden">
          {/* Decorative Circles */}
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-black/10 rounded-full blur-3xl" />
          
          <div className="relative z-10 space-y-6">
            <h2 className="text-5xl lg:text-7xl font-playfair font-extrabold leading-tight">Ready to treat yourself?</h2>
            <p className="text-xl lg:text-2xl text-primary-light/80 font-medium max-w-2xl mx-auto">Order now and get your desserts delivered fresh to your door in under 30 minutes.</p>
            <div className="pt-4">
              <Link to="/menu" className="inline-flex items-center gap-3 px-12 py-6 bg-white text-primary rounded-full font-extrabold text-xl shadow-2xl hover:bg-stone-50 transition-all active:scale-95">
                Start Ordering <ArrowRight size={24} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-stone-900 text-white pt-24 pb-12 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
          <div className="space-y-6">
            <h3 className="text-3xl font-playfair font-extrabold">Melcho 🍮</h3>
            <p className="text-stone-400 font-medium leading-relaxed">Premium desserts, handcrafted in Hyderabad and delivered with love to your doorstep.</p>
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-stone-800 rounded-full flex items-center justify-center hover:bg-primary transition-colors cursor-pointer">In</div>
              <div className="w-10 h-10 bg-stone-800 rounded-full flex items-center justify-center hover:bg-primary transition-colors cursor-pointer">Wa</div>
            </div>
          </div>
          
          <div className="space-y-6">
            <h4 className="text-xl font-bold">Quick Links</h4>
            <ul className="space-y-4 text-stone-400 font-medium">
              <li><Link to="/menu" className="hover:text-primary transition-colors">Menu</Link></li>
              <li><Link to="/about" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
            </ul>
          </div>
          
          <div className="space-y-6">
            <h4 className="text-xl font-bold">Categories</h4>
            <ul className="space-y-4 text-stone-400 font-medium">
              <li><Link to="/menu?category=Bubble%20Waffle" className="hover:text-primary transition-colors">Bubble Waffle</Link></li>
              <li><Link to="/menu?category=Croissants" className="hover:text-primary transition-colors">Croissants</Link></li>
              <li><Link to="/menu?category=Melt-In%20Moments" className="hover:text-primary transition-colors">Melt-In Moments</Link></li>
              <li><Link to="/menu?category=Fruitella" className="hover:text-primary transition-colors">Fruitella</Link></li>
            </ul>
          </div>
          
          <div className="space-y-6">
            <h4 className="text-xl font-bold">Contact Us</h4>
            <ul className="space-y-4 text-stone-400 font-medium">
              <li className="flex items-center gap-3">📍 Hyderabad, Telangana</li>
              <li className="flex items-center gap-3">📞 +91 XXXXXXXXXX</li>
              <li className="flex items-center gap-3">🕐 Open: 11 AM – 11 PM</li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto pt-12 border-t border-stone-800 text-center text-stone-500 text-sm font-bold tracking-widest uppercase">
          © 2025 Melcho. All rights reserved.
        </div>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}
