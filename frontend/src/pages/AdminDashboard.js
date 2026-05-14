import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  LogOut, LayoutDashboard, Calendar, Briefcase, Clock as ClockIcon, Mail, Settings, Users,
  Plus, Trash2, Edit2, Save, X, Check, Eye, Reply, ExternalLink, ArrowUp, ArrowDown,
  TrendingUp, MessageSquare, UserPlus, CalendarDays,
} from "lucide-react";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const ax = axios.create({ baseURL: API, withCredentials: true });

export default function AdminDashboard() {
  const { user, loading: authLoading, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("dashboard");

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "admin")) navigate("/admin/login");
  }, [user, authLoading, navigate]);

  if (authLoading) return <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]"><div className="w-8 h-8 border-2 border-[var(--green-700)] border-t-transparent rounded-full animate-spin" /></div>;
  if (!user || user.role !== "admin") return null;

  const TABS = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "homepage", label: "Homepage", icon: TrendingUp },
    { id: "events", label: "Eventos", icon: Calendar },
    { id: "services", label: "Servicos", icon: Briefcase },
    { id: "timeline", label: "Cronologia", icon: ClockIcon },
    { id: "messages", label: "Mensagens", icon: Mail },
    { id: "members", label: "Socios", icon: Users },
    { id: "settings", label: "Definicoes", icon: Settings },
  ];

  return (
    <div className="min-h-screen flex bg-[var(--bg)]">
      <aside className="w-56 min-h-screen flex flex-col border-r border-[var(--border)] bg-white" data-testid="admin-sidebar">
        <div className="p-4 border-b border-[var(--border)]">
          <h2 className="text-sm font-bold text-[var(--text-primary)]">Admin SRDFSJL</h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">{user.email}</p>
        </div>
        <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
          {TABS.map(t => (
            <button key={t.id} data-testid={`admin-tab-${t.id}`} onClick={() => setTab(t.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-[13px] font-medium rounded-lg transition-colors ${tab === t.id ? "bg-[var(--green-700)] text-white" : "text-[var(--text-secondary)] hover:bg-[var(--surface-alt)]"}`}>
              <t.icon size={15} />{t.label}
            </button>
          ))}
        </nav>
        <div className="p-2 border-t border-[var(--border)]">
          <button data-testid="admin-logout-btn" onClick={async () => { await logout(); navigate("/admin/login"); }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] font-medium text-[var(--text-muted)] rounded-lg hover:bg-[var(--surface-alt)]">
            <LogOut size={15} />Sair
          </button>
        </div>
      </aside>
      <main className="flex-1 p-6 overflow-y-auto max-h-screen">
        {tab === "dashboard" && <DashboardTab />}
        {tab === "homepage" && <HomepageTab />}
        {tab === "events" && <EventsTab />}
        {tab === "services" && <ServicesTab />}
        {tab === "timeline" && <TimelineTab />}
        {tab === "messages" && <MessagesTab />}
        {tab === "members" && <MembersTab />}
        {tab === "settings" && <SettingsTab />}
      </main>
    </div>
  );
}

// ── Shared ─────────────────────────────────────────────────────────────
const Inp = ({ label, value, onChange, type = "text", placeholder = "", testId, rows }) => (
  <div>
    <label className="block text-xs font-medium text-[var(--text-primary)] mb-1">{label}</label>
    {rows ? (
      <textarea data-testid={testId} rows={rows} value={value} onChange={e => onChange(e.target.value)}
        className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--border)] outline-none resize-none focus:border-[var(--green-700)]" placeholder={placeholder} />
    ) : (
      <input data-testid={testId} type={type} value={value} onChange={e => onChange(e.target.value)}
        className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--border)] outline-none focus:border-[var(--green-700)]" placeholder={placeholder} />
    )}
  </div>
);

const Btn = ({ children, onClick, variant = "primary", disabled, testId, className = "" }) => {
  const base = "inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-all disabled:opacity-50";
  const styles = { primary: "bg-[var(--green-700)] text-white hover:brightness-110", secondary: "border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--surface-alt)]", danger: "bg-red-500 text-white hover:bg-red-600" };
  return <button data-testid={testId} onClick={onClick} disabled={disabled} className={`${base} ${styles[variant]} ${className}`}>{children}</button>;
};

const Card = ({ children, className = "" }) => <div className={`bg-white rounded-xl border border-[var(--border)] ${className}`}>{children}</div>;

// ── Dashboard ─────────────────────────────────────────────────────────
function DashboardTab() {
  const [s, setS] = useState(null);
  useEffect(() => { ax.get("/admin/stats").then(r => setS(r.data)); }, []);
  if (!s) return <div className="animate-pulse text-sm text-[var(--text-muted)]">A carregar...</div>;
  const cards = [
    { label: "Eventos Futuros", val: s.events.upcoming, total: s.events.total, icon: CalendarDays, color: "var(--green-700)" },
    { label: "Mensagens Nao Lidas", val: s.messages.unread, total: s.messages.total, icon: MessageSquare, color: "#D97742" },
    { label: "Socios Pendentes", val: s.members.pending, total: s.members.total, icon: UserPlus, color: "#6366f1" },
    { label: "Servicos Ativos", val: s.services.total, total: null, icon: Briefcase, color: "#0891b2" },
  ];
  return (
    <div data-testid="admin-dashboard-tab">
      <h1 className="text-xl font-bold text-[var(--text-primary)] mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(c => (
          <Card key={c.label} className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-2xl font-bold" style={{ color: c.color }}>{c.val}</p>
                <p className="text-xs text-[var(--text-muted)] mt-1">{c.label}</p>
                {c.total !== null && <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{c.total} total</p>}
              </div>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: c.color + "15" }}>
                <c.icon size={18} style={{ color: c.color }} />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── Homepage Content ──────────────────────────────────────────────────
function HomepageTab() {
  const [data, setData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => { ax.get("/content/homepage").then(r => setData(r.data)); }, []);

  const save = async () => {
    setSaving(true); setMsg("");
    try { await ax.put("/content/homepage", data); setMsg("Guardado!"); setTimeout(() => setMsg(""), 2000); }
    catch { setMsg("Erro ao guardar"); }
    finally { setSaving(false); }
  };

  if (!data) return <div className="animate-pulse text-sm text-[var(--text-muted)]">A carregar...</div>;

  return (
    <div data-testid="admin-homepage-tab">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-[var(--text-primary)]">Conteudo da Homepage</h1>
        <div className="flex items-center gap-3">
          {msg && <span className="text-sm text-[var(--green-700)] font-medium">{msg}</span>}
          <Btn onClick={save} disabled={saving} testId="save-homepage"><Save size={14} />{saving ? "A guardar..." : "Guardar"}</Btn>
        </div>
      </div>
      <div className="space-y-6">
        <Card className="p-6">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Hero Section</h3>
          <div className="space-y-3">
            <Inp label="Badge (tag superior)" value={data.hero_badge || ""} onChange={v => setData({...data, hero_badge: v})} placeholder="Desde 1911..." />
            <Inp label="Titulo Principal" value={data.hero_title || ""} onChange={v => setData({...data, hero_title: v})} />
            <Inp label="Subtitulo" value={data.hero_subtitle || ""} onChange={v => setData({...data, hero_subtitle: v})} rows={2} />
          </div>
        </Card>
        <Card className="p-6">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Seccao Sobre Nos</h3>
          <div className="space-y-3">
            <Inp label="Label" value={data.about_label || ""} onChange={v => setData({...data, about_label: v})} />
            <Inp label="Titulo" value={data.about_title || ""} onChange={v => setData({...data, about_title: v})} />
            <Inp label="Texto" value={data.about_text || ""} onChange={v => setData({...data, about_text: v})} rows={3} />
          </div>
        </Card>
        <Card className="p-6">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Estatisticas</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {(data.stats || []).map((s, i) => (
              <div key={i} className="p-3 border border-[var(--border)] rounded-lg space-y-2">
                <Inp label="Valor" type="number" value={s.val} onChange={v => { const ns = [...data.stats]; ns[i] = {...ns[i], val: parseInt(v) || 0}; setData({...data, stats: ns}); }} />
                <Inp label="Label" value={s.label} onChange={v => { const ns = [...data.stats]; ns[i] = {...ns[i], label: v}; setData({...data, stats: ns}); }} />
                <Inp label="Sufixo" value={s.suffix} onChange={v => { const ns = [...data.stats]; ns[i] = {...ns[i], suffix: v}; setData({...data, stats: ns}); }} placeholder="ex: +" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ── CRUD Tab (generic for Events, Services, Timeline) ─────────────────
function CRUDTab({ title, endpoint, fields, testPrefix }) {
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
    if (editId) await ax.put(`${endpoint}/${editId}`, form);
    else await ax.post(endpoint, form);
    cancel(); fetch();
  };

  const remove = async (id) => {
    if (window.confirm("Tem a certeza?")) { await ax.delete(`${endpoint}/${id}`); fetch(); }
  };

  return (
    <div data-testid={`admin-${testPrefix}-tab`}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-[var(--text-primary)]">{title}</h1>
        <Btn onClick={startNew} testId={`add-${testPrefix}-btn`}><Plus size={14} />Novo</Btn>
      </div>

      {showForm && (
        <Card className="p-5 mb-5">
          <h3 className="text-sm font-semibold mb-3">{editId ? "Editar" : "Novo"}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {fields.map(f => (
              <div key={f.key} className={f.wide ? "sm:col-span-2" : ""}>
                <Inp label={f.label} value={form[f.key] ?? ""} onChange={v => setForm({...form, [f.key]: f.type === "number" ? (parseInt(v) || 0) : v})}
                  type={f.type || "text"} placeholder={f.placeholder || ""} rows={f.rows} testId={`${testPrefix}-form-${f.key}`} />
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-4">
            <Btn onClick={save} testId={`${testPrefix}-form-save`}><Save size={14} />Guardar</Btn>
            <Btn onClick={cancel} variant="secondary"><X size={14} />Cancelar</Btn>
          </div>
        </Card>
      )}

      <div className="space-y-2">
        {items.map(item => (
          <Card key={item.id} className="px-4 py-3 flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--text-primary)] truncate">{item[fields[0].key]}</p>
              <p className="text-xs text-[var(--text-muted)] truncate">{item[fields[1]?.key] || ""} {item.date ? `| ${item.date}` : ""}</p>
            </div>
            <div className="flex gap-1 shrink-0">
              <button onClick={() => startEdit(item)} className="p-1.5 rounded hover:bg-[var(--surface-alt)] text-[var(--green-700)]" data-testid={`edit-${testPrefix}-${item.id}`}><Edit2 size={14} /></button>
              <button onClick={() => remove(item.id)} className="p-1.5 rounded hover:bg-red-50 text-red-500" data-testid={`delete-${testPrefix}-${item.id}`}><Trash2 size={14} /></button>
            </div>
          </Card>
        ))}
        {items.length === 0 && <p className="text-sm text-[var(--text-muted)] text-center py-10">Sem registos.</p>}
      </div>
    </div>
  );
}

function EventsTab() {
  return <CRUDTab title="Gerir Eventos" endpoint="/events" testPrefix="event" fields={[
    { key: "title", label: "Titulo *", wide: false },
    { key: "date", label: "Data *", type: "date" },
    { key: "time", label: "Hora", placeholder: "ex: 21:00" },
    { key: "location", label: "Local" },
    { key: "price", label: "Preco", placeholder: "ex: 12 euros" },
    { key: "image_url", label: "URL Imagem" },
    { key: "description", label: "Descricao *", wide: true, rows: 3 },
  ]} />;
}

function ServicesTab() {
  return <CRUDTab title="Gerir Servicos" endpoint="/services" testPrefix="service" fields={[
    { key: "title", label: "Titulo *" },
    { key: "tag", label: "Categoria *", placeholder: "ex: Cultura, Desporto" },
    { key: "image_url", label: "URL Imagem", wide: true },
    { key: "note", label: "Nota / Destaque" },
    { key: "order", label: "Ordem", type: "number", default: 0 },
    { key: "description", label: "Descricao *", wide: true, rows: 3 },
  ]} />;
}

function TimelineTab() {
  return <CRUDTab title="Gerir Cronologia" endpoint="/timeline" testPrefix="timeline" fields={[
    { key: "year", label: "Ano *", placeholder: "ex: 1911, 1950s" },
    { key: "title", label: "Titulo *" },
    { key: "order", label: "Ordem", type: "number", default: 0 },
    { key: "description", label: "Descricao *", wide: true, rows: 3 },
  ]} />;
}

// ── Messages ──────────────────────────────────────────────────────────
function MessagesTab() {
  const [msgs, setMsgs] = useState([]);
  const [filter, setFilter] = useState("all");
  const fetch = useCallback(() => ax.get("/contacts").then(r => setMsgs(r.data)), []);
  useEffect(() => { fetch(); }, [fetch]);

  const shown = filter === "unread" ? msgs.filter(m => !m.read) : filter === "replied" ? msgs.filter(m => m.replied) : msgs;

  const toggle = async (id, field, val) => { await ax.put(`/contacts/${id}`, { [field]: val }); fetch(); };
  const remove = async (id) => { if (window.confirm("Apagar mensagem?")) { await ax.delete(`/contacts/${id}`); fetch(); } };

  return (
    <div data-testid="admin-messages-tab">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-[var(--text-primary)]">Mensagens ({msgs.filter(m => !m.read).length} nao lidas)</h1>
        <div className="flex gap-2">
          {["all", "unread", "replied"].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg ${filter === f ? "bg-[var(--green-700)] text-white" : "border border-[var(--border)] text-[var(--text-muted)]"}`}>
              {f === "all" ? "Todas" : f === "unread" ? "Nao lidas" : "Respondidas"}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        {shown.map(m => (
          <Card key={m.id} className={`p-4 ${!m.read ? "border-l-4 border-l-[var(--green-700)]" : ""}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-semibold text-[var(--text-primary)]">{m.name}</p>
                  <span className="text-[10px] text-[var(--text-muted)]">{m.email}</span>
                  {!m.read && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[var(--green-100)] text-[var(--green-700)]">NOVA</span>}
                  {m.replied && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-600">RESPONDIDA</span>}
                </div>
                {m.subject && <p className="text-xs font-medium text-[var(--text-primary)] mb-1">{m.subject}</p>}
                <p className="text-sm text-[var(--text-secondary)]">{m.message}</p>
                <p className="text-[10px] text-[var(--text-muted)] mt-2">{m.created_at ? new Date(m.created_at).toLocaleString("pt-PT") : ""}</p>
              </div>
              <div className="flex gap-1 shrink-0">
                {!m.read && <button title="Marcar como lida" onClick={() => toggle(m.id, "read", true)} className="p-1.5 rounded hover:bg-[var(--surface-alt)] text-[var(--green-700)]"><Eye size={14} /></button>}
                {!m.replied && <button title="Marcar como respondida" onClick={() => toggle(m.id, "replied", true)} className="p-1.5 rounded hover:bg-blue-50 text-blue-600"><Reply size={14} /></button>}
                <a href={`mailto:${m.email}?subject=Re: ${m.subject || "Contacto SRDFSJL"}`} title="Responder por email" className="p-1.5 rounded hover:bg-[var(--surface-alt)] text-[var(--text-muted)]"><ExternalLink size={14} /></a>
                <button onClick={() => remove(m.id)} className="p-1.5 rounded hover:bg-red-50 text-red-500"><Trash2 size={14} /></button>
              </div>
            </div>
          </Card>
        ))}
        {shown.length === 0 && <p className="text-sm text-[var(--text-muted)] text-center py-10">Sem mensagens.</p>}
      </div>
    </div>
  );
}

// ── Members ───────────────────────────────────────────────────────────
function MembersTab() {
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

  const fetchMembers = useCallback(() => ax.get("/members").then(r => setMembers(r.data)), []);
  const fetchSocios = useCallback(async () => {
    setDvLoading(true);
    try {
      const st = await ax.get("/dataverse/status");
      setDvStatus(st.data);
      if (st.data.configured) {
        const r = await ax.get("/dataverse/socios");
        setSocios(Array.isArray(r.data) ? r.data : []);
      }
    } catch { setDvStatus({ configured: false, message: "Erro ao conectar" }); }
    finally { setDvLoading(false); }
  }, []);
  useEffect(() => { fetchMembers(); fetchSocios(); }, [fetchMembers, fetchSocios]);

  const emptyForm = () => ({ cr_numerosocio: "", cr_nome: "", cr_estado: "", cr_datadenascimento: "", cr_telemovel: "", cr_email: "", cr_arruamento: "", cr_nporta: "", cr_codigopostal: "", cr_localidade: "", cr_datadeinscricao: new Date().toISOString().split("T")[0], cr_observacoes: "" });
  const startNew = () => { setForm(emptyForm()); setEditId(null); setShowForm(true); };
  const startEdit = (s) => { const f = {}; Object.keys(emptyForm()).forEach(k => { f[k] = s[k] ?? ""; }); setEditId(s[Object.keys(s).find(k => k.endsWith("id") && k.startsWith("cr_"))] || ""); setForm(f); setShowForm(true); };
  const cancel = () => { setShowForm(false); setEditId(null); };
  const saveSocio = async () => {
    setSaving(true);
    try { if (editId) await ax.put(`/dataverse/socios/${editId}`, form); else await ax.post("/dataverse/socios", form); cancel(); fetchSocios(); }
    catch (e) { alert(e.response?.data?.detail || "Erro ao guardar"); }
    finally { setSaving(false); }
  };
  const updateMemberStatus = async (id, status) => { await ax.put(`/members/${id}/status`, { status }); fetchMembers(); };
  const filtered = socios.filter(s => { if (!search) return true; const q = search.toLowerCase(); return (s.cr_nome || "").toLowerCase().includes(q) || (s.cr_email || "").toLowerCase().includes(q) || String(s.cr_numerosocio || "").includes(q); });
  const statusColors = { pending: "bg-yellow-50 text-yellow-700", approved: "bg-green-50 text-[var(--green-700)]", rejected: "bg-red-50 text-red-600" };
  const statusLabels = { pending: "Pendente", approved: "Aprovado", rejected: "Rejeitado" };
  const FIELDS = [
    { key: "cr_numerosocio", label: "Num. Socio" }, { key: "cr_nome", label: "Nome *", w: true }, { key: "cr_estado", label: "Estado" },
    { key: "cr_datadenascimento", label: "Data Nasc.", type: "date" }, { key: "cr_telemovel", label: "Telemovel" }, { key: "cr_email", label: "Email" },
    { key: "cr_arruamento", label: "Arruamento", w: true }, { key: "cr_nporta", label: "Num. Porta" }, { key: "cr_codigopostal", label: "Cod. Postal" },
    { key: "cr_localidade", label: "Localidade" }, { key: "cr_datadeinscricao", label: "Data Inscricao", type: "date" }, { key: "cr_observacoes", label: "Observacoes", w: true, rows: 2 },
  ];

  return (
    <div data-testid="admin-members-tab">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-[var(--text-primary)]">Gestao de Socios</h1>
        <div className="flex gap-2">
          <button onClick={() => setView("dataverse")} data-testid="members-view-dataverse"
            className={`px-4 py-2 text-xs font-medium rounded-lg transition-all ${view === "dataverse" ? "bg-[var(--green-700)] text-white" : "border border-[var(--border)] text-[var(--text-muted)]"}`}>Dataverse</button>
          <button onClick={() => setView("inscricoes")} data-testid="members-view-inscricoes"
            className={`px-4 py-2 text-xs font-medium rounded-lg transition-all ${view === "inscricoes" ? "bg-[var(--green-700)] text-white" : "border border-[var(--border)] text-[var(--text-muted)]"}`}>Inscricoes ({members.filter(m => m.status === "pending").length})</button>
        </div>
      </div>
      {view === "dataverse" ? (
        <div>
          {dvStatus && !dvStatus.configured && (
            <Card className="p-4 mb-4 border-l-4 border-l-yellow-400">
              <p className="text-sm text-yellow-700 font-medium">Dataverse nao configurado</p>
              <p className="text-xs text-[var(--text-muted)] mt-1">{dvStatus.message}</p>
            </Card>
          )}
          <div className="flex items-center gap-3 mb-4">
            <input type="text" placeholder="Pesquisar nome, email, num. socio..." value={search} onChange={e => setSearch(e.target.value)} className="flex-1 px-4 py-2.5 text-sm rounded-lg border border-[var(--border)] outline-none focus:border-[var(--green-700)]" data-testid="members-search" />
            <Btn onClick={startNew} testId="add-socio-btn" disabled={dvStatus && !dvStatus.configured}><Plus size={14} />Novo Socio</Btn>
          </div>
          {showForm && (
            <Card className="p-5 mb-5">
              <h3 className="text-sm font-semibold mb-3">{editId ? "Editar Socio" : "Novo Socio"}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {FIELDS.map(f => (<div key={f.key} className={f.w ? "sm:col-span-3" : ""}><Inp label={f.label} value={form[f.key] ?? ""} onChange={v => setForm({...form, [f.key]: v})} type={f.type || "text"} rows={f.rows} testId={`socio-form-${f.key}`} /></div>))}
              </div>
              <div className="flex gap-2 mt-4">
                <Btn onClick={saveSocio} disabled={saving} testId="socio-form-save"><Save size={14} />{saving ? "..." : "Guardar"}</Btn>
                <Btn onClick={cancel} variant="secondary"><X size={14} />Cancelar</Btn>
              </div>
            </Card>
          )}
          {dvLoading ? (
            <div className="text-center py-16"><div className="w-8 h-8 border-2 border-[var(--green-700)] border-t-transparent rounded-full animate-spin mx-auto" /></div>
          ) : dvStatus?.configured ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm" data-testid="socios-table">
                <thead><tr className="border-b border-[var(--border)] text-left">
                  {["Num.", "Nome", "Estado", "Telemovel", "Email", "Localidade", ""].map(h => (<th key={h} className="py-2.5 px-3 font-semibold text-xs text-[var(--text-muted)]">{h}</th>))}
                </tr></thead>
                <tbody>
                  {filtered.map((s, i) => (
                    <tr key={i} className="border-b border-[var(--border-light)] hover:bg-[var(--surface-alt)]">
                      <td className="py-2.5 px-3 font-medium text-[var(--text-primary)]">{s.cr_numerosocio || "-"}</td>
                      <td className="py-2.5 px-3 text-[var(--text-primary)]">{s.cr_nome || "-"}</td>
                      <td className="py-2.5 px-3"><span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[var(--green-100)] text-[var(--green-700)]">{s.cr_estado || "-"}</span></td>
                      <td className="py-2.5 px-3 text-[var(--text-muted)]">{s.cr_telemovel || "-"}</td>
                      <td className="py-2.5 px-3 text-[var(--text-muted)]">{s.cr_email || "-"}</td>
                      <td className="py-2.5 px-3 text-[var(--text-muted)]">{s.cr_localidade || "-"}</td>
                      <td className="py-2.5 px-3"><button onClick={() => startEdit(s)} className="p-1 rounded hover:bg-[var(--surface-alt)] text-[var(--green-700)]"><Edit2 size={13} /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && <p className="text-sm text-[var(--text-muted)] text-center py-10">Sem socios.</p>}
              <p className="text-xs text-[var(--text-muted)] mt-3">{filtered.length} de {socios.length} socios</p>
            </div>
          ) : <p className="text-sm text-[var(--text-muted)] text-center py-10">Configure o Dataverse para ver os socios.</p>}
        </div>
      ) : (
        <div className="space-y-2">
          {members.map(m => (
            <Card key={m.id} className="p-4"><div className="flex items-start justify-between gap-3"><div className="flex-1">
              <div className="flex items-center gap-2 mb-1"><p className="text-sm font-semibold text-[var(--text-primary)]">{m.full_name}</p><span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${statusColors[m.status] || ""}`}>{statusLabels[m.status] || m.status}</span></div>
              <p className="text-xs text-[var(--text-muted)]">{m.email} | {m.phone}</p>
              {m.address && <p className="text-xs text-[var(--text-muted)]">{m.address}</p>}
              {m.message && <p className="text-xs italic text-[var(--text-secondary)] mt-1">"{m.message}"</p>}
            </div><div className="flex gap-1 shrink-0">
              {m.status !== "approved" && <button title="Aprovar" onClick={() => updateMemberStatus(m.id, "approved")} className="p-1.5 rounded hover:bg-green-50 text-[var(--green-700)]"><Check size={14} /></button>}
              {m.status !== "rejected" && <button title="Rejeitar" onClick={() => updateMemberStatus(m.id, "rejected")} className="p-1.5 rounded hover:bg-red-50 text-red-500"><X size={14} /></button>}
            </div></div></Card>
          ))}
          {members.length === 0 && <p className="text-sm text-[var(--text-muted)] text-center py-10">Sem inscricoes.</p>}
        </div>
      )}
    </div>
  );
}

// ── Settings ──────────────────────────────────────────────────────────
function SettingsTab() {
  const [data, setData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => { ax.get("/settings").then(r => setData(r.data)); }, []);

  const save = async () => {
    setSaving(true); setMsg("");
    try { await ax.put("/settings", data); setMsg("Guardado!"); setTimeout(() => setMsg(""), 2000); }
    catch { setMsg("Erro"); }
    finally { setSaving(false); }
  };

  if (!data) return <div className="animate-pulse text-sm text-[var(--text-muted)]">A carregar...</div>;

  return (
    <div data-testid="admin-settings-tab">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-[var(--text-primary)]">Definicoes do Site</h1>
        <div className="flex items-center gap-3">
          {msg && <span className="text-sm text-[var(--green-700)] font-medium">{msg}</span>}
          <Btn onClick={save} disabled={saving} testId="save-settings"><Save size={14} />{saving ? "..." : "Guardar"}</Btn>
        </div>
      </div>
      <div className="space-y-5">
        <Card className="p-6">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Informacoes Gerais</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Inp label="Nome da Sociedade" value={data.society_name || ""} onChange={v => setData({...data, society_name: v})} />
            <Inp label="Ano de Fundacao" type="number" value={data.founding_year || ""} onChange={v => setData({...data, founding_year: parseInt(v) || 0})} />
            <Inp label="Morada" value={data.address || ""} onChange={v => setData({...data, address: v})} />
            <Inp label="Cidade" value={data.city || ""} onChange={v => setData({...data, city: v})} />
            <Inp label="Email" value={data.email || ""} onChange={v => setData({...data, email: v})} />
            <Inp label="Telefone" value={data.phone || ""} onChange={v => setData({...data, phone: v})} />
          </div>
        </Card>
        <Card className="p-6">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Redes Sociais</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Inp label="Facebook URL" value={data.facebook_url || ""} onChange={v => setData({...data, facebook_url: v})} placeholder="https://facebook.com/..." />
            <Inp label="Instagram URL" value={data.instagram_url || ""} onChange={v => setData({...data, instagram_url: v})} placeholder="https://instagram.com/..." />
          </div>
        </Card>
      </div>
    </div>
  );
}
