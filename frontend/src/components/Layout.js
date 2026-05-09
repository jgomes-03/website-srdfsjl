import React, { useState, useEffect } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { Menu, X, ChevronUp } from "lucide-react";

const LOGO = "https://customer-assets.emergentagent.com/job_sao-joao-lampas/artifacts/31zt6imn_minilogo-transparente.png";

const NAV = [
  { to: "/", label: "Inicio" },
  { to: "/historia", label: "Historia" },
  { to: "/eventos", label: "Eventos" },
  { to: "/servicos", label: "Servicos" },
  { to: "/galeria", label: "Galeria" },
  { to: "/contactos", label: "Contactos" },
];

function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const loc = useLocation();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => setOpen(false), [loc]);

  const isHome = loc.pathname === "/";
  const headerBg = scrolled
    ? "bg-white/90 backdrop-blur-xl shadow-sm border-b border-[var(--border-light)]"
    : isHome ? "bg-transparent" : "bg-white border-b border-[var(--border-light)]";
  const textColor = scrolled || !isHome ? "text-[var(--text-primary)]" : "text-white";

  return (
    <header data-testid="main-header" className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${headerBg}`}>
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="flex items-center justify-between h-[72px]">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3" data-testid="logo-link">
            <img
              src={LOGO}
              alt="SRDFSIL"
              className={`object-contain transition-all duration-300 ${scrolled ? "w-9 h-9" : "w-14 h-14"}`}
            />
            {scrolled && (
              <span className={`text-[13px] font-semibold tracking-tight hidden sm:block transition-colors leading-tight ${textColor}`}>
                Sociedade Recreativa Desportiva<br/>e Familiar de S. João das Lampas
              </span>
            )}
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1" data-testid="desktop-nav">
            {NAV.map(n => (
              <Link
                key={n.to}
                to={n.to}
                data-testid={`nav-${n.to.replace("/", "") || "home"}`}
                className={`px-3.5 py-2 text-[13px] font-medium rounded-lg transition-all duration-200 ${
                  loc.pathname === n.to
                    ? (scrolled || !isHome ? "bg-[var(--green-100)] text-[var(--green-700)]" : "bg-white/15 text-white")
                    : `${textColor} hover:opacity-70`
                }`}
              >
                {n.label}
              </Link>
            ))}
            <Link
              to="/inscricao"
              data-testid="nav-inscricao-btn"
              className="ml-3 px-5 py-2.5 text-[13px] font-semibold text-white rounded-lg btn-shine transition-all duration-200 hover:brightness-110"
              style={{ backgroundColor: "var(--green-700)" }}
            >
              Fazer-me Socio
            </Link>
          </nav>

          {/* Mobile toggle */}
          <button data-testid="mobile-menu-toggle" className={`lg:hidden p-2 ${textColor}`} onClick={() => setOpen(!open)}>
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <nav data-testid="mobile-nav" className="lg:hidden pb-5 anim-fade-in">
            <div className="bg-white rounded-xl border border-[var(--border)] p-2 shadow-lg">
              {NAV.map(n => (
                <Link
                  key={n.to}
                  to={n.to}
                  data-testid={`mobile-nav-${n.to.replace("/", "") || "home"}`}
                  className={`block px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    loc.pathname === n.to ? "bg-[var(--green-100)] text-[var(--green-700)]" : "text-[var(--text-primary)] hover:bg-[var(--surface-alt)]"
                  }`}
                >
                  {n.label}
                </Link>
              ))}
              <Link
                to="/inscricao"
                data-testid="mobile-nav-inscricao-btn"
                className="block mt-2 px-4 py-3 text-sm font-semibold text-white text-center rounded-lg"
                style={{ backgroundColor: "var(--green-700)" }}
              >
                Fazer-me Socio
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}

function ScrollTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const fn = () => setShow(window.scrollY > 500);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);
  if (!show) return null;
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-6 right-6 z-40 w-11 h-11 rounded-full flex items-center justify-center text-white shadow-lg transition-all hover:scale-110 anim-scale-in"
      style={{ backgroundColor: "var(--green-700)" }}
      data-testid="scroll-to-top"
    >
      <ChevronUp size={18} />
    </button>
  );
}

function Footer() {
  return (
    <footer data-testid="main-footer" className="bg-[var(--green-900)] text-white">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* Brand */}
          <div className="md:col-span-5">
            <div className="flex items-center gap-3 mb-4">
              <img src={LOGO} alt="SRDFSIL" className="w-9 h-9 object-contain" />
              <span className="text-sm font-semibold tracking-tight">SRDFSIL</span>
            </div>
            <p className="text-sm text-white/50 leading-relaxed max-w-xs">
              Sociedade Recreativa Desportiva e Familiar de S. Joao das Lampas. 
              Ao servico da comunidade desde 1911.
            </p>
          </div>

          {/* Links */}
          <div className="md:col-span-3">
            <p className="text-xs font-semibold tracking-widest uppercase text-white/30 mb-4">Paginas</p>
            <div className="space-y-2.5">
              {NAV.map(n => (
                <Link key={n.to} to={n.to} className="block text-sm text-white/50 hover:text-white transition-colors">{n.label}</Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div className="md:col-span-4">
            <p className="text-xs font-semibold tracking-widest uppercase text-white/30 mb-4">Contacto</p>
            <div className="space-y-2.5 text-sm text-white/50">
              <p>Avenida Central 24</p>
              <p>S. Joao das Lampas, Sintra</p>
              <a href="mailto:geral@sociedadesaojoaodaslampas.pt" className="block text-[var(--green-500)] hover:text-[var(--green-600)] transition-colors">
                geral@sociedadesaojoaodaslampas.pt
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/8 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-white/25">
          <p>&copy; {new Date().getFullYear()} SRDFSIL. Todos os direitos reservados.</p>
          <Link to="/admin/login" className="hover:text-white/50 transition-colors">Admin</Link>
        </div>
      </div>
    </footer>
  );
}

export default function Layout() {
  const loc = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [loc.pathname]);

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--bg)" }}>
      <Header />
      <main className="flex-1"><Outlet /></main>
      <Footer />
      <ScrollTop />
    </div>
  );
}
