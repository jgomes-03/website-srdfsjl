import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const SERVICES = [
  {
    id: "teatro",
    title: "Grupo de Teatro",
    subtitle: "Cultura & Espetaculo",
    description: "O nosso grupo de teatro amador e uma das atividades mais emblematicas da sociedade. Com pecas originais e adaptacoes, os nossos atores levam ao palco historias que fazem rir e emocionar o publico.",
    image: "https://images.pexels.com/photos/19658083/pexels-photo-19658083.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    highlight: "Proxima peca: Que Grande Mixordia",
  },
  {
    id: "desporto",
    title: "Atividades Desportivas",
    subtitle: "Desporto & Saude",
    description: "Promovemos diversas atividades desportivas ao longo do ano, incluindo torneios de futebol de salao, caminhadas, ginastica e muito mais. O desporto e parte fundamental da nossa missao.",
    image: "https://images.unsplash.com/photo-1771909719482-4f95e62f41a7?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA3MDB8MHwxfHNlYXJjaHwyfHxpbmRvb3IlMjBzcG9ydHMlMjBoYWxsfGVufDB8fHx8MTc3ODM1MzM5Mnww&ixlib=rb-4.1.0&q=85",
    highlight: "Torneios anuais abertos a todos",
  },
  {
    id: "salao",
    title: "Aluguer de Salao",
    subtitle: "Eventos & Celebracoes",
    description: "O nosso salao esta disponivel para aluguer para festas, casamentos, batizados e outros eventos. Um espaco versatil e acolhedor no coracao de S. Joao das Lampas.",
    image: "https://images.unsplash.com/photo-1778086170602-f40da010e5fb?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMjV8MHwxfHNlYXJjaHwyfHxjb21tdW5pdHklMjBnYXRoZXJpbmclMjBoYWxsfGVufDB8fHx8MTc3ODM1MzM5Nnww&ixlib=rb-4.1.0&q=85",
    highlight: "Contacte-nos para reservas",
  },
];

function RevealSection({ children, className = "", delay = 0 }) {
  const [ref, visible] = useScrollReveal(0.1);
  return (
    <div ref={ref} className={`reveal ${visible ? "visible" : ""} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

export default function ServicosPage() {
  return (
    <div>
      <section className="relative py-24 sm:py-32 overflow-hidden" style={{ background: "linear-gradient(135deg, var(--primary) 0%, #1a9d74 100%)" }}>
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <p className="text-xs uppercase tracking-[0.4em] font-semibold mb-4" style={{ color: "var(--accent)" }}>O que oferecemos</p>
          <h1 className="text-4xl sm:text-7xl font-light text-white animate-fade-in-up" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Servicos
          </h1>
        </div>
      </section>

      <section data-testid="services-section" className="py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-28">
            {SERVICES.map((service, i) => (
              <RevealSection key={service.id}>
                <div
                  data-testid={`service-${service.id}`}
                  className={`grid grid-cols-1 lg:grid-cols-2 gap-14 items-center`}
                >
                  <div className={i % 2 !== 0 ? "lg:order-2" : ""}>
                    <p className="text-xs uppercase tracking-[0.25em] font-semibold mb-4" style={{ color: "var(--accent)" }}>
                      {service.subtitle}
                    </p>
                    <h2 className="text-3xl sm:text-5xl font-medium mb-5 accent-line leading-tight" style={{ fontFamily: "'Cormorant Garamond', serif", color: "var(--text-primary)" }}>
                      {service.title}
                    </h2>
                    <p className="text-base leading-relaxed mb-6" style={{ color: "var(--text-secondary)" }}>
                      {service.description}
                    </p>
                    {service.highlight && (
                      <div className="inline-block px-5 py-2.5 text-sm font-medium rounded-full mb-6" style={{ backgroundColor: "var(--primary-light)", color: "var(--primary)" }}>
                        {service.highlight}
                      </div>
                    )}
                    <div>
                      <Link
                        to="/contactos"
                        className="group inline-flex items-center gap-2 text-sm font-semibold tracking-wide transition-all duration-300 hover:gap-3"
                        style={{ color: "var(--primary)" }}
                      >
                        Saber mais <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                      </Link>
                    </div>
                  </div>
                  <div className={i % 2 !== 0 ? "lg:order-1" : ""}>
                    <div className="img-zoom rounded-2xl overflow-hidden shadow-xl">
                      <img src={service.image} alt={service.title} className="w-full aspect-[4/3] object-cover" />
                    </div>
                  </div>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 relative noise-overlay" style={{ backgroundColor: "var(--surface-secondary)" }}>
        <div className="max-w-3xl mx-auto px-4 text-center relative z-10">
          <RevealSection>
            <h2 className="text-3xl sm:text-5xl font-medium mb-5" style={{ fontFamily: "'Cormorant Garamond', serif", color: "var(--text-primary)" }}>
              Interessado nos nossos servicos?
            </h2>
            <p className="text-base mb-10" style={{ color: "var(--text-secondary)" }}>
              Entre em contacto connosco para mais informacoes.
            </p>
            <Link
              to="/contactos"
              data-testid="services-contact-cta"
              className="inline-flex items-center gap-2 px-8 py-4 text-sm font-semibold text-white tracking-wide rounded-full btn-glow transition-all duration-300 hover:shadow-xl hover:scale-105"
              style={{ backgroundColor: "var(--primary)" }}
            >
              Contactar <ArrowUpRight size={16} />
            </Link>
          </RevealSection>
        </div>
      </section>
    </div>
  );
}
