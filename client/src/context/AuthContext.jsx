import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const getSavedToken = () => {
  try {
    return localStorage.getItem('melcho_token') || null;
  } catch {
    return null;
  }
};

const getSavedUser = () => {
  try {
    const saved = localStorage.getItem('melcho_user');
    return saved ? JSON.parse(saved) : null;
  } catch (err) {
    console.error('User parse error:', err);
    localStorage.removeItem('melcho_user');
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(getSavedToken());
  const [user, setUser] = useState(getSavedUser());
  const [loading, setLoading] = useState(false);

  const isAuthenticated = !!token;
  const isAdmin = user?.role === 'admin';

  const register = async (name, email, phone, password) => {
    try {
      setLoading(true);
      const res = await api.post('/auth/register', { name, email, phone, password });
      if (res.data.success) {
        const { token, user } = res.data;
        setToken(token);
        setUser(user);
        localStorage.setItem('melcho_token', token);
        localStorage.setItem('melcho_user', JSON.stringify(user));
        return { success: true, data: res.data };
      }
      return { success: false, message: res.data.message || 'Registration failed' };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Server error during registration' };
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        const { token, user } = res.data;
        setToken(token);
        setUser(user);
        localStorage.setItem('melcho_token', token);
        localStorage.setItem('melcho_user', JSON.stringify(user));
        return { success: true, data: res.data };
      }
      return { success: false, message: res.data.message || 'Login failed' };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Invalid credentials' };
    } finally {
      setLoading(false);
    }
  };

  const adminLogin = async (email, password) => {
    try {
      setLoading(true);
      const res = await api.post('/auth/admin/login', { email, password });
      const userData = res.data.admin || res.data.user;
      if (res.data.success && userData?.role === 'admin') {
        const { token } = res.data;
        setToken(token);
        setUser(userData);
        localStorage.setItem('melcho_token', token);
        localStorage.setItem('melcho_user', JSON.stringify(userData));
        return { success: true, data: res.data };
      }
      return { success: false, message: 'Access denied. Admins only.' };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Invalid admin credentials' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('melcho_token');
    localStorage.removeItem('melcho_user');
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loading,
        isAuthenticated,
        isAdmin,
        register,
        login,
        adminLogin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
