"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { api } from "@/lib/api/client"
import toast from "react-hot-toast"
import PageHeader from "@/components/ui/PageHeader"

const ALL_STATUSES = ["ALL","PENDING","MANAGER_APPROVED","HO_APPROVED","IN_TRANSIT","COMPLETED","REJECTED","CANCELLED"]

const STATUS_STYLE = {
  PENDING:          { background: "#fef9c3", color: "#a16207" },
  MANAGER_APPROVED: { background: "#dbeafe", color: "#1d4ed8" },
  HO_APPROVED:      { background: "#e0e7ff", color: "#4338ca" },
  IN_TRANSIT:       { background: "#f3e8ff", color: "#7e22ce" },
  COMPLETED:        { background: "#dcfce7", color: "#15803d" },
  REJECTED:         { background: "#fee2e2", color: "#dc2626" },
  CANCELLED:        { background: "#f3f4f6", color: "#6b7280" },
}

const STATUS_LABEL = {
  PENDING: "Pending",
  MANAGER_APPROVED: "Manager Approved",
  HO_APPROVED: "HO Approved",
  IN_TRANSIT: "In Transit",
  COMPLETED: "Completed",
  REJECTED: "Rejected",
  CANCELLED: "Cancelled",
}

export default function StaffTransfersPage() {
  const [transfers, setTransfers]   = useState([])
  const [loading, setLoading]       = useState(true)
  const [statusFilter, setStatus]   = useState("ALL")
  const [dateFrom, setDateFrom]     = useState("")
  const [dateTo, setDateTo]         = useState("")
  const [cancelling, setCancelling] = useState(null)

  useEffect(() => { fetchTransfers() }, [])

  async function fetchTransfers() {
    try {
      setLoading(true)
      const res = await api.get("/transfers/my?size=100")
      if (res?.success) setTransfers(res.data.content || [])
      else toast.error("Failed to load transfers")
    } catch (err) {
      toast.error(err.message || "Failed to fetch transfers")
    } finally {
      setLoading(false)
    }
  }

  async function handleCancel(id) {
    if (!confirm("Cancel this transfer request?")) return
    try {
      setCancelling(id)
      const res = await api.patch(`/transfers/${id}/cancel`)
      if (res?.success) {
        toast.success("Transfer cancelled")
        setTransfers(prev => prev.map(t =>
          t.id === id ? { ...t, status: "CANCELLED" } : t
        ))
      } else {
        toast.error("Could not cancel transfer")
      }
    } catch (err) {
      toast.error(err.message || "Cancel failed")
    } finally {
      setCancelling(null)
    }
  }

  const filtered = transfers.filter(t => {
    const matchStatus = statusFilter === "ALL" || t.status === statusFilter
    const matchFrom   = !dateFrom || new Date(t.requestedAt) >= new Date(dateFrom)
    const matchTo     = !dateTo   || new Date(t.requestedAt) <= new Date(dateTo + "T23:59:59")
    return matchStatus && matchFrom && matchTo
  })

  const hasFilters = statusFilter !== "ALL" || dateFrom || dateTo

  const labelStyle = {
    fontFamily: "'DM Mono', monospace",
    fontSize: 9,
    textTransform: "uppercase",
    letterSpacing: "0.12em",
    color: "#9ca3af",
    marginBottom: 6,
    display: "block",
  }

  const inputStyle = {
    border: "1px solid #dde0d4",
    background: "#f7f8f4",
    padding: "8px 12px",
    fontSize: 13,
    fontFamily: "'Inter', sans-serif",
    color: "#1a1f0e",
    outline: "none",
    minWidth: 140,
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <PageHeader
          title="My Transfer Requests"
          subtitle="Track and manage your stock transfer requests."
        />
        <Link href="/staff/transfers/new" style={{
          background: "#3d7a2b",
          color: "#fff",
          padding: "9px 18px",
          fontSize: 13,
          fontFamily: "'Inter', sans-serif",
          fontWeight: 500,
          textDecoration: "none",
          display: "inline-block",
          whiteSpace: "nowrap",
          alignSelf: "center",
        }}>
          + New Request
        </Link>
      </div>

      <div style={{
        background: "#fff",
        border: "1px solid #dde0d4",
        padding: "16px 24px",
        display: "flex",
        flexWrap: "wrap",
        alignItems: "flex-end",
        gap: 20,
      }}>
        <div>
          <span style={labelStyle}>Status</span>
          <select value={statusFilter} onChange={e => setStatus(e.target.value)} style={inputStyle}>
            {ALL_STATUSES.map(s => (
              <option key={s} value={s}>{s === "ALL" ? "All Statuses" : STATUS_LABEL[s] ?? s}</option>
            ))}
          </select>
        </div>

        <div>
          <span style={labelStyle}>From</span>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={inputStyle} />
        </div>

        <div>
          <span style={labelStyle}>To</span>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={inputStyle} />
        </div>

        {hasFilters && (
          <button
            onClick={() => { setStatus("ALL"); setDateFrom(""); setDateTo("") }}
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "#9ca3af", textDecoration: "underline", padding: 0 }}
          >
            Clear filters
          </button>
        )}

        <span style={{ marginLeft: "auto", fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#9ca3af" }}>
          {filtered.length} result{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div style={{ background: "#fff", border: "1px solid #dde0d4", overflow: "hidden" }}>
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "48px 0" }}>
            <div style={{ width: 24, height: 24, border: "2px solid #dde0d4", borderTopColor: "#3d7a2b", borderRadius: "50%", animation: "sb-spin 0.7s linear infinite" }} />
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#6b7260", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Loading transfers...
            </span>
            <style>{`@keyframes sb-spin { to { transform: rotate(360deg) } }`}</style>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#f7f8f4", borderBottom: "1px solid #e8ebe3" }}>
                {["Request ID", "Item", "From", "To", "Qty", "Status", "Date", "Action"].map(h => (
                  <th key={h} style={{
                    textAlign: "left",
                    padding: "10px 20px",
                    fontFamily: "'DM Mono', monospace",
                    fontSize: 10,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    color: "#9ca3af",
                    fontWeight: 500,
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: "48px 0", textAlign: "center", fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#9ca3af" }}>
                    {hasFilters ? "No transfers match your filters." : "You haven't submitted any transfer requests yet."}
                  </td>
                </tr>
              ) : filtered.map((t, idx) => (
                <tr key={t.id} style={{ borderBottom: idx < filtered.length - 1 ? "1px solid #f0f1ec" : "none" }}>
                  <td style={{ padding: "12px 20px", fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#6b7260" }}>
                    #{t.id}
                  </td>
                  <td style={{ padding: "12px 20px", fontFamily: "'Inter', sans-serif", fontWeight: 500, color: "#1a1f0e" }}>
                    {t.itemName}
                  </td>
                  <td style={{ padding: "12px 20px", fontFamily: "'Inter', sans-serif", color: "#6b7260" }}>
                    {t.sourceBranchName}
                  </td>
                  <td style={{ padding: "12px 20px", fontFamily: "'Inter', sans-serif", color: "#6b7260" }}>
                    {t.destinationBranchName}
                  </td>
                  <td style={{ padding: "12px 20px", fontFamily: "'Inter', sans-serif", fontWeight: 500, color: "#1a1f0e" }}>
                    {t.quantity}
                  </td>
                  <td style={{ padding: "12px 20px" }}>
                    <span style={{
                      ...(STATUS_STYLE[t.status] ?? { background: "#f3f4f6", color: "#6b7280" }),
                      fontFamily: "'DM Mono', monospace",
                      fontSize: 10,
                      fontWeight: 600,
                      padding: "2px 8px",
                      borderRadius: 999,
                    }}>
                      {STATUS_LABEL[t.status] ?? t.status}
                    </span>
                  </td>
                  <td style={{ padding: "12px 20px", fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#9ca3af" }}>
                    {t.requestedAt ? new Date(t.requestedAt).toLocaleDateString() : "-"}
                  </td>
                  <td style={{ padding: "12px 20px" }}>
                    {t.status === "PENDING" ? (
                      <button
                        onClick={() => handleCancel(t.id)}
                        disabled={cancelling === t.id}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          fontSize: 12,
                          color: "#dc2626",
                          fontFamily: "'Inter', sans-serif",
                          fontWeight: 500,
                          opacity: cancelling === t.id ? 0.4 : 1,
                        }}
                      >
                        {cancelling === t.id ? "Cancelling..." : "Cancel"}
                      </button>
                    ) : (
                      <span style={{ color: "#d1d5db", fontSize: 12 }}>-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

    </div>
  )
}