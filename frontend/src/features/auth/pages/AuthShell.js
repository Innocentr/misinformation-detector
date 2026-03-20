import "./AuthPage.css";

function AuthShell({ title, description, children }) {
  return (
    <div className="auth-shell">
      <section className="auth-panel">
        <div className="auth-panel__hero">
          <p className="eyebrow">Professional verification workspace</p>
          <h1>Detect misleading narratives before they spread.</h1>
          <p>
            VeriTrust AI helps analysts review suspicious claims, score credibility,
            and keep a searchable record of every assessment.
          </p>
        </div>

        <div className="auth-proof">
          <article>
            <strong>Fast triage</strong>
            <span>Review model output and confidence signals in a single workflow.</span>
          </article>
          <article>
            <strong>Traceable history</strong>
            <span>Audit past decisions and revisit high-risk samples quickly.</span>
          </article>
          <article>
            <strong>Focused design</strong>
            <span>Built for teams that need clarity, speed, and a dependable UI.</span>
          </article>
        </div>
      </section>

      <section className="auth-card-wrap">
        <div className="auth-card">
          <p className="eyebrow">{title}</p>
          <h2>{title}</h2>
          <p className="auth-card__lede">{description}</p>
          {children}
        </div>
      </section>
    </div>
  );
}

export default AuthShell;
