import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/menu';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await login(email.trim().toLowerCase(), password);
      if (res.success) {
        navigate(from, { replace: true });
      } else {
        setError(res.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex animate-fadeIn">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-dark via-primary to-amber-400 p-20 flex-col justify-between relative overflow-hidden">
        <Link to="/" className="relative z-10 flex items-center gap-3">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-xl">
            <span className="text-2xl">M</span>
          </div>
          <span className="text-4xl font-playfair font-extrabold text-white tracking-tight">Melcho</span>
        </Link>
        <div className="relative z-10 space-y-6">
          <h1 className="text-6xl font-playfair font-extrabold text-white leading-tight">
            Premium desserts,<br />delivered with care.
          </h1>
          <p className="text-xl text-primary-light/80 font-medium max-w-md">
            Sign in to order your favorites and track your deliveries.
          </p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 bg-white flex items-center justify-center p-8 sm:p-12 lg:p-24">
        <div className="max-w-md w-full space-y-10">
          <div className="space-y-4">
            <h2 className="text-4xl lg:text-5xl font-playfair font-extrabold text-stone-900">Welcome back</h2>
            <p className="text-stone-500 font-medium text-lg">Sign in to order your favorites</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 p-4 rounded-2xl text-red-600 text-sm font-bold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-primary transition-colors" size={20} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-14 pr-6 py-5 bg-stone-50 border border-stone-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 transition-all font-medium text-stone-900"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-primary transition-colors" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-14 pr-14 py-5 bg-stone-50 border border-stone-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 transition-all font-medium text-stone-900"
                  placeholder="Password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-stone-300 hover:text-stone-900 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-stone-900 text-white rounded-2xl font-bold text-sm uppercase tracking-[0.2em] shadow-2xl shadow-stone-900/20 hover:bg-primary transition-all active:scale-95 disabled:opacity-60 flex items-center justify-center gap-3"
            >
              {loading ? 'Please wait...' : 'Sign In'}
            </button>
          </form>

          <div className="pt-8 text-center text-stone-500 font-medium">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary font-bold hover:underline inline-flex items-center gap-1 group">
              Register now <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
