import mongoose from 'mongoose'
import bcrypt from 'bcrypt'

const usuarioSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre es obligatorio'],
    trim: true
  },
    nickname: {
    type: String,
    required: [true, 'El nickname es obligatorio'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'El email es obligatorio'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'La contraseña es obligatoria'],
    minlength: [6, 'Mínimo 6 caracteres'],
    select: false
  },
  rol: {
    type: String,
    enum: ['usuario', 'admin'],
    default: 'usuario'
  }
}, {
  timestamps: true
})

// Hash password antes de guardar
usuarioSchema.pre('save', async function() {
  if (!this.isModified('password')) return 
  this.password = await bcrypt.hash(this.password, 12)
 
})


// Método para comparar passwords
usuarioSchema.methods.compararPassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password)
}

export const Usuario = mongoose.model('Usuario', usuarioSchema)