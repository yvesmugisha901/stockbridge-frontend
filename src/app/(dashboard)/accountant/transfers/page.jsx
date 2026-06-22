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
function ChevronLeftIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
}
function ChevronRightIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
}

const STATUS_STYLE = {
  COMPLETED:   { color: "#3d7a2b", bg: "#f0f7ed" },
  IN_TRANSIT:  { color: "#1d6fa8", bg: "#eaf3fb" },
  HO_APPROVED: { color: "#b45309", bg: "#fef3e2" },
  RECEIVED:    { color: "#6b7260", bg: "#f3f4f0" },
}

const PAGE_SIZE = 10

function unwrapPage(raw) {
  if (raw?.data?.content && Array.isArray(raw.data.content)) return raw.data.content
  if (raw?.data && Array.isArray(raw.data)) return raw.data
  if (raw?.content && Array.isArray(raw.content)) return raw.content
  if (Array.isArray(raw)) return raw
  return []
}

/**
 * Cost model:
 *   transferValue  = monetary value of the goods being transferred (always set)
 *   costAmount     = additional logistics costs e.g. labour, transport, insurance (optional)
 *   totalCost      = transferValue + costAmount (if costAmount absent, totalCost = transferValue)
 */
function getTransferValue(r) {
  return r.transferValue != null ? Number(r.transferValue) : 0
}
function getCostAmount(r) {
  return r.costAmount != null ? Number(r.costAmount) : 0
}
function getTotalCost(r) {
  return getTransferValue(r) + getCostAmount(r)
}
function hasCostRecorded(r) {
  return r.costAmount != null
}

// Build page number buttons: always show first, last, current ±1, with ellipsis gaps
function getPageNumbers(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages = new Set([1, total, current, current - 1, current + 1].filter(p => p >= 1 && p <= total))
  return Array.from(pages).sort((a, b) => a - b).reduce((acc, p, i, arr) => {
    if (i > 0 && p - arr[i - 1] > 1) acc.push("…")
    acc.push(p)
    return acc
  }, [])
}

export default function AccountantTransfers() {
  const [transfers,   setTransfers]  = useState([])
  const [loading,     setLoading]    = useState(true)
  const [error,       setError]      = useState(null)
  const [search,      setSearch]     = useState("")
  const [statusFilter,setStatus]     = useState("ALL")
  const [page,        setPage]       = useState(1)
  const [modal,       setModal]      = useState(null)
  const [submitting,  setSubmitting] = useState(false)
  const [toast,       setToast]      = useState(null)

  const loadTransfers = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const raw = await getTransfers()
      setTransfers(unwrapPage(raw))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadTransfers() }, [loadTransfers])

  // Reset to page 1 whenever search or filter changes
  useEffect(() => { setPage(1) }, [search, statusFilter])

  const safe = Array.isArray(transfers) ? transfers : []

  const filtered = safe.filter(t => {
    const matchSearch = !search || [
      String(t.transferId ?? ""),
      t.itemName ?? "",
      t.sourceBranchName ?? "",
      t.destinationBranchName ?? "",
    ].some(v => v.toLowerCase().includes(search.toLowerCase()))
    const matchStatus = statusFilter === "ALL" || t.status === statusFilter
    return matchSearch && matchStatus
  })

  const totalPages  = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage    = Math.min(page, totalPages)
  const pageStart   = (safePage - 1) * PAGE_SIZE
  const paginated   = filtered.slice(pageStart, pageStart + PAGE_SIZE)
  const pageNumbers = getPageNumbers(safePage, totalPages)

  const handleCostSubmit = async ({ transferId, amount, currency, costType, notes }) => {
    const existing = safe.find(t => t.transferId === transferId)
    const isUpdate = existing?.costAmount != null
    try {
      setSubmitting(true)
      const body = { amount, currency, costType, notes }
      isUpdate ? await updateCost(transferId, body) : await recordCost(transferId, body)
      setTransfers(prev =>
        (Array.isArray(prev) ? prev : []).map(t =>
          t.transferId === transferId
            ? { ...t, costAmount: amount, costType, costNotes: notes, currency }
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

  const btnBase = {
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    minWidth: 32, height: 32, borderRadius: 6, border: "1px solid #e8ebe3",
    background: "#fff", color: "#4b5563", fontFamily: "'DM Mono', monospace",
    fontSize: 12, cursor: "pointer", padding: "0 8px",
  }

  return (
    <div style={{ maxWidth: 1060 }}>
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
              {["Transfer ID","Route","Item","Qty","Status","Transfer Value","Cost (Logistics)","Total Cost","Action"].map(h => (
                <th key={h} style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "#9ca3af", padding: "10px 16px", textAlign: "left", fontWeight: 400, borderBottom: "1px solid #e8ebe3" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={9} style={{ padding: "32px 16px", textAlign: "center", color: "#9ca3af", fontFamily: "'Inter', sans-serif", fontSize: 13 }}>Loading transfers…</td></tr>
            ) : paginated.length === 0 ? (
              <tr><td colSpan={9} style={{ padding: "32px 16px", textAlign: "center", color: "#9ca3af", fontFamily: "'Inter', sans-serif", fontSize: 13 }}>No transfers match your filters.</td></tr>
            ) : paginated.map((r, i) => {
              const s            = STATUS_STYLE[r.status] || { color: "#6b7260", bg: "#f3f4f0" }
              const tv           = getTransferValue(r)
              const ca           = getCostAmount(r)
              const total        = getTotalCost(r)
              const costRecorded = hasCostRecorded(r)

              return (
                <tr key={r.transferId} style={{ borderBottom: i < paginated.length - 1 ? "1px solid #f3f4f0" : "none" }}>
                  <td style={{ padding: "12px 16px", fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#3d7a2b" }}>
                    #{r.transferId}
                  </td>
                  <td style={{ padding: "12px 16px", fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#4b5563" }}>
                    {r.sourceBranchName} → {r.destinationBranchName}
                  </td>
                  <td style={{ padding: "12px 16px", fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#1a1f0e" }}>
                    {r.itemName}
                  </td>
                  <td style={{ padding: "12px 16px", fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#4b5563" }}>
                    {r.quantity}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: s.color, background: s.bg, padding: "3px 8px", borderRadius: 4 }}>
                      {r.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#1a1f0e" }}>
                    {tv > 0 ? `RWF ${tv.toLocaleString()}` : "—"}
                  </td>
                  <td style={{ padding: "12px 16px", fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#6b7260" }}>
                    {costRecorded
                      ? `RWF ${ca.toLocaleString()}${r.currency && r.currency !== "RWF" ? ` ${r.currency}` : ""}`
                      : <span style={{ color: "#9ca3af" }}>—</span>
                    }
                  </td>
                  <td style={{ padding: "12px 16px", fontFamily: "'DM Mono', monospace", fontSize: 12, fontWeight: 600, color: "#1a1f0e" }}>
                    {tv > 0 ? `RWF ${total.toLocaleString()}` : "—"}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <button
                      onClick={() => setModal(r)}
                      disabled={submitting}
                      style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 5, border: `1px solid ${costRecorded ? "#e8ebe3" : "#3d7a2b"}`, background: costRecorded ? "#f9faf7" : "#f0f7ed", color: costRecorded ? "#6b7260" : "#3d7a2b", fontFamily: "'Inter', sans-serif", fontSize: 12, cursor: "pointer" }}
                    >
                      <DollarIcon />{costRecorded ? "Edit cost" : "Add cost"}
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {/* Footer: count + pagination */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderTop: "1px solid #f3f4f0", flexWrap: "wrap", gap: 10 }}>
          {/* Results count */}
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#9ca3af" }}>
            {loading ? "Loading…" : (
              filtered.length === 0
                ? "No results"
                : `${pageStart + 1}–${Math.min(pageStart + PAGE_SIZE, filtered.length)} of ${filtered.length} transfer${filtered.length !== 1 ? "s" : ""}`
            )}
          </span>

          {/* Page controls */}
          {!loading && totalPages > 1 && (
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              {/* Prev */}
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={safePage === 1}
                style={{ ...btnBase, opacity: safePage === 1 ? 0.4 : 1, cursor: safePage === 1 ? "default" : "pointer" }}
              >
                <ChevronLeftIcon />
              </button>

              {/* Page numbers */}
              {pageNumbers.map((p, idx) =>
                p === "…" ? (
                  <span key={`ellipsis-${idx}`} style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#9ca3af", padding: "0 4px" }}>…</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    style={{
                      ...btnBase,
                      background:   p === safePage ? "#f0f7ed" : "#fff",
                      border:       `1px solid ${p === safePage ? "#3d7a2b" : "#e8ebe3"}`,
                      color:        p === safePage ? "#3d7a2b" : "#4b5563",
                      fontWeight:   p === safePage ? 600 : 400,
                    }}
                  >
                    {p}
                  </button>
                )
              )}

              {/* Next */}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                style={{ ...btnBase, opacity: safePage === totalPages ? 0.4 : 1, cursor: safePage === totalPages ? "default" : "pointer" }}
              >
                <ChevronRightIcon />
              </button>
            </div>
          )}

          {/* Legend */}
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "#9ca3af" }}>
            Total Cost = Transfer Value + Logistics Cost (optional)
          </span>
        </div>
      </div>

      {modal && (
        <CostRecordForm
          transferId={modal.transferId}
          initialValues={modal.costAmount != null ? {
            amount:   modal.costAmount,
            currency: modal.currency ?? "RWF",
            costType: modal.costType,
            notes:    modal.costNotes,
          } : undefined}
          onSubmit={handleCostSubmit}
          onCancel={() => setModal(null)}
        />
      )}
    </div>
  )
}
