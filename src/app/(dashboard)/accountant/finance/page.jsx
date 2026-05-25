"use client"
import { useState, useEffect, useCallback } from "react"
import { TransferCostCard, CostRecordForm } from "@/components/finance"
import { getTransfers, getFinanceSummary, recordCost, updateCost } from "@/lib/api/financeApi"

function DownloadIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
}

const BAR_COLORS = ["#3d7a2b", "#1d6fa8", "#b45309", "#7c3aed", "#6b7260"]

const selectStyle = {
  padding: "7px 12px",
  border: "1px solid #e8ebe3",
  borderRadius: 6,
  fontFamily: "'Inter', system-ui, sans-serif",
  fontSize: 13,
  color: "#1a1f0e",
  background: "#fff",
  cursor: "pointer",
  outline: "none",
}

// Build a YYYY-MM-DD date N months back
function monthsAgo(n) {
  const d = new Date()
  d.setMonth(d.getMonth() - n)
  return d.toISOString().slice(0, 10)
}

// First + last day of "YYYY-MM"
function monthRange(ym) {
  const [y, m] = ym.split("-").map(Number)
  const from = `${ym}-01`
  const last = new Date(y, m, 0).getDate()
  const to   = `${ym}-${String(last).padStart(2, "0")}`
  return { from, to }
}

// Generate last N month labels "YYYY-MM"
function lastMonths(n) {
  const result = []
  for (let i = 0; i < n; i++) {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    result.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`)
  }
  return result
}

export default function FinanceSummary() {
  // ── Filters ────────────────────────────────────────────
  const MONTHS = lastMonths(6)
  const [selectedMonth,  setMonth]    = useState(MONTHS[0])
  const [selectedBranch, setBranch]   = useState("")   // "" = all

  // ── Data ───────────────────────────────────────────────
  const [summary,   setSummary]   = useState(null)
  const [transfers, setTransfers] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState(null)
  const [branches,  setBranches]  = useState([])  // derived from transfers

  // ── Cost modal ─────────────────────────────────────────
  const [recordModal,  setRecordModal]  = useState(null)
  const [submitting,   setSubmitting]   = useState(false)
  const [toast,        setToast]        = useState(null)

  // ── Fetch ──────────────────────────────────────────────
  const load = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const { from, to } = monthRange(selectedMonth)
      const branchId = selectedBranch || undefined

      const [sumData, trfData] = await Promise.all([
        getFinanceSummary({ branchId, from, to }),
        getTransfers(),
      ])

      setSummary(sumData)
      setTransfers(trfData)

      // Derive unique branches for dropdown
      const seen = new Set()
      const brs  = []
      trfData.forEach(t => {
        if (t.sourceBranchId && !seen.has(t.sourceBranchId)) {
          seen.add(t.sourceBranchId)
          brs.push({ id: t.sourceBranchId, name: t.sourceBranchName })
        }
        if (t.destinationBranchId && !seen.has(t.destinationBranchId)) {
          seen.add(t.destinationBranchId)
          brs.push({ id: t.destinationBranchId, name: t.destinationBranchName })
        }
      })
      setBranches(brs)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [selectedMonth, selectedBranch])

  useEffect(() => { load() }, [load])

  // ── Derived summary values ─────────────────────────────
  const totalCost      = summary?.totalCost      ?? 0
  const totalTransfers = summary?.totalTransfers ?? 0
  const avgCost        = totalTransfers > 0 ? Math.round(Number(totalCost) / totalTransfers) : 0

  // ── Cost submit ────────────────────────────────────────
  const handleCostSubmit = async ({ transferId, amount, currency, costType, notes }) => {
    const existing = transfers.find(t => t.id === transferId)
    const hasCost  = existing?._hasCost === true
    try {
      setSubmitting(true)
      const body = { amount, currency, costType, notes }
      hasCost
        ? await updateCost(transferId, body)
        : await recordCost(transferId, body)

      setTransfers(prev => prev.map(t =>
        t.id === transferId
          ? { ...t, _costAmount: amount, _costType: costType, _costNotes: notes, _hasCost: true }
          : t
      ))
      setToast({ type: "success", msg: `Cost saved for #${transferId}` })
      setRecordModal(null)
      // Refresh summary totals
      load()
    } catch (err) {
      setToast({ type: "error", msg: err.message })
    } finally {
      setSubmitting(false)
      setTimeout(() => setToast(null), 3000)
    }
  }

  // ── CSV export (client-side from live data) ────────────
  const handleExport = () => {
    const headers = ["Transfer ID", "From", "To", "Item", "Qty", "Status", "Cost Type", "Amount (RWF)"]
    const rows = transfers
      .filter(t => t._hasCost)
      .map(t => [t.id, t.sourceBranchName, t.destinationBranchName, t.itemName, t.quantity, t.status, t._costType, t._costAmount].join(","))
    const blob = new Blob([[headers.join(","), ...rows].join("\n")], { type: "text/csv" })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement("a")
    a.href     = url
    a.download = `finance-summary-${selectedMonth}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div style={{ maxWidth: 900 }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 24, fontWeight: 400, color: "#1a1f0e", margin: "0 0 4px" }}>
            Finance Summary
          </h1>
          <p style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: 13, color: "#6b7260", margin: 0 }}>
            Transfer costs by branch and date range.
          </p>
        </div>
        <button
          onClick={handleExport}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "8px 16px", borderRadius: 6,
            border: "1px solid #e8ebe3", background: "#fff",
            fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#4b5563", cursor: "pointer",
          }}
        >
          <DownloadIcon /> Export CSV
        </button>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          background: "#fef2f2", border: "1px solid #fca5a5",
          borderRadius: 7, padding: "10px 16px", marginBottom: 16,
          fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#b91c1c",
        }}>
          {error} —{" "}
          <button onClick={load} style={{ background: "none", border: "none", color: "#b91c1c", cursor: "pointer", textDecoration: "underline", fontSize: 13, padding: 0 }}>
            Retry
          </button>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{
          background: toast.type === "success" ? "#f0f7ed" : "#fef2f2",
          border: `1px solid ${toast.type === "success" ? "#c6ddbf" : "#fca5a5"}`,
          borderRadius: 7, padding: "10px 16px", marginBottom: 16,
          fontFamily: "'Inter', sans-serif", fontSize: 13,
          color: toast.type === "success" ? "#3d7a2b" : "#b91c1c",
        }}>
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
          {branches.map(b => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
      </div>

      {/* KPI cards — from FinanceSummaryResponse */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 28 }}>
        {[
          { label: "Total Transfer Cost",    value: loading ? "…" : `RWF ${Number(totalCost).toLocaleString()}`,  sub: selectedMonth },
          { label: "Total Transfers",         value: loading ? "…" : totalTransfers,                               sub: "With cost recorded" },
          { label: "Average Cost / Transfer", value: loading ? "…" : `RWF ${avgCost.toLocaleString()}`,            sub: "Across selected period" },
        ].map(({ label, value, sub }) => (
          <div key={label} style={{ background: "#fff", border: "1px solid #e8ebe3", borderRadius: 10, padding: "18px 20px" }}>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#6b7260", margin: "0 0 10px" }}>{label}</p>
            <p style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 22, color: "#1a1f0e", margin: "0 0 4px" }}>{value}</p>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "#9ca3af", margin: 0 }}>{sub}</p>
          </div>
        ))}
      </div>

      {/* TransferCostCards grid — live from API */}
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 500, color: "#1a1f0e", margin: "0 0 14px" }}>
          Recent Transfer Cards
        </p>
        {loading ? (
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#9ca3af" }}>Loading…</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
            {transfers.slice(0, 6).map(t => (
              <TransferCostCard
                key={t.id}
                // Map TransferResponse fields → what TransferCostCard expects
                transfer={{
                  id:         t.id,
                  fromBranch: t.sourceBranchName,
                  toBranch:   t.destinationBranchName,
                  item:       t.itemName,
                  quantity:   t.quantity,
                  status:     t.status,
                }}
                cost={t._hasCost ? {
                  amount:   t._costAmount,
                  currency: "RWF",
                  costType: t._costType,
                  notes:    t._costNotes,
                } : null}
                onRecord={(transfer) => setRecordModal(transfer)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Branch breakdown table — derived from live summary */}
      <div style={{ background: "#fff", border: "1px solid #e8ebe3", borderRadius: 10, overflow: "hidden" }}>
        <div style={{ padding: "14px 20px", borderBottom: "1px solid #e8ebe3" }}>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 500, color: "#1a1f0e" }}>
            Summary
          </span>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f9faf7" }}>
              {["Period", "Branch", "Total Transfers", "Total Cost"].map(h => (
                <th key={h} style={{
                  fontFamily: "'DM Mono', monospace", fontSize: 10,
                  textTransform: "uppercase", letterSpacing: "0.1em",
                  color: "#9ca3af", padding: "10px 16px", textAlign: "left",
                  fontWeight: 400, borderBottom: "1px solid #e8ebe3",
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} style={{ padding: "24px 16px", textAlign: "center", color: "#9ca3af", fontFamily: "'Inter', sans-serif", fontSize: 13 }}>
                  Loading…
                </td>
              </tr>
            ) : !summary ? (
              <tr>
                <td colSpan={4} style={{ padding: "24px 16px", textAlign: "center", color: "#9ca3af", fontFamily: "'Inter', sans-serif", fontSize: 13 }}>
                  No data for selected filters.
                </td>
              </tr>
            ) : (
              <tr>
                <td style={{ padding: "12px 16px", fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#4b5563" }}>
                  {summary.fromDate} → {summary.toDate}
                </td>
                <td style={{ padding: "12px 16px", fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#1a1f0e" }}>
                  {selectedBranch
                    ? branches.find(b => String(b.id) === String(selectedBranch))?.name ?? `Branch ${selectedBranch}`
                    : "All branches"
                  }
                </td>
                <td style={{ padding: "12px 16px", fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#4b5563" }}>
                  {summary.totalTransfers}
                </td>
                <td style={{ padding: "12px 16px", fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#3d7a2b", fontWeight: 500 }}>
                  RWF {Number(summary.totalCost).toLocaleString()}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* CostRecordForm modal */}
      {recordModal && (
        <CostRecordForm
          transferId={recordModal.id}
          onSubmit={handleCostSubmit}
          onCancel={() => setRecordModal(null)}
        />
      )}
    </div>
  )
}