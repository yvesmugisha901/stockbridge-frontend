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

export default function ManagerApprovalsPage() {
  const [transfers, setTransfers]   = useState([])
  const [loading, setLoading]       = useState(true)
  const [modal, setModal]           = useState(null)   // { type: "approve"|"reject", transfer }
  const [comments, setComments]     = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => { fetchPending() }, [])

  async function fetchPending() {
    try {
      setLoading(true)
      const res = await api.get("/approvals/pending?size=100")
      if (res?.success) setTransfers(res.data.content || [])
      else toast.error("Failed to load pending approvals")
    } catch (err) {
      toast.error(err.message || "Failed to fetch approvals")
    } finally {
      setLoading(false)
    }
  }

  function openModal(type, transfer) {
    setModal({ type, transfer })
    setComments("")
  }

  function closeModal() {
    setModal(null)
    setComments("")
  }

  // FR-16: approve with optional comments
  async function handleApprove() {
    if (!modal) return
    try {
      setSubmitting(true)
      const res = await api.patch(`/approvals/${modal.transfer.id}/approve`, {
        comments: comments.trim() || null,
      })
      if (res?.success) {
        toast.success("Transfer approved successfully")
        setTransfers(prev => prev.filter(t => t.id !== modal.transfer.id))
        closeModal()
      } else {
        toast.error(res?.message || "Approval failed")
      }
    } catch (err) {
      toast.error(err.message || "Approval failed")
    } finally {
      setSubmitting(false)
    }
  }

  // FR-16: reject with MANDATORY comments
  async function handleReject() {
    if (!modal) return
    if (!comments.trim()) {
      toast.error("Rejection reason is required")
      return
    }
    try {
      setSubmitting(true)
      const res = await api.patch(`/approvals/${modal.transfer.id}/reject`, {
        comments: comments.trim(),
      })
      if (res?.success) {
        toast.success("Transfer rejected")
        setTransfers(prev => prev.filter(t => t.id !== modal.transfer.id))
        closeModal()
      } else {
        toast.error(res?.message || "Rejection failed")
      }
    } catch (err) {
      toast.error(err.message || "Rejection failed")
    } finally {
      setSubmitting(false)
    }
  }

  const labelStyle = {
    fontFamily: "'DM Mono', monospace", fontSize: 9,
    textTransform: "uppercase", letterSpacing: "0.12em",
    color: "#9ca3af", marginBottom: 4, display: "block",
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      <PageHeader
        title="Pending Approvals — Level 1"
        subtitle="Review and approve or reject transfer requests from your branch."
      />

      {/* ── Table ── */}
      <div style={{ background: "#fff", border: "1px solid #dde0d4", overflow: "hidden" }}>
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "48px 0" }}>
            <div style={{ width: 24, height: 24, border: "2px solid #dde0d4", borderTopColor: "#3d7a2b", borderRadius: "50%", animation: "sb-spin 0.7s linear infinite" }} />
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#6b7260", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Loading approvals...
            </span>
            <style>{`@keyframes sb-spin { to { transform: rotate(360deg) } }`}</style>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#f7f8f4", borderBottom: "1px solid #e8ebe3" }}>
                {["Request ID", "Item", "From", "To", "Qty", "Value", "Requested By", "Date", "Action"].map(h => (
                  <th key={h} style={{
                    textAlign: "left", padding: "10px 20px",
                    fontFamily: "'DM Mono', monospace", fontSize: 10,
                    textTransform: "uppercase", letterSpacing: "0.1em",
                    color: "#9ca3af", fontWeight: 500,
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {transfers.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ padding: "48px 0", textAlign: "center", fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#9ca3af" }}>
                    No pending approvals for your branch.
                  </td>
                </tr>
              ) : transfers.map((t, idx) => (
                <tr key={t.id} style={{ borderBottom: idx < transfers.length - 1 ? "1px solid #f0f1ec" : "none" }}>

                  {/* ID */}
                  <td style={{ padding: "12px 20px", fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#6b7260" }}>
                    {t.referenceNumber ?? `#${t.id}`}
                  </td>

                  {/* Item */}
                  <td style={{ padding: "12px 20px", fontFamily: "'Inter', sans-serif", fontWeight: 500, color: "#1a1f0e" }}>
                    {t.itemName}
                  </td>

                  {/* From */}
                  <td style={{ padding: "12px 20px", fontFamily: "'Inter', sans-serif", color: "#6b7260" }}>
                    {t.sourceBranchName}
                  </td>

                  {/* To */}
                  <td style={{ padding: "12px 20px", fontFamily: "'Inter', sans-serif", color: "#6b7260" }}>
                    {t.destinationBranchName}
                  </td>

                  {/* Qty */}
                  <td style={{ padding: "12px 20px", fontFamily: "'Inter', sans-serif", fontWeight: 500, color: "#1a1f0e" }}>
                    {t.quantity}
                  </td>

                  {/* Value */}
                  <td style={{ padding: "12px 20px", fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#6b7260" }}>
                    {t.totalValue != null
                      ? new Intl.NumberFormat("en-RW", { style: "currency", currency: "RWF", maximumFractionDigits: 0 }).format(t.totalValue)
                      : "—"}
                  </td>

                  {/* Requested By */}
                  <td style={{ padding: "12px 20px", fontFamily: "'Inter', sans-serif", color: "#6b7260" }}>
                    {t.requestedByEmail ?? "—"}
                  </td>

                  {/* Date */}
                  <td style={{ padding: "12px 20px", fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#9ca3af" }}>
                    {t.requestedAt ? new Date(t.requestedAt).toLocaleDateString() : "—"}
                  </td>

                  {/* Actions */}
                  <td style={{ padding: "12px 20px" }}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        onClick={() => openModal("approve", t)}
                        style={{
                          display: "inline-flex", alignItems: "center", gap: 4,
                          background: "#f0f7ed", color: "#3d7a2b",
                          border: "1px solid #e1eedb", cursor: "pointer",
                          fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 500,
                          padding: "4px 10px",
                        }}
                      >
                        <IconCheck /> Approve
                      </button>
                      <button
                        onClick={() => openModal("reject", t)}
                        style={{
                          display: "inline-flex", alignItems: "center", gap: 4,
                          background: "#fef2f2", color: "#dc2626",
                          border: "1px solid #fee2e2", cursor: "pointer",
                          fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 500,
                          padding: "4px 10px",
                        }}
                      >
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

      {/* ── Approve / Reject Modal — FR-16 ── */}
      {modal && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 50,
          background: "rgba(0,0,0,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: 24,
        }}>
          <div style={{
            background: "#fff", border: "1px solid #dde0d4",
            padding: 28, width: "100%", maxWidth: 480,
            display: "flex", flexDirection: "column", gap: 20,
          }}>

            {/* Modal header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h2 style={{ fontFamily: "'Inter', sans-serif", fontSize: 16, fontWeight: 700, color: "#1a1f0e", margin: 0 }}>
                {modal.type === "approve" ? "Approve Transfer" : "Reject Transfer"}
              </h2>
              <button onClick={closeModal} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af" }}>
                <IconClose />
              </button>
            </div>

            {/* Transfer summary */}
            <div style={{ background: "#f7f8f4", border: "1px solid #e8ebe3", padding: "12px 16px", display: "flex", flexDirection: "column", gap: 6 }}>
              {[
                ["Request ID",   modal.transfer.referenceNumber ?? `#${modal.transfer.id}`],
                ["Item",         modal.transfer.itemName],
                ["Quantity",     modal.transfer.quantity],
                ["From → To",    `${modal.transfer.sourceBranchName} → ${modal.transfer.destinationBranchName}`],
                ["Justification", modal.transfer.justification ?? "—"],
              ].map(([label, value]) => (
                <div key={label} style={{ display: "flex", gap: 12 }}>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.1em", minWidth: 100 }}>
                    {label}
                  </span>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#1a1f0e" }}>
                    {value}
                  </span>
                </div>
              ))}
            </div>

            {/* Comments field */}
            <div>
              <span style={{ ...labelStyle }}>
                {modal.type === "reject"
                  ? <span>Rejection Reason <span style={{ color: "#dc2626" }}>*</span> (required)</span>
                  : "Comments (optional)"}
              </span>
              <textarea
                rows={3}
                value={comments}
                onChange={e => setComments(e.target.value)}
                placeholder={modal.type === "reject"
                  ? "Provide a reason for rejection..."
                  : "Add any notes for this approval..."}
                style={{
                  width: "100%", border: "1px solid #dde0d4", background: "#f7f8f4",
                  padding: "10px 14px", fontSize: 13, fontFamily: "'Inter', sans-serif",
                  color: "#1a1f0e", outline: "none", resize: "vertical",
                  boxSizing: "border-box",
                  ...(modal.type === "reject" && !comments.trim()
                    ? { border: "1px solid #fca5a5" } : {}),
                }}
              />
              {modal.type === "reject" && !comments.trim() && (
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "#dc2626", marginTop: 4 }}>
                  A rejection reason is required per FR-16.
                </p>
              )}
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 12 }}>
              {modal.type === "approve" ? (
                <button
                  onClick={handleApprove}
                  disabled={submitting}
                  style={{
                    background: submitting ? "#9ca3af" : "#3d7a2b",
                    color: "#fff", border: "none", cursor: submitting ? "wait" : "pointer",
                    padding: "10px 24px", fontSize: 13,
                    fontFamily: "'Inter', sans-serif", fontWeight: 500,
                    opacity: submitting ? 0.7 : 1,
                  }}
                >
                  {submitting ? "Approving..." : "Confirm Approval"}
                </button>
              ) : (
                <button
                  onClick={handleReject}
                  disabled={submitting || !comments.trim()}
                  style={{
                    background: submitting || !comments.trim() ? "#9ca3af" : "#dc2626",
                    color: "#fff", border: "none",
                    cursor: submitting || !comments.trim() ? "not-allowed" : "pointer",
                    padding: "10px 24px", fontSize: 13,
                    fontFamily: "'Inter', sans-serif", fontWeight: 500,
                  }}
                >
                  {submitting ? "Rejecting..." : "Confirm Rejection"}
                </button>
              )}
              <button
                onClick={closeModal}
                disabled={submitting}
                style={{
                  background: "#fff", border: "1px solid #dde0d4", cursor: "pointer",
                  padding: "10px 20px", fontSize: 13,
                  fontFamily: "'Inter', sans-serif", color: "#6b7260",
                }}
              >
                Cancel
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}