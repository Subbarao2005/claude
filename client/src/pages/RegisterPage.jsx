import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Phone, Eye, EyeOff, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0); // 0-4

  const { register } = useAuth();
  const navigate = useNavigate();

  const validate = (name, value) => {
    let error = '';
    if (name === 'name' && value.length < 2) error = 'Name must be at least 2 chars';
    if (name === 'email' && !/\S+@\S+\.\S+/.test(value)) error = 'Invalid email format';
    if (name === 'phone' && !/^\d{10}$/.test(value)) error = 'Enter 10-digit mobile number';
    if (name === 'password' && value.length < 8) error = 'Min 8 characters required';
    if (name === 'confirmPassword' && value !== formData.password) error = 'Passwords do not match';
    return error;
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const error = validate(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'password') {
      let strength = 0;
      if (value.length >= 8) strength++;
      if (/[A-Z]/.test(value)) strength++;
      if (/[0-9]/.test(value)) strength++;
      if (/[^A-Za-z0-9]/.test(value)) strength++;
      setPasswordStrength(strength);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Final validation check
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const err = validate(key, formData[key]);
      if (err) newErrors[key] = err;
    });
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Please fix the errors in the form');
      return;
    }

    setLoading(true);
    try {
      const res = await register(formData.name, formData.email, formData.phone, formData.password);
      if (res.success) {
        toast.success('Account created! Welcome to Melcho.', { duration: 5000 });
        navigate('/');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex animate-fadeIn">
      {/* Left Panel: Decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-tr from-stone-900 via-stone-800 to-primary-dark p-20 flex-col justify-between relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        
        <Link to="/" className="relative z-10 flex items-center gap-3">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-xl">
             <span className="text-2xl">🍮</span>
          </div>
          <span className="text-4xl font-playfair font-extrabold text-white tracking-tight">Melcho</span>
        </Link>

        <div className="relative z-10 space-y-6">
          <h1 className="text-6xl font-playfair font-extrabold text-white leading-tight">
            Join the <span className="italic text-primary">Sweetest</span> <br />Club in Town.
          </h1>
          <ul className="space-y-4 pt-6">
            {['Track orders live', 'Exclusive member offers', 'Fast 30-min delivery'].map(text => (
              <li key={text} className="flex items-center gap-3 text-primary-light font-bold text-lg">
                <CheckCircle2 size={24} className="text-primary" /> {text}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative z-10 p-8 bg-white/5 backdrop-blur-md rounded-[2.5rem] border border-white/10">
          <p className="text-white/60 font-bold text-xs uppercase tracking-widest mb-4">Top Choice Today</p>
          <div className="flex items-center gap-4">
             <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-4xl">🥐</div>
             <div>
               <p className="text-xl font-bold text-white">Ferrero Croissant</p>
               <p className="text-primary font-bold">Recommended</p>
             </div>
          </div>
        </div>
      </div>

      {/* Right Panel: Form */}
      <div className="w-full lg:w-1/2 bg-white flex items-center justify-center p-8 sm:p-12 lg:p-16 relative">
        <div className="max-w-lg w-full space-y-10">
          <div className="space-y-4">
            <h2 className="text-4xl lg:text-5xl font-playfair font-extrabold text-stone-900">Create Account</h2>
            <p className="text-stone-500 font-medium text-lg">Start your sweet journey with us today</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Full Name</label>
                <div className="relative group">
                  <User className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors ${errors.name ? 'text-red-400' : 'text-stone-300 group-focus-within:text-primary'}`} size={20} />
                  <input 
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full pl-14 pr-6 py-4 bg-stone-50 border rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 transition-all font-medium text-stone-900 ${errors.name ? 'border-red-400' : 'border-stone-100'}`}
                    placeholder="John Doe"
                  />
                </div>
                {errors.name && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Phone Number</label>
                <div className="relative group">
                  <Phone className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors ${errors.phone ? 'text-red-400' : 'text-stone-300 group-focus-within:text-primary'}`} size={20} />
                  <input 
                    name="phone"
                    required
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full pl-14 pr-6 py-4 bg-stone-50 border rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 transition-all font-medium text-stone-900 ${errors.phone ? 'border-red-400' : 'border-stone-100'}`}
                    placeholder="9876543210"
                  />
                </div>
                {errors.phone && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.phone}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative group">
                <Mail className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors ${errors.email ? 'text-red-400' : 'text-stone-300 group-focus-within:text-primary'}`} size={20} />
                <input 
                  name="email"
                  required
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full pl-14 pr-6 py-4 bg-stone-50 border rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 transition-all font-medium text-stone-900 ${errors.email ? 'border-red-400' : 'border-stone-100'}`}
                  placeholder="name@example.com"
                />
              </div>
              {errors.email && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Password</label>
              <div className="relative group">
                <Lock className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors ${errors.password ? 'text-red-400' : 'text-stone-300 group-focus-within:text-primary'}`} size={20} />
                <input 
                  name="password"
                  required
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full pl-14 pr-14 py-4 bg-stone-50 border rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 transition-all font-medium text-stone-900 ${errors.password ? 'border-red-400' : 'border-stone-100'}`}
                  placeholder="••••••••"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-stone-300 hover:text-stone-900"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {/* Strength Indicator */}
              {formData.password && (
                 <div className="flex gap-1 pt-1 px-1">
                    {[1, 2, 3, 4].map(i => (
                       <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                          i <= passwordStrength 
                             ? (passwordStrength <= 1 ? 'bg-red-500' : passwordStrength <= 2 ? 'bg-orange-500' : 'bg-emerald-500') 
                             : 'bg-stone-100'
                       }`} />
                    ))}
                 </div>
              )}
              {errors.password && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.password}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Confirm Password</label>
              <div className="relative group">
                <Lock className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors ${errors.confirmPassword ? 'text-red-400' : 'text-stone-300 group-focus-within:text-primary'}`} size={20} />
                <input 
                  name="confirmPassword"
                  required
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full pl-14 pr-6 py-4 bg-stone-50 border rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 transition-all font-medium text-stone-900 ${errors.confirmPassword ? 'border-red-400' : 'border-stone-100'}`}
                  placeholder="••••••••"
                />
              </div>
              {errors.confirmPassword && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.confirmPassword}</p>}
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-stone-900 text-white rounded-2xl font-bold text-sm uppercase tracking-[0.2em] shadow-2xl shadow-stone-900/20 hover:bg-primary transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {loading ? <Loader2 className="animate-spin" /> : 'Create Account'}
            </button>
          </form>

          <div className="text-center text-stone-500 font-medium">
            Already have an account? {' '}
            <Link to="/login" className="text-primary font-bold hover:underline inline-flex items-center gap-1 group">
              Sign in <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
