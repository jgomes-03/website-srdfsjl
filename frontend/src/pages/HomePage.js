import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Calendar, ArrowRight, Users, MapPin, Clock } from "lucide-react";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const HERO_IMG = "https://images.unsplash.com/photo-1765101159803-9d9dbf0ba4ac?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2ODh8MHwxfHNlYXJjaHwyfHxQb3J0dWd1ZXNlJTIwdHJhZGl0aW9uYWwlMjBzdG9uZSUyMGJ1aWxkaW5nJTIwZmFjYWRlfGVufDB8fHx8MTc3ODM1MzQ3M3ww&ixlib=rb-4.1.0&q=85";

export default function HomePage() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    axios.get(`${API}/events/upcoming`).then(r => setEvents(r.data)).catch(() => {});
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section
        data-testid="hero-section"
        className="relative min-h-[70vh] flex items-center justify-center overflow-hidden"
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${HERO_IMG})` }}
        />
        <div className="absolute inset-0" style={{ backgroundColor: "rgba(13, 107, 79, 0.75)" }} />
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center py-24">
          <p
            className="text-xs uppercase tracking-[0.3em] font-semibold mb-6 opacity-0 animate-fade-in-up"
            style={{ color: "var(--accent)", animationDelay: "0.1s", animationFillMode: "forwards" }}
          >
            Desde 1911 &mdash; São João das Lampas
          </p>
          <h1
            className="text-4xl sm:text-6xl lg:text-7xl font-light text-white leading-tight mb-6 opacity-0 animate-fade-in-up"
            style={{ fontFamily: "'Cormorant Garamond', serif", animationDelay: "0.2s", animationFillMode: "forwards" }}
          >
            Sociedade Recreativa<br />
            Desportiva e Familiar
          </h1>
          <p
            className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto mb-10 opacity-0 animate-fade-in-up"
            style={{ animationDelay: "0.4s", animationFillMode: "forwards" }}
          >
            Mais de 110 anos ao serviço da comunidade. Desporto, cultura, teatro e convívio 
            no coração de São João das Lampas.
          </p>
          <div
            className="flex flex-col sm:flex-row gap-4 justify-center opacity-0 animate-fade-in-up"
            style={{ animationDelay: "0.5s", animationFillMode: "forwards" }}
          >
            <Link
              to="/inscricao"
              data-testid="hero-cta-socio"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 text-sm font-medium tracking-wide transition-all duration-200 hover:opacity-90"
              style={{ backgroundColor: "var(--accent)", color: "white" }}
            >
              Fazer-me Sócio
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/eventos"
              data-testid="hero-cta-eventos"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 text-sm font-medium tracking-wide border-2 border-white/40 text-white hover:bg-white/10 transition-all duration-200"
            >
              Ver Eventos
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Strip */}
      <section className="py-6" style={{ backgroundColor: "var(--text-primary)" }}>
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { num: "1911", label: "Ano de Fundação" },
            { num: "110+", label: "Anos de História" },
            { num: "500+", label: "Sócios" },
            { num: "50+", label: "Eventos por Ano" },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-2xl sm:text-3xl font-light text-white" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                {s.num}
              </p>
              <p className="text-xs text-white/50 tracking-wider uppercase mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Upcoming Events */}
      <section data-testid="upcoming-events-section" className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] font-semibold mb-2" style={{ color: "var(--accent)" }}>
                Agenda
              </p>
              <h2
                className="text-3xl sm:text-5xl font-medium"
                style={{ fontFamily: "'Cormorant Garamond', serif", color: "var(--text-primary)" }}
              >
                Próximos Eventos
              </h2>
            </div>
            <Link
              to="/eventos"
              data-testid="events-view-all"
              className="hidden sm:inline-flex items-center gap-2 text-sm font-medium transition-colors hover:opacity-70"
              style={{ color: "var(--primary)" }}
            >
              Ver todos <ArrowRight size={14} />
            </Link>
          </div>

          {events.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {events.slice(0, 3).map((event, i) => (
                <EventCard key={event.id} event={event} delay={i * 100} />
              ))}
            </div>
          ) : (
            <div
              className="text-center py-16 border"
              style={{ borderColor: "var(--border)", backgroundColor: "var(--surface)" }}
            >
              <Calendar size={40} className="mx-auto mb-4 opacity-30" />
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                Não existem eventos futuros de momento.
              </p>
            </div>
          )}

          <Link
            to="/eventos"
            className="sm:hidden mt-8 flex items-center gap-2 justify-center text-sm font-medium"
            style={{ color: "var(--primary)" }}
          >
            Ver todos os eventos <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* CTA - Become Member */}
      <section
        data-testid="cta-member-section"
        className="py-24 sm:py-32"
        style={{ backgroundColor: "var(--primary)" }}
      >
        <div className="max-w-3xl mx-auto px-4 text-center">
          <Users size={40} className="mx-auto mb-6 text-white/60" />
          <h2
            className="text-3xl sm:text-5xl font-medium text-white mb-4"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Quer juntar-se a nós?
          </h2>
          <p className="text-lg text-white/70 mb-8">
            Faça-se sócio e participe na vida da nossa comunidade.
          </p>
          <Link
            to="/inscricao"
            data-testid="cta-inscricao-btn"
            className="inline-flex items-center gap-2 px-8 py-4 text-sm font-medium tracking-wide transition-all duration-200 hover:opacity-90"
            style={{ backgroundColor: "var(--accent)", color: "white" }}
          >
            Fazer-me Sócio
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}

function EventCard({ event, delay = 0 }) {
  const formatDate = (dateStr) => {
    const d = new Date(dateStr + "T00:00:00");
    const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    return { day: d.getDate(), month: months[d.getMonth()], year: d.getFullYear() };
  };
  const { day, month, year } = formatDate(event.date);

  return (
    <div
      data-testid={`event-card-${event.id}`}
      className="group border transition-all duration-300 hover:-translate-y-1"
      style={{ borderColor: "var(--border)", backgroundColor: "var(--surface)" }}
    >
      <div className="flex">
        <div
          className="flex flex-col items-center justify-center px-5 py-6 min-w-[80px]"
          style={{ backgroundColor: "var(--primary)", color: "white" }}
        >
          <span className="text-2xl font-light" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{day}</span>
          <span className="text-xs uppercase tracking-wider">{month}</span>
          <span className="text-[10px] opacity-60">{year}</span>
        </div>
        <div className="p-5 flex-1">
          <h3
            className="text-lg font-medium mb-2 leading-snug"
            style={{ fontFamily: "'Cormorant Garamond', serif", color: "var(--text-primary)" }}
          >
            {event.title}
          </h3>
          <p className="text-xs mb-3 line-clamp-2" style={{ color: "var(--text-secondary)" }}>
            {event.description}
          </p>
          <div className="flex flex-wrap gap-3 text-xs" style={{ color: "var(--text-secondary)" }}>
            {event.time && (
              <span className="flex items-center gap-1">
                <Clock size={12} /> {event.time}
              </span>
            )}
            {event.location && (
              <span className="flex items-center gap-1">
                <MapPin size={12} /> {event.location}
              </span>
            )}
          </div>
          {event.price && (
            <span
              className="inline-block mt-3 text-xs font-semibold px-2 py-1"
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
