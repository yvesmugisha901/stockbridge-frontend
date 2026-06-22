"use client"
import { useState, useEffect, useCallback } from "react"
import PageHeader from "@/components/ui/PageHeader"
import { api } from "@/lib/api/client"
import { getToken } from "@/lib/auth/tokens"
import toast from "react-hot-toast"

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

const PAGE_SIZE = 20
const API_BASE  = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api/v1"

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

function formatDate(dt) {
  if (!dt) return "—"
  return new Date(dt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

function formatCurrency(val) {
  if (val == null) return "—"
  return new Intl.NumberFormat("en-RW", { style: "currency", currency: "RWF", maximumFractionDigits: 0 }).format(val)
}

function unwrap(res) {
  const body = res?.data
  if (Array.isArray(body))           return body
  const inner = body?.data
  if (Array.isArray(inner))          return inner
  if (Array.isArray(inner?.content)) return inner.content
  if (Array.isArray(body?.content))  return body.content
  return []
}

function unwrapBranches(res) {
  const body = res?.data
  if (Array.isArray(body))                return body
  if (Array.isArray(body?.data))          return body.data
  if (Array.isArray(body?.content))       return body.content
  if (Array.isArray(body?.data?.content)) return body.data.content
  return []
}

// Uses native fetch so responseType isn't an issue
async function exportCsv(path, filename) {
  const token = getToken()
  const res = await fetch(`${API_BASE}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  if (!res.ok) throw new Error(`Export failed: ${res.status}`)
  const blob = await res.blob()
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement("a")
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

function buildParams(obj) {
  const p = new URLSearchParams()
  Object.entries(obj).forEach(([k, v]) => { if (v !== "" && v != null) p.set(k, v) })
  return p.toString()
}

// ── Shared UI ──────────────────────────────────────────────────

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

function DateInput({ value, onChange }) {
  return (
    <input type="date" value={value} onChange={e => onChange(e.target.value)}
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
    default: { background: "#f7f8f4", color: "#6b7260", border: "1px solid #dde0d4" },
    export:  { background: "#f0f7ed", color: "#3d7a2b", border: "1px solid #e1eedb" },
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

function ClearBtn({ onClick }) {
  return (
    <button onClick={onClick} style={{
      fontFamily: "'DM Mono', monospace", fontSize: 10, textTransform: "uppercase",
      padding: "6px 10px", border: "1px solid #fecaca", background: "#fef2f2",
      color: "#dc2626", cursor: "pointer",
    }}>
      × Clear
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

function Pagination({ page, total, pageSize, onChange }) {
  const totalPages = Math.ceil(total / pageSize)
  if (totalPages <= 1) return null

  const pages = []
  const start = Math.max(0, page - 2)
  const end   = Math.min(totalPages - 1, page + 2)
  for (let i = start; i <= end; i++) pages.push(i)

  const btnStyle = (active, disabled) => ({
    fontFamily: "'DM Mono', monospace", fontSize: 11,
    padding: "5px 10px", border: "1px solid #dde0d4", cursor: disabled ? "not-allowed" : "pointer",
    background: active ? "#1a1f0e" : "#fff",
    color: active ? "#fff" : disabled ? "#d1d5db" : "#6b7260",
  })

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: "#fff", border: "1px solid #dde0d4", borderTop: "none" }}>
      <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#9ca3af" }}>
        Page {page + 1} of {totalPages} · {total} record{total !== 1 ? "s" : ""}
      </span>
      <div style={{ display: "flex", gap: 4 }}>
        <button style={btnStyle(false, page === 0)} disabled={page === 0} onClick={() => onChange(0)}>«</button>
        <button style={btnStyle(false, page === 0)} disabled={page === 0} onClick={() => onChange(page - 1)}>‹</button>
        {pages.map(p => (
          <button key={p} style={btnStyle(p === page, false)} onClick={() => onChange(p)}>{p + 1}</button>
        ))}
        <button style={btnStyle(false, page >= totalPages - 1)} disabled={page >= totalPages - 1} onClick={() => onChange(page + 1)}>›</button>
        <button style={btnStyle(false, page >= totalPages - 1)} disabled={page >= totalPages - 1} onClick={() => onChange(totalPages - 1)}>»</button>
      </div>
    </div>
  )
}

function SectionHeader({ title, count, onExport, exporting }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
        <h2 style={{ fontFamily: "'Geist', sans-serif", fontSize: 15, fontWeight: 700, color: "#1a1f0e", margin: 0 }}>
          {title}
        </h2>
        {count != null && (
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#9ca3af" }}>
            {count} record{count !== 1 ? "s" : ""}
          </span>
        )}
      </div>
      <ActionBtn onClick={onExport} disabled={exporting} variant="export">
        <IconDownload /> {exporting ? "Exporting…" : "Export CSV"}
      </ActionBtn>
    </div>
  )
}

// ── Stock Level Report ─────────────────────────────────────────
function StockLevelReport({ branches }) {
  const [allRows,   setAllRows]   = useState([])
  const [loading,   setLoading]   = useState(false)
  const [exporting, setExporting] = useState(false)
  const [branchId,  setBranchId]  = useState("")
  const [category,  setCategory]  = useState("")
  const [page,      setPage]      = useState(0)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const q = buildParams({ branchId, category })
      const res = await api.get(`/reports/stock-levels${q ? `?${q}` : ""}`)
      setAllRows(unwrap(res))
      setPage(0)
    } catch (err) {
      toast.error(err?.response?.data?.message ?? "Failed to load stock report")
      setAllRows([])
    } finally {
      setLoading(false)
    }
  }, [branchId, category])

  useEffect(() => { load() }, [load])

  const categories = [...new Set(allRows.map(r => r.category).filter(Boolean))].sort()
  const rows = allRows.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  async function handleExport() {
    setExporting(true)
    try {
      const q = buildParams({ branchId, category })
      await exportCsv(`/reports/stock-levels/export${q ? `?${q}` : ""}`, "stock-levels.csv")
      toast.success("CSV downloaded")
    } catch (err) {
      toast.error(err?.message ?? "Export failed")
    } finally {
      setExporting(false)
    }
  }

  const COLS = ["Branch", "Item Code", "Item Name", "Category", "On Hand", "Reserved", "Available", "Min. Threshold", "Status"]

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <SectionHeader title="Stock Levels" count={loading ? null : allRows.length} onExport={handleExport} exporting={exporting} />

      <FilterRow>
        <Select value={branchId} onChange={setBranchId} minWidth={160}>
          <option value="">All Branches</option>
          {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </Select>
        <Select value={category} onChange={setCategory} minWidth={150}>
          <option value="">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </Select>
        {(branchId || category) && <ClearBtn onClick={() => { setBranchId(""); setCategory("") }} />}
        <ActionBtn onClick={load} disabled={loading}><IconRefresh /> Refresh</ActionBtn>
      </FilterRow>

      <TableWrap>
        <THead cols={COLS} />
        <tbody>
          {loading ? <LoadingRow /> : rows.length === 0 ? (
            <EmptyState msg="No stock records match the selected filters." />
          ) : rows.map((r, i) => {
            const available = (r.quantityOnHand ?? 0) - (r.reservedQuantity ?? 0)
            const low = r.isLowStock || r.lowStock
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
                <td style={{ padding: "10px 14px", fontFamily: "'DM Mono', monospace", fontWeight: 600, color: available <= 0 ? "#dc2626" : available <= (r.minimumThreshold ?? 0) ? "#d97706" : "#1a1f0e" }}>{available}</td>
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
      <Pagination page={page} total={allRows.length} pageSize={PAGE_SIZE} onChange={setPage} />
    </div>
  )
}

// ── Transfer History Report ────────────────────────────────────
function TransferHistoryReport({ branches }) {
  const [allRows,   setAllRows]   = useState([])
  const [loading,   setLoading]   = useState(false)
  const [exporting, setExporting] = useState(false)
  const [branchId,  setBranchId]  = useState("")
  const [status,    setStatus]    = useState("")
  const [fromDate,  setFromDate]  = useState("")
  const [toDate,    setToDate]    = useState("")
  const [page,      setPage]      = useState(0)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const q = buildParams({ branchId, status, fromDate, toDate })
      const res = await api.get(`/reports/transfer-history${q ? `?${q}` : ""}`)
      setAllRows(unwrap(res))
      setPage(0)
    } catch (err) {
      toast.error(err?.response?.data?.message ?? "Failed to load transfer history")
      setAllRows([])
    } finally {
      setLoading(false)
    }
  }, [branchId, status, fromDate, toDate])

  useEffect(() => { load() }, [load])

  const rows = allRows.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  async function handleExport() {
    setExporting(true)
    try {
      const q = buildParams({ branchId, status, fromDate, toDate })
      await exportCsv(`/reports/transfer-history/export${q ? `?${q}` : ""}`, "transfer-history.csv")
      toast.success("CSV downloaded")
    } catch (err) {
      toast.error(err?.message ?? "Export failed")
    } finally {
      setExporting(false)
    }
  }

  const COLS = ["ID", "Item", "From → To", "Qty", "Value", "Status", "Requested", "Dispatched", "Received"]

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <SectionHeader title="Transfer History" count={loading ? null : allRows.length} onExport={handleExport} exporting={exporting} />

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
        <DateInput value={fromDate} onChange={setFromDate} />
        <DateInput value={toDate}   onChange={setToDate} />
        {(branchId || status || fromDate || toDate) && (
          <ClearBtn onClick={() => { setBranchId(""); setStatus(""); setFromDate(""); setToDate("") }} />
        )}
        <ActionBtn onClick={load} disabled={loading}><IconRefresh /> Refresh</ActionBtn>
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
      <Pagination page={page} total={allRows.length} pageSize={PAGE_SIZE} onChange={setPage} />
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────────────
export default function ReportsPage() {
  const [tab,      setTab]      = useState("stock")
  const [branches, setBranches] = useState([])

  useEffect(() => {
    api.get("/branches?size=100&sort=name,asc")
      .then(res => setBranches(unwrapBranches(res)))
      .catch(() => {})
  }, [])

  const TABS = [
    { key: "stock",    label: "Stock Levels"    },
    { key: "transfer", label: "Transfer History" },
  ]

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader title="Reports" subtitle="Stock levels and transfer history." />

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
          </button>
        ))}
      </div>

      {tab === "stock"    && <StockLevelReport     branches={branches} />}
      {tab === "transfer" && <TransferHistoryReport branches={branches} />}
    </div>
  )
}