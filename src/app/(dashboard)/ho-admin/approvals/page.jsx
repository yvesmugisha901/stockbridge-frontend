"use client"
import { useState } from "react"
import PageHeader from "@/components/ui/PageHeader"
import Link from "next/link"

// ── Icons ─────────────────────────────────────────────────────────────────────
const IconCheck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)
const IconX = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)
const IconEye = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
)
const IconFilter = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
  </svg>
)

// ── Mock data ─────────────────────────────────────────────────────────────────
const MOCK = [
  { id: "TR-0041", item: "Cement 42.5N",    category: "Building",  from: "Branch North", to: "Head Office",  qty: 120, unit: "bags",  value: "RWF 360,000", manager: "J. Uwimana",  managerNote: "Urgent — site deadline this week.",        submitted: "Today, 08:14"   },
  { id: "TR-0040", item: "Steel Rods 12mm", category: "Metal",     from: "Branch East",  to: "Branch South", qty: 50,  unit: "pcs",   value: "RWF 275,000", manager: "A. Mugabo",   managerNote: "Construction project phase 2.",             submitted: "Today, 07:50"   },
  { id: "TR-0038", item: "Paint 20L",       category: "Finishing", from: "Branch West",  to: "Head Office",  qty: 30,  unit: "tins",  value: "RWF 180,000", manager: "C. Ingabire", managerNote: "Renovation — painting starts Monday.",      submitted: "Yesterday"      },
  { id: "TR-0037", item: "Nails 4\"",       category: "Hardware",  from: "Branch North", to: "Branch East",  qty: 200, unit: "boxes", value: "RWF 40,000",  manager: "J. Uwimana",  managerNote: "Routine replenishment.",                    submitted: "Yesterday"      },
  { id: "TR-0035", item: "PVC Pipe 4\"",    category: "Plumbing",  from: "Branch South", to: "Branch West",  qty: 80,  unit: "pcs",   value: "RWF 96,000",  manager: "B. Nkusi",    managerNote: "Water system upgrade at the depot.",        submitted: "2 days ago"     },
]

const COLS = ["ID", "Item / Category", "Route", "Qty", "Value", "Manager Approval", "Action"]

// ── Status badge ──────────────────────────────────────────────────────────────
function Badge({ label, color }) {
  const map = {
    green:  { bg: "#f0f7ed", color: "#3d7a2b", border: "#c6dfc0" },
    yellow: { bg: "#fefce8", color: "#ca8a04", border: "#fde68a" },
    red:    { bg: "#fef2f2", color: "#dc2626", border: "#fecaca" },
    gray:   { bg: "#f7f8f4", color: "#6b7260", border: "#dde0d4" },
  }
  const c = map[color] ?? map.gray
  return (
    <span style={{
      fontFamily: "'DM Mono', monospace",
      fontSize: 9,
      textTransform: "uppercase",
      letterSpacing: "0.12em",
      padding: "3px 8px",
      background: c.bg,
      color: c.color,
      border: `1px solid ${c.border}`,
      whiteSpace: "nowrap",
    }}>
      {label}
    </span>
  )
}

// ── Detail drawer ─────────────────────────────────────────────────────────────
function DetailDrawer({ transfer, onClose, onApprove, onReject }) {
  const [comment, setComment] = useState("")
  if (!transfer) return null
  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.25)", zIndex: 40 }}
      />
      {/* Panel */}
      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0, width: 420,
        background: "#fff", borderLeft: "1px solid #dde0d4",
        zIndex: 50, display: "flex", flexDirection: "column",
        overflowY: "auto",
      }}>
        {/* Header */}
        <div style={{ padding: "24px", borderBottom: "1px solid #e8ebe3", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#3d7a2b", fontWeight: 600 }}>
              {transfer.id}
            </span>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 16, fontWeight: 600, color: "#1a1f0e", margin: "4px 0 0" }}>
              {transfer.item}
            </p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7260", padding: 4 }}>
            <IconX />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "24px", flex: 1, display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Transfer details */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              ["Category",   transfer.category],
              ["From",       transfer.from],
              ["To",         transfer.to],
              ["Quantity",   `${transfer.qty} ${transfer.unit}`],
              ["Total Value",transfer.value],
              ["Submitted",  transfer.submitted],
            ].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 10, borderBottom: "1px solid #f0f1ec" }}>
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.12em", color: "#9ca3af" }}>{k}</span>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 500, color: "#1a1f0e" }}>{v}</span>
              </div>
            ))}
          </div>

          {/* Manager note */}
          <div style={{ background: "#f7f8f4", border: "1px solid #dde0d4", padding: "14px 16px" }}>
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.14em", color: "#9ca3af", margin: "0 0 8px" }}>
              Manager Comment ({transfer.manager})
            </p>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#1a1f0e", margin: 0, lineHeight: 1.6 }}>
              "{transfer.managerNote}"
            </p>
          </div>

          {/* HO comment */}
          <div>
            <label style={{ display: "block", fontFamily: "'DM Mono', monospace", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.14em", color: "#6b7260", marginBottom: 8 }}>
              Your Comment (required on rejection)
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment..."
              style={{
                width: "100%", boxSizing: "border-box",
                fontFamily: "'Inter', sans-serif", fontSize: 13,
                background: "#f7f8f4", border: "1px solid #dde0d4",
                padding: "10px 14px", color: "#1a1f0e", outline: "none",
                resize: "vertical", lineHeight: 1.5,
              }}
              onFocus={(e) => { e.target.style.borderColor = "#3d7a2b"; e.target.style.background = "#fff" }}
              onBlur={(e)  => { e.target.style.borderColor = "#dde0d4"; e.target.style.background = "#f7f8f4" }}
            />
          </div>
        </div>

        {/* Actions */}
        <div style={{ padding: "16px 24px", borderTop: "1px solid #e8ebe3", display: "flex", gap: 10 }}>
          <button
            onClick={() => onApprove(transfer.id, comment)}
            style={{
              flex: 1, background: "#3d7a2b", color: "#fff", border: "none",
              padding: "12px", cursor: "pointer",
              fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 500,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = "#2a5a1e"}
            onMouseLeave={(e) => e.currentTarget.style.background = "#3d7a2b"}
          >
            <IconCheck /> Approve
          </button>
          <button
            onClick={() => onReject(transfer.id, comment)}
            style={{
              flex: 1, background: "#fff", color: "#dc2626",
              border: "1px solid #dc2626", padding: "12px", cursor: "pointer",
              fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 500,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              transition: "background 0.15s, color 0.15s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#fef2f2" }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#fff" }}
          >
            <IconX /> Reject
          </button>
        </div>
      </div>
    </>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function HOApprovalsPage() {
  const [transfers, setTransfers]   = useState(MOCK)
  const [selected,  setSelected]    = useState(null)
  const [search,    setSearch]      = useState("")
  const [done,      setDone]        = useState([]) // { id, status }

  const filtered = transfers.filter((t) =>
    t.item.toLowerCase().includes(search.toLowerCase()) ||
    t.id.toLowerCase().includes(search.toLowerCase())   ||
    t.from.toLowerCase().includes(search.toLowerCase())
  )

  function handleApprove(id, comment) {
    setDone((d) => [...d, { id, status: "approved" }])
    setTransfers((prev) => prev.filter((t) => t.id !== id))
    setSelected(null)
  }

  function handleReject(id, comment) {
    if (!comment.trim()) {
      alert("A comment is required when rejecting a transfer.")
      return
    }
    setDone((d) => [...d, { id, status: "rejected" }])
    setTransfers((prev) => prev.filter((t) => t.id !== id))
    setSelected(null)
  }

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <PageHeader
          title="Final Approvals"
          subtitle="Level 2 review — approve or reject manager-approved transfer requests."
        />

        {/* Done toasts */}
        {done.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {done.map(({ id, status }) => (
              <div key={id} style={{
                display: "flex", alignItems: "center", gap: 10,
                background: status === "approved" ? "#f0f7ed" : "#fef2f2",
                border: `1px solid ${status === "approved" ? "#c6dfc0" : "#fecaca"}`,
                padding: "10px 16px",
              }}>
                <span style={{ color: status === "approved" ? "#3d7a2b" : "#dc2626" }}>
                  {status === "approved" ? <IconCheck /> : <IconX />}
                </span>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#1a1f0e" }}>
                  {id} — <strong>{status}</strong>
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Toolbar */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ position: "relative", flex: 1, maxWidth: 340 }}>
            <svg style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#b8bead", pointerEvents: "none" }}
              width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by ID, item, or branch..."
              style={{
                width: "100%", boxSizing: "border-box",
                fontFamily: "'Inter', sans-serif", fontSize: 13,
                background: "#fff", border: "1px solid #dde0d4",
                padding: "9px 14px 9px 32px", color: "#1a1f0e", outline: "none",
              }}
              onFocus={(e) => e.target.style.borderColor = "#3d7a2b"}
              onBlur={(e)  => e.target.style.borderColor = "#dde0d4"}
            />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#6b7260" }}>
            <IconFilter />
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.12em" }}>
              {filtered.length} pending
            </span>
          </div>
        </div>

        {/* Table */}
        <div style={{ background: "#fff", border: "1px solid #dde0d4", overflow: "hidden" }}>
          {/* Table header */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "90px 1fr 1fr 70px 110px 160px 120px",
            padding: "10px 20px",
            background: "#f7f8f4",
            borderBottom: "1px solid #dde0d4",
            gap: 8,
          }}>
            {COLS.map((h) => (
              <span key={h} style={{
                fontFamily: "'DM Mono', monospace", fontSize: 9,
                textTransform: "uppercase", letterSpacing: "0.14em", color: "#9ca3af",
              }}>{h}</span>
            ))}
          </div>

          {/* Rows */}
          {filtered.length === 0 ? (
            <div style={{ padding: "48px 20px", textAlign: "center" }}>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: "#9ca3af", margin: 0 }}>
                No transfers awaiting final approval.
              </p>
            </div>
          ) : (
            filtered.map((t, i) => (
              <div
                key={t.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "90px 1fr 1fr 70px 110px 160px 120px",
                  padding: "14px 20px",
                  borderBottom: i < filtered.length - 1 ? "1px solid #f0f1ec" : "none",
                  gap: 8,
                  alignItems: "center",
                  transition: "background 0.12s",
                  cursor: "default",
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "#fafbf8"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                {/* ID */}
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#3d7a2b", fontWeight: 600 }}>
                  {t.id}
                </span>

                {/* Item */}
                <div>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 500, color: "#1a1f0e", margin: "0 0 2px" }}>
                    {t.item}
                  </p>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", color: "#9ca3af" }}>
                    {t.category}
                  </span>
                </div>

                {/* Route */}
                <div>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#1a1f0e", margin: "0 0 2px" }}>{t.from}</p>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "#6b7260", margin: 0 }}>→ {t.to}</p>
                </div>

                {/* Qty */}
                <div>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 500, color: "#1a1f0e", margin: "0 0 2px" }}>{t.qty}</p>
                  <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: "#9ca3af", margin: 0 }}>{t.unit}</p>
                </div>

                {/* Value */}
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#1a1f0e" }}>{t.value}</span>

                {/* Manager */}
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <Badge label="Mgr Approved" color="green" />
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "#6b7260" }}>{t.manager}</span>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: 6 }}>
                  <button
                    onClick={() => setSelected(t)}
                    title="Review"
                    style={{
                      background: "#f7f8f4", border: "1px solid #dde0d4", cursor: "pointer",
                      width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center",
                      color: "#6b7260", transition: "border-color 0.13s, color 0.13s",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#3d7a2b"; e.currentTarget.style.color = "#3d7a2b" }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#dde0d4"; e.currentTarget.style.color = "#6b7260" }}
                  >
                    <IconEye />
                  </button>
                  <button
                    onClick={() => handleApprove(t.id, "")}
                    title="Approve"
                    style={{
                      background: "#f0f7ed", border: "1px solid #c6dfc0", cursor: "pointer",
                      width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center",
                      color: "#3d7a2b", transition: "background 0.13s",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "#e4f0df"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "#f0f7ed"}
                  >
                    <IconCheck />
                  </button>
                  <button
                    onClick={() => setSelected(t)}
                    title="Reject (add comment)"
                    style={{
                      background: "#fef2f2", border: "1px solid #fecaca", cursor: "pointer",
                      width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center",
                      color: "#dc2626", transition: "background 0.13s",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "#fee2e2"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "#fef2f2"}
                  >
                    <IconX />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Drawer */}
      <DetailDrawer
        transfer={selected}
        onClose={() => setSelected(null)}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </>
  )
}