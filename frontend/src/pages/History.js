import React, { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query"; //Import useQuery
import API from "../services/api";
import { Link } from "react-router-dom";
import PredictionBadge from "../components/ui/PredictionBadge";
import ConfidenceBar from "../components/ui/ConfidenceBar";
import PageHeader from "../components/ui/PageHeader";
import HistorySkeleton from "../components/ui/HistorySkeleton";
import { theme } from "../styles/theme";

const ITEMS_PER_PAGE = 6;
const TEXT_TRUNCATE_LIMIT = 140; 

function History() {
  //  replace useEffect/useState with useQuery
  const { data: records = [], isLoading, isError } = useQuery({
    queryKey: ['history'],
    queryFn: async () => {
      const res = await API.get("/history");
      return res.data;
    },
    // Data remains "fresh" for 5 minutes before background refetching
    staleTime: 1000 * 60 * 5, 
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [sortBy, setSortBy] = useState("DATE_DESC");
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedCards, setExpandedCards] = useState(new Set());

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
    setExpandedCards(new Set()); 
  }, [searchQuery, filterStatus, sortBy]);

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
  const currentRecords = processedData.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

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
    <>
      <PageHeader title="Analysis History" subtitle="Review past fact-checks" />

      <div style={styles.contentContainer}>
        {/* Only show controls if we have records and aren't loading */}
        {!isLoading && !isError && records.length > 0 && (
          <div style={styles.controlsContainer}>
            <div style={styles.searchWrapper}>
              <span style={styles.searchIcon}>🔍</span>
              <input 
                type="text" 
                placeholder="Search..." 
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
                <option value="DATE_DESC">Newest</option>
                <option value="CONF_DESC">Confidence</option>
              </select>
            </div>
          </div>
        )}

        {isLoading ? (
          <HistorySkeleton />
        ) : isError ? (
          <div style={styles.centerState}>
            <p style={{color: theme.colors.status.fake.bar}}>Failed to load history. Please try again later.</p>
          </div>
        ) : processedData.length === 0 ? (
           <div style={styles.centerState}>
             <h3>{records.length === 0 ? "No history yet" : "No matches found"}</h3>
             {records.length > 0 && (
                <button onClick={() => { setSearchQuery(""); setFilterStatus("ALL"); }} style={styles.clearFiltersBtn}>Clear Filters</button>
             )}
             {records.length === 0 && <Link to="/dashboard" style={styles.primaryBtn}>Start Analyzing</Link>}
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
                      <PredictionBadge prediction={item.prediction} />
                      <span style={styles.dateText}>{formatDate(item.created_at)}</span>
                    </div>
                    <div style={styles.textContainer}>
                      <p style={styles.snippet}>"{displayText}"</p>
                      {isLongText && (
                        <button onClick={() => toggleCardExpansion(item.id)} style={styles.expandBtn}>
                          {isExpanded ? "Show less" : "Full text"}
                        </button>
                      )}
                    </div>
                    <div style={styles.cardFooter}>
                      <ConfidenceBar confidence={item.confidence} prediction={item.prediction} />
                    </div>
                  </div>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div style={styles.pagination}>
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} style={styles.pageBtn}>Prev</button>
                <span style={styles.pageInfo}>{currentPage} / {totalPages}</span>
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} style={styles.pageBtn}>Next</button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}


const styles = {
  contentContainer: { width: "100%", boxSizing: "border-box" },
  controlsContainer: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", gap: "16px", flexWrap: "wrap" },
  searchWrapper: { position: "relative", flex: "1 1 300px" },
  searchIcon: { position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: theme.colors.textMuted },
  searchInput: { width: "100%", padding: "12px 12px 12px 36px", borderRadius: "8px", border: `1px solid ${theme.colors.border}`, boxSizing: "border-box" },
  dropdowns: { display: "flex", gap: "10px", flex: "1 1 auto" },
  select: { flex: 1, padding: "12px", borderRadius: "8px", border: `1px solid ${theme.colors.border}`, backgroundColor: "white" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 300px), 1fr))", gap: "20px" },
  historyCard: { backgroundColor: "white", borderRadius: "12px", padding: "20px", border: `1px solid ${theme.colors.border}`, display: "flex", flexDirection: "column" },
  cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" },
  dateText: { fontSize: "12px", color: theme.colors.textMuted },
  textContainer: { flex: 1, marginBottom: "15px" },
  snippet: { fontSize: "14px", color: theme.colors.textMain, fontStyle: "italic", wordBreak: "break-word" },
  expandBtn: { background: "none", border: "none", color: theme.colors.primary, cursor: "pointer", fontSize: "12px", fontWeight: "bold" },
  cardFooter: { borderTop: `1px solid ${theme.colors.background}`, paddingTop: "10px" },
  pagination: { display: "flex", justifyContent: "center", alignItems: "center", marginTop: "30px", gap: "15px" },
  pageBtn: { padding: "8px 12px", borderRadius: "6px", border: `1px solid ${theme.colors.border}`, cursor: "pointer", backgroundColor: "white" },
  pageInfo: { fontSize: "14px", color: theme.colors.textMuted },
  centerState: { textAlign: "center", padding: "40px", backgroundColor: "white", borderRadius: "12px" },
  clearFiltersBtn: { padding: "8px 16px", marginTop: "10px", cursor: "pointer", border: "none", borderRadius: "6px", backgroundColor: theme.colors.background },
  primaryBtn: { padding: "10px 20px", backgroundColor: theme.colors.primary, color: "white", textDecoration: "none", borderRadius: "8px", fontWeight: "bold", marginTop: "10px", display: "inline-block" }
};

export default History;