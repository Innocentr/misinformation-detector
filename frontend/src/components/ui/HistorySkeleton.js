import React from "react";
import { theme } from "../../styles/theme";

export default function HistorySkeleton() {
  return (
    <div style={styles.grid}>
      {[...Array(6)].map((_, i) => (
        <div key={i} style={styles.card}>
          <div style={styles.header}>
            <div className="skeleton" style={styles.badgeSkeleton} />
            <div className="skeleton" style={styles.dateSkeleton} />
          </div>
          <div className="skeleton" style={styles.line} />
          <div className="skeleton" style={styles.lineShort} />
          <div className="skeleton" style={styles.footerSkeleton} />
        </div>
      ))}
    </div>
  );
}

const styles = {
  grid: { 
    display: "grid", 
    gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 300px), 1fr))", 
    gap: "20px" 
  },
  card: { 
    backgroundColor: "white", 
    borderRadius: "12px", 
    padding: "20px", 
    border: `1px solid ${theme.colors.border}`, 
    height: "200px",
    display: "flex", 
    flexDirection: "column",
    boxSizing: "border-box"
  },
  header: { display: "flex", justifyContent: "space-between", marginBottom: "20px" },
  badgeSkeleton: { width: "80px", height: "28px", borderRadius: "20px" },
  dateSkeleton: { width: "100px", height: "14px", borderRadius: "4px" },
  line: { width: "100%", height: "14px", borderRadius: "4px", marginBottom: "12px" },
  lineShort: { width: "60%", height: "14px", borderRadius: "4px" },
  footerSkeleton: { marginTop: "auto", width: "100%", height: "35px", borderRadius: "8px" },
};