// src/components/CalendarioTurnos.tsx
import { useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { es } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Card } from "@/components/ui/card";
import DetalleDia from "./DetalleDia";

const locales = { es: es };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface Turno {
  id: number;
  usuario?: { nombre: string };
  fecha: string;
  hora: string;
  estado: string;
  notas?: string;
  servicio: { nombre: string; duracion: number; precio: number };
}

interface CalendarioTurnosProps {
  turnos: Turno[];
  showUsuario?: boolean; // NUEVA PROP
}

export default function CalendarioTurnos({
  turnos,
  showUsuario = false,
}: CalendarioTurnosProps) {
  const [diaSeleccionado, setDiaSeleccionado] = useState<Date | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const eventos = turnos.map((turno) => {
    const fechaLimpia = turno.fecha.split("T")[0];
    const start = new Date(`${fechaLimpia}T${turno.hora}:00`);
    const end = new Date(start.getTime() + turno.servicio.duracion * 60000);

    // Título con nombre del paciente si showUsuario es true
    const titulo = showUsuario
      ? `${turno.usuario?.nombre || "Paciente"} - ${turno.servicio.nombre}`
      : `${turno.servicio.nombre} - ${turno.estado}`;

    return {
      id: turno.id,
      title: titulo,
      start,
      end,
      resource: turno,
    };
  });

  const eventStyleGetter = (event: any) => {
    let backgroundColor = "#3b82f6";
    if (event.resource.estado === "cancelado") {
      backgroundColor = "#ef4444";
    } else if (event.resource.estado === "confirmado") {
      backgroundColor = "#22c55e";
    }
    return {
      style: {
        backgroundColor: backgroundColor,
        borderRadius: "4px",
        opacity: 0.8,
        color: "white",
        border: "0px",
        display: "block",
        fontWeight: "500",
      },
    };
  };

  // Handler para click en un slot vacío del calendario
  const handleSelectSlot = (slotInfo: { start: Date }) => {
    setDiaSeleccionado(slotInfo.start);
    setModalOpen(false);
  };

  // Handler para click en un evento existente
  const handleSelectEvent = (event: any) => {
    setDiaSeleccionado(event.start);
    setModalOpen(true);
  };

  return (
    <>
      <Card className="p-4 h-[600px]">
        <Calendar
          localizer={localizer}
          events={eventos}
          startAccessor="start"
          endAccessor="end"
          style={{ height: "100%" }}
          views={["month", "week", "day"]}
          defaultView="month"
          culture="es"
          eventPropGetter={eventStyleGetter}
          selectable
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          // 👇 AGREGÁ ESTA LÍNEA (es la magia que faltaba)
          onShowMore={(events, date) => {
            console.log("📅 Click en +X más. Fecha:", date);
            setDiaSeleccionado(date);
            setModalOpen(true);
          }}
          messages={{
            next: "Siguiente",
            previous: "Anterior",
            today: "Hoy",
            month: "Mes",
            week: "Semana",
            day: "Día",
            agenda: "Agenda",
            date: "Fecha",
            time: "Hora",
            event: "Evento",
            // noEventsInRange: "No hay turnos en este rango.",
            showMore: (total: number) => `+${total} más`, // 👈 AGREGÁ ESTO
          }}
        />
      </Card>

      {/* Modal de detalle del día */}
      <DetalleDia
        open={modalOpen}
        onOpenChange={setModalOpen}
        fecha={diaSeleccionado}
        turnos={turnos}
      />
    </>
  );
}
