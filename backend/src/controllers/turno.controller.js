import prisma from "../lib/prisma.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

/**
 * POST /api/turnos
 * Crea un nuevo turno validando que no haya solapamiento
 */
export const crearTurno = asyncHandler(async (req, res) => {
  const { fecha, hora, servicioId, notas } = req.validado.body;
  const usuarioId = req.usuario.userId;

  console.log("\n🔍 ===== NUEVA PETICIÓN DE TURNO =====");
  console.log("📥 Datos recibidos:", {
    fecha,
    hora,
    servicioId: Number(servicioId),
    usuarioId,
  });

  // 1. Validar que el servicio existe
  const servicio = await prisma.servicio.findUnique({
    where: { id: Number(servicioId) },
  });

  if (!servicio) {
    throw new ApiError(404, "El servicio seleccionado no está disponible");
  }

  // 2. Validar que la fecha no sea en el pasado
  const fechaHoy = new Date().toISOString().split("T")[0];
  if (fecha < fechaHoy) {
    throw new ApiError(400, "No puedes crear un turno en el pasado");
  }
  if (fecha === fechaHoy) {
    const horaActual = new Date().toTimeString().slice(0, 5);
    if (hora <= horaActual) {
      throw new ApiError(
        400,
        "No puedes crear un turno en una hora ya pasada de hoy",
      );
    }
  }

  // 3. Buscar turnos existentes de ESTE servicio en ESTE día (BLINDADO)
  const fechaUTC = `${fecha}T00:00:00.000Z`;
  const inicioDia = new Date(fechaUTC);
  const finDia = new Date(`${fecha}T23:59:59.999Z`);

  console.log("🔎 Prisma buscará exactamente esto:", {
    servicioId: Number(servicioId),
    estado: "no cancelado",
    rangoFecha: { gte: inicioDia.toISOString(), lte: finDia.toISOString() },
  });

  const turnosExistentes = await prisma.turno.findMany({
    where: {
      servicioId: Number(servicioId), // FORZAR NÚMERO PARA EVITAR MISMATCH
      estado: { not: "cancelado" },
      fecha: {
        gte: inicioDia,
        lte: finDia,
      },
    },
  });

  console.log("📊 Turnos encontrados en la BD:", turnosExistentes.length);
  if (turnosExistentes.length > 0) {
    console.log(
      "📋 Detalle de turnos que bloquean:",
      turnosExistentes.map((t) => ({
        id: t.id,
        hora: t.hora,
        servicioId: t.servicioId,
      })),
    );
  }

  // 4. Verificar solapamiento de HORARIO (Lógica de minutos)
  const [nuevoH, nuevoM] = hora.split(":").map(Number);
  const nuevoInicioMinutos = nuevoH * 60 + nuevoM;
  const nuevoFinMinutos = nuevoInicioMinutos + servicio.duracion;

  for (const turno of turnosExistentes) {
    const [turnoH, turnoM] = turno.hora.split(":").map(Number);
    const turnoInicioMinutos = turnoH * 60 + turnoM;
    const turnoFinMinutos = turnoInicioMinutos + servicio.duracion;

    const solapa =
      nuevoInicioMinutos < turnoFinMinutos &&
      nuevoFinMinutos > turnoInicioMinutos;

    if (solapa) {
      throw new ApiError(
        409,
        `Ya existe un turno en ese horario (${turno.hora}) para este servicio.`,
        { horarioConflictivo: turno.hora },
      );
    }
  }

  // 5. Verificar solapamiento del USUARIO (No puede estar en 2 lugares)
  const turnosDelUsuario = await prisma.turno.findMany({
    where: {
      usuarioId: Number(usuarioId),
      estado: { not: "cancelado" },
      fecha: { gte: inicioDia, lte: finDia },
    },
    include: { servicio: true },
  });

  for (const turno of turnosDelUsuario) {
    const [turnoH, turnoM] = turno.hora.split(":").map(Number);
    const turnoInicioMinutos = turnoH * 60 + turnoM;
    const turnoFinMinutos = turnoInicioMinutos + turno.servicio.duracion;

    const solapa =
      nuevoInicioMinutos < turnoFinMinutos &&
      nuevoFinMinutos > turnoInicioMinutos;

    if (solapa) {
      throw new ApiError(
        409,
        `Ya tienes un turno a esa hora (${turno.hora}) con ${turno.servicio.nombre}. No puedes estar en dos lugares al mismo tiempo.`,
        { horarioConflictivo: turno.hora },
      );
    }
  }

  // 6. Crear el turno
  const turno = await prisma.turno.create({
    data: {
      fecha: new Date(fechaUTC), // Guardar en UTC consistente
      hora,
      usuarioId: Number(usuarioId),
      servicioId: Number(servicioId),
      notas,
      estado: "pendiente",
    },
    include: {
      servicio: true,
      usuario: { select: { id: true, nombre: true, email: true } },
    },
  });

  console.log(
    `✅ Turno creado exitosamente: ID ${turno.id}\n=====================================\n`,
  );

  res.status(201).json({
    success: true,
    message: "Turno creado exitosamente",
    data: turno,
  });
});

/**
 * GET /api/turnos
 * Lista todos los turnos (admin ve todos, usuario ve solo los suyos)
 */
export const listarTurnos = asyncHandler(async (req, res) => {
  const { fecha, servicioId } = req.query;
  const usuarioId = req.usuario.userId;
  const esAdmin = req.usuario.rol === 'admin';

  const where = {};

  // 1. Si NO es admin, que solo vea sus propios turnos
  if (!esAdmin) {
    where.usuarioId = Number(usuarioId);
    // Opcional: descomenta la siguiente línea si quieres que el usuario normal TAMPOCO vea sus propios turnos cancelados
    // where.estado = { not: 'cancelado' }; 
  }
  // Si ES admin, el objeto 'where' queda vacío (o con los filtros de fecha/servicio), 
  // por lo que Prisma le devolverá TODOS los turnos, incluidos los cancelados.

  if (fecha) {
    where.fecha = {
      gte: new Date(`${fecha}T00:00:00.000Z`),
      lte: new Date(`${fecha}T23:59:59.999Z`),
    };
  }

  if (servicioId) {
    where.servicioId = Number(servicioId);
  }

  const turnos = await prisma.turno.findMany({
    where: where, // Usamos el objeto dinámico
    include: {
      usuario: { select: { id: true, nombre: true, email: true, nickname: true } },
      servicio: true,
    },
    orderBy: [{ fecha: 'asc' }, { hora: 'asc' }],
  });

  res.json({ success: true, data: turnos });
});

/**
 * GET /api/turnos/mis-turnos
 * Lista solo los turnos del usuario autenticado
 */
export const listarMisTurnos = asyncHandler(async (req, res) => {
  const usuarioId = req.usuario.userId;

  // 🔍 DEBUG: Ver qué valor tiene usuarioId
  console.log(
    "🔍 [MIS TURNOS] usuarioId del token:",
    usuarioId,
    "(tipo:",
    typeof usuarioId,
    ")",
  );
  console.log("🔍 [MIS TURNOS] req.usuario completo:", req.usuario);

  // Convertir a número por si viene como string
  const usuarioIdNum = Number(usuarioId);

  console.log("🔍 [MIS TURNOS] usuarioId convertido:", usuarioIdNum);

  const turnos = await prisma.turno.findMany({
    where: {
      usuarioId: usuarioIdNum, // Forzar que sea número
    },
    include: { servicio: true },
    orderBy: [{ fecha: "asc" }, { hora: "asc" }],
  });

  console.log("🔍 [MIS TURNOS] Turnos encontrados:", turnos.length);
  console.log(
    "🔍 [MIS TURNOS] IDs de los turnos:",
    turnos.map((t) => ({ id: t.id, usuarioId: t.usuarioId })),
  );

  res.json({ success: true, data: turnos });
});

/**
 * PATCH /api/turnos/:id/cancelar
 * Cancela un turno (solo el dueño o admin)
 */
export const cancelarTurno = asyncHandler(async (req, res) => {
  const { id } = req.validado.params; // Zod ya lo convirtió a número
  const usuarioId = req.usuario.userId; // ⚠️ userId, NO id
  const esAdmin = req.usuario.rol === "admin";

  console.log("🔎 Intento de cancelación:", {
    id,
    tipoId: typeof id,
    usuarioId,
    esAdmin,
  });

  const turno = await prisma.turno.findUnique({
    where: { id },
    include: { servicio: true },
  });

  if (!turno) {
    throw new ApiError(404, "Ese turno no existe");
  }

  // Dueño del turno O administrador
  if (turno.usuarioId !== usuarioId && !esAdmin) {
    throw new ApiError(403, "No tienes permiso para cancelar este turno");
  }

  if (turno.estado === "cancelado") {
    throw new ApiError(400, "Este turno ya está cancelado");
  }

  // BORRADO LÓGICO: no borramos el registro, cambiamos su estado
  const turnoCancelado = await prisma.turno.update({
    where: { id },
    data: { estado: "cancelado" },
    include: { servicio: true },
  });

  res.json({
    success: true,
    message: "Turno cancelado. El horario volvió a quedar disponible.",
    data: turnoCancelado,
  });
});

// src/controllers/turno.controller.js

// ... tus otros controladores (crearTurno, listarTurnos, etc.) ...

// ✅ AGREGA ESTO: Controlador para que el Admin actualice el estado
export const actualizarEstadoTurno = asyncHandler(async (req, res) => {
  // 1. Extraemos los datos YA validados por el middleware
  const { id } = req.validado.params;
  const { estado, motivoAdmin } = req.validado.body;

  // 2. Verificamos que el turno exista
  const turno = await prisma.turno.findUnique({ 
    where: { id },
    include: { usuario: true, servicio: true }
  });

if (!turno) {
  return res.status(404).json({ 
    success: false, 
    message: "Turno no encontrado" 
  });
}

  // 3. Actualizamos el estado y el motivo (si se proporcionó)
  const turnoActualizado = await prisma.turno.update({
    where: { id },
    data: {
      estado,
      motivoAdmin: motivoAdmin || null, 
    },
    include: { 
      usuario: { select: { id: true, nombre: true, email: true } },
      servicio: { select: { id: true, nombre: true, precio: true } }
    }
  });

  // 👉 AQUÍ IRÁ EL DISPARADOR DEL EMAIL EN EL FUTURO
  // if (estado === 'cancelado') { await enviarEmailCancelacion(turnoActualizado); }

  res.json({ 
    success: true, 
    message: `Turno ${estado} correctamente`,
    data: turnoActualizado 
  });
});


// src/controllers/turno.controller.js
export const limpiarTurnosCancelados = asyncHandler(async (req, res) => {
  // 1. Contamos cuántos vamos a borrar (para el log y confirmación)
  const conteo = await prisma.turno.count({
    where: { estado: 'cancelado' }
  });

  if (conteo === 0) {
    return res.json({ success: true, message: "No hay turnos cancelados para eliminar", data: { count: 0 } });
  }

  // 2. Eliminamos SOLO los cancelados
  const resultado = await prisma.turno.deleteMany({
    where: { estado: 'cancelado' }
  });

  res.json({ 
    success: true, 
    message: `Se eliminaron ${resultado.count} turnos cancelados`,
    data: { count: resultado.count }
  });
});