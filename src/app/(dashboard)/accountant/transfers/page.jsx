"use client"
import { useState, useEffect, useCallback } from "react"
import { CostRecordForm } from "@/components/finance"
import { getTransfers, recordCost, updateCost } from "@/lib/api/financeApi"

function SearchIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
}
function DollarIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
}

const STATUS_STYLE = {
  COMPLETED:   { color: "#3d7a2b", bg: "#f0f7ed" },
  IN_TRANSIT:  { color: "#1d6fa8", bg: "#eaf3fb" },
  HO_APPROVED: { color: "#b45309", bg: "#fef3e2" },
  RECEIVED:    { color: "#6b7260", bg: "#f3f4f0" },
}

function unwrap(raw) {
  if (Array.isArray(raw)) return raw
  if (raw?.content && Array.isArray(raw.content)) return raw.content
  if (raw?.data    && Array.isArray(raw.data))    return raw.data
  return []
}

export default function AccountantTransfers() {
  const [transfers,   setTransfers]  = useState([])
  const [loading,     setLoading]    = useState(true)
  const [error,       setError]      = useState(null)
  const [search,      setSearch]     = useState("")
  const [statusFilter,setStatus]     = useState("ALL")
  const [modal,       setModal]      = useState(null)
  const [submitting,  setSubmitting] = useState(false)
  const [toast,       setToast]      = useState(null)

  const loadTransfers = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const raw = await getTransfers()
      setTransfers(unwrap(raw))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadTransfers() }, [loadTransfers])

  const safe = Array.isArray(transfers) ? transfers : []

  const filtered = safe.filter(t => {
    const matchSearch = !search || [
      String(t.id), t.itemName ?? "", t.sourceBranchName ?? "", t.destinationBranchName ?? "",
    ].some(v => v.toLowerCase().includes(search.toLowerCase()))
    const matchStatus = statusFilter === "ALL" || t.status === statusFilter
    return matchSearch && matchStatus
  })

  const handleCostSubmit = async ({ transferId, amount, currency, costType, notes }) => {
    const existing = safe.find(t => t.id === transferId)
    const hasCost  = existing?._hasCost === true
    try {
      setSubmitting(true)
      const body = { amount, currency, costType, notes }
      hasCost ? await updateCost(transferId, body) : await recordCost(transferId, body)
      setTransfers(prev =>
        (Array.isArray(prev) ? prev : []).map(t =>
          t.id === transferId
            ? { ...t, _costAmount: amount, _costType: costType, _costNotes: notes, _hasCost: true }
            : t
        )
      )
      setToast({ type: "success", msg: `Cost saved for transfer #${transferId}` })
      setModal(null)
    } catch (err) {
      setToast({ type: "error", msg: err.message })
    } finally {
      setSubmitting(false)
      setTimeout(() => setToast(null), 3000)
    }
  }

  return (
    <div style={{ maxWidth: 960 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 24, fontWeight: 400, color: "#1a1f0e", margin: "0 0 4px" }}>
          Approved Transfers
        </h1>
        <p style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: 13, color: "#6b7260", margin: 0 }}>
          View all approved transfers and attach cost records.
        </p>
      </div>

      {error && (
        <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 7, padding: "10px 16px", marginBottom: 16, fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#b91c1c" }}>
          Failed to load: {error} —{" "}
          <button onClick={loadTransfers} style={{ background: "none", border: "none", color: "#b91c1c", cursor: "pointer", textDecoration: "underline", fontSize: 13, padding: 0 }}>Retry</button>
        </div>
      )}

      <div style={{ display: "flex", gap: 10, marginBottom: 20, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, maxWidth: 300 }}>
          <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }}><SearchIcon /></span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by ID, item, branch…"
            style={{ width: "100%", padding: "8px 10px 8px 32px", border: "1px solid #e8ebe3", borderRadius: 6, fontFamily: "'Inter', system-ui, sans-serif", fontSize: 13, color: "#1a1f0e", outline: "none", background: "#fff" }}
          />
        </div>
        {["ALL","HO_APPROVED","IN_TRANSIT","RECEIVED","COMPLETED"].map(s => (
          <button key={s} onClick={() => setStatus(s)} style={{
            padding: "7px 14px", borderRadius: 6,
            border: `1px solid ${statusFilter === s ? "#3d7a2b" : "#e8ebe3"}`,
            background: statusFilter === s ? "#f0f7ed" : "#fff",
            color: statusFilter === s ? "#3d7a2b" : "#6b7260",
            fontFamily: "'DM Mono', monospace", fontSize: 10,
            textTransform: "uppercase", letterSpacing: "0.08em", cursor: "pointer",
          }}>
            {s === "ALL" ? "All" : s.replace(/_/g, " ")}
          </button>
        ))}
      </div>

      {toast && (
        <div style={{ background: toast.type === "success" ? "#f0f7ed" : "#fef2f2", border: `1px solid ${toast.type === "success" ? "#c6ddbf" : "#fca5a5"}`, borderRadius: 7, padding: "10px 16px", marginBottom: 16, fontFamily: "'Inter', sans-serif", fontSize: 13, color: toast.type === "success" ? "#3d7a2b" : "#b91c1c" }}>
          {toast.type === "success" ? "✓" : "✕"} {toast.msg}
        </div>
      )}

      <div style={{ background: "#fff", border: "1px solid #e8ebe3", borderRadius: 10, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f9faf7" }}>
              {["Transfer ID","Date","Route","Item","Qty","Status","Cost","Action"].map(h => (
                <th key={h} style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "#9ca3af", padding: "10px 16px", textAlign: "left", fontWeight: 400, borderBottom: "1px solid #e8ebe3" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} style={{ padding: "32px 16px", textAlign: "center", color: "#9ca3af", fontFamily: "'Inter', sans-serif", fontSize: 13 }}>Loading transfers…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={8} style={{ padding: "32px 16px", textAlign: "center", color: "#9ca3af", fontFamily: "'Inter', sans-serif", fontSize: 13 }}>No transfers match your filters.</td></tr>
            ) : filtered.map((r, i) => {
              const s       = STATUS_STYLE[r.status] || { color: "#6b7260", bg: "#f3f4f0" }
              const hasCost = r._hasCost === true
              return (
                <tr key={r.id} style={{ borderBottom: i < filtered.length - 1 ? "1px solid #f3f4f0" : "none" }}>
                  <td style={{ padding: "12px 16px", fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#3d7a2b" }}>#{r.id}</td>
                  <td style={{ padding: "12px 16px", fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#9ca3af" }}>{r.requestedAt ? r.requestedAt.slice(0,10) : "—"}</td>
                  <td style={{ padding: "12px 16px", fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#4b5563" }}>{r.sourceBranchName} → {r.destinationBranchName}</td>
                  <td style={{ padding: "12px 16px", fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#1a1f0e" }}>{r.itemName}</td>
                  <td style={{ padding: "12px 16px", fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#4b5563" }}>{r.quantity}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: s.color, background: s.bg, padding: "3px 8px", borderRadius: 4 }}>
                      {r.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", fontFamily: "'DM Mono', monospace", fontSize: 12, color: hasCost ? "#1a1f0e" : "#9ca3af" }}>
                    {hasCost ? `RWF ${Number(r._costAmount).toLocaleString()}` : "—"}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <button onClick={() => setModal(r)} disabled={submitting} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 5, border: `1px solid ${hasCost ? "#e8ebe3" : "#3d7a2b"}`, background: hasCost ? "#f9faf7" : "#f0f7ed", color: hasCost ? "#6b7260" : "#3d7a2b", fontFamily: "'Inter', sans-serif", fontSize: 12, cursor: "pointer" }}>
                      <DollarIcon />{hasCost ? "Edit cost" : "Add cost"}
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {modal && (
        <CostRecordForm
          transferId={modal.id}
          initialValues={modal._hasCost ? { amount: modal._costAmount, currency: "RWF", costType: modal._costType, notes: modal._costNotes } : undefined}
          onSubmit={handleCostSubmit}
          onCancel={() => setModal(null)}
        />
      )}
    </div>
  )
}