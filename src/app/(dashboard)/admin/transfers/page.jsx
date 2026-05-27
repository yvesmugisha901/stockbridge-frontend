"use client"
import { useState, useEffect, useCallback } from "react"
import PageHeader from "@/components/ui/PageHeader"
import { api } from "@/lib/api/client"
import toast from "react-hot-toast"

// TransferResponse exact fields:
// id, sourceBranchId, sourceBranchName, destinationBranchId, destinationBranchName,
// itemId, itemName, itemCode, quantity, totalValue, justification, status,
// requiresHoApproval (boolean primitive → "requiresHoApproval" in JSON),
// managerComments, hoComments, requestedByEmail,
// requestedAt, dispatchedAt, receivedAt  (all LocalDateTime)

const PAGE_SIZE = 25

const STATUS_META = {
  PENDING:          { bg: "#fef9e7", color: "#b45309", label: "Pending" },
  MANAGER_APPROVED: { bg: "#eff6ff", color: "#1d4ed8", label: "Mgr Approved" },
  HO_APPROVED:      { bg: "#e4f0df", color: "#3d7a2b", label: "HO Approved" },
  IN_TRANSIT:       { bg: "#f0f4ff", color: "#4338ca", label: "In Transit" },
  RECEIVED:         { bg: "#e4f0df", color: "#166534", label: "Received" },
  COMPLETED:        { bg: "#e4f0df", color: "#3d7a2b", label: "Completed" },
  REJECTED:         { bg: "#fef2f2", color: "#dc2626", label: "Rejected" },
  CANCELLED:        { bg: "#f3f4f0", color: "#6b7260", label: "Cancelled" },
}

// ── Icons ─────────────────────────────────────────────────────
const IconSearch = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
)

const IconRefresh = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10"/>
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
  </svg>
)

const IconChevron = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
)

const IconClose = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)

// ── Helpers ───────────────────────────────────────────────────
function formatDate(dt) {
  if (!dt) return "—"
  return new Date(dt).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  })
}

function formatDateTime(dt) {
  if (!dt) return "—"
  return new Date(dt).toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  })
}

function formatCurrency(val) {
  if (val == null) return "—"
  return new Intl.NumberFormat("en-RW", {
    style: "currency", currency: "RWF", maximumFractionDigits: 0,
  }).format(val)
}

function getPageWindow(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i)
  const pages = []
  const add = (p) => { if (!pages.includes(p)) pages.push(p) }
  add(0)
  for (let i = Math.max(1, current - 1); i <= Math.min(total - 2, current + 1); i++) add(i)
  add(total - 1)
  const result = []; let prev = -1
  for (const p of pages.sort((a, b) => a - b)) {
    if (p - prev > 1) result.push("…")
    result.push(p); prev = p
  }
  return result
}

// ── Sub-components ────────────────────────────────────────────
function StatusBadge({ status }) {
  const meta = STATUS_META[status] ?? STATUS_META.CANCELLED
  return (
    <span style={{
      display: "inline-block",
      fontFamily: "'DM Mono', monospace", fontSize: 9,
      textTransform: "uppercase", letterSpacing: "0.1em",
      padding: "2px 8px", whiteSpace: "nowrap",
      background: meta.bg, color: meta.color,
      border: `1px solid ${meta.color}22`,
    }}>
      {meta.label}
    </span>
  )
}

function SummaryCard({ label, value, accent, sub }) {
  return (
    <div style={{
      background: "#fff", border: "1px solid #dde0d4",
      padding: "16px 20px", display: "flex", flexDirection: "column", gap: 4,
    }}>
      <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.12em", color: "#9ca3af" }}>{label}</span>
      <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 22, fontWeight: 700, color: accent ?? "#1a1f0e", lineHeight: 1 }}>{value}</span>
      {sub && <span style={{ fontFamily: "'Geist', sans-serif", fontSize: 11, color: "#9ca3af" }}>{sub}</span>}
    </div>
  )
}

function PagBtn({ label, onClick, disabled, active }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      minWidth: 28, height: 28, padding: "0 6px", borderRadius: 4,
      border: "1px solid",
      borderColor: active ? "#3d7a2b" : disabled ? "#e8ebe3" : "#dde0d4",
      background: active ? "#3d7a2b" : "transparent",
      color: active ? "#fff" : disabled ? "#d1d5db" : "#6b7260",
      fontSize: 12, fontFamily: "'DM Mono', monospace",
      cursor: disabled ? "not-allowed" : "pointer",
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      transition: "all 120ms",
    }}>{label}</button>
  )
}

// ── Detail Drawer ─────────────────────────────────────────────
function DetailDrawer({ transfer: t, onClose }) {
  if (!t) return null
  const meta = STATUS_META[t.status] ?? STATUS_META.CANCELLED

  const Row = ({ label, value, mono }) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", color: "#9ca3af" }}>{label}</span>
      <span style={{ fontFamily: mono ? "'DM Mono', monospace" : "'Geist', sans-serif", fontSize: 13, color: "#1a1f0e" }}>{value ?? "—"}</span>
    </div>
  )

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", justifyContent: "flex-end" }}>
      {/* Backdrop */}
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(10,14,10,0.4)", backdropFilter: "blur(2px)" }} />

      {/* Panel */}
      <div style={{
        position: "relative", width: "100%", maxWidth: 480,
        background: "#fff", borderLeft: "1px solid #dde0d4",
        display: "flex", flexDirection: "column",
        overflowY: "auto", zIndex: 1,
      }}>
        {/* Header */}
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #e8ebe3", display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexShrink: 0 }}>
          <div>
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.12em", color: "#9ca3af", margin: "0 0 4px" }}>
              Transfer #{t.id}
            </p>
            <h3 style={{ fontFamily: "'Geist', sans-serif", fontSize: 15, fontWeight: 700, color: "#1a1f0e", margin: "0 0 6px" }}>
              {t.itemName}
            </h3>
            <StatusBadge status={t.status} />
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#9ca3af", cursor: "pointer", padding: 4 }}>
            <IconClose />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 20, flex: 1 }}>

          {/* Route */}
          <section>
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.12em", color: "#3d7a2b", margin: "0 0 10px" }}>Transfer Route</p>
            <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#f7f8f4", border: "1px solid #e8ebe3", padding: "12px 16px" }}>
              <span style={{ fontFamily: "'Geist', sans-serif", fontSize: 13, fontWeight: 600, color: "#1a1f0e" }}>{t.sourceBranchName}</span>
              <span style={{ color: "#9ca3af", fontSize: 16 }}>→</span>
              <span style={{ fontFamily: "'Geist', sans-serif", fontSize: 13, fontWeight: 600, color: "#1a1f0e" }}>{t.destinationBranchName}</span>
            </div>
          </section>

          {/* Item details */}
          <section>
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.12em", color: "#3d7a2b", margin: "0 0 10px" }}>Item Details</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Row label="Item Name"  value={t.itemName} />
              <Row label="Item Code"  value={t.itemCode} mono />
              <Row label="Quantity"   value={t.quantity} mono />
              <Row label="Total Value" value={formatCurrency(t.totalValue)} mono />
            </div>
          </section>

          {/* Approval */}
          <section>
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.12em", color: "#3d7a2b", margin: "0 0 10px" }}>Approval & Workflow</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Row label="Requires HO Approval" value={t.requiresHoApproval ? "Yes" : "No"} />
              <Row label="Requested By"         value={t.requestedByEmail} />
            </div>
            {t.justification && (
              <div style={{ marginTop: 12 }}>
                <Row label="Justification" value={t.justification} />
              </div>
            )}
            {t.managerComments && (
              <div style={{ marginTop: 12 }}>
                <Row label="Manager Comments" value={t.managerComments} />
              </div>
            )}
            {t.hoComments && (
              <div style={{ marginTop: 12 }}>
                <Row label="HO Comments" value={t.hoComments} />
              </div>
            )}
          </section>

          {/* Timeline */}
          <section>
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.12em", color: "#3d7a2b", margin: "0 0 10px" }}>Timeline</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { label: "Requested",  value: formatDateTime(t.requestedAt) },
                { label: "Dispatched", value: formatDateTime(t.dispatchedAt) },
                { label: "Received",   value: formatDateTime(t.receivedAt) },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "#f7f8f4", border: "1px solid #e8ebe3" }}>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: "#9ca3af" }}>{label}</span>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: value === "—" ? "#d1d5db" : "#1a1f0e" }}>{value}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────
export default function AllTransfersPage() {
  const [transfers,  setTransfers]  = useState([])
  const [branches,   setBranches]   = useState([])
  const [totalPages, setTotalPages] = useState(0)
  const [totalItems, setTotalItems] = useState(0)
  const [page,       setPage]       = useState(0)
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState(null)

  // Filters — FR-29, FR-30, FR-31
  const [search,       setSearch]       = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [branchFilter, setBranchFilter] = useState("")

  // Detail drawer
  const [selected, setSelected] = useState(null)

  // Load branch list for filter dropdown
  useEffect(() => {
    api.get("/branches?size=100&sort=name,asc")
      .then(res => setBranches(res?.data?.content ?? []))
      .catch(() => {})
  }, [])

  const load = useCallback(async (pageNum, opts = {}) => {
    setLoading(true); setError(null)
    try {
      // sort by "requestedAt" — direct field on TransferRequest entity
      const params = new URLSearchParams({
        page: String(pageNum),
        size: String(PAGE_SIZE),
        sort: "requestedAt,desc",
      })
      if (opts.search)       params.set("search",   opts.search)
      if (opts.statusFilter) params.set("status",   opts.statusFilter)
      if (opts.branchFilter) params.set("branchId", opts.branchFilter)

      // GET /api/v1/transfers
      // Returns: ApiResponse<Page<TransferResponse>>
      const res     = await api.get(`/transfers?${params}`)
      const payload = res?.data
      setTransfers(payload?.content        ?? [])
      setTotalPages(payload?.totalPages    ?? 0)
      setTotalItems(payload?.totalElements ?? 0)
    } catch (err) {
      const msg = err?.response?.data?.message ?? err.message ?? "Unknown error"
      setError(msg)
      toast.error("Failed to load transfers")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load(page, { search, statusFilter, branchFilter })
  }, [load, page, search, statusFilter, branchFilter])

  function applyFilter(key, value) {
    setPage(0)
    if (key === "search")       setSearch(value)
    if (key === "statusFilter") setStatusFilter(value)
    if (key === "branchFilter") setBranchFilter(value)
  }

  const goTo = (p) => {
    if (p < 0 || p >= totalPages) return
    setPage(p)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // Derived counts for summary cards
  const pending   = transfers.filter(t => t.status === "PENDING").length
  const inTransit = transfers.filter(t => t.status === "IN_TRANSIT").length
  const rejected  = transfers.filter(t => t.status === "REJECTED").length

  const COLS = ["ID", "Item", "From → To", "Qty", "Value", "HO?", "Status", "Requested", ""]

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader
        title="All Transfers"
        subtitle="Read-only view of every inter-branch stock transfer across the system."
      />

      {/* ── Summary Cards ── */}
      {!loading && !error && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 }}>
          <SummaryCard label="Total"      value={totalItems}  sub="all time" />
          <SummaryCard label="Pending"    value={pending}     accent={pending > 0 ? "#b45309" : "#3d7a2b"} sub="awaiting action" />
          <SummaryCard label="In Transit" value={inTransit}   accent={inTransit > 0 ? "#4338ca" : "#1a1f0e"} sub="currently moving" />
          <SummaryCard label="Rejected"   value={rejected}    accent={rejected > 0 ? "#dc2626" : "#1a1f0e"} sub="this page" />
        </div>
      )}

      {/* ── Filters — FR-29, FR-30, FR-31 ── */}
      <div style={{
        background: "#fff", border: "1px solid #dde0d4",
        padding: "14px 20px", display: "flex",
        flexWrap: "wrap", alignItems: "center", gap: 12,
      }}>
        {/* Search — FR-29 */}
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          border: "1px solid #dde0d4", background: "#f7f8f4",
          padding: "7px 12px", flex: "1 1 200px", minWidth: 200,
        }}>
          <span style={{ color: "#9ca3af", flexShrink: 0 }}><IconSearch /></span>
          <input
            type="text"
            placeholder="Search item name, code, or email…"
            value={search}
            onChange={e => applyFilter("search", e.target.value)}
            style={{
              background: "transparent", border: "none", outline: "none",
              fontSize: 13, fontFamily: "'Geist', sans-serif",
              color: "#1a1f0e", width: "100%",
            }}
          />
        </div>

        {/* Status filter — FR-31 */}
        <select
          value={statusFilter}
          onChange={e => applyFilter("statusFilter", e.target.value)}
          style={{
            fontFamily: "'Geist', sans-serif", fontSize: 13, color: "#1a1f0e",
            padding: "7px 12px", border: "1px solid #dde0d4",
            background: "#f7f8f4", outline: "none", cursor: "pointer", minWidth: 160,
          }}
        >
          <option value="">All Statuses</option>
          {Object.entries(STATUS_META).map(([key, { label }]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>

        {/* Branch filter — FR-30 */}
        <select
          value={branchFilter}
          onChange={e => applyFilter("branchFilter", e.target.value)}
          style={{
            fontFamily: "'Geist', sans-serif", fontSize: 13, color: "#1a1f0e",
            padding: "7px 12px", border: "1px solid #dde0d4",
            background: "#f7f8f4", outline: "none", cursor: "pointer", minWidth: 160,
          }}
        >
          <option value="">All Branches</option>
          {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>

        <button
          onClick={() => load(page, { search, statusFilter, branchFilter })}
          style={{
            marginLeft: "auto", display: "flex", alignItems: "center", gap: 6,
            fontFamily: "'DM Mono', monospace", fontSize: 11, textTransform: "uppercase",
            color: "#6b7260", background: "#f7f8f4", border: "1px solid #dde0d4",
            padding: "7px 12px", cursor: "pointer",
          }}
        >
          <IconRefresh /> Refresh
        </button>
      </div>

      {error && (
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "#fef2f2", border: "1px solid #fecaca",
          color: "#dc2626", padding: "10px 16px",
          fontFamily: "'DM Mono', monospace", fontSize: 12,
        }}>
          <span>{error}</span>
          <button
            onClick={() => load(page, { search, statusFilter, branchFilter })}
            style={{ background: "none", border: "none", color: "#dc2626", cursor: "pointer", textDecoration: "underline", fontFamily: "inherit", fontSize: 12 }}
          >
            Retry
          </button>
        </div>
      )}

      {/* ── Table ── */}
      <div style={{ background: "#fff", border: "1px solid #dde0d4", overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, fontFamily: "'Geist', sans-serif" }}>
            <thead>
              <tr style={{ background: "#f7f8f4", borderBottom: "1px solid #e8ebe3" }}>
                {COLS.map(h => (
                  <th key={h} style={{
                    padding: "10px 14px", textAlign: "left", whiteSpace: "nowrap",
                    fontFamily: "'DM Mono', monospace", fontSize: 9,
                    textTransform: "uppercase", letterSpacing: "0.1em",
                    color: "#9ca3af", fontWeight: 500,
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={COLS.length} style={{ padding: 48, textAlign: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                      <div style={{
                        width: 18, height: 18, borderRadius: "50%",
                        border: "2px solid #dde0d4", borderTopColor: "#3d7a2b",
                        animation: "at-spin 0.7s linear infinite",
                      }} />
                      <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#9ca3af", textTransform: "uppercase" }}>
                        Loading…
                      </span>
                    </div>
                    <style>{`@keyframes at-spin { to { transform: rotate(360deg) } }`}</style>
                  </td>
                </tr>
              ) : transfers.length === 0 ? (
                <tr>
                  <td colSpan={COLS.length} style={{ padding: 48, textAlign: "center", fontFamily: "'Geist', sans-serif", fontSize: 13, color: "#9ca3af" }}>
                    {search || statusFilter || branchFilter
                      ? "No transfers match your filters."
                      : "No transfers found."}
                  </td>
                </tr>
              ) : transfers.map((t, idx) => (
                <tr
                  key={t.id ?? idx}
                  style={{ borderBottom: "1px solid #f0f1ec", transition: "background 100ms", cursor: "pointer" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#fafbf8"}
                  onMouseLeave={e => e.currentTarget.style.background = ""}
                  onClick={() => setSelected(t)}
                >
                  {/* id */}
                  <td style={{ padding: "11px 14px", fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#9ca3af" }}>
                    #{t.id}
                  </td>

                  {/* itemName + itemCode */}
                  <td style={{ padding: "11px 14px" }}>
                    <div style={{ fontWeight: 500, color: "#1a1f0e" }}>{t.itemName ?? "—"}</div>
                    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#9ca3af", marginTop: 2 }}>{t.itemCode ?? ""}</div>
                  </td>

                  {/* sourceBranchName → destinationBranchName */}
                  <td style={{ padding: "11px 14px", whiteSpace: "nowrap" }}>
                    <span style={{ color: "#1a1f0e", fontWeight: 500 }}>{t.sourceBranchName ?? "—"}</span>
                    <span style={{ color: "#9ca3af", margin: "0 6px" }}>→</span>
                    <span style={{ color: "#1a1f0e", fontWeight: 500 }}>{t.destinationBranchName ?? "—"}</span>
                  </td>

                  {/* quantity */}
                  <td style={{ padding: "11px 14px", fontFamily: "'DM Mono', monospace", fontWeight: 700, color: "#1a1f0e" }}>
                    {t.quantity ?? "—"}
                  </td>

                  {/* totalValue (BigDecimal) */}
                  <td style={{ padding: "11px 14px", fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#6b7260" }}>
                    {formatCurrency(t.totalValue)}
                  </td>

                  {/* requiresHoApproval — primitive boolean, safe as-is in JSON */}
                  <td style={{ padding: "11px 14px" }}>
                    <span style={{
                      fontFamily: "'DM Mono', monospace", fontSize: 9,
                      textTransform: "uppercase", padding: "2px 6px",
                      background: t.requiresHoApproval ? "#eff6ff" : "#f7f8f4",
                      color: t.requiresHoApproval ? "#1d4ed8" : "#9ca3af",
                      border: `1px solid ${t.requiresHoApproval ? "#bfdbfe" : "#e8ebe3"}`,
                    }}>
                      {t.requiresHoApproval ? "Yes" : "No"}
                    </span>
                  </td>

                  {/* status */}
                  <td style={{ padding: "11px 14px" }}>
                    <StatusBadge status={t.status} />
                  </td>

                  {/* requestedAt (LocalDateTime) */}
                  <td style={{ padding: "11px 14px", fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#9ca3af", whiteSpace: "nowrap" }}>
                    {formatDate(t.requestedAt)}
                  </td>

                  {/* Detail chevron */}
                  <td style={{ padding: "11px 14px", color: "#9ca3af" }}>
                    <IconChevron />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ── */}
        {!loading && totalPages > 1 && (
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "12px 16px", borderTop: "1px solid #e8ebe3", background: "#f7f8f4",
            fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#6b7260",
          }}>
            <span>
              Page <strong style={{ color: "#1a1f0e" }}>{page + 1}</strong> of{" "}
              <strong style={{ color: "#1a1f0e" }}>{totalPages}</strong>
              {"  ·  "}
              <span style={{ color: "#9ca3af" }}>{totalItems.toLocaleString()} transfers</span>
            </span>
            <div style={{ display: "flex", gap: 4 }}>
              <PagBtn label="«" onClick={() => goTo(0)}              disabled={page === 0} />
              <PagBtn label="‹" onClick={() => goTo(page - 1)}       disabled={page === 0} />
              {getPageWindow(page, totalPages).map((p, i) =>
                p === "…"
                  ? <span key={`e${i}`} style={{ padding: "4px 4px", color: "#9ca3af", alignSelf: "center" }}>…</span>
                  : <PagBtn key={p} label={p + 1} onClick={() => goTo(p)} active={p === page} />
              )}
              <PagBtn label="›" onClick={() => goTo(page + 1)}       disabled={page >= totalPages - 1} />
              <PagBtn label="»" onClick={() => goTo(totalPages - 1)} disabled={page >= totalPages - 1} />
            </div>
          </div>
        )}
      </div>

      {/* ── Detail Drawer ── */}
      {selected && (
        <DetailDrawer transfer={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  )
}