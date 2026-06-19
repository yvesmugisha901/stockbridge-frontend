"use client"
import { useState, useEffect, useMemo } from "react"
import { api } from "@/lib/api/client"
import toast from "react-hot-toast"
import PageHeader from "@/components/ui/PageHeader"

// ─── Icons ────────────────────────────────────────────────────────────────────
const IconDownload = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
)
const IconFilter = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
  </svg>
)
const IconSearch = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
)
const IconChevronLeft = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
)
const IconChevronRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
)

// ─── Status styles ────────────────────────────────────────────────────────────
const STATUS_STYLE = {
  PENDING:          { background: "#fef9c3", color: "#a16207" },
  MANAGER_APPROVED: { background: "#dbeafe", color: "#1d4ed8" },
  HO_APPROVED:      { background: "#e0e7ff", color: "#4338ca" },
  IN_TRANSIT:       { background: "#f3e8ff", color: "#7e22ce" },
  COMPLETED:        { background: "#dcfce7", color: "#15803d" },
  REJECTED:         { background: "#fee2e2", color: "#dc2626" },
  CANCELLED:        { background: "#f3f4f6", color: "#6b7280" },
}

const STATUS_LABEL = {
  PENDING: "Pending", MANAGER_APPROVED: "Manager Approved",
  HO_APPROVED: "HO Approved", IN_TRANSIT: "In Transit",
  COMPLETED: "Completed", REJECTED: "Rejected", CANCELLED: "Cancelled",
}

const ALL_STATUSES = [
  "ALL", "PENDING", "MANAGER_APPROVED", "HO_APPROVED",
  "IN_TRANSIT", "COMPLETED", "REJECTED", "CANCELLED",
]

const PAGE_SIZE_OPTIONS = [25, 50, 100]

// ─── Pagination helper ─────────────────────────────────────────────────────────
// Builds a compact page list like: 1 2 3 4 5 ... 124  or  1 ... 60 61 62 ... 124
function buildPageList(current, total) {
  const pages = []
  const add = (p) => pages.push(p)
  const siblings = 1 // pages shown on each side of current

  const left  = Math.max(2, current - siblings)
  const right = Math.min(total - 1, current + siblings)

  add(1)
  if (left > 2) add("ellipsis-left")
  for (let p = left; p <= right; p++) add(p)
  if (right < total - 1) add("ellipsis-right")
  if (total > 1) add(total)

  return pages
}

export default function ManagerReportsPage() {
  const [transfers, setTransfers] = useState([])
  const [items, setItems]         = useState([])
  const [loading, setLoading]     = useState(false)
  const [hasRun, setHasRun]       = useState(false)

  // ─── Filters ───────────────────────────────────────────────────────────────
  const [statusFilter, setStatus] = useState("ALL")
  const [itemFilter, setItem]     = useState("")
  const [dateFrom, setDateFrom]   = useState("")
  const [dateTo, setDateTo]       = useState("")
  const [search, setSearch]       = useState("")

  // ─── Pagination (client-side, applied after filtering/search) ─────────────
  const [page, setPage]         = useState(1)
  const [pageSize, setPageSize] = useState(25)

  // Load item list for filter dropdown — FR-29
  // GET /api/v1/items → Page<ItemResponse> → .data.content ✓ (confirmed from ItemController)
  useEffect(() => {
    api.get("/items?size=200").then(res => {
      if (res?.success) setItems(res.data?.content ?? [])
    }).catch(() => {})
  }, [])

  // ─── Run report — FR-26 ────────────────────────────────────────────────────
  async function runReport() {
    try {
      setLoading(true)
      setHasRun(true)
      setPage(1)

      // GET /api/v1/transfers → Page<TransferResponse> → .data.content
      const params = new URLSearchParams({ size: "200", page: "0" })
      if (statusFilter !== "ALL") params.append("status", statusFilter)
      if (itemFilter)             params.append("itemId", itemFilter)
      if (dateFrom)               params.append("fromDate", dateFrom)
      if (dateTo)                 params.append("toDate", dateTo)

      const res = await api.get(`/transfers?${params.toString()}`)
      if (res?.success) {
        setTransfers(res.data?.content ?? [])
      } else {
        toast.error(res?.message || "Failed to generate report")
      }
    } catch (err) {
      toast.error(err.message || "Report generation failed")
    } finally {
      setLoading(false)
    }
  }

  function clearFilters() {
    setStatus("ALL")
    setItem("")
    setDateFrom("")
    setDateTo("")
    setSearch("")
    setTransfers([])
    setHasRun(false)
    setPage(1)
  }

  // ─── Client-side keyword search on results — FR-29 ────────────────────────
  const filtered = transfers.filter(t => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      t.itemName?.toLowerCase().includes(q) ||
      t.sourceBranchName?.toLowerCase().includes(q) ||
      t.destinationBranchName?.toLowerCase().includes(q) ||
      (t.referenceNumber ?? `#${t.id}`).toLowerCase().includes(q)
    )
  })

  // ─── Pagination derived state ──────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))

  // Clamp page if filters/search/pageSize shrink the result set below current page
  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [totalPages]) // eslint-disable-line react-hooks/exhaustive-deps

  const safePage = Math.min(page, totalPages)
  const startIdx = (safePage - 1) * pageSize
  const endIdx   = Math.min(startIdx + pageSize, filtered.length)
  const paginated = filtered.slice(startIdx, endIdx)

  const pageList = useMemo(() => buildPageList(safePage, totalPages), [safePage, totalPages])

  function goToPage(p) {
    const clamped = Math.max(1, Math.min(p, totalPages))
    setPage(clamped)
  }

  function handlePageSizeChange(newSize) {
    // Keep the user roughly anchored on the same record when page size changes
    const firstVisibleIdx = (safePage - 1) * pageSize
    setPageSize(newSize)
    setPage(Math.floor(firstVisibleIdx / newSize) + 1)
  }

  // ─── CSV Export — FR-28 (exports the full filtered set, not just current page) ──
  function exportCSV() {
    if (filtered.length === 0) { toast.error("Nothing to export"); return }
    const headers = [
      "Request ID", "Item", "From Branch", "To Branch",
      "Qty", "Total Value", "Status", "Requested By", "Date",
    ]
    const rows = filtered.map(t => [
      t.referenceNumber ?? `#${t.id}`,
      t.itemName ?? "",
      t.sourceBranchName ?? "",
      t.destinationBranchName ?? "",
      t.quantity,
      t.totalValue ?? "",
      STATUS_LABEL[t.status] ?? t.status,
      t.requestedByEmail ?? "",
      t.requestedAt ? new Date(t.requestedAt).toLocaleDateString() : "",
    ])
    const csv  = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement("a")
    a.href     = url
    a.download = `transfer-report-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success("CSV exported")
  }

  // ─── Totals summary (computed over the full filtered set, not just the page) ──
  const totalQty   = filtered.reduce((sum, t) => sum + (t.quantity ?? 0), 0)
  const totalValue = filtered.reduce((sum, t) => sum + (Number(t.totalValue) || 0), 0)

  const labelStyle = {
    fontFamily: "'DM Mono', monospace", fontSize: 9,
    textTransform: "uppercase", letterSpacing: "0.12em",
    color: "#9ca3af", marginBottom: 6, display: "block",
  }

  const inputStyle = {
    border: "1px solid #dde0d4", background: "#f7f8f4",
    padding: "8px 12px", fontSize: 13,
    fontFamily: "'Inter', sans-serif", color: "#1a1f0e",
    outline: "none", width: "100%", boxSizing: "border-box",
  }

  const hasFilters = statusFilter !== "ALL" || itemFilter || dateFrom || dateTo

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      <PageHeader
        title="Branch Transfer Report"
        subtitle="Filter and export transfer history for your branch."
      />

      {/* ── Filter Panel — FR-26, FR-31, FR-32 ── */}
      <div style={{
        background: "#fff", border: "1px solid #dde0d4", padding: "20px 24px",
        display: "flex", flexDirection: "column", gap: 16,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: "#6b7260" }}><IconFilter /></span>
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.12em", color: "#9ca3af" }}>
            Report Filters
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}>

          {/* Status — FR-31 */}
          <div>
            <span style={labelStyle}>Status</span>
            <select value={statusFilter} onChange={e => setStatus(e.target.value)} style={inputStyle}>
              {ALL_STATUSES.map(s => (
                <option key={s} value={s}>
                  {s === "ALL" ? "All Statuses" : STATUS_LABEL[s] ?? s}
                </option>
              ))}
            </select>
          </div>

          {/* Item — FR-29 */}
          <div>
            <span style={labelStyle}>Item</span>
            <select value={itemFilter} onChange={e => setItem(e.target.value)} style={inputStyle}>
              <option value="">All Items</option>
              {/* items from GET /api/v1/items (Page) — item.name and item.code confirmed from ItemResponse */}
              {items.map(item => (
                <option key={item.id} value={item.id}>
                  {item.name}{item.code ? ` (${item.code})` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Date From — FR-32 */}
          <div>
            <span style={labelStyle}>From Date</span>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={inputStyle} />
          </div>

          {/* Date To — FR-32 */}
          <div>
            <span style={labelStyle}>To Date</span>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={inputStyle} />
          </div>

        </div>

        {/* Actions row */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <button
            onClick={runReport}
            disabled={loading}
            style={{
              background: loading ? "#9ca3af" : "#3d7a2b",
              color: "#fff", border: "none",
              cursor: loading ? "wait" : "pointer",
              padding: "9px 20px", fontSize: 13,
              fontFamily: "'Inter', sans-serif", fontWeight: 500,
            }}
          >
            {loading ? "Generating..." : "Run Report"}
          </button>

          {hasFilters && (
            <button
              onClick={clearFilters}
              style={{
                background: "none", border: "none", cursor: "pointer",
                fontSize: 12, color: "#9ca3af",
                fontFamily: "'Inter', sans-serif", textDecoration: "underline", padding: 0,
              }}
            >
              Clear filters
            </button>
          )}

          {hasRun && filtered.length > 0 && (
            <button
              onClick={exportCSV}
              style={{
                marginLeft: "auto",
                display: "inline-flex", alignItems: "center", gap: 6,
                background: "#f7f8f4", border: "1px solid #dde0d4",
                cursor: "pointer", padding: "8px 16px",
                fontFamily: "'Inter', sans-serif", fontSize: 12,
                color: "#1a1f0e", fontWeight: 500,
              }}
            >
              <IconDownload /> Export CSV
            </button>
          )}
        </div>
      </div>

      {/* ── Results ── */}
      {hasRun && (
        <>
          {/* Summary bar */}
          {!loading && filtered.length > 0 && (
            <div style={{
              display: "flex", flexWrap: "wrap", gap: 24,
              background: "#f7f8f4", border: "1px solid #dde0d4",
              padding: "12px 24px",
            }}>
              {[
                ["Total Records",  filtered.length],
                ["Total Quantity", totalQty.toLocaleString()],
                ["Total Value",    new Intl.NumberFormat("en-RW", { style: "currency", currency: "RWF", maximumFractionDigits: 0 }).format(totalValue)],
              ].map(([label, value]) => (
                <div key={label}>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.12em", color: "#9ca3af", display: "block", marginBottom: 2 }}>
                    {label}
                  </span>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, fontWeight: 700, color: "#1a1f0e" }}>
                    {value}
                  </span>
                </div>
              ))}

              {/* Keyword search on results */}
              <div style={{
                marginLeft: "auto", display: "flex", alignItems: "center", gap: 8,
                border: "1px solid #dde0d4", background: "#fff",
                padding: "6px 12px", minWidth: 220,
              }}>
                <span style={{ color: "#9ca3af", flexShrink: 0 }}><IconSearch /></span>
                <input
                  type="text"
                  placeholder="Search results..."
                  value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1) }}
                  style={{
                    background: "transparent", border: "none", outline: "none",
                    fontSize: 13, fontFamily: "'Inter', sans-serif",
                    color: "#1a1f0e", width: "100%",
                  }}
                />
              </div>
            </div>
          )}

          {/* Table */}
          <div style={{ background: "#fff", border: "1px solid #dde0d4", overflow: "hidden" }}>
            {loading ? (
              <LoadingSpinner label="Generating report..." />
            ) : filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "48px 0", fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#9ca3af" }}>
                {search ? "No results match your search." : "No transfers found for the selected filters."}
              </div>
            ) : (
              <>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: "#f7f8f4", borderBottom: "1px solid #e8ebe3" }}>
                      {["Request ID", "Item", "From", "To", "Qty", "Value", "Status", "Requested By", "Date"].map(h => (
                        <th key={h} style={{
                          textAlign: "left", padding: "10px 20px",
                          fontFamily: "'DM Mono', monospace", fontSize: 10,
                          textTransform: "uppercase", letterSpacing: "0.1em",
                          color: "#9ca3af", fontWeight: 500,
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((t, idx) => (
                      <tr key={t.id} style={{ borderBottom: idx < paginated.length - 1 ? "1px solid #f0f1ec" : "none" }}>
                        <td style={{ padding: "12px 20px", fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#6b7260" }}>
                          {t.referenceNumber ?? `#${t.id}`}
                        </td>
                        <td style={{ padding: "12px 20px", fontFamily: "'Inter', sans-serif", fontWeight: 500, color: "#1a1f0e" }}>
                          {t.itemName}
                        </td>
                        <td style={{ padding: "12px 20px", fontFamily: "'Inter', sans-serif", color: "#6b7260" }}>
                          {t.sourceBranchName}
                        </td>
                        <td style={{ padding: "12px 20px", fontFamily: "'Inter', sans-serif", color: "#6b7260" }}>
                          {t.destinationBranchName}
                        </td>
                        <td style={{ padding: "12px 20px", fontFamily: "'Inter', sans-serif", fontWeight: 500, color: "#1a1f0e" }}>
                          {t.quantity}
                        </td>
                        <td style={{ padding: "12px 20px", fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#6b7260" }}>
                          {t.totalValue != null
                            ? new Intl.NumberFormat("en-RW", { style: "currency", currency: "RWF", maximumFractionDigits: 0 }).format(t.totalValue)
                            : "—"}
                        </td>
                        <td style={{ padding: "12px 20px" }}>
                          <span style={{
                            ...(STATUS_STYLE[t.status] ?? { background: "#f3f4f6", color: "#6b7280" }),
                            fontFamily: "'DM Mono', monospace", fontSize: 10,
                            fontWeight: 600, padding: "2px 8px", borderRadius: 999,
                          }}>
                            {STATUS_LABEL[t.status] ?? t.status}
                          </span>
                        </td>
                        <td style={{ padding: "12px 20px", fontFamily: "'Inter', sans-serif", color: "#6b7260" }}>
                          {t.requestedByEmail ?? "—"}
                        </td>
                        <td style={{ padding: "12px 20px", fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#9ca3af" }}>
                          {t.requestedAt ? new Date(t.requestedAt).toLocaleDateString() : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <PaginationBar
                  page={safePage}
                  totalPages={totalPages}
                  pageList={pageList}
                  pageSize={pageSize}
                  startIdx={startIdx}
                  endIdx={endIdx}
                  totalRecords={filtered.length}
                  onGoToPage={goToPage}
                  onPageSizeChange={handlePageSizeChange}
                />
              </>
            )}
          </div>
        </>
      )}

      {/* ── Initial empty state ── */}
      {!hasRun && (
        <div style={{
          textAlign: "center", padding: "48px 0",
          border: "1px solid #dde0d4", background: "#fff",
          fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#9ca3af",
        }}>
          Set your filters above and click <strong style={{ color: "#1a1f0e" }}>Run Report</strong> to generate results.
        </div>
      )}

    </div>
  )
}

// ─── Pagination Bar ─────────────────────────────────────────────────────────────
function PaginationBar({ page, totalPages, pageList, pageSize, startIdx, endIdx, totalRecords, onGoToPage, onPageSizeChange }) {
  const baseBtn = {
    fontFamily: "'DM Mono', monospace",
    fontSize: 12,
    minWidth: 28,
    height: 28,
    padding: "0 6px",
    border: "1px solid #dde0d4",
    background: "#fff",
    color: "#6b7260",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  }
  const activeBtn = { ...baseBtn, background: "#3d7a2b", border: "1px solid #3d7a2b", color: "#fff", fontWeight: 600 }
  const disabledBtn = { ...baseBtn, color: "#d1d5cf", cursor: "not-allowed" }

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        padding: "14px 20px",
        borderTop: "1px solid #e8ebe3",
        background: "#fbfcf9",
      }}
    >
      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#9ca3af" }}>
        Showing <strong style={{ color: "#1a1f0e" }}>{totalRecords === 0 ? 0 : startIdx + 1}–{endIdx}</strong> of{" "}
        <strong style={{ color: "#1a1f0e" }}>{totalRecords}</strong>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        {/* Page size selector */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", color: "#9ca3af" }}>
            Per page
          </span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            style={{
              border: "1px solid #dde0d4",
              background: "#fff",
              padding: "5px 8px",
              fontSize: 12,
              fontFamily: "'Inter', sans-serif",
              color: "#1a1f0e",
              outline: "none",
            }}
          >
            {PAGE_SIZE_OPTIONS.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>

        {/* Page controls */}
        {totalPages > 1 && (
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <button
              onClick={() => onGoToPage(page - 1)}
              disabled={page === 1}
              style={page === 1 ? disabledBtn : baseBtn}
              aria-label="Previous page"
            >
              <IconChevronLeft />
            </button>

            {pageList.map((p, idx) =>
              typeof p === "number" ? (
                <button
                  key={p}
                  onClick={() => onGoToPage(p)}
                  style={p === page ? activeBtn : baseBtn}
                >
                  {p}
                </button>
              ) : (
                <span
                  key={`${p}-${idx}`}
                  style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#9ca3af", padding: "0 4px" }}
                >
                  …
                </span>
              )
            )}

            <button
              onClick={() => onGoToPage(page + 1)}
              disabled={page === totalPages}
              style={page === totalPages ? disabledBtn : baseBtn}
              aria-label="Next page"
            >
              <IconChevronRight />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function LoadingSpinner({ label }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "48px 0" }}>
      <div style={{ width: 24, height: 24, border: "2px solid #dde0d4", borderTopColor: "#3d7a2b", borderRadius: "50%", animation: "sb-spin 0.7s linear infinite" }} />
      <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#6b7260", textTransform: "uppercase", letterSpacing: "0.1em" }}>
        {label}
      </span>
      <style>{`@keyframes sb-spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}