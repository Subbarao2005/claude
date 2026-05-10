import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axios';
import { formatCurrency, getStatusColor, getPaymentStatusColor, formatDate, truncateId } from '../../utils/helpers';
import { ArrowLeft, MapPin, CreditCard, Clock } from 'lucide-react';

export default function AdminOrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusUpdating, setStatusUpdating] = useState(false);

  const fetchOrderAndPayment = async () => {
    try {
      const [orderRes, paymentRes] = await Promise.allSettled([
        api.get(`/orders/${id}`),
        api.get(`/payment/order/${id}`)
      ]);

      if (orderRes.status === 'fulfilled' && orderRes.value.data.success) {
        setOrder(orderRes.value.data.order);
      }
      
      if (paymentRes.status === 'fulfilled' && paymentRes.value.data.success) {
        setPayment(paymentRes.value.data.payment);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderAndPayment();
  }, [id]);

  const handleStatusUpdate = async (newStatus) => {
    setStatusUpdating(true);
    try {
      const res = await api.put(`/orders/${id}/status`, { status: newStatus });
      if (res.data.success) {
        setOrder(res.data.order);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    } finally {
      setStatusUpdating(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-spin w-12 h-12 border-4 border-gray-300 border-t-gray-900 rounded-full"></div></div>;
  if (!order) return <div className="p-8 text-center text-red-500">Order not found</div>;

  const orderStatuses = ["Pending", "Accepted", "Preparing", "Out for Delivery", "Delivered", "Rejected"];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-6 flex justify-between items-center">
          <Link to="/admin/orders" className="inline-flex items-center text-gray-500 hover:text-gray-900 font-medium transition-colors">
            <ArrowLeft size={16} className="mr-2" /> Back to Orders
          </Link>
          
          {/* Status Updater */}
          <div className="flex items-center gap-3 bg-white p-2 rounded-lg shadow-sm border border-gray-200">
            <span className="text-sm font-medium text-gray-500 ml-2">Update Status:</span>
            <select
              value={order.orderStatus}
              onChange={(e) => handleStatusUpdate(e.target.value)}
              disabled={statusUpdating || order.orderStatus === 'Cancelled'}
              className={`text-sm font-bold rounded-md px-3 py-1.5 outline-none cursor-pointer ${getStatusColor(order.orderStatus)}`}
            >
              {order.orderStatus === 'Cancelled' && <option value="Cancelled">Cancelled</option>}
              {orderStatuses.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            {statusUpdating && <div className="w-4 h-4 border-2 border-amber-600 border-t-transparent rounded-full animate-spin mr-2"></div>}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Col: Order Items & Totals */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <div className="border-b border-gray-100 pb-6 mb-6">
                <h1 className="font-playfair text-2xl font-bold text-gray-900 mb-2">Order {truncateId(order._id)}</h1>
                <div className="flex items-center text-gray-500 text-sm gap-4">
                  <span className="flex items-center gap-1"><Clock size={14} /> {formatDate(order.createdAt)}</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${getPaymentStatusColor(order.paymentStatus)}`}>{order.paymentStatus}</span>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                {order.products.map(item => (
                  <div key={item._id} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                    <div className="flex gap-4 items-center">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center font-bold text-gray-500">
                        {item.quantity}x
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{item.title}</p>
                        <p className="text-sm text-gray-500">{formatCurrency(item.price)} each</p>
                      </div>
                    </div>
                    <p className="font-bold text-gray-900">{formatCurrency(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center pt-6 border-t border-gray-100">
                <span className="text-xl text-gray-500 font-medium">Total Amount</span>
                <span className="text-3xl font-bold text-amber-700">{formatCurrency(order.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Right Col: Customer Info */}
          <div className="space-y-8">
            
            {/* Delivery Info */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <h2 className="font-playfair text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin size={20} className="text-amber-600" /> Delivery Details
              </h2>
              <div className="text-sm text-gray-600 space-y-2 bg-gray-50 p-4 rounded-xl">
                <p className="font-bold text-gray-900">{order.address.phone}</p>
                <p>{order.address.street}</p>
                {order.address.landmark && <p>Landmark: {order.address.landmark}</p>}
                <p>{order.address.city} - {order.address.pincode}</p>
              </div>
            </div>

            {/* Payment Info */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <h2 className="font-playfair text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard size={20} className="text-amber-600" /> Payment Info
              </h2>
              <div className="text-sm text-gray-600 space-y-3 bg-gray-50 p-4 rounded-xl">
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span>Status</span>
                  <span className={`font-bold ${order.paymentStatus === 'successful' ? 'text-green-600' : 'text-red-600'}`}>{order.paymentStatus}</span>
                </div>
                {payment && (
                  <>
                    <div className="flex justify-between border-b border-gray-200 pb-2">
                      <span>Gateway</span>
                      <span className="font-mono text-xs">Razorpay</span>
                    </div>
                    {payment.razorpayPaymentId && (
                      <div className="flex justify-between">
                        <span>Ref ID</span>
                        <span className="font-mono text-xs text-gray-900">{payment.razorpayPaymentId}</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
