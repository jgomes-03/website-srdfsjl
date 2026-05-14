import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  LogOut, LayoutDashboard, Calendar, Briefcase, Clock as ClockIcon, Mail, Settings, Users,
  Plus, Trash2, Edit2, Save, X, Check, Eye, Reply, ExternalLink, Search,
  TrendingUp, MessageSquare, UserPlus, CalendarDays, ChevronRight, Bell, Home,
  ChevronDown, CreditCard, Receipt, ArrowLeft,
} from "lucide-react";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const ax = axios.create({ baseURL: API, withCredentials: true });
const LOGO = "https://customer-assets.emergentagent.com/job_sao-joao-lampas/artifacts/31zt6imn_minilogo-transparente.png";

export default function AdminDashboard() {
  const { user, loading: authLoading, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("dashboard");
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "admin")) navigate("/admin/login");
  }, [user, authLoading, navigate]);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  if (authLoading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, #0B3D2E 0%, #0d6b4f 100%)" }}>
      <div className="w-10 h-10 border-3 border-white/30 border-t-white rounded-full animate-spin" />
    </div>
  );
  if (!user || user.role !== "admin") return null;

  const TABS = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "homepage", label: "Homepage", icon: Home },
    { id: "events", label: "Eventos", icon: Calendar },
    { id: "services", label: "Servicos", icon: Briefcase },
    { id: "timeline", label: "Cronologia", icon: ClockIcon },
    { id: "messages", label: "Mensagens", icon: Mail, badge: true },
    { id: "members", label: "Socios", icon: Users },
    { id: "settings", label: "Definicoes", icon: Settings },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-[240px] min-h-screen flex flex-col" style={{ background: "linear-gradient(180deg, #0B3D2E 0%, #0a5640 100%)" }} data-testid="admin-sidebar">
        <div className="px-5 py-6 flex items-center gap-3">
          <img src={LOGO} alt="SRDFSJL" className="w-9 h-9 object-contain" />
          <div>
            <p className="text-white text-sm font-bold tracking-tight">SRDFSJL</p>
            <p className="text-white/40 text-[10px]">Backoffice</p>
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          <p className="text-[10px] font-semibold text-white/30 uppercase tracking-widest px-3 mb-2 mt-2">Menu</p>
          {TABS.map(t => (
            <button key={t.id} data-testid={`admin-tab-${t.id}`} onClick={() => setTab(t.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-[13px] font-medium rounded-xl transition-all duration-200 group ${
                tab === t.id
                  ? "bg-white/15 text-white shadow-lg shadow-black/10"
                  : "text-white/50 hover:text-white/80 hover:bg-white/5"
              }`}>
              <t.icon size={16} className={tab === t.id ? "text-[#15B377]" : "text-white/40 group-hover:text-white/60"} />
              <span className="flex-1 text-left">{t.label}</span>
              {tab === t.id && <ChevronRight size={12} className="text-white/40" />}
            </button>
          ))}
        </nav>

        <div className="px-3 pb-3">
          <div className="px-3 py-3 rounded-xl bg-white/5 mb-3">
            <p className="text-[11px] text-white/70 font-medium truncate">{user.name || user.email}</p>
            <p className="text-[10px] text-white/30 truncate">{user.email}</p>
          </div>
          <div className="flex gap-2">
            <Link to="/" className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-[11px] font-medium text-white/40 rounded-lg hover:bg-white/5 hover:text-white/70 transition-all">
              <Home size={12} />Ver Site
            </Link>
            <button data-testid="admin-logout-btn" onClick={async () => { await logout(); navigate("/admin/login"); }}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-[11px] font-medium text-white/40 rounded-lg hover:bg-red-500/20 hover:text-red-300 transition-all">
              <LogOut size={12} />Sair
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-h-screen bg-[#F5F6F8]">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-8 flex-shrink-0">
          <h1 className="text-lg font-bold text-gray-800">{TABS.find(t => t.id === tab)?.label || "Dashboard"}</h1>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[var(--green-100)] flex items-center justify-center text-[var(--green-700)]">
              <Bell size={14} />
            </div>
            <div className="w-8 h-8 rounded-full bg-[var(--green-700)] flex items-center justify-center text-white text-xs font-bold">
              {(user.name || user.email || "A")[0].toUpperCase()}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-8 overflow-y-auto">
          {tab === "dashboard" && <DashboardTab onNav={setTab} />}
          {tab === "homepage" && <HomepageTab showToast={showToast} />}
          {tab === "events" && <EventsTab showToast={showToast} />}
          {tab === "services" && <ServicesTab showToast={showToast} />}
          {tab === "timeline" && <TimelineTab showToast={showToast} />}
          {tab === "messages" && <MessagesTab showToast={showToast} />}
          {tab === "members" && <MembersTab showToast={showToast} />}
          {tab === "settings" && <SettingsTab showToast={showToast} />}
        </main>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-2xl text-sm font-medium flex items-center gap-2 anim-fade-up ${
          toast.type === "success" ? "bg-[var(--green-700)] text-white" : "bg-red-500 text-white"
        }`}>
          {toast.type === "success" ? <Check size={16} /> : <X size={16} />}
          {toast.msg}
        </div>
      )}
    </div>
  );
}

// ── Shared Components ──────────────────────────────────────────────────
const Inp = ({ label, value, onChange, type = "text", placeholder = "", testId, rows }) => (
  <div>
    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{label}</label>
    {rows ? (
      <textarea data-testid={testId} rows={rows} value={value} onChange={e => onChange(e.target.value)}
        className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 bg-gray-50/50 outline-none resize-none focus:border-[var(--green-700)] focus:bg-white focus:ring-2 focus:ring-[var(--green-700)]/10 transition-all" placeholder={placeholder} />
    ) : (
      <input data-testid={testId} type={type} value={value} onChange={e => onChange(e.target.value)}
        className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 bg-gray-50/50 outline-none focus:border-[var(--green-700)] focus:bg-white focus:ring-2 focus:ring-[var(--green-700)]/10 transition-all" placeholder={placeholder} />
    )}
  </div>
);

const Btn = ({ children, onClick, variant = "primary", disabled, testId, className = "" }) => {
  const base = "inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed";
  const styles = {
    primary: "bg-[var(--green-700)] text-white hover:bg-[var(--green-900)] shadow-sm hover:shadow-md",
    secondary: "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 shadow-sm",
    danger: "bg-red-500 text-white hover:bg-red-600 shadow-sm",
  };
  return <button data-testid={testId} onClick={onClick} disabled={disabled} className={`${base} ${styles[variant]} ${className}`}>{children}</button>;
};

const Card = ({ children, className = "" }) => <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm ${className}`}>{children}</div>;

// ── Dashboard ─────────────────────────────────────────────────────────
function DashboardTab({ onNav }) {
  const [s, setS] = useState(null);
  const [recentMsgs, setRecentMsgs] = useState([]);
  const [recentEvents, setRecentEvents] = useState([]);

  useEffect(() => {
    ax.get("/admin/stats").then(r => setS(r.data));
    ax.get("/contacts").then(r => setRecentMsgs(r.data.slice(0, 4))).catch(() => {});
    ax.get("/events/upcoming").then(r => setRecentEvents(r.data.slice(0, 3))).catch(() => {});
  }, []);

  if (!s) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-[var(--green-700)] border-t-transparent rounded-full animate-spin" /></div>;

  const cards = [
    { label: "Eventos Futuros", val: s.events.upcoming, sub: `${s.events.total} total`, icon: CalendarDays, color: "#0d6b4f", bg: "#E6F5EF" },
    { label: "Mensagens", val: s.messages.unread, sub: `${s.messages.unread} nao lidas`, icon: MessageSquare, color: "#D97742", bg: "#FEF3E8" },
    { label: "Socios Pendentes", val: s.members.pending, sub: `${s.members.total} total`, icon: UserPlus, color: "#6366f1", bg: "#EEF2FF" },
    { label: "Servicos", val: s.services.total, sub: "ativos", icon: Briefcase, color: "#0891b2", bg: "#E8FAFE" },
  ];

  return (
    <div data-testid="admin-dashboard-tab" className="space-y-8">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Bem-vindo ao Backoffice</h2>
          <p className="text-sm text-gray-400 mt-1">Aqui tem uma visao geral do seu website.</p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {cards.map(c => (
          <Card key={c.label} className="p-6 hover:shadow-md transition-shadow cursor-default">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: c.bg }}>
                <c.icon size={22} style={{ color: c.color }} />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-800">{c.val}</p>
            <p className="text-sm text-gray-400 mt-1">{c.label}</p>
            <p className="text-[11px] text-gray-300 mt-0.5">{c.sub}</p>
          </Card>
        ))}
      </div>

      {/* Quick sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent messages */}
        <Card className="p-0 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-700">Mensagens Recentes</h3>
            <button onClick={() => onNav("messages")} className="text-xs font-medium text-[var(--green-700)] hover:underline">Ver todas</button>
          </div>
          <div className="divide-y divide-gray-50">
            {recentMsgs.length > 0 ? recentMsgs.map(m => (
              <div key={m.id} className="px-6 py-3.5 flex items-center gap-3 hover:bg-gray-50/50 transition-colors">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 shrink-0">
                  {(m.name || "?")[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700 truncate">{m.name}</p>
                  <p className="text-xs text-gray-400 truncate">{m.message}</p>
                </div>
                {!m.read && <div className="w-2 h-2 rounded-full bg-[var(--green-500)] shrink-0" />}
              </div>
            )) : <p className="px-6 py-8 text-sm text-gray-300 text-center">Sem mensagens.</p>}
          </div>
        </Card>

        {/* Upcoming events */}
        <Card className="p-0 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-700">Proximos Eventos</h3>
            <button onClick={() => onNav("events")} className="text-xs font-medium text-[var(--green-700)] hover:underline">Ver todos</button>
          </div>
          <div className="divide-y divide-gray-50">
            {recentEvents.length > 0 ? recentEvents.map(ev => {
              const d = new Date(ev.date + "T00:00:00");
              const months = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
              return (
                <div key={ev.id} className="px-6 py-3.5 flex items-center gap-4 hover:bg-gray-50/50 transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-[var(--green-100)] flex flex-col items-center justify-center shrink-0">
                    <span className="text-base font-bold text-[var(--green-700)] leading-none">{d.getDate()}</span>
                    <span className="text-[9px] font-semibold text-[var(--green-700)] uppercase">{months[d.getMonth()]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 truncate">{ev.title}</p>
                    <p className="text-xs text-gray-400">{ev.time} {ev.location && `· ${ev.location}`}</p>
                  </div>
                  {ev.price && <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 shrink-0">{ev.price}</span>}
                </div>
              );
            }) : <p className="px-6 py-8 text-sm text-gray-300 text-center">Sem eventos futuros.</p>}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ── Homepage Content ──────────────────────────────────────────────────
function HomepageTab({ showToast }) {
  const [data, setData] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { ax.get("/content/homepage").then(r => setData(r.data)); }, []);

  const save = async () => {
    setSaving(true);
    try { await ax.put("/content/homepage", data); showToast("Homepage guardada!"); }
    catch { showToast("Erro ao guardar", "error"); }
    finally { setSaving(false); }
  };

  if (!data) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-[var(--green-700)] border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div data-testid="admin-homepage-tab" className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">Edite o conteudo visivel na pagina inicial.</p>
        <Btn onClick={save} disabled={saving} testId="save-homepage"><Save size={14} />{saving ? "A guardar..." : "Guardar Alteracoes"}</Btn>
      </div>

      <Card className="p-7">
        <h3 className="text-sm font-bold text-gray-700 mb-5 flex items-center gap-2"><Home size={15} className="text-[var(--green-700)]" /> Hero Section</h3>
        <div className="space-y-4">
          <Inp label="Badge" value={data.hero_badge || ""} onChange={v => setData({...data, hero_badge: v})} placeholder="Desde 1911..." />
          <Inp label="Titulo Principal" value={data.hero_title || ""} onChange={v => setData({...data, hero_title: v})} />
          <Inp label="Subtitulo" value={data.hero_subtitle || ""} onChange={v => setData({...data, hero_subtitle: v})} rows={2} />
        </div>
      </Card>

      <Card className="p-7">
        <h3 className="text-sm font-bold text-gray-700 mb-5 flex items-center gap-2"><TrendingUp size={15} className="text-[var(--green-700)]" /> Seccao Sobre Nos</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Inp label="Label" value={data.about_label || ""} onChange={v => setData({...data, about_label: v})} />
            <Inp label="Titulo" value={data.about_title || ""} onChange={v => setData({...data, about_title: v})} />
          </div>
          <Inp label="Texto" value={data.about_text || ""} onChange={v => setData({...data, about_text: v})} rows={3} />
        </div>
      </Card>

      <Card className="p-7">
        <h3 className="text-sm font-bold text-gray-700 mb-5">Estatisticas</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {(data.stats || []).map((s, i) => (
            <div key={i} className="p-4 rounded-xl bg-gray-50 space-y-3">
              <Inp label="Valor" type="number" value={s.val} onChange={v => { const ns = [...data.stats]; ns[i] = {...ns[i], val: parseInt(v) || 0}; setData({...data, stats: ns}); }} />
              <Inp label="Label" value={s.label} onChange={v => { const ns = [...data.stats]; ns[i] = {...ns[i], label: v}; setData({...data, stats: ns}); }} />
              <Inp label="Sufixo" value={s.suffix} onChange={v => { const ns = [...data.stats]; ns[i] = {...ns[i], suffix: v}; setData({...data, stats: ns}); }} placeholder="+" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ── Generic CRUD Tab ──────────────────────────────────────────────────
function CRUDTab({ title, subtitle, endpoint, fields, testPrefix, showToast }) {
  const [items, setItems] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({});

  const fetch = useCallback(() => ax.get(endpoint).then(r => setItems(r.data)), [endpoint]);
  useEffect(() => { fetch(); }, [fetch]);

  const emptyForm = () => fields.reduce((a, f) => ({ ...a, [f.key]: f.default || "" }), {});
  const startNew = () => { setForm(emptyForm()); setEditId(null); setShowForm(true); };
  const startEdit = (item) => { setForm(fields.reduce((a, f) => ({ ...a, [f.key]: item[f.key] ?? f.default ?? "" }), {})); setEditId(item.id); setShowForm(true); };
  const cancel = () => { setShowForm(false); setEditId(null); };

  const save = async () => {
    try {
      if (editId) await ax.put(`${endpoint}/${editId}`, form);
      else await ax.post(endpoint, form);
      cancel(); fetch();
      showToast(editId ? "Atualizado!" : "Criado com sucesso!");
    } catch (e) { showToast(e.response?.data?.detail || "Erro", "error"); }
  };

  const remove = async (id) => {
    if (window.confirm("Tem a certeza?")) { await ax.delete(`${endpoint}/${id}`); fetch(); showToast("Eliminado."); }
  };

  return (
    <div data-testid={`admin-${testPrefix}-tab`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-gray-400">{subtitle}</p>
        </div>
        <Btn onClick={startNew} testId={`add-${testPrefix}-btn`}><Plus size={15} />Adicionar</Btn>
      </div>

      {showForm && (
        <Card className="p-6 mb-6">
          <h3 className="text-sm font-bold text-gray-700 mb-4">{editId ? "Editar" : "Novo"}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {fields.map(f => (
              <div key={f.key} className={f.wide ? "sm:col-span-2" : ""}>
                <Inp label={f.label} value={form[f.key] ?? ""} onChange={v => setForm({...form, [f.key]: f.type === "number" ? (parseInt(v) || 0) : v})}
                  type={f.type || "text"} placeholder={f.placeholder || ""} rows={f.rows} testId={`${testPrefix}-form-${f.key}`} />
              </div>
            ))}
          </div>
          <div className="flex gap-3 mt-5">
            <Btn onClick={save} testId={`${testPrefix}-form-save`}><Save size={14} />Guardar</Btn>
            <Btn onClick={cancel} variant="secondary"><X size={14} />Cancelar</Btn>
          </div>
        </Card>
      )}

      <Card className="overflow-hidden">
        <div className="divide-y divide-gray-50">
          {items.map(item => (
            <div key={item.id} className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors group">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-700">{item[fields[0].key]}</p>
                <p className="text-xs text-gray-400 truncate mt-0.5">
                  {item[fields[1]?.key] || ""} {item.date ? `· ${item.date}` : ""} {item.time ? `· ${item.time}` : ""}
                </p>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => startEdit(item)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[var(--green-100)] text-[var(--green-700)] transition-colors" data-testid={`edit-${testPrefix}-${item.id}`}><Edit2 size={14} /></button>
                <button onClick={() => remove(item.id)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-50 text-red-400 transition-colors" data-testid={`delete-${testPrefix}-${item.id}`}><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
          {items.length === 0 && <p className="text-sm text-gray-300 text-center py-12">Sem registos. Clique em "Adicionar" para comecar.</p>}
        </div>
      </Card>
    </div>
  );
}

function EventsTab({ showToast }) {
  return <CRUDTab title="Eventos" subtitle="Gerir os eventos da sociedade." endpoint="/events" testPrefix="event" showToast={showToast} fields={[
    { key: "title", label: "Titulo *" }, { key: "date", label: "Data *", type: "date" },
    { key: "time", label: "Hora", placeholder: "21:00" }, { key: "location", label: "Local" },
    { key: "price", label: "Preco", placeholder: "12 euros" }, { key: "image_url", label: "URL Imagem" },
    { key: "description", label: "Descricao *", wide: true, rows: 3 },
  ]} />;
}

function ServicesTab({ showToast }) {
  return <CRUDTab title="Servicos" subtitle="Gerir os servicos oferecidos." endpoint="/services" testPrefix="service" showToast={showToast} fields={[
    { key: "title", label: "Titulo *" }, { key: "tag", label: "Categoria *", placeholder: "Cultura, Desporto..." },
    { key: "image_url", label: "URL Imagem", wide: true }, { key: "note", label: "Destaque" },
    { key: "order", label: "Ordem", type: "number", default: 0 },
    { key: "description", label: "Descricao *", wide: true, rows: 3 },
  ]} />;
}

function TimelineTab({ showToast }) {
  return <CRUDTab title="Cronologia" subtitle="Gerir a cronologia historica." endpoint="/timeline" testPrefix="timeline" showToast={showToast} fields={[
    { key: "year", label: "Ano *", placeholder: "1911, 1950s..." }, { key: "title", label: "Titulo *" },
    { key: "order", label: "Ordem", type: "number", default: 0 },
    { key: "description", label: "Descricao *", wide: true, rows: 3 },
  ]} />;
}

// ── Messages ──────────────────────────────────────────────────────────
function MessagesTab({ showToast }) {
  const [msgs, setMsgs] = useState([]);
  const [filter, setFilter] = useState("all");
  const fetch = useCallback(() => ax.get("/contacts").then(r => setMsgs(r.data)), []);
  useEffect(() => { fetch(); }, [fetch]);

  const shown = filter === "unread" ? msgs.filter(m => !m.read) : filter === "replied" ? msgs.filter(m => m.replied) : msgs;
  const toggle = async (id, field, val) => { await ax.put(`/contacts/${id}`, { [field]: val }); fetch(); showToast("Atualizado!"); };
  const remove = async (id) => { if (window.confirm("Apagar?")) { await ax.delete(`/contacts/${id}`); fetch(); showToast("Apagada."); } };

  return (
    <div data-testid="admin-messages-tab">
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-400">{msgs.filter(m => !m.read).length} mensagens nao lidas</p>
        <div className="flex gap-2">
          {[{ v: "all", l: "Todas" }, { v: "unread", l: "Nao lidas" }, { v: "replied", l: "Respondidas" }].map(f => (
            <button key={f.v} onClick={() => setFilter(f.v)}
              className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all ${filter === f.v ? "bg-[var(--green-700)] text-white shadow-sm" : "bg-white border border-gray-200 text-gray-400 hover:text-gray-600"}`}>{f.l}</button>
          ))}
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="divide-y divide-gray-50">
          {shown.map(m => (
            <div key={m.id} className={`px-6 py-5 hover:bg-gray-50/50 transition-colors ${!m.read ? "bg-[var(--green-100)]/30" : ""}`}>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0" style={{ backgroundColor: !m.read ? "var(--green-100)" : "#f3f4f6", color: !m.read ? "var(--green-700)" : "#9ca3af" }}>
                  {(m.name || "?")[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-semibold text-gray-700">{m.name}</p>
                    <span className="text-[10px] text-gray-300">{m.email}</span>
                    {!m.read && <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[var(--green-100)] text-[var(--green-700)]">NOVA</span>}
                    {m.replied && <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-500">RESPONDIDA</span>}
                  </div>
                  {m.subject && <p className="text-xs font-medium text-gray-600 mb-1">{m.subject}</p>}
                  <p className="text-sm text-gray-500 leading-relaxed">{m.message}</p>
                  <p className="text-[10px] text-gray-300 mt-2">{m.created_at ? new Date(m.created_at).toLocaleString("pt-PT") : ""}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  {!m.read && <button title="Marcar lida" onClick={() => toggle(m.id, "read", true)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[var(--green-100)] text-[var(--green-700)]"><Eye size={14} /></button>}
                  {!m.replied && <button title="Respondida" onClick={() => toggle(m.id, "replied", true)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-blue-50 text-blue-500"><Reply size={14} /></button>}
                  <a href={`mailto:${m.email}?subject=Re: ${m.subject || "Contacto SRDFSJL"}`} title="Email" className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 text-gray-400"><ExternalLink size={14} /></a>
                  <button onClick={() => remove(m.id)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-50 text-red-400"><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          ))}
          {shown.length === 0 && <p className="text-sm text-gray-300 text-center py-12">Sem mensagens.</p>}
        </div>
      </Card>
    </div>
  );
}

// ── Members ───────────────────────────────────────────────────────────
function MembersTab({ showToast }) {
  const [view, setView] = useState("dataverse");
  const [dvStatus, setDvStatus] = useState(null);
  const [socios, setSocios] = useState([]);
  const [dvLoading, setDvLoading] = useState(true);
  const [members, setMembers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({});
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [selectedSocio, setSelectedSocio] = useState(null);

  const fetchMembers = useCallback(() => ax.get("/members").then(r => setMembers(r.data)), []);
  const fetchSocios = useCallback(async () => {
    setDvLoading(true);
    try {
      const st = await ax.get("/dataverse/status"); setDvStatus(st.data);
      if (st.data.configured) { const r = await ax.get("/dataverse/socios"); setSocios(Array.isArray(r.data) ? r.data : []); }
    } catch { setDvStatus({ configured: false, message: "Erro ao conectar" }); }
    finally { setDvLoading(false); }
  }, []);
  useEffect(() => { fetchMembers(); fetchSocios(); }, [fetchMembers, fetchSocios]);

  const emptyForm = () => ({ cr56f_registrationnumber: "", cr56f_fullname: "", cr56f_estadosocio: "", cr56f_dateofbirth: "", cr56f_phonenumber: "", cr56f_email: "", cr56f_arruamento: "", cr56f_nporta: "", cr56f_postalcode: "", cr56f_city: "", cr56f_registrationyear: "", cr56f_observations: "" });
  const startNew = () => { setForm(emptyForm()); setEditId(null); setShowForm(true); };
  const startEdit = (e, s) => { e.stopPropagation(); const f = {}; Object.keys(emptyForm()).forEach(k => { f[k] = s[k] ?? ""; }); setEditId(s.cr56f_sociosv2id || ""); setForm(f); setShowForm(true); };
  const cancel = () => { setShowForm(false); setEditId(null); };
  const saveSocio = async () => {
    setSaving(true);
    try { if (editId) await ax.put(`/dataverse/socios/${editId}`, form); else await ax.post("/dataverse/socios", form); cancel(); fetchSocios(); showToast(editId ? "Socio atualizado!" : "Socio criado!"); }
    catch (e2) { showToast(e2.response?.data?.detail || "Erro", "error"); }
    finally { setSaving(false); }
  };
  const updateMemberStatus = async (id, status) => { await ax.put(`/members/${id}/status`, { status }); fetchMembers(); showToast("Atualizado!"); };
  const filtered = socios.filter(s => { if (!search) return true; const q = search.toLowerCase(); return (s.cr56f_fullname || "").toLowerCase().includes(q) || (s.cr56f_email || "").toLowerCase().includes(q) || String(s.cr56f_registrationnumber || "").includes(q); });
  const stColors = { pending: "bg-yellow-50 text-yellow-700", approved: "bg-green-50 text-[var(--green-700)]", rejected: "bg-red-50 text-red-600" };
  const stLabels = { pending: "Pendente", approved: "Aprovado", rejected: "Rejeitado" };
  const FIELDS = [
    { key: "cr56f_registrationnumber", label: "Num. Socio" }, { key: "cr56f_fullname", label: "Nome *", w: true }, { key: "cr56f_estadosocio", label: "Estado" },
    { key: "cr56f_dateofbirth", label: "Data Nasc.", type: "date" }, { key: "cr56f_phonenumber", label: "Telemovel" }, { key: "cr56f_email", label: "Email" },
    { key: "cr56f_arruamento", label: "Arruamento", w: true }, { key: "cr56f_nporta", label: "Porta" }, { key: "cr56f_postalcode", label: "Cod. Postal" },
    { key: "cr56f_city", label: "Localidade" }, { key: "cr56f_registrationyear", label: "Ano Inscricao" }, { key: "cr56f_observations", label: "Observacoes", w: true, rows: 2 },
  ];

  if (selectedSocio) return <SocioDetail socio={selectedSocio} onBack={() => setSelectedSocio(null)} showToast={showToast} />;

  return (
    <div data-testid="admin-members-tab">
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-400">Gestao completa de socios e quotas.</p>
        <div className="flex gap-2">
          <button onClick={() => setView("dataverse")} data-testid="members-view-dataverse" className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all ${view === "dataverse" ? "bg-[var(--green-700)] text-white shadow-sm" : "bg-white border border-gray-200 text-gray-400"}`}>Dataverse</button>
          <button onClick={() => setView("inscricoes")} data-testid="members-view-inscricoes" className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all ${view === "inscricoes" ? "bg-[var(--green-700)] text-white shadow-sm" : "bg-white border border-gray-200 text-gray-400"}`}>Inscricoes ({members.filter(m => m.status === "pending").length})</button>
        </div>
      </div>
      {view === "dataverse" ? (
        <div>
          {dvStatus && !dvStatus.configured && <Card className="p-5 mb-5 border-l-4 border-l-amber-400"><p className="text-sm font-semibold text-amber-700">Dataverse nao configurado</p><p className="text-xs text-gray-400 mt-1">{dvStatus.message}</p></Card>}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 relative"><Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" /><input type="text" placeholder="Pesquisar..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-11 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 bg-white outline-none focus:border-[var(--green-700)]" data-testid="members-search" /></div>
            <Btn onClick={startNew} testId="add-socio-btn" disabled={dvStatus && !dvStatus.configured}><Plus size={15} />Novo Socio</Btn>
          </div>
          {showForm && (
            <Card className="p-6 mb-5"><h3 className="text-sm font-bold text-gray-700 mb-4">{editId ? "Editar" : "Novo"} Socio</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">{FIELDS.map(f => (<div key={f.key} className={f.w ? "sm:col-span-3" : ""}><Inp label={f.label} value={form[f.key] ?? ""} onChange={v => setForm({...form, [f.key]: v})} type={f.type || "text"} rows={f.rows} testId={`socio-form-${f.key}`} /></div>))}</div>
            <div className="flex gap-3 mt-5"><Btn onClick={saveSocio} disabled={saving} testId="socio-form-save"><Save size={14} />{saving ? "..." : "Guardar"}</Btn><Btn onClick={cancel} variant="secondary"><X size={14} />Cancelar</Btn></div></Card>
          )}
          {dvLoading ? <div className="text-center py-16"><div className="w-8 h-8 border-2 border-[var(--green-700)] border-t-transparent rounded-full animate-spin mx-auto" /></div>
          : dvStatus?.configured ? (
            <Card className="overflow-hidden">
              <table className="w-full text-sm" data-testid="socios-table"><thead><tr className="bg-gray-50/80">{["Num.", "Nome", "Estado", "Telemovel", "Email", "Localidade", "Quotas", ""].map(h => (<th key={h} className="py-3 px-5 text-left font-semibold text-xs text-gray-400 uppercase tracking-wider">{h}</th>))}</tr></thead>
              <tbody className="divide-y divide-gray-50">{filtered.map((s, i) => (
                <tr key={i} className="hover:bg-gray-50/50 transition-colors group cursor-pointer" onClick={() => setSelectedSocio(s)}>
                  <td className="py-3.5 px-5 font-semibold text-gray-700">{s.cr56f_registrationnumber || "-"}</td>
                  <td className="py-3.5 px-5 text-gray-700">{s.cr56f_fullname || "-"}</td>
                  <td className="py-3.5 px-5"><span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-[var(--green-100)] text-[var(--green-700)]">{s.cr56f_estadosocio || "-"}</span></td>
                  <td className="py-3.5 px-5 text-gray-400">{s.cr56f_phonenumber || "-"}</td>
                  <td className="py-3.5 px-5 text-gray-400">{s.cr56f_email || "-"}</td>
                  <td className="py-3.5 px-5 text-gray-400">{s.cr56f_city || "-"}</td>
                  <td className="py-3.5 px-5"><button onClick={(e2) => { e2.stopPropagation(); setSelectedSocio(s); }} className="text-xs font-semibold text-[var(--green-700)] hover:underline flex items-center gap-1"><Receipt size={12} />Ver</button></td>
                  <td className="py-3.5 px-5"><button onClick={(e2) => startEdit(e2, s)} className="w-8 h-8 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-[var(--green-100)] text-[var(--green-700)] transition-all"><Edit2 size={14} /></button></td>
                </tr>))}</tbody></table>
              {filtered.length === 0 && <p className="text-sm text-gray-300 text-center py-12">Sem socios.</p>}
              <div className="px-5 py-3 border-t border-gray-50 text-xs text-gray-300">{filtered.length} de {socios.length} socios</div>
            </Card>
          ) : <Card className="p-12 text-center"><p className="text-sm text-gray-300">Configure o Dataverse.</p></Card>}
        </div>
      ) : (
        <Card className="overflow-hidden"><div className="divide-y divide-gray-50">{members.map(m => (
          <div key={m.id} className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50/50 group">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-500">{(m.full_name||"?")[0].toUpperCase()}</div>
            <div className="flex-1 min-w-0"><div className="flex items-center gap-2"><p className="text-sm font-semibold text-gray-700">{m.full_name}</p><span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${stColors[m.status]}`}>{stLabels[m.status]}</span></div><p className="text-xs text-gray-400">{m.email} · {m.phone}</p></div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {m.status !== "approved" && <button onClick={() => updateMemberStatus(m.id, "approved")} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-green-50 text-[var(--green-700)]"><Check size={14} /></button>}
              {m.status !== "rejected" && <button onClick={() => updateMemberStatus(m.id, "rejected")} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-50 text-red-400"><X size={14} /></button>}
            </div></div>
        ))}{members.length === 0 && <p className="text-sm text-gray-300 text-center py-12">Sem inscricoes.</p>}</div></Card>
      )}
    </div>
  );
}

// ── Socio Detail + Quotas ─────────────────────────────────────────────
function SocioDetail({ socio, onBack, showToast }) {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPayForm, setShowPayForm] = useState(false);
  const [payForm, setPayForm] = useState({ cr56f_membershipyear: new Date().getFullYear(), cr56f_paymentamount: 12, cr56f_paymentdate: new Date().toISOString().split("T")[0], cr56f_paymentmethod: 1 });
  const [saving, setSaving] = useState(false);
  const mid = String(socio.cr56f_registrationnumber || "");

  const fetchPay = useCallback(async () => { setLoading(true); try { const r = await ax.get(`/dataverse/payments?membershipid=${mid}`); setPayments(Array.isArray(r.data) ? r.data : []); } catch { setPayments([]); } finally { setLoading(false); } }, [mid]);
  useEffect(() => { fetchPay(); }, [fetchPay]);

  const savePay = async () => { setSaving(true); try { await ax.post("/dataverse/payments", { ...payForm, cr56f_membershipid: mid, cr56f_paymentdate: payForm.cr56f_paymentdate + "T00:00:00Z" }); setShowPayForm(false); fetchPay(); showToast("Pagamento registado!"); } catch (e) { showToast(e.response?.data?.detail || "Erro", "error"); } finally { setSaving(false); } };
  const delPay = async (id) => { if (!window.confirm("Apagar pagamento?")) return; try { await ax.delete(`/dataverse/payments/${id}`); fetchPay(); showToast("Apagado."); } catch { showToast("Erro", "error"); } };

  const methods = { 1: "Numerario", 2: "Transferencia", 3: "MBWay", 4: "Multibanco" };
  const fmtDate = (d) => d ? new Date(d).toLocaleDateString("pt-PT") : "-";
  const byYear = {}; payments.forEach(p => { const y = p.cr56f_membershipyear || "?"; if (!byYear[y]) byYear[y] = []; byYear[y].push(p); });
  const years = Object.keys(byYear).sort((a, b) => b - a);

  return (
    <div data-testid="socio-detail">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50" data-testid="back-to-list"><ArrowLeft size={18} className="text-gray-500" /></button>
        <div className="flex-1"><h2 className="text-xl font-bold text-gray-800">{socio.cr56f_fullname || "Sem nome"}</h2><p className="text-sm text-gray-400">Socio #{mid} · {socio.cr56f_email || ""} · {socio.cr56f_phonenumber || ""}</p></div>
        <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-[var(--green-100)] text-[var(--green-700)]">{socio.cr56f_estadosocio || "-"}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
        <Card className="p-5"><p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Dados Pessoais</p><div className="space-y-2 text-sm">
          <div><span className="text-gray-400">Telemovel:</span> <span className="text-gray-700 font-medium">{socio.cr56f_phonenumber || "-"}</span></div>
          <div><span className="text-gray-400">Email:</span> <span className="text-gray-700 font-medium">{socio.cr56f_email || "-"}</span></div>
          <div><span className="text-gray-400">Localidade:</span> <span className="text-gray-700 font-medium">{socio.cr56f_city || "-"}</span></div>
          <div><span className="text-gray-400">Cod. Postal:</span> <span className="text-gray-700 font-medium">{socio.cr56f_postalcode || "-"}</span></div>
        </div></Card>
        <Card className="p-5"><p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Inscricao</p><div className="space-y-2 text-sm">
          <div><span className="text-gray-400">Num. Socio:</span> <span className="text-gray-700 font-medium">{mid}</span></div>
          <div><span className="text-gray-400">Ano:</span> <span className="text-gray-700 font-medium">{socio.cr56f_registrationyear || "-"}</span></div>
          <div><span className="text-gray-400">Obs:</span> <span className="text-gray-700 font-medium">{socio.cr56f_observations || "-"}</span></div>
        </div></Card>
        <Card className="p-5 flex flex-col items-center justify-center text-center">
          <CreditCard size={28} className="text-[var(--green-700)] mb-2" />
          <p className="text-3xl font-bold text-gray-800">{payments.length}</p>
          <p className="text-xs text-gray-400">Pagamentos</p>
          {years.length > 0 && <p className="text-xs text-gray-300 mt-0.5">{years[years.length-1]} - {years[0]}</p>}
        </Card>
      </div>

      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base font-bold text-gray-700 flex items-center gap-2"><Receipt size={18} className="text-[var(--green-700)]" /> Historico de Quotas</h3>
        <Btn onClick={() => setShowPayForm(true)} testId="add-payment-btn"><Plus size={14} />Registar Pagamento</Btn>
      </div>

      {showPayForm && (
        <Card className="p-6 mb-5"><h3 className="text-sm font-bold text-gray-700 mb-4">Novo Pagamento</h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Inp label="Ano *" type="number" value={payForm.cr56f_membershipyear} onChange={v => setPayForm({...payForm, cr56f_membershipyear: parseInt(v)||0})} testId="payment-year" />
          <Inp label="Valor (EUR) *" type="number" value={payForm.cr56f_paymentamount} onChange={v => setPayForm({...payForm, cr56f_paymentamount: parseFloat(v)||0})} testId="payment-amount" />
          <Inp label="Data *" type="date" value={payForm.cr56f_paymentdate} onChange={v => setPayForm({...payForm, cr56f_paymentdate: v})} testId="payment-date" />
          <div><label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Metodo</label>
          <select value={payForm.cr56f_paymentmethod} onChange={e => setPayForm({...payForm, cr56f_paymentmethod: parseInt(e.target.value)})} className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 bg-gray-50/50 outline-none focus:border-[var(--green-700)]" data-testid="payment-method">
            <option value={1}>Numerario</option><option value={2}>Transferencia</option><option value={3}>MBWay</option><option value={4}>Multibanco</option>
          </select></div>
        </div>
        <div className="flex gap-3 mt-5"><Btn onClick={savePay} disabled={saving} testId="payment-form-save"><Save size={14} />{saving ? "..." : "Registar"}</Btn><Btn onClick={() => setShowPayForm(false)} variant="secondary"><X size={14} />Cancelar</Btn></div></Card>
      )}

      {loading ? <div className="text-center py-12"><div className="w-8 h-8 border-2 border-[var(--green-700)] border-t-transparent rounded-full animate-spin mx-auto" /></div>
      : payments.length > 0 ? (
        <div className="space-y-4">{years.map(year => (
          <Card key={year} className="overflow-hidden">
            <div className="px-5 py-3 bg-gray-50/80 border-b border-gray-100 flex items-center justify-between">
              <h4 className="text-sm font-bold text-gray-700 flex items-center gap-2"><Calendar size={14} className="text-[var(--green-700)]" />{year}</h4>
              <span className="text-xs text-gray-400">{byYear[year].length} pagamento{byYear[year].length !== 1 ? "s" : ""}</span>
            </div>
            <div className="divide-y divide-gray-50">{byYear[year].map((p, i) => (
              <div key={i} className="px-5 py-3.5 flex items-center gap-4 hover:bg-gray-50/30 group">
                <div className="w-10 h-10 rounded-xl bg-[var(--green-100)] flex items-center justify-center shrink-0"><CreditCard size={16} className="text-[var(--green-700)]" /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-700">{p.cr56f_paymentamount ? `${p.cr56f_paymentamount} EUR` : "-"}</p>
                  <p className="text-xs text-gray-400">{fmtDate(p.cr56f_paymentdate)} · {methods[p.cr56f_paymentmethod] || `Metodo ${p.cr56f_paymentmethod}`}</p>
                </div>
                {p.cr56f_sagereceiptid && <span className="text-[10px] text-gray-300 font-mono">#{p.cr56f_sagereceiptid}</span>}
                <button onClick={() => delPay(p.cr56f_paymentsrecordid)} className="w-8 h-8 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-50 text-red-400 transition-all"><Trash2 size={13} /></button>
              </div>))}</div>
          </Card>))}</div>
      ) : <Card className="p-12 text-center"><CreditCard size={32} className="mx-auto text-gray-200 mb-3" /><p className="text-sm text-gray-300">Sem pagamentos registados.</p></Card>}
    </div>
  );
}

// ── Settings ──────────────────────────────────────────────────────────
function SettingsTab({ showToast }) {
  const [data, setData] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { ax.get("/settings").then(r => setData(r.data)); }, []);

  const save = async () => {
    setSaving(true);
    try { await ax.put("/settings", data); showToast("Definicoes guardadas!"); }
    catch { showToast("Erro ao guardar", "error"); }
    finally { setSaving(false); }
  };

  if (!data) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-[var(--green-700)] border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div data-testid="admin-settings-tab" className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">Configuracoes gerais do website.</p>
        <Btn onClick={save} disabled={saving} testId="save-settings"><Save size={14} />{saving ? "..." : "Guardar"}</Btn>
      </div>

      <Card className="p-7">
        <h3 className="text-sm font-bold text-gray-700 mb-5 flex items-center gap-2"><Settings size={15} className="text-[var(--green-700)]" /> Informacoes Gerais</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Inp label="Nome" value={data.society_name || ""} onChange={v => setData({...data, society_name: v})} />
          <Inp label="Ano Fundacao" type="number" value={data.founding_year || ""} onChange={v => setData({...data, founding_year: parseInt(v) || 0})} />
          <Inp label="Morada" value={data.address || ""} onChange={v => setData({...data, address: v})} />
          <Inp label="Cidade" value={data.city || ""} onChange={v => setData({...data, city: v})} />
          <Inp label="Email" value={data.email || ""} onChange={v => setData({...data, email: v})} />
          <Inp label="Telefone" value={data.phone || ""} onChange={v => setData({...data, phone: v})} />
        </div>
      </Card>

      <Card className="p-7">
        <h3 className="text-sm font-bold text-gray-700 mb-5">Redes Sociais</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Inp label="Facebook" value={data.facebook_url || ""} onChange={v => setData({...data, facebook_url: v})} placeholder="https://facebook.com/..." />
          <Inp label="Instagram" value={data.instagram_url || ""} onChange={v => setData({...data, instagram_url: v})} placeholder="https://instagram.com/..." />
        </div>
      </Card>
    </div>
  );
}
