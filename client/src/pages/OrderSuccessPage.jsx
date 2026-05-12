import { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, Home, ShoppingBag, Clock } from 'lucide-react';

export default function OrderSuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderId, amount } = location.state || {};
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    if (!orderId) {
      navigate('/');
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate(`/orders/${orderId}`);
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [orderId, navigate]);

  if (!orderId) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-[3rem] p-10 shadow-xl border border-slate-100 text-center animate-in zoom-in duration-500">
        <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-8 text-emerald-600">
          <CheckCircle size={60} strokeWidth={1.5} />
        </div>
        
        <h1 className="text-3xl font-playfair font-bold text-slate-900 mb-2">Order Placed Successfully!</h1>
        <p className="text-slate-500 mb-8">Thank you for your purchase. Your delicious treats are being prepared.</p>
        
        <div className="bg-slate-50 rounded-2xl p-6 mb-8 space-y-3 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-slate-400 font-medium">Order ID</span>
            <span className="font-bold text-slate-900">#{orderId.slice(-8).toUpperCase()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400 font-medium">Amount Paid</span>
            <span className="font-bold text-amber-600 text-lg">₹{amount}</span>
          </div>
        </div>

        <div className="space-y-3">
          <Link 
            to={`/orders/${orderId}`}
            className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all"
          >
            Track My Order <ShoppingBag size={18} />
          </Link>
          <Link 
            to="/menu"
            className="w-full flex items-center justify-center gap-2 bg-white text-slate-900 border border-slate-200 py-4 rounded-2xl font-bold hover:bg-slate-50 transition-all"
          >
            Back to Menu <Home size={18} />
          </Link>
        </div>

        <div className="mt-8 flex items-center justify-center gap-2 text-slate-400 text-xs font-medium">
          <Clock size={14} />
          <span>Redirecting in {countdown} seconds</span>
        </div>
      </div>
    </div>
  );
}
