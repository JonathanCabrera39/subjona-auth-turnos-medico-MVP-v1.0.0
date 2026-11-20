// src/components/admin/ListaTurnosAdmin.tsx
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ListaTurnosAdminProps {
  turnos: any[];
  onGestionar?: (turno: any) => void;
  onCompletar?: (turnoId: number) => void; // 👈 Nueva prop opcional
}

export function ListaTurnosAdmin({ turnos, onGestionar, onCompletar }: ListaTurnosAdminProps) {
  if (turnos.length === 0) {
    return <p className="text-center text-gray-500 py-10">No hay turnos para mostrar en esta vista.</p>;
  }

  return (
    <div className="space-y-3">
      {turnos.map((turno) => (
        <div key={turno.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <span className="font-semibold text-lg">{turno.servicio.nombre}</span>
              
              {/* Badge con el nuevo color 'success' si está confirmado */}
              <Badge variant={
                turno.estado === 'cancelado' ? 'destructive' : 
                turno.estado === 'confirmado' ? 'success' : 
                'default'
              }>
                {turno.estado.toUpperCase()}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>👤 {turno.usuario.nombre} ({turno.usuario.email})</span>
              <span>📅 {new Date(turno.fecha).toLocaleDateString()} a las {turno.hora} hs</span>
            </div>
          </div>
          
          {/* 👇 GRUPO DE BOTONES DE ACCIÓN */}
          <div className="flex items-center gap-2">
            
            {/* Botón COMPLETAR: Solo aparece si está confirmado y nos pasaron la función */}
            {turno.estado === 'confirmado' && onCompletar && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onCompletar(turno.id)}
                className="text-green-600 border-green-600 hover:bg-green-50 hover:text-green-700"
              >
                Completar
              </Button>
            )}

            {/* Botón GESTIONAR: Aparece en pendiente y confirmado (para poder cancelar o cambiar) */}
            {onGestionar && turno.estado !== 'cancelado' && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onGestionar(turno)}
                className="border-blue-600 text-blue-600 hover:bg-blue-50"
              >
                Gestionar
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}