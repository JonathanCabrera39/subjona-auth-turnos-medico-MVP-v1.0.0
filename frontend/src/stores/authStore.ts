// src/stores/authStore.ts
import { create } from 'zustand'

// Ajusta 'id' a 'number' si usas Prisma, o 'string' si usas MongoDB
interface User { 
  id: number | string; 
  nombre: string; 
  email: string; 
  rol: string; 
}

interface AuthState {
  user: User | null
  token: string | null
  setAuth: (token: string, user: User) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => {
  // 1. Inicialización segura (evita errores si window no está definido)
  const storedToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const storedUser = typeof window !== 'undefined' ? localStorage.getItem('user') : null;

  console.log("🔍 [ZUSTAND INIT] Token encontrado:", storedToken ? "SÍ" : "NO");
  console.log("🔍 [ZUSTAND INIT] User encontrado:", storedUser ? "SÍ" : "NO");

  return {
    token: storedToken,
    user: storedUser ? JSON.parse(storedUser) : null,

    setAuth: (token, user) => {
      console.log("✅ [ZUSTAND SETAUTH] Guardando datos...", { 
        token: token.substring(0, 15) + '...', 
        user 
      });
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      set({ token, user });
    },

    logout: () => {
      console.log("🚪 [ZUSTAND LOGOUT] Limpiando sesión");
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      set({ token: null, user: null });
    },
  }
})