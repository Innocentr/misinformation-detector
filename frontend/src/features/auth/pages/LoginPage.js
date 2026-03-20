import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import AuthShell from "./AuthShell";
import { apiRequest } from "../../../lib/apiClient";
import { hasActiveSession, setSession } from "../../../lib/auth";

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (hasActiveSession()) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const payload = new URLSearchParams();
      payload.set("username", form.username);
      payload.set("password", form.password);

      const data = await apiRequest("/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: payload.toString(),
        skipAuth: true,
      });

      setSession({
        token: data.access_token,
        username: form.username.trim(),
      });

      const destination = location.state?.from?.pathname || "/dashboard";
      navigate(destination, { replace: true });
    } catch (requestError) {
      setError(requestError.message || "Login failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      description="Sign in to continue reviewing articles, posts, and suspicious claims."
    >
      <form className="stack" onSubmit={handleSubmit}>
        <label className="field">
          <span>Username</span>
          <input
            name="username"
            type="text"
            autoComplete="username"
            value={form.username}
            onChange={handleChange}
            placeholder="Enter your username"
            required
          />
        </label>

        <label className="field">
          <span>Password</span>
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            value={form.password}
            onChange={handleChange}
            placeholder="Enter your password"
            required
          />
        </label>

        {error ? <p className="form-message form-message--error">{error}</p> : null}

        <button
          type="submit"
          className="button button--primary button--full"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <p className="auth-card__footer">
        Need an account? <Link to="/register">Create one</Link>
      </p>
    </AuthShell>
  );
}

export default LoginPage;
