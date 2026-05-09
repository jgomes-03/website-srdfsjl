import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function GaleriaPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImg, setSelectedImg] = useState(null);

  useEffect(() => {
    axios.get(`${API}/gallery`).then(r => {
      setItems(r.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Page Header */}
      <section className="py-20 sm:py-24" style={{ backgroundColor: "var(--primary)" }}>
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-xs uppercase tracking-[0.3em] font-semibold mb-4" style={{ color: "var(--accent)" }}>
            Momentos
          </p>
          <h1
            className="text-4xl sm:text-6xl font-light text-white"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Galeria de Fotos
          </h1>
        </div>
      </section>

      <section data-testid="gallery-section" className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-center py-16">
              <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mx-auto" style={{ borderColor: "var(--primary)", borderTopColor: "transparent" }} />
            </div>
          ) : items.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item) => (
                <div
                  key={item.id}
                  data-testid={`gallery-item-${item.id}`}
                  className="group cursor-pointer overflow-hidden border"
                  style={{ borderColor: "var(--border)" }}
                  onClick={() => setSelectedImg(item)}
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300" />
                  </div>
                  <div className="p-4" style={{ backgroundColor: "var(--surface)" }}>
                    <h3
                      className="text-base font-medium"
                      style={{ fontFamily: "'Cormorant Garamond', serif", color: "var(--text-primary)" }}
                    >
                      {item.title}
                    </h3>
                    {item.category && (
                      <span className="text-xs mt-1 inline-block" style={{ color: "var(--accent)" }}>
                        {item.category}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-lg" style={{ color: "var(--text-secondary)" }}>
                A galeria está vazia de momento.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      {selectedImg && (
        <div
          data-testid="gallery-lightbox"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.85)" }}
          onClick={() => setSelectedImg(null)}
        >
          <button
            className="absolute top-6 right-6 text-white hover:opacity-70 transition-opacity"
            onClick={() => setSelectedImg(null)}
            data-testid="lightbox-close"
          >
            <X size={28} />
          </button>
          <div className="max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <img
              src={selectedImg.image_url}
              alt={selectedImg.title}
              className="w-full max-h-[80vh] object-contain"
            />
            <div className="mt-4 text-center">
              <h3 className="text-white text-xl" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                {selectedImg.title}
              </h3>
              {selectedImg.description && (
                <p className="text-white/60 text-sm mt-1">{selectedImg.description}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
