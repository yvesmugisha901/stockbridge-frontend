"use client"
import { useState, useEffect, useCallback } from "react"
import { TransferCostCard, CostRecordForm } from "@/components/finance"
import { getTransfers, getFinanceSummary, recordCost, updateCost } from "@/lib/api/financeApi"

function DownloadIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
}

const selectStyle = {
  padding: "7px 12px", border: "1px solid #e8ebe3", borderRadius: 6,
  fontFamily: "'Inter', system-ui, sans-serif", fontSize: 13,
  color: "#1a1f0e", background: "#fff", cursor: "pointer", outline: "none",
}

function unwrapPage(raw) {
  if (raw?.data?.content && Array.isArray(raw.data.content)) return raw.data.content
  if (raw?.data && Array.isArray(raw.data)) return raw.data
  if (raw?.content && Array.isArray(raw.content)) return raw.content
  if (Array.isArray(raw)) return raw
  return []
}

function unwrapSummary(raw) {
  if (raw?.data != null && typeof raw.data === "object" && !Array.isArray(raw.data)) return raw.data
  return raw
}

function monthRange(ym) {
  const [y, m] = ym.split("-").map(Number)
  const last = new Date(y, m, 0).getDate()
  return { fromDate: `${ym}-01`, toDate: `${ym}-${String(last).padStart(2, "0")}` }
}

function lastMonths(n) {
  const result = []
  for (let i = 0; i < n; i++) {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    result.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`)
  }
  return result
}

function extractBranches(trfData) {
  const seen = new Set()
  const brs  = []
  trfData.forEach(t => {
    if (t.sourceBranchId != null && !seen.has(t.sourceBranchId)) {
      seen.add(t.sourceBranchId)
      brs.push({ id: String(t.sourceBranchId), name: t.sourceBranchName })
    }
    if (t.destinationBranchId != null && !seen.has(t.destinationBranchId)) {
      seen.add(t.destinationBranchId)
      brs.push({ id: String(t.destinationBranchId), name: t.destinationBranchName })
    }
  })
  return brs
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

export default function FinanceSummary() {
  const MONTHS = lastMonths(6)
  const [selectedMonth,  setMonth]         = useState(MONTHS[0])
  const [selectedBranch, setBranch]        = useState("")
  const [summary,        setSummary]       = useState(null)
  const [transfers,      setTransfers]     = useState([])
  const [loading,        setLoading]       = useState(true)
  const [error,          setError]         = useState(null)
  const [branches,       setBranches]      = useState([])
  const [branchesLoaded, setBranchesLoaded]= useState(false)
  const [recordModal,    setRecordModal]   = useState(null)
  const [submitting,     setSubmitting]    = useState(false)
  const [toast,          setToast]         = useState(null)

  // Load all branches once on mount
  useEffect(() => {
    async function loadBranches() {
      try {
        const raw = await getTransfers()
        setBranches(extractBranches(unwrapPage(raw)))
      } catch { /* allow page to work without branches */ }
      finally { setBranchesLoaded(true) }
    }
    loadBranches()
  }, [])

  const load = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const { fromDate, toDate } = monthRange(selectedMonth)
      const branchId = selectedBranch ? Number(selectedBranch) : undefined
      const [sumRaw, trfRaw] = await Promise.all([
        getFinanceSummary({ branchId, fromDate, toDate }),
        getTransfers({ branchId, fromDate, toDate }),
      ])
      setSummary(unwrapSummary(sumRaw))
      setTransfers(unwrapPage(trfRaw))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [selectedMonth, selectedBranch])

  useEffect(() => { load() }, [load])

  const safe = Array.isArray(transfers) ? transfers : []

  /**
   * KPI totals use the same model as the table:
   *   grandTotal = sum of (transferValue + costAmount) for each transfer
   *   This means transfers with no logistics cost still contribute their transferValue.
   */
  const grandTotal     = safe.reduce((sum, t) => sum + getTotalCost(t), 0)
  const totalTransfers = safe.length
  const avgCost        = totalTransfers > 0 ? Math.round(grandTotal / totalTransfers) : 0

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
      setToast({ type: "success", msg: `Cost saved for #${transferId}` })
      setRecordModal(null)
      load()
    } catch (err) {
      setToast({ type: "error", msg: err.message })
    } finally {
      setSubmitting(false)
      setTimeout(() => setToast(null), 3000)
    }
  }

  const handleExport = () => {
    const headers = ["Transfer ID","From","To","Item","Qty","Status","Transfer Value","Cost (Logistics)","Total Cost"]
    const rows = safe.map(t => [
      t.transferId,
      t.sourceBranchName,
      t.destinationBranchName,
      t.itemName,
      t.quantity,
      t.status,
      getTransferValue(t),
      hasCostRecorded(t) ? getCostAmount(t) : "",
      getTotalCost(t),
    ].join(","))
    const blob = new Blob([[headers.join(","), ...rows].join("\n")], { type: "text/csv" })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement("a")
    a.href = url; a.download = `finance-summary-${selectedMonth}.csv`; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div style={{ maxWidth: 900 }}>

      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 24, fontWeight: 400, color: "#1a1f0e", margin: "0 0 4px" }}>Finance Summary</h1>
          <p style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: 13, color: "#6b7260", margin: 0 }}>Transfer costs by branch and date range.</p>
        </div>
        <button onClick={handleExport} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 6, border: "1px solid #e8ebe3", background: "#fff", fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#4b5563", cursor: "pointer" }}>
          <DownloadIcon /> Export CSV
        </button>
      </div>

      {error && (
        <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 7, padding: "10px 16px", marginBottom: 16, fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#b91c1c" }}>
          {error} — <button onClick={load} style={{ background: "none", border: "none", color: "#b91c1c", cursor: "pointer", textDecoration: "underline", fontSize: 13, padding: 0 }}>Retry</button>
        </div>
      )}

      {toast && (
        <div style={{ background: toast.type === "success" ? "#f0f7ed" : "#fef2f2", border: `1px solid ${toast.type === "success" ? "#c6ddbf" : "#fca5a5"}`, borderRadius: 7, padding: "10px 16px", marginBottom: 16, fontFamily: "'Inter', sans-serif", fontSize: 13, color: toast.type === "success" ? "#3d7a2b" : "#b91c1c" }}>
          {toast.msg}
        </div>
      )}

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
        <select value={selectedMonth} onChange={e => setMonth(e.target.value)} style={selectStyle}>
          {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <select value={selectedBranch} onChange={e => setBranch(e.target.value)} style={selectStyle}>
          <option value="">All Branches</option>
          {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
      </div>

      {/* KPI cards — totals derived from transferValue + costAmount per transfer */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 28 }}>
        {[
          { label: "Grand Total Cost",        value: loading ? "…" : `RWF ${grandTotal.toLocaleString()}`,  sub: "Transfer value + logistics costs" },
          { label: "Total Transfers",          value: loading ? "…" : totalTransfers,                        sub: "In selected period" },
          { label: "Average Cost / Transfer",  value: loading ? "…" : `RWF ${avgCost.toLocaleString()}`,     sub: "Across selected period" },
        ].map(({ label, value, sub }) => (
          <div key={label} style={{ background: "#fff", border: "1px solid #e8ebe3", borderRadius: 10, padding: "18px 20px" }}>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#6b7260", margin: "0 0 10px" }}>{label}</p>
            <p style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 22, color: "#1a1f0e", margin: "0 0 4px" }}>{value}</p>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "#9ca3af", margin: 0 }}>{sub}</p>
          </div>
        ))}
      </div>

      {/* TransferCostCards */}
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 500, color: "#1a1f0e", margin: "0 0 14px" }}>Recent Transfer Cards</p>
        {loading ? (
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#9ca3af" }}>Loading…</p>
        ) : safe.length === 0 ? (
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#9ca3af" }}>No transfers found for this period.</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
            {safe.slice(0, 6).map(t => (
              <TransferCostCard
                key={t.transferId}
                transfer={{
                  id:            t.transferId,
                  fromBranch:    t.sourceBranchName,
                  toBranch:      t.destinationBranchName,
                  item:          t.itemName,
                  quantity:      t.quantity,
                  status:        t.status,
                  transferValue: getTransferValue(t),
                }}
                cost={hasCostRecorded(t) ? {
                  amount:    getCostAmount(t),
                  currency:  t.currency ?? "RWF",
                  costType:  t.costType,
                  notes:     t.costNotes,
                  totalCost: getTotalCost(t),
                } : {
                  // No logistics cost recorded — totalCost = transferValue alone
                  amount:    null,
                  currency:  "RWF",
                  totalCost: getTransferValue(t),
                }}
                onRecord={(transfer) => setRecordModal(transfer)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Summary table */}
      <div style={{ background: "#fff", border: "1px solid #e8ebe3", borderRadius: 10, overflow: "hidden" }}>
        <div style={{ padding: "14px 20px", borderBottom: "1px solid #e8ebe3" }}>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 500, color: "#1a1f0e" }}>Summary</span>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f9faf7" }}>
              {["Period","Branch","Total Transfers","Total Transfer Value","Total Logistics Cost","Grand Total"].map(h => (
                <th key={h} style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "#9ca3af", padding: "10px 16px", textAlign: "left", fontWeight: 400, borderBottom: "1px solid #e8ebe3" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ padding: "24px 16px", textAlign: "center", color: "#9ca3af", fontFamily: "'Inter', sans-serif", fontSize: 13 }}>Loading…</td></tr>
            ) : safe.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: "24px 16px", textAlign: "center", color: "#9ca3af", fontFamily: "'Inter', sans-serif", fontSize: 13 }}>No data for selected filters.</td></tr>
            ) : (() => {
              const sumTransferValue  = safe.reduce((s, t) => s + getTransferValue(t), 0)
              const sumLogisticsCost  = safe.reduce((s, t) => s + getCostAmount(t), 0)
              const sumGrandTotal     = safe.reduce((s, t) => s + getTotalCost(t), 0)
              return (
                <tr>
                  <td style={{ padding: "12px 16px", fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#4b5563" }}>
                    {summary?.fromDate ?? monthRange(selectedMonth).fromDate} → {summary?.toDate ?? monthRange(selectedMonth).toDate}
                  </td>
                  <td style={{ padding: "12px 16px", fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#1a1f0e" }}>
                    {selectedBranch
                      ? branches.find(b => b.id === selectedBranch)?.name ?? `Branch ${selectedBranch}`
                      : "All branches"}
                  </td>
                  <td style={{ padding: "12px 16px", fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#4b5563" }}>
                    {totalTransfers}
                  </td>
                  <td style={{ padding: "12px 16px", fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#4b5563" }}>
                    RWF {sumTransferValue.toLocaleString()}
                  </td>
                  <td style={{ padding: "12px 16px", fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#6b7260" }}>
                    {sumLogisticsCost > 0 ? `RWF ${sumLogisticsCost.toLocaleString()}` : "—"}
                  </td>
                  <td style={{ padding: "12px 16px", fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#3d7a2b", fontWeight: 600 }}>
                    RWF {sumGrandTotal.toLocaleString()}
                  </td>
                </tr>
              )
            })()}
          </tbody>
        </table>
        <div style={{ padding: "10px 16px", borderTop: "1px solid #f3f4f0", fontFamily: "'Inter', sans-serif", fontSize: 11, color: "#9ca3af" }}>
          Grand Total = Transfer Value + Logistics Cost (labour, transport, insurance). Logistics cost is optional.
        </div>
      </div>

      {recordModal && (
        <CostRecordForm
          transferId={recordModal.id}
          initialValues={recordModal.costAmount != null ? {
            amount:   recordModal.costAmount,
            currency: recordModal.currency ?? "RWF",
            costType: recordModal.costType,
            notes:    recordModal.costNotes,
          } : undefined}
          onSubmit={handleCostSubmit}
          onCancel={() => setRecordModal(null)}
        />
      )}
    </div>
  )
}
