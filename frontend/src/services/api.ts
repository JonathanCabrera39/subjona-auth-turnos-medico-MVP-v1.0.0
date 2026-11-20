// src/services/api.ts
import axios from 'axios';

export const api = axios.create({
  // ✅ Usa la variable de entorno. Si no existe, usa localhost como respaldo.
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
});

// ✅ 1. Interceptor de Request (Tu lógica, perfecta)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ✅ 2. Interceptor de Response (El "plus" de Senior)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si el servidor responde 401 (No autorizado / Token expirado)
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login'; // Redirige al login automáticamente
    }
    return Promise.reject(error);
  }
);