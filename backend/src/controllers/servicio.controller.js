// src/controllers/servicio.controller.js
import prisma from "../lib/prisma.js";
import { asyncHandler } from "../utils/asyncHandler.js"; // <-- 1. Importamos el escudo
import { ApiError } from "../utils/ApiError.js"; // <-- 2. Importamos la clase de error (por si la necesitamos lanzar manualmente)


export const listarServicios = asyncHandler(async (req, res) => {
  const servicios = await prisma.servicio.findMany({
    orderBy: { nombre: "asc" },
  });
  res.json({ success: true, data: servicios });
});

export const crearServicio = asyncHandler(async (req, res) => {
  // Si Prisma falla (ej: nombre duplicado), asyncHandler lo atrapa y lo manda al errorHandler
  const servicio = await prisma.servicio.create({ data: req.body });
  res.status(201).json({ success: true, data: servicio });
});

export const actualizarServicio = async (req, res) => {
  //console.log('🔍 [DEBUG CONTROLLER] Ejecutando actualizarServicio');
  try {
    const { id } = req.validado.params;
     const datosAActualizar = req.validado.body; 
    //console.log('🔍 [DEBUG CONTROLLER] ID recibido:', id, '(Tipo:', typeof id, ')');

    const servicio = await prisma.servicio.update({
      where: { id },
      data: datosAActualizar,
    });
    
    //console.log('✅ [DEBUG CONTROLLER] Éxito:', servicio);
    res.json({ success: true, message: "Servicio actualizado correctamente", data: servicio });
  } catch (error) {
    console.error('💥 [DEBUG CONTROLLER ERROR]:', error);
    // Forzamos a que te muestre el error real en Insomnia
    res.status(500).json({ success: false, message: error.message, detalles: error });
  }
};

export const eliminarServicio = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await prisma.servicio.delete({ where: { id: Number(id) } }); 
  res.json({ success: true, message: "Servicio eliminado correctamente" });
});

export const eliminarTodosServicios = asyncHandler(async (req, res) => {
  // deleteMany() borra TODOS los registros
  // delete() solo borra UNO (requiere where)
  const resultado = await prisma.servicio.deleteMany();
  
  res.json({ 
    success: true, 
    message: `${resultado.count} servicios eliminados correctamente` 
  });
});

// export const eliminarTodosServicios = asyncHandler(async (req, res) => {
//   // Requiere un header especial para confirmar
//   if (req.headers['x-confirm-delete-all'] !== 'SI-ESTOY-SEGURO') {
//     throw new ApiError(400, 'Envía el header "x-confirm-delete-all: SI-ESTOY-SEGURO" para confirmar');
//   }
  
//   const resultado = await prisma.servicio.deleteMany();
//   res.json({ 
//     success: true, 
//     message: `${resultado.count} servicios eliminados` 
//   });
// });
//En Insomnia agregas el header:
//x-confirm-delete-all: SI-ESTOY-SEGURO