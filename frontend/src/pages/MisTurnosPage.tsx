// src/pages/MisTurnosPage.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { turnoService } from "@/services/turno.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Calendar,
  Clock,
  XCircle,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
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
import CalendarioTurnos from "@/components/CalendarioTurnos";

export default function MisTurnosPage() {
  const navigate = useNavigate();
  const [turnos, setTurnos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [vista, setVista] = useState<"lista" | "calendario">("lista");

  //  Estado para controlar el modal de confirmación
  const [turnoACancelar, setTurnoACancelar] = useState<number | null>(null);

  const fetchTurnos = async () => {
    try {
      setLoading(true);
      const data = await turnoService.listarMisTurnos();
      // Ordenar: primero los pendientes, luego por fecha
      const ordenados = data.sort((a, b) => {
        if (a.estado === "completado" && b.estado !== "completado") return -1;
        if (a.estado !== "completado" && b.estado === "completado") return 1;
        if (a.estado === "confirmado" && b.estado !== "confirmado") return -1;
        if (a.estado !== "confirmado" && b.estado === "confirmado") return 1;
        if (a.estado === "pendiente" && b.estado !== "pendiente") return -1;
        if (a.estado !== "pendiente" && b.estado === "pendiente") return 1;
        return new Date(a.fecha).getTime() - new Date(b.fecha).getTime();
      });
      setTurnos(ordenados);
    } catch (error) {
      toast.error("Error al cargar tus turnos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTurnos();
  }, []);

  // 🆕 Abrir el modal (en lugar de window.confirm)
  const handleSolicitarCancelacion = (id: number) => {
    setTurnoACancelar(id);
  };

  // 🆕 Confirmar la cancelación (cuando el usuario hace clic en "Sí, cancelar")
  const handleConfirmarCancelacion = async () => {
    if (!turnoACancelar) return;

    const toastId = toast.loading("Cancelando...");
    try {
      await turnoService.cancelar(turnoACancelar);
      toast.success("Turno cancelado correctamente", { id: toastId });
      setTurnoACancelar(null); // Cerrar modal
      fetchTurnos(); // Recargar la lista
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al cancelar", {
        id: toastId,
      });
      setTurnoACancelar(null);
    }
  };

  // 🆕 Cancelar la acción (cuando el usuario hace clic en "No")
  const handleCancelarAccion = () => {
    setTurnoACancelar(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Mis Turnos</h1>

        <div className="flex gap-2">
          {/* Botones para cambiar de vista */}
          <Button
            variant={vista === "lista" ? "default" : "outline"}
            onClick={() => setVista("lista")}
          >
            Vista Lista
          </Button>
          <Button
            variant={vista === "calendario" ? "default" : "outline"}
            onClick={() => setVista("calendario")}
          >
            Vista Calendario
          </Button>
        </div>

        <Button variant="outline" onClick={() => navigate("/servicios")}>
          ← Reservar otro
        </Button>
      </div>

      {vista === "lista" ? (
        turnos.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-gray-500">
              No tienes turnos reservados. ¡Reserva uno ahora!
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {turnos.map((turno) => (
              <Card
                key={turno.id}
                className={
                  turno.estado === "cancelado" ? "opacity-60" : "bg-amber-100"
                }
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg">
                    {turno.servicio.nombre}
                  </CardTitle>
                  <Badge
                    variant={
                      turno.estado === "pendiente"
                        ? "default"
                        : turno.estado === "confirmado"
                          ? "success"
                          : turno.estado === "completado"
                            ? "complete"
                            : "destructive"
                    }
                  >
                    {turno.estado.toUpperCase()}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(turno.fecha).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {turno.hora} hs
                    </div>
                  </div>

                  {turno.notas && (
                    <p className="text-sm text-gray-500 mb-4 italic">
                      Nota: {turno.notas}
                    </p>
                  )}

                  {turno.estado === "pendiente" && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleSolicitarCancelacion(turno.id)}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Cancelar Turno
                    </Button>
                  )}
                  
                  {turno.motivoAdmin && (
                    <div
                      className={`mt-4 p-3 rounded-md text-sm border flex gap-3 items-start ${
                        turno.estado === "cancelado"
                          ? "bg-red-50 border-red-200 text-red-800"
                          : "bg-green-50 border-green-200 text-green-800"
                      }`}
                    >
                      {/* Ícono según el estado */}
                      {turno.estado === "cancelado" ? (
                        <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                      ) : (
                        <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      )}

                      <div className="flex-1">
                        <p className="font-semibold mb-1">
                          {turno.estado === "cancelado"
                            ? "Motivo de la cancelación:"
                            : "Mensaje de la administración:"}
                        </p>
                        <p className="leading-relaxed">{turno.motivoAdmin}</p>
                      </div>
                    </div>
                  )}
                </CardContent>

              </Card>
            ))}
          </div>
        )
      ) : (
        // ... AQUÍ VA EL NUEVO CALENDARIO ...
        <CalendarioTurnos turnos={turnos} />
      )}

      {/*  MODAL DE CONFIRMACIÓN PERSONALIZADO */}
      <AlertDialog
        open={turnoACancelar !== null}
        onOpenChange={handleCancelarAccion}
      >
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <AlertDialogTitle className="text-xl text-gray-900">
                ¿Cancelar este turno?
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-base text-gray-600">
              Esta acción no se puede deshacer. El horario quedará disponible
              nuevamente para otros pacientes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-5 m-auto">
            <Button
              variant="outline"
              className="text-gray-50"
              onClick={handleCancelarAccion}
            >
              No, mantener turno
            </Button>

            <Button
              variant="destructive"
              onClick={handleConfirmarCancelacion}
              className=" hover:bg-red-700 hover:text-gray-50"
            >
              Sí, cancelar turno
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
