import React, { useState, useRef, useEffect } from "react";
import { CheckCircle, User, Mail, Phone, MapPin, Calendar } from "lucide-react";
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

export default function InscricaoPage() {
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", address: "", birth_date: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault(); setSending(true); setError("");
    try { await axios.post(`${API}/members`, form); setSent(true); }
    catch (err) { const d = err.response?.data?.detail; setError(typeof d === "string" ? d : "Erro ao enviar"); }
    finally { setSending(false); }
  };
  const up = (f) => (e) => setForm({...form, [f]: e.target.value});
  const inp = "w-full px-4 py-3 text-sm rounded-lg border border-[var(--border)] bg-[var(--bg)] outline-none transition-all focus:border-[var(--green-700)] focus:ring-2 focus:ring-[var(--green-700)]/10";

  return (
    <div>
      <section className="pt-32 pb-16 sm:pt-40 sm:pb-20 bg-[var(--green-900)]">
        <div className="max-w-4xl mx-auto px-5 sm:px-8 text-center">
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-[var(--green-500)] mb-3">Junte-se a nos</span>
          <h1 className="text-4xl sm:text-6xl font-bold text-white anim-fade-up d1">Inscricao de Socio</h1>
        </div>
      </section>

      <section className="py-20 sm:py-28">
        <div className="max-w-2xl mx-auto px-5 sm:px-8">
          {sent ? (
            <div data-testid="inscription-success" className="text-center py-20 rounded-xl border border-[var(--green-700)]/20 bg-[var(--green-50)] anim-scale-in">
              <CheckCircle size={48} className="mx-auto mb-5 text-[var(--green-700)]" />
              <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Inscricao Enviada!</h2>
              <p className="text-sm text-[var(--text-secondary)]">Entraremos em contacto brevemente.</p>
            </div>
          ) : (
            <SR>
              <div className="bg-white rounded-xl border border-[var(--border)] p-8 sm:p-10">
                <h2 className="text-xl font-bold text-[var(--text-primary)] mb-1">Dados Pessoais</h2>
                <p className="text-sm text-[var(--text-secondary)] mb-8">Campos com * sao obrigatorios.</p>
                <form onSubmit={submit} className="space-y-5" data-testid="inscription-form">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="sm:col-span-2">
                      <label className="flex items-center gap-1.5 text-sm font-medium text-[var(--text-primary)] mb-1.5"><User size={13} className="text-[var(--green-700)]" /> Nome Completo *</label>
                      <input type="text" data-testid="inscription-name" required value={form.full_name} onChange={up("full_name")} className={inp} placeholder="O seu nome" />
                    </div>
                    <div><label className="flex items-center gap-1.5 text-sm font-medium text-[var(--text-primary)] mb-1.5"><Mail size={13} className="text-[var(--green-700)]" /> Email *</label><input type="email" data-testid="inscription-email" required value={form.email} onChange={up("email")} className={inp} placeholder="email@exemplo.pt" /></div>
                    <div><label className="flex items-center gap-1.5 text-sm font-medium text-[var(--text-primary)] mb-1.5"><Phone size={13} className="text-[var(--green-700)]" /> Telefone *</label><input type="tel" data-testid="inscription-phone" required value={form.phone} onChange={up("phone")} className={inp} placeholder="912 345 678" /></div>
                    <div className="sm:col-span-2"><label className="flex items-center gap-1.5 text-sm font-medium text-[var(--text-primary)] mb-1.5"><MapPin size={13} className="text-[var(--green-700)]" /> Morada</label><input type="text" data-testid="inscription-address" value={form.address} onChange={up("address")} className={inp} placeholder="A sua morada" /></div>
                    <div><label className="flex items-center gap-1.5 text-sm font-medium text-[var(--text-primary)] mb-1.5"><Calendar size={13} className="text-[var(--green-700)]" /> Data de Nascimento</label><input type="date" data-testid="inscription-birthdate" value={form.birth_date} onChange={up("birth_date")} className={inp} /></div>
                  </div>
                  <div><label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">Observacoes</label><textarea data-testid="inscription-message" rows={3} value={form.message} onChange={up("message")} className={`${inp} resize-none`} placeholder="Informacao adicional..." /></div>
                  {error && <p data-testid="inscription-error" className="text-sm text-red-600">{error}</p>}
                  <button type="submit" data-testid="inscription-submit-btn" disabled={sending}
                    className="w-full sm:w-auto px-8 py-3.5 text-sm font-semibold text-white rounded-lg btn-shine transition-all hover:brightness-110 disabled:opacity-50"
                    style={{ backgroundColor: "var(--green-700)" }}
                  >{sending ? "A enviar..." : "Enviar Inscricao"}</button>
                </form>
              </div>
            </SR>
          )}
        </div>
      </section>
    </div>
  );
}
