import { Link } from "react-router-dom";

function EmptyState({ title, description, actionLabel, actionTo }) {
  return (
    <section className="panel empty-state">
      <p className="eyebrow">No results yet</p>
      <h2>{title}</h2>
      <p>{description}</p>
      {actionLabel && actionTo ? (
        <Link className="button button--primary" to={actionTo}>
          {actionLabel}
        </Link>
      ) : null}
    </section>
  );
}

export default EmptyState;
