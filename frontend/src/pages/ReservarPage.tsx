// src/pages/ReservarPage.tsx
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';

import { api } from '@/services/api';
import { turnoService } from '@/services/turno.service';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Loader2, Calendar, Clock, CheckCircle2 } from 'lucide-react';

// Schema de validación
const reservarSchema = z.object({
  fecha: z.string().min(1, 'La fecha es obligatoria'),
  hora: z.string().min(1, 'La hora es obligatoria'),
  notas: z.string().max(255).optional(),
});

type ReservarFormValues = z.infer<typeof reservarSchema>;

// Horarios disponibles (puedes hacerlo dinámico después)
const HORARIOS_DISPONIBLES = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
];

export default function ReservarPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const servicioId = Number(searchParams.get('servicioId'));
  const user = useAuthStore((state) => state.user);

  const [servicio, setServicio] = useState<any>(null);
  const [loadingServicio, setLoadingServicio] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<ReservarFormValues>({
    resolver: zodResolver(reservarSchema),
    defaultValues: {
      fecha: '',
      hora: '',
      notas: '',
    },
  });

  // Cargar datos del servicio
  useEffect(() => {
    if (!servicioId) {
      toast.error('No se especificó un servicio');
      navigate('/servicios');
      return;
    }

    const fetchServicio = async () => {
      try {
        const res = await api.get('/servicios');
        const encontrado = res.data.data.find((s: any) => s.id === servicioId);
        if (!encontrado) {
          toast.error('Servicio no encontrado');
          navigate('/servicios');
          return;
        }
        setServicio(encontrado);
      } catch {
        toast.error('Error al cargar el servicio');
        navigate('/servicios');
      } finally {
        setLoadingServicio(false);
      }
    };

    fetchServicio();
  }, [servicioId, navigate]);

  // Calcular fecha mínima (hoy)
  const fechaMinima = new Date().toISOString().split('T')[0];

  const onSubmit = async (data: ReservarFormValues) => {
    if (!user) {
      toast.error('Debes iniciar sesión para reservar');
      navigate('/login');
      return;
    }

    setSubmitting(true);
    const toastId = toast.loading('Reservando turno...');

    try {
      await turnoService.crear({
        fecha: data.fecha,
        hora: data.hora,
        servicioId,
        notas: data.notas,
      });

      // 🔍 DEBUG: Verificar que el token sigue ahí antes de navegar
      const currentToken = useAuthStore.getState().token;
      console.log("✅ [RESERVA] Éxito. Token presente antes de navegar:", !!currentToken);

     // 1. Mostramos el éxito
      toast.success('¡Turno reservado exitosamente!', { id: toastId });
      
      // 2. Pequeña pausa para que el ojo humano alcance a ver el toast verde
      await new Promise(resolve => setTimeout(resolve, 500)); 
      
      // 3. Recién ahora navegamos
      navigate('/mis-turnos'); 
      
    } catch (error: any) {
      console.error("❌ [RESERVA] Error:", error);
      const mensaje = error.response?.data?.message || 'Error al reservar el turno';
      toast.error(mensaje, { id: toastId, duration: 5000 });
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingServicio) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Button 
        variant="ghost" 
        onClick={() => navigate('/servicios')}
        className="mb-4"
      >
        ← Volver a servicios
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Reservar Turno</CardTitle>
          <CardDescription>
            {servicio?.nombre} · {servicio?.duracion} minutos · ${servicio?.precio}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Campo Fecha */}
              <FormField
                control={form.control}
                name="fecha"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Fecha del turno
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        min={fechaMinima}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Campo Hora */}
              <FormField
                control={form.control}
                name="hora"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Horario disponible
                    </FormLabel>
                    <FormControl>
                      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                        {HORARIOS_DISPONIBLES.map((horario) => (
                          <button
                            key={horario}
                            type="button"
                            onClick={() => field.onChange(horario)}
                            className={`py-2 px-3 rounded-lg border text-sm font-medium transition-all ${
                              field.value === horario
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                            }`}
                          >
                            {horario}
                          </button>
                        ))}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Campo Notas (opcional) */}
              <FormField
                control={form.control}
                name="notas"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notas adicionales (opcional)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ej: Primera consulta, alergia a penicilina..." 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Resumen */}
              <div className="bg-gray-50 p-4 rounded-lg border">
                <h4 className="font-semibold mb-2">Resumen de la reserva</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <p><strong>Servicio:</strong> {servicio?.nombre}</p>
                  <p><strong>Duración:</strong> {servicio?.duracion} minutos</p>
                  <p><strong>Precio:</strong> ${servicio?.precio}</p>
                  {form.watch('fecha') && (
                    <p><strong>Fecha:</strong> {form.watch('fecha')}</p>
                  )}
                  {form.watch('hora') && (
                    <p><strong>Hora:</strong> {form.watch('hora')}</p>
                  )}
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={submitting || !form.watch('fecha') || !form.watch('hora')}
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Reservando...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Confirmar Reserva
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}