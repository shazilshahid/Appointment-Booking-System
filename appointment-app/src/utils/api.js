import axios from 'axios';

const API_BASE = 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: API_BASE,
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  console.log('Token from localStorage:', token);  // Debug log
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('Added Authorization header:', config.headers.Authorization);  // Debug log
  }
  return config;
});

export default api;