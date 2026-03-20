function ConfidenceMeter({ confidence, prediction, compact = false }) {
  if (confidence === undefined || confidence === null) {
    return null;
  }

  const safeValue = Math.max(0, Math.min(100, Number(confidence) * 100));
  const label = prediction === "FAKE" ? "High-risk signal" : "Credibility signal";

  return (
    <div className={`confidence-meter${compact ? " confidence-meter--compact" : ""}`}>
      <div className="confidence-meter__header">
        <span>{label}</span>
        <strong>{safeValue.toFixed(1)}%</strong>
      </div>
      <div className="confidence-meter__track">
        <div
          className={`confidence-meter__fill ${
            prediction === "FAKE" ? "is-fake" : "is-real"
          }`}
          style={{ width: `${safeValue}%` }}
        />
      </div>
    </div>
  );
}

export default ConfidenceMeter;
