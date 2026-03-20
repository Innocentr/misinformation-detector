import { useMemo, useState } from "react";
import { truncateText } from "../../lib/formatters";

function ExpandableText({
  text,
  previewLength = 180,
  className = "",
  previewClassName = "",
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const preview = useMemo(
    () => truncateText(text, previewLength),
    [previewLength, text]
  );

  if (!text) {
    return null;
  }

  const isTruncated = preview !== text;

  return (
    <div className={`expandable-text ${className}`.trim()}>
      <p className={`expandable-text__content ${previewClassName}`.trim()}>
        {isExpanded || !isTruncated ? text : preview}
      </p>
      {isTruncated ? (
        <button
          type="button"
          className="expandable-text__toggle"
          onClick={() => setIsExpanded((value) => !value)}
        >
          {isExpanded ? "Show less" : "Read more"}
        </button>
      ) : null}
    </div>
  );
}

export default ExpandableText;
