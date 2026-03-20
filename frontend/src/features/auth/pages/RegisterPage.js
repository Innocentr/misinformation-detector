import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import AuthShell from "./AuthShell";
import { apiRequest } from "../../../lib/apiClient";
import { hasActiveSession } from "../../../lib/auth";

function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (hasActiveSession()) {
    return <Navigate to="/dashboard" replace />;
  }

  const passwordMismatch =
    form.confirmPassword.length > 0 && form.password !== form.confirmPassword;

  const isValid =
    form.username.trim().length >= 3 &&
    form.password.length >= 6 &&
    !passwordMismatch;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!isValid) {
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      await apiRequest("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          username: form.username.trim(),
          password: form.password,
        }),
        skipAuth: true,
      });

      navigate("/", { replace: true });
    } catch (requestError) {
      setError(requestError.message || "Registration failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Create account"
      description="Set up a workspace account for secure access to predictions and history."
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
            placeholder="Minimum 3 characters"
            required
          />
        </label>

        <label className="field">
          <span>Password</span>
          <input
            name="password"
            type="password"
            autoComplete="new-password"
            value={form.password}
            onChange={handleChange}
            placeholder="Minimum 6 characters"
            required
          />
        </label>

        <label className="field">
          <span>Confirm password</span>
          <input
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            value={form.confirmPassword}
            onChange={handleChange}
            placeholder="Repeat your password"
            required
          />
        </label>

        {passwordMismatch ? (
          <p className="form-message">Passwords must match before you can continue.</p>
        ) : null}
        {error ? <p className="form-message form-message--error">{error}</p> : null}

        <button
          type="submit"
          className="button button--primary button--full"
          disabled={!isValid || isSubmitting}
        >
          {isSubmitting ? "Creating account..." : "Create account"}
        </button>
      </form>

      <p className="auth-card__footer">
        Already registered? <Link to="/">Sign in</Link>
      </p>
    </AuthShell>
  );
}

export default RegisterPage;
