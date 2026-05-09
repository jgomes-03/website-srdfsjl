import React, { useState, useEffect } from "react";
import { Calendar, Clock, MapPin, Search } from "lucide-react";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function EventosPage() {
  const [events, setEvents] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/events`).then(r => {
      setEvents(r.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const today = new Date().toISOString().split("T")[0];
  const upcoming = events.filter(e => e.date >= today);
  const past = events.filter(e => e.date < today);
  const displayed = filter === "upcoming" ? upcoming : filter === "past" ? past : events;

  return (
    <div>
      {/* Page Header */}
      <section className="py-20 sm:py-24" style={{ backgroundColor: "var(--primary)" }}>
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-xs uppercase tracking-[0.3em] font-semibold mb-4" style={{ color: "var(--accent)" }}>
            Agenda
          </p>
          <h1
            className="text-4xl sm:text-6xl font-light text-white"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Eventos
          </h1>
        </div>
      </section>

      {/* Filter bar */}
      <section className="py-8 border-b" style={{ borderColor: "var(--border)", backgroundColor: "var(--surface)" }}>
        <div className="max-w-7xl mx-auto px-4 flex gap-4 items-center justify-center">
          {[
            { value: "all", label: "Todos" },
            { value: "upcoming", label: "Próximos" },
            { value: "past", label: "Passados" },
          ].map((f) => (
            <button
              key={f.value}
              data-testid={`filter-${f.value}`}
              onClick={() => setFilter(f.value)}
              className="px-5 py-2 text-sm font-medium tracking-wide transition-all duration-200"
              style={{
                backgroundColor: filter === f.value ? "var(--primary)" : "transparent",
                color: filter === f.value ? "white" : "var(--text-secondary)",
                border: filter === f.value ? "none" : "1px solid var(--border)",
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </section>

      {/* Events List */}
      <section data-testid="events-list" className="py-16 sm:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          {loading ? (
            <div className="text-center py-16">
              <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mx-auto" style={{ borderColor: "var(--primary)", borderTopColor: "transparent" }} />
            </div>
          ) : displayed.length > 0 ? (
            <div className="space-y-6">
              {displayed.map((event) => (
                <EventRow key={event.id} event={event} isPast={event.date < today} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <Calendar size={48} className="mx-auto mb-4 opacity-20" />
              <p className="text-lg" style={{ color: "var(--text-secondary)" }}>
                Não existem eventos {filter === "upcoming" ? "futuros" : filter === "past" ? "passados" : ""} de momento.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function EventRow({ event, isPast }) {
  const formatDate = (dateStr) => {
    const d = new Date(dateStr + "T00:00:00");
    const months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    const days = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
    return { day: d.getDate(), month: months[d.getMonth()], weekday: days[d.getDay()] };
  };
  const { day, month, weekday } = formatDate(event.date);

  return (
    <div
      data-testid={`event-row-${event.id}`}
      className={`flex flex-col sm:flex-row border transition-all duration-300 hover:-translate-y-0.5 ${isPast ? "opacity-60" : ""}`}
      style={{ borderColor: "var(--border)", backgroundColor: "var(--surface)" }}
    >
      <div
        className="flex items-center gap-4 px-6 py-5 sm:min-w-[200px] sm:flex-col sm:justify-center sm:gap-1"
        style={{ backgroundColor: isPast ? "var(--text-secondary)" : "var(--primary)", color: "white" }}
      >
        <span className="text-3xl font-light" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{day}</span>
        <div className="sm:text-center">
          <span className="text-sm">{month}</span>
          <span className="block text-xs opacity-60">{weekday}</span>
        </div>
      </div>
      <div className="flex-1 px-6 py-5">
        <h3
          className="text-xl font-medium mb-2"
          style={{ fontFamily: "'Cormorant Garamond', serif", color: "var(--text-primary)" }}
        >
          {event.title}
        </h3>
        <p className="text-sm mb-3 line-clamp-2" style={{ color: "var(--text-secondary)" }}>
          {event.description}
        </p>
        <div className="flex flex-wrap gap-4 text-xs" style={{ color: "var(--text-secondary)" }}>
          {event.time && (
            <span className="flex items-center gap-1.5">
              <Clock size={12} /> {event.time}
            </span>
          )}
          {event.location && (
            <span className="flex items-center gap-1.5">
              <MapPin size={12} /> {event.location}
            </span>
          )}
          {event.price && (
            <span
              className="font-semibold px-2 py-0.5"
              style={{ backgroundColor: "var(--accent)", color: "white" }}
            >
              {event.price}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
