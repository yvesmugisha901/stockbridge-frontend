"use client"
import { useState, useEffect, useCallback } from "react"
import { FinanceSummaryTable } from "@/components/finance"
import { getTransfers } from "@/lib/api/financeApi"

function PrintIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
}

function unwrapPage(raw) {
  if (raw?.data?.content && Array.isArray(raw.data.content)) return raw.data.content
  if (raw?.data && Array.isArray(raw.data)) return raw.data
  if (raw?.content && Array.isArray(raw.content)) return raw.content
  if (Array.isArray(raw)) return raw
  return []
}

function parseDate(raw) {
  if (!raw) return ""
  const normalized = raw.includes("Z") || raw.includes("+") ? raw : raw + "Z"
  const d = new Date(normalized)
  return isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10)
}

/**
 * Cost model:
 *   transferValue  = monetary value of the goods being transferred (always set)
 *   costAmount     = additional logistics costs e.g. labour, transport, insurance (optional)
 *   totalCost      = transferValue + costAmount (if costAmount absent, totalCost = transferValue)
 */
function getTransferValue(t) {
  return t.transferValue != null ? Number(t.transferValue) : 0
}
function getCostAmount(t) {
  return t.costAmount != null ? Number(t.costAmount) : 0
}
function getTotalCost(t) {
  return getTransferValue(t) + getCostAmount(t)
}
function hasCostRecorded(t) {
  return t.costAmount != null
}

function mapRecords(data) {
  return data.map(t => ({
    transferId:            String(t.transferId),
    date:                  parseDate(t.requestedAt),
    route:                 `${t.sourceBranchName ?? ""} → ${t.destinationBranchName ?? ""}`,
    sourceBranchName:      t.sourceBranchName      ?? "",
    destinationBranchName: t.destinationBranchName ?? "",
    sourceBranchId:        t.sourceBranchId        != null ? String(t.sourceBranchId)      : null,
    destinationBranchId:   t.destinationBranchId   != null ? String(t.destinationBranchId) : null,
    item:                  t.itemName              ?? "",
    qty:                   t.quantity              ?? 0,
    status:                t.status                ?? "",
    // Cost model fields — totalCost = transferValue + costAmount (costAmount defaults to 0 if absent)
    transferValue:         getTransferValue(t),
    costAmount:            getCostAmount(t),   // 0 if not recorded — totalCost is always valid
    totalCost:             getTotalCost(t),
    currency:              t.currency  ?? "RWF",
    costType:              t.costType  ?? "",
    notes:                 t.costNotes ?? "",
  }))
}

function exportCSV(rows, filename) {
  const headers = [
    "Transfer ID", "Route", "Item", "Qty", "Status", "Date",
    "Transfer Value (RWF)", "Cost / Logistics (RWF)", "Total Cost (RWF)",
    "Currency", "Cost Type", "Notes",
  ]
  const lines = [
    headers.join(","),
    ...rows.map(r => [
      r.transferId,
      `"${r.route}"`,
      `"${r.item}"`,
      r.qty,
      r.status,
      r.date || "—",
      r.transferValue,
      r.costAmount,   // 0 if no logistics cost — totalCost = transferValue alone
      r.totalCost,
      r.currency,
      r.costType  || "—",
      `"${r.notes || ""}"`,
    ].join(","))
  ]
  const blob = new Blob([lines.join("\n")], { type: "text/csv" })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement("a")
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

export default function AccountantReports() {
  const [records,  setRecords]  = useState([])
  const [branches, setBranches] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(null)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const raw  = await getTransfers()
      const data = unwrapPage(raw)

      const mapped = mapRecords(data)
      if (mapped.length > 0) {
        console.log("[Reports] sample raw transfer:", JSON.stringify(data[0]))
        console.log("[Reports] sample mapped record:", JSON.stringify(mapped[0]))
      }
      setRecords(mapped)

      // Derive branches from full unfiltered dataset
      const seen = new Set()
      const brs  = []
      data.forEach(t => {
        if (t.sourceBranchId != null && !seen.has(t.sourceBranchId)) {
          seen.add(t.sourceBranchId)
          brs.push({ id: String(t.sourceBranchId), name: t.sourceBranchName })
        }
        if (t.destinationBranchId != null && !seen.has(t.destinationBranchId)) {
          seen.add(t.destinationBranchId)
          brs.push({ id: String(t.destinationBranchId), name: t.destinationBranchName })
        }
      })
      setBranches(brs)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const handleExport = (filteredRows) => {
    exportCSV(filteredRows, `finance-report-${new Date().toISOString().slice(0, 10)}.csv`)
  }

  return (
    <div style={{ maxWidth: 960 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 24, fontWeight: 400, color: "#1a1f0e", margin: "0 0 4px" }}>Finance Reports</h1>
          <p style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: 13, color: "#6b7260", margin: 0 }}>Generate and export transfer cost reports filtered by branch, type, and date.</p>
        </div>
        <button onClick={() => window.print()} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 6, border: "1px solid #e8ebe3", background: "#fff", fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#4b5563", cursor: "pointer" }}>
          <PrintIcon /> Print
        </button>
      </div>

      {error && (
        <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 7, padding: "10px 16px", marginBottom: 16, fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#b91c1c" }}>
          Failed to load reports: {error} —{" "}
          <button onClick={load} style={{ background: "none", border: "none", color: "#b91c1c", cursor: "pointer", textDecoration: "underline", fontSize: 13, padding: 0 }}>Retry</button>
        </div>
      )}

      {loading ? (
        <div style={{ padding: "48px 0", textAlign: "center", color: "#9ca3af", fontFamily: "'Inter', sans-serif", fontSize: 13 }}>
          Loading report data…
        </div>
      ) : (
        <FinanceSummaryTable data={records} branches={branches} onExport={handleExport} />
      )}
    </div>
  )
}

