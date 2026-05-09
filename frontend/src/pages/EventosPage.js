import React, { useState, useEffect } from "react";
import { Calendar, Clock, MapPin } from "lucide-react";
import axios from "axios";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

function RevealSection({ children, className = "", delay = 0 }) {
  const [ref, visible] = useScrollReveal(0.1);
  return (
    <div ref={ref} className={`reveal ${visible ? "visible" : ""} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

export default function EventosPage() {
  const [events, setEvents] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/events`).then(r => { setEvents(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const today = new Date().toISOString().split("T")[0];
  const upcoming = events.filter(e => e.date >= today);
  const past = events.filter(e => e.date < today);
  const displayed = filter === "upcoming" ? upcoming : filter === "past" ? past : events;

  return (
    <div>
      <section className="relative py-24 sm:py-32 overflow-hidden" style={{ background: "linear-gradient(135deg, var(--primary) 0%, #1a9d74 50%, var(--primary) 100%)" }}>
        <div className="absolute inset-0 noise-overlay" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <p className="text-xs uppercase tracking-[0.4em] font-semibold mb-4" style={{ color: "var(--accent)" }}>Agenda</p>
          <h1 className="text-4xl sm:text-7xl font-light text-white animate-fade-in-up" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Eventos
          </h1>
        </div>
      </section>

      {/* Filter */}
      <section className="py-6 sticky top-20 z-30 glass border-b" style={{ borderColor: "var(--border)" }}>
        <div className="max-w-7xl mx-auto px-4 flex gap-3 items-center justify-center">
          {[
            { value: "all", label: "Todos" },
            { value: "upcoming", label: "Proximos" },
            { value: "past", label: "Passados" },
          ].map((f) => (
            <button
              key={f.value}
              data-testid={`filter-${f.value}`}
              onClick={() => setFilter(f.value)}
              className="px-6 py-2.5 text-sm font-medium tracking-wide rounded-full transition-all duration-300"
              style={{
                backgroundColor: filter === f.value ? "var(--primary)" : "transparent",
                color: filter === f.value ? "white" : "var(--text-secondary)",
                border: filter === f.value ? "none" : "1px solid var(--border)",
              }}
            >
              {f.label}
              {f.value === "upcoming" && upcoming.length > 0 && (
                <span className="ml-2 text-xs px-1.5 py-0.5 rounded-full" style={{ backgroundColor: filter === f.value ? "rgba(255,255,255,0.2)" : "var(--primary-light)", color: filter === f.value ? "white" : "var(--primary)" }}>
                  {upcoming.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </section>

      <section data-testid="events-list" className="py-16 sm:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          {loading ? (
            <div className="text-center py-16">
              <div className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin mx-auto" style={{ borderColor: "var(--primary)", borderTopColor: "transparent" }} />
            </div>
          ) : displayed.length > 0 ? (
            <div className="space-y-5">
              {displayed.map((event, i) => (
                <RevealSection key={event.id} delay={i * 100}>
                  <EventRow event={event} isPast={event.date < today} />
                </RevealSection>
              ))}
            </div>
          ) : (
            <div className="text-center py-24">
              <Calendar size={52} className="mx-auto mb-5 opacity-15" />
              <p className="text-lg" style={{ color: "var(--text-secondary)" }}>
                Nao existem eventos {filter === "upcoming" ? "futuros" : filter === "past" ? "passados" : ""} de momento.
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
    const months = ["Janeiro", "Fevereiro", "Marco", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    const days = ["Domingo", "Segunda", "Terca", "Quarta", "Quinta", "Sexta", "Sabado"];
    return { day: d.getDate(), month: months[d.getMonth()], weekday: days[d.getDay()] };
  };
  const { day, month, weekday } = formatDate(event.date);

  return (
    <div
      data-testid={`event-row-${event.id}`}
      className={`flex flex-col sm:flex-row rounded-xl overflow-hidden border hover-lift ${isPast ? "opacity-50" : ""}`}
      style={{ borderColor: "var(--border)", backgroundColor: "var(--surface)" }}
    >
      <div
        className="flex items-center gap-4 px-7 py-6 sm:min-w-[180px] sm:flex-col sm:justify-center sm:gap-1"
        style={{
          background: isPast
            ? "linear-gradient(135deg, #6b7280, #9ca3af)"
            : "linear-gradient(135deg, var(--primary), #1a9d74)",
          color: "white",
        }}
      >
        <span className="text-4xl font-light" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{day}</span>
        <div className="sm:text-center">
          <span className="text-sm font-medium">{month}</span>
          <span className="block text-xs opacity-50">{weekday}</span>
        </div>
      </div>
      <div className="flex-1 px-7 py-6">
        <h3 className="text-xl font-medium mb-2" style={{ fontFamily: "'Cormorant Garamond', serif", color: "var(--text-primary)" }}>
          {event.title}
        </h3>
        <p className="text-sm mb-4 line-clamp-2" style={{ color: "var(--text-secondary)" }}>{event.description}</p>
        <div className="flex flex-wrap gap-3 text-[11px]" style={{ color: "var(--text-secondary)" }}>
          {event.time && (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full" style={{ backgroundColor: "var(--surface-secondary)" }}>
              <Clock size={11} /> {event.time}
            </span>
          )}
          {event.location && (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full" style={{ backgroundColor: "var(--surface-secondary)" }}>
              <MapPin size={11} /> {event.location}
            </span>
          )}
          {event.price && (
            <span className="font-bold px-3 py-1 rounded-full text-white" style={{ backgroundColor: "var(--accent)" }}>
              {event.price}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
