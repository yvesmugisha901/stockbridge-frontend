"use client";
import { useState } from "react";

/**
 * StockTable
 * Displays per-branch stock levels with low-stock highlighting.
 * FR-10, FR-12, FR-13
 *
 * Props:
 *   items       {Array}    - [{ id, name, code, category, unit, quantity, reserved, minThreshold, branch }]
 *   showBranch  {boolean}  - show branch column (true for HO_ADMIN/ADMIN)
 *   onAdjust    {function} - called with item when "Adjust" is clicked (HO_ADMIN only)
 */
export default function StockTable({ items = [], showBranch = false, onAdjust }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sortKey, setSortKey] = useState("name");
  const [sortDir, setSortDir] = useState("asc");

  const categories = ["all", ...new Set(items.map((i) => i.category).filter(Boolean))];

  const filtered = items
    .filter((i) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q || i.name?.toLowerCase().includes(q) || i.code?.toLowerCase().includes(q);
      const matchCat = category === "all" || i.category === category;
      return matchSearch && matchCat;
    })
    .sort((a, b) => {
      let va = a[sortKey] ?? "";
      let vb = b[sortKey] ?? "";
      if (typeof va === "string") va = va.toLowerCase();
      if (typeof vb === "string") vb = vb.toLowerCase();
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

  function toggleSort(key) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  }

  function stockStatus(item) {
    const available = item.quantity - (item.reserved || 0);
    if (available <= 0) return "out";
    if (available <= item.minThreshold) return "low";
    return "ok";
  }

  const STATUS = {
    ok:  { label: "In Stock",    bg: "#1a3a2a", color: "#4ade80" },
    low: { label: "Low Stock",   bg: "#3a2a0a", color: "#fbbf24" },
    out: { label: "Out of Stock",bg: "#3a1a1a", color: "#f87171" },
  };

  const SortIcon = ({ k }) => (
    <span style={{ opacity: sortKey === k ? 1 : 0.3, marginLeft: "4px", fontSize: "0.7rem" }}>
      {sortKey === k ? (sortDir === "asc" ? "↑" : "↓") : "↕"}
    </span>
  );

  return (
    <div className="st-wrap">
      {/* Controls */}
      <div className="st-controls">
        <input
          className="st-search"
          placeholder="Search by name or code…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="st-select"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {categories.map((c) => (
            <option key={c} value={c}>{c === "all" ? "All Categories" : c}</option>
          ))}
        </select>
        <span className="st-count">{filtered.length} item{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      {/* Table */}
      <div className="st-table-wrap">
        <table className="st-table">
          <thead>
            <tr>
              <th className="st-th" onClick={() => toggleSort("code")} style={{ cursor: "pointer" }}>
                Code <SortIcon k="code" />
              </th>
              <th className="st-th" onClick={() => toggleSort("name")} style={{ cursor: "pointer" }}>
                Item Name <SortIcon k="name" />
              </th>
              <th className="st-th">Category</th>
              {showBranch && <th className="st-th">Branch</th>}
              <th className="st-th st-th-right" onClick={() => toggleSort("quantity")} style={{ cursor: "pointer" }}>
                On Hand <SortIcon k="quantity" />
              </th>
              <th className="st-th st-th-right">Reserved</th>
              <th className="st-th st-th-right">Available</th>
              <th className="st-th">Status</th>
              {onAdjust && <th className="st-th">Action</th>}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={onAdjust ? (showBranch ? 9 : 8) : (showBranch ? 8 : 7)} className="st-empty">
                  No items found.
                </td>
              </tr>
            ) : (
              filtered.map((item) => {
                const status = stockStatus(item);
                const available = item.quantity - (item.reserved || 0);
                const s = STATUS[status];
                return (
                  <tr
                    key={item.id}
                    className={`st-row ${status === "low" ? "st-row--low" : status === "out" ? "st-row--out" : ""}`}
                  >
                    <td className="st-code">{item.code}</td>
                    <td className="st-name">{item.name}</td>
                    <td>
                      <span className="st-cat">{item.category}</span>
                    </td>
                    {showBranch && <td className="st-branch-cell">{item.branch}</td>}
                    <td className="st-num">{item.quantity} {item.unit}</td>
                    <td className="st-num st-reserved">{item.reserved || 0}</td>
                    <td className="st-num st-available"
                        style={{ color: available <= 0 ? "#f87171" : available <= item.minThreshold ? "#fbbf24" : "#4ade80" }}>
                      {available}
                    </td>
                    <td>
                      <span className="st-badge" style={{ background: s.bg, color: s.color }}>
                        {s.label}
                      </span>
                    </td>
                    {onAdjust && (
                      <td>
                        <button className="st-adj-btn" onClick={() => onAdjust(item)}>
                          Adjust
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <style>{`
        .st-wrap { font-family: 'DM Sans', sans-serif; }
        .st-controls {
          display: flex; flex-wrap: wrap; gap: 0.75rem; align-items: center;
          margin-bottom: 1rem;
        }
        .st-search {
          flex: 1; min-width: 180px;
          background: #0f1623; border: 1px solid #1e2d45;
          border-radius: 8px; padding: 0.5rem 0.85rem;
          color: #e8edf5; font-size: 0.875rem; font-family: inherit;
        }
        .st-search:focus { outline: none; border-color: #3b82f6; }
        .st-select {
          background: #0f1623; border: 1px solid #1e2d45;
          border-radius: 8px; padding: 0.5rem 0.8rem;
          color: #e8edf5; font-size: 0.85rem; font-family: inherit;
        }
        .st-count { font-size: 0.8rem; color: #4a5568; margin-left: auto; }
        .st-table-wrap { overflow-x: auto; border-radius: 10px; border: 1px solid #1e2d45; }
        .st-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
        .st-table thead tr { background: #0a0e14; }
        .st-th {
          padding: 0.7rem 1rem; text-align: left;
          font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.1em;
          color: #8899b0; font-weight: 600; border-bottom: 1px solid #1e2d45;
          user-select: none;
        }
        .st-th-right { text-align: right; }
        .st-row { border-bottom: 1px solid #111927; transition: background 0.1s; }
        .st-row:hover { background: #0f1623; }
        .st-row--low { background: #1a1500 !important; }
        .st-row--out { background: #1a0a0a !important; }
        .st-table td { padding: 0.7rem 1rem; color: #cbd5e1; vertical-align: middle; }
        .st-code { font-family: monospace; font-size: 0.78rem; color: #8899b0; }
        .st-name { font-weight: 600; color: #e8edf5; }
        .st-cat {
          font-size: 0.72rem; background: #161f2e; color: #8899b0;
          padding: 0.15rem 0.5rem; border-radius: 10px;
        }
        .st-num { text-align: right; font-variant-numeric: tabular-nums; }
        .st-reserved { color: #8899b0; }
        .st-available { font-weight: 700; }
        .st-branch-cell { font-size: 0.82rem; color: #94a3b8; }
        .st-badge {
          font-size: 0.7rem; font-weight: 700; letter-spacing: 0.05em;
          padding: 0.2rem 0.55rem; border-radius: 20px; white-space: nowrap;
        }
        .st-adj-btn {
          background: transparent; border: 1px solid #1e2d45;
          color: #8899b0; border-radius: 6px; padding: 0.25rem 0.65rem;
          font-size: 0.75rem; cursor: pointer; transition: all 0.15s;
          font-family: inherit;
        }
        .st-adj-btn:hover { border-color: #3b82f6; color: #3b82f6; }
        .st-empty { text-align: center; padding: 2.5rem; color: #4a5568; }
      `}</style>
    </div>
  );
}