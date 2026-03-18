import React from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { theme } from "../styles/theme";

function Layout() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const getNavStyle = (path) => ({
    ...styles.link,
    color: location.pathname === path ? theme.colors.textInverse : theme.colors.textMuted,
    backgroundColor: location.pathname === path ? "#1e293b" : "transparent",
  });

  return (
    <div style={styles.container}>
      <aside style={styles.sidebar}>
        <div style={styles.brandContainer}>
          <div style={styles.logoIcon}>V</div>
          <h2 style={styles.brandText}>VeriTrust AI</h2>
        </div>
        <nav style={styles.nav}>
          <Link to="/dashboard" style={getNavStyle("/dashboard")}>📊 Dashboard</Link>
          <Link to="/history" style={getNavStyle("/history")}>🕰️ History</Link>
        </nav>
        {/* Added margin bottom here */}
        <button onClick={handleLogout} style={styles.logoutBtn}>🚪 Sign Out</button>
      </aside>

      <main style={styles.mainContent}>
        <Outlet />
      </main>
    </div>
  );
}

const styles = {
  container: { display: "flex", minHeight: "100vh", backgroundColor: theme.colors.background },
  sidebar: { 
    width: "250px", 
    backgroundColor: "#0f172a", 
    padding: "24px 16px", 
    display: "flex", 
    flexDirection: "column", 
    position: "fixed", 
    top: 0,
    bottom: 0,
    left: 0,
    boxSizing: "border-box", // Crucial: ensures padding doesn't increase total width/height
    zIndex: 100
  },
  brandContainer: { display: "flex", alignItems: "center", gap: "12px", marginBottom: "40px" },
  logoIcon: { 
    width: "32px", height: "32px", backgroundColor: theme.colors.primary, 
    borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" 
  },
  brandText: { margin: 0, fontSize: "20px", color: theme.colors.textInverse },
  nav: { display: "flex", flexDirection: "column", gap: "8px", flex: 1 },
  link: { padding: "12px 16px", textDecoration: "none", fontSize: "15px", borderRadius: "8px" },
  logoutBtn: { 
    marginTop: "auto", 
    marginBottom: "10px", // Pushes button up from the bottom edge
    padding: "12px", 
    cursor: "pointer", 
    background: "transparent", 
    color: theme.colors.textMuted, 
    border: `1px solid #334155`, 
    borderRadius: "8px", 
    textAlign: "left" 
  },
  mainContent: { flex: 1, marginLeft: "250px", padding: "40px" }
};

export default Layout;