import React, { useState } from "react";
import { CheckCircle, User, Mail, Phone, MapPin, Calendar } from "lucide-react";
import axios from "axios";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { LOGO_URL } from "@/components/SRDFSILLogo";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

function RevealSection({ children, className = "", delay = 0 }) {
  const [ref, visible] = useScrollReveal(0.1);
  return (
    <div ref={ref} className={`reveal ${visible ? "visible" : ""} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

export default function InscricaoPage() {
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", address: "", birth_date: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setError("");
    try {
      await axios.post(`${API}/members`, form);
      setSent(true);
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(typeof detail === "string" ? detail : "Erro ao enviar inscricao");
    } finally {
      setSending(false);
    }
  };

  const updateField = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  return (
    <div>
      <section className="relative py-24 sm:py-32 overflow-hidden" style={{ background: "linear-gradient(135deg, var(--primary) 0%, #1a9d74 100%)" }}>
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <img src={LOGO_URL} alt="SRDFSIL" className="w-16 h-16 mx-auto mb-6 object-contain opacity-70" />
          <p className="text-xs uppercase tracking-[0.4em] font-semibold mb-4" style={{ color: "var(--accent)" }}>Junte-se a nos</p>
          <h1 className="text-4xl sm:text-7xl font-light text-white animate-fade-in-up" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Inscricao de <span className="italic font-medium">Socio</span>
          </h1>
        </div>
      </section>

      <section className="py-20 sm:py-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          {sent ? (
            <RevealSection>
              <div data-testid="inscription-success" className="text-center py-24 rounded-2xl border animate-scale-in" style={{ borderColor: "var(--primary)", backgroundColor: "rgba(13,107,79,0.04)" }}>
                <CheckCircle size={60} className="mx-auto mb-6" style={{ color: "var(--primary)" }} />
                <h2 className="text-3xl font-medium mb-3" style={{ fontFamily: "'Cormorant Garamond', serif", color: "var(--text-primary)" }}>
                  Inscricao Enviada!
                </h2>
                <p className="text-base mb-2" style={{ color: "var(--text-secondary)" }}>A sua inscricao foi recebida com sucesso.</p>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Entraremos em contacto consigo brevemente.</p>
              </div>
            </RevealSection>
          ) : (
            <RevealSection>
              <div className="rounded-2xl border p-8 sm:p-12" style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}>
                <div className="mb-10">
                  <h2 className="text-2xl sm:text-3xl font-medium mb-3" style={{ fontFamily: "'Cormorant Garamond', serif", color: "var(--text-primary)" }}>
                    Dados Pessoais
                  </h2>
                  <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                    Preencha o formulario. Os campos com * sao obrigatorios.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6" data-testid="inscription-form">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="sm:col-span-2">
                      <label className="flex items-center gap-2 text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>
                        <User size={14} style={{ color: "var(--primary)" }} /> Nome Completo *
                      </label>
                      <input type="text" data-testid="inscription-name" required value={form.full_name} onChange={updateField("full_name")}
                        className="w-full px-5 py-3.5 text-sm rounded-xl border outline-none transition-all duration-300 focus:ring-2 focus:ring-opacity-30"
                        style={{ borderColor: "var(--border)", backgroundColor: "var(--bg)", "--tw-ring-color": "var(--primary)" }}
                        placeholder="O seu nome completo"
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>
                        <Mail size={14} style={{ color: "var(--primary)" }} /> Email *
                      </label>
                      <input type="email" data-testid="inscription-email" required value={form.email} onChange={updateField("email")}
                        className="w-full px-5 py-3.5 text-sm rounded-xl border outline-none transition-all duration-300 focus:ring-2 focus:ring-opacity-30"
                        style={{ borderColor: "var(--border)", backgroundColor: "var(--bg)", "--tw-ring-color": "var(--primary)" }}
                        placeholder="o.seu@email.pt"
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>
                        <Phone size={14} style={{ color: "var(--primary)" }} /> Telefone *
                      </label>
                      <input type="tel" data-testid="inscription-phone" required value={form.phone} onChange={updateField("phone")}
                        className="w-full px-5 py-3.5 text-sm rounded-xl border outline-none transition-all duration-300 focus:ring-2 focus:ring-opacity-30"
                        style={{ borderColor: "var(--border)", backgroundColor: "var(--bg)", "--tw-ring-color": "var(--primary)" }}
                        placeholder="912 345 678"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="flex items-center gap-2 text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>
                        <MapPin size={14} style={{ color: "var(--primary)" }} /> Morada
                      </label>
                      <input type="text" data-testid="inscription-address" value={form.address} onChange={updateField("address")}
                        className="w-full px-5 py-3.5 text-sm rounded-xl border outline-none transition-all duration-300 focus:ring-2 focus:ring-opacity-30"
                        style={{ borderColor: "var(--border)", backgroundColor: "var(--bg)", "--tw-ring-color": "var(--primary)" }}
                        placeholder="A sua morada"
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>
                        <Calendar size={14} style={{ color: "var(--primary)" }} /> Data de Nascimento
                      </label>
                      <input type="date" data-testid="inscription-birthdate" value={form.birth_date} onChange={updateField("birth_date")}
                        className="w-full px-5 py-3.5 text-sm rounded-xl border outline-none transition-all duration-300 focus:ring-2 focus:ring-opacity-30"
                        style={{ borderColor: "var(--border)", backgroundColor: "var(--bg)", "--tw-ring-color": "var(--primary)" }}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>Mensagem / Observacoes</label>
                    <textarea data-testid="inscription-message" rows={4} value={form.message} onChange={updateField("message")}
                      className="w-full px-5 py-3.5 text-sm rounded-xl border outline-none resize-none transition-all duration-300 focus:ring-2 focus:ring-opacity-30"
                      style={{ borderColor: "var(--border)", backgroundColor: "var(--bg)", "--tw-ring-color": "var(--primary)" }}
                      placeholder="Alguma informacao adicional..."
                    />
                  </div>

                  {error && <p data-testid="inscription-error" className="text-sm text-red-600">{error}</p>}

                  <button
                    type="submit"
                    data-testid="inscription-submit-btn"
                    disabled={sending}
                    className="w-full sm:w-auto px-10 py-4 text-sm font-semibold text-white tracking-wide rounded-full btn-glow transition-all duration-300 hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                    style={{ backgroundColor: "var(--primary)" }}
                  >
                    {sending ? "A enviar..." : "Enviar Inscricao"}
                  </button>
                </form>
              </div>
            </RevealSection>
          )}
        </div>
      </section>
    </div>
  );
}
