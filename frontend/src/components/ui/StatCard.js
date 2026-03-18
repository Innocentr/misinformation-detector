import React from "react";
import { theme } from "../../styles/theme";

export default function StatCard({ label, value, icon, color }) {
  return (
    <div style={{ ...styles.card, borderLeft: `4px solid ${color}` }}>
      <div style={styles.icon}>{icon}</div>
      <div>
        <p style={styles.label}>{label}</p>
        <h3 style={styles.value}>{value}</h3>
      </div>
    </div>
  );
}

const styles = {
  card: { 
    backgroundColor: theme.colors.surface, padding: "20px", borderRadius: "12px", 
    display: "flex", alignItems: "center", gap: "16px", flex: "1 1 200px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)", boxSizing: "border-box"
  },
  icon: { fontSize: "24px" },
  label: { margin: 0, fontSize: "12px", color: theme.colors.textMuted, fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px" },
  value: { margin: "4px 0 0 0", fontSize: "24px", color: theme.colors.textMain, fontWeight: "700" }
};