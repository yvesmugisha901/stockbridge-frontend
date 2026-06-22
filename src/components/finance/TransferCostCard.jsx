"use client";

/**
 * TransferCostCard
 * Displays cost details attached to a single transfer.
 * Matches the accountant dashboard light theme.
 *
 * Props:
 *   transfer {object}      – { id, fromBranch, toBranch, item, quantity, status, completedAt }
 *   cost     {object|null} – { amount, currency, costType, notes } or null if not yet recorded
 *   onRecord {function}    – called with the transfer object when "Record Cost" is clicked
 */

function ArrowIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"/>
      <polyline points="12 5 19 12 12 19"/>
    </svg>
  );
}

function DollarIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23"/>
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>
  );
}

const STATUS_STYLE = {
  HO_APPROVED: { color: "#b45309", bg: "#fef3e2" },
  IN_TRANSIT:  { color: "#1d6fa8", bg: "#eaf3fb" },
  RECEIVED:    { color: "#6b7260", bg: "#f3f4f0" },
  COMPLETED:   { color: "#3d7a2b", bg: "#f0f7ed" },
};

export default function TransferCostCard({ transfer = {}, cost = null, onRecord }) {
  const s   = STATUS_STYLE[transfer.status] || { color: "#6b7260", bg: "#f3f4f0" };
  const fmt = (n, c) => `${new Intl.NumberFormat("en-RW").format(n)} ${c}`;

  return (
    <div style={{
      background: "#fff",
      border: "1px solid #e8ebe3",
      borderRadius: 10,
      padding: "16px 18px",
      fontFamily: "'Inter', system-ui, sans-serif",
      transition: "box-shadow 0.15s",
    }}
      onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.07)"}
      onMouseLeave={(e) => e.currentTarget.style.boxShadow = "none"}
    >
      {/* Transfer header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <span style={{
          fontFamily: "'DM Mono', monospace", fontSize: 11,
          color: "#3d7a2b", letterSpacing: "0.04em",
        }}>
          {transfer.id}
        </span>
        <span style={{
          fontFamily: "'DM Mono', monospace", fontSize: 10,
          textTransform: "uppercase", letterSpacing: "0.08em",
          color: s.color, background: s.bg,
          padding: "3px 8px", borderRadius: 4,
        }}>
          {transfer.status?.replace(/_/g, " ")}
        </span>
      </div>

      {/* Route */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 500, color: "#1a1f0e" }}>{transfer.fromBranch}</span>
        <span style={{ color: "#9ca3af" }}><ArrowIcon /></span>
        <span style={{ fontSize: 13, fontWeight: 500, color: "#1a1f0e" }}>{transfer.toBranch}</span>
      </div>

      {/* Item + qty */}
      <p style={{ fontSize: 12, color: "#6b7260", margin: "0 0 4px" }}>
        {transfer.item}
        {transfer.quantity && (
          <span style={{ fontFamily: "'DM Mono', monospace", color: "#9ca3af", marginLeft: 4 }}>
            × {transfer.quantity}
          </span>
        )}
      </p>

      {/* Completed date */}
      {transfer.completedAt && (
        <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#b8bead", margin: "0 0 12px" }}>
          Completed {new Date(transfer.completedAt).toLocaleDateString("en-GB")}
        </p>
      )}

      {/* Divider */}
      <div style={{ borderTop: "1px solid #f3f4f0", margin: "12px 0" }} />

      {/* Cost section */}
      {cost ? (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: "#6b7260" }}>Cost Recorded</span>
            <span style={{
              fontFamily: "'DM Mono', monospace", fontSize: 13,
              fontWeight: 500, color: "#3d7a2b",
            }}>
              {fmt(cost.amount, cost.currency)}
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 12, color: "#6b7260" }}>Type</span>
            <span style={{
              fontFamily: "'DM Mono', monospace", fontSize: 10,
              textTransform: "uppercase", letterSpacing: "0.08em",
              color: "#6b7260", background: "#f3f4f0",
              padding: "3px 8px", borderRadius: 4,
            }}>
              {cost.costType}
            </span>
          </div>
          {cost.notes && (
            <p style={{ fontSize: 12, color: "#9ca3af", fontStyle: "italic", margin: "8px 0 0" }}>
              "{cost.notes}"
            </p>
          )}
        </div>
      ) : (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 12, color: "#b8bead" }}>No cost recorded</span>
          <button
            onClick={() => onRecord?.(transfer)}
            style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              padding: "5px 12px", borderRadius: 5,
              border: "1px solid #3d7a2b", background: "#f0f7ed",
              color: "#3d7a2b",
              fontFamily: "'Inter', sans-serif", fontSize: 12,
              cursor: "pointer",
            }}
          >
            <DollarIcon /> Record Cost
          </button>
        </div>
      )}
    </div>
  );
}