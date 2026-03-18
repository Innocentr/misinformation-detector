import React from "react";
import { theme } from "../../styles/theme";

export default function PageHeader({ title, subtitle }) {
  // Extract username from JWT token in localStorage
  const getUsername = () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return "User";
      // Decode the middle part (payload) of the JWT
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.sub || payload.username || "User";
    } catch (e) {
      return "User";
    }
  };

  const username = getUsername();
  const initials = username.substring(0, 2).toUpperCase();

  return (
    <header style={styles.topBar}>
      <div>
        <h1 style={styles.pageTitle}>{title}</h1>
        {subtitle && <p style={styles.pageSubtitle}>{subtitle}</p>}
      </div>
      <div style={styles.userProfile}>
        <div style={styles.userInfo}>
          <span style={styles.userName}>{username}</span>
        </div>
        <div style={styles.avatar}>{initials}</div>
      </div>
    </header>
  );
}

const styles = {
  topBar: { 
    display: "flex", 
    justifyContent: "space-between", 
    alignItems: "center", 
    marginBottom: "40px",
    flexWrap: "wrap", 
    gap: "15px"
  },
  pageTitle: { 
    margin: 0, 
    color: theme.colors.textMain,
    fontSize: "clamp(22px, 5vw, 28px)",
    fontWeight: "700" 
  },
  pageSubtitle: { 
    margin: "4px 0 0", 
    color: theme.colors.textMuted,
    fontSize: "15px" 
  },
  userProfile: { 
    display: "flex", 
    alignItems: "center",
    gap: "12px" 
  },
  userInfo: {
    textAlign: "right",
    display: window.innerWidth < 480 ? "none" : "block" // Hide name on tiny screens
  },
  userName: {
    fontSize: "14px",
    fontWeight: "600",
    color: theme.colors.textMain
  },
  avatar: { 
    width: "40px", 
    height: "40px", 
    borderRadius: "50%", 
    backgroundColor: theme.colors.primary,
    color: "white",        
    display: "flex", 
    alignItems: "center", 
    justifyContent: "center", 
    fontWeight: "bold",
    fontSize: "13px"
  },
};