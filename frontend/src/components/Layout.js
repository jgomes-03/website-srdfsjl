import React, { useState, useEffect } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { Menu, X, ChevronUp } from "lucide-react";
import SRDFSILLogo from "@/components/SRDFSILLogo";

const NAV_LINKS = [
  { to: "/", label: "Inicio" },
  { to: "/historia", label: "A Nossa Historia" },
  { to: "/eventos", label: "Eventos" },
  { to: "/servicos", label: "Servicos" },
  { to: "/galeria", label: "Galeria" },
  { to: "/contactos", label: "Contactos" },
];

function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  return (
    <header
      data-testid="main-header"
      className={`sticky top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "glass border-b shadow-sm"
          : "bg-transparent"
      }`}
      style={{ borderColor: scrolled ? "var(--border)" : "transparent" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center gap-3 group" data-testid="logo-link">
            <div className="transition-transform duration-300 group-hover:scale-105">
              <SRDFSILLogo size={52} />
            </div>
            <div className="hidden sm:block">
              <p
                className="text-sm font-bold tracking-wide leading-tight transition-colors duration-300"
                style={{ color: "var(--primary)", fontFamily: "'Cormorant Garamond', serif", fontSize: "1.05rem" }}
              >
                SRDFSIL
              </p>
              <p className="text-[11px] tracking-wider" style={{ color: "var(--text-secondary)" }}>
                S. Joao das Lampas
              </p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-0.5" data-testid="desktop-nav">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                data-testid={`nav-${link.to.replace("/", "") || "home"}`}
                className={`relative px-4 py-2 text-[13px] font-medium tracking-wide transition-all duration-300 ${
                  location.pathname === link.to ? "" : "hover:opacity-70"
                }`}
                style={{ color: location.pathname === link.to ? "var(--primary)" : "var(--text-primary)" }}
              >
                {link.label}
                {location.pathname === link.to && (
                  <span
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full"
                    style={{ backgroundColor: "var(--accent)" }}
                  />
                )}
              </Link>
            ))}
            <Link
              to="/inscricao"
              data-testid="nav-inscricao-btn"
              className="ml-4 px-6 py-2.5 text-[13px] font-semibold text-white tracking-wide rounded-full btn-glow transition-all duration-300 hover:shadow-lg"
              style={{ backgroundColor: "var(--primary)" }}
            >
              Fazer-me Socio
            </Link>
          </nav>

          {/* Mobile toggle */}
          <button
            data-testid="mobile-menu-toggle"
            className="lg:hidden p-2 rounded-full transition-colors"
            style={{ color: "var(--text-primary)" }}
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <nav
            data-testid="mobile-nav"
            className="lg:hidden pb-6 animate-fade-in"
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                data-testid={`mobile-nav-${link.to.replace("/", "") || "home"}`}
                className="block py-3 px-4 text-sm font-medium tracking-wide transition-all duration-200"
                style={{
                  color: location.pathname === link.to ? "var(--primary)" : "var(--text-primary)",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/inscricao"
              data-testid="mobile-nav-inscricao-btn"
              className="block mt-4 mx-4 px-6 py-3 text-sm font-semibold text-white text-center tracking-wide rounded-full"
              style={{ backgroundColor: "var(--primary)" }}
            >
              Fazer-me Socio
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}

function ScrollToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const handleScroll = () => setShow(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!show) return null;
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-8 right-8 z-40 w-12 h-12 rounded-full flex items-center justify-center text-white shadow-xl transition-all duration-300 hover:scale-110 animate-fade-in"
      style={{ backgroundColor: "var(--primary)" }}
      data-testid="scroll-to-top"
    >
      <ChevronUp size={20} />
    </button>
  );
}

function Footer() {
  return (
    <footer data-testid="main-footer" className="relative overflow-hidden text-white" style={{ backgroundColor: "#0a0f0c" }}>
      {/* Decorative top bar */}
      <div className="h-1 w-full" style={{ background: "linear-gradient(90deg, var(--primary) 0%, var(--accent) 50%, var(--primary) 100%)" }} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-4 mb-5">
              <SRDFSILLogo size={56} />
              <div>
                <p className="text-lg font-bold" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  SRDFSIL
                </p>
                <p className="text-xs opacity-40 tracking-widest uppercase">Desde 1911</p>
              </div>
            </div>
            <p className="text-sm opacity-50 leading-relaxed max-w-sm">
              Sociedade Recreativa Desportiva e Familiar de S. Joao das Lampas. 
              Ao servico da comunidade ha mais de 110 anos, promovendo cultura, desporto e convivio.
            </p>
          </div>

          <div>
            <h4
              className="text-sm font-semibold tracking-widest uppercase mb-5"
              style={{ color: "var(--accent)" }}
            >
              Navegacao
            </h4>
            <div className="space-y-3">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="block text-sm opacity-50 hover:opacity-100 hover:translate-x-1 transition-all duration-200"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4
              className="text-sm font-semibold tracking-widest uppercase mb-5"
              style={{ color: "var(--accent)" }}
            >
              Contacto
            </h4>
            <div className="space-y-3 text-sm opacity-50">
              <p>Avenida Central 24</p>
              <p>S. Joao das Lampas, Sintra</p>
              <a
                href="mailto:geral@sociedadesaojoaodaslampas.pt"
                className="block hover:opacity-100 transition-opacity"
                style={{ color: "var(--accent)", opacity: 0.8 }}
              >
                geral@sociedadesaojoaodaslampas.pt
              </a>
            </div>
          </div>
        </div>

        <div
          className="mt-14 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs opacity-30"
          style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
        >
          <p>Copyright &copy; {new Date().getFullYear()} &mdash; SRDFSIL. Todos os direitos reservados.</p>
          <Link to="/admin/login" className="hover:opacity-100 transition-opacity">
            Administracao
          </Link>
        </div>
      </div>
    </footer>
  );
}

export default function Layout() {
  const location = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--bg)" }}>
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
}
