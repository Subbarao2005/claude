import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { formatDate, formatCurrency, getStatusColor, getPaymentStatusColor, truncateId } from '../utils/helpers';
import { Package } from 'lucide-react';

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/orders/my-orders');
        if (res.data.success) {
          setOrders(res.data.orders);
        }
      } catch (err) {
        console.error('Error fetching orders:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  return (
    <div className="min-h-screen bg-amber-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-playfair text-4xl font-bold text-gray-900 mb-8">My Orders</h1>

        {loading ? (
          <div className="space-y-6">
            {[1, 2, 3].map(n => (
              <div key={n} className="bg-white h-40 rounded-2xl animate-pulse border border-amber-100 shadow-sm"></div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-amber-100 shadow-sm text-center">
            <Package size={64} className="mx-auto text-amber-200 mb-4" />
            <h2 className="font-playfair text-2xl font-bold text-gray-900 mb-2">No orders yet</h2>
            <p className="text-gray-500 mb-6">Looks like you haven't ordered any desserts yet.</p>
            <Link to="/menu" className="inline-block px-8 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-full font-bold transition-colors shadow-md shadow-amber-200">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map(order => (
              <div key={order._id} className="bg-white rounded-2xl border border-amber-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex flex-wrap justify-between items-start gap-4 mb-4 border-b border-gray-100 pb-4">
                    <div>
                      <span className="text-sm text-gray-500 font-mono">Order {truncateId(order._id)}</span>
                      <p className="text-sm font-medium text-gray-900 mt-1">{formatDate(order.createdAt)}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(order.orderStatus)}`}>
                        {order.orderStatus}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${getPaymentStatusColor(order.paymentStatus)}`}>
                        Payment: {order.paymentStatus}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex-1 w-full">
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {order.products.map(p => `${p.quantity}x ${p.title}`).join(', ')}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                      <div className="text-left md:text-right">
                        <p className="text-xs text-gray-500">Total Amount</p>
                        <p className="font-bold text-lg text-amber-700">{formatCurrency(order.totalAmount)}</p>
                      </div>
                      <Link 
                        to={`/orders/${order._id}`}
                        className="px-6 py-2 border-2 border-amber-600 text-amber-600 hover:bg-amber-600 hover:text-white rounded-full font-bold text-sm transition-colors whitespace-nowrap"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
