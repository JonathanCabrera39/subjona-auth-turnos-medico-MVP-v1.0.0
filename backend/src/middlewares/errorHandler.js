// src/middlewares/errorHandler.js
import { ApiError } from "../utils/ApiError.js";

export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Error interno del servidor";

  // 🧠 Traducir errores de Prisma a mensajes de negocio
  if (err.code === 'P2002') {
    statusCode = 409; // Conflict
    const campo = err.meta?.target?.[0] || 'campo';
    message = `Ya existe un registro con ese ${campo}. Por favor, usa un valor diferente.`;
  }

  if (err.code === 'P2025') {
    statusCode = 404;
    message = 'El recurso que intentas modificar no existe.';
  }

  res.status(statusCode).json({ 
    success: false, 
    message,
    ...(process.env.NODE_ENV === 'development' && { detalles: err.message })
  });
};

export const notFound = (req, res) =>
  res.status(404).json({ success: false, message: "Ruta no encontrada" });