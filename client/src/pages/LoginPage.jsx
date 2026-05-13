import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await login(email, password);
      if (res.success) {
        toast.success(`Welcome back!`, {
            style: { borderRadius: '1rem', background: '#1C1917', color: '#fff' }
        });
        navigate(from, { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
      toast.error('Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex animate-fadeIn">
      {/* Left Panel: Decorative (Desktop Only) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-dark via-primary to-amber-400 p-20 flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-black/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        
        <Link to="/" className="relative z-10 flex items-center gap-3">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-xl">
             <span className="text-2xl drop-shadow-sm">🍮</span>
          </div>
          <span className="text-4xl font-playfair font-extrabold text-white tracking-tight">Melcho</span>
        </Link>

        <div className="relative z-10 space-y-6">
          <h1 className="text-6xl font-playfair font-extrabold text-white leading-tight">
            Premium desserts, <br />
            delivered with <span className="italic text-primary-light">love.</span>
          </h1>
          <p className="text-xl text-primary-light/80 font-medium max-w-md">
            Sign in to access your favorites and track your sweet deliveries in real-time.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-6">
          <div className="flex -space-x-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-12 h-12 rounded-full border-4 border-white overflow-hidden bg-stone-200">
                <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="user" />
              </div>
            ))}
          </div>
          <p className="text-white font-bold text-sm">Join 5,000+ dessert lovers in Hyderabad</p>
        </div>
      </div>

      {/* Right Panel: Form */}
      <div className="w-full lg:w-1/2 bg-white flex items-center justify-center p-8 sm:p-12 lg:p-24 relative">
        <div className="max-w-md w-full space-y-10">
          {/* Mobile Logo */}
          <Link to="/" className="lg:hidden flex justify-center mb-10">
             <span className="text-5xl">🍮</span>
          </Link>

          <div className="space-y-4">
            {from !== '/' && (
               <div className="bg-primary-light/50 border border-primary/20 p-4 rounded-2xl flex items-center gap-3 text-primary-dark font-bold text-sm">
                  <Sparkles size={20} /> Please sign in to continue to checkout
               </div>
            )}
            <h2 className="text-4xl lg:text-5xl font-playfair font-extrabold text-stone-900">Welcome back</h2>
            <p className="text-stone-500 font-medium text-lg">Sign in to order your favorites</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 p-4 rounded-2xl text-red-600 text-sm font-bold flex items-center gap-3 animate-in fade-in zoom-in duration-300">
               <span className="text-lg">⚠️</span> {error}
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
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">Password</label>
                <Link to="/forgot-password" size="sm" className="text-xs font-bold text-primary hover:underline">Forgot password?</Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-primary transition-colors" size={20} />
                <input 
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-14 pr-14 py-5 bg-stone-50 border border-stone-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 transition-all font-medium text-stone-900"
                  placeholder="••••••••"
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
              className="w-full py-5 bg-stone-900 text-white rounded-2xl font-bold text-sm uppercase tracking-[0.2em] shadow-2xl shadow-stone-900/20 hover:bg-primary transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {loading ? <Loader2 className="animate-spin" /> : 'Sign In'}
            </button>
          </form>

          <div className="pt-8 text-center text-stone-500 font-medium">
            Don't have an account? {' '}
            <Link to="/register" className="text-primary font-bold hover:underline inline-flex items-center gap-1 group">
              Register now <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
