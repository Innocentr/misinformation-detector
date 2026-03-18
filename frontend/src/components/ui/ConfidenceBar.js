import React from "react";

export default function ConfidenceBar({ confidence, prediction }) {
  if (confidence === undefined || confidence === null) return null;

  const percentage = (confidence * 100).toFixed(1);
  const isReal = prediction === "REAL";

  return (
    <div style={{ marginTop: "12px" }}>
      <p style={{ fontSize: "15px", color: "#475569", margin: "0 0 8px 0" }}>
        Our model is <strong>{percentage}%</strong> confident.
      </p>

      <div
        style={{
          height: "8px",
          backgroundColor: "#e2e8f0",
          borderRadius: "10px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${percentage}%`,
            backgroundColor: isReal ? "#22c55e" : "#ef4444",
            transition: "width 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        />
      </div>
    </div>
  );
}