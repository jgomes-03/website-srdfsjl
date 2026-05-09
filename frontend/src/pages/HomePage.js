import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Calendar, ArrowRight, Users, MapPin, Clock, Sparkles, ArrowUpRight } from "lucide-react";
import axios from "axios";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { LOGO_URL } from "@/components/SRDFSILLogo";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const HERO_IMG = "https://customer-assets.emergentagent.com/job_sao-joao-lampas/artifacts/pq2xl0vj_Imagem-WhatsApp-2023-03-03-as-11.53.14.jpg";

function RevealSection({ children, className = "", delay = 0 }) {
  const [ref, visible] = useScrollReveal(0.1);
  return (
    <div
      ref={ref}
      className={`reveal ${visible ? "visible" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

export default function HomePage() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    axios.get(`${API}/events/upcoming`).then(r => setEvents(r.data)).catch(() => {});
  }, []);

  return (
    <div>
      {/* Hero Section - Full viewport with real building image */}
      <section
        data-testid="hero-section"
        className="relative min-h-[92vh] flex items-center justify-center overflow-hidden"
      >
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center scale-105"
          style={{
            backgroundImage: `url(${HERO_IMG})`,
            filter: "brightness(0.85)",
          }}
        />
        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(135deg, rgba(13,107,79,0.82) 0%, rgba(10,86,64,0.7) 40%, rgba(0,0,0,0.5) 100%)",
          }}
        />
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div
            className="absolute -top-20 -right-20 w-96 h-96 rounded-full opacity-10"
            style={{ background: "radial-gradient(circle, var(--accent) 0%, transparent 70%)" }}
          />
          <div
            className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full opacity-10"
            style={{ background: "radial-gradient(circle, white 0%, transparent 70%)" }}
          />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center py-24">
          {/* Logo floating */}
          <div className="mb-8 opacity-0 animate-scale-in" style={{ animationDelay: "0.1s", animationFillMode: "forwards" }}>
            <img
              src={LOGO_URL}
              alt="SRDFSIL"
              className="w-20 h-20 sm:w-24 sm:h-24 mx-auto object-contain animate-float drop-shadow-2xl"
            />
          </div>

          <p
            className="text-xs sm:text-sm uppercase tracking-[0.4em] font-semibold mb-5 opacity-0 animate-fade-in-up"
            style={{ color: "var(--accent)", animationDelay: "0.2s", animationFillMode: "forwards" }}
          >
            Desde 1911 &mdash; S. Joao das Lampas
          </p>

          <h1
            className="text-5xl sm:text-7xl lg:text-8xl font-light text-white leading-[0.95] mb-8 opacity-0 animate-fade-in-up"
            style={{ fontFamily: "'Cormorant Garamond', serif", animationDelay: "0.3s", animationFillMode: "forwards" }}
          >
            Sociedade<br />
            <span className="font-medium italic">Recreativa</span>
          </h1>

          <p
            className="text-base sm:text-lg text-white/70 max-w-xl mx-auto mb-12 leading-relaxed opacity-0 animate-fade-in-up"
            style={{ animationDelay: "0.5s", animationFillMode: "forwards" }}
          >
            Desporto, cultura, teatro e convivio no coracao da nossa comunidade. 
            Mais de 110 anos de historia e tradicao.
          </p>

          <div
            className="flex flex-col sm:flex-row gap-4 justify-center opacity-0 animate-fade-in-up"
            style={{ animationDelay: "0.6s", animationFillMode: "forwards" }}
          >
            <Link
              to="/inscricao"
              data-testid="hero-cta-socio"
              className="group inline-flex items-center justify-center gap-3 px-8 py-4 text-sm font-semibold tracking-wide rounded-full btn-glow transition-all duration-300 hover:shadow-2xl hover:scale-105"
              style={{ backgroundColor: "var(--accent)", color: "white" }}
            >
              Fazer-me Socio
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/eventos"
              data-testid="hero-cta-eventos"
              className="group inline-flex items-center justify-center gap-3 px-8 py-4 text-sm font-semibold tracking-wide rounded-full border-2 border-white/30 text-white hover:bg-white/10 transition-all duration-300 hover:border-white/60"
            >
              Ver Eventos
              <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 opacity-0 animate-fade-in" style={{ animationDelay: "1s", animationFillMode: "forwards" }}>
          <div className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-1.5">
            <div className="w-1.5 h-3 rounded-full bg-white/60 animate-bounce" />
          </div>
        </div>
      </section>

      {/* Stats Strip - Modern glass style */}
      <section className="relative -mt-12 z-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div
            className="grid grid-cols-2 md:grid-cols-4 gap-0 rounded-2xl overflow-hidden shadow-2xl"
            style={{ backgroundColor: "var(--surface)" }}
          >
            {[
              { num: "1911", label: "Fundacao", accent: true },
              { num: "114", label: "Anos de Historia" },
              { num: "500+", label: "Socios" },
              { num: "50+", label: "Eventos / Ano" },
            ].map((s, i) => (
              <RevealSection key={s.label} delay={i * 100}>
                <div
                  className="text-center py-8 px-4 relative"
                  style={{
                    borderRight: i < 3 ? "1px solid var(--border)" : "none",
                  }}
                >
                  <p
                    className={`text-3xl sm:text-4xl font-light ${s.accent ? "gradient-text" : ""}`}
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      color: s.accent ? undefined : "var(--primary)",
                    }}
                  >
                    {s.num}
                  </p>
                  <p className="text-[11px] tracking-[0.15em] uppercase mt-2 font-medium" style={{ color: "var(--text-secondary)" }}>
                    {s.label}
                  </p>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* About Teaser */}
      <section className="py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <RevealSection>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] font-semibold mb-4" style={{ color: "var(--accent)" }}>
                  A nossa missao
                </p>
                <h2
                  className="text-3xl sm:text-5xl font-medium leading-tight mb-6 accent-line"
                  style={{ fontFamily: "'Cormorant Garamond', serif", color: "var(--text-primary)" }}
                >
                  Cultura, Desporto<br />e Comunidade
                </h2>
                <p className="text-base sm:text-lg leading-relaxed mb-8" style={{ color: "var(--text-secondary)" }}>
                  Ha mais de um seculo que a SRDFSIL e o coracao cultural e desportivo de S. Joao das Lampas. 
                  Do teatro ao futebol, das festas tradicionais ao convivio diario, somos a casa de todos.
                </p>
                <Link
                  to="/historia"
                  className="group inline-flex items-center gap-2 text-sm font-semibold tracking-wide transition-all duration-300 hover:gap-3"
                  style={{ color: "var(--primary)" }}
                  data-testid="home-about-link"
                >
                  Conhecer a nossa historia
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
              <div className="relative">
                <div className="img-zoom rounded-2xl overflow-hidden shadow-xl">
                  <img
                    src={HERO_IMG}
                    alt="Sede SRDFSIL"
                    className="w-full aspect-[4/3] object-cover"
                  />
                </div>
                {/* Floating badge */}
                <div
                  className="absolute -bottom-6 -left-6 sm:-bottom-8 sm:-left-8 px-6 py-4 rounded-xl shadow-xl"
                  style={{ backgroundColor: "var(--primary)" }}
                >
                  <p className="text-3xl font-light text-white" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                    114
                  </p>
                  <p className="text-[10px] text-white/60 tracking-widest uppercase">Anos</p>
                </div>
              </div>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* Upcoming Events */}
      <section
        data-testid="upcoming-events-section"
        className="py-24 sm:py-32 relative noise-overlay"
        style={{ backgroundColor: "var(--surface-secondary)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <RevealSection>
            <div className="flex items-end justify-between mb-14">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] font-semibold mb-3" style={{ color: "var(--accent)" }}>
                  Agenda
                </p>
                <h2
                  className="text-3xl sm:text-5xl font-medium accent-line"
                  style={{ fontFamily: "'Cormorant Garamond', serif", color: "var(--text-primary)" }}
                >
                  Proximos Eventos
                </h2>
              </div>
              <Link
                to="/eventos"
                data-testid="events-view-all"
                className="hidden sm:inline-flex items-center gap-2 text-sm font-semibold transition-all duration-300 hover:gap-3 group"
                style={{ color: "var(--primary)" }}
              >
                Ver todos
                <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </RevealSection>

          {events.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {events.slice(0, 3).map((event, i) => (
                <RevealSection key={event.id} delay={i * 150}>
                  <EventCard event={event} />
                </RevealSection>
              ))}
            </div>
          ) : (
            <RevealSection>
              <div
                className="text-center py-20 rounded-2xl border"
                style={{ borderColor: "var(--border)", backgroundColor: "var(--surface)" }}
              >
                <Calendar size={44} className="mx-auto mb-4 opacity-20" />
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  Nao existem eventos futuros de momento.
                </p>
              </div>
            </RevealSection>
          )}

          <Link
            to="/eventos"
            className="sm:hidden mt-8 flex items-center gap-2 justify-center text-sm font-semibold"
            style={{ color: "var(--primary)" }}
          >
            Ver todos os eventos <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* Services Preview */}
      <section className="py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <RevealSection>
            <div className="text-center mb-16">
              <p className="text-xs uppercase tracking-[0.25em] font-semibold mb-3" style={{ color: "var(--accent)" }}>
                O que oferecemos
              </p>
              <h2
                className="text-3xl sm:text-5xl font-medium"
                style={{ fontFamily: "'Cormorant Garamond', serif", color: "var(--text-primary)" }}
              >
                As nossas atividades
              </h2>
            </div>
          </RevealSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "Grupo de Teatro",
                desc: "Pecas originais e adaptacoes que fazem rir e emocionar.",
                img: "https://images.pexels.com/photos/19658083/pexels-photo-19658083.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
              },
              {
                title: "Atividades Desportivas",
                desc: "Torneios, caminhadas, ginastica e muito mais.",
                img: "https://images.unsplash.com/photo-1771909719482-4f95e62f41a7?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA3MDB8MHwxfHNlYXJjaHwyfHxpbmRvb3IlMjBzcG9ydHMlMjBoYWxsfGVufDB8fHx8MTc3ODM1MzM5Mnww&ixlib=rb-4.1.0&q=85",
              },
              {
                title: "Aluguer de Salao",
                desc: "Espaco versatil para festas e celebracoes.",
                img: "https://images.unsplash.com/photo-1778086170602-f40da010e5fb?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMjV8MHwxfHNlYXJjaHwyfHxjb21tdW5pdHklMjBnYXRoZXJpbmclMjBoYWxsfGVufDB8fHx8MTc3ODM1MzM5Nnww&ixlib=rb-4.1.0&q=85",
              },
            ].map((s, i) => (
              <RevealSection key={s.title} delay={i * 150}>
                <Link
                  to="/servicos"
                  className="group block hover-lift rounded-2xl overflow-hidden border"
                  style={{ borderColor: "var(--border)", backgroundColor: "var(--surface)" }}
                >
                  <div className="img-zoom aspect-[16/10]">
                    <img src={s.img} alt={s.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-6">
                    <h3
                      className="text-xl font-medium mb-2 flex items-center justify-between"
                      style={{ fontFamily: "'Cormorant Garamond', serif", color: "var(--text-primary)" }}
                    >
                      {s.title}
                      <ArrowUpRight size={18} className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: "var(--primary)" }} />
                    </h3>
                    <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{s.desc}</p>
                  </div>
                </Link>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* CTA - Become Member */}
      <section
        data-testid="cta-member-section"
        className="relative py-28 sm:py-36 overflow-hidden"
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${HERO_IMG})`, filter: "brightness(0.3)" }}
        />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(135deg, rgba(13,107,79,0.85) 0%, rgba(10,40,30,0.9) 100%)" }}
        />
        <div className="relative z-10 max-w-3xl mx-auto px-4 text-center">
          <RevealSection>
            <Sparkles size={32} className="mx-auto mb-6 text-white/40" />
            <h2
              className="text-3xl sm:text-6xl font-light text-white mb-5 leading-tight"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              Quer juntar-se<br /><span className="italic font-medium">a nos?</span>
            </h2>
            <p className="text-base sm:text-lg text-white/60 mb-10 max-w-md mx-auto">
              Faca-se socio e participe na vida da nossa comunidade.
            </p>
            <Link
              to="/inscricao"
              data-testid="cta-inscricao-btn"
              className="group inline-flex items-center gap-3 px-10 py-4 text-sm font-semibold tracking-wide rounded-full btn-glow transition-all duration-300 hover:shadow-2xl hover:scale-105"
              style={{ backgroundColor: "var(--accent)", color: "white" }}
            >
              Fazer-me Socio
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </RevealSection>
        </div>
      </section>
    </div>
  );
}

function EventCard({ event }) {
  const formatDate = (dateStr) => {
    const d = new Date(dateStr + "T00:00:00");
    const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    return { day: d.getDate(), month: months[d.getMonth()], year: d.getFullYear() };
  };
  const { day, month, year } = formatDate(event.date);

  return (
    <div
      data-testid={`event-card-${event.id}`}
      className="group hover-lift rounded-2xl overflow-hidden border"
      style={{ borderColor: "var(--border)", backgroundColor: "var(--surface)" }}
    >
      {/* Date header */}
      <div
        className="flex items-center gap-4 px-6 py-4"
        style={{ background: "linear-gradient(135deg, var(--primary) 0%, #1a9d74 100%)" }}
      >
        <span className="text-3xl font-light text-white" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
          {day}
        </span>
        <div>
          <span className="text-sm text-white font-medium">{month}</span>
          <span className="block text-[10px] text-white/50">{year}</span>
        </div>
        {event.price && (
          <span className="ml-auto text-xs font-bold px-3 py-1 rounded-full text-white" style={{ backgroundColor: "var(--accent)" }}>
            {event.price}
          </span>
        )}
      </div>
      {/* Content */}
      <div className="p-6">
        <h3
          className="text-lg font-medium mb-2 leading-snug"
          style={{ fontFamily: "'Cormorant Garamond', serif", color: "var(--text-primary)" }}
        >
          {event.title}
        </h3>
        <p className="text-xs mb-4 line-clamp-2" style={{ color: "var(--text-secondary)" }}>
          {event.description}
        </p>
        <div className="flex flex-wrap gap-3 text-[11px]" style={{ color: "var(--text-secondary)" }}>
          {event.time && (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ backgroundColor: "var(--surface-secondary)" }}>
              <Clock size={11} /> {event.time}
            </span>
          )}
          {event.location && (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ backgroundColor: "var(--surface-secondary)" }}>
              <MapPin size={11} /> {event.location}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
