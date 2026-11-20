// src/services/servicio.service.ts
import { api } from './api'; // Asegúrate de que la ruta a tu api.ts sea correcta
import type { Servicio } from '../types/servicio';

export const servicioService = {
  // Obtener todos los servicios
  getAll: async (): Promise<Servicio[]> => {
    const response = await api.get('/servicios');
    return response.data.data; // Tu backend devuelve { success: true, data: [...] }
  },

  // Crear un servicio (lo usaremos después para el admin)
  create: async (data: Omit<Servicio, 'id' | 'createdAt' | 'updatedAt'>) => {
    const response = await api.post('/servicios', data);
    return response.data.data;
  },

  // Actualizar un servicio
  update: async (id: number, data: Partial<Servicio>) => {
    const response = await api.patch(`/servicios/${id}`, data);
    return response.data.data;
  },

  // Eliminar un servicio
  delete: async (id: number) => {
    const response = await api.delete(`/servicios/${id}`);
    return response.data;
  }
};