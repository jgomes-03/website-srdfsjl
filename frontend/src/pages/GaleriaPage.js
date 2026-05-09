import React, { useState, useEffect, useRef } from "react";
import { X, ZoomIn } from "lucide-react";
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

export default function GaleriaPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sel, setSel] = useState(null);
  const [cat, setCat] = useState("Todas");

  useEffect(() => {
    axios.get(`${API}/gallery`).then(r => { setItems(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const cats = ["Todas", ...new Set(items.map(i => i.category).filter(Boolean))];
  const shown = cat === "Todas" ? items : items.filter(i => i.category === cat);

  return (
    <div>
      <section className="pt-32 pb-16 sm:pt-40 sm:pb-20 bg-[var(--green-900)]">
        <div className="max-w-4xl mx-auto px-5 sm:px-8 text-center">
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-[var(--green-500)] mb-3">Momentos</span>
          <h1 className="text-4xl sm:text-6xl font-bold text-white anim-fade-up d1">Galeria</h1>
        </div>
      </section>

      {cats.length > 1 && (
        <section className="sticky top-[72px] z-30 bg-white/90 backdrop-blur-xl border-b border-[var(--border-light)] py-4">
          <div className="max-w-7xl mx-auto px-5 sm:px-8 flex gap-2 justify-center flex-wrap">
            {cats.map(c => (
              <button key={c} onClick={() => setCat(c)}
                className={`px-5 py-2 text-sm font-medium rounded-lg transition-all ${cat === c ? "bg-[var(--green-700)] text-white" : "text-[var(--text-secondary)] border border-[var(--border)]"}`}
              >{c}</button>
            ))}
          </div>
        </section>
      )}

      <section data-testid="gallery-section" className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          {loading ? (
            <div className="text-center py-16"><div className="w-8 h-8 border-2 border-[var(--green-700)] border-t-transparent rounded-full animate-spin mx-auto" /></div>
          ) : shown.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {shown.map((item, i) => (
                <SR key={item.id} delay={i * 60}>
                  <div
                    data-testid={`gallery-item-${item.id}`}
                    className="group cursor-pointer rounded-xl overflow-hidden border border-[var(--border)] lift"
                    onClick={() => setSel(item)}
                  >
                    <div className="relative iz aspect-[4/3]">
                      <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                        <ZoomIn size={24} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                    <div className="px-4 py-3 bg-white">
                      <h3 className="text-sm font-semibold text-[var(--text-primary)]">{item.title}</h3>
                      {item.category && <span className="text-[11px] text-[var(--green-700)] font-medium">{item.category}</span>}
                    </div>
                  </div>
                </SR>
              ))}
            </div>
          ) : (
            <div className="text-center py-24"><p className="text-[var(--text-secondary)]">Galeria vazia de momento.</p></div>
          )}
        </div>
      </section>

      {sel && (
        <div data-testid="gallery-lightbox" className="fixed inset-0 z-50 flex items-center justify-center p-4 anim-fade-in" style={{ backgroundColor: "rgba(0,0,0,0.9)" }} onClick={() => setSel(null)}>
          <button className="absolute top-5 right-5 text-white/50 hover:text-white transition-colors" onClick={() => setSel(null)} data-testid="lightbox-close"><X size={24} /></button>
          <div className="max-w-4xl w-full anim-scale-in" onClick={e => e.stopPropagation()}>
            <img src={sel.image_url} alt={sel.title} className="w-full max-h-[80vh] object-contain rounded-lg" />
            <div className="mt-3 text-center">
              <h3 className="text-white text-lg font-semibold">{sel.title}</h3>
              {sel.description && <p className="text-white/40 text-sm mt-1">{sel.description}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
