// src/pages/ServiciosPage.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";

import { api } from "@/services/api";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Clock, DollarSign, Loader2, Pencil, Trash2, Plus } from "lucide-react";

// 1. Esquema de validación con Zod
const servicioSchema = z.object({
  nombre: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  duracion: z.coerce.number().int().positive("Debe ser un número positivo"),
  precio: z.coerce.number().nonnegative("El precio no puede ser negativo"),
});

type ServicioFormValues = z.infer<typeof servicioSchema>;

interface Servicio {
  id: number;
  nombre: string;
  duracion: number;
  precio: number;
  createdAt: string;
  updatedAt: string;
}

export default function ServiciosPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.rol === "admin";

  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estados del Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [servicioEnEdicion, setServicioEnEdicion] = useState<Servicio | null>(null);

  // 2. Configuración del Formulario
  const form = useForm<ServicioFormValues>({
    resolver: zodResolver(servicioSchema),
    defaultValues: {
      nombre: "",
      duracion: 30,
      precio: 0,
    },
  });

  // 3. Cargar servicios al montar
  const fetchServicios = async () => {
    try {
      setLoading(true);
      const res = await api.get("/servicios");
      setServicios(res.data.data);
    } catch (error) {
      toast.error("Error al cargar los servicios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServicios();
  }, []);

  // 4. Manejar envío del formulario (Crear o Editar)
  const onSubmit = async (data: ServicioFormValues) => {
    const toastId = toast.loading(servicioEnEdicion ? "Actualizando..." : "Creando...");

    try {
      if (servicioEnEdicion) {
        await api.patch(`/servicios/${servicioEnEdicion.id}`, data);
        toast.success("Servicio actualizado correctamente", { id: toastId });
      } else {
        await api.post("/servicios", data);
        toast.success("Servicio creado correctamente", { id: toastId });
      }
      
      setIsModalOpen(false);
      setServicioEnEdicion(null);
      form.reset();
      fetchServicios(); // Recargar lista
    } catch (error: any) {
      const mensaje = error.response?.data?.message || "Error al guardar el servicio";
      toast.error(mensaje, { id: toastId });
    }
  };

  // 5. Abrir modal para editar
  const handleEditar = (servicio: Servicio) => {
    setServicioEnEdicion(servicio);
    form.reset({
      nombre: servicio.nombre,
      duracion: servicio.duracion,
      precio: servicio.precio,
    });
    setIsModalOpen(true);
  };

  // 6. Abrir modal para crear (limpio)
  const handleCrear = () => {
    setServicioEnEdicion(null);
    form.reset({ nombre: "", duracion: 30, precio: 0 });
    setIsModalOpen(true);
  };

  // 7. Eliminar servicio
  const handleEliminar = async (id: number, nombre: string) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar "${nombre}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    const toastId = toast.loading("Eliminando...");
    try {
      await api.delete(`/servicios/${id}`);
      toast.success("Servicio eliminado correctamente", { id: toastId });
      fetchServicios();
    } catch (error) {
      toast.error("Error al eliminar el servicio", { id: toastId });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Cargando servicios...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Nuestros Servicios</h1>
        
        <div className="flex gap-2">
          {isAdmin && (
            <Button onClick={handleCrear}>
              <Plus className="mr-2 h-4 w-4" /> Nuevo Servicio
            </Button>
          )}
          {!isAdmin && (
            <Button variant="outline" onClick={() => navigate("/profile")}>
              Volver a mi Perfil
            </Button>
          )}
        </div>
      </div>

      {servicios.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-gray-500">
            No hay servicios disponibles en este momento.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {servicios.map((servicio) => (
            <Card key={servicio.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-xl">{servicio.nombre}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center text-gray-600">
                  <Clock className="h-5 w-5 mr-2 text-blue-500" />
                  <span>{servicio.duracion} minutos</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <DollarSign className="h-5 w-5 mr-2 text-green-500" />
                  <span className="text-lg font-bold text-gray-900">
                    ${servicio.precio.toFixed(2)}
                  </span>
                </div>

                <div className="pt-4 flex flex-col gap-2">
                  <Button 
                    className="w-full" 
                    onClick={() => {
                      if (!user) {
                        toast.error("Debes iniciar sesión para reservar");
                        navigate("/login");
                      } else {
                        navigate(`/reservar?servicioId=${servicio.id}`);
                      }
                    }}
                  >
                    Reservar Turno
                  </Button>

                  {isAdmin && (
                    <div className="flex gap-2 mt-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleEditar(servicio)}
                      >
                        <Pencil className="h-4 w-4 mr-1" /> Editar
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleEliminar(servicio.id, servicio.nombre)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" /> Eliminar
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* MODAL DE CREAR / EDITAR */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {servicioEnEdicion ? "Editar Servicio" : "Crear Nuevo Servicio"}
            </DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="nombre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del Servicio</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Consulta General" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="duracion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duración (minutos)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="30" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="precio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Precio ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="50.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? "Guardando..." : "Guardar"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}