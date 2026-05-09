import React, { useState } from "react";
import { MapPin, Mail, Send, CheckCircle } from "lucide-react";
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

export default function ContactosPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setError("");
    try {
      await axios.post(`${API}/contact`, form);
      setSent(true);
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      setError(err.response?.data?.detail || "Erro ao enviar mensagem");
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <section className="relative py-24 sm:py-32 overflow-hidden" style={{ background: "linear-gradient(135deg, var(--primary) 0%, #1a9d74 100%)" }}>
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <p className="text-xs uppercase tracking-[0.4em] font-semibold mb-4" style={{ color: "var(--accent)" }}>Fale connosco</p>
          <h1 className="text-4xl sm:text-7xl font-light text-white animate-fade-in-up" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Contactos
          </h1>
        </div>
      </section>

      <section className="py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <RevealSection>
              <div>
                <p className="text-xs uppercase tracking-[0.25em] font-semibold mb-4" style={{ color: "var(--accent)" }}>Informacoes</p>
                <h2 className="text-3xl sm:text-4xl font-medium mb-10 accent-line" style={{ fontFamily: "'Cormorant Garamond', serif", color: "var(--text-primary)" }}>
                  Como nos encontrar
                </h2>

                <div className="space-y-8">
                  <div className="flex gap-5">
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "var(--primary)", color: "white" }}>
                      <MapPin size={22} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold mb-1" style={{ color: "var(--text-primary)" }}>Morada</h3>
                      <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                        Avenida Central 24<br />S. Joao das Lampas<br />Sintra, Portugal
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-5">
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "var(--primary)", color: "white" }}>
                      <Mail size={22} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold mb-1" style={{ color: "var(--text-primary)" }}>Email</h3>
                      <a
                        href="mailto:geral@sociedadesaojoaodaslampas.pt"
                        className="text-sm hover:underline font-medium"
                        style={{ color: "var(--primary)" }}
                        data-testid="contact-email"
                      >
                        geral@sociedadesaojoaodaslampas.pt
                      </a>
                    </div>
                  </div>
                </div>

                <div className="mt-12 rounded-2xl overflow-hidden shadow-lg" style={{ border: "1px solid var(--border)" }}>
                  <iframe
                    title="Mapa SRDFSIL"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3108.8!2d-9.35!3d38.85!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sSao+Joao+das+Lampas!5e0!3m2!1spt!2spt!4v1"
                    className="w-full aspect-[16/9] border-0"
                    loading="lazy"
                    data-testid="contact-map"
                  />
                </div>
              </div>
            </RevealSection>

            <RevealSection delay={200}>
              <div>
                <p className="text-xs uppercase tracking-[0.25em] font-semibold mb-4" style={{ color: "var(--accent)" }}>Envie mensagem</p>
                <h2 className="text-3xl sm:text-4xl font-medium mb-10 accent-line" style={{ fontFamily: "'Cormorant Garamond', serif", color: "var(--text-primary)" }}>
                  Formulario de Contacto
                </h2>

                {sent ? (
                  <div data-testid="contact-success" className="text-center py-20 rounded-2xl border animate-scale-in" style={{ borderColor: "var(--primary)", backgroundColor: "rgba(13,107,79,0.04)" }}>
                    <CheckCircle size={52} className="mx-auto mb-5" style={{ color: "var(--primary)" }} />
                    <h3 className="text-2xl font-medium mb-2" style={{ fontFamily: "'Cormorant Garamond', serif", color: "var(--text-primary)" }}>
                      Mensagem Enviada!
                    </h3>
                    <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                      Obrigado. Responderemos o mais breve possivel.
                    </p>
                    <button onClick={() => setSent(false)} className="mt-5 text-sm font-semibold hover:underline" style={{ color: "var(--primary)" }} data-testid="send-another-btn">
                      Enviar outra mensagem
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5" data-testid="contact-form">
                    {[
                      { label: "Nome *", field: "name", type: "text", testid: "contact-name", placeholder: "O seu nome" },
                      { label: "Email *", field: "email", type: "email", testid: "contact-email-input", placeholder: "o.seu@email.pt" },
                      { label: "Assunto", field: "subject", type: "text", testid: "contact-subject", placeholder: "Assunto da mensagem" },
                    ].map(f => (
                      <div key={f.field}>
                        <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>{f.label}</label>
                        <input
                          type={f.type}
                          data-testid={f.testid}
                          required={f.label.includes("*")}
                          value={form[f.field]}
                          onChange={e => setForm({ ...form, [f.field]: e.target.value })}
                          className="w-full px-5 py-3.5 text-sm rounded-xl border outline-none transition-all duration-300 focus:ring-2 focus:ring-opacity-30"
                          style={{ borderColor: "var(--border)", backgroundColor: "var(--surface)", "--tw-ring-color": "var(--primary)" }}
                          placeholder={f.placeholder}
                        />
                      </div>
                    ))}
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>Mensagem *</label>
                      <textarea
                        data-testid="contact-message"
                        required
                        rows={5}
                        value={form.message}
                        onChange={e => setForm({ ...form, message: e.target.value })}
                        className="w-full px-5 py-3.5 text-sm rounded-xl border outline-none resize-none transition-all duration-300 focus:ring-2 focus:ring-opacity-30"
                        style={{ borderColor: "var(--border)", backgroundColor: "var(--surface)", "--tw-ring-color": "var(--primary)" }}
                        placeholder="A sua mensagem..."
                      />
                    </div>
                    {error && <p data-testid="contact-error" className="text-sm text-red-600">{error}</p>}
                    <button
                      type="submit"
                      data-testid="contact-submit-btn"
                      disabled={sending}
                      className="inline-flex items-center gap-2 px-8 py-4 text-sm font-semibold text-white tracking-wide rounded-full btn-glow transition-all duration-300 hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                      style={{ backgroundColor: "var(--primary)" }}
                    >
                      {sending ? "A enviar..." : "Enviar Mensagem"}
                      <Send size={14} />
                    </button>
                  </form>
                )}
              </div>
            </RevealSection>
          </div>
        </div>
      </section>
    </div>
  );
}
