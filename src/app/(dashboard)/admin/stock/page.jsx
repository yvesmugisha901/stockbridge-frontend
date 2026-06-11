"use client"
import { useState, useEffect, useCallback } from "react"
import PageHeader from "@/components/ui/PageHeader"
import { api } from "@/lib/api/client"
import toast from "react-hot-toast"

const PAGE_SIZE = 25

// ── Icons ─────────────────────────────────────────────────────
const IconAlert = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
)
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

// ── Helpers ───────────────────────────────────────────────────
function isLow(s) {
  return s.lowStock === true || s.quantityOnHand <= s.minimumThreshold
}
function formatDate(dt) {
  if (!dt) return "—"
  return new Date(dt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

// Handles both Spring page shapes:
//   old: { content, totalElements, totalPages }
//   new: { content, page: { totalElements, totalPages } }
function extractPage(payload) {
  const content      = payload?.content ?? []
  const totalElements = payload?.page?.totalElements ?? payload?.totalElements ?? 0
  const totalPages    = payload?.page?.totalPages    ?? payload?.totalPages    ?? 0
  return { content, totalElements, totalPages }
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
function SummaryCard({ label, value, accent, sub }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #dde0d4", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 4 }}>
      <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.12em", color: "#9ca3af" }}>{label}</span>
      <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 22, fontWeight: 700, color: accent ?? "#1a1f0e", lineHeight: 1 }}>
        {value ?? "—"}
      </span>
      {sub && <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "#9ca3af" }}>{sub}</span>}
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

// ── Main Page ─────────────────────────────────────────────────
export default function AllStockPage() {
  const [stock,      setStock]      = useState([])
  const [lowAlerts,  setLowAlerts]  = useState([])
  const [branches,   setBranches]   = useState([])
  const [totalPages, setTotalPages] = useState(0)
  const [totalItems, setTotalItems] = useState(0)
  const [page,       setPage]       = useState(0)
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState(null)

  const [search,       setSearch]       = useState("")
  const [branchFilter, setBranchFilter] = useState("")
  const [lowOnly,      setLowOnly]      = useState(false)

  useEffect(() => {
    api.get("/branches")
      .then(res => {
        const data = res?.data ?? []
        setBranches(Array.isArray(data) ? data : data.content ?? [])
      })
      .catch(() => {})
  }, [])

  const loadStock = useCallback(async (pageNum, branchId) => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        page: String(pageNum),
        size: String(PAGE_SIZE),
        sort: "branch.name,asc",
      })
      if (branchId) params.set("branchId", String(branchId))

      const res     = await api.get(`/stock?${params}`)
      // Handle both old { totalElements } and new { page: { totalElements } } Spring shapes
      const { content, totalElements, totalPages } = extractPage(res?.data)
      setStock(content)
      setTotalItems(totalElements)
      setTotalPages(totalPages)
    } catch (err) {
      const msg = err?.response?.data?.message ?? err.message ?? "Unknown error"
      setError(msg)
      toast.error("Failed to load stock levels")
    } finally {
      setLoading(false)
    }
  }, [])

  const loadLowStock = useCallback(async (branchId) => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (branchId) params.set("branchId", String(branchId))
      const qs  = params.toString()
      const res = await api.get(`/stock/low-stock-alerts${qs ? `?${qs}` : ""}`)
      const raw = res?.data ?? []
      setLowAlerts(raw)
    } catch (err) {
      const msg = err?.response?.data?.message ?? err.message ?? "Unknown error"
      setError(msg)
      toast.error("Failed to load low stock alerts")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (lowOnly) loadLowStock(branchFilter)
    else         loadStock(page, branchFilter)
  }, [lowOnly, branchFilter, page, loadStock, loadLowStock])

  const baseRows    = lowOnly ? lowAlerts : stock
  const displayRows = search.trim()
    ? baseRows.filter(s => {
        const q = search.trim().toLowerCase()
        return (
          s.itemName?.toLowerCase().includes(q) ||
          s.itemCode?.toLowerCase().includes(q) ||
          s.branchName?.toLowerCase().includes(q)
        )
      })
    : baseRows

  function handleSearch(v)  { setSearch(v) }
  function handleBranch(v)  { setBranchFilter(v); setPage(0) }
  function handleLowOnly(v) { setLowOnly(v); setPage(0); setSearch("") }
  function handleRefresh()  {
    if (lowOnly) loadLowStock(branchFilter)
    else         loadStock(page, branchFilter)
  }
  function clearFilters() { setSearch(""); setBranchFilter(""); setLowOnly(false); setPage(0) }

  const goTo = (p) => {
    if (p < 0 || p >= totalPages) return
    setPage(p)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const lowCount = lowOnly ? lowAlerts.length : stock.filter(isLow).length
  const okCount  = lowOnly ? 0 : stock.filter(s => !isLow(s)).length

  const COLS = [
    "Branch", "Item Code", "Item Name",
    "On Hand", "Reserved", "Available",
    "Min Threshold", "Status", "Last Updated",
  ]

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader title="Stock Overview" />

      {/* Low Stock Banner */}
      {!loading && !lowOnly && lowCount > 0 && (
        <div style={{
          display: "flex", alignItems: "center", gap: 12,
          background: "#fef2f2", border: "1px solid #fecaca", padding: "12px 16px",
        }}>
          <span style={{ color: "#dc2626", flexShrink: 0 }}><IconAlert /></span>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#dc2626", fontWeight: 500, margin: 0 }}>
            <strong>{lowCount}</strong> item{lowCount !== 1 ? "s are" : " is"} below the minimum stock threshold.
          </p>
          <button
            onClick={() => handleLowOnly(true)}
            style={{
              marginLeft: "auto", background: "none", border: "1px solid #fecaca",
              cursor: "pointer", fontSize: 11, color: "#dc2626",
              fontFamily: "'DM Mono', monospace", textTransform: "uppercase",
              padding: "4px 10px", flexShrink: 0,
            }}
          >
            Show only →
          </button>
        </div>
      )}

      {/* Summary Cards */}
      {!loading && !error && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
          {lowOnly ? (
            <>
              <SummaryCard
                label="Low Stock Items"
                value={lowAlerts.length}
                accent="#dc2626"
                sub="below minimum threshold"
              />
              <SummaryCard
                label="Filtered"
                value={displayRows.length}
                sub={search ? "matching search" : "all alerts"}
              />
            </>
          ) : (
            <>
              <SummaryCard
                label="Total Records"
                value={totalItems.toLocaleString()}
                sub="across all branches"
              />
              <SummaryCard
                label="Page"
                value={`${page + 1} / ${totalPages || 1}`}
                sub={`${PAGE_SIZE} records per page`}
              />
              <SummaryCard
                label="Low / Out"
                value={lowCount}
                accent={lowCount > 0 ? "#dc2626" : "#3d7a2b"}
                sub="below minimum threshold"
              />
              <SummaryCard
                label="Healthy"
                value={okCount}
                accent="#3d7a2b"
                sub="at or above minimum"
              />
            </>
          )}
        </div>
      )}

      {/* Filters */}
      <div style={{
        background: "#fff", border: "1px solid #dde0d4",
        padding: "14px 20px", display: "flex",
        flexWrap: "wrap", alignItems: "center", gap: 12,
      }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          border: "1px solid #dde0d4", background: "#f7f8f4",
          padding: "7px 12px", flex: "1 1 200px", minWidth: 200,
        }}>
          <span style={{ color: "#9ca3af", flexShrink: 0 }}><IconSearch /></span>
          <input
            type="text"
            placeholder="Search item name, code or branch…"
            value={search}
            onChange={e => handleSearch(e.target.value)}
            style={{
              background: "transparent", border: "none", outline: "none",
              fontSize: 13, fontFamily: "'Inter', sans-serif",
              color: "#1a1f0e", width: "100%",
            }}
          />
          {search && (
            <button
              onClick={() => handleSearch("")}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", fontSize: 16, lineHeight: 1, padding: 0 }}
            >×</button>
          )}
        </div>

        <select
          value={branchFilter}
          onChange={e => handleBranch(e.target.value)}
          style={{
            fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#1a1f0e",
            padding: "7px 12px", border: "1px solid #dde0d4",
            background: "#f7f8f4", outline: "none", cursor: "pointer", minWidth: 160,
          }}
        >
          <option value="">All Branches</option>
          {branches.map(b => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>

        <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={lowOnly}
            onChange={e => handleLowOnly(e.target.checked)}
            style={{ accentColor: "#dc2626", width: 14, height: 14 }}
          />
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: lowOnly ? "#dc2626" : "#1a1f0e", fontWeight: lowOnly ? 600 : 400 }}>
            Low stock only
          </span>
          {lowCount > 0 && (
            <span style={{
              background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca",
              fontFamily: "'DM Mono', monospace", fontSize: 10, fontWeight: 700,
              padding: "2px 7px", borderRadius: 999,
            }}>
              {lowCount}
            </span>
          )}
        </label>

        {(search || branchFilter || lowOnly) && (
          <button
            onClick={clearFilters}
            style={{
              display: "flex", alignItems: "center", gap: 5,
              background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca",
              padding: "5px 10px", cursor: "pointer",
              fontFamily: "'DM Mono', monospace", fontSize: 10,
              textTransform: "uppercase", letterSpacing: "0.06em",
            }}
          >
            × Clear filters
          </button>
        )}

        <button
          onClick={handleRefresh}
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

      {/* Error */}
      {error && (
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "#fef2f2", border: "1px solid #fecaca",
          color: "#dc2626", padding: "10px 16px",
          fontFamily: "'DM Mono', monospace", fontSize: 12,
        }}>
          <span>{error}</span>
          <button onClick={handleRefresh} style={{ background: "none", border: "none", color: "#dc2626", cursor: "pointer", textDecoration: "underline", fontFamily: "inherit", fontSize: 12 }}>
            Retry
          </button>
        </div>
      )}

      {/* Table */}
      <div style={{ background: "#fff", border: "1px solid #dde0d4", overflow: "hidden" }}>
        {lowOnly && !loading && (
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "10px 16px", background: "#fef2f2", borderBottom: "1px solid #fecaca",
          }}>
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#dc2626", display: "flex", alignItems: "center", gap: 6 }}>
              <IconAlert /> Showing low stock alerts only
            </span>
            <button
              onClick={() => handleLowOnly(false)}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#dc2626", fontFamily: "'DM Mono', monospace", fontSize: 10, textDecoration: "underline", textTransform: "uppercase" }}
            >
              Show all →
            </button>
          </div>
        )}

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, fontFamily: "'Inter', sans-serif" }}>
            <thead>
              <tr style={{ background: "#f7f8f4", borderBottom: "1px solid #e8ebe3" }}>
                {COLS.map(h => (
                  <th key={h} style={{
                    padding: "10px 14px", textAlign: "left", whiteSpace: "nowrap",
                    fontFamily: "'DM Mono', monospace", fontSize: 9,
                    textTransform: "uppercase", letterSpacing: "0.1em",
                    color: "#9ca3af", fontWeight: 500,
                  }}>
                    {h}
                  </th>
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
                        animation: "as-spin 0.7s linear infinite",
                      }} />
                      <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#9ca3af", textTransform: "uppercase" }}>
                        Loading…
                      </span>
                    </div>
                    <style>{`@keyframes as-spin { to { transform: rotate(360deg) } }`}</style>
                  </td>
                </tr>
              ) : displayRows.length === 0 ? (
                <tr>
                  <td colSpan={COLS.length} style={{ padding: 48, textAlign: "center", fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#9ca3af" }}>
                    {search
                      ? `No results for "${search}".`
                      : lowOnly
                        ? "No low stock alerts — all items are above minimum threshold."
                        : branchFilter
                          ? "No stock records for this branch."
                          : "No stock records found."}
                  </td>
                </tr>
              ) : displayRows.map((s, idx) => {
                const low       = isLow(s)
                const available = (s.quantityOnHand ?? 0) - (s.reservedQuantity ?? 0)
                return (
                  <tr
                    key={s.id ?? idx}
                    style={{
                      borderBottom: "1px solid #f0f1ec",
                      transition: "background 100ms",
                      background: low ? "#fffbf7" : "",
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = low ? "#fff5f0" : "#fafbf8"}
                    onMouseLeave={e => e.currentTarget.style.background = low ? "#fffbf7" : ""}
                  >
                    <td style={{ padding: "11px 14px", fontWeight: 600, color: "#1a1f0e", whiteSpace: "nowrap" }}>
                      {s.branchName ?? "—"}
                    </td>
                    <td style={{ padding: "11px 14px", fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#3d7a2b", fontWeight: 600 }}>
                      {s.itemCode ?? "—"}
                    </td>
                    <td style={{ padding: "11px 14px", color: "#1a1f0e" }}>{s.itemName ?? "—"}</td>
                    <td style={{ padding: "11px 14px", fontFamily: "'DM Mono', monospace", fontWeight: 700, color: low ? "#dc2626" : "#1a1f0e" }}>
                      {s.quantityOnHand ?? 0}
                    </td>
                    <td style={{ padding: "11px 14px", fontFamily: "'DM Mono', monospace", color: "#9ca3af" }}>
                      {s.reservedQuantity ?? 0}
                    </td>
                    <td style={{
                      padding: "11px 14px", fontFamily: "'DM Mono', monospace", fontWeight: 600,
                      color: available <= 0 ? "#dc2626" : available <= (s.minimumThreshold ?? 0) ? "#d97706" : "#1a1f0e",
                    }}>
                      {available}
                    </td>
                    <td style={{ padding: "11px 14px", fontFamily: "'DM Mono', monospace", color: "#9ca3af" }}>
                      {s.minimumThreshold ?? "—"}
                    </td>
                    <td style={{ padding: "11px 14px" }}>
                      {low ? (
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: 4,
                          background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca",
                          fontFamily: "'DM Mono', monospace", fontSize: 9,
                          fontWeight: 700, textTransform: "uppercase", padding: "2px 8px",
                        }}>
                          <IconAlert /> Low
                        </span>
                      ) : (
                        <span style={{
                          display: "inline-block",
                          background: "#f0f7ed", color: "#3d7a2b", border: "1px solid #e1eedb",
                          fontFamily: "'DM Mono', monospace", fontSize: 9,
                          textTransform: "uppercase", padding: "2px 8px",
                        }}>
                          OK
                        </span>
                      )}
                    </td>
                    <td style={{ padding: "11px 14px", fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#9ca3af", whiteSpace: "nowrap" }}>
                      {formatDate(s.lastUpdated)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination — normal mode only */}
        {!loading && !lowOnly && totalPages > 1 && (
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "12px 16px", borderTop: "1px solid #e8ebe3", background: "#f7f8f4",
            fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#6b7260",
          }}>
            <span>
              Page <strong style={{ color: "#1a1f0e" }}>{page + 1}</strong> of{" "}
              <strong style={{ color: "#1a1f0e" }}>{totalPages}</strong>
              {"  ·  "}
              <span style={{ color: "#9ca3af" }}>{totalItems.toLocaleString()} total records</span>
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
    </div>
  )
}