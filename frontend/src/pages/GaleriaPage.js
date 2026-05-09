import React, { useState, useEffect } from "react";
import { X, ZoomIn } from "lucide-react";
import axios from "axios";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

function RevealSection({ children, className = "", delay = 0 }) {
  const [ref, visible] = useScrollReveal(0.1);
  return (
    <div ref={ref} className={`reveal ${visible ? "visible" : ""} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

export default function GaleriaPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImg, setSelectedImg] = useState(null);
  const [activeCategory, setActiveCategory] = useState("Todas");

  useEffect(() => {
    axios.get(`${API}/gallery`).then(r => { setItems(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const categories = ["Todas", ...new Set(items.map(i => i.category).filter(Boolean))];
  const filtered = activeCategory === "Todas" ? items : items.filter(i => i.category === activeCategory);

  return (
    <div>
      <section className="relative py-24 sm:py-32 overflow-hidden" style={{ background: "linear-gradient(135deg, var(--primary) 0%, #1a9d74 100%)" }}>
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <p className="text-xs uppercase tracking-[0.4em] font-semibold mb-4" style={{ color: "var(--accent)" }}>Momentos</p>
          <h1 className="text-4xl sm:text-7xl font-light text-white animate-fade-in-up" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Galeria de <span className="italic font-medium">Fotos</span>
          </h1>
        </div>
      </section>

      {/* Category filter */}
      {categories.length > 1 && (
        <section className="py-6 glass border-b sticky top-20 z-30" style={{ borderColor: "var(--border)" }}>
          <div className="max-w-7xl mx-auto px-4 flex gap-2 items-center justify-center flex-wrap">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="px-5 py-2 text-sm font-medium tracking-wide rounded-full transition-all duration-300"
                style={{
                  backgroundColor: activeCategory === cat ? "var(--primary)" : "transparent",
                  color: activeCategory === cat ? "white" : "var(--text-secondary)",
                  border: activeCategory === cat ? "none" : "1px solid var(--border)",
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>
      )}

      <section data-testid="gallery-section" className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-center py-16">
              <div className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin mx-auto" style={{ borderColor: "var(--primary)", borderTopColor: "transparent" }} />
            </div>
          ) : filtered.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((item, i) => (
                <RevealSection key={item.id} delay={i * 80}>
                  <div
                    data-testid={`gallery-item-${item.id}`}
                    className="group cursor-pointer rounded-xl overflow-hidden border hover-lift"
                    style={{ borderColor: "var(--border)" }}
                    onClick={() => setSelectedImg(item)}
                  >
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img src={item.image_url} alt={item.title} className="w-full h-full object-cover transition-transform duration-600 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                        <ZoomIn size={28} className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                    </div>
                    <div className="p-4" style={{ backgroundColor: "var(--surface)" }}>
                      <h3 className="text-base font-medium" style={{ fontFamily: "'Cormorant Garamond', serif", color: "var(--text-primary)" }}>
                        {item.title}
                      </h3>
                      {item.category && (
                        <span className="text-[11px] mt-1 inline-block font-medium tracking-wider uppercase" style={{ color: "var(--accent)" }}>
                          {item.category}
                        </span>
                      )}
                    </div>
                  </div>
                </RevealSection>
              ))}
            </div>
          ) : (
            <div className="text-center py-24">
              <p className="text-lg" style={{ color: "var(--text-secondary)" }}>A galeria esta vazia de momento.</p>
            </div>
          )}
        </div>
      </section>

      {selectedImg && (
        <div
          data-testid="gallery-lightbox"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
          style={{ backgroundColor: "rgba(0,0,0,0.92)" }}
          onClick={() => setSelectedImg(null)}
        >
          <button className="absolute top-6 right-6 text-white/60 hover:text-white transition-colors" onClick={() => setSelectedImg(null)} data-testid="lightbox-close">
            <X size={28} />
          </button>
          <div className="max-w-5xl w-full animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <img src={selectedImg.image_url} alt={selectedImg.title} className="w-full max-h-[80vh] object-contain rounded-lg" />
            <div className="mt-4 text-center">
              <h3 className="text-white text-2xl" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{selectedImg.title}</h3>
              {selectedImg.description && <p className="text-white/50 text-sm mt-1">{selectedImg.description}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
