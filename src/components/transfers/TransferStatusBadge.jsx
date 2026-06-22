"use client";

/**
 * TransferStatusBadge
 * Compact badge showing the current status of a transfer.
 * FR-21: Transfer Audit Trail
 *
 * Props:
 *   status {string} - one of the transfer lifecycle statuses
 *   size   {string} - "sm" | "md" (default "md")
 */
export function TransferStatusBadge({ status, size = "md" }) {
  const MAP = {
    PENDING:          { label: "Pending",          bg: "#1e2d45", color: "#60a5fa" },
    MANAGER_APPROVED: { label: "Manager Approved", bg: "#1a3a2a", color: "#34d399" },
    HO_APPROVED:      { label: "HO Approved",      bg: "#1a3a1a", color: "#4ade80" },
    IN_TRANSIT:       { label: "In Transit",        bg: "#2a2010", color: "#fb923c" },
    RECEIVED:         { label: "Received",          bg: "#1a2a3a", color: "#38bdf8" },
    COMPLETED:        { label: "Completed",         bg: "#1a3a1a", color: "#22c55e" },
    REJECTED:         { label: "Rejected",          bg: "#3a1a1a", color: "#f87171" },
    CANCELLED:        { label: "Cancelled",         bg: "#1e1e1e", color: "#6b7280" },
  };
  const s = MAP[status] || { label: status, bg: "#1e2d45", color: "#8899b0" };

  return (
    <>
      <span
        className={`tsb-badge tsb-badge--${size}`}
        style={{ background: s.bg, color: s.color }}
      >
        {s.label}
      </span>
      <style>{`
        .tsb-badge {
          display: inline-block; border-radius: 20px; font-weight: 700;
          font-family: 'DM Sans', sans-serif; white-space: nowrap; letter-spacing: 0.04em;
        }
        .tsb-badge--sm { font-size: 0.68rem; padding: 0.15rem 0.5rem; }
        .tsb-badge--md { font-size: 0.75rem; padding: 0.22rem 0.65rem; }
      `}</style>
    </>
  );
}

/**
 * TransferStatusTimeline
 * Visual step-by-step progress bar for a transfer's lifecycle.
 *
 * Props:
 *   status  {string} - current transfer status
 *   history {Array}  - [{ status, actor, timestamp, comments }]
 */
export function TransferStatusTimeline({ status, history = [] }) {
  const STEPS = [
    { key: "PENDING",          label: "Submitted" },
    { key: "MANAGER_APPROVED", label: "Manager Approved" },
    { key: "HO_APPROVED",      label: "HO Approved" },
    { key: "IN_TRANSIT",       label: "In Transit" },
    { key: "RECEIVED",         label: "Received" },
    { key: "COMPLETED",        label: "Completed" },
  ];

  const isRejected  = status === "REJECTED";
  const isCancelled = status === "CANCELLED";

  const currentIndex = isRejected || isCancelled
    ? -1
    : STEPS.findIndex((s) => s.key === status);

  return (
    <div className="tst-wrap">
      {(isRejected || isCancelled) && (
        <div className={`tst-terminal tst-terminal--${isRejected ? "rejected" : "cancelled"}`}>
          {isRejected ? "✕ Transfer Rejected" : "○ Transfer Cancelled"}
        </div>
      )}

      <div className="tst-steps">
        {STEPS.map((step, idx) => {
          const done    = !isRejected && !isCancelled && idx < currentIndex;
          const active  = !isRejected && !isCancelled && idx === currentIndex;
          const pending = isRejected || isCancelled || idx > currentIndex;
          const logEntry = history.find((h) => h.status === step.key);

          return (
            <div key={step.key} className="tst-step-row">
              {/* Connector line (except first) */}
              {idx > 0 && (
                <div className={`tst-connector ${done || active ? "tst-connector--done" : ""}`} />
              )}

              <div className="tst-step">
                {/* Circle */}
                <div
                  className={`tst-circle
                    ${done   ? "tst-circle--done"   : ""}
                    ${active ? "tst-circle--active" : ""}
                    ${pending ? "tst-circle--pending" : ""}
                  `}
                >
                  {done ? "✓" : idx + 1}
                </div>

                {/* Label + meta */}
                <div className="tst-step-info">
                  <span className={`tst-step-label ${active ? "tst-step-label--active" : done ? "tst-step-label--done" : "tst-step-label--pending"}`}>
                    {step.label}
                  </span>
                  {logEntry && (
                    <span className="tst-meta">
                      {logEntry.actor} · {new Date(logEntry.timestamp).toLocaleDateString("en-GB")}
                      {logEntry.comments && ` · "${logEntry.comments}"`}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        .tst-wrap { font-family: 'DM Sans', sans-serif; }
        .tst-terminal {
          padding: 0.6rem 1rem; border-radius: 8px; font-size: 0.82rem;
          font-weight: 700; margin-bottom: 1rem;
        }
        .tst-terminal--rejected  { background: #3a1a1a; color: #f87171; }
        .tst-terminal--cancelled { background: #1e1e1e; color: #6b7280; }
        .tst-steps { display: flex; flex-direction: column; }
        .tst-step-row { display: flex; flex-direction: column; }
        .tst-connector {
          width: 2px; height: 20px; background: #1e2d45;
          margin-left: 13px;
        }
        .tst-connector--done { background: #3b82f6; }
        .tst-step { display: flex; align-items: flex-start; gap: 0.75rem; }
        .tst-circle {
          width: 28px; height: 28px; border-radius: 50%; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.7rem; font-weight: 700; transition: all 0.2s;
        }
        .tst-circle--done    { background: #3b82f6; color: #fff; }
        .tst-circle--active  { background: #1a2e4a; border: 2px solid #3b82f6; color: #60a5fa; }
        .tst-circle--pending { background: #0f1623; border: 1px solid #1e2d45; color: #4a5568; }
        .tst-step-info { display: flex; flex-direction: column; gap: 0.1rem; padding: 0.3rem 0; }
        .tst-step-label { font-size: 0.85rem; font-weight: 600; }
        .tst-step-label--done    { color: #8899b0; }
        .tst-step-label--active  { color: #e8edf5; }
        .tst-step-label--pending { color: #4a5568; }
        .tst-meta { font-size: 0.72rem; color: #4a5568; font-style: italic; max-width: 300px; }
      `}</style>
    </div>
  );
}