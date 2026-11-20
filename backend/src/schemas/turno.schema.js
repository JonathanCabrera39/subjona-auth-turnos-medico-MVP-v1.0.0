import { z } from 'zod';

export const crearTurnoSchema = z.object({
  fecha: z.string({ required_error: 'La fecha es obligatoria' })
    .refine((val) => !isNaN(Date.parse(val)), {
      message: 'La fecha debe tener un formato válido (YYYY-MM-DD)',
    }),
  hora: z.string({ required_error: 'La hora es obligatoria' })
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
      message: 'La hora debe tener formato HH:MM (ej: 10:00, 14:30)',
    }),
  servicioId: z.coerce.number().int().positive('El servicioId debe ser un número entero positivo'),
  notas: z.string().max(255).optional(),
});

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive('El id debe ser un entero positivo'),
});

export const listarQuerySchema = z.object({
  fecha: z.string().optional(),
  servicioId: z.coerce.number().int().positive().optional(),
});

export const actualizarEstadoSchema = z.object({
  estado: z.enum(['pendiente', 'confirmado', 'cancelado', 'completado'], {
    errorMap: () => ({ message: "Estado no válido" })
  }),
  motivoAdmin: z.string().max(500, "El motivo no puede exceder 500 caracteres").optional(),
});
// ✅ AGREGA ESTO: Schema para que el Admin cambie el estado
// export const actualizarEstadoSchema = z.object({
//   id: z.coerce.number().int().positive("El ID debe ser un número positivo"),
// }).merge(
//   z.object({
//     estado: z.enum(['pendiente', 'confirmado', 'cancelado', 'completado'], {
//       errorMap: () => ({ message: "Estado no válido" })
//     }),
//     motivoAdmin: z.string().max(500, "El motivo no puede exceder 500 caracteres").optional(),
//   })
// );