import "./AuthPage.css";

function AuthShell({ title, description, children }) {
  return (
    <div className="auth-shell">
      <section className="auth-panel">
        <div className="auth-panel__hero">
          <p className="eyebrow">Trust intelligence workspace</p>
          <h1>See risk, credibility, and content signals with more clarity.</h1>
          <p>
            VeriSight helps analysts review suspicious claims, assess credibility,
            and build toward a broader trust and content intelligence workflow over time.
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
