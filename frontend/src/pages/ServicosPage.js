import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const SERVICES = [
  {
    id: "teatro",
    title: "Grupo de Teatro",
    subtitle: "Cultura & Espetáculo",
    description: "O nosso grupo de teatro amador é uma das atividades mais emblemáticas da sociedade. Com peças originais e adaptações, os nossos atores levam ao palco histórias que fazem rir e emocionar o público.",
    image: "https://images.pexels.com/photos/19658083/pexels-photo-19658083.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    highlight: "Próxima peça: Que Grande Mixórdia",
  },
  {
    id: "desporto",
    title: "Atividades Desportivas",
    subtitle: "Desporto & Saúde",
    description: "Promovemos diversas atividades desportivas ao longo do ano, incluindo torneios de futebol de salão, caminhadas, ginástica e muito mais. O desporto é parte fundamental da nossa missão.",
    image: "https://images.unsplash.com/photo-1771909719482-4f95e62f41a7?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA3MDB8MHwxfHNlYXJjaHwyfHxpbmRvb3IlMjBzcG9ydHMlMjBoYWxsfGVufDB8fHx8MTc3ODM1MzM5Mnww&ixlib=rb-4.1.0&q=85",
    highlight: "Torneios anuais abertos a todos",
  },
  {
    id: "salao",
    title: "Aluguer de Salão",
    subtitle: "Eventos & Celebrações",
    description: "O nosso salão está disponível para aluguer para festas, casamentos, batizados e outros eventos. Um espaço versátil e acolhedor no coração de São João das Lampas.",
    image: "https://images.unsplash.com/photo-1778086170602-f40da010e5fb?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMjV8MHwxfHNlYXJjaHwyfHxjb21tdW5pdHklMjBnYXRoZXJpbmclMjBoYWxsfGVufDB8fHx8MTc3ODM1MzM5Nnww&ixlib=rb-4.1.0&q=85",
    highlight: "Contacte-nos para reservas",
  },
];

export default function ServicosPage() {
  return (
    <div>
      {/* Page Header */}
      <section className="py-20 sm:py-24" style={{ backgroundColor: "var(--primary)" }}>
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-xs uppercase tracking-[0.3em] font-semibold mb-4" style={{ color: "var(--accent)" }}>
            O que oferecemos
          </p>
          <h1
            className="text-4xl sm:text-6xl font-light text-white"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Serviços
          </h1>
        </div>
      </section>

      {/* Services */}
      <section data-testid="services-section" className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-24">
            {SERVICES.map((service, i) => (
              <div
                key={service.id}
                data-testid={`service-${service.id}`}
                className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${
                  i % 2 !== 0 ? "lg:direction-rtl" : ""
                }`}
              >
                <div className={i % 2 !== 0 ? "lg:order-2" : ""}>
                  <p className="text-xs uppercase tracking-[0.2em] font-semibold mb-3" style={{ color: "var(--accent)" }}>
                    {service.subtitle}
                  </p>
                  <h2
                    className="text-3xl sm:text-4xl font-medium mb-4"
                    style={{ fontFamily: "'Cormorant Garamond', serif", color: "var(--text-primary)" }}
                  >
                    {service.title}
                  </h2>
                  <p className="text-base leading-relaxed mb-6" style={{ color: "var(--text-secondary)" }}>
                    {service.description}
                  </p>
                  {service.highlight && (
                    <div
                      className="inline-block px-4 py-2 text-sm font-medium mb-6"
                      style={{ backgroundColor: "var(--surface-secondary)", color: "var(--primary)" }}
                    >
                      {service.highlight}
                    </div>
                  )}
                  <div>
                    <Link
                      to="/contactos"
                      className="inline-flex items-center gap-2 text-sm font-medium transition-colors hover:opacity-70"
                      style={{ color: "var(--primary)" }}
                    >
                      Saber mais <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
                <div className={i % 2 !== 0 ? "lg:order-1" : ""}>
                  <div className="relative overflow-hidden group">
                    <img
                      src={service.image}
                      alt={service.title}
                      className="w-full aspect-[4/3] object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div
                      className="absolute bottom-0 left-0 right-0 h-1"
                      style={{ backgroundColor: "var(--primary)" }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20" style={{ backgroundColor: "var(--surface-secondary)" }}>
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2
            className="text-3xl sm:text-4xl font-medium mb-4"
            style={{ fontFamily: "'Cormorant Garamond', serif", color: "var(--text-primary)" }}
          >
            Interessado nos nossos serviços?
          </h2>
          <p className="text-base mb-8" style={{ color: "var(--text-secondary)" }}>
            Entre em contacto connosco para mais informações sobre qualquer um dos nossos serviços.
          </p>
          <Link
            to="/contactos"
            data-testid="services-contact-cta"
            className="inline-flex items-center gap-2 px-8 py-3.5 text-sm font-medium text-white tracking-wide transition-all duration-200 hover:opacity-90"
            style={{ backgroundColor: "var(--primary)" }}
          >
            Contactar <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}
