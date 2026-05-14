import { useState, useEffect } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import { MapPin, Phone, Lock, ShoppingBag,
  ArrowRight, Home, Navigation,
  User, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

// Check if Razorpay is available
const isRazorpayLoaded = () => {
  return typeof window !== 'undefined' && 
         typeof window.Razorpay === 'function'
}

// Wait for Razorpay to load (max 10 seconds)
const waitForRazorpay = () => {
  return new Promise((resolve, reject) => {
    // Already loaded
    if (isRazorpayLoaded()) {
      resolve(true)
      return
    }

    // Wait up to 10 seconds
    let attempts = 0
    const maxAttempts = 100 // 100 * 100ms = 10 seconds

    const check = setInterval(() => {
      attempts++
      if (isRazorpayLoaded()) {
        clearInterval(check)
        resolve(true)
        return
      }
      if (attempts >= maxAttempts) {
        clearInterval(check)
        reject(new Error(
          'Razorpay is taking too long to load. ' +
          'Please check your internet connection and refresh.'
        ))
      }
    }, 100)
  })
}

// Load Razorpay script dynamically as fallback
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    // Already loaded
    if (isRazorpayLoaded()) {
      resolve(true)
      return
    }

    // Check if script tag already exists
    const existingScript = document.querySelector(
      'script[src*="razorpay"]'
    )
    
    if (existingScript) {
      // Script tag exists but not loaded yet — wait
      existingScript.onload = () => resolve(true)
      existingScript.onerror = () => resolve(false)
      return
    }

    // Create new script tag
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = false // sync load
    script.onload = () => {
      console.log('Razorpay script loaded successfully')
      resolve(true)
    }
    script.onerror = () => {
      console.error('Failed to load Razorpay script')
      resolve(false)
    }
    document.head.appendChild(script)
  })
}

export default function CheckoutPage() {
  const { items, cartTotal, clearCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [address, setAddress] = useState({
    name: '',
    street: '',
    city: '',
    pincode: '',
    phone: '',
    landmark: ''
  })
  const [errors, setErrors] = useState({})
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [razorpayReady, setRazorpayReady] = useState(false)

  useEffect(() => {
    // Pre-fill user data
    if (user) {
      setAddress(prev => ({
        ...prev,
        name: user.name || '',
        phone: user.phone || ''
      }))
    }

    // Check and load Razorpay
    const initRazorpay = async () => {
      try {
        if (isRazorpayLoaded()) {
          setRazorpayReady(true)
          return
        }
        
        const loaded = await loadRazorpayScript()
        if (loaded) {
          // Wait a moment for Razorpay to initialize
          setTimeout(() => {
            setRazorpayReady(isRazorpayLoaded())
          }, 500)
        } else {
          setRazorpayReady(false)
        }
      } catch (err) {
        console.error('Razorpay init error:', err)
        setRazorpayReady(false)
      }
    }

    initRazorpay()
  }, [user])

  const validateForm = () => {
    const newErrors = {}

    if (!address.name.trim() || address.name.trim().length < 2)
      newErrors.name = 'Full name is required (min 2 chars)'

    if (!address.street.trim() || address.street.trim().length < 5)
      newErrors.street = 'Street address is required (min 5 chars)'

    if (!address.city.trim() || address.city.trim().length < 2)
      newErrors.city = 'City is required'

    if (!/^\d{6}$/.test(address.pincode))
      newErrors.pincode = 'Enter valid 6-digit pincode'

    if (!/^\d{10}$/.test(address.phone))
      newErrors.phone = 'Enter valid 10-digit phone number'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handlePayment = async () => {
    // Validate form first
    if (!validateForm()) {
      toast.error('Please fill all required fields correctly')
      return
    }

    if (!items || items.length === 0) {
      toast.error('Your cart is empty')
      return
    }

    setPaymentLoading(true)

    try {
      // Step 1: Ensure Razorpay is loaded
      if (!isRazorpayLoaded()) {
        toast.loading('Loading payment gateway...')
        const loaded = await loadRazorpayScript()
        
        if (!loaded || !isRazorpayLoaded()) {
          toast.dismiss()
          toast.error(
            'Payment gateway failed to load. ' +
            'Please disable ad blocker and refresh.',
            { duration: 6000 }
          )
          setPaymentLoading(false)
          return
        }
        toast.dismiss()
      }

      // Step 2: Create order in our database
      toast.loading('Creating your order...')
      
      const orderPayload = {
        products: items
          .filter(item => item && item.product)
          .map(item => ({
            productId: item.product._id,
            title: item.product.title,
            price: item.product.price,
            quantity: item.quantity
          })),
        totalAmount: cartTotal,
        address: {
          street: `${address.name}, ${address.street}`,
          city: address.city,
          pincode: address.pincode,
          phone: address.phone,
          landmark: address.landmark || ''
        }
      }

      const orderRes = await api.post('/orders', orderPayload)
      toast.dismiss()

      if (!orderRes.data.success) {
        throw new Error(
          orderRes.data.message || 'Failed to create order'
        )
      }

      const dbOrderId = orderRes.data.order._id
      
      // Step 3: Create Razorpay order
      toast.loading('Initializing payment...')
      
      const razorpayRes = await api.post(
        '/payment/create-order',
        { amount: cartTotal, orderId: dbOrderId }
      )
      toast.dismiss()

      if (!razorpayRes.data.success) {
        throw new Error(
          razorpayRes.data.message || 
          'Failed to initialize payment'
        )
      }

      const { razorpayOrderId, amount, currency, keyId } = 
        razorpayRes.data

      // Step 4: Open Razorpay modal
      const options = {
        key: keyId || import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: amount,
        currency: currency || 'INR',
        name: 'Melcho',
        description: 'Premium Dessert Order',
        image: '/favicon.svg',
        order_id: razorpayOrderId,
        prefill: {
          name: user?.name || address.name,
          email: user?.email || '',
          contact: address.phone
        },
        notes: {
          orderId: dbOrderId,
          address: address.street
        },
        theme: {
          color: '#D97706'
        },
        handler: async (response) => {
          // Step 5: Verify payment
          try {
            toast.loading('Verifying payment...')
            
            const verifyRes = await api.post(
              '/payment/verify',
              {
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                orderId: dbOrderId
              }
            )
            toast.dismiss()

            if (verifyRes.data.success) {
              clearCart()
              toast.success('Payment successful! 🎉')
              navigate('/order-success', {
                state: {
                  orderId: dbOrderId,
                  amount: cartTotal
                }
              })
            } else {
              toast.error(
                'Payment verification failed. ' +
                'Contact support if money was deducted.',
                { duration: 8000 }
              )
            }
          } catch (verifyErr) {
            toast.dismiss()
            console.error('Verify error:', verifyErr)
            toast.error(
              `Payment done but verification failed. ` +
              `Order ID: ${dbOrderId.slice(-8)}. ` +
              `Please contact support.`,
              { duration: 10000 }
            )
          }
          setPaymentLoading(false)
        },
        modal: {
          ondismiss: () => {
            toast('Payment cancelled', { icon: 'ℹ️' })
            setPaymentLoading(false)
          },
          confirm_close: true,
          escape: false
        }
      }

      // Double-check Razorpay is still available
      if (typeof window.Razorpay !== 'function') {
        throw new Error(
          'Razorpay is not available. ' +
          'Please disable ad blocker and refresh.'
        )
      }

      const razorpayInstance = new window.Razorpay(options)

      razorpayInstance.on('payment.failed', (response) => {
        console.error('Payment failed:', response.error)
        toast.error(
          `Payment failed: ${response.error.description}`,
          { duration: 6000 }
        )
        setPaymentLoading(false)
      })

      razorpayInstance.open()

    } catch (err) {
      toast.dismiss()
      console.error('Payment error:', err)
      toast.error(
        err.message || 'Payment failed. Please try again.',
        { duration: 6000 }
      )
      setPaymentLoading(false)
    }
  }

  if (!items || items.length === 0) {
    return <Navigate to="/menu" />
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-playfair font-extrabold text-stone-900 mb-8">Checkout</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Address form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-[2.5rem] p-8 border border-stone-100 shadow-sm space-y-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
                  <MapPin size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-stone-900">Delivery Details</h2>
                  <p className="text-sm text-stone-500">Enter your shipping address</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Full Name</label>
                  <input
                    type="text"
                    value={address.name}
                    onChange={(e) => setAddress({...address, name: e.target.value})}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
                    placeholder="Enter full name"
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Street Address</label>
                  <input
                    type="text"
                    value={address.street}
                    onChange={(e) => setAddress({...address, street: e.target.value})}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
                    placeholder="House/Flat No, Street Name"
                  />
                  {errors.street && <p className="text-red-500 text-xs mt-1">{errors.street}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">City</label>
                  <input
                    type="text"
                    value={address.city}
                    onChange={(e) => setAddress({...address, city: e.target.value})}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
                    placeholder="City"
                  />
                  {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Pincode</label>
                  <input
                    type="text"
                    value={address.pincode}
                    onChange={(e) => setAddress({...address, pincode: e.target.value})}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
                    placeholder="6-digit Pincode"
                    maxLength={6}
                  />
                  {errors.pincode && <p className="text-red-500 text-xs mt-1">{errors.pincode}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Phone</label>
                  <input
                    type="text"
                    value={address.phone}
                    onChange={(e) => setAddress({...address, phone: e.target.value})}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
                    placeholder="10-digit Phone"
                    maxLength={10}
                  />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Landmark (Optional)</label>
                  <input
                    type="text"
                    value={address.landmark}
                    onChange={(e) => setAddress({...address, landmark: e.target.value})}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
                    placeholder="Near park, etc."
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Right: Order summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="bg-white rounded-[2.5rem] p-8 border border-stone-100 shadow-xl space-y-6">
                <h3 className="text-xl font-bold text-stone-900 border-b border-stone-100 pb-4">Order Summary</h3>
                
                <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                  {items.filter(i => i && i.product).map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-stone-100 rounded-lg overflow-hidden">
                          {item.product.image ? (
                            <img src={item.product.image} alt={item.product.title} className="w-full h-full object-cover" />
                          ) : (
                            <ShoppingBag className="w-full h-full p-2 text-stone-400" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-stone-800">{item.product.title}</p>
                          <p className="text-xs text-stone-500">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <span className="font-bold text-sm">₹{(item.product.price * item.quantity).toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>
                
                <div className="border-t border-stone-100 pt-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-stone-500">Subtotal</span>
                    <span className="font-bold">₹{cartTotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-stone-500">Delivery</span>
                    <span className="font-bold text-green-600">Free</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t border-stone-100 pt-3">
                    <span>Total</span>
                    <span className="text-amber-600">₹{cartTotal.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="pt-4">
                  {!razorpayReady && (
                    <div className="flex items-center gap-2 text-amber-600 text-sm mb-3 p-3 bg-amber-50 rounded-lg">
                      <div className="animate-spin h-4 w-4 border-2 border-amber-600 border-t-transparent rounded-full"></div>
                      <span>Loading payment gateway...</span>
                    </div>
                  )}

                  {razorpayReady && (
                    <div className="flex items-center gap-2 text-green-600 text-sm mb-3">
                      <CheckCircle size={14} />
                      <span>Payment gateway ready</span>
                    </div>
                  )}

                  <button
                    onClick={handlePayment}
                    disabled={paymentLoading || items.length === 0 || !razorpayReady}
                    className="w-full py-4 bg-amber-600 text-white rounded-xl font-semibold text-lg hover:bg-amber-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    {paymentLoading ? (
                      <>
                        <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Lock size={18} />
                        Pay ₹{cartTotal.toLocaleString('en-IN')}
                      </>
                    )}
                  </button>

                  <p className="text-center text-xs text-stone-400 mt-3">
                    🔒 100% Secure payment via Razorpay
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
