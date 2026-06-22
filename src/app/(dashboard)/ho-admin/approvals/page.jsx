"use client"
import { useState, useEffect } from "react"
import PageHeader from "@/components/ui/PageHeader"
import { api } from "@/lib/api/client"
import toast from "react-hot-toast"

// ── Icons ──────────────────────────────────────────────────────────────────────
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

const COLS = ["ID", "Item / Category", "Route", "Qty", "Value", "Manager Notes", "Status / Action"]
const LS_KEY = "ho_approvals_actioned"

// ── localStorage helpers ───────────────────────────────────────────────────────
function loadActioned() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) ?? "{}") } catch { return {} }
}
function saveActioned(id, status, comment) {
  const existing = loadActioned()
  existing[id] = { status, comment, decidedAt: new Date().toISOString() }
  localStorage.setItem(LS_KEY, JSON.stringify(existing))
}

// ── Badge ──────────────────────────────────────────────────────────────────────
function Badge({ label, color }) {
  const map = {
    green:  { bg: "#f0f7ed", color: "#3d7a2b", border: "#c6dfc0" },
    yellow: { bg: "#fefce8", color: "#ca8a04", border: "#fde68a" },
    red:    { bg: "#fef2f2", color: "#dc2626", border: "#fecaca" },
    gray:   { bg: "#f7f8f4", color: "#6b7260", border: "#dde0d4" },
  }
  const c = map[color] ?? map.gray
  return (
    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.12em", padding: "3px 8px", background: c.bg, color: c.color, border: `1px solid ${c.border}`, whiteSpace: "nowrap" }}>
      {label}
    </span>
  )
}

// ── Detail Drawer ──────────────────────────────────────────────────────────────
function DetailDrawer({ transfer, defaultAction, onClose, onApprove, onReject, submitting }) {
  const [comment, setComment] = useState("")

  useEffect(() => { setComment("") }, [transfer])

  useEffect(() => {
    if (defaultAction === "reject") {
      setTimeout(() => {
        document.getElementById("ho-comment-textarea")?.focus()
      }, 80)
    }
  }, [defaultAction, transfer])

  if (!transfer) return null

  const alreadyActioned = transfer._localStatus === "approved" || transfer._localStatus === "rejected"

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.25)", zIndex: 40 }} />
      <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: 420, background: "#fff", borderLeft: "1px solid #dde0d4", zIndex: 50, display: "flex", flexDirection: "column", overflowY: "auto" }}>

        {/* Header */}
        <div style={{ padding: "24px", borderBottom: "1px solid #e8ebe3", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#3d7a2b", fontWeight: 600 }}>
              #{transfer.id}
            </span>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 16, fontWeight: 600, color: "#1a1f0e", margin: "4px 0 0" }}>
              {transfer.itemName}
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {alreadyActioned && (
              <Badge
                label={transfer._localStatus === "approved" ? "✓ Approved" : "✕ Rejected"}
                color={transfer._localStatus === "approved" ? "green" : "red"}
              />
            )}
            <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7260", padding: 4 }}>
              <IconX />
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: "24px", flex: 1, display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              ["Item Code",     transfer.itemCode],
              ["From Branch",   transfer.sourceBranchName],
              ["To Branch",     transfer.destinationBranchName],
              ["Quantity",      transfer.quantity],
              ["Total Value",   transfer.totalValue != null
                ? new Intl.NumberFormat("en-RW", { style: "currency", currency: "RWF", maximumFractionDigits: 0 }).format(transfer.totalValue)
                : "—"],
              ["Requested By",  transfer.requestedByEmail],
              ["Requested At",  transfer.requestedAt
                ? new Date(transfer.requestedAt).toLocaleString()
                : "—"],
            ].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 10, borderBottom: "1px solid #f0f1ec" }}>
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.12em", color: "#9ca3af" }}>{k}</span>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 500, color: "#1a1f0e" }}>{v}</span>
              </div>
            ))}
          </div>

          {transfer.justification && (
            <div style={{ background: "#f7f8f4", border: "1px solid #dde0d4", padding: "14px 16px" }}>
              <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.14em", color: "#9ca3af", margin: "0 0 8px" }}>
                Requester Justification
              </p>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#1a1f0e", margin: 0, lineHeight: 1.6 }}>
                "{transfer.justification}"
              </p>
            </div>
          )}

          {transfer.managerComments && (
            <div style={{ background: "#f0f7ed", border: "1px solid #c6dfc0", padding: "14px 16px" }}>
              <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.14em", color: "#3d7a2b", margin: "0 0 8px" }}>
                Manager Comment (Level 1)
              </p>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#1a1f0e", margin: 0, lineHeight: 1.6 }}>
                "{transfer.managerComments}"
              </p>
            </div>
          )}

          {/* Show actioned comment + decided-at if already decided */}
          {alreadyActioned && (
            <div style={{ background: transfer._localStatus === "approved" ? "#f0f7ed" : "#fef2f2", border: `1px solid ${transfer._localStatus === "approved" ? "#c6dfc0" : "#fecaca"}`, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.14em", color: transfer._localStatus === "approved" ? "#3d7a2b" : "#dc2626", margin: 0 }}>
                  Your Decision
                </p>
                {transfer._decidedAt && (
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: "#9ca3af" }}>
                    {new Date(transfer._decidedAt).toLocaleString()}
                  </span>
                )}
              </div>
              {transfer._localComment && (
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#1a1f0e", margin: 0, lineHeight: 1.6 }}>
                  "{transfer._localComment}"
                </p>
              )}
            </div>
          )}

          {/* Comment field — hidden once actioned */}
          {!alreadyActioned && (
            <div>
              <label style={{ display: "block", fontFamily: "'DM Mono', monospace", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.14em", color: "#6b7260", marginBottom: 8 }}>
                {defaultAction === "reject" ? (
                  <>Comment <span style={{ color: "#dc2626" }}>*required</span></>
                ) : (
                  "Comment"
                )}
              </label>
              <textarea
                id="ho-comment-textarea"
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={defaultAction === "reject" ? "Reason for rejection (required)..." : "Add a comment..."}
                style={{ width: "100%", boxSizing: "border-box", fontFamily: "'Inter', sans-serif", fontSize: 13, background: "#f7f8f4", border: `1px solid ${defaultAction === "reject" ? "#fecaca" : "#dde0d4"}`, padding: "10px 14px", color: "#1a1f0e", outline: "none", resize: "vertical", lineHeight: 1.5 }}
                onFocus={(e) => { e.target.style.borderColor = "#3d7a2b"; e.target.style.background = "#fff" }}
                onBlur={(e)  => { e.target.style.borderColor = defaultAction === "reject" ? "#fecaca" : "#dde0d4"; e.target.style.background = "#f7f8f4" }}
              />
            </div>
          )}
        </div>

        {/* Actions — hidden once actioned */}
        {alreadyActioned ? (
          <div style={{ padding: "16px 24px", borderTop: "1px solid #e8ebe3" }}>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#6b7260", margin: 0, textAlign: "center" }}>
              This transfer has been <strong>{transfer._localStatus}</strong>.
            </p>
          </div>
        ) : (
          <div style={{ padding: "16px 24px", borderTop: "1px solid #e8ebe3", display: "flex", gap: 10 }}>
            <button
              onClick={() => onApprove(transfer.id, comment)}
              disabled={submitting}
              style={{ flex: 1, background: submitting ? "#9ca3af" : "#3d7a2b", color: "#fff", border: "none", padding: "12px", cursor: submitting ? "wait" : "pointer", fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 500, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "background 0.15s" }}
              onMouseEnter={(e) => { if (!submitting) e.currentTarget.style.background = "#2a5a1e" }}
              onMouseLeave={(e) => { if (!submitting) e.currentTarget.style.background = "#3d7a2b" }}
            >
              <IconCheck /> {submitting ? "Processing..." : "Approve"}
            </button>
            <button
              onClick={() => onReject(transfer.id, comment)}
              disabled={submitting}
              style={{ flex: 1, background: "#fff", color: "#dc2626", border: "1px solid #dc2626", padding: "12px", cursor: submitting ? "wait" : "pointer", fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 500, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "background 0.15s" }}
              onMouseEnter={(e) => { if (!submitting) e.currentTarget.style.background = "#fef2f2" }}
              onMouseLeave={(e) => { if (!submitting) e.currentTarget.style.background = "#fff" }}
            >
              <IconX /> Reject
            </button>
          </div>
        )}
      </div>
    </>
  )
}

// ── Status cell for actioned rows ──────────────────────────────────────────────
function ActionedStatus({ status }) {
  const isApproved = status === "approved"
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      fontFamily: "'DM Mono', monospace", fontSize: 9, textTransform: "uppercase",
      letterSpacing: "0.12em", padding: "4px 10px",
      background: isApproved ? "#f0f7ed" : "#fef2f2",
      color: isApproved ? "#3d7a2b" : "#dc2626",
      border: `1px solid ${isApproved ? "#c6dfc0" : "#fecaca"}`,
    }}>
      {isApproved ? <IconCheck /> : <IconX />}
      {isApproved ? "Approved" : "Rejected"}
    </span>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function HOApprovalsPage() {
  const [transfers, setTransfers]        = useState([])
  const [selected,  setSelected]         = useState(null)
  const [defaultAction, setDefaultAction]= useState(null)
  const [search,    setSearch]           = useState("")
  const [loading,   setLoading]          = useState(true)
  const [submitting,setSubmitting]       = useState(false)
  const [error,     setError]            = useState(null)

  // ── Fetch + rehydrate persisted decisions ───────────────────────────────────
  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const res = await api.get("/approvals/pending/head-office?size=100&page=0&sort=requestedAt,desc")
        const content = res?.data?.content ?? []
        const persisted = loadActioned()
        const hydrated = content.map((t) =>
          persisted[t.id]
            ? { ...t, _localStatus: persisted[t.id].status, _localComment: persisted[t.id].comment, _decidedAt: persisted[t.id].decidedAt }
            : t
        )
        setTransfers(hydrated)
      } catch (err) {
        setError(err.message)
        toast.error("Failed to load approvals")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // Keep drawer in sync when transfers update
  useEffect(() => {
    if (selected) {
      const updated = transfers.find((t) => t.id === selected.id)
      if (updated) setSelected(updated)
    }
  }, [transfers])

  const pending  = transfers.filter((t) => !t._localStatus)
  const actioned = transfers.filter((t) =>  t._localStatus)

  const filteredPending = pending.filter((t) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      String(t.id).includes(q) ||
      t.itemName?.toLowerCase().includes(q) ||
      t.itemCode?.toLowerCase().includes(q) ||
      t.sourceBranchName?.toLowerCase().includes(q) ||
      t.destinationBranchName?.toLowerCase().includes(q)
    )
  })

  const visibleActioned = search ? [] : actioned

  function openDrawer(transfer, action = null) {
    setSelected(transfer)
    setDefaultAction(action)
  }

  function closeDrawer() {
    setSelected(null)
    setDefaultAction(null)
  }

  function markTransfer(id, status, comment) {
    const decidedAt = new Date().toISOString()
    saveActioned(id, status, comment)
    setTransfers((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, _localStatus: status, _localComment: comment, _decidedAt: decidedAt } : t
      )
    )
  }

  async function handleApprove(id, comment) {
    try {
      setSubmitting(true)
      await api.post(`/approvals/${id}/ho-approve`, { approved: true, comments: comment })
      markTransfer(id, "approved", comment)
      closeDrawer()
      toast.success(`Transfer #${id} approved`)
    } catch (err) {
      toast.error(err.message || "Approval failed")
    } finally {
      setSubmitting(false)
    }
  }

  async function handleReject(id, comment) {
    if (!comment?.trim()) {
      toast.error("A comment is required when rejecting a transfer.")
      return
    }
    try {
      setSubmitting(true)
      await api.post(`/approvals/${id}/ho-reject`, { approved: false, comments: comment })
      markTransfer(id, "rejected", comment)
      closeDrawer()
      toast.success(`Transfer #${id} rejected`)
    } catch (err) {
      toast.error(err.message || "Rejection failed")
    } finally {
      setSubmitting(false)
    }
  }

  function renderRow(t, i, arr, dimmed = false) {
    const isActioned = !!t._localStatus
    return (
      <div
        key={t.id}
        style={{
          display: "grid",
          gridTemplateColumns: "80px 1fr 1fr 70px 110px 1fr 140px",
          padding: "14px 20px",
          borderBottom: i < arr.length - 1 ? "1px solid #f0f1ec" : "none",
          gap: 8,
          alignItems: "center",
          transition: "background 0.12s",
          opacity: dimmed ? 0.65 : 1,
          background: isActioned
            ? (t._localStatus === "approved" ? "#fafcf9" : "#fff9f9")
            : "transparent",
        }}
        onMouseEnter={(e) => { if (!isActioned) e.currentTarget.style.background = "#fafbf8" }}
        onMouseLeave={(e) => { e.currentTarget.style.background = isActioned ? (t._localStatus === "approved" ? "#fafcf9" : "#fff9f9") : "transparent" }}
      >
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#3d7a2b", fontWeight: 600 }}>
          #{t.id}
        </span>

        <div>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 500, color: "#1a1f0e", margin: "0 0 2px" }}>{t.itemName}</p>
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", color: "#9ca3af" }}>{t.itemCode}</span>
        </div>

        <div>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#1a1f0e", margin: "0 0 2px" }}>{t.sourceBranchName}</p>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "#6b7260", margin: 0 }}>→ {t.destinationBranchName}</p>
        </div>

        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 500, color: "#1a1f0e" }}>{t.quantity}</span>

        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#1a1f0e" }}>
          {t.totalValue != null
            ? new Intl.NumberFormat("en-RW", { style: "currency", currency: "RWF", maximumFractionDigits: 0 }).format(t.totalValue)
            : "—"}
        </span>

        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <Badge label="Mgr Approved" color="green" />
          {t.managerComments && (
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "#6b7260", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 160 }}>
              {t.managerComments}
            </span>
          )}
        </div>

        {isActioned ? (
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <ActionedStatus status={t._localStatus} />
            <button
              onClick={() => openDrawer(t)}
              title="View details"
              style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 4, display: "flex", alignItems: "center" }}
              onMouseEnter={(e) => e.currentTarget.style.color = "#6b7260"}
              onMouseLeave={(e) => e.currentTarget.style.color = "#9ca3af"}
            >
              <IconEye />
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", gap: 6 }}>
            <button
              onClick={() => openDrawer(t)}
              title="Review details"
              style={{ background: "#f7f8f4", border: "1px solid #dde0d4", cursor: "pointer", width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", color: "#6b7260", transition: "border-color 0.13s, color 0.13s" }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#3d7a2b"; e.currentTarget.style.color = "#3d7a2b" }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#dde0d4"; e.currentTarget.style.color = "#6b7260" }}
            >
              <IconEye />
            </button>
            <button
              onClick={() => openDrawer(t, "approve")}
              disabled={submitting}
              title="Approve"
              style={{ background: "#f0f7ed", border: "1px solid #c6dfc0", cursor: submitting ? "wait" : "pointer", width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", color: "#3d7a2b", transition: "background 0.13s" }}
              onMouseEnter={(e) => { if (!submitting) e.currentTarget.style.background = "#e4f0df" }}
              onMouseLeave={(e) => { if (!submitting) e.currentTarget.style.background = "#f0f7ed" }}
            >
              <IconCheck />
            </button>
            <button
              onClick={() => openDrawer(t, "reject")}
              title="Reject (requires comment)"
              style={{ background: "#fef2f2", border: "1px solid #fecaca", cursor: "pointer", width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", color: "#dc2626", transition: "background 0.13s" }}
              onMouseEnter={(e) => e.currentTarget.style.background = "#fee2e2"}
              onMouseLeave={(e) => e.currentTarget.style.background = "#fef2f2"}
            >
              <IconX />
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <PageHeader title="Final Approvals" />

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
              style={{ width: "100%", boxSizing: "border-box", fontFamily: "'Inter', sans-serif", fontSize: 13, background: "#fff", border: "1px solid #dde0d4", padding: "9px 14px 9px 32px", color: "#1a1f0e", outline: "none" }}
              onFocus={(e) => e.target.style.borderColor = "#3d7a2b"}
              onBlur={(e)  => e.target.style.borderColor = "#dde0d4"}
            />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#6b7260" }}>
            <IconFilter />
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.12em" }}>
              {loading ? "Loading..." : `${filteredPending.length} pending${actioned.length > 0 ? ` · ${actioned.length} actioned` : ""}`}
            </span>
          </div>
        </div>

        {/* Table */}
        <div style={{ background: "#fff", border: "1px solid #dde0d4", overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "80px 1fr 1fr 70px 110px 1fr 140px", padding: "10px 20px", background: "#f7f8f4", borderBottom: "1px solid #dde0d4", gap: 8 }}>
            {COLS.map((h) => (
              <span key={h} style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.14em", color: "#9ca3af" }}>{h}</span>
            ))}
          </div>

          {loading ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, padding: "48px 0" }}>
              <div style={{ width: 20, height: 20, border: "2px solid #dde0d4", borderTopColor: "#3d7a2b", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#6b7260", textTransform: "uppercase" }}>Loading...</span>
              <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
            </div>
          ) : error ? (
            <div style={{ padding: "48px 20px", textAlign: "center", fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#dc2626" }}>
              {error}
            </div>
          ) : filteredPending.length === 0 && visibleActioned.length === 0 ? (
            <div style={{ padding: "48px 20px", textAlign: "center" }}>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: "#9ca3af", margin: 0 }}>
                {search ? "No transfers match your search." : "No transfers awaiting final approval."}
              </p>
            </div>
          ) : (
            <>
              {filteredPending.map((t, i) => renderRow(t, i, filteredPending))}

              {filteredPending.length > 0 && visibleActioned.length > 0 && (
                <div style={{ padding: "8px 20px", background: "#f7f8f4", borderTop: "1px solid #dde0d4", borderBottom: "1px solid #dde0d4" }}>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.14em", color: "#9ca3af" }}>
                    Actioned
                  </span>
                </div>
              )}

              {visibleActioned.map((t, i) => renderRow(t, i, visibleActioned, true))}
            </>
          )}
        </div>
      </div>

      <DetailDrawer
        transfer={selected}
        defaultAction={defaultAction}
        onClose={closeDrawer}
        onApprove={handleApprove}
        onReject={handleReject}
        submitting={submitting}
      />
    </>
  )
}
