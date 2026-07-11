import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { msalInstance, loginRequest, isMicrosoftConfigured, ensureMsalInitialized } from "@/config/msalConfig";

const LOGO = "https://customer-assets.emergentagent.com/job_sao-joao-lampas/artifacts/31zt6imn_minilogo-transparente.png";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [showBypass, setShowBypass] = useState(false);
  const [msalReady, setMsalReady] = useState(false);
  const { login, loginWithMicrosoft } = useAuth();
  const navigate = useNavigate();
  const redirectHandled = useRef(false);

  // Handle return from Microsoft redirect on mount
  useEffect(() => {
    if (!isMicrosoftConfigured() || redirectHandled.current) return;
    redirectHandled.current = true;

    const processRedirect = async () => {
      try {
        await ensureMsalInitialized();
        setMsalReady(true);
        const result = await msalInstance.handleRedirectPromise();

        if (result && (result.idToken || result.accessToken)) {
          setValidating(true);
          try {
            await loginWithMicrosoft(result.idToken, result.accessToken);
            navigate("/admin");
          } catch (err) {
            const status = err?.response?.status;
            console.error("Microsoft validation failed:", status, err?.response?.data?.detail || err.message);
            if (status === 403 || status === 401) {
              // Access denied (not in group / wrong domain) -> logout + homepage
              await msalInstance.logoutRedirect({
                account: result.account,
                postLogoutRedirectUri: window.location.origin,
              });
            } else {
              // Server/config error -> show message, don't logout
              setValidating(false);
              setError(err?.response?.data?.detail || "Erro no servidor ao validar o acesso. Tente novamente.");
            }
          }
        }
      } catch (err) {
        console.error("MSAL redirect error:", err);
        setError(err?.errorMessage || "Erro no login Microsoft");
        setValidating(false);
      }
    };

    processRedirect();
  }, [loginWithMicrosoft, navigate]);

  const handleMicrosoftLogin = async () => {
    setLoading(true);
    setError("");
    try {
      await ensureMsalInitialized();
      await msalInstance.loginRedirect(loginRequest);
    } catch (err) {
      console.error("Microsoft login error:", err);
      setError(err?.errorMessage || err?.message || "Erro no login Microsoft");
      setLoading(false);
    }
  };

  const handleBypassLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(email, password);
      navigate("/admin");
    } catch (err) {
      const d = err.response?.data?.detail;
      setError(typeof d === "string" ? d : "Credenciais invalidas");
    } finally {
      setLoading(false);
    }
  };

  const inp = "w-full px-4 py-3 text-sm rounded-lg border border-[var(--border)] bg-[var(--bg)] outline-none transition-all focus:border-[var(--green-700)] focus:ring-2 focus:ring-[var(--green-700)]/10";
  const msConfigured = isMicrosoftConfigured();

  if (validating) {
    return (
      <div className="min-h-screen flex items-center justify-center px-5 bg-[var(--bg)]">
        <div className="text-center" data-testid="sso-validating">
          <img src={LOGO} alt="SRDFSJL" className="w-14 h-14 mx-auto mb-5 object-contain animate-pulse" />
          <div className="w-8 h-8 mx-auto mb-4 border-2 border-[var(--green-700)] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-[var(--text-primary)]">A validar acesso...</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">A verificar permissoes da sua conta</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-5 bg-[var(--bg)]">
      <div className="w-full max-w-sm bg-white rounded-xl border border-[var(--border)] p-8 shadow-sm">
        <div className="text-center mb-8">
          <img src={LOGO} alt="SRDFSJL" className="w-12 h-12 mx-auto mb-4 object-contain" />
          <h1 className="text-xl font-bold text-[var(--text-primary)]">Administracao</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Acesso restrito</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700" data-testid="admin-login-error">
            {error}
          </div>
        )}

        {/* Microsoft Login - Primary */}
        <button
          onClick={handleMicrosoftLogin}
          disabled={loading || !msConfigured || (!msalReady && msConfigured)}
          data-testid="microsoft-login-btn"
          className="w-full flex items-center justify-center gap-3 py-3.5 text-sm font-semibold rounded-lg transition-all hover:shadow-md disabled:opacity-50 border border-[var(--border)] bg-white text-[var(--text-primary)] hover:bg-[var(--surface-alt)]"
        >
          <svg width="18" height="18" viewBox="0 0 21 21"><rect x="1" y="1" width="9" height="9" fill="#f25022"/><rect x="11" y="1" width="9" height="9" fill="#7fba00"/><rect x="1" y="11" width="9" height="9" fill="#00a4ef"/><rect x="11" y="11" width="9" height="9" fill="#ffb900"/></svg>
          {loading ? "A redirecionar..." : !msalReady && msConfigured ? "A preparar..." : "Entrar com Microsoft"}
        </button>

        {!msConfigured && (
          <p className="text-[11px] text-center text-[var(--text-muted)] mt-2">
            Login Microsoft nao configurado.
          </p>
        )}

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-[var(--border)]" />
          <button
            onClick={() => setShowBypass(!showBypass)}
            className="text-[11px] font-medium text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
            data-testid="toggle-bypass-btn"
          >
            {showBypass ? "Esconder" : "Login alternativo"}
          </button>
          <div className="flex-1 h-px bg-[var(--border)]" />
        </div>

        {/* Bypass Login */}
        {showBypass && (
          <form onSubmit={handleBypassLogin} className="space-y-4" data-testid="admin-login-form">
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">Email</label>
              <input type="email" data-testid="admin-email-input" required value={email} onChange={e => setEmail(e.target.value)} className={inp} placeholder="admin@srdfsjl.pt" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">Password</label>
              <input type="password" data-testid="admin-password-input" required value={password} onChange={e => setPassword(e.target.value)} className={inp} placeholder="********" />
            </div>
            <button type="submit" data-testid="admin-login-btn" disabled={loading}
              className="w-full py-3 text-sm font-semibold text-white rounded-lg btn-shine transition-all hover:brightness-110 disabled:opacity-50"
              style={{ backgroundColor: "var(--green-700)" }}>
              {loading ? "A entrar..." : "Entrar"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
