// src/types/servicio.ts
export interface Servicio {
  id: number;
  nombre: string;
  duracion: number; // en minutos
  precio: number;
  createdAt: string;
  updatedAt: string;
}