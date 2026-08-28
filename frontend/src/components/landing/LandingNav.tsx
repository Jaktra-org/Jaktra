import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import jaktraLogo from "../../assets/jaktra_svg.svg";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Security", href: "#security" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleAnchor = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("#")) {
      e.preventDefault();
      const el = document.querySelector(href);
      if (el) el.scrollIntoView({ behavior: "smooth" });
      setMenuOpen(false);
    }
  };

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        height: "56px",
        backgroundColor: scrolled ? "rgba(1,1,2,0.88)" : "#010102",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: `1px solid ${scrolled ? "#23252a" : "transparent"}`,
        transition: "background-color 0.2s ease, border-color 0.2s ease, backdrop-filter 0.2s ease",
      }}
    >
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          height: "100%",
          padding: "0 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Wordmark */}
        <a
          href="#"
          onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}
          style={{
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
          }}
        >
          <img
            src={jaktraLogo}
            alt="Jaktra"
            style={{ height: "28px", width: "auto", display: "block" }}
          />
        </a>

        {/* Desktop center links */}
        <div
          className="hidden md:flex"
          style={{ gap: "4px", alignItems: "center" }}
        >
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={(e) => handleAnchor(e, link.href)}
              style={{
                fontSize: "14px",
                color: "#8a8f98",
                textDecoration: "none",
                padding: "6px 12px",
                borderRadius: "6px",
                transition: "color 0.15s ease, background-color 0.15s ease",
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.color = "#f7f8f8";
                (e.target as HTMLElement).style.backgroundColor = "#0f1011";
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.color = "#8a8f98";
                (e.target as HTMLElement).style.backgroundColor = "transparent";
              }}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Desktop right CTAs */}
        <div className="hidden md:flex" style={{ gap: "8px", alignItems: "center" }}>
          <Link
            to="/login"
            style={{
              fontSize: "14px",
              fontWeight: 500,
              color: "#f7f8f8",
              textDecoration: "none",
              padding: "6px 12px",
              borderRadius: "8px",
              backgroundColor: "#0f1011",
              border: "1px solid #23252a",
              transition: "background-color 0.15s ease",
            }}
            onMouseEnter={(e) => ((e.target as HTMLElement).style.backgroundColor = "#141516")}
            onMouseLeave={(e) => ((e.target as HTMLElement).style.backgroundColor = "#0f1011")}
          >
            Sign in
          </Link>
          <Link
            to="/register"
            style={{
              fontSize: "14px",
              fontWeight: 500,
              color: "#fff",
              textDecoration: "none",
              padding: "6px 14px",
              borderRadius: "8px",
              backgroundColor: "var(--lavender)",
              border: "1px solid transparent",
              transition: "background-color 0.15s ease",
            }}
            onMouseEnter={(e) => ((e.target as HTMLElement).style.backgroundColor = "var(--lavender-hover)")}
            onMouseLeave={(e) => ((e.target as HTMLElement).style.backgroundColor = "var(--lavender)")}
          >
            Book a demo
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="flex md:hidden"
          onClick={() => setMenuOpen((v) => !v)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#f7f8f8",
            padding: "4px",
          }}
          aria-label="Toggle navigation"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          className="flex md:hidden"
          style={{
            flexDirection: "column",
            backgroundColor: "#010102",
            borderTop: "1px solid #23252a",
            padding: "12px 24px 16px",
            gap: "4px",
          }}
        >

          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={(e) => handleAnchor(e, link.href)}
              style={{
                fontSize: "15px",
                color: "#d0d6e0",
                textDecoration: "none",
                padding: "10px 0",
                borderBottom: "1px solid #23252a",
              }}
            >
              {link.label}
            </a>
          ))}
          <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
            <Link
              to="/login"
              style={{
                flex: 1,
                textAlign: "center",
                fontSize: "14px",
                fontWeight: 500,
                color: "#f7f8f8",
                textDecoration: "none",
                padding: "10px",
                borderRadius: "8px",
                backgroundColor: "#0f1011",
                border: "1px solid #23252a",
              }}
            >
              Sign in
            </Link>
            <Link
              to="/register"
              style={{
                flex: 1,
                textAlign: "center",
                fontSize: "14px",
                fontWeight: 500,
                color: "#fff",
                textDecoration: "none",
                padding: "10px",
                borderRadius: "8px",
                backgroundColor: "var(--lavender)",
              }}
            >
              Book a demo
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
