# 🏥 Sistema de Gestión de Turnos Médicos

> Plataforma full-stack para la gestión integral de turnos en consultorios médicos, con roles de administrador y paciente, calendario visual en tiempo real y notificaciones de estado.

![Estado](https://img.shields.io/badge/Estado-En%20Desarrollo-yellow)
![Stack](https://img.shields.io/badge/Stack-MERN%20%2B%20Prisma-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 📸 Capturas de Pantalla

### Panel de Administración
| Gestión General | Servicios |
|---|---|
| ![Panel Admin](frontend/src/assets/Panel%20de%20Administración.png) | ![Panel servicios](frontend/src/assets/Panel%20de%20Administración%20servicios.png) |

| Turnos | Vaciar Base |
|---|---|
| ![Panel turnos](frontend/src/assets/Gestión%20de%20Turnos.png) | ![Panel vaciar](frontend/src/assets/Panel%20de%20Administración%20vaciar.png) |

### Vista de Paciente y Funcionalidades
| Mis Turnos | Calendario |
|---|---|
| ![Vista Paciente](frontend/src/assets/Vista%20de%20Paciente.png) | ![Calendario](frontend/src/assets/Calendario%20de%20Turnos.png) |

| Gestión de Servicios | Autenticación |
|---|---|
| ![Servicios](frontend/src/assets/Gestión%20de%20servicios.png) | ![Login](frontend/src/assets/sistema-login-cierre-seccion.png) |

> 💡 Reemplazá las URLs de placeholder con capturas reales de tu proyecto (usá [Lightshot](https://app.prntscr.com/) o subilas a la carpeta `/assets`).

---

## ✨ Características Principales

### 👥 Sistema de Autenticación y Roles
- Registro y login con JWT (JSON Web Tokens)
- Roles diferenciados: **Admin** y **Usuario/Paciente**
- Rutas protegidas con middleware de autorización
- Persistencia de sesión con Zustand + localStorage

### 🏥 Gestión de Servicios
- CRUD completo de servicios médicos (solo admin)
- Configuración de nombre, duración y precio
- Validación estricta con Zod (backend y frontend)

### 📅 Sistema de Turnos
- Reserva de turnos con **lógica anti-solapamiento** (por servicio y por usuario)
- Calendario visual interactivo (vista mes, semana, día) con `react-big-calendar`
- Estados del turno: `pendiente`, `confirmado`, `completado`, `cancelado`
- Cancelación con confirmación elegante (AlertDialog de shadcn/ui)

### 🛡️ Panel de Administración
- Dashboard con pestañas: Usuarios, Servicios, Turnos, Calendario
- Gestión de turnos: confirmar, cancelar o completar con **motivo/nota** al paciente
- Visualización del motivo de cancelación en la vista del paciente
- Limpieza segura de turnos cancelados con confirmación por escritura (estilo GitHub)
- Filtros y búsqueda por fecha, servicio y estado

### 🎨 Frontend Moderno
- UI construida con **Tailwind CSS + shadcn/ui**
- Totalmente responsive
- Notificaciones con `react-hot-toast`
- Formularios validados con `React Hook Form + Zod`

---

## 🛠️ Stack Tecnológico

### Frontend
| Tecnología | Uso |
|---|---|
| React 18 + TypeScript | UI tipada y segura |
| Vite | Build tool ultrarrápido |
| Tailwind CSS + shadcn/ui | Sistema de diseño |
| Zustand | Estado global |
| React Router DOM | Navegación |
| Axios + Interceptors | Cliente HTTP con JWT automático |
| React Hook Form + Zod | Formularios validados |
| React Big Calendar + date-fns | Calendario visual |
| React Hot Toast | Notificaciones |

### Backend
| Tecnología | Uso |
|---|---|
| Node.js + Express | Servidor REST |
| Prisma ORM | Base de datos tipada |
| SQLite (dev) / PostgreSQL (prod) | Persistencia |
| JWT + bcrypt | Autenticación segura |
| Zod | Validación de datos |
| express-async-handler | Manejo de errores async |

---

## 🏗️ Arquitectura
