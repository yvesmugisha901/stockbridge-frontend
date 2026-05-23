"use client"
import { useState } from "react"

function DownloadIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
}

const ALL_DATA = [
  { branch: "Branch A", month: "2026-05", transfers: 8,  total: 1240000, types: { Transport: 620000, Handling: 380000, Insurance: 240000 } },
  { branch: "Branch B", month: "2026-05", transfers: 5,  total: 870000,  types: { Transport: 450000, Handling: 220000, Labour: 200000    } },
  { branch: "Branch C", month: "2026-05", transfers: 6,  total: 1560000, types: { Transport: 800000, Handling: 460000, Other: 300000     } },
  { branch: "Branch D", month: "2026-05", transfers: 5,  total: 1150000, types: { Transport: 600000, Insurance: 350000, Labour: 200000   } },
  { branch: "Branch A", month: "2026-04", transfers: 6,  total: 980000,  types: { Transport: 500000, Handling: 280000, Other: 200000     } },
  { branch: "Branch B", month: "2026-04", transfers: 4,  total: 640000,  types: { Transport: 320000, Handling: 180000, Labour: 140000    } },
  { branch: "Branch C", month: "2026-04", transfers: 7,  total: 1320000, types: { Transport: 700000, Handling: 420000, Insurance: 200000 } },
  { branch: "Branch D", month: "2026-04", transfers: 3,  total: 580000,  types: { Transport: 300000, Other: 280000                      } },
]

const BRANCHES = ["All Branches", "Branch A", "Branch B", "Branch C", "Branch D"]
const MONTHS   = ["2026-05", "2026-04"]

const BAR_COLORS = ["#3d7a2b", "#1d6fa8", "#b45309", "#7c3aed", "#6b7260"]

export default function FinanceSummary() {
  const [branch, setBranch] = useState("All Branches")
  const [month, setMonth]   = useState("2026-05")

  const filtered = ALL_DATA.filter(d =>
    (branch === "All Branches" || d.branch === branch) && d.month === month
  )

  const grandTotal    = filtered.reduce((s, d) => s + d.total, 0)
  const totalTransfers = filtered.reduce((s, d) => s + d.transfers, 0)
  const avgCost       = totalTransfers > 0 ? Math.round(grandTotal / totalTransfers) : 0

  // Bar chart: cost by branch
  const maxVal = Math.max(...filtered.map(d => d.total), 1)

  // Cost type breakdown (aggregate)
  const typeMap = {}
  filtered.forEach(d => {
    Object.entries(d.types).forEach(([k, v]) => {
      typeMap[k] = (typeMap[k] || 0) + v
    })
  })
  const typeEntries = Object.entries(typeMap).sort((a, b) => b[1] - a[1])

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
        <button style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "8px 16px", borderRadius: 6,
          border: "1px solid #e8ebe3", background: "#fff",
          fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#4b5563", cursor: "pointer",
        }}>
          <DownloadIcon /> Export CSV
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
        <select value={branch} onChange={e => setBranch(e.target.value)} style={selectStyle}>
          {BRANCHES.map(b => <option key={b}>{b}</option>)}
        </select>
        <select value={month} onChange={e => setMonth(e.target.value)} style={selectStyle}>
          {MONTHS.map(m => <option key={m}>{m}</option>)}
        </select>
      </div>

      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 28 }}>
        {[
          { label: "Total Transfer Cost",  value: `RWF ${grandTotal.toLocaleString()}`,  sub: `${month}` },
          { label: "Total Transfers",      value: totalTransfers,                          sub: "With cost recorded" },
          { label: "Average Cost / Transfer", value: `RWF ${avgCost.toLocaleString()}`,  sub: "Across selected period" },
        ].map(({ label, value, sub }) => (
          <div key={label} style={{ background: "#fff", border: "1px solid #e8ebe3", borderRadius: 10, padding: "18px 20px" }}>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#6b7260", margin: "0 0 10px" }}>{label}</p>
            <p style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 22, color: "#1a1f0e", margin: "0 0 4px" }}>{value}</p>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "#9ca3af", margin: 0 }}>{sub}</p>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>

        {/* Cost by branch bar chart */}
        <div style={{ background: "#fff", border: "1px solid #e8ebe3", borderRadius: 10, padding: "18px 20px" }}>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 500, color: "#1a1f0e", margin: "0 0 18px" }}>
            Cost by Branch
          </p>
          {filtered.length === 0 ? (
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#9ca3af", textAlign: "center", padding: "20px 0" }}>No data</p>
          ) : filtered.map((d, i) => (
            <div key={d.branch} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#4b5563" }}>{d.branch}</span>
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#1a1f0e" }}>
                  RWF {d.total.toLocaleString()}
                </span>
              </div>
              <div style={{ height: 6, background: "#f3f4f0", borderRadius: 3, overflow: "hidden" }}>
                <div style={{
                  height: "100%",
                  width: `${(d.total / maxVal) * 100}%`,
                  background: BAR_COLORS[i % BAR_COLORS.length],
                  borderRadius: 3,
                  transition: "width 0.4s ease",
                }} />
              </div>
            </div>
          ))}
        </div>

        {/* Cost type breakdown */}
        <div style={{ background: "#fff", border: "1px solid #e8ebe3", borderRadius: 10, padding: "18px 20px" }}>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 500, color: "#1a1f0e", margin: "0 0 18px" }}>
            Cost Type Breakdown
          </p>
          {typeEntries.length === 0 ? (
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#9ca3af", textAlign: "center", padding: "20px 0" }}>No data</p>
          ) : typeEntries.map(([type, amount], i) => {
            const pct = Math.round((amount / grandTotal) * 100)
            return (
              <div key={type} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <span style={{
                  width: 10, height: 10, borderRadius: "50%", flexShrink: 0,
                  background: BAR_COLORS[i % BAR_COLORS.length],
                }} />
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#4b5563", flex: 1 }}>{type}</span>
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#9ca3af" }}>{pct}%</span>
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#1a1f0e", minWidth: 90, textAlign: "right" }}>
                  RWF {amount.toLocaleString()}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Branch breakdown table */}
      <div style={{ background: "#fff", border: "1px solid #e8ebe3", borderRadius: 10, overflow: "hidden" }}>
        <div style={{ padding: "14px 20px", borderBottom: "1px solid #e8ebe3" }}>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 500, color: "#1a1f0e" }}>
            Branch Breakdown
          </span>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f9faf7" }}>
              {["Branch", "Transfers", "Total Cost", "Avg. Cost / Transfer"].map(h => (
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
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ padding: "24px 16px", textAlign: "center", color: "#9ca3af", fontFamily: "'Inter', sans-serif", fontSize: 13 }}>
                  No data for selected filters.
                </td>
              </tr>
            ) : filtered.map((d, i) => (
              <tr key={d.branch} style={{ borderBottom: i < filtered.length - 1 ? "1px solid #f3f4f0" : "none" }}>
                <td style={{ padding: "12px 16px", fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#1a1f0e", fontWeight: 500 }}>{d.branch}</td>
                <td style={{ padding: "12px 16px", fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#4b5563" }}>{d.transfers}</td>
                <td style={{ padding: "12px 16px", fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#1a1f0e" }}>RWF {d.total.toLocaleString()}</td>
                <td style={{ padding: "12px 16px", fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#4b5563" }}>
                  RWF {Math.round(d.total / d.transfers).toLocaleString()}
                </td>
              </tr>
            ))}
            {filtered.length > 0 && (
              <tr style={{ background: "#f9faf7", borderTop: "1px solid #e8ebe3" }}>
                <td style={{ padding: "12px 16px", fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#1a1f0e", fontWeight: 500 }}>Total</td>
                <td style={{ padding: "12px 16px", fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#1a1f0e", fontWeight: 500 }}>{totalTransfers}</td>
                <td style={{ padding: "12px 16px", fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#3d7a2b", fontWeight: 500 }}>RWF {grandTotal.toLocaleString()}</td>
                <td style={{ padding: "12px 16px", fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#4b5563" }}>
                  RWF {avgCost.toLocaleString()}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}