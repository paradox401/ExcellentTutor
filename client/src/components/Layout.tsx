import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getRole, isAuthed, logout } from "../lib/auth";

const navItems = [
  { label: "Home", to: "/" },
  { label: "Courses", to: "/courses" },
  { label: "Pricing", to: "/pricing" },
];

export default function Layout({ children }: { children?: React.ReactNode }) {
  const [authed, setAuthed] = useState(isAuthed());
  const [role, setRole] = useState(getRole());
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onStorage = () => {
      setAuthed(isAuthed());
      setRole(getRole());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const handleLogout = () => {
    logout();
    setAuthed(false);
    navigate("/");
    setMenuOpen(false);
  };

  return (
    <div className="page">
      <header className="hero hero-mini">
        <nav className="nav">
          <div className="nav-inner">
            <Link to="/" className="logo">
              Excellent Tutor
            </Link>
            <button
              className="hamburger"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label="Toggle navigation"
              aria-expanded={menuOpen}
            >
              <span />
              <span />
              <span />
            </button>
            <div className={`nav-links ${menuOpen ? "open" : ""}`}>
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} onClick={() => setMenuOpen(false)}>
                {item.label}
              </NavLink>
            ))}
            {authed ? (
              <>
                <Link to="/dashboard" onClick={() => setMenuOpen(false)}>
                  Dashboard
                </Link>
                {role === "ADMIN" && (
                  <Link to="/admin-panel" onClick={() => setMenuOpen(false)}>
                    Admin
                  </Link>
                )}
                <button className="ghost" onClick={handleLogout}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMenuOpen(false)}>
                  Login
                </Link>
                <Link to="/signup" className="primary" onClick={() => setMenuOpen(false)}>
                  Start free trial
                </Link>
              </>
            )}
            </div>
          </div>
        </nav>
      </header>
      <main>{children ?? <Outlet />}</main>
      <footer className="footer">
        <div>
          <strong>Excellent Tutor</strong>
          <p>Premium learning for Class 8 to 10 students across Nepal.</p>
        </div>
        <div className="footer-links">
          <span>Support: hello@excellenttutor.com</span>
          <span>Payments: Khalti / eSewa ready</span>
        </div>
      </footer>
    </div>
  );
}
