import React, { useState, useEffect, useRef } from "react";
import { Calendar, Clock, MapPin } from "lucide-react";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

function SR({ children, className = "", delay = 0 }) {
  const ref = useRef(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setV(true); }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return <div ref={ref} className={`sr ${v ? "visible" : ""} ${className}`} style={{ transitionDelay: `${delay}ms` }}>{children}</div>;
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
  const shown = filter === "upcoming" ? upcoming : filter === "past" ? past : events;

  return (
    <div>
      <section className="pt-32 pb-16 sm:pt-40 sm:pb-20 bg-[var(--green-900)]">
        <div className="max-w-4xl mx-auto px-5 sm:px-8 text-center">
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-[var(--green-500)] mb-3">Agenda</span>
          <h1 className="text-4xl sm:text-6xl font-bold text-white anim-fade-up d1">Eventos</h1>
        </div>
      </section>

      <section className="sticky top-[72px] z-30 bg-white/90 backdrop-blur-xl border-b border-[var(--border-light)] py-4">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 flex gap-2 justify-center">
          {[
            { v: "all", l: "Todos" },
            { v: "upcoming", l: `Proximos${upcoming.length ? ` (${upcoming.length})` : ""}` },
            { v: "past", l: "Passados" },
          ].map(f => (
            <button
              key={f.v}
              data-testid={`filter-${f.v}`}
              onClick={() => setFilter(f.v)}
              className={`px-5 py-2 text-sm font-medium rounded-lg transition-all ${
                filter === f.v
                  ? "bg-[var(--green-700)] text-white"
                  : "bg-transparent text-[var(--text-secondary)] border border-[var(--border)] hover:border-[var(--green-700)]/30"
              }`}
            >
              {f.l}
            </button>
          ))}
        </div>
      </section>

      <section data-testid="events-list" className="py-16 sm:py-24">
        <div className="max-w-4xl mx-auto px-5 sm:px-8">
          {loading ? (
            <div className="text-center py-16">
              <div className="w-8 h-8 border-2 border-[var(--green-700)] border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : shown.length > 0 ? (
            <div className="space-y-4">
              {shown.map((ev, i) => (
                <SR key={ev.id} delay={i * 80}>
                  <EvRow event={ev} isPast={ev.date < today} />
                </SR>
              ))}
            </div>
          ) : (
            <div className="text-center py-24">
              <Calendar size={40} className="mx-auto mb-4 text-[var(--text-muted)]" />
              <p className="text-[var(--text-secondary)]">Sem eventos de momento.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function EvRow({ event, isPast }) {
  const d = new Date(event.date + "T00:00:00");
  const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];

  return (
    <div
      data-testid={`event-row-${event.id}`}
      className={`flex items-stretch rounded-xl bg-white border border-[var(--border)] overflow-hidden lift ${isPast ? "opacity-50" : ""}`}
    >
      <div className={`flex flex-col items-center justify-center px-6 py-5 min-w-[90px] text-white ${isPast ? "bg-[var(--text-muted)]" : "bg-[var(--green-700)]"}`}>
        <span className="text-2xl font-bold leading-none">{d.getDate()}</span>
        <span className="text-[10px] font-semibold uppercase mt-0.5">{months[d.getMonth()]}</span>
        <span className="text-[9px] opacity-50 mt-0.5">{days[d.getDay()]}</span>
      </div>
      <div className="flex-1 px-6 py-5">
        <h3 className="text-base font-semibold text-[var(--text-primary)] mb-1">{event.title}</h3>
        <p className="text-sm text-[var(--text-secondary)] line-clamp-2 mb-3">{event.description}</p>
        <div className="flex flex-wrap gap-2 text-[11px] text-[var(--text-muted)]">
          {event.time && <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-[var(--surface-alt)]"><Clock size={10} />{event.time}</span>}
          {event.location && <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-[var(--surface-alt)]"><MapPin size={10} />{event.location}</span>}
          {event.price && <span className="font-semibold px-2 py-0.5 rounded text-[var(--green-700)] bg-[var(--green-100)]">{event.price}</span>}
        </div>
      </div>
    </div>
  );
}
