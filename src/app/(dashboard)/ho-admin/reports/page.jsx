"use client"
import { useState, useEffect } from "react"
import { api } from "@/lib/api/client"
import toast from "react-hot-toast"
import PageHeader from "@/components/ui/PageHeader"

// ── Icons ──────────────────────────────────────────────────────────────────────
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

// ── Constants ──────────────────────────────────────────────────────────────────
const REPORT_TYPES = [
  { value: "TRANSFER_HISTORY", label: "Transfer History" },
  { value: "STOCK_LEVELS",     label: "Stock Levels"     },
  { value: "LOW_STOCK",        label: "Low Stock Alerts" },
]

const ALL_STATUSES = ["ALL", "PENDING", "MANAGER_APPROVED", "HO_APPROVED", "IN_TRANSIT", "RECEIVED", "COMPLETED", "REJECTED", "CANCELLED"]

const STATUS_STYLE = {
  PENDING:          { background: "#fef9c3", color: "#a16207" },
  MANAGER_APPROVED: { background: "#dbeafe", color: "#1d4ed8" },
  HO_APPROVED:      { background: "#e0e7ff", color: "#4338ca" },
  IN_TRANSIT:       { background: "#f3e8ff", color: "#7e22ce" },
  RECEIVED:         { background: "#fef3c7", color: "#b45309" },
  COMPLETED:        { background: "#dcfce7", color: "#15803d" },
  REJECTED:         { background: "#fee2e2", color: "#dc2626" },
  CANCELLED:        { background: "#f3f4f6", color: "#6b7280" },
}
const STATUS_LABEL = {
  PENDING: "Pending", MANAGER_APPROVED: "Manager Approved",
  HO_APPROVED: "HO Approved", IN_TRANSIT: "In Transit",
  RECEIVED: "Received", COMPLETED: "Completed",
  REJECTED: "Rejected", CANCELLED: "Cancelled",
}

const RWF = (v) => v != null
  ? new Intl.NumberFormat("en-RW", { style: "currency", currency: "RWF", maximumFractionDigits: 0 }).format(v)
  : "—"

// ── Page ───────────────────────────────────────────────────────────────────────
export default function HOReportsPage() {
  const [reportType, setReportType] = useState("TRANSFER_HISTORY")
  const [branches, setBranches]     = useState([])
  const [items, setItems]           = useState([])
  const [results, setResults]       = useState([])
  const [loading, setLoading]       = useState(false)
  const [hasRun, setHasRun]         = useState(false)
  const [search, setSearch]         = useState("")

  // Filter state — all stored as strings (select values), parsed to int on send
  const [branchFilter, setBranch]   = useState("")
  const [statusFilter, setStatus]   = useState("ALL")
  const [itemFilter, setItem]       = useState("")
  const [dateFrom, setDateFrom]     = useState("")
  const [dateTo, setDateTo]         = useState("")

useEffect(() => {
  api.get("/branches?size=100&sort=name,asc")
    .then((r) => setBranches(Array.isArray(r?.data) ? r.data : r?.data?.content ?? []))
    .catch(() => {})
  api.get("/items?size=200&sort=name,asc")
    .then((r) => setItems(Array.isArray(r?.data) ? r.data : r?.data?.content ?? []))
    .catch(() => {})
}, [])
  // ── Run Report ──────────────────────────────────────────────────────────────
  async function runReport() {
    try {
      setLoading(true)
      setHasRun(true)
      setSearch("")

      const params = new URLSearchParams({ size: "500" })

      // FIX: always parseInt branchId and itemId so Spring receives a proper Long,
      // not a string — prevents silent filter failures on numeric @RequestParam bindings.
      const branchId = branchFilter ? parseInt(branchFilter, 10) : null
      const itemId   = itemFilter   ? parseInt(itemFilter,   10) : null

      if (reportType === "TRANSFER_HISTORY") {
        if (statusFilter !== "ALL")  params.append("status",   statusFilter)
        if (branchId !== null)       params.append("branchId", branchId)
        if (itemId   !== null)       params.append("itemId",   itemId)
        if (dateFrom)                params.append("fromDate", dateFrom)
        if (dateTo)                  params.append("toDate",   dateTo)
        const res = await api.get(`/transfers?${params}`)
        setResults(res?.data?.content ?? [])

      } else if (reportType === "STOCK_LEVELS") {
        if (branchId !== null) params.append("branchId", branchId)
        if (itemId   !== null) params.append("itemId",   itemId)
        const res = await api.get(`/stock?${params}`)
        setResults(res?.data?.content ?? [])

      } else if (reportType === "LOW_STOCK") {
        if (branchId !== null) params.append("branchId", branchId)
        const res = await api.get(`/stock/low-stock-alerts?${params}`)
        // low-stock-alerts returns ApiResponse<List<...>>, not a Page —
        // unwrap res.data.data if the wrapper is present, else fall back to res.data
        const payload = res?.data
        if (Array.isArray(payload)) {
          setResults(payload)
        } else if (Array.isArray(payload?.data)) {
          setResults(payload.data)
        } else if (Array.isArray(payload?.content)) {
          setResults(payload.content)
        } else {
          setResults([])
        }
      }
    } catch (err) {
      toast.error(err.message || "Report generation failed")
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  function clearFilters() {
    setBranch(""); setStatus("ALL"); setItem("")
    setDateFrom(""); setDateTo(""); setSearch("")
    setResults([]); setHasRun(false)
  }

  // ── Client-side keyword search ──────────────────────────────────────────────
  const filtered = results.filter((r) => {
    if (!search) return true
    const q = search.toLowerCase()
    if (reportType === "TRANSFER_HISTORY") {
      return (
        String(r.id).includes(q) ||
        r.itemName?.toLowerCase().includes(q) ||
        r.itemCode?.toLowerCase().includes(q) ||
        r.sourceBranchName?.toLowerCase().includes(q) ||
        r.destinationBranchName?.toLowerCase().includes(q)
      )
    }
    // STOCK_LEVELS and LOW_STOCK share same fields
    return (
      r.itemName?.toLowerCase().includes(q) ||
      r.itemCode?.toLowerCase().includes(q) ||
      r.branchName?.toLowerCase().includes(q)
    )
  })

  // ── CSV Export ──────────────────────────────────────────────────────────────
  function exportCSV() {
    if (filtered.length === 0) { toast.error("Nothing to export"); return }
    let headers, rows

    if (reportType === "TRANSFER_HISTORY") {
      headers = ["ID", "Item", "Item Code", "From Branch", "To Branch", "Qty", "Total Value", "Status", "Requested By", "Requested At"]
      rows = filtered.map((t) => [
        t.id, t.itemName ?? "", t.itemCode ?? "",
        t.sourceBranchName ?? "", t.destinationBranchName ?? "",
        t.quantity, t.totalValue ?? "",
        STATUS_LABEL[t.status] ?? t.status,
        t.requestedByEmail ?? "",
        t.requestedAt ? new Date(t.requestedAt).toLocaleDateString() : "",
      ])
    } else if (reportType === "STOCK_LEVELS") {
      headers = ["Item Code", "Item Name", "Branch", "On Hand", "Reserved", "Min Threshold", "Low Stock"]
      rows = filtered.map((s) => [
        s.itemCode ?? "", s.itemName ?? "", s.branchName ?? "",
        s.quantityOnHand, s.reservedQuantity ?? 0, s.minimumThreshold,
        s.isLowStock ? "YES" : "NO",
      ])
    } else {
      headers = ["Item Code", "Item Name", "Branch", "On Hand", "Min Threshold", "Deficit"]
      rows = filtered.map((s) => [
        s.itemCode ?? "", s.itemName ?? "", s.branchName ?? "",
        s.quantityOnHand, s.minimumThreshold, s.deficit ?? "",
      ])
    }

    const csv  = [headers, ...rows].map((r) => r.map((v) => `"${v}"`).join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement("a")
    a.href     = url
    a.download = `ho-report-${reportType.toLowerCase()}-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success("CSV exported")
  }

  // ── Summary totals ──────────────────────────────────────────────────────────
  const totalQty   = reportType === "TRANSFER_HISTORY" ? filtered.reduce((s, t) => s + (t.quantity ?? 0), 0) : null
  const totalValue = reportType === "TRANSFER_HISTORY" ? filtered.reduce((s, t) => s + (Number(t.totalValue) || 0), 0) : null

  const showBranchFilter = true
  const showStatusFilter = reportType === "TRANSFER_HISTORY"
  const showItemFilter   = reportType !== "LOW_STOCK"
  const showDateFilter   = reportType === "TRANSFER_HISTORY"
  const hasFilters       = branchFilter || statusFilter !== "ALL" || itemFilter || dateFrom || dateTo

  const labelStyle = { fontFamily: "'DM Mono', monospace", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.12em", color: "#9ca3af", marginBottom: 6, display: "block" }
  const inputStyle = { border: "1px solid #dde0d4", background: "#f7f8f4", padding: "8px 12px", fontSize: 13, fontFamily: "'Inter', sans-serif", color: "#1a1f0e", outline: "none", width: "100%", boxSizing: "border-box" }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      <PageHeader
        title="System Reports"
        subtitle="Generate system-wide stock and transfer reports, filter by branch, and export to CSV."
      />

      {/* Report type tabs */}
      <div style={{ display: "flex", gap: 0, borderBottom: "1px solid #dde0d4" }}>
        {REPORT_TYPES.map((rt) => (
          <button
            key={rt.value}
            onClick={() => { setReportType(rt.value); clearFilters() }}
            style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 500, padding: "10px 20px", border: "none", cursor: "pointer", borderBottom: reportType === rt.value ? "2px solid #3d7a2b" : "2px solid transparent", background: "transparent", color: reportType === rt.value ? "#3d7a2b" : "#6b7260" }}
          >
            {rt.label}
          </button>
        ))}
      </div>

      {/* Filter panel */}
      <div style={{ background: "#fff", border: "1px solid #dde0d4", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: "#6b7260" }}><IconFilter /></span>
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.12em", color: "#9ca3af" }}>Filters</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 16 }}>

          {showBranchFilter && (
            <div>
              <span style={labelStyle}>Branch</span>
              <select value={branchFilter} onChange={(e) => setBranch(e.target.value)} style={inputStyle}>
                <option value="">All Branches</option>
                {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
          )}

          {showStatusFilter && (
            <div>
              <span style={labelStyle}>Status</span>
              <select value={statusFilter} onChange={(e) => setStatus(e.target.value)} style={inputStyle}>
                {ALL_STATUSES.map((s) => (
                  <option key={s} value={s}>{s === "ALL" ? "All Statuses" : STATUS_LABEL[s] ?? s}</option>
                ))}
              </select>
            </div>
          )}

          {showItemFilter && (
            <div>
              <span style={labelStyle}>Item</span>
              <select value={itemFilter} onChange={(e) => setItem(e.target.value)} style={inputStyle}>
                <option value="">All Items</option>
                {items.map((i) => (
                  <option key={i.id} value={i.id}>{i.name}{i.code ? ` (${i.code})` : ""}</option>
                ))}
              </select>
            </div>
          )}

          {showDateFilter && (
            <>
              <div>
                <span style={labelStyle}>From Date</span>
                <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <span style={labelStyle}>To Date</span>
                <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} style={inputStyle} />
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <button
            onClick={runReport}
            disabled={loading}
            style={{ background: loading ? "#9ca3af" : "#3d7a2b", color: "#fff", border: "none", cursor: loading ? "wait" : "pointer", padding: "9px 20px", fontSize: 13, fontFamily: "'Inter', sans-serif", fontWeight: 500 }}
          >
            {loading ? "Generating..." : "Run Report"}
          </button>

          {hasFilters && (
            <button onClick={clearFilters} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "#9ca3af", fontFamily: "'Inter', sans-serif", textDecoration: "underline", padding: 0 }}>
              Clear filters
            </button>
          )}

          {hasRun && filtered.length > 0 && (
            <button
              onClick={exportCSV}
              style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 6, background: "#f7f8f4", border: "1px solid #dde0d4", cursor: "pointer", padding: "8px 16px", fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#1a1f0e", fontWeight: 500 }}
            >
              <IconDownload /> Export CSV
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      {hasRun && (
        <>
          {!loading && filtered.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 24, alignItems: "center", background: "#f7f8f4", border: "1px solid #dde0d4", padding: "12px 24px" }}>
              <div>
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.12em", color: "#9ca3af", display: "block", marginBottom: 2 }}>Records</span>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, fontWeight: 700, color: "#1a1f0e" }}>{filtered.length}</span>
              </div>
              {totalQty !== null && (
                <div>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.12em", color: "#9ca3af", display: "block", marginBottom: 2 }}>Total Qty</span>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, fontWeight: 700, color: "#1a1f0e" }}>{totalQty.toLocaleString()}</span>
                </div>
              )}
              {totalValue !== null && (
                <div>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.12em", color: "#9ca3af", display: "block", marginBottom: 2 }}>Total Value</span>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, fontWeight: 700, color: "#1a1f0e" }}>{RWF(totalValue)}</span>
                </div>
              )}

              <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8, border: "1px solid #dde0d4", background: "#fff", padding: "6px 12px", minWidth: 220 }}>
                <span style={{ color: "#9ca3af", flexShrink: 0 }}><IconSearch /></span>
                <input
                  type="text"
                  placeholder="Search results..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ background: "transparent", border: "none", outline: "none", fontSize: 13, fontFamily: "'Inter', sans-serif", color: "#1a1f0e", width: "100%" }}
                />
              </div>
            </div>
          )}

          <div style={{ background: "#fff", border: "1px solid #dde0d4", overflow: "hidden" }}>
            {loading ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "48px 0" }}>
                <div style={{ width: 24, height: 24, border: "2px solid #dde0d4", borderTopColor: "#3d7a2b", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#6b7260", textTransform: "uppercase" }}>Generating report...</span>
                <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "48px 0", fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#9ca3af" }}>
                {search ? "No results match your search." : "No data found for the selected filters."}
              </div>
            ) : reportType === "TRANSFER_HISTORY" ? (
              <TransferTable rows={filtered} />
            ) : reportType === "STOCK_LEVELS" ? (
              <StockTable rows={filtered} />
            ) : (
              <LowStockTable rows={filtered} />
            )}
          </div>
        </>
      )}

      {!hasRun && (
        <div style={{ textAlign: "center", padding: "48px 0", border: "1px solid #dde0d4", background: "#fff", fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#9ca3af" }}>
          Select a report type, set your filters, and click <strong style={{ color: "#1a1f0e" }}>Run Report</strong>.
        </div>
      )}
    </div>
  )
}

// ── Transfer History Table ─────────────────────────────────────────────────────
function TransferTable({ rows }) {
  return (
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
      <thead>
        <tr style={{ background: "#f7f8f4", borderBottom: "1px solid #e8ebe3" }}>
          {["ID", "Item", "Item Code", "From", "To", "Qty", "Value", "Status", "Requested By", "Date"].map((h) => (
            <th key={h} style={{ textAlign: "left", padding: "10px 16px", fontFamily: "'DM Mono', monospace", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "#9ca3af", fontWeight: 500 }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((t, idx) => (
          <tr key={t.id} style={{ borderBottom: idx < rows.length - 1 ? "1px solid #f0f1ec" : "none" }}>
            <td style={{ padding: "12px 16px", fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#6b7260" }}>#{t.id}</td>
            <td style={{ padding: "12px 16px", fontFamily: "'Inter', sans-serif", fontWeight: 500, color: "#1a1f0e" }}>{t.itemName}</td>
            <td style={{ padding: "12px 16px", fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#9ca3af" }}>{t.itemCode ?? "—"}</td>
            <td style={{ padding: "12px 16px", fontFamily: "'Inter', sans-serif", color: "#6b7260" }}>{t.sourceBranchName}</td>
            <td style={{ padding: "12px 16px", fontFamily: "'Inter', sans-serif", color: "#6b7260" }}>{t.destinationBranchName}</td>
            <td style={{ padding: "12px 16px", fontFamily: "'Inter', sans-serif", fontWeight: 500, color: "#1a1f0e" }}>{t.quantity}</td>
            <td style={{ padding: "12px 16px", fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#6b7260" }}>
              {t.totalValue != null ? new Intl.NumberFormat("en-RW", { style: "currency", currency: "RWF", maximumFractionDigits: 0 }).format(t.totalValue) : "—"}
            </td>
            <td style={{ padding: "12px 16px" }}>
              <span style={{ ...(STATUS_STYLE[t.status] ?? { background: "#f3f4f6", color: "#6b7280" }), fontFamily: "'DM Mono', monospace", fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 999 }}>
                {STATUS_LABEL[t.status] ?? t.status}
              </span>
            </td>
            <td style={{ padding: "12px 16px", fontFamily: "'Inter', sans-serif", color: "#6b7260" }}>{t.requestedByEmail ?? "—"}</td>
            <td style={{ padding: "12px 16px", fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#9ca3af" }}>
              {t.requestedAt ? new Date(t.requestedAt).toLocaleDateString() : "—"}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

// ── Stock Levels Table ─────────────────────────────────────────────────────────
function StockTable({ rows }) {
  return (
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
      <thead>
        <tr style={{ background: "#f7f8f4", borderBottom: "1px solid #e8ebe3" }}>
          {["Item Code", "Item Name", "Branch", "On Hand", "Reserved", "Min Threshold", "Status"].map((h) => (
            <th key={h} style={{ textAlign: "left", padding: "10px 16px", fontFamily: "'DM Mono', monospace", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "#9ca3af", fontWeight: 500 }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((s, idx) => (
          <tr key={s.id ?? idx} style={{ borderBottom: idx < rows.length - 1 ? "1px solid #f0f1ec" : "none" }}>
            <td style={{ padding: "12px 16px", fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#6b7260" }}>{s.itemCode ?? "—"}</td>
            <td style={{ padding: "12px 16px", fontFamily: "'Inter', sans-serif", fontWeight: 500, color: "#1a1f0e" }}>{s.itemName}</td>
            <td style={{ padding: "12px 16px", fontFamily: "'Inter', sans-serif", color: "#6b7260" }}>{s.branchName ?? "—"}</td>
            <td style={{ padding: "12px 16px", fontFamily: "'Inter', sans-serif", fontWeight: 600, color: s.isLowStock ? "#dc2626" : "#1a1f0e" }}>{s.quantityOnHand}</td>
            <td style={{ padding: "12px 16px", fontFamily: "'Inter', sans-serif", color: "#9ca3af" }}>{s.reservedQuantity ?? 0}</td>
            <td style={{ padding: "12px 16px", fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#6b7260" }}>{s.minimumThreshold}</td>
            <td style={{ padding: "12px 16px" }}>
              {s.isLowStock ? (
                <span style={{ display: "inline-block", background: "#fef2f2", color: "#dc2626", border: "1px solid #fee2e2", fontFamily: "'DM Mono', monospace", fontSize: 10, fontWeight: 600, padding: "2px 8px" }}>
                  BELOW MIN
                </span>
              ) : (
                <span style={{ display: "inline-block", background: "#f0f7ed", color: "#3d7a2b", border: "1px solid #e1eedb", fontFamily: "'DM Mono', monospace", fontSize: 10, padding: "2px 8px" }}>
                  SAFE
                </span>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

// ── Low Stock Table ────────────────────────────────────────────────────────────
function LowStockTable({ rows }) {
  return (
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
      <thead>
        <tr style={{ background: "#f7f8f4", borderBottom: "1px solid #e8ebe3" }}>
          {["Item Code", "Item Name", "Branch", "On Hand", "Min Threshold", "Deficit"].map((h) => (
            <th key={h} style={{ textAlign: "left", padding: "10px 16px", fontFamily: "'DM Mono', monospace", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "#9ca3af", fontWeight: 500 }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((s, idx) => (
          <tr key={`${s.itemId}-${s.branchId}`} style={{ borderBottom: idx < rows.length - 1 ? "1px solid #f0f1ec" : "none" }}>
            <td style={{ padding: "12px 16px", fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#6b7260" }}>{s.itemCode ?? "—"}</td>
            <td style={{ padding: "12px 16px", fontFamily: "'Inter', sans-serif", fontWeight: 500, color: "#1a1f0e" }}>{s.itemName}</td>
            <td style={{ padding: "12px 16px", fontFamily: "'Inter', sans-serif", color: "#6b7260" }}>{s.branchName}</td>
            <td style={{ padding: "12px 16px", fontFamily: "'Inter', sans-serif", fontWeight: 600, color: "#dc2626" }}>{s.quantityOnHand}</td>
            <td style={{ padding: "12px 16px", fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#6b7260" }}>{s.minimumThreshold}</td>
            <td style={{ padding: "12px 16px", fontFamily: "'Inter', sans-serif", fontWeight: 600, color: "#dc2626" }}>
              -{s.deficit}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}