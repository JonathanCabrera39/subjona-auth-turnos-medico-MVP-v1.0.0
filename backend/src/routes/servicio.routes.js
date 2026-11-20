
import { Router } from 'express';
import { autenticar, autorizarAdmin } from '../middlewares/auth.js';
import { validar } from '../middlewares/validate.js';
import { 
  crearServicioSchema, 
  actualizarServicioSchema,
  idParamSchema 
} from '../schemas/servicio.schema.js';
import { 
  listarServicios, 
  crearServicio, 
  actualizarServicio, 
  eliminarServicio,
  eliminarTodosServicios
} from '../controllers/servicio.controller.js';

const router = Router();

// 1. Rutas Públicas
router.get('/', listarServicios);

// 2. Rutas Protegidas (solo admin)
router.post('/', 
  autenticar, 
  autorizarAdmin, 
  validar(crearServicioSchema),  // Schema completo
  crearServicio
);



router.patch('/:id', 
  autenticar, 
  autorizarAdmin, 
  validar(idParamSchema, 'params'),  // Valida el ID
  validar(actualizarServicioSchema),  // Schema parcial (campos opcionales)
  actualizarServicio
);

router.delete('/all', 
  autenticar, 
  autorizarAdmin, 
  eliminarTodosServicios
);

router.delete('/:id', 
  autenticar, 
  autorizarAdmin, 
  validar(idParamSchema, 'params'),
  eliminarServicio
);



export default router;