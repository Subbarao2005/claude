import { CreditCard, Smartphone, Shield } from 'lucide-react';

export default function TestPaymentInfo() {
  // Only show in development or with ?test=true
  const isTestMode = import.meta.env.DEV || window.location.search.includes('test=true');

  if (!isTestMode) return null;

  return (
    <div className="mt-10 p-6 bg-amber-50 rounded-3xl border border-amber-100 animate-pulse-slow">
      <div className="flex items-center gap-2 text-amber-700 font-bold mb-4">
        <Shield size={18} /> Test Mode Payment Details
      </div>
      
      <div className="space-y-4 text-sm">
        <div className="flex gap-3">
          <CreditCard className="text-amber-500 shrink-0" size={18} />
          <div>
            <p className="font-bold text-amber-800">Card Payment</p>
            <p className="text-amber-700/80">Number: <code className="bg-white px-1 rounded">4111 1111 1111 1111</code></p>
            <p className="text-amber-700/80">Expiry: <code className="bg-white px-1 rounded">12/28</code> | CVV: <code className="bg-white px-1 rounded">123</code></p>
          </div>
        </div>

        <div className="flex gap-3">
          <Smartphone className="text-amber-500 shrink-0" size={18} />
          <div>
            <p className="font-bold text-amber-800">UPI / Others</p>
            <p className="text-amber-700/80">UPI ID: <code className="bg-white px-1 rounded">success@razorpay</code></p>
            <p className="text-amber-700/80">OTP: <code className="bg-white px-1 rounded">1234</code></p>
          </div>
        </div>
      </div>
    </div>
  );
}
