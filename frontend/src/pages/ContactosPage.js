import React, { useState, useRef, useEffect } from "react";
import { MapPin, Mail, Send, CheckCircle } from "lucide-react";
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

export default function ContactosPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setSending(true); setError("");
    try { await axios.post(`${API}/contact`, form); setSent(true); setForm({ name: "", email: "", subject: "", message: "" }); }
    catch (err) { setError(err.response?.data?.detail || "Erro ao enviar"); }
    finally { setSending(false); }
  };

  const inp = "w-full px-4 py-3 text-sm rounded-lg border border-[var(--border)] bg-white outline-none transition-all focus:border-[var(--green-700)] focus:ring-2 focus:ring-[var(--green-700)]/10";

  return (
    <div>
      <section className="pt-32 pb-16 sm:pt-40 sm:pb-20 bg-[var(--green-900)]">
        <div className="max-w-4xl mx-auto px-5 sm:px-8 text-center">
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-[var(--green-500)] mb-3">Fale connosco</span>
          <h1 className="text-4xl sm:text-6xl font-bold text-white anim-fade-up d1">Contactos</h1>
        </div>
      </section>

      <section className="py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14">
            <SR>
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-8">Como nos encontrar</h2>
                <div className="space-y-6 mb-10">
                  <div className="flex gap-4">
                    <div className="w-11 h-11 rounded-lg flex items-center justify-center bg-[var(--green-100)] text-[var(--green-700)] flex-shrink-0"><MapPin size={18} /></div>
                    <div><p className="text-sm font-semibold text-[var(--text-primary)] mb-0.5">Morada</p><p className="text-sm text-[var(--text-secondary)]">Avenida Central 24, S. Joao das Lampas, Sintra</p></div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-11 h-11 rounded-lg flex items-center justify-center bg-[var(--green-100)] text-[var(--green-700)] flex-shrink-0"><Mail size={18} /></div>
                    <div><p className="text-sm font-semibold text-[var(--text-primary)] mb-0.5">Email</p><a href="mailto:geral@sociedadesaojoaodaslampas.pt" className="text-sm text-[var(--green-700)] hover:underline" data-testid="contact-email">geral@sociedadesaojoaodaslampas.pt</a></div>
                  </div>
                </div>
                <div className="rounded-xl overflow-hidden border border-[var(--border)]">
                  <iframe title="Mapa" src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3108.8!2d-9.35!3d38.85!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sSao+Joao+das+Lampas!5e0!3m2!1spt!2spt!4v1" className="w-full aspect-video border-0" loading="lazy" data-testid="contact-map" />
                </div>
              </div>
            </SR>

            <SR delay={150}>
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-8">Enviar Mensagem</h2>
                {sent ? (
                  <div data-testid="contact-success" className="text-center py-16 rounded-xl border border-[var(--green-700)]/20 bg-[var(--green-50)] anim-scale-in">
                    <CheckCircle size={40} className="mx-auto mb-4 text-[var(--green-700)]" />
                    <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-1">Mensagem Enviada!</h3>
                    <p className="text-sm text-[var(--text-secondary)]">Responderemos o mais breve possivel.</p>
                    <button onClick={() => setSent(false)} className="mt-4 text-sm font-semibold text-[var(--green-700)] hover:underline" data-testid="send-another-btn">Enviar outra</button>
                  </div>
                ) : (
                  <form onSubmit={submit} className="space-y-4" data-testid="contact-form">
                    <div><label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">Nome *</label><input type="text" data-testid="contact-name" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className={inp} placeholder="O seu nome" /></div>
                    <div><label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">Email *</label><input type="email" data-testid="contact-email-input" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} className={inp} placeholder="o.seu@email.pt" /></div>
                    <div><label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">Assunto</label><input type="text" data-testid="contact-subject" value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} className={inp} placeholder="Assunto" /></div>
                    <div><label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">Mensagem *</label><textarea data-testid="contact-message" required rows={5} value={form.message} onChange={e => setForm({...form, message: e.target.value})} className={`${inp} resize-none`} placeholder="A sua mensagem..." /></div>
                    {error && <p data-testid="contact-error" className="text-sm text-red-600">{error}</p>}
                    <button type="submit" data-testid="contact-submit-btn" disabled={sending}
                      className="inline-flex items-center gap-2 px-7 py-3.5 text-sm font-semibold text-white rounded-lg btn-shine transition-all hover:brightness-110 disabled:opacity-50"
                      style={{ backgroundColor: "var(--green-700)" }}
                    >{sending ? "A enviar..." : "Enviar"} <Send size={14} /></button>
                  </form>
                )}
              </div>
            </SR>
          </div>
        </div>
      </section>
    </div>
  );
}
