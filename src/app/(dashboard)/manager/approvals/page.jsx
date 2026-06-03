"use client"
import { useState, useEffect } from "react"
import { api } from "@/lib/api/client"
import toast from "react-hot-toast"
import PageHeader from "@/components/ui/PageHeader"

// ─── Icons ────────────────────────────────────────────────────────────────────
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
const IconClose = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)
const IconArrow = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
)
const IconTruck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
    <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
  </svg>
)

// ─── Flow Banner ──────────────────────────────────────────────────────────────
function FlowBanner({ activeStep }) {
  // activeStep: "approve" | "dispatch"
  const steps = [
    { label: "Staff",     sub: "submits request",  key: null },
    { label: "Manager",   sub: "your review",      key: "approve" },
    { label: "HO Admin",  sub: "final approval",   key: null },
    { label: "Dispatch",  sub: "your action",      key: "dispatch" },
    { label: "In Transit",sub: "stock moving",     key: null },
  ]

  return (
    <div style={{ background: "#f7f8f4", border: "1px solid #dde0d4", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "center", gap: 16 }}>
      {steps.map((s, i) => {
        const active = s.key === activeStep
        const done   = activeStep === "dispatch" && (i < 3)
        return (
          <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div style={{
                width: 32, height: 32, borderRadius: "50%",
                background: done ? "#3d7a2b" : active ? "#1a1f0e" : "#f7f8f4",
                border: `2px solid ${done || active ? "#3d7a2b" : "#dde0d4"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: done || active ? "#fff" : "#9ca3af",
                fontSize: 12, fontWeight: 700, fontFamily: "'DM Mono', monospace",
              }}>
                {done ? "✓" : active ? "●" : "○"}
              </div>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: active ? 600 : 400, color: active ? "#1a1f0e" : done ? "#3d7a2b" : "#9ca3af" }}>{s.label}</span>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", color: active ? "#3d7a2b" : done ? "#3d7a2b" : "#b8bead" }}>{s.sub}</span>
            </div>
            {i < steps.length - 1 && (
              <div style={{ color: "#dde0d4", paddingBottom: 18 }}><IconArrow /></div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Approve/Reject Modal ─────────────────────────────────────────────────────
function ApprovalModal({ modal, comments, setComments, onApprove, onReject, onClose, submitting }) {
  if (!modal) return null
  const labelStyle = {
    fontFamily: "'DM Mono', monospace", fontSize: 9,
    textTransform: "uppercase", letterSpacing: "0.12em",
    color: "#9ca3af", marginBottom: 4, display: "block",
  }
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ background: "#fff", border: "1px solid #dde0d4", padding: 28, width: "100%", maxWidth: 480, display: "flex", flexDirection: "column", gap: 20 }}>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h2 style={{ fontFamily: "'Inter', sans-serif", fontSize: 16, fontWeight: 700, color: "#1a1f0e", margin: 0 }}>
              {modal.type === "approve" ? "Approve Transfer" : "Reject Transfer"}
            </h2>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: modal.type === "approve" ? "#3d7a2b" : "#dc2626", margin: "4px 0 0" }}>
              {modal.type === "approve" ? "→ Will be forwarded to HO Admin for final approval" : "→ Request will be closed and staff notified"}
            </p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af" }}><IconClose /></button>
        </div>

        <div style={{ background: "#f7f8f4", border: "1px solid #e8ebe3", padding: "12px 16px", display: "flex", flexDirection: "column", gap: 6 }}>
          {[
            ["Request ID",    modal.transfer.referenceNumber ?? `#${modal.transfer.id}`],
            ["Item",          modal.transfer.itemName],
            ["Quantity",      modal.transfer.quantity],
            ["Requesting",    modal.transfer.destinationBranchName],
            ["Supplying",     modal.transfer.sourceBranchName],
            ["Justification", modal.transfer.justification ?? "—"],
          ].map(([label, value]) => (
            <div key={label} style={{ display: "flex", gap: 12 }}>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.1em", minWidth: 110, flexShrink: 0 }}>{label}</span>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#1a1f0e" }}>{value}</span>
            </div>
          ))}
        </div>

        <div>
          <span style={labelStyle}>
            {modal.type === "reject"
              ? <span>Rejection Reason <span style={{ color: "#dc2626" }}>*</span> (required)</span>
              : "Comments (optional — visible to HO Admin)"}
          </span>
          <textarea
            rows={3}
            value={comments}
            onChange={e => setComments(e.target.value)}
            placeholder={modal.type === "reject" ? "Provide a reason for rejection..." : "Add any notes for HO Admin review..."}
            style={{
              width: "100%", border: "1px solid #dde0d4", background: "#f7f8f4",
              padding: "10px 14px", fontSize: 13, fontFamily: "'Inter', sans-serif",
              color: "#1a1f0e", outline: "none", resize: "vertical", boxSizing: "border-box",
              ...(modal.type === "reject" && !comments.trim() ? { borderColor: "#fca5a5" } : {}),
            }}
          />
          {modal.type === "reject" && !comments.trim() && (
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "#dc2626", marginTop: 4, marginBottom: 0 }}>A rejection reason is required.</p>
          )}
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          {modal.type === "approve" ? (
            <button onClick={onApprove} disabled={submitting} style={{ background: submitting ? "#9ca3af" : "#3d7a2b", color: "#fff", border: "none", cursor: submitting ? "wait" : "pointer", padding: "10px 24px", fontSize: 13, fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>
              {submitting ? "Approving..." : "Approve & Forward to HO"}
            </button>
          ) : (
            <button onClick={onReject} disabled={submitting || !comments.trim()} style={{ background: submitting || !comments.trim() ? "#9ca3af" : "#dc2626", color: "#fff", border: "none", cursor: submitting || !comments.trim() ? "not-allowed" : "pointer", padding: "10px 24px", fontSize: 13, fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>
              {submitting ? "Rejecting..." : "Confirm Rejection"}
            </button>
          )}
          <button onClick={onClose} disabled={submitting} style={{ background: "#fff", border: "1px solid #dde0d4", cursor: submitting ? "not-allowed" : "pointer", padding: "10px 20px", fontSize: 13, fontFamily: "'Inter', sans-serif", color: "#6b7260" }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Dispatch Confirm Modal ───────────────────────────────────────────────────
function DispatchModal({ transfer, onClose, onConfirm, submitting }) {
  if (!transfer) return null
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ background: "#fff", border: "1px solid #dde0d4", padding: 28, width: "100%", maxWidth: 460, display: "flex", flexDirection: "column", gap: 20 }}>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h2 style={{ fontFamily: "'Inter', sans-serif", fontSize: 16, fontWeight: 700, color: "#1a1f0e", margin: 0 }}>Confirm Dispatch</h2>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#3d7a2b", margin: "4px 0 0" }}>→ Stock will be marked as In Transit</p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af" }}><IconClose /></button>
        </div>

        <div style={{ background: "#f7f8f4", border: "1px solid #e8ebe3", padding: "12px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            ["Request ID",  transfer.referenceNumber ?? `#${transfer.id}`],
            ["Item",        transfer.itemName],
            ["Item Code",   transfer.itemCode],
            ["Quantity",    transfer.quantity],
            ["Sending To",  transfer.destinationBranchName],
            ["Value",       transfer.totalValue != null
              ? new Intl.NumberFormat("en-RW", { style: "currency", currency: "RWF", maximumFractionDigits: 0 }).format(transfer.totalValue)
              : "—"],
          ].map(([label, value]) => (
            <div key={label} style={{ display: "flex", gap: 12 }}>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.1em", minWidth: 100, flexShrink: 0 }}>{label}</span>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#1a1f0e", fontWeight: 500 }}>{value}</span>
            </div>
          ))}
        </div>

        {transfer.hoComments && (
          <div style={{ background: "#f0f7ed", border: "1px solid #c6dfc0", padding: "10px 14px" }}>
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.14em", color: "#3d7a2b", margin: "0 0 6px" }}>HO Admin Note</p>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#1a1f0e", margin: 0 }}>{transfer.hoComments}</p>
          </div>
        )}

        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#6b7260", margin: 0, lineHeight: 1.6 }}>
          By confirming, you acknowledge that <strong>{transfer.quantity}x {transfer.itemName}</strong> has physically left your branch and is on its way to <strong>{transfer.destinationBranchName}</strong>.
        </p>

        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={() => onConfirm(transfer.id)}
            disabled={submitting}
            style={{ flex: 1, background: submitting ? "#9ca3af" : "#1a1f0e", color: "#fff", border: "none", cursor: submitting ? "wait" : "pointer", padding: "12px 24px", fontSize: 13, fontFamily: "'Inter', sans-serif", fontWeight: 500, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
            onMouseEnter={e => { if (!submitting) e.currentTarget.style.background = "#3d7a2b" }}
            onMouseLeave={e => { if (!submitting) e.currentTarget.style.background = "#1a1f0e" }}
          >
            <IconTruck /> {submitting ? "Dispatching..." : "Confirm Dispatch"}
          </button>
          <button onClick={onClose} disabled={submitting} style={{ background: "#fff", border: "1px solid #dde0d4", cursor: submitting ? "not-allowed" : "pointer", padding: "12px 20px", fontSize: 13, fontFamily: "'Inter', sans-serif", color: "#6b7260" }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ManagerApprovalsPage() {
  const [activeTab, setActiveTab]   = useState("approvals") // "approvals" | "dispatch"

  // Approvals tab state
  const [transfers, setTransfers]   = useState([])
  const [loadingA, setLoadingA]     = useState(true)
  const [modal, setModal]           = useState(null)
  const [comments, setComments]     = useState("")
  const [submittingA, setSubmittingA] = useState(false)

  // Dispatch tab state
  const [dispatches, setDispatches] = useState([])
  const [loadingD, setLoadingD]     = useState(true)
  const [dispatchModal, setDispatchModal] = useState(null)
  const [submittingD, setSubmittingD] = useState(false)

  useEffect(() => { fetchApprovals() }, [])
  useEffect(() => { fetchDispatches() }, [])

  // ── Approvals fetch ──────────────────────────────────────────────────────────
  async function fetchApprovals() {
    try {
      setLoadingA(true)
      const res = await api.get("/approvals/pending/manager?size=100&page=0")
      if (res?.success) setTransfers(res.data?.content ?? [])
      else toast.error(res?.message || "Failed to load approvals")
    } catch (err) {
      toast.error(err.message || "Failed to fetch approvals")
    } finally {
      setLoadingA(false)
    }
  }

  // ── Dispatch fetch ───────────────────────────────────────────────────────────
  async function fetchDispatches() {
    try {
      setLoadingD(true)
      const res = await api.get("/approvals/pending/dispatch?size=100&page=0")
      if (res?.success) setDispatches(res.data?.content ?? [])
      else toast.error(res?.message || "Failed to load dispatch queue")
    } catch (err) {
      toast.error(err.message || "Failed to fetch dispatch queue")
    } finally {
      setLoadingD(false)
    }
  }

  function openModal(type, transfer) { setModal({ type, transfer }); setComments("") }
  function closeModal() { if (submittingA) return; setModal(null); setComments("") }

  // ── Approve ──────────────────────────────────────────────────────────────────
  async function handleApprove() {
    if (!modal) return
    try {
      setSubmittingA(true)
      const res = await api.post(`/approvals/${modal.transfer.id}/manager-approve`, { approved: true, comments: comments.trim() || null })
      if (res?.success) {
        toast.success("Approved — forwarded to HO Admin for final sign-off")
        setTransfers(prev => prev.filter(t => t.id !== modal.transfer.id))
        closeModal()
      } else toast.error(res?.message || "Approval failed")
    } catch (err) {
      toast.error(err.message || "Approval failed")
    } finally {
      setSubmittingA(false)
    }
  }

  // ── Reject ───────────────────────────────────────────────────────────────────
  async function handleReject() {
    if (!modal) return
    if (!comments.trim()) { toast.error("Rejection reason is required"); return }
    try {
      setSubmittingA(true)
      const res = await api.post(`/approvals/${modal.transfer.id}/manager-reject`, { approved: false, comments: comments.trim() })
      if (res?.success) {
        toast.success("Transfer rejected — staff will be notified")
        setTransfers(prev => prev.filter(t => t.id !== modal.transfer.id))
        closeModal()
      } else toast.error(res?.message || "Rejection failed")
    } catch (err) {
      toast.error(err.message || "Rejection failed")
    } finally {
      setSubmittingA(false)
    }
  }

  // ── Dispatch ─────────────────────────────────────────────────────────────────
  async function handleDispatch(id) {
    try {
      setSubmittingD(true)
      const res = await api.post(`/approvals/${id}/dispatch`)
      if (res?.success) {
        toast.success("Stock dispatched — marked as In Transit")
        setDispatches(prev => prev.filter(t => t.id !== id))
        setDispatchModal(null)
      } else toast.error(res?.message || "Dispatch failed")
    } catch (err) {
      toast.error(err.message || "Dispatch failed")
    } finally {
      setSubmittingD(false)
    }
  }

  // ── Tab bar ──────────────────────────────────────────────────────────────────
  const tabStyle = (active) => ({
    padding: "10px 20px",
    fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: active ? 600 : 400,
    color: active ? "#1a1f0e" : "#6b7260",
    background: "none", border: "none", borderBottom: `2px solid ${active ? "#1a1f0e" : "transparent"}`,
    cursor: "pointer", transition: "all 0.15s",
  })

  const badgeStyle = (count) => ({
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    minWidth: 18, height: 18, borderRadius: 9,
    background: count > 0 ? "#dc2626" : "#dde0d4",
    color: "#fff", fontSize: 10, fontWeight: 700,
    fontFamily: "'DM Mono', monospace", marginLeft: 6, padding: "0 5px",
  })

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      <PageHeader
        title="Approvals"
        subtitle="Manage your branch's incoming requests and outgoing dispatch queue."
      />

      {/* ── Tabs ── */}
      <div style={{ borderBottom: "1px solid #dde0d4", display: "flex", gap: 0 }}>
        <button style={tabStyle(activeTab === "approvals")} onClick={() => setActiveTab("approvals")}>
          Pending Approvals
          <span style={badgeStyle(transfers.length)}>{transfers.length}</span>
        </button>
        <button style={tabStyle(activeTab === "dispatch")} onClick={() => setActiveTab("dispatch")}>
          Dispatch Queue
          <span style={badgeStyle(dispatches.length)}>{dispatches.length}</span>
        </button>
      </div>

      {/* ── Flow Banner ── */}
      <FlowBanner activeStep={activeTab === "approvals" ? "approve" : "dispatch"} />

      {/* ══ APPROVALS TAB ══════════════════════════════════════════════════════ */}
      {activeTab === "approvals" && (
        <div style={{ background: "#fff", border: "1px solid #dde0d4", overflow: "hidden" }}>
          {loadingA ? <LoadingSpinner label="Loading approvals..." /> : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#f7f8f4", borderBottom: "1px solid #e8ebe3" }}>
                  {["Request ID", "Item", "Requesting Branch", "Supplying Branch", "Qty", "Value", "Justification", "Requested By", "Date", "Action"].map(h => (
                    <th key={h} style={{ textAlign: "left", padding: "10px 20px", fontFamily: "'DM Mono', monospace", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "#9ca3af", fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {transfers.length === 0 ? (
                  <tr><td colSpan={10} style={{ padding: "48px 0", textAlign: "center", fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#9ca3af" }}>No pending approvals from your branch staff.</td></tr>
                ) : transfers.map((t, idx) => (
                  <tr key={t.id} style={{ borderBottom: idx < transfers.length - 1 ? "1px solid #f0f1ec" : "none" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#fafbf8"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <td style={{ padding: "12px 20px", fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#6b7260" }}>{t.referenceNumber ?? `#${t.id}`}</td>
                    <td style={{ padding: "12px 20px", fontFamily: "'Inter', sans-serif", fontWeight: 500, color: "#1a1f0e" }}>{t.itemName}</td>
                    <td style={{ padding: "12px 20px" }}>
                      <span style={{ fontFamily: "'Inter', sans-serif", color: "#1a1f0e", fontSize: 13 }}>{t.destinationBranchName}</span>
                      <span style={{ display: "block", fontFamily: "'DM Mono', monospace", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", color: "#3d7a2b", marginTop: 2 }}>needs stock</span>
                    </td>
                    <td style={{ padding: "12px 20px" }}>
                      <span style={{ fontFamily: "'Inter', sans-serif", color: "#6b7260", fontSize: 13 }}>{t.sourceBranchName}</span>
                      <span style={{ display: "block", fontFamily: "'DM Mono', monospace", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", color: "#9ca3af", marginTop: 2 }}>will supply</span>
                    </td>
                    <td style={{ padding: "12px 20px", fontFamily: "'Inter', sans-serif", fontWeight: 500, color: "#1a1f0e" }}>{t.quantity}</td>
                    <td style={{ padding: "12px 20px", fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#6b7260" }}>
                      {t.totalValue != null ? new Intl.NumberFormat("en-RW", { style: "currency", currency: "RWF", maximumFractionDigits: 0 }).format(t.totalValue) : "—"}
                    </td>
                    <td style={{ padding: "12px 20px", fontFamily: "'Inter', sans-serif", color: "#6b7260", maxWidth: 160 }}>
                      <span style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{t.justification ?? "—"}</span>
                    </td>
                    <td style={{ padding: "12px 20px", fontFamily: "'Inter', sans-serif", color: "#6b7260" }}>{t.requestedByEmail ?? "—"}</td>
                    <td style={{ padding: "12px 20px", fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#9ca3af" }}>{t.requestedAt ? new Date(t.requestedAt).toLocaleDateString() : "—"}</td>
                    <td style={{ padding: "12px 20px" }}>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={() => openModal("approve", t)} style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "#f0f7ed", color: "#3d7a2b", border: "1px solid #e1eedb", cursor: "pointer", fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 500, padding: "4px 10px" }}>
                          <IconCheck /> Approve
                        </button>
                        <button onClick={() => openModal("reject", t)} style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "#fef2f2", color: "#dc2626", border: "1px solid #fee2e2", cursor: "pointer", fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 500, padding: "4px 10px" }}>
                          <IconX /> Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ══ DISPATCH TAB ═══════════════════════════════════════════════════════ */}
      {activeTab === "dispatch" && (
        <div style={{ background: "#fff", border: "1px solid #dde0d4", overflow: "hidden" }}>
          {loadingD ? <LoadingSpinner label="Loading dispatch queue..." /> : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#f7f8f4", borderBottom: "1px solid #e8ebe3" }}>
                  {["Request ID", "Item", "Sending To", "Qty", "Value", "Manager Note", "HO Note", "Date", "Action"].map(h => (
                    <th key={h} style={{ textAlign: "left", padding: "10px 20px", fontFamily: "'DM Mono', monospace", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "#9ca3af", fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dispatches.length === 0 ? (
                  <tr><td colSpan={9} style={{ padding: "48px 0", textAlign: "center", fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#9ca3af" }}>No transfers awaiting dispatch from your branch.</td></tr>
                ) : dispatches.map((t, idx) => (
                  <tr key={t.id} style={{ borderBottom: idx < dispatches.length - 1 ? "1px solid #f0f1ec" : "none" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#fafbf8"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <td style={{ padding: "12px 20px", fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#6b7260" }}>{t.referenceNumber ?? `#${t.id}`}</td>
                    <td style={{ padding: "12px 20px" }}>
                      <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500, color: "#1a1f0e", margin: "0 0 2px" }}>{t.itemName}</p>
                      <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, textTransform: "uppercase", color: "#9ca3af" }}>{t.itemCode}</span>
                    </td>
                    <td style={{ padding: "12px 20px" }}>
                      <p style={{ fontFamily: "'Inter', sans-serif", color: "#1a1f0e", margin: "0 0 2px" }}>{t.destinationBranchName}</p>
                      <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", color: "#3d7a2b" }}>receiving</span>
                    </td>
                    <td style={{ padding: "12px 20px", fontFamily: "'Inter', sans-serif", fontWeight: 600, color: "#1a1f0e" }}>{t.quantity}</td>
                    <td style={{ padding: "12px 20px", fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#6b7260" }}>
                      {t.totalValue != null ? new Intl.NumberFormat("en-RW", { style: "currency", currency: "RWF", maximumFractionDigits: 0 }).format(t.totalValue) : "—"}
                    </td>
                    <td style={{ padding: "12px 20px", fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#6b7260", maxWidth: 140 }}>
                      <span style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{t.managerComments ?? "—"}</span>
                    </td>
                    <td style={{ padding: "12px 20px", fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#6b7260", maxWidth: 140 }}>
                      <span style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{t.hoComments ?? "—"}</span>
                    </td>
                    <td style={{ padding: "12px 20px", fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#9ca3af" }}>{t.requestedAt ? new Date(t.requestedAt).toLocaleDateString() : "—"}</td>
                    <td style={{ padding: "12px 20px" }}>
                      <button
                        onClick={() => setDispatchModal(t)}
                        style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#1a1f0e", color: "#fff", border: "none", cursor: "pointer", fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 500, padding: "6px 14px", transition: "background 0.13s" }}
                        onMouseEnter={e => e.currentTarget.style.background = "#3d7a2b"}
                        onMouseLeave={e => e.currentTarget.style.background = "#1a1f0e"}
                      >
                        <IconTruck /> Dispatch
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ── Modals ── */}
      <ApprovalModal
        modal={modal}
        comments={comments}
        setComments={setComments}
        onApprove={handleApprove}
        onReject={handleReject}
        onClose={closeModal}
        submitting={submittingA}
      />
      <DispatchModal
        transfer={dispatchModal}
        onClose={() => setDispatchModal(null)}
        onConfirm={handleDispatch}
        submitting={submittingD}
      />

    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function LoadingSpinner({ label }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "48px 0" }}>
      <div style={{ width: 24, height: 24, border: "2px solid #dde0d4", borderTopColor: "#3d7a2b", borderRadius: "50%", animation: "sb-spin 0.7s linear infinite" }} />
      <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#6b7260", textTransform: "uppercase", letterSpacing: "0.1em" }}>{label}</span>
      <style>{`@keyframes sb-spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}