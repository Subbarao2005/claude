import { lazy, Suspense, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Toaster } from 'react-hot-toast';
import { clearCorruptedStorage } from './utils/helpers';

// Components
import Navbar from './components/Navbar';
import CartSidebar from './components/CartSidebar';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

// Pages
import LandingPage from './pages/LandingPage';
import MenuPage from './pages/MenuPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import OrderTrackingPage from './pages/OrderTrackingPage';
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'));
const AdminOrderDetail = lazy(() => import('./pages/admin/AdminOrderDetail'));
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts'));
const AdminCustomers = lazy(() => import('./pages/admin/AdminCustomers'));

clearCorruptedStorage();

export default function App() {
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    fetch('https://melcho-api.onrender.com/health').catch(() => {});
  }, []);

  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Toaster position="top-right" />
          <AppContent isCartOpen={isCartOpen} setIsCartOpen={setIsCartOpen} />
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

function AppContent({ isCartOpen, setIsCartOpen }) {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith('/admin');
  const isAuthPath = ['/login', '/register', '/admin/login'].includes(location.pathname);
  const hideCustomerUI = isAdminPath || isAuthPath;

  return (
    <div className="min-h-screen bg-bg-main">
      {!hideCustomerUI && <Navbar onCartOpen={() => setIsCartOpen(true)} />}
      
      <main className={!hideCustomerUI ? "pt-0" : ""}>
        <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/menu" element={<MenuPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Protected Routes */}
                <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
                <Route path="/order-success" element={<ProtectedRoute><OrderSuccessPage /></ProtectedRoute>} />
                <Route path="/orders" element={<ProtectedRoute><OrderHistoryPage /></ProtectedRoute>} />
                <Route path="/orders/:id" element={<ProtectedRoute><OrderTrackingPage /></ProtectedRoute>} />

                {/* Admin Routes */}
                <Route path="/admin/login" element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><AdminLogin /></Suspense>} />
                <Route path="/admin/dashboard" element={<AdminRoute><Suspense fallback={<div>Loading...</div>}><AdminDashboard /></Suspense></AdminRoute>} />
                <Route path="/admin/orders" element={<AdminRoute><Suspense fallback={<div>Loading...</div>}><AdminOrders /></Suspense></AdminRoute>} />
                <Route path="/admin/orders/:id" element={<AdminRoute><Suspense fallback={<div>Loading...</div>}><AdminOrderDetail /></Suspense></AdminRoute>} />
                <Route path="/admin/products" element={<AdminRoute><Suspense fallback={<div>Loading...</div>}><AdminProducts /></Suspense></AdminRoute>} />
                <Route path="/admin/customers" element={<AdminRoute><Suspense fallback={<div>Loading...</div>}><AdminCustomers /></Suspense></AdminRoute>} />

                {/* Catch All */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
      </main>

      {!hideCustomerUI && <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />}
    </div>
  );
}
