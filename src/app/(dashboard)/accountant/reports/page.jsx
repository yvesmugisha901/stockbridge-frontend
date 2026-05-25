"use client"
import { useState, useEffect, useCallback } from "react"
import { FinanceSummaryTable } from "@/components/finance"
import { getTransfers } from "@/lib/api/financeApi"

function PrintIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
}

function unwrap(raw) {
  if (Array.isArray(raw)) return raw
  if (raw?.content && Array.isArray(raw.content)) return raw.content
  if (raw?.data    && Array.isArray(raw.data))    return raw.data
  return []
}

function exportCSV(rows, filename) {
  const headers = ["Transfer ID","Branch","Cost Type","Date","Amount (RWF)","Currency","Notes"]
  const lines = [
    headers.join(","),
    ...rows.map(r => [r.transferId, r.branch, r.costType, r.date, r.amount, r.currency, `"${r.notes || ""}"`].join(","))
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
      const data = unwrap(raw)

      const mapped = data.map(t => ({
        transferId: String(t.id),
        date:       t.requestedAt ? t.requestedAt.slice(0, 10) : "",
        branch:     t.sourceBranchName  ?? "",
        item:       t.itemName          ?? "",
        qty:        t.quantity          ?? 0,
        amount:     t.costAmount        ?? null,
        currency:   t.currency          ?? "RWF",
        costType:   t.costType          ?? "",
        notes:      t.costNotes         ?? "",
      }))

      setRecords(mapped)

      // Derive unique branches
      const seen = new Set()
      const brs  = []
      data.forEach(t => {
        if (t.sourceBranchId && !seen.has(t.sourceBranchId)) {
          seen.add(t.sourceBranchId)
          brs.push({ id: String(t.sourceBranchId), name: t.sourceBranchName })
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