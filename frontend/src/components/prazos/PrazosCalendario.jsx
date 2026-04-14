import { useMemo, useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./calendario.css";

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date) => startOfWeek(date, { locale: ptBR }),
  getDay,
  locales: { "pt-BR": ptBR },
});

const messages = {
  allDay: "Dia inteiro",
  previous: "Anterior",
  next: "Próximo",
  today: "Hoje",
  month: "Mês",
  week: "Semana",
  day: "Dia",
  agenda: "Agenda",
  date: "Data",
  time: "Hora",
  event: "Prazo",
  noEventsInRange: "Nenhum prazo neste período.",
  showMore: (total) => `+ ${total} prazo(s)`,
};

function BarraFerramentas({ label, onNavigate, onView, view }) {
  return (
    <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => onNavigate("PREV")}
          title="Anterior"
        >
          <ChevronLeft className="size-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={() => onNavigate("TODAY")}>
          Hoje
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => onNavigate("NEXT")}
          title="Próximo"
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
      <span className="font-semibold text-sm capitalize">{label}</span>
      <div className="flex items-center gap-1">
        <Button
          variant={view === "month" ? "default" : "outline"}
          size="sm"
          onClick={() => onView("month")}
        >
          Mês
        </Button>
        <Button
          variant={view === "agenda" ? "default" : "outline"}
          size="sm"
          onClick={() => onView("agenda")}
        >
          Agenda
        </Button>
      </div>
    </div>
  );
}

export default function PrazosCalendario({ prazos, processos, onEventClick }) {
  const [view, setView] = useState("agenda");
  const [date, setDate] = useState(new Date());

  const eventos = useMemo(() => {
    return prazos.map((p) => {
      const proc = processos.find((pr) => pr.id === p.processo_id);
      // MySQL retorna DATE como objeto Date (meia-noite UTC).
      // Ajustar para meio-dia local evita que o offset de fuso horário desloque o dia.
      const data = new Date(p.data_prazo);
      data.setHours(12, 0, 0, 0);
      const partes = [
        proc?.numero_processo ?? null,
        p.tipo ? p.tipo.charAt(0).toUpperCase() + p.tipo.slice(1) : null,
        p.descricao || null,
      ].filter(Boolean);
      return {
        id: p.id,
        title: partes.join(" — "),
        start: data,
        end: data,
        allDay: true,
        resource: p,
      };
    });
  }, [prazos, processos]);

  const eventPropGetter = (event) => ({
    className: `ev-${event.resource?.status ?? "pendente"}`,
  });

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <Calendar
        localizer={localizer}
        events={eventos}
        view={view}
        date={date}
        onView={setView}
        onNavigate={setDate}
        views={["month", "agenda"]}
        messages={messages}
        culture="pt-BR"
        eventPropGetter={eventPropGetter}
        onSelectEvent={(event) => onEventClick(event.resource)}
        components={{ toolbar: BarraFerramentas }}
        formats={{
          agendaDateFormat: "EEEE, dd/MM/yyyy",
          monthHeaderFormat: "MMMM 'de' yyyy",
          weekdayFormat: "EEEEEE",
        }}
        style={{ height: 600 }}
      />
    </div>
  );
}
