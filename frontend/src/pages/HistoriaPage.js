import React, { useRef, useState, useEffect } from "react";

const HERO_IMG = "https://customer-assets.emergentagent.com/job_sao-joao-lampas/artifacts/pq2xl0vj_Imagem-WhatsApp-2023-03-03-as-11.53.14.jpg";

const TIMELINE = [
  { year: "1911", title: "Fundacao", desc: "A Sociedade Recreativa Desportiva e Familiar de S. Joao das Lampas e fundada a 29 de Julho de 1911." },
  { year: "1920s", title: "Primeiras Atividades", desc: "Inicio das atividades desportivas e culturais, tornando-se o centro de convivio da comunidade." },
  { year: "1950s", title: "Expansao", desc: "Construcao do salao de festas e novas instalacoes para a pratica desportiva." },
  { year: "1970s", title: "Grupo de Teatro", desc: "Criacao do grupo de teatro amador, uma das atividades mais emblematicas da sociedade." },
  { year: "1990s", title: "Modernizacao", desc: "Obras de renovacao e diversificacao das atividades oferecidas." },
  { year: "2011", title: "Centenario", desc: "Celebracao dos 100 anos com eventos especiais e homenagens aos fundadores." },
  { year: "Hoje", title: "Ao Servico da Comunidade", desc: "Continuamos a servir S. Joao das Lampas com cultura, desporto e recreacao." },
];

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

export default function HistoriaPage() {
  return (
    <div>
      {/* Header */}
      <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28">
        <div className="absolute inset-0">
          <img src={HERO_IMG} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-[var(--green-900)]/85 to-[var(--green-900)]/95" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-5 sm:px-8 text-center">
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-[var(--green-500)] mb-4">Desde 1911</span>
          <h1 className="text-4xl sm:text-6xl font-bold text-white anim-fade-up d1">A Nossa Historia</h1>
        </div>
      </section>

      {/* Intro */}
      <section className="py-24 sm:py-32">
        <div className="max-w-4xl mx-auto px-5 sm:px-8">
          <SR>
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-6">Mais de um Seculo de Tradicao</h2>
              <div className="space-y-4 text-base text-[var(--text-secondary)] leading-relaxed max-w-2xl mx-auto">
                <p>A SRDFSJL foi fundada a 29 de Julho de 1911 por um grupo de cidadaos empenhados em criar um espaco de convivio, cultura e desporto para a comunidade.</p>
                <p>Ao longo de mais de 110 anos, tem sido um pilar fundamental na vida social e cultural de S. Joao das Lampas.</p>
              </div>
            </div>
          </SR>
        </div>
      </section>

      {/* Timeline */}
      <section data-testid="timeline-section" className="py-20 sm:py-28 bg-[var(--surface-alt)]">
        <div className="max-w-3xl mx-auto px-5 sm:px-8">
          <SR><h2 className="text-3xl font-bold text-[var(--text-primary)] text-center mb-16">Cronologia</h2></SR>
          <div className="relative">
            <div className="absolute left-6 md:left-1/2 md:-translate-x-px top-0 bottom-0 w-0.5 bg-[var(--border)]" />
            {TIMELINE.map((item, i) => (
              <SR key={item.year} delay={i * 80}>
                <div className={`relative flex items-start gap-6 mb-10 ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}>
                  <div className={`flex-1 hidden md:block ${i % 2 === 0 ? "text-right" : "text-left"}`}>
                    {i % 2 === 0 && <TL item={item} />}
                    {i % 2 !== 0 && <TL item={item} />}
                  </div>
                  <div className="relative z-10 w-12 h-12 rounded-full bg-white border-2 border-[var(--green-700)] flex items-center justify-center flex-shrink-0 shadow-sm">
                    <span className="text-[10px] font-bold text-[var(--green-700)]">{item.year.slice(0,4)}</span>
                  </div>
                  <div className="flex-1 md:hidden"><TL item={item} /></div>
                  <div className="flex-1 hidden md:block" />
                </div>
              </SR>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function TL({ item }) {
  return (
    <div className="p-5 rounded-xl bg-white border border-[var(--border)] hover:border-[var(--green-700)]/20 transition-colors">
      <span className="text-xs font-bold text-[var(--green-700)]">{item.year}</span>
      <h3 className="text-base font-semibold text-[var(--text-primary)] mt-1 mb-1.5">{item.title}</h3>
      <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{item.desc}</p>
    </div>
  );
}
