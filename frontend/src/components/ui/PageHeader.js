import React from "react";
import { theme } from "../../styles/theme"; //

export default function PageHeader({ title, subtitle }) {
  return (
    <header style={styles.topBar}>
      <div>
        <h1 style={styles.pageTitle}>{title}</h1>
        {subtitle && <p style={styles.pageSubtitle}>{subtitle}</p>}
      </div>
      <div style={styles.userProfile}>
        <div style={styles.avatar}>VT</div>
      </div>
    </header>
  );
}

const styles = {
  topBar: { 
    display: "flex", 
    justifyContent: "space-between", 
    alignItems: "flex-start", 
    marginBottom: "40px" 
  },
  pageTitle: { 
    margin: 0, 
    color: theme.colors.textMain,
    fontSize: "28px", 
    fontWeight: "700" 
  },
  pageSubtitle: { 
    margin: "8px 0 0", 
    color: theme.colors.textMuted,
    fontSize: "15px" 
  },
  userProfile: { 
    display: "flex", 
    alignItems: "center" 
  },
  avatar: { 
    width: "40px", 
    height: "40px", 
    borderRadius: "50%", 
    backgroundColor: theme.colors.border,
    color: theme.colors.textMuted,        
    display: "flex", 
    alignItems: "center", 
    justifyContent: "center", 
    fontWeight: "bold" 
  },
};