"use client";
import { useState } from "react";

/**
 * FinanceSummaryTable
 * Shows total transfer costs filtered by date range and branch.
 * Matches the accountant dashboard light theme.
 *
 * Props:
 *   data     {Array}    – [{ branch, costType, amount, currency, date, transferId }]
 *   branches {Array}    – [{ id, name }] for the branch filter dropdown
 *   onExport {function} – called with filtered rows when Export CSV is clicked
 */

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

const COST_TYPE_COLORS = {
  Transport:  "#3d7a2b",
  Handling:   "#1d6fa8",
  Insurance:  "#b45309",
  Labour:     "#7c3aed",
  Other:      "#6b7260",
};

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
};

const inputStyle = {
  ...selectStyle,
  fontFamily: "'DM Mono', monospace",
  fontSize: 12,
};

export default function FinanceSummaryTable({ data = [], branches = [], onExport }) {
  const [filters, setFilters] = useState({ branch: "all", from: "", to: "" });

  function setFilter(key, val) {
    setFilters((f) => ({ ...f, [key]: val }));
  }

  const filtered = data.filter((row) => {
    if (filters.branch !== "all" && row.branch !== filters.branch) return false;
    if (filters.from && new Date(row.date) < new Date(filters.from)) return false;
    if (filters.to   && new Date(row.date) > new Date(filters.to))   return false;
    return true;
  });

  const totalRWF = filtered
    .filter((r) => r.currency === "RWF")
    .reduce((s, r) => s + r.amount, 0);

  const avgCost = filtered.length > 0 ? Math.round(totalRWF / filtered.length) : 0;

  const fmt = (n) => new Intl.NumberFormat("en-RW").format(n);

  return (
    <div>
      {/* Filters */}
      <div style={{
        background: "#fff", border: "1px solid #e8ebe3", borderRadius: 10,
        padding: "14px 18px", marginBottom: 20,
        display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap",
      }}>
        <span style={{
          display: "flex", alignItems: "center", gap: 5,
          color: "#9ca3af", fontFamily: "'Inter', sans-serif", fontSize: 12,
        }}>
          <FilterIcon /> Filters
        </span>
        <div style={{ width: 1, height: 20, background: "#e8ebe3" }} />

        {/* Branch */}
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <label style={{
            fontFamily: "'DM Mono', monospace", fontSize: 9,
            textTransform: "uppercase", letterSpacing: "0.1em", color: "#b8bead",
          }}>Branch</label>
          <select
            value={filters.branch}
            onChange={(e) => setFilter("branch", e.target.value)}
            style={selectStyle}
          >
            <option value="all">All Branches</option>
            {branches.map((b) => (
              <option key={b.id} value={b.name}>{b.name}</option>
            ))}
          </select>
        </div>

        {/* Date from */}
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <label style={{
            fontFamily: "'DM Mono', monospace", fontSize: 9,
            textTransform: "uppercase", letterSpacing: "0.1em", color: "#b8bead",
          }}>Date From</label>
          <input
            type="date" value={filters.from}
            onChange={(e) => setFilter("from", e.target.value)}
            style={inputStyle}
          />
        </div>

        {/* Date to */}
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <label style={{
            fontFamily: "'DM Mono', monospace", fontSize: 9,
            textTransform: "uppercase", letterSpacing: "0.1em", color: "#b8bead",
          }}>Date To</label>
          <input
            type="date" value={filters.to}
            onChange={(e) => setFilter("to", e.target.value)}
            style={inputStyle}
          />
        </div>

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{
            fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#6b7260",
            background: "#f3f4f0", padding: "5px 10px", borderRadius: 5,
          }}>
            {filtered.length} record{filtered.length !== 1 ? "s" : ""}
          </span>
          <button
            onClick={() => onExport?.(filtered)}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "7px 14px", borderRadius: 6, border: "none",
              background: "#3d7a2b", color: "#fff",
              fontFamily: "'Inter', sans-serif", fontSize: 13, cursor: "pointer",
            }}
          >
            <DownloadIcon /> Export CSV
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 20 }}>
        {[
          { label: "Total Cost (RWF)",         value: `RWF ${fmt(totalRWF)}`,  sub: "Filtered period" },
          { label: "Records",                  value: filtered.length,          sub: "Cost entries"    },
          { label: "Avg. Cost / Transfer",     value: `RWF ${fmt(avgCost)}`,   sub: "Filtered period" },
        ].map(({ label, value, sub }) => (
          <div key={label} style={{
            background: "#fff", border: "1px solid #e8ebe3",
            borderRadius: 10, padding: "18px 20px",
          }}>
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
              {["Transfer ID", "Branch", "Cost Type", "Date", "Amount"].map((h) => (
                <th key={h} style={{
                  fontFamily: "'DM Mono', monospace", fontSize: 10,
                  textTransform: "uppercase", letterSpacing: "0.1em",
                  color: "#9ca3af", padding: "10px 16px",
                  textAlign: h === "Amount" ? "right" : "left",
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
                <td colSpan={5} style={{
                  padding: "32px 16px", textAlign: "center",
                  color: "#9ca3af", fontFamily: "'Inter', sans-serif", fontSize: 13,
                }}>
                  No records match the selected filters.
                </td>
              </tr>
            ) : filtered.map((row, i) => {
              const color = COST_TYPE_COLORS[row.costType] || "#6b7260";
              return (
                <tr key={i} style={{ borderBottom: i < filtered.length - 1 ? "1px solid #f3f4f0" : "none" }}>
                  <td style={{ padding: "11px 16px", fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#3d7a2b" }}>
                    {row.transferId}
                  </td>
                  <td style={{ padding: "11px 16px", fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#4b5563" }}>
                    {row.branch}
                  </td>
                  <td style={{ padding: "11px 16px" }}>
                    <span style={{
                      fontFamily: "'DM Mono', monospace", fontSize: 10,
                      textTransform: "uppercase", letterSpacing: "0.06em",
                      color, background: color + "18",
                      padding: "3px 8px", borderRadius: 4,
                    }}>
                      {row.costType}
                    </span>
                  </td>
                  <td style={{ padding: "11px 16px", fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#9ca3af" }}>
                    {new Date(row.date).toLocaleDateString("en-GB")}
                  </td>
                  <td style={{
                    padding: "11px 16px", textAlign: "right",
                    fontFamily: "'DM Mono', monospace", fontSize: 12,
                    color: "#1a1f0e", fontWeight: 500,
                  }}>
                    {fmt(row.amount)} {row.currency}
                  </td>
                </tr>
              );
            })}

            {/* Totals row */}
            {filtered.length > 0 && (
              <tr style={{ background: "#f9faf7", borderTop: "1px solid #e8ebe3" }}>
                <td colSpan={4} style={{
                  padding: "12px 16px",
                  fontFamily: "'Inter', sans-serif", fontSize: 13,
                  fontWeight: 500, color: "#1a1f0e",
                }}>
                  Total (RWF)
                </td>
                <td style={{
                  padding: "12px 16px", textAlign: "right",
                  fontFamily: "'DM Mono', monospace", fontSize: 12,
                  color: "#3d7a2b", fontWeight: 500,
                }}>
                  {fmt(totalRWF)} RWF
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}