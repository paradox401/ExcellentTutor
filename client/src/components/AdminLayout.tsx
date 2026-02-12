import { Link, NavLink, useNavigate } from "react-router-dom";
import { logout } from "../lib/auth";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  return (
    <div className="admin-layout">
      <aside className="admin-side">
        <div className="admin-brand">
          <span>Excellent Tutor</span>
          <strong>Admin Console</strong>
        </div>
        <nav className="admin-nav">
          <NavLink to="/admin-panel" end>
            Overview
          </NavLink>
          <NavLink to="/admin-panel?tab=structure">Structure</NavLink>
          <NavLink to="/admin-panel?tab=assets">Assets</NavLink>
          <NavLink to="/admin-panel?tab=live">Live Sessions</NavLink>
          <NavLink to="/admin-panel?tab=payments">Payments</NavLink>
          <NavLink to="/admin-panel?tab=users">Users</NavLink>
        </nav>
        <div className="admin-side-actions">
          <Link to="/">Back to site</Link>
          <button style={{ color: "red" }}
            className="ghost"
            onClick={() => {
              logout();
              navigate("/login");
            }}
          >
            Logout
          </button>
        </div>
      </aside>
      <div className="admin-main">
        <header className="admin-top">
          <h1>Admin Control Center</h1>
          <p>Full access to content, payments, and student management.</p>
        </header>
        {children}
      </div>
    </div>
  );
}
