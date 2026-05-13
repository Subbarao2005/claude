import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  ArrowRight, 
  ArrowLeft,
  AlertCircle,
  Loader2,
  Package,
  ShoppingBag,
  Users
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await login(email, password);
      if (res.success && res.user.role === 'admin') {
        toast.success('Admin Authenticated. Welcome to Operations Hub.', {
           icon: '🔐',
           style: { background: '#111827', color: '#fff', borderRadius: '1rem' }
        });
        navigate('/admin/dashboard');
      } else {
        setError('Access denied. Admin credentials required.');
        toast.error('Unauthorized Access');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed');
      toast.error('Invalid Credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6 animate-fadeIn">
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 gap-0 overflow-hidden bg-gray-800 rounded-[3rem] shadow-2xl border border-gray-700/50">
        
        {/* Left Side: Brand Info (Desktop Only) */}
        <div className="hidden lg:flex flex-col justify-between p-20 bg-gradient-to-br from-gray-900 to-gray-800 relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          
          <div className="space-y-4 relative z-10">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                   <span className="text-xl">🍮</span>
                </div>
                <h1 className="text-3xl font-playfair font-extrabold text-white tracking-tight">Melcho Admin</h1>
             </div>
             <p className="text-gray-400 font-medium">Secure Operational Management Portal</p>
          </div>

          <div className="space-y-8 relative z-10">
             {[
               { icon: ShoppingBag, title: 'Manage Orders', desc: 'Real-time transaction & status monitoring' },
               { icon: Package, title: 'Catalog Control', desc: 'Update inventory & visibility instantly' },
               { icon: Users, title: 'User Analytics', desc: 'Track customer loyalty & performance' }
             ].map((item, i) => (
               <div key={i} className="flex items-center gap-6 group">
                  <div className="w-14 h-14 bg-gray-700/50 border border-gray-600 rounded-2xl flex items-center justify-center text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-all duration-500">
                     <item.icon size={24} />
                  </div>
                  <div>
                     <p className="font-bold text-white group-hover:text-amber-500 transition-colors">{item.title}</p>
                     <p className="text-xs text-gray-500 font-medium">{item.desc}</p>
                  </div>
               </div>
             ))}
          </div>

          <div className="pt-10 border-t border-gray-700 relative z-10 flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-widest">
             <ShieldCheck size={14} className="text-amber-500" /> AES-256 Encrypted Operations Hub
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="p-10 sm:p-20 flex flex-col justify-center bg-gray-800 relative">
           <div className="max-w-sm w-full mx-auto space-y-10">
              <div className="space-y-4">
                 <h2 className="text-4xl font-playfair font-extrabold text-white">Security Sign In</h2>
                 <p className="text-gray-400 font-medium">Enter your administrative credentials</p>
              </div>

              {error && (
                 <div className="bg-red-500/10 border border-red-500/20 p-5 rounded-[1.5rem] text-red-500 text-sm font-bold flex items-center gap-4 animate-in fade-in zoom-in duration-300">
                    <AlertCircle size={20} /> {error}
                 </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Admin Email</label>
                    <div className="relative group">
                       <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-amber-500 transition-colors" size={20} />
                       <input 
                         required
                         type="email"
                         value={email}
                         onChange={(e) => setEmail(e.target.value)}
                         className="w-full pl-14 pr-6 py-5 bg-gray-900 border border-gray-700 rounded-2xl outline-none focus:ring-4 focus:ring-amber-500/10 transition-all font-bold text-white placeholder-gray-600"
                         placeholder="admin@melcho.com"
                       />
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Access Token (Password)</label>
                    <div className="relative group">
                       <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-amber-500 transition-colors" size={20} />
                       <input 
                         required
                         type={showPassword ? 'text' : 'password'}
                         value={password}
                         onChange={(e) => setPassword(e.target.value)}
                         className="w-full pl-14 pr-14 py-5 bg-gray-900 border border-gray-700 rounded-2xl outline-none focus:ring-4 focus:ring-amber-500/10 transition-all font-bold text-white placeholder-gray-600"
                         placeholder="••••••••"
                       />
                       <button 
                         type="button"
                         onClick={() => setShowPassword(!showPassword)}
                         className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white transition-all"
                       >
                         {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                       </button>
                    </div>
                 </div>

                 <button 
                   type="submit"
                   disabled={loading}
                   className="w-full py-5 bg-amber-600 text-slate-950 rounded-[1.5rem] font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-amber-600/10 hover:bg-white transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-4 group"
                 >
                   {loading ? <Loader2 className="animate-spin" /> : (
                      <>
                        Authenticate Hub <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                      </>
                   )}
                 </button>
              </form>

              <div className="pt-10 text-center">
                 <Link to="/" className="text-gray-500 hover:text-amber-500 font-bold text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
                    <ArrowLeft size={14} /> Back to Customer Store
                 </Link>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
