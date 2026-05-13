import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  ShoppingBag, 
  Sparkles, 
  Clock, 
  MapPin, 
  ShieldCheck,
  Star,
  ChevronRight,
  Utensils
} from 'lucide-react';

export default function LandingPage() {
  const categories = [
    { name: 'Bubble Waffle', img: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&q=80&w=400' },
    { name: 'Croissants', img: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&q=80&w=400' },
    { name: 'Melt-In Moments', img: 'https://images.unsplash.com/photo-1544787210-2213d420436f?auto=format&fit=crop&q=80&w=400' },
  ];

  return (
    <div className="flex flex-col bg-[#FDFCFB]">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] lg:min-h-screen flex items-center pt-24 lg:pt-32 overflow-hidden px-6">
        {/* Abstract Background Elements */}
        <div className="absolute top-20 right-[-10%] w-[300px] lg:w-[500px] h-[300px] lg:h-[500px] bg-amber-200/20 blur-[80px] lg:blur-[120px] rounded-full" />
        <div className="absolute bottom-10 left-[-10%] w-[200px] lg:w-[400px] h-[200px] lg:h-[400px] bg-indigo-200/20 blur-[70px] lg:blur-[100px] rounded-full" />
        
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="relative z-10 animate-in fade-in slide-in-from-left-8 duration-1000">
            <div className="inline-flex items-center gap-2 lg:gap-3 px-4 lg:px-6 py-2 lg:py-3 bg-white shadow-xl shadow-slate-200/50 rounded-full text-amber-600 font-bold text-[10px] lg:text-xs uppercase tracking-widest mb-6 lg:mb-8 border border-slate-50">
              <Sparkles size={14} className="lg:w-4 lg:h-4" /> 100% Handcrafted Joy
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-9xl font-playfair font-black text-slate-950 leading-[1.1] lg:leading-[0.9] mb-6 lg:mb-8">
              Sweet <br />
              <span className="text-amber-500 italic">Melodies</span> <br className="hidden lg:block" />
              For You.
            </h1>
            <p className="text-base lg:text-lg text-slate-500 max-w-lg mb-8 lg:mb-12 leading-relaxed font-medium">
              Experience the art of dessert making. From golden bubble waffles to buttery croissants, Melcho brings you a symphony of flavors delivered straight to your heart.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 lg:gap-6">
              <Link to="/menu" className="group px-8 lg:px-10 py-5 lg:py-6 bg-slate-950 text-white rounded-2xl lg:rounded-[2rem] font-bold text-xs lg:text-sm uppercase tracking-[0.2em] shadow-2xl shadow-slate-900/20 flex items-center justify-center gap-4 hover:bg-amber-500 hover:text-slate-950 transition-all duration-500 active:scale-95">
                Explore Menu <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform duration-500" />
              </Link>
              <div className="flex items-center gap-4 px-5 py-3 lg:px-6 lg:py-4 bg-white/50 backdrop-blur-md border border-slate-100 rounded-2xl lg:rounded-[2rem]">
                <div className="flex -space-x-3">
                  {[1,2,3].map(i => (
                    <div key={i} className="w-8 lg:w-10 h-8 lg:h-10 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                      <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" />
                    </div>
                  ))}
                </div>
                <div className="text-left">
                  <p className="text-[10px] lg:text-xs font-bold text-slate-900">5k+ Happy Foodies</p>
                  <div className="flex text-amber-500 gap-0.5">
                    {[1,2,3,4,5].map(i => <Star key={i} size={8} className="lg:w-2.5 lg:h-2.5" fill="currentColor" />)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Hero Visual */}
          <div className="relative animate-in fade-in zoom-in duration-1000 delay-300 hidden sm:block">
            <div className="aspect-square rounded-[3rem] lg:rounded-[4rem] overflow-hidden shadow-2xl rotate-3 scale-95 relative">
              <img 
                src="https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?auto=format&fit=crop&q=80&w=800" 
                alt="Premium Waffle" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 to-transparent" />
            </div>
            {/* Floating Card */}
            <div className="absolute -bottom-6 lg:-bottom-10 -left-6 lg:-left-10 bg-white p-6 lg:p-8 rounded-3xl lg:rounded-[3rem] shadow-2xl border border-slate-50 flex items-center gap-4 lg:gap-6 animate-bounce-subtle">
              <div className="w-12 h-12 lg:w-16 lg:h-16 bg-amber-100 text-amber-600 rounded-2xl lg:rounded-3xl flex items-center justify-center">
                <Utensils size={24} className="lg:w-8 lg:h-8" />
              </div>
              <div>
                <p className="text-[9px] lg:text-[10px] font-black text-slate-300 uppercase tracking-widest">Fast Delivery</p>
                <p className="text-base lg:text-lg font-bold text-slate-900 leading-none mt-1">Under 25 Mins</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-8 lg:px-12 grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
          <div className="flex flex-col items-center text-center group">
            <div className="w-16 h-16 lg:w-20 lg:h-20 bg-slate-50 text-slate-950 rounded-2xl lg:rounded-3xl flex items-center justify-center mb-6 lg:mb-8 group-hover:bg-amber-500 transition-all duration-500">
              <Clock size={28} className="lg:w-8 lg:h-8" />
            </div>
            <h3 className="text-lg lg:text-xl font-bold text-slate-950 mb-3 lg:mb-4">Always Fresh</h3>
            <p className="text-sm lg:text-base text-slate-500 leading-relaxed">Baked fresh daily using only the finest ingredients sourced with love.</p>
          </div>
          <div className="flex flex-col items-center text-center group">
            <div className="w-16 h-16 lg:w-20 lg:h-20 bg-slate-50 text-slate-950 rounded-2xl lg:rounded-3xl flex items-center justify-center mb-6 lg:mb-8 group-hover:bg-amber-500 transition-all duration-500">
              <MapPin size={28} className="lg:w-8 lg:h-8" />
            </div>
            <h3 className="text-lg lg:text-xl font-bold text-slate-950 mb-3 lg:mb-4">Express Delivery</h3>
            <p className="text-sm lg:text-base text-slate-500 leading-relaxed">Swift and safe delivery to ensure your treats arrive in perfect condition.</p>
          </div>
          <div className="flex flex-col items-center text-center group">
            <div className="w-16 h-16 lg:w-20 lg:h-20 bg-slate-50 text-slate-950 rounded-2xl lg:rounded-3xl flex items-center justify-center mb-6 lg:mb-8 group-hover:bg-amber-500 transition-all duration-500">
              <ShieldCheck size={28} className="lg:w-8 lg:h-8" />
            </div>
            <h3 className="text-lg lg:text-xl font-bold text-slate-950 mb-3 lg:mb-4">Secure Checkout</h3>
            <p className="text-sm lg:text-base text-slate-500 leading-relaxed">Safe and encrypted payments powered by Razorpay for your peace of mind.</p>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 lg:py-32 bg-slate-50 rounded-[2.5rem] lg:rounded-[4rem] mx-4 lg:mx-0">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 lg:mb-20 gap-6">
            <div className="max-w-xl">
              <h2 className="text-4xl lg:text-6xl font-playfair font-black text-slate-950 leading-tight">Explore Our <br /><span className="text-amber-500">Sweet Collections</span></h2>
            </div>
            <Link to="/menu" className="flex items-center gap-3 text-slate-900 font-black text-[10px] lg:text-xs uppercase tracking-widest hover:text-amber-600 transition-colors group">
              Browse Entire Menu <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
            {categories.map((cat, i) => (
              <Link key={i} to={`/menu?category=${cat.name}`} className="group relative aspect-[4/5] rounded-3xl lg:rounded-[4rem] overflow-hidden shadow-xl">
                <img src={cat.img} alt={cat.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                <div className="absolute bottom-8 lg:bottom-12 left-8 lg:left-12 right-8 lg:right-12">
                  <p className="text-amber-500 text-[10px] font-black uppercase tracking-widest mb-1 lg:mb-2">Category</p>
                  <h3 className="text-2xl lg:text-3xl font-playfair font-bold text-white mb-4 lg:mb-6">{cat.name}</h3>
                  <div className="w-10 h-10 lg:w-12 lg:h-12 bg-white text-slate-950 rounded-xl lg:rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                    <ArrowRight size={20} className="lg:w-6 lg:h-6" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-24 lg:py-40">
        <div className="max-w-5xl mx-auto px-8 text-center">
          <h2 className="text-5xl lg:text-8xl font-playfair font-black text-slate-950 leading-tight lg:leading-none mb-8 lg:mb-12">Ready to taste perfection?</h2>
          <Link to="/register" className="inline-flex items-center gap-3 lg:gap-4 px-8 lg:px-12 py-5 lg:py-8 bg-amber-500 text-slate-950 rounded-2xl lg:rounded-[3rem] font-bold text-sm lg:text-lg uppercase tracking-[0.2em] shadow-2xl shadow-amber-500/20 hover:bg-slate-900 hover:text-white transition-all duration-500 active:scale-95">
            Join the Club <ArrowRight size={20} className="lg:w-6 lg:h-6" />
          </Link>
        </div>
      </section>
    </div>
  );
}
