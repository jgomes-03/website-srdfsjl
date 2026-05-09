import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const LOGO = "https://customer-assets.emergentagent.com/job_sao-joao-lampas/artifacts/31zt6imn_minilogo-transparente.png";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault(); setLoading(true); setError("");
    try { await login(email, password); navigate("/admin"); }
    catch (err) { const d = err.response?.data?.detail; setError(typeof d === "string" ? d : "Credenciais invalidas"); }
    finally { setLoading(false); }
  };

  const inp = "w-full px-4 py-3 text-sm rounded-lg border border-[var(--border)] bg-[var(--bg)] outline-none transition-all focus:border-[var(--green-700)] focus:ring-2 focus:ring-[var(--green-700)]/10";

  return (
    <div className="min-h-screen flex items-center justify-center px-5 bg-[var(--bg)]">
      <div className="w-full max-w-sm bg-white rounded-xl border border-[var(--border)] p-8 shadow-sm">
        <div className="text-center mb-8">
          <img src={LOGO} alt="SRDFSJL" className="w-12 h-12 mx-auto mb-4 object-contain" />
          <h1 className="text-xl font-bold text-[var(--text-primary)]">Administracao</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Acesso restrito</p>
        </div>
        <form onSubmit={submit} className="space-y-4" data-testid="admin-login-form">
          <div><label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">Email</label><input type="email" data-testid="admin-email-input" required value={email} onChange={e => setEmail(e.target.value)} className={inp} placeholder="admin@srdfsjl.pt" /></div>
          <div><label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">Password</label><input type="password" data-testid="admin-password-input" required value={password} onChange={e => setPassword(e.target.value)} className={inp} placeholder="********" /></div>
          {error && <p data-testid="admin-login-error" className="text-sm text-red-600">{error}</p>}
          <button type="submit" data-testid="admin-login-btn" disabled={loading}
            className="w-full py-3.5 text-sm font-semibold text-white rounded-lg btn-shine transition-all hover:brightness-110 disabled:opacity-50"
            style={{ backgroundColor: "var(--green-700)" }}
          >{loading ? "A entrar..." : "Entrar"}</button>
        </form>
      </div>
    </div>
  );
}
