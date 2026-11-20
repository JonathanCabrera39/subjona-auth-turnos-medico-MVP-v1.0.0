// backend/server.js
import app from './app.js' // O './src/app.js' dependiendo de tu estructura
import dotenv from 'dotenv'

dotenv.config()

const PORT = process.env.PORT || 3000

// ❌ BORRA ESTO: connectDB() 
// ✅ Prisma se conectará automáticamente cuando lo uses, no necesitas esto al inicio.

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`)
})