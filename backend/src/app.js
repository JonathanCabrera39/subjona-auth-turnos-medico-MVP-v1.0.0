import express from "express";
import cors from "cors";
import helmet from "helmet";
import authRoutes from "./routes/authRoutes.js";
import servicioRoutes from "./routes/servicio.routes.js"; // <-- NUEVO
import { errorHandler, notFound } from "./middlewares/errorHandler.js"; // <-- NUEVO
// Agrega esta línea junto a las otras rutas
import turnoRoutes from "./routes/turno.routes.js";
const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

app.use("/api/servicios", servicioRoutes); // <-- NUEVO
app.use("/api/turnos", turnoRoutes);

app.get("/", (req, res) => res.json({ message: "API funcionando" }));

// ⚠️ ESTO VA SIEMPRE AL FINAL
app.use(notFound);
app.use(errorHandler);

export default app;
