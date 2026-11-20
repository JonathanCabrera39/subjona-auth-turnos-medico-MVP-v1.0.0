import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/services/api";
import { useAuthStore } from "@/stores/authStore";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge"; // Si no tienes badge, usa un span o instálalo
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import ServiciosPage from "@/pages/ServiciosPage";
import { Loader2, Calendar, Clock, XCircle, AlertTriangle } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function ProfilePage() {
  const navigate = useNavigate();
  const { token, logout } = useAuthStore(); // Asegúrate de tener 'logout' o 'logout' en tu store
  const [usuario, setUsuario] = useState<any>(null);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await api.get("/auth/me");
        setUsuario(res.data.usuario);
      } catch (error) {
        toast.error("Sesión no válida");
        logout();
        navigate("/login");
      }
    };

    fetchProfile();
  }, [token, navigate, logout]);

  const handleSolicitarCancelacion = () => {
    setIsLogoutOpen(true);
  };

  const handleConfirmarLogout = () => {
    logout();
    setIsLogoutOpen(false); // Limpia el token del store y localStorage
    toast.success("sescion cerrada correctamente");
    navigate("/login");
  };

  // 🆕 Cancelar la acción (cuando el usuario hace clic en "No")
  const handleCancelarAccion = () => {
    setIsLogoutOpen(false);
  };

  if (!usuario)
    return <div className="text-center mt-10">Cargando perfil...</div>;

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle>Mi Perfil</CardTitle>
          <CardDescription>Información de tu cuenta</CardDescription>
        </CardHeader>
        <Button variant="outline" onClick={() => navigate("/mis-turnos")}>
          ← mis turnos
        </Button>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Nombre</p>
            <p className="text-lg font-semibold">{usuario.nombre}</p>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              Nickname
            </p>
            <p className="text-lg font-semibold">{usuario.nickname}</p>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Email</p>
            <p className="text-lg font-semibold">{usuario.email}</p>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Rol</p>
            {/* Ejemplo de uso de cn para cambiar colores según el rol */}
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
                usuario.rol === "admin"
                  ? "bg-red-100 text-red-800"
                  : "bg-blue-100 text-blue-800",
              )}
            >
              {usuario.rol}
            </span>
          </div>

          <Button
            onClick={handleSolicitarCancelacion}
            variant="destructive"
            className="w-full mt-4"
          >
            Cerrar Sesión
          </Button>
        </CardContent>
      </Card>
      <ServiciosPage />
      {/*  MODAL DE CONFIRMACIÓN PERSONALIZADO */}
      <AlertDialog
        open={isLogoutOpen} // 👈 CORREGIDO: usa el booleano
        onOpenChange={handleCancelarAccion}
      >
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <AlertDialogTitle className="text-xl text-gray-900">
                ¿Cerrar sesión? {/* 👈 CORREGIDO: Texto */}
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-base text-gray-600">
              ¿Estás seguro de que deseas cerrar tu sesión actual?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            {" "}
            {/* 👈 gap-2 se ve mejor que gap-5 m-auto */}
            <AlertDialogCancel>
              <Button
                className="text-gray-50"
                variant="outline"
                onClick={handleCancelarAccion}
              >
                No, mantener sesión
              </Button>
            </AlertDialogCancel>
            <AlertDialogAction>
              <Button
                variant="destructive"
                onClick={handleConfirmarLogout} // 👈 CORREGIDO: llama a la función correcta
                className=" hover:bg-red-700 hover:text-gray-50"
              >
                Sí, cerrar sesión
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
