import React from "react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const HERO_IMG = "https://customer-assets.emergentagent.com/job_sao-joao-lampas/artifacts/pq2xl0vj_Imagem-WhatsApp-2023-03-03-as-11.53.14.jpg";
const HISTORY_IMG = "https://images.unsplash.com/photo-1774891937673-9186e930a18e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjY2NzZ8MHwxfHNlYXJjaHwyfHx2aW50YWdlJTIwbGV0dGVyJTIwd2F4JTIwc2VhbHxlbnwwfHx8fDE3NzgzNTMzOTZ8MA&ixlib=rb-4.1.0&q=85";

const TIMELINE = [
  { year: "1911", title: "Fundacao", desc: "A Sociedade Recreativa Desportiva e Familiar de S. Joao das Lampas e fundada a 29 de Julho de 1911 por um grupo de cidadaos da freguesia." },
  { year: "1920s", title: "Primeiras Atividades", desc: "Inicio das atividades desportivas e culturais. A sociedade torna-se o centro de convivio da comunidade local." },
  { year: "1950s", title: "Expansao", desc: "Construcao do salao de festas e inauguracao de novas instalacoes para a pratica desportiva." },
  { year: "1970s", title: "Grupo de Teatro", desc: "Criacao do grupo de teatro amador, que se torna uma das atividades mais emblematicas da sociedade." },
  { year: "1990s", title: "Modernizacao", desc: "Obras de renovacao das instalacoes e diversificacao das atividades oferecidas aos socios e a comunidade." },
  { year: "2011", title: "Centenario", desc: "Celebracao do centenario da sociedade com eventos especiais e homenagens aos fundadores." },
  { year: "Hoje", title: "Ao Servico da Comunidade", desc: "Continuamos a servir a comunidade de S. Joao das Lampas com atividades culturais, desportivas e recreativas." },
];

function RevealSection({ children, className = "", delay = 0 }) {
  const [ref, visible] = useScrollReveal(0.1);
  return (
    <div ref={ref} className={`reveal ${visible ? "visible" : ""} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

export default function HistoriaPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative py-28 sm:py-36 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${HERO_IMG})`, filter: "brightness(0.4)" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(13,107,79,0.8) 0%, rgba(0,0,0,0.6) 100%)" }} />
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <p className="text-xs uppercase tracking-[0.4em] font-semibold mb-5" style={{ color: "var(--accent)" }}>
            Desde 29 de Julho de 1911
          </p>
          <h1
            className="text-4xl sm:text-7xl font-light text-white animate-fade-in-up"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            A Nossa <span className="italic font-medium">Historia</span>
          </h1>
        </div>
      </section>

      {/* Intro */}
      <section className="py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <RevealSection>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] font-semibold mb-4" style={{ color: "var(--accent)" }}>
                  A nossa identidade
                </p>
                <h2
                  className="text-3xl sm:text-5xl font-medium mb-8 leading-tight accent-line"
                  style={{ fontFamily: "'Cormorant Garamond', serif", color: "var(--text-primary)" }}
                >
                  Mais de um Seculo<br />de Tradicao
                </h2>
                <div className="space-y-5 text-base leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  <p>
                    A Sociedade Recreativa Desportiva e Familiar de S. Joao das Lampas foi fundada 
                    a 29 de Julho de 1911, fruto da vontade de um grupo de cidadaos empenhados em 
                    criar um espaco de convivio, cultura e desporto para a comunidade.
                  </p>
                  <p>
                    Ao longo de mais de 110 anos, a SRDFSIL tem sido um pilar fundamental na vida 
                    social e cultural de S. Joao das Lampas, promovendo atividades que vao desde o 
                    teatro e o desporto ate as festas tradicionais que unem geracoes.
                  </p>
                  <p>
                    A nossa sede, localizada na Avenida Central, e o ponto de encontro de socios e 
                    amigos, um espaco onde se preservam tradicoes e se criam novas memorias.
                  </p>
                </div>
              </div>
              <div className="relative">
                <div className="img-zoom rounded-2xl overflow-hidden shadow-xl">
                  <img
                    src={HISTORY_IMG}
                    alt="Historia da SRDFSIL"
                    className="w-full aspect-[4/3] object-cover"
                    data-testid="history-image"
                  />
                </div>
                <div
                  className="absolute -bottom-6 -left-6 px-6 py-4 rounded-xl shadow-xl"
                  style={{ backgroundColor: "var(--primary)" }}
                >
                  <p className="text-3xl font-light text-white" style={{ fontFamily: "'Cormorant Garamond', serif" }}>1911</p>
                  <p className="text-[10px] text-white/60 tracking-widest uppercase">Fundacao</p>
                </div>
              </div>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* Timeline */}
      <section
        data-testid="timeline-section"
        className="py-24 sm:py-32 relative noise-overlay"
        style={{ backgroundColor: "var(--surface-secondary)" }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
          <RevealSection>
            <div className="text-center mb-20">
              <p className="text-xs uppercase tracking-[0.25em] font-semibold mb-3" style={{ color: "var(--accent)" }}>
                Marcos historicos
              </p>
              <h2
                className="text-3xl sm:text-5xl font-medium"
                style={{ fontFamily: "'Cormorant Garamond', serif", color: "var(--text-primary)" }}
              >
                Cronologia
              </h2>
            </div>
          </RevealSection>
          
          <div className="relative">
            <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px" style={{ background: "linear-gradient(to bottom, var(--primary), var(--accent))", opacity: 0.3 }} />
            {TIMELINE.map((item, i) => (
              <RevealSection key={item.year} delay={i * 80}>
                <div className={`relative flex items-start gap-8 mb-14 ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}>
                  <div className={`flex-1 ${i % 2 === 0 ? "md:text-right" : "md:text-left"} hidden md:block`}>
                    {i % 2 === 0 && <TimelineContent item={item} />}
                  </div>
                  <div className="relative z-10 w-10 h-10 rounded-full border-2 flex items-center justify-center flex-shrink-0 shadow-md" style={{ borderColor: "var(--primary)", backgroundColor: "var(--bg)" }}>
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "var(--accent)" }} />
                  </div>
                  <div className={`flex-1 ${i % 2 === 0 ? "md:text-left" : "md:text-right"} md:hidden`}>
                    <TimelineContent item={item} />
                  </div>
                  <div className={`flex-1 hidden md:block ${i % 2 !== 0 ? "md:text-right" : ""}`}>
                    {i % 2 !== 0 && <TimelineContent item={item} />}
                  </div>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function TimelineContent({ item }) {
  return (
    <div
      className="p-5 rounded-xl border transition-all duration-300 hover:-translate-y-1"
      style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}
    >
      <span className="text-xs uppercase tracking-[0.2em] font-bold" style={{ color: "var(--accent)" }}>
        {item.year}
      </span>
      <h3 className="text-xl font-medium mt-1 mb-2" style={{ fontFamily: "'Cormorant Garamond', serif", color: "var(--text-primary)" }}>
        {item.title}
      </h3>
      <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{item.desc}</p>
    </div>
  );
}
