"use client"
import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api/client"
import toast from "react-hot-toast"
import PageHeader from "@/components/ui/PageHeader"

// ─── Icons ────────────────────────────────────────────────────────────────────
const IconCheck = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)
const IconX = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)
const IconArrowLeft = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
  </svg>
)
const IconClock = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
)
const IconArrow = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
)

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getRequestedBy(t) {
  return t?.requestedByName || t?.requestedByEmail || t?.requesterName || t?.requesterEmail || null
}

function fmt(val) {
  if (val == null) return "—"
  return new Intl.NumberFormat("en-RW", {
    style: "currency", currency: "RWF", maximumFractionDigits: 0,
  }).format(val)
}

function fmtDate(val) {
  if (!val) return "—"
  return new Date(val).toLocaleString("en-RW", {
    dateStyle: "medium", timeStyle: "short",
  })
}

// ─── Flow steps ───────────────────────────────────────────────────────────────
function FlowBanner() {
  const steps = [
    { label: "Staff",      sub: "submitted" },
    { label: "Manager",    sub: "your review", active: true },
    { label: "HO Admin",   sub: "final ok" },
    { label: "Dispatch",   sub: "ship it" },
    { label: "In Transit", sub: "moving" },
  ]
  return (
    <div style={{ background: "#f7f8f4", border: "1px solid #dde0d4", padding: "14px 20px", overflowX: "auto" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, minWidth: 400 }}>
        {steps.map((s, i) => (
          <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
              <div style={{
                width: 28, height: 28, borderRadius: "50%",
                background: s.active ? "#1a1f0e" : "#f7f8f4",
                border: `2px solid ${s.active ? "#3d7a2b" : "#dde0d4"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: s.active ? "#fff" : "#9ca3af",
                fontSize: 11, fontWeight: 700, fontFamily: "'DM Mono', monospace",
              }}>
                {s.active ? "●" : "○"}
              </div>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: s.active ? 600 : 400, color: s.active ? "#1a1f0e" : "#9ca3af", whiteSpace: "nowrap" }}>{s.label}</span>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, textTransform: "uppercase", color: s.active ? "#3d7a2b" : "#b8bead", whiteSpace: "nowrap" }}>{s.sub}</span>
            </div>
            {i < steps.length - 1 && <div style={{ color: "#dde0d4", flexShrink: 0, paddingBottom: 16 }}><IconArrow /></div>}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Detail row ───────────────────────────────────────────────────────────────
function Row({ label, value, highlight }) {
  return (
    <div style={{
      display: "flex", gap: 16, padding: "10px 0",
      borderBottom: "1px solid #f0f1ec",
      alignItems: "flex-start",
    }}>
      <span style={{
        fontFamily: "'DM Mono', monospace", fontSize: 10,
        textTransform: "uppercase", letterSpacing: "0.1em",
        color: "#9ca3af", minWidth: 130, flexShrink: 0, paddingTop: 1,
      }}>{label}</span>
      <span style={{
        fontFamily: "'Inter', sans-serif", fontSize: 13,
        color: highlight ? "#1a1f0e" : "#374151",
        fontWeight: highlight ? 600 : 400,
        wordBreak: "break-word",
      }}>{value ?? "—"}</span>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ManagerApprovalDetailPage({ params }) {
  const { id } = use(params)
  const router = useRouter()

  const [transfer,    setTransfer]    = useState(null)
  const [loading,     setLoading]     = useState(true)
  const [notFound,    setNotFound]    = useState(false)
  const [alreadyDone, setAlreadyDone] = useState(false)

  const [decision,    setDecision]    = useState(null) // "approve" | "reject" | null — what the manager has chosen
  const [comment,     setComment]     = useState("")
  const [submitting,  setSubmitting]  = useState(null) // "approve" | "reject" | null

  // ── Fetch transfer ──────────────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const res = await api.get(`/transfers/${id}`)
        if (res?.success) {
          const t = res.data
          setTransfer(t)
          // If it's not PENDING anymore the manager can't act on it
          if (t.status !== "PENDING") setAlreadyDone(true)
        } else {
          setNotFound(true)
        }
      } catch {
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  // ── Approve ─────────────────────────────────────────────────────────────────
  async function handleApprove() {
    try {
      setSubmitting("approve")
      const res = await api.post(`/approvals/${id}/manager-approve`, {
        approved: true,
        comments: comment.trim() || null,
      })
      if (res?.success) {
        toast.success("Approved — forwarded to HO Admin for final sign-off")
        router.push("/manager/approvals")
      } else {
        toast.error(res?.message || "Approval failed")
      }
    } catch (err) {
      toast.error(err.message || "Approval failed")
    } finally {
      setSubmitting(null)
    }
  }

  // ── Reject ──────────────────────────────────────────────────────────────────
  async function handleReject() {
    if (!comment.trim()) {
      toast.error("A rejection reason is required")
      return
    }
    try {
      setSubmitting("reject")
      const res = await api.post(`/approvals/${id}/manager-reject`, {
        approved: false,
        comments: comment.trim(),
      })
      if (res?.success) {
        toast.success("Transfer rejected — staff will be notified")
        router.push("/manager/approvals")
      } else {
        toast.error(res?.message || "Rejection failed")
      }
    } catch (err) {
      toast.error(err.message || "Rejection failed")
    } finally {
      setSubmitting(null)
    }
  }

  function handleConfirm() {
    if (decision === "approve") handleApprove()
    else if (decision === "reject") handleReject()
  }

  function handleChangeDecision() {
    setDecision(null)
  }

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "80px 0" }}>
        <div style={{ width: 24, height: 24, border: "2px solid #dde0d4", borderTopColor: "#3d7a2b", borderRadius: "50%", animation: "sb-spin 0.7s linear infinite" }} />
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.1em" }}>Loading transfer…</span>
        <style>{`@keyframes sb-spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  // ── Not found ───────────────────────────────────────────────────────────────
  if (notFound) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: "60px 0", alignItems: "center" }}>
        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, color: "#dc2626", fontWeight: 600 }}>Transfer #{id} not found</span>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#6b7260", margin: 0 }}>It may have been deleted or you don't have permission to view it.</p>
        <button onClick={() => router.push("/manager/approvals")} style={backBtnStyle}>
          <IconArrowLeft /> Back to Approvals
        </button>
      </div>
    )
  }

  const requestedBy = getRequestedBy(transfer)
  const busy = submitting !== null

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      <PageHeader
        title={`Review Transfer ${transfer.referenceNumber ?? `#${transfer.id}`}`}
        subtitle="Review the request details below and approve or reject."
      />

      <FlowBanner />

      {/* Already processed banner */}
      {alreadyDone && (
        <div style={{ background: "#fef9c3", border: "1px solid #fde68a", padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 }}>
          <IconClock />
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#a16207" }}>
            This transfer is already <strong>{transfer.status}</strong> and can no longer be actioned.
          </span>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>

        {/* ── Transfer details ── */}
        <div style={{ background: "#fff", border: "1px solid #dde0d4", padding: "20px 24px" }}>
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.12em", color: "#9ca3af", margin: "0 0 12px" }}>Transfer Details</p>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <Row label="Request ID"    value={transfer.referenceNumber ?? `#${transfer.id}`} highlight />
            <Row label="Status"        value={transfer.status} />
            <Row label="Item"          value={transfer.itemName} highlight />
            <Row label="Item Code"     value={transfer.itemCode} />
            <Row label="Quantity"      value={transfer.quantity} highlight />
            <Row label="Total Value"   value={fmt(transfer.totalValue)} />
            <Row label="Requesting"    value={transfer.destinationBranchName} />
            <Row label="Supplying"     value={transfer.sourceBranchName} />
            <Row label="Requested By"  value={requestedBy} />
            <Row label="Justification" value={transfer.justification || "None provided"} />
            <Row label="Date"          value={fmtDate(transfer.requestedAt)} />
            {transfer.requiresHoApproval && (
              <div style={{ marginTop: 10, padding: "8px 12px", background: "#eff6ff", border: "1px solid #bfdbfe", fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#1d4ed8" }}>
                ⓘ This transfer exceeds the threshold and requires HO Admin approval after yours.
              </div>
            )}
          </div>
        </div>

        {/* ── Action panel — hidden if already done ── */}
        {!alreadyDone && (
          <div style={{ background: "#fff", border: "1px solid #dde0d4", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.12em", color: "#9ca3af", margin: 0 }}>Your Decision</p>

            {decision === null ? (
              /* ── Step 1: choose an action — no comment requirements shown yet ── */
              <>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#6b7260", margin: 0 }}>
                  Choose how you'd like to act on this transfer.
                </p>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button onClick={() => setDecision("approve")} style={chooseApproveStyle}>
                    <IconCheck /> Approve & Forward to HO
                  </button>
                  <button onClick={() => setDecision("reject")} style={chooseRejectStyle}>
                    <IconX /> Reject Transfer
                  </button>
                  <button onClick={() => router.push("/manager/approvals")} style={backBtnStyle}>
                    <IconArrowLeft /> Back
                  </button>
                </div>
              </>
            ) : (
              /* ── Step 2: decision made — now show the relevant comment requirement ── */
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <span style={decisionBadgeStyle(decision)}>
                    {decision === "approve" ? <IconCheck /> : <IconX />}
                    {decision === "approve" ? "You're approving this transfer" : "You're rejecting this transfer"}
                  </span>
                  <button onClick={handleChangeDecision} disabled={busy} style={changeLinkStyle}>
                    Change decision
                  </button>
                </div>

                <div>
                  <label style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.12em", color: "#6b7260", display: "block", marginBottom: 6 }}>
                    Comments {decision === "reject" && <span style={{ color: "#dc2626" }}>* required</span>}
                  </label>
                  <textarea
                    rows={4}
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    disabled={busy}
                    placeholder={decision === "reject"
                      ? "Explain why this transfer is being rejected..."
                      : "Add an optional note for HO Admin..."}
                    style={{
                      width: "100%", border: "1px solid #dde0d4", background: "#f7f8f4",
                      padding: "10px 14px", fontSize: 13, fontFamily: "'Inter', sans-serif",
                      color: "#1a1f0e", outline: "none", resize: "vertical",
                      boxSizing: "border-box", opacity: busy ? 0.6 : 1,
                    }}
                  />
                </div>

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button
                    onClick={handleConfirm}
                    disabled={busy}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 6,
                      background: busy ? "#9ca3af" : (decision === "approve" ? "#3d7a2b" : "#dc2626"),
                      color: "#fff", border: "none",
                      cursor: busy ? "not-allowed" : "pointer",
                      padding: "10px 22px", fontSize: 13,
                      fontFamily: "'Inter', sans-serif", fontWeight: 500,
                      transition: "background 0.13s",
                    }}
                    onMouseEnter={e => { if (!busy) e.currentTarget.style.background = decision === "approve" ? "#2d5e20" : "#b91c1c" }}
                    onMouseLeave={e => { if (!busy) e.currentTarget.style.background = decision === "approve" ? "#3d7a2b" : "#dc2626" }}
                  >
                    {decision === "approve" ? <IconCheck /> : <IconX />}
                    {busy
                      ? (decision === "approve" ? "Approving…" : "Rejecting…")
                      : (decision === "approve" ? "Confirm Approval" : "Confirm Rejection")}
                  </button>

                  <button onClick={() => router.push("/manager/approvals")} disabled={busy} style={backBtnStyle}>
                    <IconArrowLeft /> Back
                  </button>
                </div>

                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#9ca3af", margin: 0 }}>
                  {decision === "approve"
                    ? "Approving will forward this request to HO Admin for final sign-off."
                    : "Rejecting will notify the requester immediately."}
                </p>
              </>
            )}
          </div>
        )}

        {/* Back button when already done */}
        {alreadyDone && (
          <button onClick={() => router.push("/manager/approvals")} style={{ ...backBtnStyle, alignSelf: "flex-start" }}>
            <IconArrowLeft /> Back to Approvals
          </button>
        )}

      </div>
    </div>
  )
}

function decisionBadgeStyle(decision) {
  const isApprove = decision === "approve"
  return {
    display: "inline-flex", alignItems: "center", gap: 6,
    fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 600,
    padding: "5px 12px", borderRadius: 4,
    background: isApprove ? "#f0fdf4" : "#fef2f2",
    color: isApprove ? "#16a34a" : "#dc2626",
    border: `1px solid ${isApprove ? "#bbf7d0" : "#fecaca"}`,
  }
}

const changeLinkStyle = {
  background: "none", border: "none", cursor: "pointer",
  fontFamily: "'Inter', sans-serif", fontSize: 12,
  color: "#6b7260", textDecoration: "underline",
  padding: 0,
}

const chooseApproveStyle = {
  display: "inline-flex", alignItems: "center", gap: 6,
  background: "#3d7a2b", color: "#fff", border: "none",
  cursor: "pointer", padding: "10px 22px", fontSize: 13,
  fontFamily: "'Inter', sans-serif", fontWeight: 500,
}

const chooseRejectStyle = {
  display: "inline-flex", alignItems: "center", gap: 6,
  background: "#dc2626", color: "#fff", border: "none",
  cursor: "pointer", padding: "10px 22px", fontSize: 13,
  fontFamily: "'Inter', sans-serif", fontWeight: 500,
}

const backBtnStyle = {
  display: "inline-flex", alignItems: "center", gap: 6,
  background: "#fff", border: "1px solid #dde0d4",
  cursor: "pointer", padding: "9px 18px",
  fontSize: 13, fontFamily: "'Inter', sans-serif",
  color: "#6b7260", transition: "background 0.1s",
}