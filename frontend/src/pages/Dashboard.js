import React, { useState, useEffect } from "react";
import API from "../services/api";
import { Link, useNavigate, useLocation } from "react-router-dom";

function Dashboard() {
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const navigate = useNavigate();
  const location = useLocation();

  // 🔐 Route Protection
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/");
  }, [navigate]);

  const handlePredict = async () => {
    if (!text.trim()) {
      setError("Please enter some text to analyze.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setResult(null);

      const res = await API.post("/predict", { text });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const clearInput = () => {
    setText("");
    setResult(null);
    setError("");
  };

  // Helper function to apply active styles to sidebar links
  const getNavStyle = (path) => {
    return location.pathname === path 
      ? { ...styles.navItem, ...styles.activeNavItem }
      : styles.navItem;
  };

  return (
    <div style={styles.layout}>
      {/* 📱 SIDEBAR */}
      <aside style={styles.sidebar}>
        <div style={styles.brand}>
          <div style={styles.logo}>V</div>
          <h2 style={styles.brandText}>VeriTrust AI</h2>
        </div>

        <nav style={styles.nav}>
          <Link to="/dashboard" style={getNavStyle("/dashboard")}>
            <span style={styles.icon}>📊</span> Dashboard
          </Link>
          <Link to="/history" style={getNavStyle("/history")}>
            <span style={styles.icon}>🕰️</span> History
          </Link>
          <Link to="/settings" style={getNavStyle("/settings")}>
            <span style={styles.icon}>⚙️</span> Settings
          </Link>
        </nav>

        <button onClick={handleLogout} style={styles.logoutBtnSidebar}>
          <span style={styles.icon}>🚪</span> Sign Out
        </button>
      </aside>

      {/* 🖥️ MAIN CONTENT */}
      <main style={styles.main}>
        {/* Top Bar for context */}
        <header style={styles.topBar}>
          <div>
            <h1 style={styles.pageTitle}>Dashboard</h1>
            <p style={styles.pageSubtitle}>Fact-checking & Credibility Analysis</p>
          </div>
          <div style={styles.userProfile}>
            <div style={styles.avatar}>VT</div>
          </div>
        </header>

        {/* Analysis Card */}
        <div style={styles.card}>
          <div style={styles.inputGroup}>
            <textarea
              placeholder="Paste a news article, claim, or social media post..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              style={styles.textarea}
            />
            {text && (
              <button onClick={clearInput} style={styles.clearBtn}>
                Clear text
              </button>
            )}
          </div>

          <button
            onClick={handlePredict}
            disabled={loading || !text.trim()}
            style={{
              ...styles.analyzeBtn,
              backgroundColor: loading || !text.trim() ? "#a5b4fc" : "#4f46e5",
              cursor: loading || !text.trim() ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Analyzing Patterns..." : "Verify Content"}
          </button>

          {error && <p style={styles.errorText}>{error}</p>}

          {/* Result Section */}
          {result && (
            <div style={styles.resultContainer}>
              <div style={styles.resultHeader}>
                <h3 style={styles.resultTitle}>Analysis Result</h3>
                <span style={{ 
                  ...styles.badge, 
                  backgroundColor: result.prediction === "REAL" ? "#dcfce7" : "#fee2e2",
                  color: result.prediction === "REAL" ? "#166534" : "#991b1b"
                }}>
                  {result.prediction}
                </span>
              </div>

              <p style={styles.confidenceText}>
                Our model is <strong>{(result.confidence * 100).toFixed(1)}%</strong> confident.
              </p>

              <div style={styles.progressTrack}>
                <div
                  style={{
                    ...styles.progressBar,
                    width: `${result.confidence * 100}%`,
                    backgroundColor: result.prediction === "REAL" ? "#22c55e" : "#ef4444",
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// Unified Styles Object
const styles = {
  layout: {
    display: "flex",
    minHeight: "100vh",
    backgroundColor: "#f8fafc",
    fontFamily: "'Inter', system-ui, sans-serif",
  },
  
  /* --- Sidebar Styles --- */
  sidebar: {
    width: "250px",
    backgroundColor: "#0f172a",
    color: "#f8fafc",
    display: "flex",
    flexDirection: "column",
    padding: "24px 16px",
    position: "fixed",
    height: "100vh",
    boxSizing: "border-box",
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "40px",
    padding: "0 8px",
  },
  logo: {
    width: "32px",
    height: "32px",
    backgroundColor: "#4f46e5",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
    fontSize: "18px",
  },
  brandText: { margin: 0, fontSize: "20px", fontWeight: "600" },
  nav: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    flex: 1,
  },
  navItem: {
    display: "flex",
    alignItems: "center",
    padding: "12px 16px",
    color: "#94a3b8",
    textDecoration: "none",
    borderRadius: "8px",
    fontSize: "15px",
    fontWeight: "500",
    transition: "all 0.2s",
  },
  activeNavItem: {
    backgroundColor: "#1e293b",
    color: "#ffffff",
  },
  icon: { marginRight: "12px", fontSize: "18px" },
  logoutBtnSidebar: {
    display: "flex",
    alignItems: "center",
    padding: "12px 16px",
    backgroundColor: "transparent",
    border: "1px solid #334155",
    color: "#cbd5e1",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "500",
    transition: "all 0.2s",
    marginTop: "auto",
  },

  /* --- Main Content Styles --- */
  main: {
    flex: 1,
    marginLeft: "250px", // Pushes content right to accommodate fixed sidebar
    padding: "40px",
    boxSizing: "border-box",
  },
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "40px",
  },
  pageTitle: { margin: 0, color: "#1e293b", fontSize: "28px", fontWeight: "700" },
  pageSubtitle: { margin: "8px 0 0", color: "#64748b", fontSize: "15px" },
  userProfile: {
    display: "flex",
    alignItems: "center",
  },
  avatar: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    backgroundColor: "#e2e8f0",
    color: "#475569",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
  },

  /* --- Card & Widget Styles --- */
  card: {
    backgroundColor: "white",
    padding: "32px",
    borderRadius: "16px",
    width: "100%",
    maxWidth: "800px",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)",
  },
  inputGroup: { position: "relative" },
  textarea: {
    width: "100%",
    height: "180px",
    padding: "16px",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    outline: "none",
    fontSize: "15px",
    lineHeight: "1.5",
    resize: "vertical",
    boxSizing: "border-box",
    backgroundColor: "#f8fafc",
    fontFamily: "inherit",
  },
  clearBtn: {
    position: "absolute",
    bottom: "12px",
    right: "12px",
    background: "none",
    border: "none",
    color: "#64748b",
    fontSize: "13px",
    cursor: "pointer",
    fontWeight: "500",
  },
  analyzeBtn: {
    marginTop: "20px",
    width: "100%",
    padding: "16px",
    color: "white",
    border: "none",
    borderRadius: "12px",
    fontWeight: "600",
    fontSize: "16px",
    transition: "all 0.2s ease",
  },
  errorText: { color: "#dc2626", marginTop: "16px", fontSize: "14px", textAlign: "center" },
  resultContainer: {
    marginTop: "32px",
    padding: "24px",
    backgroundColor: "#f8fafc",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
  },
  resultHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" },
  resultTitle: { margin: 0, fontSize: "18px", color: "#1e293b", fontWeight: "600" },
  badge: { padding: "6px 14px", borderRadius: "20px", fontSize: "13px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px" },
  confidenceText: { fontSize: "15px", color: "#475569", margin: "0 0 12px 0" },
  progressTrack: {
    height: "8px",
    backgroundColor: "#e2e8f0",
    borderRadius: "10px",
    overflow: "hidden",
  },
  progressBar: { height: "100%", transition: "width 0.6s cubic-bezier(0.4, 0, 0.2, 1)" },
};

export default Dashboard;