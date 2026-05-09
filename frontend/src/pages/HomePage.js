import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Calendar, ArrowRight, Clock, MapPin, ArrowUpRight, Theater, Trophy, Building2 } from "lucide-react";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const HERO_IMG = "https://customer-assets.emergentagent.com/job_sao-joao-lampas/artifacts/pq2xl0vj_Imagem-WhatsApp-2023-03-03-as-11.53.14.jpg";

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

export default function HomePage() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    axios.get(`${API}/events/upcoming`).then(r => setEvents(r.data)).catch(() => {});
  }, []);

  return (
    <div>
      {/* HERO - clean, full-viewport with building photo */}
      <section data-testid="hero-section" className="relative min-h-screen flex items-center">
        <div className="absolute inset-0">
          <img src={HERO_IMG} alt="" className="w-full h-full object-cover object-right-top" style={{ filter: "brightness(0.5) saturate(0.8)" }} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(11,61,46,0.92) 0%, rgba(11,61,46,0.75) 50%, rgba(11,61,46,0.6) 100%)" }} />
        </div>
        <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8 w-full pt-24 pb-20">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm mb-8 opacity-0 anim-fade-up d1">
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--green-500)]" />
              <span className="text-xs font-medium text-white/70 tracking-wide">Desde 1911 &mdash; S. Joao das Lampas</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white leading-[1.05] mb-6 opacity-0 anim-fade-up d2">
              <span className="block">Sociedade Recreativa</span>
              <span className="block">Desportiva <span className="text-[var(--green-500)]">&</span> Familiar</span>
              <span className="block text-white/50 text-[0.55em] font-medium mt-2 tracking-wide">de São João das Lampas</span>
            </h1>
            <p className="text-base sm:text-lg text-white/60 max-w-lg mb-10 leading-relaxed opacity-0 anim-fade-up d3">
              Cultura, desporto, teatro e convivio. Mais de 114 anos ao servico da nossa comunidade.
            </p>
            <div className="flex flex-wrap gap-3 opacity-0 anim-fade-up d4">
              <Link
                to="/inscricao"
                data-testid="hero-cta-socio"
                className="group inline-flex items-center gap-2.5 px-7 py-3.5 text-sm font-semibold text-white rounded-lg btn-shine transition-all hover:brightness-110"
                style={{ backgroundColor: "var(--green-700)" }}
              >
                Fazer-me Socio
                <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                to="/eventos"
                data-testid="hero-cta-eventos"
                className="group inline-flex items-center gap-2.5 px-7 py-3.5 text-sm font-semibold rounded-lg border border-white/20 text-white hover:bg-white/10 transition-all"
              >
                Proximos Eventos
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* STATS - floating card */}
      <section className="relative z-20 -mt-16 px-5 sm:px-8">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl border border-[var(--border-light)] overflow-hidden">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-[var(--border-light)]">
            {[
              { val: "1911", label: "Fundacao" },
              { val: "114", label: "Anos" },
              { val: "500+", label: "Socios" },
              { val: "50+", label: "Eventos/Ano" },
            ].map(s => (
              <div key={s.label} className="text-center py-7 px-4">
                <p className="text-2xl sm:text-3xl font-bold text-[var(--green-700)]">{s.val}</p>
                <p className="text-[11px] font-medium text-[var(--text-muted)] tracking-wider uppercase mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT teaser */}
      <section className="py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <SR>
            <div className="max-w-2xl mx-auto text-center mb-16">
              <span className="inline-block text-xs font-semibold tracking-widest uppercase text-[var(--green-700)] mb-3">Quem somos</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-5">
                O coracao de S. Joao das Lampas
              </h2>
              <p className="text-base text-[var(--text-secondary)] leading-relaxed">
                Ha mais de um seculo, a SRDFSIL e o ponto de encontro da nossa comunidade. 
                Um espaco onde se vive o desporto, a cultura e a tradicao.
              </p>
            </div>
          </SR>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { icon: Theater, title: "Teatro", desc: "Grupo de teatro amador com pecas que encantam a comunidade.", color: "var(--green-700)" },
              { icon: Trophy, title: "Desporto", desc: "Torneios, caminhadas e atividades para todas as idades.", color: "var(--green-600)" },
              { icon: Building2, title: "Espaco", desc: "Salao disponivel para eventos, festas e celebracoes.", color: "var(--green-500)" },
            ].map((s, i) => (
              <SR key={s.title} delay={i * 120}>
                <Link
                  to="/servicos"
                  className="group block p-7 rounded-xl border border-[var(--border)] bg-white lift"
                >
                  <div className="w-11 h-11 rounded-lg flex items-center justify-center mb-5" style={{ backgroundColor: "var(--green-100)" }}>
                    <s.icon size={20} style={{ color: s.color }} />
                  </div>
                  <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2 flex items-center gap-2">
                    {s.title}
                    <ArrowUpRight size={14} className="text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{s.desc}</p>
                </Link>
              </SR>
            ))}
          </div>
        </div>
      </section>

      {/* EVENTS */}
      <section data-testid="upcoming-events-section" className="py-24 sm:py-32 bg-[var(--surface-alt)]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <SR>
            <div className="flex items-end justify-between mb-10">
              <div>
                <span className="text-xs font-semibold tracking-widest uppercase text-[var(--green-700)] mb-2 block">Agenda</span>
                <h2 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)]">Proximos Eventos</h2>
              </div>
              <Link
                to="/eventos"
                data-testid="events-view-all"
                className="hidden sm:inline-flex items-center gap-2 text-sm font-semibold text-[var(--green-700)] hover:gap-2.5 transition-all group"
              >
                Ver todos <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </SR>

          {events.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {events.slice(0, 3).map((ev, i) => (
                <SR key={ev.id} delay={i * 120}>
                  <EventCard event={ev} />
                </SR>
              ))}
            </div>
          ) : (
            <SR>
              <div className="text-center py-20 bg-white rounded-xl border border-[var(--border)]">
                <Calendar size={36} className="mx-auto mb-3 text-[var(--text-muted)]" />
                <p className="text-sm text-[var(--text-secondary)]">Sem eventos futuros de momento.</p>
              </div>
            </SR>
          )}

          <Link to="/eventos" className="sm:hidden mt-6 flex items-center gap-2 justify-center text-sm font-semibold text-[var(--green-700)]">
            Ver todos os eventos <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section data-testid="cta-member-section" className="py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <SR>
            <div className="relative rounded-2xl overflow-hidden" style={{ backgroundColor: "var(--green-900)" }}>
              <div className="absolute inset-0 opacity-10">
                <img src={HERO_IMG} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="relative z-10 px-8 sm:px-16 py-16 sm:py-20 text-center">
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                  Quer juntar-se a nos?
                </h2>
                <p className="text-base text-white/50 mb-8 max-w-md mx-auto">
                  Faca-se socio e participe na vida da nossa comunidade.
                </p>
                <Link
                  to="/inscricao"
                  data-testid="cta-inscricao-btn"
                  className="group inline-flex items-center gap-2.5 px-7 py-3.5 text-sm font-semibold text-[var(--green-900)] rounded-lg btn-shine transition-all hover:brightness-95"
                  style={{ backgroundColor: "var(--white)" }}
                >
                  Fazer-me Socio
                  <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>
          </SR>
        </div>
      </section>
    </div>
  );
}

function EventCard({ event }) {
  const d = new Date(event.date + "T00:00:00");
  const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

  return (
    <div data-testid={`event-card-${event.id}`} className="bg-white rounded-xl border border-[var(--border)] overflow-hidden lift group">
      <div className="flex items-center gap-4 px-5 py-4 border-b border-[var(--border-light)]">
        <div className="w-12 h-12 rounded-lg flex flex-col items-center justify-center" style={{ backgroundColor: "var(--green-100)" }}>
          <span className="text-lg font-bold text-[var(--green-700)] leading-none">{d.getDate()}</span>
          <span className="text-[9px] font-semibold text-[var(--green-700)] uppercase">{months[d.getMonth()]}</span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-[15px] font-semibold text-[var(--text-primary)] truncate">{event.title}</h3>
          <div className="flex items-center gap-3 mt-0.5 text-[11px] text-[var(--text-muted)]">
            {event.time && <span className="flex items-center gap-1"><Clock size={10} />{event.time}</span>}
            {event.location && <span className="flex items-center gap-1"><MapPin size={10} />{event.location}</span>}
          </div>
        </div>
        {event.price && (
          <span className="text-xs font-semibold px-2.5 py-1 rounded-md text-[var(--green-700)] bg-[var(--green-100)]">{event.price}</span>
        )}
      </div>
      <div className="px-5 py-4">
        <p className="text-sm text-[var(--text-secondary)] line-clamp-2 leading-relaxed">{event.description}</p>
      </div>
    </div>
  );
}
