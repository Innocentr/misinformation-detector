import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { queryClient } from "../../app/providers";
import { clearSession, getSession } from "../../lib/auth";

const navItems = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/history", label: "History" },
];

function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const session = getSession();

  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    clearSession();
    queryClient.clear();
    navigate("/", { replace: true });
  };

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileNavOpen ? "is-open" : ""}`}>
        <div className="brand-mark">
          <span className="brand-mark__badge">VT</span>
          <div>
            <p className="brand-mark__eyebrow">Misinformation Detector</p>
            <h1 className="brand-mark__title">VeriTrust AI</h1>
          </div>
        </div>

        <nav className="sidebar__nav" aria-label="Primary">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `sidebar__link${isActive ? " is-active" : ""}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar__footer">
          <div className="sidebar__account">
            <span className="sidebar__account-label">Signed in as</span>
            <strong>{session.username || "Analyst"}</strong>
          </div>
          <button type="button" className="button button--ghost" onClick={handleLogout}>
            Sign out
          </button>
        </div>
      </aside>

      <div
        className={`sidebar-backdrop ${mobileNavOpen ? "is-visible" : ""}`}
        onClick={() => setMobileNavOpen(false)}
        aria-hidden="true"
      />

      <div className="app-content">
        <header className="topbar">
          <button
            type="button"
            className="topbar__menu"
            onClick={() => setMobileNavOpen((open) => !open)}
            aria-label="Toggle navigation"
          >
            Menu
          </button>
          <div className="topbar__meta">
            <span className="topbar__status">Secure session</span>
            <strong>{session.username || "Analyst"}</strong>
          </div>
        </header>

        <main className="page-frame">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
