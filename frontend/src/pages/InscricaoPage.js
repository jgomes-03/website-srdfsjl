import React, { useState } from "react";
import { CheckCircle, User, Mail, Phone, MapPin, Calendar } from "lucide-react";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function InscricaoPage() {
  const [form, setForm] = useState({
    full_name: "", email: "", phone: "", address: "", birth_date: "", message: "",
  });
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
      setError(typeof detail === "string" ? detail : "Erro ao enviar inscrição");
    } finally {
      setSending(false);
    }
  };

  const updateField = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  return (
    <div>
      {/* Page Header */}
      <section className="py-20 sm:py-24" style={{ backgroundColor: "var(--primary)" }}>
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-xs uppercase tracking-[0.3em] font-semibold mb-4" style={{ color: "var(--accent)" }}>
            Junte-se a nós
          </p>
          <h1
            className="text-4xl sm:text-6xl font-light text-white"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Inscrição de Sócio
          </h1>
        </div>
      </section>

      <section className="py-20 sm:py-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          {sent ? (
            <div
              data-testid="inscription-success"
              className="text-center py-20 border"
              style={{ borderColor: "var(--primary)", backgroundColor: "rgba(13,107,79,0.04)" }}
            >
              <CheckCircle size={56} className="mx-auto mb-6" style={{ color: "var(--primary)" }} />
              <h2
                className="text-2xl sm:text-3xl font-medium mb-3"
                style={{ fontFamily: "'Cormorant Garamond', serif", color: "var(--text-primary)" }}
              >
                Inscrição Enviada!
              </h2>
              <p className="text-base mb-2" style={{ color: "var(--text-secondary)" }}>
                A sua inscrição foi recebida com sucesso.
              </p>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                Entraremos em contacto consigo brevemente para finalizar o processo.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-10">
                <h2
                  className="text-2xl sm:text-3xl font-medium mb-3"
                  style={{ fontFamily: "'Cormorant Garamond', serif", color: "var(--text-primary)" }}
                >
                  Dados Pessoais
                </h2>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  Preencha o formulário abaixo para se inscrever como sócio da SRDFSIL.
                  Os campos marcados com * são obrigatórios.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6" data-testid="inscription-form">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="sm:col-span-2">
                    <label className="flex items-center gap-2 text-sm font-medium mb-1.5" style={{ color: "var(--text-primary)" }}>
                      <User size={14} /> Nome Completo *
                    </label>
                    <input
                      type="text"
                      data-testid="inscription-name"
                      required
                      value={form.full_name}
                      onChange={updateField("full_name")}
                      className="w-full px-4 py-3 text-sm border outline-none"
                      style={{ borderColor: "var(--border)", backgroundColor: "var(--surface)" }}
                      placeholder="O seu nome completo"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium mb-1.5" style={{ color: "var(--text-primary)" }}>
                      <Mail size={14} /> Email *
                    </label>
                    <input
                      type="email"
                      data-testid="inscription-email"
                      required
                      value={form.email}
                      onChange={updateField("email")}
                      className="w-full px-4 py-3 text-sm border outline-none"
                      style={{ borderColor: "var(--border)", backgroundColor: "var(--surface)" }}
                      placeholder="o.seu@email.pt"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium mb-1.5" style={{ color: "var(--text-primary)" }}>
                      <Phone size={14} /> Telefone *
                    </label>
                    <input
                      type="tel"
                      data-testid="inscription-phone"
                      required
                      value={form.phone}
                      onChange={updateField("phone")}
                      className="w-full px-4 py-3 text-sm border outline-none"
                      style={{ borderColor: "var(--border)", backgroundColor: "var(--surface)" }}
                      placeholder="912 345 678"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="flex items-center gap-2 text-sm font-medium mb-1.5" style={{ color: "var(--text-primary)" }}>
                      <MapPin size={14} /> Morada
                    </label>
                    <input
                      type="text"
                      data-testid="inscription-address"
                      value={form.address}
                      onChange={updateField("address")}
                      className="w-full px-4 py-3 text-sm border outline-none"
                      style={{ borderColor: "var(--border)", backgroundColor: "var(--surface)" }}
                      placeholder="A sua morada"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium mb-1.5" style={{ color: "var(--text-primary)" }}>
                      <Calendar size={14} /> Data de Nascimento
                    </label>
                    <input
                      type="date"
                      data-testid="inscription-birthdate"
                      value={form.birth_date}
                      onChange={updateField("birth_date")}
                      className="w-full px-4 py-3 text-sm border outline-none"
                      style={{ borderColor: "var(--border)", backgroundColor: "var(--surface)" }}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-primary)" }}>
                    Mensagem / Observações
                  </label>
                  <textarea
                    data-testid="inscription-message"
                    rows={4}
                    value={form.message}
                    onChange={updateField("message")}
                    className="w-full px-4 py-3 text-sm border outline-none resize-none"
                    style={{ borderColor: "var(--border)", backgroundColor: "var(--surface)" }}
                    placeholder="Alguma informação adicional..."
                  />
                </div>

                {error && <p data-testid="inscription-error" className="text-sm text-red-600">{error}</p>}

                <button
                  type="submit"
                  data-testid="inscription-submit-btn"
                  disabled={sending}
                  className="w-full sm:w-auto px-10 py-3.5 text-sm font-medium text-white tracking-wide transition-all duration-200 hover:opacity-90 disabled:opacity-50"
                  style={{ backgroundColor: "var(--primary)" }}
                >
                  {sending ? "A enviar..." : "Enviar Inscrição"}
                </button>
              </form>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
