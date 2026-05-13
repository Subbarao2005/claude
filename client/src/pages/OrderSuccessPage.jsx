import { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { CheckCircle2, ArrowRight, ShoppingBag, MapPin, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { formatCurrency } from '../utils/helpers';

export default function OrderSuccessPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { orderId, amount } = location.state || {};
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    if (!orderId) {
      navigate('/menu');
      return;
    }

    // Confetti Celebration
    const duration = 5 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min, max) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);

    // Redirect Countdown
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate(`/orders/${orderId}`);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(timer);
    };
  }, [orderId, navigate]);

  if (!orderId) return null;

  return (
    <div className="min-h-screen bg-bg-main flex items-center justify-center p-6 animate-fadeIn">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-[3.5rem] p-10 lg:p-20 shadow-2xl shadow-primary/10 border border-stone-50 text-center relative overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-amber-500" />
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary-light/30 rounded-full blur-3xl" />
          
          <div className="relative z-10 space-y-10">
            {/* Success Animation Container */}
            <div className="relative inline-block">
               <div className="w-32 h-32 bg-emerald-50 rounded-full flex items-center justify-center animate-bounce-subtle">
                  <CheckCircle2 size={64} className="text-emerald-500" />
               </div>
               <div className="absolute inset-0 w-32 h-32 border-4 border-emerald-500 rounded-full animate-ping opacity-20" />
            </div>

            <div className="space-y-4">
              <h1 className="text-5xl lg:text-6xl font-playfair font-extrabold text-stone-900 leading-tight">Order Placed! 🎉</h1>
              <p className="text-lg text-stone-500 font-medium max-w-sm mx-auto">
                Your desserts are being prepared with love and will reach you in <span className="text-primary font-bold">30-45 minutes.</span>
              </p>
            </div>

            <div className="bg-stone-50 rounded-3xl p-8 grid grid-cols-2 gap-4 border border-stone-100">
               <div className="text-left space-y-1">
                  <p className="text-[10px] font-black text-stone-300 uppercase tracking-widest">Order Reference</p>
                  <p className="font-mono font-bold text-stone-900 text-sm">#{orderId.slice(-8).toUpperCase()}</p>
               </div>
               <div className="text-right space-y-1">
                  <p className="text-[10px] font-black text-stone-300 uppercase tracking-widest">Amount Paid</p>
                  <p className="font-bold text-primary text-lg">{formatCurrency(amount)}</p>
               </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link 
                to={`/orders/${orderId}`}
                className="flex-1 py-5 bg-stone-900 text-white rounded-2xl font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-primary transition-all shadow-xl active:scale-95 group"
              >
                Track My Order <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                to="/menu"
                className="flex-1 py-5 bg-white border border-stone-100 text-stone-600 rounded-2xl font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-stone-50 transition-all active:scale-95"
              >
                Order More
              </Link>
            </div>

            <div className="pt-6">
               <div className="relative h-1 w-48 mx-auto bg-stone-100 rounded-full overflow-hidden">
                  <div 
                    className="absolute top-0 left-0 h-full bg-primary transition-all duration-1000 ease-linear"
                    style={{ width: `${(countdown / 10) * 100}%` }}
                  />
               </div>
               <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mt-4">
                  Redirecting to order tracking in {countdown}s...
               </p>
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-subtle { animation: bounce-subtle 2s ease-in-out infinite; }
      `}} />
    </div>
  );
}
