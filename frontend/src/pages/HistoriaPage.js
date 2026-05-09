import React from "react";

const HISTORY_IMG = "https://images.unsplash.com/photo-1774891937673-9186e930a18e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjY2NzZ8MHwxfHNlYXJjaHwyfHx2aW50YWdlJTIwbGV0dGVyJTIwd2F4JTIwc2VhbHxlbnwwfHx8fDE3NzgzNTMzOTZ8MA&ixlib=rb-4.1.0&q=85";
const BUILDING_IMG = "https://images.unsplash.com/photo-1765101159803-9d9dbf0ba4ac?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2ODh8MHwxfHNlYXJjaHwyfHxQb3J0dWd1ZXNlJTIwdHJhZGl0aW9uYWwlMjBzdG9uZSUyMGJ1aWxkaW5nJTIwZmFjYWRlfGVufDB8fHx8MTc3ODM1MzQ3M3ww&ixlib=rb-4.1.0&q=85";

const TIMELINE = [
  { year: "1911", title: "Fundação", desc: "A Sociedade Recreativa Desportiva e Familiar de São João das Lampas é fundada a 29 de Julho de 1911 por um grupo de cidadãos da freguesia." },
  { year: "1920s", title: "Primeiras Atividades", desc: "Início das atividades desportivas e culturais. A sociedade torna-se o centro de convívio da comunidade local." },
  { year: "1950s", title: "Expansão", desc: "Construção do salão de festas e inauguração de novas instalações para a prática desportiva." },
  { year: "1970s", title: "Grupo de Teatro", desc: "Criação do grupo de teatro amador, que se torna uma das atividades mais emblemáticas da sociedade." },
  { year: "1990s", title: "Modernização", desc: "Obras de renovação das instalações e diversificação das atividades oferecidas aos sócios e à comunidade." },
  { year: "2011", title: "Centenário", desc: "Celebração do centenário da sociedade com eventos especiais e homenagens aos fundadores." },
  { year: "Hoje", title: "Ao Serviço da Comunidade", desc: "Continuamos a servir a comunidade de São João das Lampas com atividades culturais, desportivas e recreativas." },
];

export default function HistoriaPage() {
  return (
    <div>
      {/* Page Header */}
      <section className="relative py-24 sm:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${BUILDING_IMG})` }} />
        <div className="absolute inset-0" style={{ backgroundColor: "rgba(13, 107, 79, 0.8)" }} />
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <p className="text-xs uppercase tracking-[0.3em] font-semibold mb-4" style={{ color: "var(--accent)" }}>
            Desde 1911
          </p>
          <h1
            className="text-4xl sm:text-6xl font-light text-white"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            A Nossa História
          </h1>
        </div>
      </section>

      {/* Intro */}
      <section className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] font-semibold mb-4" style={{ color: "var(--accent)" }}>
                A nossa identidade
              </p>
              <h2
                className="text-3xl sm:text-4xl font-medium mb-6"
                style={{ fontFamily: "'Cormorant Garamond', serif", color: "var(--text-primary)" }}
              >
                Mais de um Século de Tradição
              </h2>
              <div className="space-y-4 text-base leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                <p>
                  A Sociedade Recreativa Desportiva e Familiar de São João das Lampas foi fundada 
                  a 29 de Julho de 1911, fruto da vontade de um grupo de cidadãos empenhados em 
                  criar um espaço de convívio, cultura e desporto para a comunidade.
                </p>
                <p>
                  Ao longo de mais de 110 anos, a SRDFSIL tem sido um pilar fundamental na vida 
                  social e cultural de São João das Lampas, promovendo atividades que vão desde o 
                  teatro e o desporto até às festas tradicionais que unem gerações.
                </p>
                <p>
                  A nossa sede, localizada na Avenida Central, é o ponto de encontro de sócios e 
                  amigos, um espaço onde se preservam tradições e se criam novas memórias.
                </p>
              </div>
            </div>
            <div className="relative">
              <img
                src={HISTORY_IMG}
                alt="História da SRDFSIL"
                className="w-full aspect-[4/3] object-cover"
                data-testid="history-image"
              />
              <div
                className="absolute -bottom-6 -left-6 px-6 py-4"
                style={{ backgroundColor: "var(--primary)" }}
              >
                <p className="text-3xl font-light text-white" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  1911
                </p>
                <p className="text-xs text-white/70 tracking-wider uppercase">Fundação</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section
        data-testid="timeline-section"
        className="py-20 sm:py-28"
        style={{ backgroundColor: "var(--surface-secondary)" }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2
            className="text-3xl sm:text-4xl font-medium text-center mb-16"
            style={{ fontFamily: "'Cormorant Garamond', serif", color: "var(--text-primary)" }}
          >
            Cronologia
          </h2>
          <div className="relative">
            {/* Vertical line */}
            <div
              className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px"
              style={{ backgroundColor: "var(--primary)", opacity: 0.2 }}
            />
            {TIMELINE.map((item, i) => (
              <div
                key={item.year}
                className={`relative flex items-start gap-6 mb-12 ${
                  i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                }`}
              >
                <div className={`flex-1 ${i % 2 === 0 ? "md:text-right" : "md:text-left"} hidden md:block`}>
                  {i % 2 === 0 && <TimelineContent item={item} />}
                </div>
                <div
                  className="relative z-10 w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                  style={{ borderColor: "var(--primary)", backgroundColor: "var(--bg)" }}
                >
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "var(--primary)" }} />
                </div>
                <div className={`flex-1 ${i % 2 === 0 ? "md:text-left" : "md:text-right"} md:hidden`}>
                  <TimelineContent item={item} />
                </div>
                <div className={`flex-1 hidden md:block ${i % 2 !== 0 ? "md:text-right" : ""}`}>
                  {i % 2 !== 0 && <TimelineContent item={item} />}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function TimelineContent({ item }) {
  return (
    <div>
      <span className="text-xs uppercase tracking-[0.2em] font-semibold" style={{ color: "var(--accent)" }}>
        {item.year}
      </span>
      <h3
        className="text-xl font-medium mt-1 mb-2"
        style={{ fontFamily: "'Cormorant Garamond', serif", color: "var(--text-primary)" }}
      >
        {item.title}
      </h3>
      <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
        {item.desc}
      </p>
    </div>
  );
}
