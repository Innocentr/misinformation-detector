import React, { useState, useMemo } from "react"; // 1. Removed useEffect
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"; // 2. Added Query hooks
import API from "../services/api";
import PredictionBadge from "../components/ui/PredictionBadge";
import ConfidenceBar from "../components/ui/ConfidenceBar";
import PageHeader from "../components/ui/PageHeader";
import StatCard from "../components/ui/StatCard";
import { theme } from "../styles/theme";

function Dashboard() {
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const queryClient = useQueryClient();

  // 3. Replaced useEffect + manual history state with useQuery
  const { data: history = [] } = useQuery({
    queryKey: ['history'],
    queryFn: async () => {
      const res = await API.get("/history");
      return res.data;
    }
  });

  // 4. Replaced handlePredict + loading state with useMutation
  const mutation = useMutation({
    mutationFn: (newText) => API.post("/predict", { text: newText }),
    onSuccess: (res) => {
      setResult(res.data);
      setText(""); 
      // Invalidate the cache to refresh stats and history automatically
      queryClient.invalidateQueries({ queryKey: ['history'] });
    },
    onError: (err) => {
      setError(err.response?.data?.message || "Analysis failed.");
    }
  });

  const stats = useMemo(() => {
    const total = history.length;
    const fakeCount = history.filter(item => item.prediction === "FAKE").length;
    const avgConf = total > 0 
      ? (history.reduce((acc, curr) => acc + curr.confidence, 0) / total).toFixed(1) 
      : 0;
    return { total, fakeCount, avgConf };
  }, [history]);

  const handlePredict = () => {
    if (!text.trim()) return setError("Please enter some text to analyze.");
    setError("");
    setResult(null);
    mutation.mutate(text); // Trigger the mutation
  };

  return (
    <>
      <PageHeader title="Dashboard" subtitle="Fact-checking & Credibility Analysis" />

      <div style={styles.statsRow}>
        <StatCard label="Total Analyzed" value={stats.total} color={theme.colors.primary} />
        <StatCard label="Fake Detected" value={stats.fakeCount} color={theme.colors.status.fake.bar} />
        <StatCard label="Avg. Confidence" value={`${stats.avgConf}%`} color={theme.colors.status.real.bar} />
      </div>

      <div style={styles.card}>
        <div style={styles.inputGroup}>
          <textarea
            placeholder="Paste content here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            style={styles.textarea}
          />
          {text && <button onClick={() => setText("")} style={styles.clearBtn}>Clear text</button>}
        </div>

        <button
          onClick={handlePredict}
          // 5. Updated to use mutation.isPending
          disabled={mutation.isPending || !text.trim()}
          style={{
            ...styles.analyzeBtn,
            backgroundColor: theme.colors.primary,
            opacity: mutation.isPending || !text.trim() ? 0.6 : 1,
            cursor: mutation.isPending || !text.trim() ? "not-allowed" : "pointer",
          }}
        >
          {mutation.isPending ? "Analyzing Patterns..." : "Verify Content"}
        </button>

        {error && <p style={styles.errorText}>{error}</p>}

        {result && (
          <div style={styles.resultContainer}>
            <div style={styles.resultHeader}>
              <h3 style={styles.resultTitle}>Analysis Result</h3>
              <PredictionBadge prediction={result.prediction} />
            </div>
            <ConfidenceBar confidence={result.confidence} prediction={result.prediction} />
          </div>
        )}
      </div>
    </>
  );
}

const styles = {
  statsRow: { display: "flex", gap: "20px", flexWrap: "wrap", marginBottom: "32px", maxWidth: "800px" },
  card: { backgroundColor: theme.colors.surface, padding: "clamp(16px, 5vw, 32px)", borderRadius: "16px", maxWidth: "800px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)", boxSizing: "border-box" },
  inputGroup: { position: "relative" },
  textarea: { width: "100%", height: "clamp(150px, 30vh, 250px)", padding: "16px", borderRadius: "12px", border: `1px solid ${theme.colors.border}`, outline: "none", fontSize: "16px", boxSizing: "border-box", backgroundColor: theme.colors.inputBg, fontFamily: "inherit" },
  clearBtn: { position: "absolute", bottom: "12px", right: "12px", background: "none", border: "none", color: theme.colors.textMuted, cursor: "pointer", fontWeight: "600" },
  analyzeBtn: { marginTop: "20px", width: "100%", padding: "16px", color: theme.colors.textInverse, border: "none", borderRadius: "12px", fontWeight: "600", fontSize: "16px", transition: "all 0.2s ease" },
  errorText: { color: theme.colors.status.fake.bar, marginTop: "16px", fontSize: "14px", textAlign: "center" },
  resultContainer: { marginTop: "32px", padding: "20px", backgroundColor: theme.colors.background, borderRadius: "12px", border: `1px solid ${theme.colors.border}` },
  resultHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" },
  resultTitle: { margin: 0, fontSize: "18px", color: theme.colors.textMain, fontWeight: "600" },
};

export default Dashboard;