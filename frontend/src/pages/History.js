import React, { useEffect, useState, useMemo } from "react";
import API from "../services/api";
import { Link, useNavigate, useLocation } from "react-router-dom";

const ITEMS_PER_PAGE = 6;
// The character limit before we truncate the text
const TEXT_TRUNCATE_LIMIT = 140; 

function History() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // --- Controls ---
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [sortBy, setSortBy] = useState("DATE_DESC");
  const [currentPage, setCurrentPage] = useState(1);
  
  // --- UI State for Long Text ---
  // Using a Set to track multiple expanded cards efficiently
  const [expandedCards, setExpandedCards] = useState(new Set());

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }

    const fetchHistory = async () => {
      try {
        setLoading(true);
        const res = await API.get("/history");
        setRecords(res.data);
      } catch (err) {
        console.error("History fetch error:", err);
        setError("Failed to load your analysis history.");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [navigate]);

  useEffect(() => {
    setCurrentPage(1);
    // Collapse all cards when searching/filtering to keep the UI clean
    setExpandedCards(new Set()); 
  }, [searchQuery, filterStatus, sortBy]);

  // --- Data Processing ---
  const processedData = useMemo(() => {
    let result = [...records];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(item => item.text.toLowerCase().includes(query));
    }

    if (filterStatus !== "ALL") {
      result = result.filter(item => item.prediction === filterStatus);
    }

    result.sort((a, b) => {
      if (sortBy === "DATE_DESC") return new Date(b.created_at) - new Date(a.created_at);
      if (sortBy === "DATE_ASC") return new Date(a.created_at) - new Date(b.created_at);
      if (sortBy === "CONF_DESC") return b.confidence - a.confidence;
      return 0;
    });

    return result;
  }, [records, searchQuery, filterStatus, sortBy]);

  const totalPages = Math.ceil(processedData.length / ITEMS_PER_PAGE) || 1;
  const currentRecords = processedData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // --- Helper Functions ---
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const getNavStyle = (path) => {
    return location.pathname === path 
      ? { ...styles.navItem, ...styles.activeNavItem }
      : styles.navItem;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(undefined, { 
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
    });
  };

  const toggleCardExpansion = (id) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
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
          <Link to="/dashboard" style={getNavStyle("/dashboard")}><span style={styles.icon}>📊</span> Dashboard</Link>
          <Link to="/history" style={getNavStyle("/history")}><span style={styles.icon}>🕰️</span> History</Link>
          <Link to="/settings" style={getNavStyle("/settings")}><span style={styles.icon}>⚙️</span> Settings</Link>
        </nav>
        <button onClick={handleLogout} style={styles.logoutBtnSidebar}>
          <span style={styles.icon}>🚪</span> Sign Out
        </button>
      </aside>

      {/* 🖥️ MAIN CONTENT */}
      <main style={styles.main}>
        <header style={styles.topBar}>
          <div>
            <h1 style={styles.pageTitle}>Analysis History</h1>
            <p style={styles.pageSubtitle}>Review and filter your past fact-checks</p>
          </div>
          <div style={styles.userProfile}>
            <div style={styles.avatar}>VT</div>
          </div>
        </header>

        <div style={styles.contentContainer}>
          
          {/* Controls */}
          {!loading && !error && records.length > 0 && (
            <div style={styles.controlsContainer}>
              <div style={styles.searchWrapper}>
                <span style={styles.searchIcon}>🔍</span>
                <input 
                  type="text" 
                  placeholder="Search snippets..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={styles.searchInput}
                />
              </div>
              
              <div style={styles.dropdowns}>
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={styles.select}>
                  <option value="ALL">All Results</option>
                  <option value="REAL">Real Only</option>
                  <option value="FAKE">Fake Only</option>
                </select>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={styles.select}>
                  <option value="DATE_DESC">Newest First</option>
                  <option value="DATE_ASC">Oldest First</option>
                  <option value="CONF_DESC">Highest Confidence</option>
                </select>
              </div>
            </div>
          )}

          {/* Grid / States */}
          {loading ? (
            <div style={styles.centerState}><p style={styles.loadingText}>Loading your history...</p></div>
          ) : error ? (
            <div style={styles.centerState}><p style={styles.errorText}>{error}</p></div>
          ) : records.length === 0 ? (
            <div style={styles.centerState}>
              <div style={styles.emptyIcon}>📭</div>
              <h3 style={styles.emptyTitle}>No history found</h3>
              <p style={styles.emptySubtitle}>You haven't analyzed any content yet.</p>
              <Link to="/dashboard" style={styles.primaryBtn}>Analyze Content</Link>
            </div>
          ) : processedData.length === 0 ? (
             <div style={styles.centerState}>
               <h3 style={styles.emptyTitle}>No matches found</h3>
               <p style={styles.emptySubtitle}>Try adjusting your search or filters.</p>
               <button onClick={() => { setSearchQuery(""); setFilterStatus("ALL"); }} style={styles.clearFiltersBtn}>Clear Filters</button>
             </div>
          ) : (
            <>
              <div style={styles.grid}>
                {currentRecords.map((item) => {
                  const isExpanded = expandedCards.has(item.id);
                  const isLongText = item.text.length > TEXT_TRUNCATE_LIMIT;
                  const displayText = isExpanded ? item.text : (isLongText ? item.text.substring(0, TEXT_TRUNCATE_LIMIT) + "..." : item.text);

                  return (
                    <div key={item.id} style={styles.historyCard}>
                      <div style={styles.cardHeader}>
                        <span style={{ 
                          ...styles.badge, 
                          backgroundColor: item.prediction === "REAL" ? "#dcfce7" : "#fee2e2",
                          color: item.prediction === "REAL" ? "#166534" : "#991b1b",
                          border: `1px solid ${item.prediction === "REAL" ? "#bbf7d0" : "#fecaca"}`
                        }}>
                          {item.prediction}
                        </span>
                        <span style={styles.dateText}>{formatDate(item.created_at)}</span>
                      </div>
                      
                      {/* Smart Text Area */}
                      <div style={styles.textContainer}>
                        <p style={styles.snippet}>"{displayText}"</p>
                        {isLongText && (
                          <button 
                            onClick={() => toggleCardExpansion(item.id)}
                            style={styles.expandBtn}
                          >
                            {isExpanded ? "Show less" : "Read full text"}
                          </button>
                        )}
                      </div>
                      
                      <div style={styles.cardFooter}>
                        <span style={styles.confidenceLabel}>Confidence</span>
                        <span style={styles.confidenceValue}>
                          {item.confidence ? (item.confidence * 100).toFixed(1) : 0}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={styles.pagination}>
                  <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} style={{...styles.pageBtn, opacity: currentPage === 1 ? 0.5 : 1}}>
                    Previous
                  </button>
                  <span style={styles.pageInfo}>Page {currentPage} of {totalPages}</span>
                  <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} style={{...styles.pageBtn, opacity: currentPage === totalPages ? 0.5 : 1}}>
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

// Unified Styles Object
const styles = {
  layout: { display: "flex", minHeight: "100vh", backgroundColor: "#f8fafc", fontFamily: "'Inter', system-ui, sans-serif" },
  sidebar: { width: "250px", backgroundColor: "#0f172a", color: "#f8fafc", display: "flex", flexDirection: "column", padding: "24px 16px", position: "fixed", height: "100vh", boxSizing: "border-box" },
  brand: { display: "flex", alignItems: "center", gap: "12px", marginBottom: "40px", padding: "0 8px" },
  logo: { width: "32px", height: "32px", backgroundColor: "#4f46e5", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "18px" },
  brandText: { margin: 0, fontSize: "20px", fontWeight: "600" },
  nav: { display: "flex", flexDirection: "column", gap: "8px", flex: 1 },
  navItem: { display: "flex", alignItems: "center", padding: "12px 16px", color: "#94a3b8", textDecoration: "none", borderRadius: "8px", fontSize: "15px", fontWeight: "500", transition: "all 0.2s" },
  activeNavItem: { backgroundColor: "#1e293b", color: "#ffffff" },
  icon: { marginRight: "12px", fontSize: "18px" },
  logoutBtnSidebar: { display: "flex", alignItems: "center", padding: "12px 16px", backgroundColor: "transparent", border: "1px solid #334155", color: "#cbd5e1", borderRadius: "8px", cursor: "pointer", fontSize: "15px", fontWeight: "500", marginTop: "auto" },

  main: { flex: 1, marginLeft: "250px", padding: "40px", boxSizing: "border-box" },
  topBar: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "40px" },
  pageTitle: { margin: 0, color: "#1e293b", fontSize: "28px", fontWeight: "700" },
  pageSubtitle: { margin: "8px 0 0", color: "#64748b", fontSize: "15px" },
  userProfile: { display: "flex", alignItems: "center" },
  avatar: { width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "#e2e8f0", color: "#475569", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" },
  contentContainer: { width: "100%", maxWidth: "1000px" },

  /* --- Controls --- */
  controlsContainer: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", gap: "16px", flexWrap: "wrap" },
  searchWrapper: { position: "relative", flex: 1, minWidth: "250px" },
  searchIcon: { position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", fontSize: "14px", color: "#94a3b8" },
  searchInput: { width: "100%", padding: "12px 16px 12px 36px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "14px", outline: "none", boxSizing: "border-box" },
  dropdowns: { display: "flex", gap: "12px" },
  select: { padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1", backgroundColor: "white", fontSize: "14px", color: "#334155", cursor: "pointer", outline: "none" },

  /* --- Grid & Cards --- */
  grid: { 
    display: "grid", 
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", 
    gap: "24px",
    alignItems: "start" // Crucial: prevents expanding one card from stretching the whole row
  },
  historyCard: { 
    backgroundColor: "white", 
    borderRadius: "12px", 
    padding: "20px", 
    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)", 
    display: "flex", 
    flexDirection: "column", 
    border: "1px solid #e2e8f0",
    transition: "all 0.2s ease" 
  },
  cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" },
  badge: { padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px" },
  dateText: { fontSize: "13px", color: "#94a3b8", fontWeight: "500" },
  
  /* Text Truncation Styles */
  textContainer: { flex: 1, display: "flex", flexDirection: "column", marginBottom: "20px" },
  snippet: { fontSize: "15px", color: "#334155", lineHeight: "1.6", margin: "0 0 8px 0", fontStyle: "italic", wordBreak: "break-word" },
  expandBtn: { 
    background: "none", border: "none", color: "#4f46e5", padding: "0", margin: "0", 
    fontSize: "13px", fontWeight: "600", cursor: "pointer", textAlign: "left", alignSelf: "flex-start",
    textDecoration: "underline", textUnderlineOffset: "4px"
  },
  
  cardFooter: { display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "16px", borderTop: "1px solid #f1f5f9", marginTop: "auto" },
  confidenceLabel: { fontSize: "13px", color: "#64748b", fontWeight: "500" },
  confidenceValue: { fontSize: "15px", color: "#0f172a", fontWeight: "700" },

  /* --- States & Pagination --- */
  pagination: { display: "flex", justifyContent: "center", alignItems: "center", marginTop: "40px", gap: "16px" },
  pageBtn: { padding: "8px 16px", backgroundColor: "white", border: "1px solid #cbd5e1", borderRadius: "6px", cursor: "pointer", fontWeight: "500", color: "#334155" },
  pageInfo: { fontSize: "14px", color: "#64748b", fontWeight: "500" },
  centerState: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 20px", backgroundColor: "white", borderRadius: "16px", border: "1px dashed #cbd5e1", textAlign: "center" },
  loadingText: { color: "#64748b", fontSize: "16px", fontWeight: "500" },
  errorText: { color: "#ef4444", fontSize: "16px", fontWeight: "500" },
  emptyIcon: { fontSize: "48px", marginBottom: "16px" },
  emptyTitle: { margin: "0 0 8px 0", color: "#1e293b", fontSize: "20px" },
  emptySubtitle: { margin: "0 0 24px 0", color: "#64748b", fontSize: "15px" },
  primaryBtn: { padding: "10px 20px", backgroundColor: "#4f46e5", color: "white", textDecoration: "none", borderRadius: "8px", fontWeight: "600", fontSize: "14px" },
  clearFiltersBtn: { padding: "8px 16px", marginTop: "12px", backgroundColor: "#f1f5f9", color: "#475569", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "500" }
};

export default History;