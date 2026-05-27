"use client"
import { useState, useEffect, useCallback } from "react"
import PageHeader from "@/components/ui/PageHeader"
import { api } from "@/lib/api/client"
import toast from "react-hot-toast"

// ReportController endpoints available to ADMIN:
//   GET  /api/v1/reports/stock-levels          ?branchId, category, itemId
//   GET  /api/v1/reports/stock-levels/export   ?branchId, category, itemId  → CSV
//   GET  /api/v1/reports/transfer-history      ?branchId, status, itemId, fromDate, toDate
//   GET  /api/v1/reports/transfer-history/export                            → CSV
// Note: /reports/low-stock is HO_ADMIN only — not shown here

const TRANSFER_STATUSES = [
  "PENDING", "MANAGER_APPROVED", "HO_APPROVED",
  "IN_TRANSIT", "RECEIVED", "COMPLETED", "REJECTED", "CANCELLED",
]

const STATUS_META = {
  PENDING:          { bg: "#fef9e7", color: "#b45309" },
  MANAGER_APPROVED: { bg: "#eff6ff", color: "#1d4ed8" },
  HO_APPROVED:      { bg: "#e4f0df", color: "#3d7a2b" },
  IN_TRANSIT:       { bg: "#f0f4ff", color: "#4338ca" },
  RECEIVED:         { bg: "#e4f0df", color: "#166534" },
  COMPLETED:        { bg: "#e4f0df", color: "#3d7a2b" },
  REJECTED:         { bg: "#fef2f2", color: "#dc2626" },
  CANCELLED:        { bg: "#f3f4f0", color: "#6b7260" },
}

// ── Icons ─────────────────────────────────────────────────────
const IconDownload = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
)

const IconRefresh = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10"/>
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
  </svg>
)

// ── Helpers ───────────────────────────────────────────────────
function formatDate(dt) {
  if (!dt) return "—"
  return new Date(dt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

function formatCurrency(val) {
  if (val == null) return "—"
  return new Intl.NumberFormat("en-RW", { style: "currency", currency: "RWF", maximumFractionDigits: 0 }).format(val)
}

// Backend returns ApiResponse<Object> — unwrap defensively
function unwrap(res) {
  const d = res?.data
  if (Array.isArray(d))           return d           // flat list
  if (Array.isArray(d?.content))  return d.content   // paginated
  if (Array.isArray(d?.data))     return d.data      // nested
  return []
}

// Trigger CSV download from a blob
function downloadCsv(bytes, filename) {
  const blob = new Blob([bytes], { type: "text/csv" })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement("a")
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

// Build query string, omitting empty values
function buildParams(obj) {
  const p = new URLSearchParams()
  Object.entries(obj).forEach(([k, v]) => { if (v) p.set(k, v) })
  return p.toString()
}

// ── Shared sub-components ─────────────────────────────────────
function FilterRow({ children }) {
  return (
    <div style={{
      display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10,
      background: "#fff", border: "1px solid #dde0d4", padding: "12px 16px",
    }}>
      {children}
    </div>
  )
}

function Select({ value, onChange, children, minWidth = 150 }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} style={{
      fontFamily: "'Geist', sans-serif", fontSize: 13, color: "#1a1f0e",
      padding: "6px 10px", border: "1px solid #dde0d4",
      background: "#f7f8f4", outline: "none", cursor: "pointer", minWidth,
    }}>
      {children}
    </select>
  )
}

function DateInput({ value, onChange, placeholder }) {
  return (
    <input type="date" value={value} onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        fontFamily: "'Geist', sans-serif", fontSize: 13, color: "#1a1f0e",
        padding: "6px 10px", border: "1px solid #dde0d4",
        background: "#f7f8f4", outline: "none", minWidth: 140,
      }}
    />
  )
}

function ActionBtn({ onClick, disabled, children, variant = "default" }) {
  const styles = {
    default: { background: "#f7f8f4", color: "#6b7260",  border: "1px solid #dde0d4" },
    primary: { background: "#1a1f0e", color: "#fff",      border: "1px solid #1a1f0e" },
    export:  { background: "#f0f7ed", color: "#3d7a2b",  border: "1px solid #e1eedb" },
  }
  return (
    <button onClick={onClick} disabled={disabled} style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      fontFamily: "'DM Mono', monospace", fontSize: 11, textTransform: "uppercase",
      padding: "7px 12px", cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.5 : 1, transition: "all 120ms",
      ...styles[variant],
    }}>
      {children}
    </button>
  )
}

function EmptyState({ msg }) {
  return (
    <tr>
      <td colSpan={99} style={{
        padding: 48, textAlign: "center",
        fontFamily: "'Geist', sans-serif", fontSize: 13, color: "#9ca3af",
      }}>
        {msg}
      </td>
    </tr>
  )
}

function LoadingRow() {
  return (
    <tr>
      <td colSpan={99} style={{ padding: 48, textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
          <div style={{
            width: 18, height: 18, borderRadius: "50%",
            border: "2px solid #dde0d4", borderTopColor: "#3d7a2b",
            animation: "rp-spin 0.7s linear infinite",
          }} />
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#9ca3af", textTransform: "uppercase" }}>
            Loading…
          </span>
        </div>
        <style>{`@keyframes rp-spin { to { transform: rotate(360deg) } }`}</style>
      </td>
    </tr>
  )
}

function TableWrap({ children }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #dde0d4", overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, fontFamily: "'Geist', sans-serif" }}>
        {children}
      </table>
    </div>
  )
}

function THead({ cols }) {
  return (
    <thead>
      <tr style={{ background: "#f7f8f4", borderBottom: "1px solid #e8ebe3" }}>
        {cols.map(h => (
          <th key={h} style={{
            padding: "10px 14px", textAlign: "left", whiteSpace: "nowrap",
            fontFamily: "'DM Mono', monospace", fontSize: 9,
            textTransform: "uppercase", letterSpacing: "0.1em",
            color: "#9ca3af", fontWeight: 500,
          }}>{h}</th>
        ))}
      </tr>
    </thead>
  )
}

function SectionHeader({ title, subtitle, count, onExport, exporting }) {
  return (
    <div style={{
      display: "flex", alignItems: "flex-end", justifyContent: "space-between",
      flexWrap: "wrap", gap: 10,
    }}>
      <div>
        <h2 style={{ fontFamily: "'Geist', sans-serif", fontSize: 14, fontWeight: 700, color: "#1a1f0e", margin: "0 0 2px" }}>
          {title}
          {count != null && (
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#9ca3af", fontWeight: 400, marginLeft: 8 }}>
              {count} record{count !== 1 ? "s" : ""}
            </span>
          )}
        </h2>
        <p style={{ fontFamily: "'Geist', sans-serif", fontSize: 12, color: "#9ca3af", margin: 0 }}>{subtitle}</p>
      </div>
      <ActionBtn onClick={onExport} disabled={exporting} variant="export">
        <IconDownload /> {exporting ? "Exporting…" : "Export CSV"}
      </ActionBtn>
    </div>
  )
}

// ── Tab: Stock Level Report (FR-25) ───────────────────────────
function StockLevelReport({ branches }) {
  const [rows,      setRows]      = useState([])
  const [loading,   setLoading]   = useState(false)
  const [exporting, setExporting] = useState(false)
  const [branchId,  setBranchId]  = useState("")
  const [category,  setCategory]  = useState("")

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const q = buildParams({ branchId, category })
      // GET /api/v1/reports/stock-levels?branchId&category&itemId
      const res = await api.get(`/reports/stock-levels${q ? `?${q}` : ""}`)
      setRows(unwrap(res))
    } catch (err) {
      toast.error(err?.response?.data?.message ?? "Failed to load stock level report")
    } finally {
      setLoading(false)
    }
  }, [branchId, category])

  useEffect(() => { load() }, [load])

  async function handleExport() {
    setExporting(true)
    try {
      const q = buildParams({ branchId, category })
      // GET /api/v1/reports/stock-levels/export → CSV bytes
      const res = await api.get(
        `/reports/stock-levels/export${q ? `?${q}` : ""}`,
        { responseType: "arraybuffer" }
      )
      downloadCsv(res, "stock-levels-report.csv")
      toast.success("CSV downloaded")
    } catch {
      toast.error("Export failed")
    } finally {
      setExporting(false)
    }
  }

  // Derive unique categories from loaded rows for the filter
  const categories = [...new Set(rows.map(r => r.category).filter(Boolean))]

  const COLS = ["Branch", "Item Code", "Item Name", "Category", "On Hand", "Reserved", "Available", "Min Threshold", "Status"]

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <SectionHeader
        title="Stock Level Report"
        subtitle="FR-25 · Filtered by branch and category"
        count={loading ? null : rows.length}
        onExport={handleExport}
        exporting={exporting}
      />

      <FilterRow>
        <Select value={branchId} onChange={setBranchId} minWidth={160}>
          <option value="">All Branches</option>
          {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </Select>

        <Select value={category} onChange={setCategory} minWidth={150}>
          <option value="">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </Select>

        <ActionBtn onClick={load} disabled={loading} variant="default">
          <IconRefresh /> Refresh
        </ActionBtn>
      </FilterRow>

      <TableWrap>
        <THead cols={COLS} />
        <tbody>
          {loading ? <LoadingRow /> : rows.length === 0 ? (
            <EmptyState msg="No stock records match the selected filters." />
          ) : rows.map((r, i) => {
            const low       = r.lowStock || r.quantityOnHand <= r.minimumThreshold
            const available = (r.quantityOnHand ?? 0) - (r.reservedQuantity ?? 0)
            return (
              <tr key={r.id ?? i} style={{ borderBottom: "1px solid #f0f1ec" }}
                onMouseEnter={e => e.currentTarget.style.background = "#fafbf8"}
                onMouseLeave={e => e.currentTarget.style.background = ""}>
                <td style={{ padding: "10px 14px", fontWeight: 600, color: "#1a1f0e" }}>{r.branchName ?? "—"}</td>
                <td style={{ padding: "10px 14px", fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#3d7a2b", fontWeight: 600 }}>{r.itemCode ?? "—"}</td>
                <td style={{ padding: "10px 14px", color: "#1a1f0e" }}>{r.itemName ?? "—"}</td>
                <td style={{ padding: "10px 14px", color: "#6b7260", fontSize: 12 }}>{r.category ?? "—"}</td>
                <td style={{ padding: "10px 14px", fontFamily: "'DM Mono', monospace", fontWeight: 700, color: low ? "#dc2626" : "#1a1f0e" }}>{r.quantityOnHand ?? 0}</td>
                <td style={{ padding: "10px 14px", fontFamily: "'DM Mono', monospace", color: "#9ca3af" }}>{r.reservedQuantity ?? 0}</td>
                <td style={{ padding: "10px 14px", fontFamily: "'DM Mono', monospace", fontWeight: 600, color: available <= 0 ? "#dc2626" : available <= r.minimumThreshold ? "#d97706" : "#1a1f0e" }}>{available}</td>
                <td style={{ padding: "10px 14px", fontFamily: "'DM Mono', monospace", color: "#9ca3af" }}>{r.minimumThreshold ?? "—"}</td>
                <td style={{ padding: "10px 14px" }}>
                  {low ? (
                    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, textTransform: "uppercase", padding: "2px 8px", background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" }}>Low</span>
                  ) : (
                    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, textTransform: "uppercase", padding: "2px 8px", background: "#f0f7ed", color: "#3d7a2b", border: "1px solid #e1eedb" }}>OK</span>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </TableWrap>
    </div>
  )
}

// ── Tab: Transfer History Report (FR-26) ──────────────────────
function TransferHistoryReport({ branches }) {
  const [rows,      setRows]      = useState([])
  const [loading,   setLoading]   = useState(false)
  const [exporting, setExporting] = useState(false)
  const [branchId,  setBranchId]  = useState("")
  const [status,    setStatus]    = useState("")
  const [fromDate,  setFromDate]  = useState("")
  const [toDate,    setToDate]    = useState("")

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const q = buildParams({ branchId, status, fromDate, toDate })
      // GET /api/v1/reports/transfer-history?branchId&status&itemId&fromDate&toDate
      const res = await api.get(`/reports/transfer-history${q ? `?${q}` : ""}`)
      setRows(unwrap(res))
    } catch (err) {
      toast.error(err?.response?.data?.message ?? "Failed to load transfer history")
    } finally {
      setLoading(false)
    }
  }, [branchId, status, fromDate, toDate])

  useEffect(() => { load() }, [load])

  async function handleExport() {
    setExporting(true)
    try {
      const q = buildParams({ branchId, status, fromDate, toDate })
      // GET /api/v1/reports/transfer-history/export → CSV bytes
      const res = await api.get(
        `/reports/transfer-history/export${q ? `?${q}` : ""}`,
        { responseType: "arraybuffer" }
      )
      downloadCsv(res, "transfer-history-report.csv")
      toast.success("CSV downloaded")
    } catch {
      toast.error("Export failed")
    } finally {
      setExporting(false)
    }
  }

  const COLS = ["ID", "Item", "From → To", "Qty", "Value", "Status", "Requested", "Dispatched", "Received"]

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <SectionHeader
        title="Transfer History Report"
        subtitle="FR-26 · Filtered by branch, status, and date range"
        count={loading ? null : rows.length}
        onExport={handleExport}
        exporting={exporting}
      />

      {/* Filters — FR-30, FR-31, FR-32 */}
      <FilterRow>
        <Select value={branchId} onChange={setBranchId} minWidth={160}>
          <option value="">All Branches</option>
          {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </Select>

        <Select value={status} onChange={setStatus} minWidth={160}>
          <option value="">All Statuses</option>
          {TRANSFER_STATUSES.map(s => (
            <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
          ))}
        </Select>

        {/* FR-32: date range */}
        <DateInput value={fromDate} onChange={setFromDate} placeholder="From date" />
        <DateInput value={toDate}   onChange={setToDate}   placeholder="To date" />

        <ActionBtn onClick={load} disabled={loading} variant="default">
          <IconRefresh /> Refresh
        </ActionBtn>
      </FilterRow>

      <TableWrap>
        <THead cols={COLS} />
        <tbody>
          {loading ? <LoadingRow /> : rows.length === 0 ? (
            <EmptyState msg="No transfers match the selected filters." />
          ) : rows.map((t, i) => {
            const sc = STATUS_META[t.status] ?? STATUS_META.CANCELLED
            return (
              <tr key={t.id ?? i} style={{ borderBottom: "1px solid #f0f1ec" }}
                onMouseEnter={e => e.currentTarget.style.background = "#fafbf8"}
                onMouseLeave={e => e.currentTarget.style.background = ""}>
                <td style={{ padding: "10px 14px", fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#9ca3af" }}>#{t.id}</td>
                <td style={{ padding: "10px 14px" }}>
                  <div style={{ fontWeight: 500, color: "#1a1f0e" }}>{t.itemName ?? "—"}</div>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#9ca3af", marginTop: 2 }}>{t.itemCode ?? ""}</div>
                </td>
                <td style={{ padding: "10px 14px", whiteSpace: "nowrap" }}>
                  <span style={{ fontWeight: 500, color: "#1a1f0e" }}>{t.sourceBranchName ?? "—"}</span>
                  <span style={{ color: "#9ca3af", margin: "0 6px" }}>→</span>
                  <span style={{ fontWeight: 500, color: "#1a1f0e" }}>{t.destinationBranchName ?? "—"}</span>
                </td>
                <td style={{ padding: "10px 14px", fontFamily: "'DM Mono', monospace", fontWeight: 700, color: "#1a1f0e" }}>{t.quantity ?? "—"}</td>
                <td style={{ padding: "10px 14px", fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#6b7260" }}>{formatCurrency(t.totalValue)}</td>
                <td style={{ padding: "10px 14px" }}>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, textTransform: "uppercase", padding: "2px 8px", background: sc.bg, color: sc.color, border: `1px solid ${sc.color}22` }}>
                    {t.status?.replace(/_/g, " ") ?? "—"}
                  </span>
                </td>
                <td style={{ padding: "10px 14px", fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#9ca3af", whiteSpace: "nowrap" }}>{formatDate(t.requestedAt)}</td>
                <td style={{ padding: "10px 14px", fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#9ca3af", whiteSpace: "nowrap" }}>{formatDate(t.dispatchedAt)}</td>
                <td style={{ padding: "10px 14px", fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#9ca3af", whiteSpace: "nowrap" }}>{formatDate(t.receivedAt)}</td>
              </tr>
            )
          })}
        </tbody>
      </TableWrap>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────
export default function ReportsPage() {
  const [tab,      setTab]      = useState("stock")
  const [branches, setBranches] = useState([])

  // Load branches once — shared by both report tabs
  useEffect(() => {
    api.get("/branches?size=100&sort=name,asc")
      .then(res => setBranches(res?.data?.content ?? []))
      .catch(() => {})
  }, [])

  const TABS = [
    { key: "stock",    label: "Stock Levels",      fr: "FR-25" },
    { key: "transfer", label: "Transfer History",  fr: "FR-26" },
  ]

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader
        title="Reports"
        subtitle="Stock levels, transfer history, and CSV exports."
      />

      {/* ── Tab Bar ── */}
      <div style={{ display: "flex", gap: 0, borderBottom: "1px solid #dde0d4" }}>
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding: "10px 20px", border: "none", cursor: "pointer",
              fontFamily: "'DM Mono', monospace", fontSize: 11, textTransform: "uppercase",
              letterSpacing: "0.08em", transition: "all 120ms",
              borderBottom: tab === t.key ? "2px solid #1a1f0e" : "2px solid transparent",
              background: "transparent",
              color: tab === t.key ? "#1a1f0e" : "#9ca3af",
              fontWeight: tab === t.key ? 700 : 400,
              marginBottom: -1,
            }}
          >
            {t.label}
            <span style={{ marginLeft: 6, fontSize: 9, color: tab === t.key ? "#3d7a2b" : "#d1d5db" }}>
              {t.fr}
            </span>
          </button>
        ))}
      </div>

      {/* ── Active Tab Content ── */}
      {tab === "stock"    && <StockLevelReport     branches={branches} />}
      {tab === "transfer" && <TransferHistoryReport branches={branches} />}
    </div>
  )
}