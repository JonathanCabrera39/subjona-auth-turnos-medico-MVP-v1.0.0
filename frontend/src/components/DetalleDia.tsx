// src/components/DetalleDia.tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Clock, DollarSign, XCircle, CheckCircle2 } from 'lucide-react';

interface Turno {
  id: number;
  fecha: string;
  hora: string;
  estado: string;
  notas?: string;
  servicio: {
    nombre: string;
    duracion: number;
    precio: number;
  };
}

interface DetalleDiaProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fecha: Date | null;
  turnos: Turno[];
}

export default function DetalleDia({ open, onOpenChange, fecha, turnos }: DetalleDiaProps) {
  if (!fecha) return null;

  // Filtrar turnos de ese día específico
  const fechaStr = fecha.toISOString().split('T')[0];
  const turnosDelDia = turnos
    .filter((t) => t.fecha.startsWith(fechaStr))
    .sort((a, b) => a.hora.localeCompare(b.hora));

  const formatFecha = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl capitalize">
            {formatFecha(fecha)}
          </DialogTitle>
          <DialogDescription>
            {turnosDelDia.length === 0
              ? null
              : `${turnosDelDia.length} turno(s) programado(s)`}
          </DialogDescription>
        </DialogHeader>

        {turnosDelDia.length > 0 ? (
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {turnosDelDia.map((turno) => {
              const esCancelado = turno.estado === 'cancelado';
              return (
                <div
                  key={turno.id}
                  className={`p-4 rounded-lg border transition-all ${
                    esCancelado
                      ? 'bg-gray-50 border-gray-200 opacity-60'
                      : 'bg-white border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="font-semibold text-lg">
                          {turno.hora} hs
                        </span>
                        <Badge
                          variant={esCancelado ? 'destructive' : 'default'}
                          className={esCancelado ? 'line-through' : ''}
                        >
                          {turno.estado.toUpperCase()}
                        </Badge>
                      </div>

                      <h4
                        className={`text-base font-medium ${
                          esCancelado ? 'line-through text-gray-500' : 'text-gray-900'
                        }`}
                      >
                        {turno.servicio.nombre}
                      </h4>

                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <span>${turno.servicio.precio}</span>
                        </div>
                        <span>•</span>
                        <span>{turno.servicio.duracion} minutos</span>
                      </div>

                      {turno.notas && (
                        <p className="text-sm text-gray-500 italic mt-2">
                          Nota: {turno.notas}
                        </p>
                      )}
                    </div>

                    {esCancelado && (
                      <XCircle className="h-6 w-6 text-red-500 flex-shrink-0" />
                    )}
                    {!esCancelado && (
                      <CheckCircle2 className="h-6 w-6 text-green-500 flex-shrink-0" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          null
          // <div className="text-center py-10 text-gray-500">
          //   <div className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          //   <p>No hay turnos para este día</p>
          // </div>
        )}
      </DialogContent>
    </Dialog>
  );
}