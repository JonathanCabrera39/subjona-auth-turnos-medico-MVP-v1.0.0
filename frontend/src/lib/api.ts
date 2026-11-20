// src/lib/api.ts
import axios from 'axios';

// 1. Crear la instancia base
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. Interceptor de Request (Envía el token automáticamente)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); // O usa tu Zustand store: useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 3. Interceptor de Response (Maneja errores globales, ej: token expirado)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Si el token expira o es inválido, limpiar y mandar al login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;