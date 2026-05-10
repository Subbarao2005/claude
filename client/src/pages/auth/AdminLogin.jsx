import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginAdmin } from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm]     = useState({ email: '', password: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await loginAdmin({ email: form.email.trim(), password: form.password });
      login(res.data.data.token, res.data.data.admin);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Admin login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">MELCHO</div>
        <div style={{ background: 'rgba(200,169,110,.1)', border: '1px solid rgba(200,169,110,.3)', borderRadius: '8px', padding: '8px 16px', textAlign: 'center', marginBottom: '20px', fontSize: '12px', color: '#c8a96e', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>
          🔐 Admin Portal
        </div>
        <h1 className="auth-title">Admin Login</h1>
        <p className="auth-subtitle">Restricted access — authorized personnel only</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Admin Email</label>
            <input name="email" type="email" placeholder="admin@melcho.com" value={form.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input name="password" type="password" placeholder="Admin password" value={form.password} onChange={handleChange} required />
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Authenticating…' : 'Login as Admin →'}
          </button>
        </form>

        <p className="auth-switch">
          Not an admin? <Link to="/login">Customer Login</Link>
        </p>
      </div>
    </div>
  );
}
