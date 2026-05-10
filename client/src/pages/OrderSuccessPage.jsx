import { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { formatCurrency } from '../utils/helpers';
import { CheckCircle2 } from 'lucide-react';

export default function OrderSuccessPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    if (!state?.orderId) {
      navigate('/menu');
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate(`/orders/${state.orderId}`);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [state, navigate]);

  if (!state?.orderId) return null;

  return (
    <div className="min-h-screen bg-amber-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-lg w-full p-10 rounded-3xl shadow-xl text-center border border-amber-100">
        <div className="flex justify-center mb-6">
          <CheckCircle2 size={80} className="text-green-500 animate-bounce" />
        </div>
        
        <h1 className="font-playfair text-3xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h1>
        <p className="text-gray-500 mb-8">Thank you for choosing Melcho. Your desserts are being prepared with love.</p>
        
        <div className="bg-amber-50 p-6 rounded-2xl mb-8 border border-amber-100 text-left">
          <div className="flex justify-between items-center border-b border-amber-200 pb-3 mb-3">
            <span className="text-gray-500 text-sm">Order ID</span>
            <span className="font-mono font-medium text-gray-900">{state.orderId}</span>
          </div>
          <div className="flex justify-between items-center border-b border-amber-200 pb-3 mb-3">
            <span className="text-gray-500 text-sm">Items</span>
            <span className="font-medium text-gray-900">{state.items}</span>
          </div>
          <div className="flex justify-between items-center pt-1">
            <span className="text-gray-500 text-sm">Total Paid</span>
            <span className="font-bold text-amber-700 text-lg">{formatCurrency(state.total)}</span>
          </div>
        </div>

        <div className="space-y-4">
          <Link 
            to={`/orders/${state.orderId}`}
            className="block w-full py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold transition-colors"
          >
            Track My Order
          </Link>
          <Link 
            to="/menu"
            className="block w-full py-3 bg-white hover:bg-gray-50 text-amber-600 border border-amber-200 rounded-xl font-bold transition-colors"
          >
            Back to Menu
          </Link>
        </div>

        <p className="text-sm text-gray-400 mt-6">
          Redirecting to tracking page in {countdown}s...
        </p>
      </div>
    </div>
  );
}
