// src/services/turno.service.ts
import { api } from './api';

export interface CrearTurnoDTO {
  fecha: string;      // "2026-12-20"
  hora: string;       // "10:00"
  servicioId: number;
  notas?: string;
}

export interface Turno {
  id: number;
  fecha: string;
  hora: string;
  estado: 'pendiente' | 'confirmado' | 'cancelado' | 'completado';
  notas?: string;
  servicio: {
    id: number;
    nombre: string;
    duracion: number;
    precio: number;
  };
}

export const turnoService = {
  crear: async (data: CrearTurnoDTO): Promise<Turno> => {
    const response = await api.post('/turnos', data);
    return response.data.data;
  },

  listarMisTurnos: async (): Promise<Turno[]> => {
    const response = await api.get('/turnos/mis-turnos');
    return response.data.data;
  },

  cancelar: async (id: number): Promise<Turno> => {
    const response = await api.patch(`/turnos/${id}/cancelar`);
    return response.data.data;
  },

    listarTurnos: async (): Promise<Turno[]> => {
    const response = await api.get('/turnos/todos');
    return response.data.data;
  },
};