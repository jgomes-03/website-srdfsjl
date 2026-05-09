import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import SRDFSILLogo from "@/components/SRDFSILLogo";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(email, password);
      navigate("/admin");
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(typeof detail === "string" ? detail : "Credenciais invalidas");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden" style={{ backgroundColor: "var(--bg)" }}>
      {/* Background decorative */}
      <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-5" style={{ backgroundColor: "var(--primary)" }} />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-5" style={{ backgroundColor: "var(--accent)" }} />

      <div className="w-full max-w-md p-10 rounded-2xl border shadow-xl relative z-10" style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}>
        <div className="text-center mb-10">
          <SRDFSILLogo size={64} className="mx-auto mb-5" />
          <h1 className="text-3xl font-medium" style={{ fontFamily: "'Cormorant Garamond', serif", color: "var(--text-primary)" }}>
            Administracao
          </h1>
          <p className="text-sm mt-2" style={{ color: "var(--text-secondary)" }}>Acesso restrito</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5" data-testid="admin-login-form">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>Email</label>
            <input
              type="email"
              data-testid="admin-email-input"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-3.5 text-sm rounded-xl border outline-none transition-all duration-300 focus:ring-2 focus:ring-opacity-30"
              style={{ borderColor: "var(--border)", backgroundColor: "var(--bg)", "--tw-ring-color": "var(--primary)" }}
              placeholder="admin@srdfsil.pt"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>Password</label>
            <input
              type="password"
              data-testid="admin-password-input"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-3.5 text-sm rounded-xl border outline-none transition-all duration-300 focus:ring-2 focus:ring-opacity-30"
              style={{ borderColor: "var(--border)", backgroundColor: "var(--bg)", "--tw-ring-color": "var(--primary)" }}
              placeholder="********"
            />
          </div>
          {error && <p data-testid="admin-login-error" className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            data-testid="admin-login-btn"
            disabled={loading}
            className="w-full py-4 text-sm font-semibold text-white tracking-wide rounded-full btn-glow transition-all duration-300 hover:shadow-xl hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
            style={{ backgroundColor: "var(--primary)" }}
          >
            {loading ? "A entrar..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
