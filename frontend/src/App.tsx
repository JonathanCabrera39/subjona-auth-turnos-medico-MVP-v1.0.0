import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LoginForm } from "./components/LoginForm";
import { RegisterForm } from "./components/RegisterForm";
import { ProfilePage } from "./components/ProfilePage";
import { AdminPage } from "./pages/AdminPage"; // Lo crearemos en el paso 4
import { ProtectedRoute } from "./components/ProtectedRoute";
import ServiciosPage from "./pages/ServiciosPage";
import ReservarPage from "./pages/ReservarPage";
import MisTurnosPage from "./pages/MisTurnosPage";
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <BrowserRouter>
     {/* 👈 2. Colocar el Toaster AQUÍ, fuera de las Routes, para que sea global */}
      <Toaster 
        position="top-right" 
        toastOptions={{
          duration: 4000, // Dura 4 segundos
          style: {
            background: '#333',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: 'green',
              secondary: '#fff',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: 'red',
              secondary: '#fff',
            },
          }
        }}
      />
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />

        {/* Rutas Protegidas */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminPage />
            </ProtectedRoute>
          }
        />
        <Route path="/servicios" element={<ServiciosPage />} />
        <Route
          path="/reservar"
          element={
            <ProtectedRoute>
              <ReservarPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mis-turnos"
          element={
            <ProtectedRoute>
              <MisTurnosPage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
