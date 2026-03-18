import React, { useState } from "react";
import API from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import { theme } from "../styles/theme";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      setError("");
      const res = await API.post("/login", { username, password });
      localStorage.setItem("token", res.data.access_token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || "Login failed");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logo}>V</div>
          <h2 style={styles.title}>Welcome Back</h2>
          <p style={styles.subtitle}>Log in to VeriTrust AI</p>
        </div>

        <input
          style={styles.input}
          placeholder="Username"
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          style={styles.input}
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p style={styles.error}>{error}</p>}

        <button style={styles.button} onClick={handleLogin}>Login</button>

        <p style={styles.footer}>
          Don't have an account? <Link to="/register" style={styles.link}>Register</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: { 
    display: "flex", 
    justifyContent: "center", 
    alignItems: "center", 
    minHeight: "100vh", // Use minHeight for mobile viewports
    padding: "20px", 
    backgroundColor: theme.colors.background,
    boxSizing: "border-box"
  },
  card: { 
    width: "95%", // Takes up space on mobile
    maxWidth: "400px", 
    padding: "clamp(24px, 8vw, 40px)", // Dynamic padding
    backgroundColor: theme.colors.surface, 
    borderRadius: "16px", 
    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)", 
    textAlign: "center",
    boxSizing: "border-box"
  },
  header: { marginBottom: "32px" },
  logo: { width: "40px", height: "40px", backgroundColor: theme.colors.primary, color: "white", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", margin: "0 auto 16px", fontSize: "20px" },
  title: { margin: "0 0 8px 0", color: theme.colors.textMain, fontSize: "clamp(20px, 5vw, 24px)" },
  subtitle: { margin: 0, color: theme.colors.textMuted, fontSize: "14px" },
  input: { 
    width: "100%", 
    padding: "12px", 
    marginBottom: "16px", 
    borderRadius: "8px", 
    border: `1px solid ${theme.colors.border}`, 
    boxSizing: "border-box", 
    backgroundColor: theme.colors.inputBg,
    fontSize: "16px" // Prevents iOS auto-zoom
  },
  button: { width: "100%", padding: "14px", backgroundColor: theme.colors.primary, color: "white", border: "none", borderRadius: "8px", fontWeight: "600", cursor: "pointer", fontSize: "16px" },
  error: { color: theme.colors.status.fake.bar, fontSize: "14px", marginBottom: "16px" },
  footer: { marginTop: "24px", fontSize: "14px", color: theme.colors.textMuted },
  link: { color: theme.colors.primary, textDecoration: "none", fontWeight: "600" }
};

export default Login;