import prisma from "../lib/prisma.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// ==========================================
// REGISTRO
// ==========================================
export const register = async (req, res) => {
  try {
    const { nickname, nombre, email, password,rol } = req.body;

    // 1. Verificar si el email ya existe (Prisma hace esto súper rápido)
    const usuarioExistente = await prisma.usuario.findUnique({ 
      where: { email } 
    });

    if (usuarioExistente) {
      return res.status(400).json({ error: "El email ya está registrado" });
    }

    // 2. Hashear la contraseña manualmente (reemplaza el pre('save') de Mongoose)
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Crear el usuario en PostgreSQL
    const nuevoUsuario = await prisma.usuario.create({
      data: {
        nombre,
        nickname,
        email,
        rol,
        password: hashedPassword,
        // 'rol' toma el valor por defecto "usuario" automáticamente
      },
    });

    // 4. Responder sin enviar la contraseña
    res.status(201).json({
      success: true,
      usuario: {
        id: nuevoUsuario.id,
        nombre: nuevoUsuario.nombre,
        nickname: nuevoUsuario.nickname,
        email: nuevoUsuario.email,
        rol: nuevoUsuario.rol,
      },
    });
  } catch (error) {
    console.error("❌ ERROR EN REGISTER:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// ==========================================
// LOGIN
// ==========================================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Buscar usuario por email
    const usuario = await prisma.usuario.findUnique({ 
      where: { email } 
    });

    if (!usuario) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    // 2. Verificar contraseña
    const esValida = await bcrypt.compare(password, usuario.password);
    if (!esValida) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    // 3. Generar token JWT
    const token = jwt.sign(
      { userId: usuario.id, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        nickname: usuario.nickname,
        email: usuario.email,
        rol: usuario.rol,
      },
    });
  } catch (error) {
    console.error("❌ ERROR EN LOGIN:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// ==========================================
// OBTENER PERFIL (Protegido por middleware)
// ==========================================
export const getPerfil = async (req, res) => {
  try {
    // req.usuario.userId viene de tu middleware de autenticación
    const usuario = await prisma.usuario.findUnique({
      where: { id: req.usuario.userId },
      select: { // Buenísima práctica: solo devolver lo necesario, nunca el password
        id: true,
        nombre: true,
        nickname: true,
        email: true,
        rol: true,
      }
    });

    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json({ usuario });
  } catch (error) {
    console.error("❌ ERROR EN GET PERFIL:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};


// Obtener todos los usuarios (Solo Admin)
export const getUsuarios = async (req, res) => {
  try {
    // Verificamos el rol manualmente (o podrías usar un middleware)
    if (req.usuario.rol !== 'admin') {
      return res.status(403).json({ error: "Acceso denegado" });
    }

    const usuarios = await prisma.usuario.findMany({
      select: { id: true, nombre: true, nickname: true, email: true, rol: true }
    });

    res.json({ usuarios });
  } catch (error) {
    console.error("❌ ERROR EN GET USUARIOS:", error);
    res.status(500).json({ error: "Error interno" });
  }
};