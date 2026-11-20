import { Router } from "express";
import { autenticar, autorizarAdmin } from "../middlewares/auth.js";
import { validar } from "../middlewares/validate.js";
import {
  crearTurnoSchema,
  idParamSchema,
  listarQuerySchema,
  actualizarEstadoSchema, // 👈 1. Import agregado
} from "../schemas/turno.schema.js";
import {
  crearTurno,
  listarTurnos,
  listarMisTurnos,
  cancelarTurno,
  actualizarEstadoTurno, // 👈 2. Import agregado
  limpiarTurnosCancelados,
} from "../controllers/turno.controller.js";

const router = Router();

// 👑 3. TODAS las rutas de este archivo requieren autenticación.
// No hace falta repetirlo abajo.
router.use(autenticar);

// ---------------------------------------------------------
// RUTAS ESPECÍFICAS (Van PRIMERO)
// ---------------------------------------------------------

// 1. Obtener TODOS los turnos (Solo Admin)
// Va antes de cualquier ruta con :id para que no se confunda
router.get("/todos", autorizarAdmin, listarTurnos);

// 2. Crear un turno
router.post("/", validar(crearTurnoSchema), crearTurno);

// 3. Listar turnos con filtros (query)
router.get("/", validar(listarQuerySchema, "query"), listarTurnos);

// 4. Listar SOLO mis turnos (Usuario normal)
router.get("/mis-turnos", listarMisTurnos);

// 5. Actualizar estado de un turno (Solo Admin)
router.patch(
  "/:id/estado",
  autorizarAdmin,
  validar(idParamSchema, "params"),   
  validar(actualizarEstadoSchema, "body"),
  actualizarEstadoTurno,
);

// 6. Cancelar un turno (Usuario o Admin, según tu lógica de controlador)
router.patch("/:id/cancelar", validar(idParamSchema, "params"), cancelarTurno);
router.delete(
  "/limpiar-cancelados",
  autenticar,
  autorizarAdmin,
  limpiarTurnosCancelados,
);

// ---------------------------------------------------------
// RUTAS GENÉRICAS (Van AL FINAL)
// ---------------------------------------------------------

// Si en el futuro necesitas obtener un turno por ID, va AQUÍ ABAJO:
// router.get("/:id", validar(idParamSchema, "params"), obtenerUnTurno);

export default router;
