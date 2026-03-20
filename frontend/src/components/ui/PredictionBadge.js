function PredictionBadge({ prediction }) {
  if (!prediction) {
    return null;
  }

  const tone = prediction === "FAKE" ? "is-fake" : "is-real";

  return <span className={`prediction-badge ${tone}`}>{prediction}</span>;
}

export default PredictionBadge;
