import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

// Run ONCE on app load — clear corrupted values
const cleanStorage = () => {
  const BAD = ['undefined', 'null', '', 'false'];
  ['melcho_token', 'melcho_user'].forEach(key => {
    try {
      const val = localStorage.getItem(key);
      if (val === null) return;
      if (BAD.includes(val)) {
        localStorage.removeItem(key);
      }
    } catch (e) {
      localStorage.removeItem(key);
    }
  });
};
cleanStorage();

const getSavedToken = () => {
  try {
    const t = localStorage.getItem('melcho_token');
    return t && t !== 'undefined' ? t : null;
  } catch { return null; }
};

const getSavedUser = () => {
  try {
    const u = localStorage.getItem('melcho_user');
    if (!u || u === 'undefined' || u === 'null') return null;
    const parsed = JSON.parse(u);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    localStorage.removeItem('melcho_user');
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(getSavedToken());
  const [user, setUser] = useState(getSavedUser());
  const [loading, setLoading] = useState(false);

  const saveAuth = (tokenVal, userData) => {
    const minimalUser = {
      _id: userData._id || userData.id,
      name: userData.name,
      email: userData.email,
      role: userData.role
    };
    localStorage.setItem('melcho_token', tokenVal);
    localStorage.setItem('melcho_user', JSON.stringify(minimalUser));
    setToken(tokenVal);
    setUser(minimalUser);
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        saveAuth(res.data.token, res.data.user);
        return { success: true, data: res.data };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, phone, password) => {
    try {
      setLoading(true);
      const res = await api.post('/auth/register', { name, email, phone, password });
      if (res.data.success) {
        saveAuth(res.data.token, res.data.user);
        return { success: true, data: res.data };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Registration failed' };
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
        saveAuth(res.data.token, userData);
        return { success: true, data: res.data };
      }
      return { success: false, message: 'Access denied. Admins only.' };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Admin login failed' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('melcho_token');
    localStorage.removeItem('melcho_user');
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = !!token;
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ 
      token, user, loading, isAuthenticated, isAdmin, 
      login, register, adminLogin, logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
