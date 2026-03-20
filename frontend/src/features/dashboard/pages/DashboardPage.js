import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import ConfidenceMeter from "../../../components/ui/ConfidenceMeter";
import PageIntro from "../../../components/ui/PageIntro";
import PredictionBadge from "../../../components/ui/PredictionBadge";
import StatCard from "../../../components/ui/StatCard";
import { apiRequest } from "../../../lib/apiClient";
import { formatTimestamp } from "../../../lib/formatters";

function DashboardPage() {
  const queryClient = useQueryClient();
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const { data: history = [] } = useQuery({
    queryKey: ["history"],
    queryFn: () => apiRequest("/history"),
  });

  const stats = useMemo(() => {
    const total = history.length;
    const fakeItems = history.filter((item) => item.prediction === "FAKE").length;
    const realItems = history.filter((item) => item.prediction === "REAL").length;
    const averageConfidence = total
      ? `${(
          ((history.reduce((sum, item) => sum + Number(item.confidence || 0), 0) / total) *
            100)
        ).toFixed(1)}%`
      : "0.0%";

    return {
      total,
      fakeItems,
      realItems,
      averageConfidence,
    };
  }, [history]);

  const recentItems = useMemo(() => history.slice(0, 3), [history]);
  const latestSavedItem = recentItems[0];
  const riskRate = stats.total
    ? `${Math.round((stats.fakeItems / stats.total) * 100)}%`
    : "0%";

  const predictMutation = useMutation({
    mutationFn: (payload) =>
      apiRequest("/predict", {
        method: "POST",
        body: JSON.stringify({ text: payload }),
      }),
    onSuccess: (data) => {
      setResult(data);
      setText("");
      setError("");
      queryClient.invalidateQueries({ queryKey: ["history"] });
    },
    onError: (requestError) => {
      setResult(null);
      setError(requestError.message || "Analysis failed.");
    },
  });

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!text.trim()) {
      setError("Enter content to analyze.");
      return;
    }

    predictMutation.mutate(text.trim());
  };

  return (
    <div className="page-stack">
      <PageIntro
        eyebrow="Operational dashboard"
        title="A clearer command center for credibility review."
        description="Screen suspect content, compare confidence signals, and keep every decision visible without losing focus."
        aside={
          <div className="page-spotlight">
            <div className="page-spotlight__header">
              <span className="eyebrow">Live overview</span>
              <span className="status-pill">Model online</span>
            </div>
            <strong>{stats.total} analyses recorded</strong>
            <p>
              {latestSavedItem
                ? `Latest review saved ${formatTimestamp(latestSavedItem.created_at)}.`
                : "History refreshes automatically after each successful prediction."}
            </p>
            <div className="metric-inline">
              <div>
                <span>Risk rate</span>
                <strong>{riskRate}</strong>
              </div>
              <div>
                <span>Credible calls</span>
                <strong>{stats.realItems}</strong>
              </div>
            </div>
          </div>
        }
      />

      <section className="stats-grid">
        <StatCard
          label="Total analyses"
          value={stats.total}
          hint="All predictions linked to your account"
        />
        <StatCard
          label="Fake detections"
          value={stats.fakeItems}
          hint="Items the model flagged as high-risk"
        />
        <StatCard
          label="Average confidence"
          value={stats.averageConfidence}
          hint="Mean confidence across your recorded history"
        />
      </section>

      <section className="dashboard-grid">
        <article className="panel">
          <div className="panel__header">
            <div>
              <p className="eyebrow">Run analysis</p>
              <h2>Evaluate an article, caption, or post</h2>
            </div>
            <span className="panel__badge">Secure input</span>
          </div>

          <form className="stack" onSubmit={handleSubmit}>
            <label className="field">
              <span>Content sample</span>
              <textarea
                value={text}
                onChange={(event) => setText(event.target.value)}
                placeholder="Paste the content you want to review."
              />
            </label>

            <div className="button-row">
              <button
                type="submit"
                className="button button--primary"
                disabled={predictMutation.isPending}
              >
                {predictMutation.isPending ? "Analyzing..." : "Analyze content"}
              </button>
              <button
                type="button"
                className="button button--ghost"
                onClick={() => {
                  setText("");
                  setError("");
                }}
              >
                Clear
              </button>
            </div>

            {error ? <p className="form-message form-message--error">{error}</p> : null}
          </form>

          <div className="notes-grid">
            <article className="note-card">
              <span className="note-card__label">Best input</span>
              <strong>Use a complete claim or excerpt</strong>
              <p>Full phrasing gives the model better context than a fragment.</p>
            </article>
            <article className="note-card">
              <span className="note-card__label">Workflow</span>
              <strong>Each result is stored automatically</strong>
              <p>Successful predictions are pushed into your history for later review.</p>
            </article>
          </div>
        </article>

        <article className="panel result-panel">
          <div className="panel__header">
            <div>
              <p className="eyebrow">Latest result</p>
              <h2>Prediction summary</h2>
            </div>
            {result ? <PredictionBadge prediction={result.prediction} /> : null}
          </div>

          {result ? (
            <div className="stack">
              <div className="result-panel__hero">
                <span className="result-panel__label">Model decision</span>
                <strong>
                  {result.prediction === "FAKE"
                    ? "High misinformation risk"
                    : "Likely credible"}
                </strong>
                <p>
                  Recorded on {formatTimestamp(result.created_at)} and added to your
                  history automatically.
                </p>
              </div>
              <ConfidenceMeter confidence={result.confidence} prediction={result.prediction} />
              <div className="result-facts">
                <article>
                  <span>Classification</span>
                  <strong>{result.prediction}</strong>
                </article>
                <article>
                  <span>Confidence</span>
                  <strong>{(Number(result.confidence || 0) * 100).toFixed(1)}%</strong>
                </article>
              </div>
              <div className="panel panel--muted">
                <p className="result-panel__excerpt">{result.text}</p>
              </div>
            </div>
          ) : (
            <div className="result-panel__empty">
              <strong>No prediction yet</strong>
              <p>
                Run an analysis to see the model verdict, confidence score, and saved
                record here.
              </p>
            </div>
          )}
        </article>
      </section>

      <section className="panel">
        <div className="panel__header">
          <div>
            <p className="eyebrow">Recent activity</p>
            <h2>Latest saved analyses</h2>
          </div>
        </div>

        {recentItems.length > 0 ? (
          <div className="history-list">
            {recentItems.map((item) => (
              <article key={item.id} className="history-list__item">
                <div className="history-list__meta">
                  <PredictionBadge prediction={item.prediction} />
                  <span>{formatTimestamp(item.created_at)}</span>
                </div>
                <p>{item.text}</p>
                <ConfidenceMeter
                  confidence={item.confidence}
                  prediction={item.prediction}
                  compact
                />
                <div className="history-list__footer">
                  <span>Saved assessment</span>
                  <strong>{item.prediction === "FAKE" ? "Escalate for review" : "Low concern"}</strong>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="muted-copy">
            Your recent predictions will appear here after the first successful
            analysis.
          </p>
        )}
      </section>
    </div>
  );
}

export default DashboardPage;
