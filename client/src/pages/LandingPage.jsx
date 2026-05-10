import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import api from '../api/axios';

export default function LandingPage() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await api.get('/products');
        if (res.data.success) {
          setFeatured(res.data.products.slice(0, 6)); // top 6
        }
      } catch (error) {
        console.error('Error fetching featured products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-amber-50 to-amber-100 py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-200/50 text-amber-800 font-medium text-sm mb-8">
            <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse"></span>
            Now Delivering Across the City
          </div>
          
          <h1 className="font-playfair text-5xl sm:text-7xl font-bold text-gray-900 tracking-tight mb-8">
            Handcrafted Desserts,<br />
            <span className="text-amber-600">Delivered to Your Door</span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-xl text-gray-600 mb-10 leading-relaxed">
            Experience the true taste of luxury with our premium cakes, pastries, and macarons. Baked fresh daily and delivered with care.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/menu" className="w-full sm:w-auto px-8 py-4 bg-amber-600 hover:bg-amber-700 text-white rounded-full font-bold text-lg transition-all shadow-lg shadow-amber-600/30 hover:scale-105">
              Order Now
            </Link>
            <Link to="/menu" className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-amber-50 text-amber-700 border border-amber-200 rounded-full font-bold text-lg transition-colors">
              View Menu
            </Link>
          </div>
        </div>
        
        {/* Decor */}
        <div className="absolute top-20 left-10 text-6xl opacity-20 animate-bounce" style={{ animationDuration: '3s' }}>🧁</div>
        <div className="absolute bottom-20 right-20 text-6xl opacity-20 animate-bounce" style={{ animationDuration: '4s' }}>🍰</div>
      </section>

      {/* Featured Products */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-playfair text-4xl font-bold text-gray-900 mb-4">Our Bestsellers</h2>
            <div className="w-24 h-1 bg-amber-600 mx-auto rounded-full"></div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map(n => (
                <div key={n} className="bg-gray-50 h-96 rounded-2xl animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featured.map(product => (
                <ProductCard key={product._id} product={product} showAddToCart={false} />
              ))}
            </div>
          )}
          
          <div className="mt-12 text-center">
            <Link to="/menu" className="inline-block px-6 py-3 border-2 border-amber-600 text-amber-600 hover:bg-amber-600 hover:text-white rounded-full font-bold transition-colors">
              View All Treats
            </Link>
          </div>
        </div>
      </section>

      {/* About */}
      <section className="py-24 bg-amber-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="font-playfair text-4xl font-bold mb-6 text-amber-100">The Melcho Story</h2>
              <p className="text-lg text-amber-50/80 mb-6 leading-relaxed">
                What started as a small passionate kitchen has grown into the city's most beloved dessert brand. At Melcho, we believe every celebration deserves something sweet, crafted with the finest ingredients and boundless love.
              </p>
              <p className="text-lg text-amber-50/80 leading-relaxed">
                From our rich Belgian chocolate truffles to our light-as-air macarons, our pastry chefs pour their hearts into every creation.
              </p>
            </div>
            <div className="relative h-96 rounded-3xl overflow-hidden bg-gradient-to-br from-amber-700 to-amber-800 flex items-center justify-center border-4 border-amber-600/30">
              <span className="font-playfair text-8xl text-amber-500/20 absolute">Since 2024</span>
              <div className="text-9xl relative z-10 drop-shadow-2xl hover:scale-110 transition-transform duration-500">🎂</div>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="py-24 bg-amber-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-playfair text-4xl font-bold text-gray-900 mb-4">Loved by Thousands</h2>
            <div className="w-24 h-1 bg-amber-600 mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: "Priya S.", text: "The Strawberry Dream Pastry is out of this world. Delivery was fast and packaging was beautiful!" },
              { name: "Rahul M.", text: "Ordered a Truffle Cake for my anniversary. The texture and richness were perfectly balanced. Highly recommended." },
              { name: "Ananya K.", text: "Their macarons are the best I've had in the city. Melcho never disappoints when I have a sweet craving." }
            ].map((review, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-amber-100">
                <div className="text-amber-500 text-xl mb-4">★★★★★</div>
                <p className="text-gray-600 mb-6 italic">"{review.text}"</p>
                <p className="font-bold text-gray-900">— {review.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
