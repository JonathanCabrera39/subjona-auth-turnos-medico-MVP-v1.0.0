// src/pages/AdminPage.tsx
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { api } from "@/services/api";
import { useAuthStore } from "@/stores/authStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ServiciosPage from "./ServiciosPage";
import CalendarioTurnos from "@/components/CalendarioTurnos";
import {
  Loader2,
  Users,
  Briefcase,
  Calendar,
  List,
  AlertTriangle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  SelectContent,
  SelectItem,
  Select,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { Textarea } from '@/components/ui/textarea';
import toast from "react-hot-toast";
import { ListaTurnosAdmin } from "@/components/admin/ListaTurnosAdmin";
import { Input } from "@base-ui/react";

type Tab =
  | "usuarios"
  | "servicios"
  | "turnos-lista"
  | "calendario"
  | "vaciar-base";

export function AdminPage() {
  const user = useAuthStore((state) => state.user);
  const [activeTab, setActiveTab] = useState<Tab>("usuarios");
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [turnos, setTurnos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [turnoACancelar, setTurnoACancelar] = useState<number | null>(null);
  // const [delateTurno, setDelateTurno] = useState<false | null>(null);
  const [textoConfirmacion, setTextoConfirmacion] = useState("");
  const PALABRA_CLAVE = "eliminar"; // La palabra que el admin debe escribir
  const PALABRA_CLAVE_D = "delate"; // La palabra que el admin debe escribir
  const [turnoAGestionar, setTurnoAGestionar] = useState<any>(null);
 const [nuevoEstado, setNuevoEstado] = useState<string>('');
  const [motivo, setMotivo] = useState("");

  if (user?.rol !== "admin") {
    return <Navigate to="/profile" replace />;
  }

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const res = await api.get("/auth/usuarios");
        setUsuarios(res.data.usuarios);
      } catch (error) {
        console.error("Error al cargar usuarios");
      }
    };
    fetchUsuarios();
  }, []);

  // Cargar turnos solo cuando se active la pestaña
  const fetchTurnos = async () => {
    setLoading(true);
    try {
      const res = await api.get("/turnos/todos");
      setTurnos(res.data.data);
    } catch (error) {
      console.error("Error al cargar turnos", error);
      toast.error("No se pudieron cargar los turnos");
    } finally {
      setLoading(false); // Esto asegura que el spinner siempre se apague
    }
  };

  useEffect(() => {
    if (
      activeTab === "turnos-lista" ||
      activeTab === "calendario" ||
      activeTab === "vaciar-base"
    ) {
      fetchTurnos();
    }
  }, [activeTab]);

  const tabs = [
    { id: "usuarios" as Tab, label: "Usuarios", icon: Users },
    { id: "servicios" as Tab, label: "Servicios", icon: Briefcase },
    { id: "turnos-lista" as Tab, label: "Turnos", icon: List },
    { id: "calendario" as Tab, label: "Calendario", icon: Calendar },
    { id: "vaciar-base" as Tab, label: "vaciar-turnos", icon: AlertTriangle },
  ];

  const abrirGestionTurno = (turno: any) => {
  setTurnoAGestionar(turno);
  setNuevoEstado(turno.estado);
  setMotivo(turno.motivoAdmin || '');
};

const handleGuardarEstado = async () => {
  if (!turnoAGestionar) return;

  const toastId = toast.loading('Actualizando turno...');
  try {
    await api.patch(`/turnos/${turnoAGestionar.id}/estado`, {
      estado: nuevoEstado,
      motivoAdmin: motivo.trim() || undefined,
    });
    toast.success(`Turno ${nuevoEstado} correctamente`, { id: toastId });
    setTurnoAGestionar(null);
    setMotivo('');
    fetchTurnos();
  } catch (error: any) {
    toast.error(error.response?.data?.message || 'Error al actualizar', { id: toastId });
  }
};
const handleCompletarTurno = async (turnoId: number) => {
  const toastId = toast.loading('Marcando turno como completado...');
  try {
    await api.patch(`/turnos/${turnoId}/estado`, {
      estado: 'completado',
    });
    toast.success('Turno completado exitosamente', { id: toastId });
    fetchTurnos(); // Recargamos la lista para que se actualice el estado
  } catch (error: any) {
    toast.error(error.response?.data?.message || 'Error al completar el turno', { id: toastId });
  }
};
  const handleConfirmarCancelacionAdmin = async () => {
    if (!turnoACancelar) return;

    const toastId = toast.loading("Cancelando turno...");
    try {
      await api.patch(`/turnos/${turnoACancelar}/estado`, {
        estado: "cancelado",
      });
      toast.success("Turno cancelado correctamente", { id: toastId });
      setTurnoACancelar(null);
      fetchTurnos(); // Recargar lista
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al cancelar", {
        id: toastId,
      });
      setTurnoACancelar(null);
    }
  };

  // Dentro de AdminPage.tsx

  // 1. Filtramos los datos según la pestaña activa
  const turnosAMostrar =
    activeTab === "vaciar-base"
      ? turnos.filter((t) => t.estado === "cancelado") // Solo cancelados
      : turnos; // Todos (o los que quieras)

  // ... (tu función handleConfirmarCancelacionAdmin sigue igual para la pestaña normal)

  // 2. Nueva función para la limpieza masiva
  const handleLimpiarBase = async () => {
    const turnosCancelados = turnos.filter((t) => t.estado === "cancelado");
    if (turnosCancelados.length === 0) {
      toast.error("No hay turnos cancelados para eliminar");
      return;
    }

    const toastId = toast.loading("Limpiando base de datos...");
    try {
      const res = await api.delete("/turnos/limpiar-cancelados");
      toast.success(res.data.message, { id: toastId });
      fetchTurnos(); // Recargamos la lista para que se actualice el contador
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al limpiar", {
        id: toastId,
      });
    }
  };
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Panel de Administrador
        </h1>
        <p className="text-gray-600">Gestión completa del sistema</p>
      </div>

      {/* Tabs de navegación */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 font-medium transition-all border-b-2 ${
                activeTab === tab.id
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Contenido de cada tab */}
      {activeTab === "usuarios" && (
        <Card>
          <CardHeader>
            <CardTitle>Usuarios Registrados ({usuarios.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {usuarios.map((u: any) => (
                <li
                  key={u.id}
                  className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50"
                >
                  <div>
                    <p className="font-bold">{u.nombre}</p>
                    <p className="text-sm text-gray-500">
                      {u.email} {u.nickname && `(@${u.nickname})`}
                    </p>
                  </div>
                  <Badge
                    variant={u.rol === "admin" ? "destructive" : "default"}
                  >
                    {u.rol}
                  </Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {activeTab === "servicios" && <ServiciosPage />}

      {activeTab === "turnos-lista" &&
        (loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Turnos ({turnosAMostrar.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Reutilizamos el componente, pasándole la función de cancelar individual */}
              <ListaTurnosAdmin
                turnos={turnosAMostrar}
                onGestionar={abrirGestionTurno}
                 onCompletar={handleCompletarTurno}
              />
            </CardContent>
          </Card>
        ))}

      {activeTab === "vaciar-base" && (
        <Card className="border-red-200">
          <CardHeader className="bg-red-50">
            <CardTitle className="text-red-700 flex items-center gap-2">
              🗑️ Limpieza de Base de Datos
            </CardTitle>
            <p className="text-sm text-red-600">
              Esta acción eliminará permanentemente todos los turnos con estado
              "CANCELADO".
            </p>
          </CardHeader>
          <CardContent className="pt-6">
            {/* Caja de advertencia estilo GitHub */}
            <div className="p-4 bg-red-50 border border-red-200 rounded-md space-y-3">
              <p className="text-sm font-medium text-red-800">
                Para confirmar, escriba{" "}
                <span className="font-bold bg-red-100 px-1 rounded">
                  "{PALABRA_CLAVE} o {PALABRA_CLAVE_D}"
                </span>{" "}
                en el cuadro de abajo:
              </p>

              <Input
                value={textoConfirmacion}
                onChange={(e) => setTextoConfirmacion(e.target.value)}
                placeholder={`Escriba "${PALABRA_CLAVE} o ${PALABRA_CLAVE_D}" aquí...`}
                className="border-red-300 focus-visible:ring-red-500 focus-visible:ring-offset-0"
              />
            </div>

            {/* Botón de acción masiva arriba */}
            <div className="mb-6 flex justify-end">
              <Button
                variant="destructive"
                onClick={handleLimpiarBase}
                disabled={
                  (textoConfirmacion !== PALABRA_CLAVE &&
                    textoConfirmacion !== PALABRA_CLAVE_D) ||
                  turnosAMostrar.length === 0
                }
                className="transition-all"
              >
                {turnosAMostrar.length > 0
                  ? `Eliminar ${turnosAMostrar.length} Turnos Cancelados`
                  : "No hay turnos para eliminar"}
              </Button>
            </div>

            {/* Reutilizamos EL MISMO componente, pero sin la función de cancelar individual */}
            {/* Lista de lo que se va a borrar (Preview) */}
            {turnosAMostrar.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">
                  Turnos que serán eliminados:
                </p>
                <ListaTurnosAdmin turnos={turnosAMostrar} />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "calendario" &&
        (loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <CalendarioTurnos turnos={turnos} showUsuario={true} />
        ))}

    <Dialog open={turnoAGestionar !== null} onOpenChange={(open) => !open && setTurnoAGestionar(null)}>
  <DialogContent className="max-w-md">
    <DialogHeader>
      <DialogTitle>Gestionar Turno</DialogTitle>
    </DialogHeader>

    {turnoAGestionar && (
      <div className="space-y-4 py-4">
        <div className="p-3 bg-gray-50 rounded-lg text-sm">
          <p><strong>Paciente:</strong> {turnoAGestionar.usuario.nombre}</p>
          <p><strong>Servicio:</strong> {turnoAGestionar.servicio.nombre}</p>
          <p><strong>Fecha:</strong> {new Date(turnoAGestionar.fecha).toLocaleDateString()} {turnoAGestionar.hora} hs</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Nuevo Estado</label>
          <Select value={nuevoEstado} onValueChange={(value) => setNuevoEstado(value || '')}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pendiente">Pendiente</SelectItem>
              <SelectItem value="confirmado">Confirmado</SelectItem>
              <SelectItem value="completado">Completado</SelectItem>
              <SelectItem value="cancelado">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">
            {nuevoEstado === 'cancelado' ? 'Motivo de cancelación (Obligatorio)' : 'Nota para el paciente (Opcional)'}
          </label>
          <Textarea
            placeholder={
              nuevoEstado === 'cancelado'
                ? 'Ej: El profesional tuvo una emergencia médica...'
                : 'Ej: Tu turno ha sido aprobado. Te esperamos...'
            }
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            className={nuevoEstado === 'cancelado' ? 'border-red-200' : ''}
          />
        </div>
      </div>
    )}

    <DialogFooter>
      <Button variant="outline" onClick={() => setTurnoAGestionar(null)}>
        Cerrar
      </Button>
      <Button
        onClick={handleGuardarEstado}
        variant={nuevoEstado === 'cancelado' ? 'destructive' : 'default'}
        disabled={nuevoEstado === 'cancelado' && !motivo.trim()}
      >
        Guardar Cambios
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
    </div>
  );
}
