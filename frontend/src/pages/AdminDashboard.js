import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  LogOut, Calendar, Image, Users, Mail, Plus, Trash2, Edit2, Save, X, LayoutDashboard,
} from "lucide-react";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function AdminDashboard() {
  const { user, loading: authLoading, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("events");

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "admin")) {
      navigate("/admin/login");
    }
  }, [user, authLoading, navigate]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
        <div className="w-8 h-8 border-2 border-[var(--green-700)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || user.role !== "admin") return null;

  const handleLogout = async () => {
    await logout();
    navigate("/admin/login");
  };

  const TABS = [
    { id: "events", label: "Eventos", icon: Calendar },
    { id: "gallery", label: "Galeria", icon: Image },
    { id: "members", label: "Socios", icon: Users },
    { id: "contacts", label: "Mensagens", icon: Mail },
  ];

  return (
    <div className="min-h-screen flex bg-[var(--bg)]">
      {/* Sidebar */}
      <aside className="w-60 min-h-screen flex flex-col border-r border-[var(--border)] bg-white" data-testid="admin-sidebar">
        <div className="p-5 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <LayoutDashboard size={18} className="text-[var(--green-700)]" />
            <h2 className="text-sm font-bold text-[var(--text-primary)]">Admin SRDFSIL</h2>
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-1">{user.email}</p>
        </div>

        <nav className="flex-1 p-3 space-y-0.5">
          {TABS.map((t) => (
            <button
              key={t.id}
              data-testid={`admin-tab-${t.id}`}
              onClick={() => setTab(t.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                tab === t.id ? "bg-[var(--green-700)] text-white" : "text-[var(--text-secondary)] hover:bg-[var(--surface-alt)]"
              }`}
            >
              <t.icon size={16} />
              {t.label}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-[var(--border)]">
          <button
            data-testid="admin-logout-btn"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 text-sm font-medium text-[var(--text-muted)] rounded-lg hover:bg-[var(--surface-alt)] transition-colors"
          >
            <LogOut size={16} />
            Sair
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-8">
        {tab === "events" && <EventsTab />}
        {tab === "gallery" && <GalleryTab />}
        {tab === "members" && <MembersTab />}
        {tab === "contacts" && <ContactsTab />}
      </main>
    </div>
  );
}

// --- Events Tab ---
function EventsTab() {
  const [events, setEvents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ title: "", description: "", date: "", time: "", location: "", price: "", image_url: "" });

  const fetchEvents = () => axios.get(`${API}/events`, { withCredentials: true }).then(r => setEvents(r.data));
  useEffect(() => { fetchEvents(); }, []);

  const resetForm = () => {
    setForm({ title: "", description: "", date: "", time: "", location: "", price: "", image_url: "" });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSave = async () => {
    if (editingId) {
      await axios.put(`${API}/events/${editingId}`, form, { withCredentials: true });
    } else {
      await axios.post(`${API}/events`, form, { withCredentials: true });
    }
    resetForm();
    fetchEvents();
  };

  const handleEdit = (event) => {
    setForm({ title: event.title, description: event.description, date: event.date, time: event.time || "", location: event.location || "", price: event.price || "", image_url: event.image_url || "" });
    setEditingId(event.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Tem a certeza que deseja eliminar este evento?")) {
      await axios.delete(`${API}/events/${id}`, { withCredentials: true });
      fetchEvents();
    }
  };

  return (
    <div data-testid="admin-events-tab">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-medium" style={{ color: "var(--text-primary)" }}>
          Gerir Eventos
        </h1>
        <button
          data-testid="add-event-btn"
          onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white"
          style={{ backgroundColor: "var(--green-700)" }}
        >
          <Plus size={16} /> Novo Evento
        </button>
      </div>

      {showForm && (
        <div className="mb-8 p-6 border" style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}>
          <h3 className="text-lg font-medium mb-4" style={{  }}>
            {editingId ? "Editar Evento" : "Novo Evento"}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField label="Título *" value={form.title} onChange={v => setForm({...form, title: v})} testId="event-form-title" />
            <InputField label="Data *" type="date" value={form.date} onChange={v => setForm({...form, date: v})} testId="event-form-date" />
            <InputField label="Hora" value={form.time} onChange={v => setForm({...form, time: v})} testId="event-form-time" placeholder="ex: 21:00" />
            <InputField label="Local" value={form.location} onChange={v => setForm({...form, location: v})} testId="event-form-location" />
            <InputField label="Preço" value={form.price} onChange={v => setForm({...form, price: v})} testId="event-form-price" placeholder="ex: 12€" />
            <InputField label="URL da Imagem" value={form.image_url} onChange={v => setForm({...form, image_url: v})} testId="event-form-image" />
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-primary)" }}>Descrição *</label>
              <textarea
                data-testid="event-form-description"
                rows={3}
                value={form.description}
                onChange={e => setForm({...form, description: e.target.value})}
                className="w-full px-3 py-2 text-sm border outline-none resize-none"
                style={{ borderColor: "var(--border)" }}
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              data-testid="event-form-save"
              onClick={handleSave}
              className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white"
              style={{ backgroundColor: "var(--green-700)" }}
            >
              <Save size={14} /> Guardar
            </button>
            <button
              data-testid="event-form-cancel"
              onClick={resetForm}
              className="flex items-center gap-2 px-5 py-2 text-sm font-medium border"
              style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
            >
              <X size={14} /> Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {events.map(event => (
          <div key={event.id} className="flex items-center justify-between p-4 border" style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}>
            <div className="flex-1">
              <h4 className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{event.title}</h4>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>{event.date} {event.time && `| ${event.time}`} {event.location && `| ${event.location}`}</p>
            </div>
            <div className="flex gap-2">
              <button data-testid={`edit-event-${event.id}`} onClick={() => handleEdit(event)} className="p-2 hover:opacity-70" style={{ color: "var(--green-700)" }}>
                <Edit2 size={16} />
              </button>
              <button data-testid={`delete-event-${event.id}`} onClick={() => handleDelete(event.id)} className="p-2 hover:opacity-70 text-red-500">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Gallery Tab ---
function GalleryTab() {
  const [items, setItems] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", image_url: "", description: "", category: "" });

  const fetchGallery = () => axios.get(`${API}/gallery`, { withCredentials: true }).then(r => setItems(r.data));
  useEffect(() => { fetchGallery(); }, []);

  const handleSave = async () => {
    await axios.post(`${API}/gallery`, form, { withCredentials: true });
    setForm({ title: "", image_url: "", description: "", category: "" });
    setShowForm(false);
    fetchGallery();
  };

  const handleDelete = async (id) => {
    if (window.confirm("Eliminar esta imagem?")) {
      await axios.delete(`${API}/gallery/${id}`, { withCredentials: true });
      fetchGallery();
    }
  };

  return (
    <div data-testid="admin-gallery-tab">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-medium" style={{ color: "var(--text-primary)" }}>
          Gerir Galeria
        </h1>
        <button
          data-testid="add-gallery-btn"
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white"
          style={{ backgroundColor: "var(--green-700)" }}
        >
          <Plus size={16} /> Nova Imagem
        </button>
      </div>

      {showForm && (
        <div className="mb-8 p-6 border" style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField label="Título *" value={form.title} onChange={v => setForm({...form, title: v})} testId="gallery-form-title" />
            <InputField label="URL da Imagem *" value={form.image_url} onChange={v => setForm({...form, image_url: v})} testId="gallery-form-url" />
            <InputField label="Descrição" value={form.description} onChange={v => setForm({...form, description: v})} testId="gallery-form-desc" />
            <InputField label="Categoria" value={form.category} onChange={v => setForm({...form, category: v})} testId="gallery-form-category" placeholder="ex: Eventos, Teatro" />
          </div>
          <div className="flex gap-3 mt-4">
            <button data-testid="gallery-form-save" onClick={handleSave} className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white" style={{ backgroundColor: "var(--green-700)" }}>
              <Save size={14} /> Guardar
            </button>
            <button onClick={() => setShowForm(false)} className="flex items-center gap-2 px-5 py-2 text-sm font-medium border" style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}>
              <X size={14} /> Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(item => (
          <div key={item.id} className="border overflow-hidden" style={{ borderColor: "var(--border)", backgroundColor: "var(--surface)" }}>
            <img src={item.image_url} alt={item.title} className="w-full aspect-[4/3] object-cover" />
            <div className="p-3 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{item.title}</h4>
                {item.category && <span className="text-xs" style={{ color: "var(--green-500)" }}>{item.category}</span>}
              </div>
              <button data-testid={`delete-gallery-${item.id}`} onClick={() => handleDelete(item.id)} className="p-2 hover:opacity-70 text-red-500">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Members Tab ---
function MembersTab() {
  const [members, setMembers] = useState([]);
  useEffect(() => {
    axios.get(`${API}/members`, { withCredentials: true }).then(r => setMembers(r.data)).catch(() => {});
  }, []);

  return (
    <div data-testid="admin-members-tab">
      <h1 className="text-2xl font-medium mb-8" style={{ color: "var(--text-primary)" }}>
        Inscrições de Sócios
      </h1>
      {members.length > 0 ? (
        <div className="space-y-3">
          {members.map(m => (
            <div key={m.id} className="p-4 border" style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}>
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{m.full_name}</h4>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>{m.email} | {m.phone}</p>
                  {m.address && <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{m.address}</p>}
                  {m.message && <p className="text-xs mt-1 italic" style={{ color: "var(--text-secondary)" }}>"{m.message}"</p>}
                </div>
                <span className="text-xs px-2 py-1 font-medium" style={{ backgroundColor: "var(--green-500)", color: "white" }}>
                  {m.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm py-12 text-center" style={{ color: "var(--text-secondary)" }}>Nenhuma inscrição recebida.</p>
      )}
    </div>
  );
}

// --- Contacts Tab ---
function ContactsTab() {
  const [contacts, setContacts] = useState([]);
  useEffect(() => {
    axios.get(`${API}/contacts`, { withCredentials: true }).then(r => setContacts(r.data)).catch(() => {});
  }, []);

  return (
    <div data-testid="admin-contacts-tab">
      <h1 className="text-2xl font-medium mb-8" style={{ color: "var(--text-primary)" }}>
        Mensagens de Contacto
      </h1>
      {contacts.length > 0 ? (
        <div className="space-y-3">
          {contacts.map(c => (
            <div key={c.id} className="p-4 border" style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}>
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{c.name}</h4>
                  <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{c.email}</p>
                  {c.subject && <p className="text-xs font-medium mt-1" style={{ color: "var(--text-primary)" }}>{c.subject}</p>}
                  <p className="text-sm mt-2" style={{ color: "var(--text-secondary)" }}>{c.message}</p>
                </div>
                <span className="text-xs whitespace-nowrap" style={{ color: "var(--text-secondary)" }}>
                  {c.created_at ? new Date(c.created_at).toLocaleDateString("pt-PT") : ""}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm py-12 text-center" style={{ color: "var(--text-secondary)" }}>Nenhuma mensagem recebida.</p>
      )}
    </div>
  );
}

// --- Input Field helper ---
function InputField({ label, value, onChange, testId, type = "text", placeholder = "" }) {
  return (
    <div>
      <label className="block text-xs font-medium text-[var(--text-primary)] mb-1">{label}</label>
      <input
        type={type}
        data-testid={testId}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--border)] outline-none transition-all focus:border-[var(--green-700)]"
        placeholder={placeholder}
      />
    </div>
  );
}
