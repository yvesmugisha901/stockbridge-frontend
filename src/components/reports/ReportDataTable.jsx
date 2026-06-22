"use client";
import { useState } from "react";

/**
 * ReportDataTable
 * Generic sortable data table used in all report pages.
 * FR-25, FR-26, FR-27, FR-28
 *
 * Props:
 *   columns  {Array}  - [{ key, label, align?, render? }]
 *   rows     {Array}  - array of data objects
 *   loading  {boolean}
 *   emptyMsg {string}
 */
export default function ReportDataTable({
  columns = [],
  rows = [],
  loading = false,
  emptyMsg = "No data available.",
}) {
  const [sortKey, setSortKey] = useState(columns[0]?.key || "");
  const [sortDir, setSortDir] = useState("asc");
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 15;

  function toggleSort(key) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
    setPage(0);
  }

  const sorted = [...rows].sort((a, b) => {
    let va = a[sortKey] ?? "";
    let vb = b[sortKey] ?? "";
    if (typeof va === "string") va = va.toLowerCase();
    if (typeof vb === "string") vb = vb.toLowerCase();
    if (va < vb) return sortDir === "asc" ? -1 : 1;
    if (va > vb) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const paged = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <div className="rdt-wrap">
      <div className="rdt-meta">
        <span className="rdt-count">{rows.length} record{rows.length !== 1 ? "s" : ""}</span>
        {totalPages > 1 && (
          <span className="rdt-pages">
            Page {page + 1} of {totalPages}
          </span>
        )}
      </div>

      <div className="rdt-table-wrap">
        {loading ? (
          <div className="rdt-loading">
            <div className="rdt-spinner" />
            Loading report…
          </div>
        ) : (
          <table className="rdt-table">
            <thead>
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={`rdt-th ${col.align === "right" ? "rdt-th--right" : ""}`}
                    onClick={() => toggleSort(col.key)}
                  >
                    {col.label}
                    <span className="rdt-sort-icon">
                      {sortKey === col.key ? (sortDir === "asc" ? " ↑" : " ↓") : " ↕"}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="rdt-empty">{emptyMsg}</td>
                </tr>
              ) : (
                paged.map((row, i) => (
                  <tr key={row.id ?? i} className="rdt-row">
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={`rdt-td ${col.align === "right" ? "rdt-td--right" : ""}`}
                      >
                        {col.render ? col.render(row[col.key], row) : row[col.key] ?? "—"}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="rdt-pagination">
          <button
            className="rdt-pg-btn"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
          >
            ← Prev
          </button>
          <div className="rdt-pg-nums">
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              const pg = totalPages <= 7 ? i : i; // simplify for now
              return (
                <button
                  key={pg}
                  className={`rdt-pg-num ${page === pg ? "rdt-pg-num--active" : ""}`}
                  onClick={() => setPage(pg)}
                >
                  {pg + 1}
                </button>
              );
            })}
          </div>
          <button
            className="rdt-pg-btn"
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
          >
            Next →
          </button>
        </div>
      )}

      <style>{`
        .rdt-wrap { font-family: 'DM Sans', sans-serif; }
        .rdt-meta {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 0.5rem;
        }
        .rdt-count { font-size: 0.78rem; color: #4a5568; }
        .rdt-pages { font-size: 0.78rem; color: #4a5568; }
        .rdt-table-wrap { overflow-x: auto; border-radius: 10px; border: 1px solid #1e2d45; }
        .rdt-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
        .rdt-table thead tr { background: #0a0e14; }
        .rdt-th {
          padding: 0.7rem 1rem; text-align: left; cursor: pointer; user-select: none;
          font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.1em;
          color: #8899b0; font-weight: 600; border-bottom: 1px solid #1e2d45;
          white-space: nowrap;
        }
        .rdt-th:hover { color: #e8edf5; }
        .rdt-th--right { text-align: right; }
        .rdt-sort-icon { font-size: 0.65rem; opacity: 0.6; }
        .rdt-row { border-bottom: 1px solid #111927; transition: background 0.1s; }
        .rdt-row:last-child { border-bottom: none; }
        .rdt-row:hover { background: #0f1623; }
        .rdt-td { padding: 0.7rem 1rem; color: #cbd5e1; vertical-align: middle; }
        .rdt-td--right { text-align: right; }
        .rdt-empty { text-align: center; padding: 3rem; color: #4a5568; font-size: 0.875rem; }
        .rdt-loading {
          display: flex; align-items: center; justify-content: center;
          gap: 0.75rem; padding: 3rem; color: #4a5568; font-size: 0.875rem;
        }
        .rdt-spinner {
          width: 18px; height: 18px; border: 2px solid #1e2d45;
          border-top-color: #3b82f6; border-radius: 50%;
          animation: rdt-spin 0.7s linear infinite;
        }
        @keyframes rdt-spin { to { transform: rotate(360deg); } }
        .rdt-pagination {
          display: flex; align-items: center; justify-content: center;
          gap: 0.4rem; margin-top: 1rem; flex-wrap: wrap;
        }
        .rdt-pg-btn {
          background: transparent; border: 1px solid #1e2d45; color: #8899b0;
          border-radius: 7px; padding: 0.35rem 0.8rem; font-size: 0.8rem;
          cursor: pointer; transition: all 0.15s; font-family: inherit;
        }
        .rdt-pg-btn:hover:not(:disabled) { background: #1a2436; color: #e8edf5; }
        .rdt-pg-btn:disabled { opacity: 0.35; cursor: default; }
        .rdt-pg-nums { display: flex; gap: 0.25rem; }
        .rdt-pg-num {
          width: 32px; height: 32px; border-radius: 7px; border: 1px solid #1e2d45;
          background: transparent; color: #8899b0; font-size: 0.8rem;
          cursor: pointer; transition: all 0.15s; font-family: inherit;
        }
        .rdt-pg-num:hover { background: #1a2436; color: #e8edf5; }
        .rdt-pg-num--active { background: #3b82f6; border-color: #3b82f6; color: #fff; }
      `}</style>
    </div>
  );
}