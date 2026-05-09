import React, { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import SRDFSILLogo from "@/components/SRDFSILLogo";

const NAV_LINKS = [
  { to: "/", label: "Início" },
  { to: "/historia", label: "A Nossa História" },
  { to: "/eventos", label: "Eventos" },
  { to: "/servicos", label: "Serviços" },
  { to: "/galeria", label: "Galeria" },
  { to: "/contactos", label: "Contactos" },
];

function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <header
      data-testid="main-header"
      className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b"
      style={{ borderColor: "var(--border)" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center gap-3" data-testid="logo-link">
            <SRDFSILLogo size={48} />
            <div className="hidden sm:block">
              <p
                className="text-sm font-semibold tracking-wide leading-tight"
                style={{ color: "var(--primary)", fontFamily: "'Cormorant Garamond', serif" }}
              >
                Sociedade Recreativa Desportiva e Familiar
              </p>
              <p
                className="text-xs tracking-wider"
                style={{ color: "var(--text-secondary)" }}
              >
                São João das Lampas
              </p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1" data-testid="desktop-nav">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                data-testid={`nav-${link.to.replace("/", "") || "home"}`}
                className={`px-4 py-2 text-sm font-medium tracking-wide transition-colors duration-200 ${
                  location.pathname === link.to
                    ? "border-b-2"
                    : "hover:opacity-70"
                }`}
                style={{
                  color: location.pathname === link.to ? "var(--primary)" : "var(--text-primary)",
                  borderColor: location.pathname === link.to ? "var(--primary)" : "transparent",
                }}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/inscricao"
              data-testid="nav-inscricao-btn"
              className="ml-4 px-6 py-2.5 text-sm font-medium text-white tracking-wide transition-all duration-200 hover:opacity-90"
              style={{ backgroundColor: "var(--primary)" }}
            >
              Fazer-me Sócio
            </Link>
          </nav>

          {/* Mobile toggle */}
          <button
            data-testid="mobile-menu-toggle"
            className="lg:hidden p-2"
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
                className="block py-3 px-4 text-sm font-medium tracking-wide border-b"
                style={{
                  color: location.pathname === link.to ? "var(--primary)" : "var(--text-primary)",
                  borderColor: "var(--border)",
                }}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/inscricao"
              data-testid="mobile-nav-inscricao-btn"
              className="block mt-4 mx-4 px-6 py-3 text-sm font-medium text-white text-center tracking-wide"
              style={{ backgroundColor: "var(--primary)" }}
              onClick={() => setMobileOpen(false)}
            >
              Fazer-me Sócio
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer
      data-testid="main-footer"
      className="text-white py-16"
      style={{ backgroundColor: "var(--text-primary)" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <SRDFSILLogo size={40} />
              <div>
                <p className="text-sm font-medium" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  SRDFSIL
                </p>
                <p className="text-xs opacity-60">Desde 1911</p>
              </div>
            </div>
            <p className="text-sm opacity-60 leading-relaxed">
              Sociedade Recreativa Desportiva e Familiar de São João das Lampas. 
              Ao serviço da comunidade há mais de 110 anos.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold tracking-wider uppercase mb-4 opacity-80">
              Links Rápidos
            </h4>
            <div className="space-y-2">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="block text-sm opacity-60 hover:opacity-100 transition-opacity"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold tracking-wider uppercase mb-4 opacity-80">
              Contacto
            </h4>
            <div className="space-y-2 text-sm opacity-60">
              <p>Avenida Central 24</p>
              <p>São João das Lampas</p>
              <p>geral@sociedadesaojoaodaslampas.pt</p>
            </div>
          </div>
        </div>

        <div
          className="mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs opacity-40"
          style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}
        >
          <p>Copyright &copy; {new Date().getFullYear()} &mdash; Sociedade Recreativa Desportiva e Familiar São João das Lampas</p>
          <Link to="/admin/login" className="hover:opacity-100 transition-opacity">
            Administração
          </Link>
        </div>
      </div>
    </footer>
  );
}

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--bg)" }}>
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
