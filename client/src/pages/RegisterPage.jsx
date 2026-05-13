import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Phone, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const payload = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      password,
    };

    console.log('Sending register:', payload);

    try {
      const res = await register(payload.name, payload.email, payload.phone, payload.password);
      if (res.success) {
        navigate('/menu');
      } else {
        setError(res.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex animate-fadeIn">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-tr from-stone-900 via-stone-800 to-primary-dark p-20 flex-col justify-between relative overflow-hidden">
        <Link to="/" className="relative z-10 flex items-center gap-3">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-xl">
            <span className="text-2xl">M</span>
          </div>
          <span className="text-4xl font-playfair font-extrabold text-white tracking-tight">Melcho</span>
        </Link>
        <div className="relative z-10 space-y-6">
          <h1 className="text-6xl font-playfair font-extrabold text-white leading-tight">
            Join the <span className="italic text-primary">Sweetest</span><br />Club in Town.
          </h1>
          <p className="text-white/70 text-lg font-medium max-w-md">
            Create an account to order desserts, track deliveries, and keep your favorites close.
          </p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 bg-white flex items-center justify-center p-8 sm:p-12 lg:p-16">
        <div className="max-w-lg w-full space-y-10">
          <div className="space-y-4">
            <h2 className="text-4xl lg:text-5xl font-playfair font-extrabold text-stone-900">Create Account</h2>
            <p className="text-stone-500 font-medium text-lg">Start your sweet journey with us today</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 p-4 rounded-2xl text-red-600 text-sm font-bold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Full Name</label>
              <div className="relative group">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-primary transition-colors" size={20} />
                <input
                  name="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-14 pr-6 py-4 bg-stone-50 border border-stone-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 transition-all font-medium text-stone-900"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-primary transition-colors" size={20} />
                <input
                  name="email"
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-14 pr-6 py-4 bg-stone-50 border border-stone-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 transition-all font-medium text-stone-900"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Phone Number</label>
              <div className="relative group">
                <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-primary transition-colors" size={20} />
                <input
                  name="phone"
                  required
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-14 pr-6 py-4 bg-stone-50 border border-stone-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 transition-all font-medium text-stone-900"
                  placeholder="9876543210"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-primary transition-colors" size={20} />
                <input
                  name="password"
                  required
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                  className="w-full pl-14 pr-14 py-4 bg-stone-50 border border-stone-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 transition-all font-medium text-stone-900"
                  placeholder="Minimum 6 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-stone-300 hover:text-stone-900"
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
              {loading ? 'Please wait...' : 'Create Account'}
            </button>
          </form>

          <div className="text-center text-stone-500 font-medium">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-bold hover:underline inline-flex items-center gap-1 group">
              Sign in <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
