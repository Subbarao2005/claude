import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('melcho_token');
    const storedUser = localStorage.getItem('melcho_user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('melcho_token', res.data.token);
      localStorage.setItem('melcho_user', JSON.stringify(res.data.user));
    }
    return res.data;
  };

  const adminLogin = async (email, password) => {
    const res = await api.post('/auth/admin/login', { email, password });
    if (res.data.success) {
      setToken(res.data.token);
      setUser(res.data.admin); // server returns { admin: ... } based on Phase 1 structure or user object. Let's assume user or admin field.
      // Normalize user/admin
      const userData = res.data.admin || res.data.user;
      localStorage.setItem('melcho_token', res.data.token);
      localStorage.setItem('melcho_user', JSON.stringify(userData));
    }
    return res.data;
  };

  const register = async (name, email, phone, password) => {
    const res = await api.post('/auth/register', { name, email, phone, password });
    // Usually register doesn't auto login unless implemented in backend. Return res directly.
    return res.data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('melcho_token');
    localStorage.removeItem('melcho_user');
    window.location.href = '/';
  };

  const isAuthenticated = !!token;
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, token, loading, login, adminLogin, register, logout, isAuthenticated, isAdmin }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
