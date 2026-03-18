import React from "react";
import { theme } from "../../styles/theme"; //  Import the theme

export default function PredictionBadge({ prediction }) {
  if (!prediction) return null;
  
  const isReal = prediction === "REAL";
  

  const statusColors = isReal ? theme.colors.status.real : theme.colors.status.fake;

  return (
    <span
      style={{
        padding: "6px 14px",
        borderRadius: "20px",
        fontSize: "13px",
        fontWeight: "700",
        textTransform: "uppercase",
        letterSpacing: "0.5px",
        backgroundColor: statusColors.bg,
        color: statusColors.text,
        border: `1px solid ${statusColors.border}`,
      }}
    >
      {prediction}
    </span>
  );
}