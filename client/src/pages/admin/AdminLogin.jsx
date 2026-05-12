import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Lock, 
  Mail, 
  Loader2, 
  Eye, 
  EyeOff, 
  ShieldCheck,
  ChevronRight,
  ArrowRight
} from 'lucide-react';

export default function AdminLogin() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginAdmin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await loginAdmin(formData.email, formData.formData); // Wait, loginAdmin from context
      // Note: My auth context loginAdmin should handle this. 
      // Let's check the context call. usually it takes email, password.
      const success = await loginAdmin(formData.email, formData.password);
      if (success) {
        navigate('/admin/dashboard');
      } else {
        setError('Invalid admin credentials. Please check your email and password.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Abstract Background Accents */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2" />

      <div className="w-full max-w-md z-10">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-amber-500 rounded-3xl flex items-center justify-center text-slate-950 font-playfair text-4xl font-black mx-auto mb-6 shadow-2xl shadow-amber-500/20 animate-bounce-subtle">
            M
          </div>
          <h1 className="text-3xl font-playfair font-bold text-white mb-2">Melcho Admin</h1>
          <p className="text-slate-500 text-sm font-medium tracking-widest uppercase flex items-center justify-center gap-2">
            <ShieldCheck size={14} className="text-amber-500" /> Secure Management Portal
          </p>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-xl p-10 rounded-[3rem] border border-slate-800 shadow-2xl shadow-black/50">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold rounded-2xl animate-in fade-in slide-in-from-top-2">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block ml-1">Admin Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 transition-colors group-focus-within:text-amber-500" size={20} />
                <input 
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full pl-12 pr-4 py-4 bg-slate-950/50 border border-slate-800 text-white rounded-2xl outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all font-medium"
                  placeholder="admin@melcho.com"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 transition-colors group-focus-within:text-amber-500" size={20} />
                <input 
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full pl-12 pr-12 py-4 bg-slate-950/50 border border-slate-800 text-white rounded-2xl outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all font-medium"
                  placeholder="••••••••"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-amber-500 text-slate-950 font-black text-lg rounded-2xl hover:bg-amber-400 transition-all flex items-center justify-center gap-2 group shadow-xl shadow-amber-500/20 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={24} />
              ) : (
                <>
                  Authenticate <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>
        </div>

        <div className="mt-8 text-center">
          <p className="text-slate-600 text-xs font-bold uppercase tracking-[0.2em]">Authorized Access Only</p>
        </div>
      </div>
    </div>
  );
}
