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
      setError(typeof detail === "string" ? detail : "Credenciais inválidas");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: "var(--bg)" }}
    >
      <div
        className="w-full max-w-md p-8 border"
        style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}
      >
        <div className="text-center mb-8">
          <SRDFSILLogo size={56} className="mx-auto mb-4" />
          <h1
            className="text-2xl font-medium"
            style={{ fontFamily: "'Cormorant Garamond', serif", color: "var(--text-primary)" }}
          >
            Administração
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            Acesso restrito
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5" data-testid="admin-login-form">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-primary)" }}>
              Email
            </label>
            <input
              type="email"
              data-testid="admin-email-input"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 text-sm border outline-none"
              style={{ borderColor: "var(--border)", backgroundColor: "var(--bg)" }}
              placeholder="admin@srdfsil.pt"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-primary)" }}>
              Password
            </label>
            <input
              type="password"
              data-testid="admin-password-input"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 text-sm border outline-none"
              style={{ borderColor: "var(--border)", backgroundColor: "var(--bg)" }}
              placeholder="********"
            />
          </div>

          {error && <p data-testid="admin-login-error" className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            data-testid="admin-login-btn"
            disabled={loading}
            className="w-full py-3.5 text-sm font-medium text-white tracking-wide transition-all duration-200 hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: "var(--primary)" }}
          >
            {loading ? "A entrar..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
