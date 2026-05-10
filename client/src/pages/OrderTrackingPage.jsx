import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { formatDate, formatCurrency, truncateId } from '../utils/helpers';
import { ArrowLeft, CheckCircle } from 'lucide-react';

export default function OrderTrackingPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const fetchOrder = async () => {
    try {
      const res = await api.get(`/orders/${id}`);
      if (res.data.success) {
        setOrder(res.data.order);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
    const interval = setInterval(fetchOrder, 30000); // Auto-refresh every 30s
    return () => clearInterval(interval);
  }, [id]);

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    setCancelling(true);
    try {
      const res = await api.put(`/orders/${id}/cancel`);
      if (res.data.success) {
        fetchOrder();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-amber-50 flex items-center justify-center"><div className="animate-pulse w-16 h-16 bg-amber-200 rounded-full"></div></div>;
  if (error) return <div className="min-h-screen bg-amber-50 p-8 text-center text-red-600">{error}</div>;
  if (!order) return null;

  const steps = ["Pending", "Accepted", "Preparing", "Out for Delivery", "Delivered"];
  const isCancelled = order.orderStatus === "Cancelled";
  const isRejected = order.orderStatus === "Rejected";
  const currentStepIndex = steps.indexOf(order.orderStatus);

  return (
    <div className="min-h-screen bg-amber-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-6">
          <Link to="/orders" className="inline-flex items-center text-amber-600 hover:text-amber-800 font-medium">
            <ArrowLeft size={16} className="mr-2" /> Back to Orders
          </Link>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-sm border border-amber-100 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-100 pb-6 mb-8 gap-4">
            <div>
              <h1 className="font-playfair text-3xl font-bold text-gray-900 mb-1">Order {truncateId(order._id)}</h1>
              <p className="text-gray-500 text-sm">{formatDate(order.createdAt)}</p>
            </div>
            
            {(order.orderStatus === 'Pending' || order.orderStatus === 'Accepted') && (
              <button 
                onClick={handleCancel}
                disabled={cancelling}
                className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
              >
                {cancelling ? 'Cancelling...' : 'Cancel Order'}
              </button>
            )}
          </div>

          {/* Tracking Stepper */}
          <div className="mb-12">
            <h2 className="font-playfair text-xl font-bold text-gray-900 mb-6">Order Status</h2>
            
            {isCancelled || isRejected ? (
              <div className="bg-red-50 text-red-800 p-4 rounded-xl border border-red-100 font-bold flex items-center gap-3">
                <span className="text-2xl">❌</span> Order {order.orderStatus}
              </div>
            ) : (
              <div className="relative">
                {/* Connecting Line */}
                <div className="absolute left-[15px] top-0 bottom-0 w-0.5 bg-gray-100 md:left-0 md:right-0 md:top-[15px] md:bottom-auto md:h-0.5 md:w-full"></div>
                <div className="absolute left-[15px] top-0 bottom-0 w-0.5 bg-amber-500 transition-all duration-500 md:left-0 md:top-[15px] md:bottom-auto md:h-0.5" 
                     style={{ 
                       height: window.innerWidth < 768 ? `${(Math.max(0, currentStepIndex) / (steps.length - 1)) * 100}%` : '2px',
                       width: window.innerWidth >= 768 ? `${(Math.max(0, currentStepIndex) / (steps.length - 1)) * 100}%` : '2px'
                     }}>
                </div>

                <div className="flex flex-col md:flex-row justify-between gap-6 md:gap-0 relative z-10">
                  {steps.map((step, index) => {
                    const isCompleted = index < currentStepIndex;
                    const isActive = index === currentStepIndex;
                    return (
                      <div key={step} className="flex md:flex-col items-center gap-4 md:gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-4 ${
                          isActive ? 'bg-amber-100 border-amber-600 text-amber-600' :
                          isCompleted ? 'bg-green-500 border-green-500 text-white' :
                          'bg-white border-gray-200 text-transparent'
                        }`}>
                          {isCompleted ? <CheckCircle size={16} /> : <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-amber-600' : 'bg-transparent'}`}></div>}
                        </div>
                        <span className={`text-sm font-bold ${isActive ? 'text-amber-700' : isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                          {step}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Items */}
            <div>
              <h2 className="font-playfair text-xl font-bold text-gray-900 mb-4">Items Ordered</h2>
              <div className="space-y-3">
                {order.products.map(item => (
                  <div key={item._id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{item.title}</p>
                      <p className="text-gray-500 text-xs">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-bold text-gray-900 text-sm">{formatCurrency(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100 text-lg font-bold">
                <span>Total</span>
                <span className="text-amber-700">{formatCurrency(order.totalAmount)}</span>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-6">
              <div>
                <h2 className="font-playfair text-xl font-bold text-gray-900 mb-2">Delivery Address</h2>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-sm text-gray-600 leading-relaxed">
                  <p>{order.address.street}</p>
                  {order.address.landmark && <p>Landmark: {order.address.landmark}</p>}
                  <p>{order.address.city} - {order.address.pincode}</p>
                  <p className="mt-2 font-medium text-gray-900">Phone: {order.address.phone}</p>
                </div>
              </div>

              <div>
                <h2 className="font-playfair text-xl font-bold text-gray-900 mb-2">Payment Info</h2>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-sm text-gray-600">
                  <p className="capitalize">Status: <span className={`font-bold ${order.paymentStatus === 'successful' ? 'text-green-600' : 'text-yellow-600'}`}>{order.paymentStatus}</span></p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
