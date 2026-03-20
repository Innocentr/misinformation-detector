import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import ConfidenceMeter from "../../../components/ui/ConfidenceMeter";
import EmptyState from "../../../components/ui/EmptyState";
import PageIntro from "../../../components/ui/PageIntro";
import PredictionBadge from "../../../components/ui/PredictionBadge";
import { apiRequest } from "../../../lib/apiClient";
import { formatTimestamp, truncateText } from "../../../lib/formatters";

const ITEMS_PER_PAGE = 6;

function HistoryPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortOrder, setSortOrder] = useState("NEWEST");
  const [page, setPage] = useState(1);

  const {
    data: records = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["history"],
    queryFn: () => apiRequest("/history"),
  });

  const filteredRecords = useMemo(() => {
    return records
      .filter((record) =>
        search.trim()
          ? record.text.toLowerCase().includes(search.trim().toLowerCase())
          : true
      )
      .filter((record) =>
        statusFilter === "ALL" ? true : record.prediction === statusFilter
      )
      .sort((left, right) => {
        if (sortOrder === "OLDEST") {
          return new Date(left.created_at) - new Date(right.created_at);
        }

        if (sortOrder === "CONFIDENCE") {
          return Number(right.confidence) - Number(left.confidence);
        }

        return new Date(right.created_at) - new Date(left.created_at);
      });
  }, [records, search, sortOrder, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / ITEMS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  const activeFilters = [search.trim() ? "Search" : null, statusFilter !== "ALL" ? statusFilter : null]
    .filter(Boolean)
    .join(" • ");

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
    setPage(1);
  };

  const handleStatusChange = (event) => {
    setStatusFilter(event.target.value);
    setPage(1);
  };

  const handleSortChange = (event) => {
    setSortOrder(event.target.value);
    setPage(1);
  };

  return (
    <div className="page-stack">
      <PageIntro
        eyebrow="History"
        title="A sharper audit view for past predictions."
        description="Search the archive, isolate high-risk results, and move through saved assessments with less friction."
        aside={
          <div className="page-spotlight">
            <div className="page-spotlight__header">
              <span className="eyebrow">Archive snapshot</span>
              <span className="status-pill status-pill--muted">{records.length} saved</span>
            </div>
            <strong>{filteredRecords.length} visible records</strong>
            <p>{activeFilters ? `Active filters: ${activeFilters}` : "No filters applied. Showing the full archive."}</p>
            <div className="metric-inline">
              <div>
                <span>Pages</span>
                <strong>{totalPages}</strong>
              </div>
              <div>
                <span>Sort mode</span>
                <strong>{sortOrder.toLowerCase()}</strong>
              </div>
            </div>
          </div>
        }
      />

      <section className="panel">
        <div className="panel__header">
          <div>
            <p className="eyebrow">Archive controls</p>
            <h2>Filter and compare</h2>
          </div>
          <button
            type="button"
            className="button button--ghost"
            onClick={() => {
              setSearch("");
              setStatusFilter("ALL");
              setSortOrder("NEWEST");
              setPage(1);
            }}
          >
            Reset filters
          </button>
        </div>

        <div className="toolbar">
          <label className="field field--inline">
            <span>Search</span>
            <input
              type="search"
              value={search}
              onChange={handleSearchChange}
              placeholder="Search stored text"
            />
          </label>

          <label className="field field--inline">
            <span>Status</span>
            <select value={statusFilter} onChange={handleStatusChange}>
              <option value="ALL">All results</option>
              <option value="REAL">Real only</option>
              <option value="FAKE">Fake only</option>
            </select>
          </label>

          <label className="field field--inline">
            <span>Sort</span>
            <select value={sortOrder} onChange={handleSortChange}>
              <option value="NEWEST">Newest first</option>
              <option value="OLDEST">Oldest first</option>
              <option value="CONFIDENCE">Highest confidence</option>
            </select>
          </label>
        </div>

        {isLoading ? (
          <div className="history-grid">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="history-card history-card--skeleton skeleton-block" />
            ))}
          </div>
        ) : isError ? (
          <div className="state-message">
            <strong>History could not be loaded.</strong>
            <p>Refresh the page or try again after the backend is available.</p>
          </div>
        ) : records.length === 0 ? (
          <EmptyState
            title="No saved analyses yet"
            description="Once you run your first prediction, it will appear here with confidence and timestamp details."
            actionLabel="Open dashboard"
            actionTo="/dashboard"
          />
        ) : filteredRecords.length === 0 ? (
          <div className="state-message">
            <strong>No records match these filters.</strong>
            <p>Adjust the search term or reset the status and sort controls.</p>
          </div>
        ) : (
          <>
            <div className="history-grid">
              {paginatedRecords.map((record) => (
                <article key={record.id} className="history-card">
                  <div className="history-card__meta">
                    <PredictionBadge prediction={record.prediction} />
                    <span>{formatTimestamp(record.created_at)}</span>
                  </div>
                  <p className="history-card__text">{truncateText(record.text, 220)}</p>
                  <ConfidenceMeter confidence={record.confidence} prediction={record.prediction} />
                  <div className="history-card__footer">
                    <span>Archive note</span>
                    <strong>
                      {record.prediction === "FAKE"
                        ? "Potential misinformation signal"
                        : "Marked as likely credible"}
                    </strong>
                  </div>
                </article>
              ))}
            </div>

            {totalPages > 1 ? (
              <div className="pagination">
                <button
                  type="button"
                  className="button button--ghost"
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                <span>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  type="button"
                  className="button button--ghost"
                  onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            ) : null}
          </>
        )}
      </section>
    </div>
  );
}

export default HistoryPage;
