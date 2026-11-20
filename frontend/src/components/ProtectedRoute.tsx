// src/components/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  // 1. Leemos SOLO el token. Si hay token, hay sesión válida.
  const token = useAuthStore((state) => state.token);

  // 2. Debugging temporal para ver qué está evaluando
  console.log("🛡️ [PROTECTED ROUTE] Evaluando acceso. Token presente:", !!token);

  // 3. Si NO hay token, expulsamos al login
  if (!token) {
    console.warn("⛔ [PROTECTED ROUTE] Sin token, redirigiendo al login.");
    return <Navigate to="/login" replace />;
  }

  // 4. Si hay token, dejamos pasar al usuario a la página solicitada
  console.log("✅ [PROTECTED ROUTE] Acceso concedido.");
  return <>{children}</>;
}