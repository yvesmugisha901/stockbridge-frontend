"use client"
import { useState, useEffect, useCallback } from "react"
import PageHeader from "@/components/ui/PageHeader"
import { api } from "@/lib/api/client"
import toast from "react-hot-toast"

const PAGE_SIZE = 20

// ── Helpers ───────────────────────────────────────────────────
function isActive(item) {
  return item.active !== false && item.status !== "INACTIVE"
}

function formatPrice(value) {
  if (value == null) return "—"
  return new Intl.NumberFormat("en-RW", {
    style: "currency", currency: "RWF", maximumFractionDigits: 0,
  }).format(value)
}

function getPageWindow(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i)
  const pages = []
  const add = (p) => { if (!pages.includes(p)) pages.push(p) }
  add(0)
  for (let i = Math.max(1, current - 1); i <= Math.min(total - 2, current + 1); i++) add(i)
  add(total - 1)
  const result = []
  let prev = -1
  for (const p of pages.sort((a, b) => a - b)) {
    if (p - prev > 1) result.push("…")
    result.push(p)
    prev = p
  }
  return result
}

// ── Sub-components ────────────────────────────────────────────
function StatusBadge({ item }) {
  const active = isActive(item)
  return (
    <span style={{
      display: "inline-block",
      fontFamily: "'DM Mono', monospace", fontSize: 9,
      textTransform: "uppercase", letterSpacing: "0.1em",
      padding: "2px 8px",
      ...(active
        ? { background: "#f0f7ed", color: "#3d7a2b", border: "1px solid #e1eedb" }
        : { background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" }),
    }}>
      {active ? "Active" : "Inactive"}
    </span>
  )
}

function PagBtn({ label, onClick, disabled, active }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        minWidth: 28, height: 28, padding: "0 6px",
        borderRadius: 4, border: "1px solid",
        borderColor: active ? "#3d7a2b" : disabled ? "#e8ebe3" : "#dde0d4",
        background: active ? "#3d7a2b" : "transparent",
        color: active ? "#fff" : disabled ? "#d1d5db" : "#6b7260",
        fontSize: 12, fontFamily: "'DM Mono', monospace",
        cursor: disabled ? "not-allowed" : "pointer",
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        transition: "all 120ms",
      }}
    >
      {label}
    </button>
  )
}

function ErrorBanner({ msg, onRetry }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626",
      padding: "10px 16px",
      fontFamily: "'DM Mono', monospace", fontSize: 12,
    }}>
      <span>Failed to load catalogue: {msg}</span>
      <button onClick={onRetry} style={{
        background: "none", border: "none", color: "#dc2626",
        cursor: "pointer", fontSize: 12, textDecoration: "underline",
        fontFamily: "inherit",
      }}>Retry</button>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────
export default function ItemCataloguePage() {
  const [items,      setItems]      = useState([])
  const [totalPages, setTotalPages] = useState(0)
  const [totalItems, setTotalItems] = useState(0)
  const [page,       setPage]       = useState(0)   // 0-indexed
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState(null)

  const load = useCallback(async (pageNum) => {
    setLoading(true)
    setError(null)
    try {
      // GET /api/v1/items
      // Returns: ApiResponse<Page<ItemResponse>>
      // ItemResponse: { id, code, name, category, unitOfMeasure, unitPrice, active, status }
      const res = await api.get(`/items?page=${pageNum}&size=${PAGE_SIZE}&sort=name,asc`)

      // ApiResponse shape: { success, data: { content, totalPages, totalElements } }
      const payload = res?.data
      setItems(payload?.content ?? [])
      setTotalPages(payload?.totalPages ?? 0)
      setTotalItems(payload?.totalElements ?? 0)
    } catch (err) {
      const msg = err?.response?.data?.message ?? err.message ?? "Unknown error"
      setError(msg)
      toast.error("Failed to load catalogue")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load(page) }, [load, page])

  const goTo = (p) => {
    if (p < 0 || p >= totalPages) return
    setPage(p)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const COLS = ["Code", "Name", "Category", "Unit", "Unit Price", "Status"]

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <PageHeader
        title="Item Catalogue"
        subtitle={`Master list of all inventory items across the system.${totalItems ? ` ${totalItems.toLocaleString()} items total.` : ""}`}
      />

      {error && <ErrorBanner msg={error} onRetry={() => load(page)} />}

      <div style={{
        background: "#fff", border: "1px solid #dde0d4", overflow: "hidden",
      }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, fontFamily: "'Geist', sans-serif" }}>
          <thead>
            <tr style={{ background: "#f7f8f4", borderBottom: "1px solid #e8ebe3" }}>
              {COLS.map(h => (
                <th key={h} style={{
                  padding: "10px 16px", textAlign: "left", fontWeight: 500,
                  color: "#9ca3af", fontSize: 10,
                  fontFamily: "'DM Mono', monospace",
                  textTransform: "uppercase", letterSpacing: "0.1em",
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
                      animation: "ic-spin 0.7s linear infinite",
                    }} />
                    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#9ca3af", textTransform: "uppercase" }}>
                      Loading…
                    </span>
                  </div>
                  <style>{`@keyframes ic-spin { to { transform: rotate(360deg) } }`}</style>
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={COLS.length} style={{
                  padding: 48, textAlign: "center",
                  fontFamily: "'Geist', sans-serif", fontSize: 13, color: "#9ca3af",
                }}>
                  No items found
                </td>
              </tr>
            ) : items.map((item, i) => (
              <tr
                key={item.id ?? i}
                style={{ borderBottom: "1px solid #f0f1ec", transition: "background 120ms" }}
                onMouseEnter={e => e.currentTarget.style.background = "#fafbf8"}
                onMouseLeave={e => e.currentTarget.style.background = ""}
              >
                {/* ItemResponse.code */}
                <td style={{ padding: "11px 16px", fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#3d7a2b", fontWeight: 600 }}>
                  {item.code ?? "—"}
                </td>

                {/* ItemResponse.name */}
                <td style={{ padding: "11px 16px", fontWeight: 500, color: "#1a1f0e" }}>
                  {item.name ?? "—"}
                </td>

                {/* ItemResponse.category */}
                <td style={{ padding: "11px 16px", color: "#6b7260" }}>
                  {item.category ?? "—"}
                </td>

                {/* ItemResponse.unitOfMeasure */}
                <td style={{ padding: "11px 16px", color: "#6b7260" }}>
                  {item.unitOfMeasure ?? "—"}
                </td>

                {/* ItemResponse.unitPrice (BigDecimal → RWF) */}
                <td style={{ padding: "11px 16px", fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#1a1f0e" }}>
                  {formatPrice(item.unitPrice)}
                </td>

                {/* ItemResponse.active (boolean) | .status (string) */}
                <td style={{ padding: "11px 16px" }}>
                  <StatusBadge item={item} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ── Pagination footer ── */}
        {!loading && totalPages > 1 && (
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "12px 16px", borderTop: "1px solid #e8ebe3",
            background: "#f7f8f4",
            fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#6b7260",
          }}>
            <span>
              Page{" "}
              <strong style={{ color: "#1a1f0e" }}>{page + 1}</strong>
              {" "}of{" "}
              <strong style={{ color: "#1a1f0e" }}>{totalPages}</strong>
              {"  ·  "}
              <span style={{ color: "#9ca3af" }}>{totalItems.toLocaleString()} items</span>
            </span>

            <div style={{ display: "flex", gap: 4 }}>
              <PagBtn label="«" onClick={() => goTo(0)}             disabled={page === 0} />
              <PagBtn label="‹" onClick={() => goTo(page - 1)}      disabled={page === 0} />

              {getPageWindow(page, totalPages).map((p, idx) =>
                p === "…" ? (
                  <span key={`ellipsis-${idx}`} style={{ padding: "4px 4px", color: "#9ca3af", alignSelf: "center" }}>…</span>
                ) : (
                  <PagBtn key={p} label={p + 1} onClick={() => goTo(p)} active={p === page} />
                )
              )}

              <PagBtn label="›" onClick={() => goTo(page + 1)}      disabled={page >= totalPages - 1} />
              <PagBtn label="»" onClick={() => goTo(totalPages - 1)} disabled={page >= totalPages - 1} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}