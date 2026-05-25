"use client";
import { useState } from "react";

/**
 * ReportFilterBar
 * Universal filter bar used across all report pages.
 * FR-25, FR-26, FR-27, FR-30, FR-31, FR-32
 *
 * Props:
 *   reportType   {string}   - "stock" | "transfer" | "lowStock" | "finance"
 *   branches     {Array}    - [{ id, name }]
 *   categories   {Array}    - [string] (for stock report)
 *   statuses     {Array}    - [string] (for transfer report)
 *   onFilter     {function} - called with current filter state
 *   onExportCSV  {function} - called when Export CSV is clicked
 */
export default function ReportFilterBar({
  reportType = "stock",
  branches = [],
  categories = [],
  statuses = [],
  onFilter,
  onExportCSV,
}) {
  const [filters, setFilters] = useState({
    branch: "all",
    category: "all",
    status: "all",
    item: "",
    from: "",
    to: "",
  });

  function update(key, value) {
    const next = { ...filters, [key]: value };
    setFilters(next);
    onFilter?.(next);
  }

  const TRANSFER_STATUSES = statuses.length
    ? statuses
    : ["PENDING", "MANAGER_APPROVED", "HO_APPROVED", "IN_TRANSIT", "RECEIVED", "COMPLETED", "REJECTED", "CANCELLED"];

  return (
    <div className="rfb-wrap">
      <div className="rfb-filters">
        {/* Branch (all types) */}
        {reportType !== "lowStock" && (
          <div className="rfb-group">
            <label className="rfb-label">Branch</label>
            <select className="rfb-select" value={filters.branch} onChange={(e) => update("branch", e.target.value)}>
              <option value="all">All Branches</option>
              {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
        )}

        {/* Category (stock reports) */}
        {(reportType === "stock" || reportType === "lowStock") && categories.length > 0 && (
          <div className="rfb-group">
            <label className="rfb-label">Category</label>
            <select className="rfb-select" value={filters.category} onChange={(e) => update("category", e.target.value)}>
              <option value="all">All Categories</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        )}

        {/* Status (transfer reports) */}
        {reportType === "transfer" && (
          <div className="rfb-group">
            <label className="rfb-label">Status</label>
            <select className="rfb-select" value={filters.status} onChange={(e) => update("status", e.target.value)}>
              <option value="all">All Statuses</option>
              {TRANSFER_STATUSES.map((s) => (
                <option key={s} value={s}>{s.replace("_", " ")}</option>
              ))}
            </select>
          </div>
        )}

        {/* Item keyword (stock + transfer) */}
        {(reportType === "stock" || reportType === "transfer") && (
          <div className="rfb-group rfb-group--grow">
            <label className="rfb-label">Item</label>
            <input
              className="rfb-input"
              placeholder="Search by item name…"
              value={filters.item}
              onChange={(e) => update("item", e.target.value)}
            />
          </div>
        )}

        {/* Date range (transfer + finance) */}
        {(reportType === "transfer" || reportType === "finance") && (
          <>
            <div className="rfb-group">
              <label className="rfb-label">From</label>
              <input type="date" className="rfb-input" value={filters.from} onChange={(e) => update("from", e.target.value)} />
            </div>
            <div className="rfb-group">
              <label className="rfb-label">To</label>
              <input type="date" className="rfb-input" value={filters.to} onChange={(e) => update("to", e.target.value)} />
            </div>
          </>
        )}
      </div>

      {/* Action bar */}
      <div className="rfb-actions">
        <button
          className="rfb-reset"
          onClick={() => {
            const reset = { branch: "all", category: "all", status: "all", item: "", from: "", to: "" };
            setFilters(reset);
            onFilter?.(reset);
          }}
        >
          ↺ Reset
        </button>
        <button className="rfb-export" onClick={onExportCSV}>
          ↓ Export CSV
        </button>
      </div>

      <style>{`
        .rfb-wrap { font-family: 'DM Sans', sans-serif; }
        .rfb-filters {
          display: flex; flex-wrap: wrap; gap: 0.75rem; align-items: flex-end;
          padding: 1rem; background: #0f1623; border: 1px solid #1e2d45;
          border-radius: 10px; margin-bottom: 0.75rem;
        }
        .rfb-group { display: flex; flex-direction: column; gap: 0.3rem; min-width: 130px; }
        .rfb-group--grow { flex: 1; }
        .rfb-label { font-size: 0.7rem; font-weight: 600; color: #8899b0; text-transform: uppercase; letter-spacing: 0.08em; }
        .rfb-select, .rfb-input {
          background: #161f2e; border: 1px solid #1e2d45; border-radius: 7px;
          padding: 0.48rem 0.75rem; color: #e8edf5; font-size: 0.85rem;
          font-family: inherit; transition: border-color 0.15s; width: 100%; box-sizing: border-box;
        }
        .rfb-select:focus, .rfb-input:focus { outline: none; border-color: #3b82f6; }
        .rfb-actions { display: flex; justify-content: flex-end; gap: 0.5rem; }
        .rfb-reset {
          background: transparent; border: 1px solid #1e2d45; color: #8899b0;
          border-radius: 7px; padding: 0.42rem 0.9rem; font-size: 0.8rem;
          font-weight: 600; cursor: pointer; transition: all 0.15s; font-family: inherit;
        }
        .rfb-reset:hover { background: #1a2436; color: #e8edf5; }
        .rfb-export {
          background: transparent; border: 1px solid #3b82f6; color: #3b82f6;
          border-radius: 7px; padding: 0.42rem 1rem; font-size: 0.8rem;
          font-weight: 600; cursor: pointer; transition: all 0.15s; font-family: inherit;
        }
        .rfb-export:hover { background: #3b82f6; color: #fff; }
      `}</style>
    </div>
  );
}