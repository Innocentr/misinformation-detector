import React, { useState } from "react";
import API from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import { theme } from "../styles/theme";

function Register() {
  const [formData, setFormData] = useState({ username: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // 🛡️ Real-time validation check
  const isFormValid = 
    formData.username.length >= 3 && 
    formData.password.length >= 6 && 
    formData.password === formData.confirmPassword;

  const handleRegister = async () => {
    if (!isFormValid) return;

    try {
      setLoading(true);
      setError("");
      await API.post("/register", { 
        username: formData.username, 
        password: formData.password 
      });
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.detail || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logo}>V</div>
          <h2 style={styles.title}>Create Account</h2>
          <p style={styles.subtitle}>Join VeriTrust AI today</p>
        </div>

        <input
          style={styles.input}
          placeholder="Username (min 3 chars)"
          value={formData.username}
          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
        />
        <input
          style={styles.input}
          type="password"
          placeholder="Password (min 6 chars)"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        />
        <input
          style={styles.input}
          type="password"
          placeholder="Confirm Password"
          value={formData.confirmPassword}
          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
        />

        {/* 💡 Password Match Hint */}
        {formData.confirmPassword && formData.password !== formData.confirmPassword && (
          <p style={styles.hint}>Passwords do not match</p>
        )}

        {error && <p style={styles.error}>{error}</p>}

        <button 
          style={{
            ...styles.button,
            opacity: isFormValid && !loading ? 1 : 0.5,
            cursor: isFormValid && !loading ? "pointer" : "not-allowed"
          }} 
          onClick={handleRegister}
          disabled={!isFormValid || loading}
        >
          {loading ? "Creating Account..." : "Register"}
        </button>

        <p style={styles.footer}>
          Already have an account? <Link to="/" style={styles.link}>Login</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", padding: "20px", backgroundColor: theme.colors.background, boxSizing: "border-box" },
  card: { width: "95%", maxWidth: "400px", padding: "clamp(24px, 8vw, 40px)", backgroundColor: theme.colors.surface, borderRadius: "16px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)", textAlign: "center", boxSizing: "border-box" },
  header: { marginBottom: "32px" },
  logo: { width: "40px", height: "40px", backgroundColor: theme.colors.primary, color: "white", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", margin: "0 auto 16px", fontSize: "20px" },
  title: { margin: "0 0 8px 0", color: theme.colors.textMain, fontSize: "clamp(20px, 5vw, 24px)" },
  subtitle: { margin: 0, color: theme.colors.textMuted, fontSize: "14px" },
  input: { width: "100%", padding: "12px", marginBottom: "16px", borderRadius: "8px", border: `1px solid ${theme.colors.border}`, boxSizing: "border-box", backgroundColor: theme.colors.inputBg, fontSize: "16px" },
  button: { width: "100%", padding: "14px", backgroundColor: theme.colors.primary, color: "white", border: "none", borderRadius: "8px", fontWeight: "600", fontSize: "16px" },
  hint: { color: theme.colors.textMuted, fontSize: "12px", textAlign: "left", marginBottom: "10px", marginTop: "-10px" },
  error: { color: theme.colors.status.fake.bar, fontSize: "14px", marginBottom: "16px" },
  footer: { marginTop: "24px", fontSize: "14px", color: theme.colors.textMuted },
  link: { color: theme.colors.primary, textDecoration: "none", fontWeight: "600" }
};

export default Register;