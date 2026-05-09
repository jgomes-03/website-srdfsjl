import React, { useState } from "react";
import { MapPin, Mail, Send, CheckCircle } from "lucide-react";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

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
      {/* Page Header */}
      <section className="py-20 sm:py-24" style={{ backgroundColor: "var(--primary)" }}>
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-xs uppercase tracking-[0.3em] font-semibold mb-4" style={{ color: "var(--accent)" }}>
            Fale connosco
          </p>
          <h1
            className="text-4xl sm:text-6xl font-light text-white"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Contactos
          </h1>
        </div>
      </section>

      <section className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Contact Info */}
            <div>
              <p className="text-xs uppercase tracking-[0.2em] font-semibold mb-4" style={{ color: "var(--accent)" }}>
                Informações
              </p>
              <h2
                className="text-3xl sm:text-4xl font-medium mb-8"
                style={{ fontFamily: "'Cormorant Garamond', serif", color: "var(--text-primary)" }}
              >
                Como nos encontrar
              </h2>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div
                    className="w-12 h-12 flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: "var(--primary)", color: "white" }}
                  >
                    <MapPin size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold mb-1" style={{ color: "var(--text-primary)" }}>Morada</h3>
                    <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                      Avenida Central 24<br />
                      São João das Lampas<br />
                      Sintra, Portugal
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div
                    className="w-12 h-12 flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: "var(--primary)", color: "white" }}
                  >
                    <Mail size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold mb-1" style={{ color: "var(--text-primary)" }}>Email</h3>
                    <a
                      href="mailto:geral@sociedadesaojoaodaslampas.pt"
                      className="text-sm hover:underline"
                      style={{ color: "var(--primary)" }}
                      data-testid="contact-email"
                    >
                      geral@sociedadesaojoaodaslampas.pt
                    </a>
                  </div>
                </div>
              </div>

              {/* Map placeholder */}
              <div
                className="mt-10 aspect-[16/9] flex items-center justify-center"
                style={{ backgroundColor: "var(--surface-secondary)", border: "1px solid var(--border)" }}
              >
                <iframe
                  title="Mapa SRDFSIL"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3108.8!2d-9.35!3d38.85!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sSao+Joao+das+Lampas!5e0!3m2!1spt!2spt!4v1"
                  className="w-full h-full border-0"
                  loading="lazy"
                  data-testid="contact-map"
                />
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <p className="text-xs uppercase tracking-[0.2em] font-semibold mb-4" style={{ color: "var(--accent)" }}>
                Envie mensagem
              </p>
              <h2
                className="text-3xl sm:text-4xl font-medium mb-8"
                style={{ fontFamily: "'Cormorant Garamond', serif", color: "var(--text-primary)" }}
              >
                Formulário de Contacto
              </h2>

              {sent ? (
                <div
                  data-testid="contact-success"
                  className="text-center py-16 border"
                  style={{ borderColor: "var(--primary)", backgroundColor: "var(--primary)" + "08" }}
                >
                  <CheckCircle size={48} className="mx-auto mb-4" style={{ color: "var(--primary)" }} />
                  <h3
                    className="text-xl font-medium mb-2"
                    style={{ fontFamily: "'Cormorant Garamond', serif", color: "var(--text-primary)" }}
                  >
                    Mensagem Enviada!
                  </h3>
                  <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                    Obrigado pelo seu contacto. Responderemos o mais breve possível.
                  </p>
                  <button
                    onClick={() => setSent(false)}
                    className="mt-4 text-sm font-medium hover:underline"
                    style={{ color: "var(--primary)" }}
                    data-testid="send-another-btn"
                  >
                    Enviar outra mensagem
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5" data-testid="contact-form">
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-primary)" }}>
                      Nome *
                    </label>
                    <input
                      type="text"
                      data-testid="contact-name"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full px-4 py-3 text-sm border outline-none transition-colors"
                      style={{
                        borderColor: "var(--border)",
                        backgroundColor: "var(--surface)",
                      }}
                      placeholder="O seu nome"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-primary)" }}>
                      Email *
                    </label>
                    <input
                      type="email"
                      data-testid="contact-email-input"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full px-4 py-3 text-sm border outline-none transition-colors"
                      style={{ borderColor: "var(--border)", backgroundColor: "var(--surface)" }}
                      placeholder="o.seu@email.pt"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-primary)" }}>
                      Assunto
                    </label>
                    <input
                      type="text"
                      data-testid="contact-subject"
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      className="w-full px-4 py-3 text-sm border outline-none transition-colors"
                      style={{ borderColor: "var(--border)", backgroundColor: "var(--surface)" }}
                      placeholder="Assunto da mensagem"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-primary)" }}>
                      Mensagem *
                    </label>
                    <textarea
                      data-testid="contact-message"
                      required
                      rows={5}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      className="w-full px-4 py-3 text-sm border outline-none transition-colors resize-none"
                      style={{ borderColor: "var(--border)", backgroundColor: "var(--surface)" }}
                      placeholder="A sua mensagem..."
                    />
                  </div>
                  {error && (
                    <p data-testid="contact-error" className="text-sm text-red-600">{error}</p>
                  )}
                  <button
                    type="submit"
                    data-testid="contact-submit-btn"
                    disabled={sending}
                    className="inline-flex items-center gap-2 px-8 py-3.5 text-sm font-medium text-white tracking-wide transition-all duration-200 hover:opacity-90 disabled:opacity-50"
                    style={{ backgroundColor: "var(--primary)" }}
                  >
                    {sending ? "A enviar..." : "Enviar Mensagem"}
                    <Send size={14} />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
