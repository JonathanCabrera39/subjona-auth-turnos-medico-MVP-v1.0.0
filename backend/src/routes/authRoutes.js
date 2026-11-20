import { Router } from 'express'
import { register, login, getPerfil,getUsuarios } from '../controllers/authController.js'
import { autenticar } from '../middlewares/auth.js'

const router = Router()

router.post('/register', register)
router.post('/login', login)
router.get('/me', autenticar, getPerfil)
router.get('/usuarios', autenticar, getUsuarios)

export default router