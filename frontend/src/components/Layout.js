import React, { useState, useEffect } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { theme } from "../styles/theme";

function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  
  // State for sidebar visibility
  const [isOpen, setIsOpen] = useState(window.innerWidth > 768);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Handle window resizing to update mobile status
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) setIsOpen(true); // Always show on desktop
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close sidebar automatically when navigating on mobile
  useEffect(() => {
    if (isMobile) setIsOpen(false);
  }, [location.pathname, isMobile]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    queryClient.clear(); // Clear TanStack cache on logout
    navigate("/");
  };

  const getNavStyle = (path) => ({
    ...styles.link,
    color: location.pathname === path ? theme.colors.textInverse : theme.colors.textMuted,
    backgroundColor: location.pathname === path ? "#1e293b" : "transparent",
  });

  return (
    <div style={styles.container}>
      {/* Mobile Toggle Button */}
      {isMobile && (
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          style={styles.menuToggle}
        >
          {isOpen ? "✕" : "☰"}
        </button>
      )}

      {/* Sidebar */}
      <aside style={{
        ...styles.sidebar,
        transform: isOpen ? "translateX(0)" : "translateX(-100%)",
      }}>
        <div style={styles.brandContainer}>
          <div style={styles.logoIcon}>V</div>
          <h2 style={styles.brandText}>VeriTrust AI</h2>
        </div>
        <nav style={styles.nav}>
          <Link to="/dashboard" style={getNavStyle("/dashboard")}>📊 Dashboard</Link>
          <Link to="/history" style={getNavStyle("/history")}>🕰️ History</Link>
        </nav>
        <button onClick={handleLogout} style={styles.logoutBtn}>🚪 Sign Out</button>
      </aside>

      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div style={styles.overlay} onClick={() => setIsOpen(false)} />
      )}

      {/* Main Content Area */}
      <main style={{
        ...styles.mainContent,
        marginLeft: isMobile ? 0 : (isOpen ? "250px" : 0),
        padding: isMobile ? "60px 20px 20px" : "40px"
      }}>
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
    boxSizing: "border-box",
    zIndex: 1000,
    transition: "transform 0.3s ease-in-out", // Smooth slide effect
  },
  menuToggle: {
    position: "fixed",
    top: "15px",
    left: "15px",
    zIndex: 1100,
    padding: "8px 12px",
    fontSize: "20px",
    backgroundColor: "#0f172a",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer"
  },
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    zIndex: 900
  },
  brandContainer: { display: "flex", alignItems: "center", gap: "12px", marginBottom: "40px" },
  logoIcon: { 
    width: "32px", height: "32px", backgroundColor: theme.colors.primary, 
    borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", color: "white"
  },
  brandText: { margin: 0, fontSize: "20px", color: theme.colors.textInverse },
  nav: { display: "flex", flexDirection: "column", gap: "8px", flex: 1 },
  link: { padding: "12px 16px", textDecoration: "none", fontSize: "15px", borderRadius: "8px", transition: "0.2s" },
  logoutBtn: { 
    marginTop: "auto", 
    marginBottom: "10px",
    padding: "12px", 
    cursor: "pointer", 
    background: "transparent", 
    color: theme.colors.textMuted, 
    border: `1px solid #334155`, 
    borderRadius: "8px", 
    textAlign: "left" 
  },
  mainContent: { 
    flex: 1, 
    transition: "margin-left 0.3s ease-in-out",
    width: "100%"
  }
};

export default Layout;