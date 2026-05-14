import React, { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
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

export default function ServicosPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/services`).then(r => { setServices(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  return (
    <div>
      <section className="pt-32 pb-16 sm:pt-40 sm:pb-20 bg-[var(--green-900)]">
        <div className="max-w-4xl mx-auto px-5 sm:px-8 text-center">
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-[var(--green-500)] mb-3">O que oferecemos</span>
          <h1 className="text-4xl sm:text-6xl font-bold text-white anim-fade-up d1">Servicos</h1>
        </div>
      </section>

      <section data-testid="services-section" className="py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 space-y-20">
          {loading ? (
            <div className="text-center py-16"><div className="w-8 h-8 border-2 border-[var(--green-700)] border-t-transparent rounded-full animate-spin mx-auto" /></div>
          ) : services.length > 0 ? (
            services.map((s, i) => (
              <SR key={s.id}>
                <div data-testid={`service-${s.id}`} className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                  <div className={i % 2 !== 0 ? "lg:order-2" : ""}>
                    <span className="text-xs font-semibold tracking-widest uppercase text-[var(--green-700)] mb-3 block">{s.tag}</span>
                    <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-4">{s.title}</h2>
                    <p className="text-base text-[var(--text-secondary)] leading-relaxed mb-5">{s.description}</p>
                    {s.note && <span className="inline-block text-sm font-medium px-4 py-2 rounded-lg bg-[var(--green-100)] text-[var(--green-700)] mb-5">{s.note}</span>}
                    <div>
                      <Link to="/contactos" className="group inline-flex items-center gap-2 text-sm font-semibold text-[var(--green-700)] hover:gap-2.5 transition-all">
                        Saber mais <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                      </Link>
                    </div>
                  </div>
                  <div className={`iz rounded-xl overflow-hidden ${i % 2 !== 0 ? "lg:order-1" : ""}`}>
                    {s.image_url ? <img src={s.image_url} alt={s.title} className="w-full aspect-[3/2] object-cover" /> : <div className="w-full aspect-[3/2] bg-[var(--surface-alt)] flex items-center justify-center text-[var(--text-muted)]">Sem imagem</div>}
                  </div>
                </div>
              </SR>
            ))
          ) : (
            <p className="text-center text-[var(--text-secondary)] py-16">Sem servicos de momento.</p>
          )}
        </div>
      </section>

      <section className="py-20 bg-[var(--surface-alt)]">
        <div className="max-w-3xl mx-auto px-5 sm:px-8 text-center">
          <SR>
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-4">Interessado nos nossos servicos?</h2>
            <p className="text-base text-[var(--text-secondary)] mb-8">Entre em contacto para mais informacoes.</p>
            <Link to="/contactos" data-testid="services-contact-cta"
              className="inline-flex items-center gap-2 px-7 py-3.5 text-sm font-semibold text-white rounded-lg btn-shine transition-all hover:brightness-110"
              style={{ backgroundColor: "var(--green-700)" }}>
              Contactar <ArrowRight size={14} />
            </Link>
          </SR>
        </div>
      </section>
    </div>
  );
}
