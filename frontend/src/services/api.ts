import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add token to every request
api.interceptors.request.use((config) => {
  const tpsData = localStorage.getItem('tps');
  if (tpsData) {
    const { token } = JSON.parse(tpsData);
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('tps');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default api;