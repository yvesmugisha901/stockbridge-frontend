"use client";
import { useState } from "react";

function DownloadIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/>
      <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  );
}
function FilterIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
    </svg>
  );
}
function ChevronLeft() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
}
function ChevronRight() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
}

const COST_TYPE_COLORS = {
  Transport: "#3d7a2b",
  Handling:  "#1d6fa8",
  Insurance: "#b45309",
  Labour:    "#7c3aed",
  Other:     "#6b7260",
};

const PAGE_SIZE_OPTIONS = [10, 20, 50]

const selectStyle = {
  padding: "7px 12px", border: "1px solid #e8ebe3", borderRadius: 6,
  fontFamily: "'Inter', system-ui, sans-serif", fontSize: 13,
  color: "#1a1f0e", background: "#fff", cursor: "pointer", outline: "none",
};
const inputStyle = { ...selectStyle, fontFamily: "'DM Mono', monospace", fontSize: 12 };

/**
 * FinanceSummaryTable
 * Props:
 *   data     {Array}    – mapped records from AccountantReports
 *   branches {Array}    – [{ id, name }]
 *   onExport {function} – called with filtered rows
 *
 * Each record is expected to have:
 *   transferValue  – value of goods (always a number)
 *   costAmount     – logistics cost: labour, transport, insurance (0 if not recorded)
 *   totalCost      – transferValue + costAmount (always a number)
 */
export default function FinanceSummaryTable({ data = [], branches = [], onExport }) {
  const [filters,  setFilters]  = useState({ branch: "all", from: "", to: "" })
  const [page,     setPage]     = useState(1)
  const [pageSize, setPageSize] = useState(10)

  function setFilter(key, val) {
    setFilters(f => ({ ...f, [key]: val }))
    setPage(1)
  }

  const filtered = data.filter(row => {
    if (filters.branch !== "all") {
      const sel = String(filters.branch)
      const matchSource  = row.sourceBranchId      != null && String(row.sourceBranchId)      === sel
      const matchDest    = row.destinationBranchId != null && String(row.destinationBranchId) === sel
      const matchSrcName = row.sourceBranchName    != null && row.sourceBranchName            === sel
      const matchDstName = row.destinationBranchName != null && row.destinationBranchName     === sel
      if (!matchSource && !matchDest && !matchSrcName && !matchDstName) return false
    }
    if (filters.from && row.date && row.date < filters.from) return false
    if (filters.to   && row.date && row.date > filters.to)   return false
    return true
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const safePage   = Math.min(page, totalPages)
  const pageStart  = (safePage - 1) * pageSize
  const pageEnd    = pageStart + pageSize
  const pageRows   = filtered.slice(pageStart, pageEnd)

  // KPI totals use totalCost = transferValue + costAmount across all filtered rows
  const grandTotal     = filtered.reduce((s, r) => s + Number(r.totalCost ?? 0), 0)
  const avgCost        = filtered.length > 0 ? Math.round(grandTotal / filtered.length) : 0

  const fmt = n => new Intl.NumberFormat("en-RW").format(n)

  function displayDate(d) {
    if (!d) return "—"
    const [y, m, day] = d.split("-")
    return `${day}/${m}/${y}`
  }

  return (
    <div>
      {/* Filters */}
      <div style={{ background: "#fff", border: "1px solid #e8ebe3", borderRadius: 10, padding: "14px 18px", marginBottom: 20, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 5, color: "#9ca3af", fontFamily: "'Inter', sans-serif", fontSize: 12 }}>
          <FilterIcon /> Filters
        </span>
        <div style={{ width: 1, height: 20, background: "#e8ebe3" }} />

        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <label style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", color: "#b8bead" }}>Branch</label>
          <select value={filters.branch} onChange={e => setFilter("branch", e.target.value)} style={selectStyle}>
            <option value="all">All Branches</option>
            {branches.map(b => <option key={b.id} value={b.id ?? b.name}>{b.name}</option>)}
          </select>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <label style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", color: "#b8bead" }}>Date From</label>
          <input type="date" value={filters.from} onChange={e => setFilter("from", e.target.value)} style={inputStyle} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <label style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", color: "#b8bead" }}>Date To</label>
          <input type="date" value={filters.to} onChange={e => setFilter("to", e.target.value)} style={inputStyle} />
        </div>

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#6b7260", background: "#f3f4f0", padding: "5px 10px", borderRadius: 5 }}>
            {filtered.length} record{filtered.length !== 1 ? "s" : ""}
          </span>
          <button onClick={() => onExport?.(filtered)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 6, border: "none", background: "#3d7a2b", color: "#fff", fontFamily: "'Inter', sans-serif", fontSize: 13, cursor: "pointer" }}>
            <DownloadIcon /> Export CSV
          </button>
        </div>
      </div>

      {/* KPI cards — all use totalCost = transferValue + costAmount */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 20 }}>
        {[
          { label: "Total Cost (RWF)",     value: `RWF ${fmt(grandTotal)}`, sub: "Transfer value + logistics costs" },
          { label: "Records",              value: filtered.length,           sub: "In filtered period"               },
          { label: "Avg. Cost / Transfer", value: `RWF ${fmt(avgCost)}`,    sub: "Filtered period"                  },
        ].map(({ label, value, sub }) => (
          <div key={label} style={{ background: "#fff", border: "1px solid #e8ebe3", borderRadius: 10, padding: "18px 20px" }}>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#6b7260", margin: "0 0 10px" }}>{label}</p>
            <p style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 22, color: "#1a1f0e", margin: "0 0 4px" }}>{value}</p>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "#9ca3af", margin: 0 }}>{sub}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: "#fff", border: "1px solid #e8ebe3", borderRadius: 10, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f9faf7" }}>
              {["Transfer ID", "Branch", "Cost Type", "Date", "Transfer Value", "Cost (Logistics)", "Total Cost"].map(h => (
                <th key={h} style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "#9ca3af", padding: "10px 16px", textAlign: ["Transfer Value", "Cost (Logistics)", "Total Cost"].includes(h) ? "right" : "left", fontWeight: 400, borderBottom: "1px solid #e8ebe3" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: "32px 16px", textAlign: "center", color: "#9ca3af", fontFamily: "'Inter', sans-serif", fontSize: 13 }}>
                  No records match the selected filters.
                </td>
              </tr>
            ) : pageRows.map((row, i) => {
              const color       = COST_TYPE_COLORS[row.costType] || "#6b7260"
              const tv          = Number(row.transferValue ?? 0)
              const ca          = Number(row.costAmount    ?? 0)
              const total       = Number(row.totalCost     ?? tv)

              return (
                <tr key={row.transferId + "-" + i} style={{ borderBottom: i < pageRows.length - 1 ? "1px solid #f3f4f0" : "none" }}>
                  <td style={{ padding: "11px 16px", fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#3d7a2b" }}>
                    #{row.transferId}
                  </td>
                  <td style={{ padding: "11px 16px", fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#4b5563" }}>
                    {row.route || row.sourceBranchName}
                  </td>
                  <td style={{ padding: "11px 16px" }}>
                    {row.costType ? (
                      <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em", color, background: color + "18", padding: "3px 8px", borderRadius: 4 }}>
                        {row.costType}
                      </span>
                    ) : (
                      <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#9ca3af" }}>—</span>
                    )}
                  </td>
                  <td style={{ padding: "11px 16px", fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#9ca3af" }}>
                    {displayDate(row.date)}
                  </td>
                  {/* Transfer Value — value of goods */}
                  <td style={{ padding: "11px 16px", textAlign: "right", fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#1a1f0e" }}>
                    {fmt(tv)} {row.currency}
                  </td>
                  {/* Cost (Logistics) — optional extra cost; shows — if zero */}
                  <td style={{ padding: "11px 16px", textAlign: "right", fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#6b7260" }}>
                    {ca > 0 ? `${fmt(ca)} ${row.currency}` : <span style={{ color: "#9ca3af" }}>—</span>}
                  </td>
                  {/* Total Cost = transferValue + costAmount */}
                  <td style={{ padding: "11px 16px", textAlign: "right", fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#1a1f0e", fontWeight: 600 }}>
                    {fmt(total)} {row.currency}
                  </td>
                </tr>
              )
            })}

            {/* Totals row */}
            {filtered.length > 0 && (
              <tr style={{ background: "#f9faf7", borderTop: "1px solid #e8ebe3" }}>
                <td colSpan={4} style={{ padding: "12px 16px", fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 500, color: "#1a1f0e" }}>
                  Grand Total — {filtered.length} transfer{filtered.length !== 1 ? "s" : ""}
                </td>
                <td style={{ padding: "12px 16px", textAlign: "right", fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#4b5563" }}>
                  {fmt(filtered.reduce((s, r) => s + Number(r.transferValue ?? 0), 0))} RWF
                </td>
                <td style={{ padding: "12px 16px", textAlign: "right", fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#6b7260" }}>
                  {fmt(filtered.reduce((s, r) => s + Number(r.costAmount ?? 0), 0))} RWF
                </td>
                <td style={{ padding: "12px 16px", textAlign: "right", fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#3d7a2b", fontWeight: 600 }}>
                  {fmt(grandTotal)} RWF
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {filtered.length > 0 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderTop: "1px solid #e8ebe3", flexWrap: "wrap", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#6b7260" }}>Rows per page</span>
              <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1) }} style={{ ...selectStyle, padding: "4px 8px", fontSize: 12 }}>
                {PAGE_SIZE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#6b7260" }}>
                {pageStart + 1}–{Math.min(pageEnd, filtered.length)} of {filtered.length}
              </span>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={safePage === 1}
                style={{ display: "flex", alignItems: "center", padding: "5px 8px", borderRadius: 5, border: "1px solid #e8ebe3", background: safePage === 1 ? "#f9faf7" : "#fff", color: safePage === 1 ? "#c5c9bf" : "#4b5563", cursor: safePage === 1 ? "default" : "pointer" }}>
                <ChevronLeft />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1)
                .reduce((acc, p, idx, arr) => {
                  if (idx > 0 && p - arr[idx - 1] > 1) acc.push("…")
                  acc.push(p)
                  return acc
                }, [])
                .map((p, idx) =>
                  p === "…" ? (
                    <span key={"ellipsis-" + idx} style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#9ca3af", padding: "0 4px" }}>…</span>
                  ) : (
                    <button key={p} onClick={() => setPage(p)}
                      style={{ padding: "5px 10px", borderRadius: 5, border: `1px solid ${safePage === p ? "#3d7a2b" : "#e8ebe3"}`, background: safePage === p ? "#f0f7ed" : "#fff", color: safePage === p ? "#3d7a2b" : "#4b5563", fontFamily: "'DM Mono', monospace", fontSize: 11, cursor: "pointer" }}>
                      {p}
                    </button>
                  )
                )
              }

              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}
                style={{ display: "flex", alignItems: "center", padding: "5px 8px", borderRadius: 5, border: "1px solid #e8ebe3", background: safePage === totalPages ? "#f9faf7" : "#fff", color: safePage === totalPages ? "#c5c9bf" : "#4b5563", cursor: safePage === totalPages ? "default" : "pointer" }}>
                <ChevronRight />
              </button>
            </div>

            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "#9ca3af" }}>
              Total Cost = Transfer Value + Logistics Cost (optional)
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
