"use client"
import { useState, useEffect, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { api } from "@/lib/api/client"
import toast from "react-hot-toast"
import PageHeader from "@/components/ui/PageHeader"

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

function getRequestedBy(t) {
  return t.requestedByName || t.requestedByEmail || t.requesterName || t.requesterEmail || t.requestedBy || null
}

function FlowBanner({ activeStep }) {
  const steps = [
    { label: "Staff",      sub: "submits",     key: null },
    { label: "Manager",    sub: "your review", key: "approve" },
    { label: "HO Admin",   sub: "final ok",    key: null },
    { label: "Dispatch",   sub: "ship it",     key: "dispatch" },
    { label: "In Transit", sub: "moving",      key: null },
  ]
  return (
    <div style={{ background: "#f7f8f4", border: "1px solid #dde0d4", padding: "14px 20px", overflowX: "auto" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, minWidth: 420 }}>
        {steps.map((s, i) => {
          const active = s.key === activeStep
          const done   = activeStep === "dispatch" && i < 3
          return (
            <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: "50%",
                  background: done ? "#3d7a2b" : active ? "#1a1f0e" : "#f7f8f4",
                  border: `2px solid ${done || active ? "#3d7a2b" : "#dde0d4"}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: done || active ? "#fff" : "#9ca3af",
                  fontSize: 11, fontWeight: 700, fontFamily: "'DM Mono', monospace",
                }}>
                  {done ? "✓" : active ? "●" : "○"}
                </div>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: active ? 600 : 400, color: active ? "#1a1f0e" : done ? "#3d7a2b" : "#9ca3af", whiteSpace: "nowrap" }}>{s.label}</span>
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.08em", color: active ? "#3d7a2b" : "#b8bead", whiteSpace: "nowrap" }}>{s.sub}</span>
              </div>
              {i < steps.length - 1 && <div style={{ color: "#dde0d4", flexShrink: 0, paddingBottom: 16 }}><IconArrow /></div>}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ApprovalModal({ modal, comments, setComments, onApprove, onReject, onClose, submitting }) {
  if (!modal) return null
  const t = modal.transfer
  const requestedBy = getRequestedBy(t)

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: "#fff", border: "1px solid #dde0d4", padding: 24, width: "100%", maxWidth: 500, display: "flex", flexDirection: "column", gap: 18, maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <div>
            <h2 style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, fontWeight: 700, color: "#1a1f0e", margin: 0 }}>
              {modal.type === "approve" ? "Approve Transfer" : "Reject Transfer"}
            </h2>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: modal.type === "approve" ? "#3d7a2b" : "#dc2626", margin: "3px 0 0" }}>
              {modal.type === "approve" ? "→ Forwarded to HO Admin for final sign-off" : "→ Request closed, staff notified"}
            </p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", flexShrink: 0 }}><IconClose /></button>
        </div>

        <div style={{ background: "#f7f8f4", border: "1px solid #e8ebe3", padding: "12px 14px", display: "flex", flexDirection: "column", gap: 7 }}>
          {[
            ["Request",       t.referenceNumber ?? `#${t.id}`],
            ["Item",          t.itemName],
            ["Quantity",      t.quantity],
            ["Requesting",    t.destinationBranchName],
            ["Supplying",     t.sourceBranchName],
            ["Requested by",  requestedBy ?? "—"],
            ["Justification", t.justification || "None provided"],
            ["Value",         t.totalValue != null
              ? new Intl.NumberFormat("en-RW", { style: "currency", currency: "RWF", maximumFractionDigits: 0 }).format(t.totalValue)
              : "—"],
          ].map(([label, value]) => (
            <div key={label} style={{ display: "flex", gap: 10 }}>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.1em", minWidth: 100, flexShrink: 0 }}>{label}</span>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#1a1f0e", wordBreak: "break-word" }}>{value}</span>
            </div>
          ))}
        </div>

        <div>
          <label style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.12em", color: "#9ca3af", display: "block", marginBottom: 5 }}>
            {modal.type === "reject"
              ? <span>Rejection reason <span style={{ color: "#dc2626" }}>*</span></span>
              : "Comments (optional — visible to HO Admin)"}
          </label>
          <textarea rows={3} value={comments} onChange={e => setComments(e.target.value)}
            placeholder={modal.type === "reject" ? "Provide a reason for rejection..." : "Add notes for HO Admin..."}
            style={{
              width: "100%", border: "1px solid #dde0d4", background: "#f7f8f4",
              padding: "9px 12px", fontSize: 13, fontFamily: "'Inter', sans-serif",
              color: "#1a1f0e", outline: "none", resize: "vertical", boxSizing: "border-box",
              ...(modal.type === "reject" && !comments.trim() ? { borderColor: "#fca5a5" } : {}),
            }}
          />
          {modal.type === "reject" && !comments.trim() && (
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "#dc2626", marginTop: 3, marginBottom: 0 }}>A rejection reason is required.</p>
          )}
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          {modal.type === "approve" ? (
            <button onClick={onApprove} disabled={submitting} style={{ background: submitting ? "#9ca3af" : "#3d7a2b", color: "#fff", border: "none", cursor: submitting ? "wait" : "pointer", padding: "9px 20px", fontSize: 13, fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>
              {submitting ? "Approving..." : "Approve & Forward"}
            </button>
          ) : (
            <button onClick={onReject} disabled={submitting || !comments.trim()} style={{ background: submitting || !comments.trim() ? "#9ca3af" : "#dc2626", color: "#fff", border: "none", cursor: submitting || !comments.trim() ? "not-allowed" : "pointer", padding: "9px 20px", fontSize: 13, fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>
              {submitting ? "Rejecting..." : "Confirm Rejection"}
            </button>
          )}
          <button onClick={onClose} disabled={submitting} style={{ background: "#fff", border: "1px solid #dde0d4", cursor: submitting ? "not-allowed" : "pointer", padding: "9px 16px", fontSize: 13, fontFamily: "'Inter', sans-serif", color: "#6b7260" }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

function DispatchModal({ transfer, onClose, onConfirm, submitting }) {
  if (!transfer) return null
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: "#fff", border: "1px solid #dde0d4", padding: 24, width: "100%", maxWidth: 440, display: "flex", flexDirection: "column", gap: 18 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h2 style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, fontWeight: 700, color: "#1a1f0e", margin: 0 }}>Confirm Dispatch</h2>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#3d7a2b", margin: "3px 0 0" }}>→ Stock will be marked as In Transit</p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af" }}><IconClose /></button>
        </div>
        <div style={{ background: "#f7f8f4", border: "1px solid #e8ebe3", padding: "12px 14px", display: "flex", flexDirection: "column", gap: 7 }}>
          {[
            ["Request",    transfer.referenceNumber ?? `#${transfer.id}`],
            ["Item",       transfer.itemName],
            ["Item Code",  transfer.itemCode ?? "—"],
            ["Quantity",   transfer.quantity],
            ["Sending To", transfer.destinationBranchName],
            ["Value",      transfer.totalValue != null
              ? new Intl.NumberFormat("en-RW", { style: "currency", currency: "RWF", maximumFractionDigits: 0 }).format(transfer.totalValue)
              : "—"],
          ].map(([label, value]) => (
            <div key={label} style={{ display: "flex", gap: 10 }}>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.1em", minWidth: 90, flexShrink: 0 }}>{label}</span>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#1a1f0e", fontWeight: 500 }}>{value}</span>
            </div>
          ))}
        </div>
        {transfer.hoComments && (
          <div style={{ background: "#f0f7ed", border: "1px solid #c6dfc0", padding: "10px 14px" }}>
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.14em", color: "#3d7a2b", margin: "0 0 5px" }}>HO Admin Note</p>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#1a1f0e", margin: 0 }}>{transfer.hoComments}</p>
          </div>
        )}
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#6b7260", margin: 0, lineHeight: 1.6 }}>
          Confirm that <strong>{transfer.quantity}x {transfer.itemName}</strong> has physically left your branch for <strong>{transfer.destinationBranchName}</strong>.
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => onConfirm(transfer.id)} disabled={submitting}
            style={{ flex: 1, background: submitting ? "#9ca3af" : "#1a1f0e", color: "#fff", border: "none", cursor: submitting ? "wait" : "pointer", padding: "10px 0", fontSize: 13, fontFamily: "'Inter', sans-serif", fontWeight: 500, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
            onMouseEnter={e => { if (!submitting) e.currentTarget.style.background = "#3d7a2b" }}
            onMouseLeave={e => { if (!submitting) e.currentTarget.style.background = "#1a1f0e" }}>
            <IconTruck /> {submitting ? "Dispatching..." : "Confirm Dispatch"}
          </button>
          <button onClick={onClose} disabled={submitting} style={{ background: "#fff", border: "1px solid #dde0d4", cursor: submitting ? "not-allowed" : "pointer", padding: "10px 16px", fontSize: 13, fontFamily: "'Inter', sans-serif", color: "#6b7260" }}>Cancel</button>
        </div>
      </div>
    </div>
  )
}

export default function ManagerApprovalsPage() {
  const searchParams = useSearchParams()
  const reviewId = searchParams.get("id")

  const [activeTab,     setActiveTab]     = useState("approvals")
  const [transfers,     setTransfers]     = useState([])
  const [loadingA,      setLoadingA]      = useState(true)
  const [modal,         setModal]         = useState(null)
  const [comments,      setComments]      = useState("")
  const [submittingA,   setSubmittingA]   = useState(false)
  const [dispatches,    setDispatches]    = useState([])
  const [loadingD,      setLoadingD]      = useState(true)
  const [dispatchModal, setDispatchModal] = useState(null)
  const [submittingD,   setSubmittingD]   = useState(false)

  const fetchApprovals = useCallback(async () => {
    try {
      setLoadingA(true)
      const res = await api.get("/approvals/pending/manager?size=100&page=0")
      if (res?.success) {
        const list = res.data?.content ?? []
        setTransfers(list)
        if (reviewId) {
          const target = list.find(t => String(t.id) === String(reviewId))
          if (target) setModal({ type: "approve", transfer: target })
          else toast.error(`Transfer #${reviewId} not found or already reviewed.`)
        }
      } else toast.error(res?.message || "Failed to load approvals")
    } catch (err) {
      toast.error(err.message || "Failed to fetch approvals")
    } finally { setLoadingA(false) }
  }, [reviewId])

  const fetchDispatches = useCallback(async () => {
    try {
      setLoadingD(true)
      const res = await api.get("/approvals/pending/dispatch?size=100&page=0")
      if (res?.success) setDispatches(res.data?.content ?? [])
      else toast.error(res?.message || "Failed to load dispatch queue")
    } catch (err) {
      toast.error(err.message || "Failed to fetch dispatch queue")
    } finally { setLoadingD(false) }
  }, [])

  useEffect(() => { fetchApprovals() }, [fetchApprovals])
  useEffect(() => { fetchDispatches() }, [fetchDispatches])

  function openModal(type, transfer) { setModal({ type, transfer }); setComments("") }
  function closeModal() { if (submittingA) return; setModal(null); setComments("") }

  async function handleApprove() {
    if (!modal) return
    try {
      setSubmittingA(true)
      const res = await api.post(`/approvals/${modal.transfer.id}/manager-approve`, { approved: true, comments: comments.trim() || null })
      if (res?.success) {
        toast.success("Approved — forwarded to HO Admin")
        setTransfers(prev => prev.filter(t => t.id !== modal.transfer.id))
        closeModal()
      } else toast.error(res?.message || "Approval failed")
    } catch (err) { toast.error(err.message || "Approval failed") }
    finally { setSubmittingA(false) }
  }

  async function handleReject() {
    if (!modal) return
    if (!comments.trim()) { toast.error("Rejection reason is required"); return }
    try {
      setSubmittingA(true)
      const res = await api.post(`/approvals/${modal.transfer.id}/manager-reject`, { approved: false, comments: comments.trim() })
      if (res?.success) {
        toast.success("Transfer rejected — staff notified")
        setTransfers(prev => prev.filter(t => t.id !== modal.transfer.id))
        closeModal()
      } else toast.error(res?.message || "Rejection failed")
    } catch (err) { toast.error(err.message || "Rejection failed") }
    finally { setSubmittingA(false) }
  }

  async function handleDispatch(id) {
    try {
      setSubmittingD(true)
      const res = await api.post(`/approvals/${id}/dispatch`)
      if (res?.success) {
        toast.success("Stock dispatched — marked as In Transit")
        setDispatches(prev => prev.filter(t => t.id !== id))
        setDispatchModal(null)
      } else toast.error(res?.message || "Dispatch failed")
    } catch (err) { toast.error(err.message || "Dispatch failed") }
    finally { setSubmittingD(false) }
  }

  const tabStyle = (active) => ({
    padding: "9px 18px",
    fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: active ? 600 : 400,
    color: active ? "#1a1f0e" : "#6b7260",
    background: "none", border: "none",
    borderBottom: `2px solid ${active ? "#1a1f0e" : "transparent"}`,
    cursor: "pointer",
  })

  const countBadge = (count) => ({
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    minWidth: 18, height: 18, borderRadius: 9,
    background: count > 0 ? "#dc2626" : "#dde0d4",
    color: "#fff", fontSize: 10, fontWeight: 700,
    fontFamily: "'DM Mono', monospace", marginLeft: 6, padding: "0 4px",
  })

  return (
    <>
      <style>{`
        .sb-table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }
        .sb-table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .sb-table th {
          text-align: left; padding: 9px 14px; white-space: nowrap;
          font-family: 'DM Mono', monospace; font-size: 10px;
          text-transform: uppercase; letter-spacing: 0.1em;
          color: #9ca3af; font-weight: 500;
          background: #f7f8f4; border-bottom: 1px solid #e8ebe3;
        }
        .sb-table td { padding: 11px 14px; vertical-align: top; }
        .sb-table tbody tr { border-bottom: 1px solid #f0f1ec; transition: background 0.1s; }
        .sb-table tbody tr:last-child { border-bottom: none; }
        .sb-table tbody tr:hover { background: #fafbf8; }
        .sb-table tbody tr.sb-highlighted { background: #f0f7ed; outline: 2px solid #3d7a2b; outline-offset: -2px; }
        .sb-approvals-table { min-width: 900px; }
        .sb-dispatch-table  { min-width: 720px; }
        .sb-btn-approve {
          display: inline-flex; align-items: center; gap: 4px;
          background: #f0f7ed; color: #3d7a2b; border: 1px solid #e1eedb;
          cursor: pointer; font-family: 'Inter', sans-serif; font-size: 12px;
          font-weight: 500; padding: 4px 10px; border-radius: 4px;
          white-space: nowrap; transition: background 0.1s;
        }
        .sb-btn-approve:hover { background: #d8f0d0; }
        .sb-btn-reject {
          display: inline-flex; align-items: center; gap: 4px;
          background: #fef2f2; color: #dc2626; border: 1px solid #fee2e2;
          cursor: pointer; font-family: 'Inter', sans-serif; font-size: 12px;
          font-weight: 500; padding: 4px 10px; border-radius: 4px;
          white-space: nowrap; transition: background 0.1s;
        }
        .sb-btn-reject:hover { background: #fde8e8; }
        .sb-btn-dispatch {
          display: inline-flex; align-items: center; gap: 6px;
          background: #1a1f0e; color: #fff; border: none;
          cursor: pointer; font-family: 'Inter', sans-serif; font-size: 12px;
          font-weight: 500; padding: 6px 12px; border-radius: 4px;
          white-space: nowrap; transition: background 0.13s;
        }
        .sb-btn-dispatch:hover { background: #3d7a2b; }
        .sb-clamp { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .sb-mono { font-family: 'DM Mono', monospace; }
        .sb-muted { color: #9ca3af; font-style: italic; }
      `}</style>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

        <PageHeader
          title="Approvals"
          subtitle="Manage incoming transfer requests and your outgoing dispatch queue."
        />

        <div style={{ borderBottom: "1px solid #dde0d4", display: "flex" }}>
          <button style={tabStyle(activeTab === "approvals")} onClick={() => setActiveTab("approvals")}>
            Pending Approvals
            <span style={countBadge(transfers.length)}>{transfers.length}</span>
          </button>
          <button style={tabStyle(activeTab === "dispatch")} onClick={() => setActiveTab("dispatch")}>
            Dispatch Queue
            <span style={countBadge(dispatches.length)}>{dispatches.length}</span>
          </button>
        </div>

        <FlowBanner activeStep={activeTab === "approvals" ? "approve" : "dispatch"} />

        {activeTab === "approvals" && (
          <div style={{ background: "#fff", border: "1px solid #dde0d4" }}>
            {loadingA ? <LoadingSpinner label="Loading approvals..." /> : (
              <div className="sb-table-wrap">
                <table className="sb-table sb-approvals-table">
                  <thead>
                    <tr>
                      <th style={{ width: 80  }}>ID</th>
                      <th style={{ width: 160 }}>Item</th>
                      <th style={{ width: 130 }}>Requesting Branch</th>
                      <th style={{ width: 130 }}>Supplying Branch</th>
                      <th style={{ width: 55  }}>Qty</th>
                      <th style={{ width: 110 }}>Value</th>
                      <th style={{ width: 190 }}>Justification</th>
                      <th style={{ width: 150 }}>Requested By</th>
                      <th style={{ width: 85  }}>Date</th>
                      <th style={{ width: 150 }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transfers.length === 0 ? (
                      <tr><td colSpan={10} style={{ padding: "48px 0", textAlign: "center", fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#9ca3af" }}>
                        No pending approvals.
                      </td></tr>
                    ) : transfers.map(t => {
                      const requestedBy = getRequestedBy(t)
                      const isHighlighted = String(t.id) === String(reviewId)
                      return (
                        <tr key={t.id} className={isHighlighted ? "sb-highlighted" : ""}>
                          <td className="sb-mono" style={{ fontSize: 11, color: "#6b7260", whiteSpace: "nowrap" }}>
                            {t.referenceNumber ?? `#${t.id}`}
                          </td>
                          <td>
                            <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500, color: "#1a1f0e" }}>{t.itemName}</span>
                            {t.itemCode && <span className="sb-mono" style={{ display: "block", fontSize: 10, color: "#9ca3af", marginTop: 1 }}>{t.itemCode}</span>}
                          </td>
                          <td>
                            <span style={{ fontFamily: "'Inter', sans-serif", color: "#1a1f0e" }}>{t.destinationBranchName}</span>
                            <span className="sb-mono" style={{ display: "block", fontSize: 9, textTransform: "uppercase", color: "#3d7a2b", marginTop: 2 }}>needs stock</span>
                          </td>
                          <td>
                            <span style={{ fontFamily: "'Inter', sans-serif", color: "#6b7260" }}>{t.sourceBranchName}</span>
                            <span className="sb-mono" style={{ display: "block", fontSize: 9, textTransform: "uppercase", color: "#9ca3af", marginTop: 2 }}>will supply</span>
                          </td>
                          <td style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, color: "#1a1f0e", whiteSpace: "nowrap" }}>{t.quantity}</td>
                          <td className="sb-mono" style={{ fontSize: 12, color: "#6b7260", whiteSpace: "nowrap" }}>
                            {t.totalValue != null
                              ? new Intl.NumberFormat("en-RW", { style: "currency", currency: "RWF", maximumFractionDigits: 0 }).format(t.totalValue)
                              : "—"}
                          </td>
                          <td style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#6b7260" }}>
                            {t.justification
                              ? <span className="sb-clamp">{t.justification}</span>
                              : <span className="sb-muted" style={{ fontSize: 12 }}>None provided</span>}
                          </td>
                          <td style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#1a1f0e" }}>
                            {requestedBy
                              ? requestedBy
                              : <span className="sb-muted" style={{ fontSize: 12 }}>—</span>}
                          </td>
                          <td className="sb-mono" style={{ fontSize: 11, color: "#9ca3af", whiteSpace: "nowrap" }}>
                            {t.requestedAt ? new Date(t.requestedAt).toLocaleDateString() : "—"}
                          </td>
                          <td style={{ whiteSpace: "nowrap" }}>
                            <div style={{ display: "flex", gap: 6 }}>
                              <button className="sb-btn-approve" onClick={() => openModal("approve", t)}><IconCheck /> Approve</button>
                              <button className="sb-btn-reject"  onClick={() => openModal("reject",  t)}><IconX />     Reject</button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === "dispatch" && (
          <div style={{ background: "#fff", border: "1px solid #dde0d4" }}>
            {loadingD ? <LoadingSpinner label="Loading dispatch queue..." /> : (
              <div className="sb-table-wrap">
                <table className="sb-table sb-dispatch-table">
                  <thead>
                    <tr>
                      <th style={{ width: 80  }}>ID</th>
                      <th style={{ width: 160 }}>Item</th>
                      <th style={{ width: 140 }}>Sending To</th>
                      <th style={{ width: 55  }}>Qty</th>
                      <th style={{ width: 110 }}>Value</th>
                      <th style={{ width: 170 }}>Manager Note</th>
                      <th style={{ width: 170 }}>HO Note</th>
                      <th style={{ width: 85  }}>Date</th>
                      <th style={{ width: 110 }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dispatches.length === 0 ? (
                      <tr><td colSpan={9} style={{ padding: "48px 0", textAlign: "center", fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#9ca3af" }}>
                        No transfers awaiting dispatch from your branch.
                      </td></tr>
                    ) : dispatches.map(t => (
                      <tr key={t.id}>
                        <td className="sb-mono" style={{ fontSize: 11, color: "#6b7260", whiteSpace: "nowrap" }}>{t.referenceNumber ?? `#${t.id}`}</td>
                        <td>
                          <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500, color: "#1a1f0e", display: "block" }}>{t.itemName}</span>
                          {t.itemCode && <span className="sb-mono" style={{ fontSize: 10, color: "#9ca3af" }}>{t.itemCode}</span>}
                        </td>
                        <td>
                          <span style={{ fontFamily: "'Inter', sans-serif", color: "#1a1f0e" }}>{t.destinationBranchName}</span>
                          <span className="sb-mono" style={{ display: "block", fontSize: 9, textTransform: "uppercase", color: "#3d7a2b", marginTop: 2 }}>receiving</span>
                        </td>
                        <td style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, color: "#1a1f0e", whiteSpace: "nowrap" }}>{t.quantity}</td>
                        <td className="sb-mono" style={{ fontSize: 12, color: "#6b7260", whiteSpace: "nowrap" }}>
                          {t.totalValue != null
                            ? new Intl.NumberFormat("en-RW", { style: "currency", currency: "RWF", maximumFractionDigits: 0 }).format(t.totalValue)
                            : "—"}
                        </td>
                        <td style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#6b7260" }}>
                          {t.managerComments ? <span className="sb-clamp">{t.managerComments}</span> : <span className="sb-muted" style={{ fontSize: 12 }}>—</span>}
                        </td>
                        <td style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#6b7260" }}>
                          {t.hoComments ? <span className="sb-clamp">{t.hoComments}</span> : <span className="sb-muted" style={{ fontSize: 12 }}>—</span>}
                        </td>
                        <td className="sb-mono" style={{ fontSize: 11, color: "#9ca3af", whiteSpace: "nowrap" }}>
                          {t.requestedAt ? new Date(t.requestedAt).toLocaleDateString() : "—"}
                        </td>
                        <td>
                          <button className="sb-btn-dispatch" onClick={() => setDispatchModal(t)}>
                            <IconTruck /> Dispatch
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        <ApprovalModal modal={modal} comments={comments} setComments={setComments}
          onApprove={handleApprove} onReject={handleReject} onClose={closeModal} submitting={submittingA} />
        <DispatchModal transfer={dispatchModal} onClose={() => setDispatchModal(null)}
          onConfirm={handleDispatch} submitting={submittingD} />

      </div>
    </>
  )
}

function LoadingSpinner({ label }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: "48px 0" }}>
      <div style={{ width: 22, height: 22, border: "2px solid #dde0d4", borderTopColor: "#3d7a2b", borderRadius: "50%", animation: "sb-spin 0.7s linear infinite" }} />
      <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#6b7260", textTransform: "uppercase", letterSpacing: "0.1em" }}>{label}</span>
      <style>{`@keyframes sb-spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
