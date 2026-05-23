"use client"
import { useState } from "react"

function DownloadIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
}
function FileIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
}
function FilterIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
}
function PrintIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
}

// ── Mock data ────────────────────────────────────────────────────────────────
const ALL_RECORDS = [
  { id: "TRF-0091", date: "2026-05-20", from: "Branch A", to: "Branch C", item: "Office Chairs", qty: 10, status: "COMPLETED",  cost: 320000,  costType: "Transport",  notes: "Hired truck"        },
  { id: "TRF-0082", date: "2026-05-15", from: "Branch C", to: "Branch B", item: "Desks",         qty: 5,  status: "COMPLETED",  cost: 750000,  costType: "Handling",   notes: ""                   },
  { id: "TRF-0079", date: "2026-05-13", from: "Branch B", to: "Branch D", item: "Monitors",      qty: 6,  status: "COMPLETED",  cost: 480000,  costType: "Transport",  notes: "Overnight delivery" },
  { id: "TRF-0074", date: "2026-05-10", from: "Branch A", to: "Branch B", item: "Printers",      qty: 2,  status: "COMPLETED",  cost: 210000,  costType: "Labour",     notes: ""                   },
  { id: "TRF-0068", date: "2026-05-07", from: "HQ",       to: "Branch A", item: "Stationery",    qty: 50, status: "COMPLETED",  cost: 95000,   costType: "Transport",  notes: ""                   },
  { id: "TRF-0061", date: "2026-04-28", from: "Branch D", to: "Branch A", item: "Laptops",       qty: 3,  status: "COMPLETED",  cost: 150000,  costType: "Insurance",  notes: "Insured shipment"   },
  { id: "TRF-0055", date: "2026-04-22", from: "Branch B", to: "HQ",       item: "Filing Cabinets",qty: 4, status: "COMPLETED",  cost: 230000,  costType: "Handling",   notes: ""                   },
  { id: "TRF-0048", date: "2026-04-15", from: "Branch C", to: "Branch A", item: "Chairs",        qty: 20, status: "COMPLETED",  cost: 640000,  costType: "Transport",  notes: "2 trips required"   },
  { id: "TRF-0041", date: "2026-04-09", from: "HQ",       to: "Branch D", item: "Projectors",    qty: 2,  status: "COMPLETED",  cost: 180000,  costType: "Other",      notes: ""                   },
  { id: "TRF-0038", date: "2026-04-03", from: "Branch A", to: "Branch C", item: "Network Switch", qty: 1, status: "COMPLETED",  cost: 75000,   costType: "Transport",  notes: ""                   },
]

const BRANCHES   = ["All Branches", "Branch A", "Branch B", "Branch C", "Branch D", "HQ"]
const COST_TYPES = ["All Types", "Transport", "Handling", "Insurance", "Labour", "Other"]
const STATUS_STYLE = {
  COMPLETED:   { color: "#3d7a2b", bg: "#f0f7ed" },
  IN_TRANSIT:  { color: "#1d6fa8", bg: "#eaf3fb" },
  HO_APPROVED: { color: "#b45309", bg: "#fef3e2" },
}

// ── CSV export helper ────────────────────────────────────────────────────────
function exportCSV(rows, filename) {
  const headers = ["Transfer ID", "Date", "From", "To", "Item", "Qty", "Status", "Cost (RWF)", "Cost Type", "Notes"]
  const lines = [
    headers.join(","),
    ...rows.map(r =>
      [r.id, r.date, r.from, r.to, r.item, r.qty, r.status, r.cost ?? "", r.costType, `"${r.notes}"`].join(",")
    ),
  ]
  const blob = new Blob([lines.join("\n")], { type: "text/csv" })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement("a")
  a.href     = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

// ── Bar chart helper ─────────────────────────────────────────────────────────
const BAR_COLORS = ["#3d7a2b", "#1d6fa8", "#b45309", "#7c3aed", "#6b7260", "#0e7490"]

export default function AccountantReports() {
  const [branch,    setBranch]    = useState("All Branches")
  const [costType,  setCostType]  = useState("All Types")
  const [dateFrom,  setDateFrom]  = useState("2026-04-01")
  const [dateTo,    setDateTo]    = useState("2026-05-31")
  const [exported,  setExported]  = useState(false)

  // Filter
  const filtered = ALL_RECORDS.filter(r => {
    const matchBranch   = branch   === "All Branches" || r.from === branch || r.to === branch
    const matchType     = costType === "All Types"    || r.costType === costType
    const matchDateFrom = !dateFrom || r.date >= dateFrom
    const matchDateTo   = !dateTo   || r.date <= dateTo
    return matchBranch && matchType && matchDateFrom && matchDateTo && r.cost !== null
  })

  // Aggregates
  const totalCost       = filtered.reduce((s, r) => s + (r.cost || 0), 0)
  const totalTransfers  = filtered.length
  const avgCost         = totalTransfers > 0 ? Math.round(totalCost / totalTransfers) : 0

  // Cost by type (for chart)
  const byType = {}
  filtered.forEach(r => { byType[r.costType] = (byType[r.costType] || 0) + r.cost })
  const typeEntries = Object.entries(byType).sort((a, b) => b[1] - a[1])
  const maxType     = Math.max(...typeEntries.map(e => e[1]), 1)

  // Cost by branch (for chart)
  const byBranch = {}
  filtered.forEach(r => {
    byBranch[r.from] = (byBranch[r.from] || 0) + r.cost
  })
  const branchEntries = Object.entries(byBranch).sort((a, b) => b[1] - a[1])
  const maxBranch     = Math.max(...branchEntries.map(e => e[1]), 1)

  const handleExport = () => {
    exportCSV(filtered, `finance-report-${dateFrom}-to-${dateTo}.csv`)
    setExported(true)
    setTimeout(() => setExported(false), 2500)
  }

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
  const inputStyle = { ...selectStyle, fontFamily: "'DM Mono', monospace", fontSize: 12 }

  return (
    <div style={{ maxWidth: 960 }}>

      {/* Page header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 24, fontWeight: 400, color: "#1a1f0e", margin: "0 0 4px" }}>
            Finance Reports
          </h1>
          <p style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: 13, color: "#6b7260", margin: 0 }}>
            Generate and export transfer cost reports filtered by branch, type, and date.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => window.print()}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "8px 16px", borderRadius: 6,
              border: "1px solid #e8ebe3", background: "#fff",
              fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#4b5563", cursor: "pointer",
            }}
          >
            <PrintIcon /> Print
          </button>
          <button
            onClick={handleExport}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "8px 16px", borderRadius: 6,
              border: "none", background: exported ? "#e4f0df" : "#3d7a2b",
              fontFamily: "'Inter', sans-serif", fontSize: 13,
              color: exported ? "#3d7a2b" : "#fff", cursor: "pointer",
              transition: "background 0.2s",
            }}
          >
            <DownloadIcon />
            {exported ? "Downloaded!" : "Export CSV"}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={{
        background: "#fff",
        border: "1px solid #e8ebe3",
        borderRadius: 10,
        padding: "16px 20px",
        marginBottom: 24,
        display: "flex",
        gap: 12,
        alignItems: "center",
        flexWrap: "wrap",
      }}>
        <span style={{ display: "flex", alignItems: "center", gap: 6, color: "#9ca3af", fontFamily: "'Inter', sans-serif", fontSize: 12 }}>
          <FilterIcon /> Filters
        </span>
        <div style={{ width: 1, height: 20, background: "#e8ebe3" }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <label style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", color: "#b8bead" }}>Branch</label>
          <select value={branch} onChange={e => setBranch(e.target.value)} style={selectStyle}>
            {BRANCHES.map(b => <option key={b}>{b}</option>)}
          </select>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <label style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", color: "#b8bead" }}>Cost Type</label>
          <select value={costType} onChange={e => setCostType(e.target.value)} style={selectStyle}>
            {COST_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <label style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", color: "#b8bead" }}>Date From</label>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={inputStyle} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <label style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", color: "#b8bead" }}>Date To</label>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={inputStyle} />
        </div>
        <div style={{ marginLeft: "auto" }}>
          <span style={{
            fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#6b7260",
            background: "#f3f4f0", padding: "5px 10px", borderRadius: 5,
          }}>
            {totalTransfers} result{totalTransfers !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* KPI cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 24 }}>
        {[
          { label: "Total Cost",              value: `RWF ${totalCost.toLocaleString()}`,  sub: "Filtered period" },
          { label: "Transfers with Cost",     value: totalTransfers,                         sub: "Records found"   },
          { label: "Average Cost / Transfer", value: `RWF ${avgCost.toLocaleString()}`,    sub: "Filtered period" },
        ].map(({ label, value, sub }) => (
          <div key={label} style={{ background: "#fff", border: "1px solid #e8ebe3", borderRadius: 10, padding: "18px 20px" }}>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#6b7260", margin: "0 0 10px" }}>{label}</p>
            <p style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 22, color: "#1a1f0e", margin: "0 0 4px" }}>{value}</p>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "#9ca3af", margin: 0 }}>{sub}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      {filtered.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>

          {/* By cost type */}
          <div style={{ background: "#fff", border: "1px solid #e8ebe3", borderRadius: 10, padding: "18px 20px" }}>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 500, color: "#1a1f0e", margin: "0 0 18px" }}>
              Cost by Type
            </p>
            {typeEntries.map(([type, amount], i) => (
              <div key={type} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#4b5563" }}>{type}</span>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#1a1f0e" }}>
                    RWF {amount.toLocaleString()}
                  </span>
                </div>
                <div style={{ height: 6, background: "#f3f4f0", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{
                    height: "100%",
                    width: `${(amount / maxType) * 100}%`,
                    background: BAR_COLORS[i % BAR_COLORS.length],
                    borderRadius: 3,
                  }} />
                </div>
              </div>
            ))}
          </div>

          {/* By source branch */}
          <div style={{ background: "#fff", border: "1px solid #e8ebe3", borderRadius: 10, padding: "18px 20px" }}>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 500, color: "#1a1f0e", margin: "0 0 18px" }}>
              Cost by Source Branch
            </p>
            {branchEntries.map(([br, amount], i) => (
              <div key={br} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#4b5563" }}>{br}</span>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#1a1f0e" }}>
                    RWF {amount.toLocaleString()}
                  </span>
                </div>
                <div style={{ height: 6, background: "#f3f4f0", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{
                    height: "100%",
                    width: `${(amount / maxBranch) * 100}%`,
                    background: BAR_COLORS[i % BAR_COLORS.length],
                    borderRadius: 3,
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Full report table */}
      <div style={{ background: "#fff", border: "1px solid #e8ebe3", borderRadius: 10, overflow: "hidden" }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "14px 20px", borderBottom: "1px solid #e8ebe3",
        }}>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 500, color: "#1a1f0e" }}>
            Detailed Records
          </span>
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#9ca3af" }}>
            <FileIcon /> &nbsp;{totalTransfers} records · export includes all filtered rows
          </span>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f9faf7" }}>
              {["Transfer ID", "Date", "From", "To", "Item", "Qty", "Cost (RWF)", "Type", "Notes"].map(h => (
                <th key={h} style={{
                  fontFamily: "'DM Mono', monospace", fontSize: 10,
                  textTransform: "uppercase", letterSpacing: "0.1em",
                  color: "#9ca3af", padding: "10px 14px", textAlign: "left",
                  fontWeight: 400, borderBottom: "1px solid #e8ebe3",
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ padding: "32px 16px", textAlign: "center", color: "#9ca3af", fontFamily: "'Inter', sans-serif", fontSize: 13 }}>
                  No records match your filters.
                </td>
              </tr>
            ) : filtered.map((r, i) => (
              <tr key={r.id} style={{ borderBottom: i < filtered.length - 1 ? "1px solid #f3f4f0" : "none" }}>
                <td style={{ padding: "11px 14px", fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#3d7a2b" }}>{r.id}</td>
                <td style={{ padding: "11px 14px", fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#9ca3af" }}>{r.date}</td>
                <td style={{ padding: "11px 14px", fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#4b5563" }}>{r.from}</td>
                <td style={{ padding: "11px 14px", fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#4b5563" }}>{r.to}</td>
                <td style={{ padding: "11px 14px", fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#1a1f0e" }}>{r.item}</td>
                <td style={{ padding: "11px 14px", fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#4b5563" }}>{r.qty}</td>
                <td style={{ padding: "11px 14px", fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#1a1f0e", fontWeight: 500 }}>
                  {r.cost.toLocaleString()}
                </td>
                <td style={{ padding: "11px 14px" }}>
                  <span style={{
                    fontFamily: "'DM Mono', monospace", fontSize: 10,
                    color: "#6b7260", background: "#f3f4f0",
                    padding: "2px 7px", borderRadius: 4,
                    textTransform: "uppercase", letterSpacing: "0.06em",
                  }}>
                    {r.costType}
                  </span>
                </td>
                <td style={{ padding: "11px 14px", fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#9ca3af" }}>
                  {r.notes || "—"}
                </td>
              </tr>
            ))}

            {/* Totals row */}
            {filtered.length > 0 && (
              <tr style={{ background: "#f9faf7", borderTop: "1px solid #e8ebe3" }}>
                <td colSpan={6} style={{ padding: "12px 14px", fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 500, color: "#1a1f0e" }}>
                  Total
                </td>
                <td style={{ padding: "12px 14px", fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#3d7a2b", fontWeight: 500 }}>
                  {totalCost.toLocaleString()}
                </td>
                <td colSpan={2} />
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}