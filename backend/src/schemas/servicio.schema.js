import { z } from 'zod';

// Schema para CREAR (todos los campos obligatorios)
export const crearServicioSchema = z.object({
  nombre: z.string({ required_error: 'El nombre es obligatorio' })
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100),
  duracion: z.number({ required_error: 'La duración es obligatoria' })
    .int('La duración debe ser un número entero')
    .positive('La duración debe ser mayor a 0'),
  precio: z.number({ required_error: 'El precio es obligatorio' })
    .nonnegative('El precio no puede ser negativo'),
});

// Schema para ACTUALIZAR (todos los campos opcionales) ⭐
export const actualizarServicioSchema = crearServicioSchema.partial();

// Schema para validar el ID en params
export const idParamSchema = z.object({
  id: z.coerce.number().int().positive('El ID debe ser un número entero positivo'),
});