import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

// Request interceptor to attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('melcho_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Response interceptor to handle 401
api.interceptors.response.use((response) => response, (error) => {
  if (error.response && error.response.status === 401) {
    localStorage.removeItem('melcho_token');
    localStorage.removeItem('melcho_user');
    window.location.href = '/login';
  }
  return Promise.reject(error);
});

export default api;
