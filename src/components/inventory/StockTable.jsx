"use client"

import { useState, useEffect } from "react"
import PageHeader from "@/components/ui/PageHeader"
import { api } from "@/lib/api/client"
import toast from "react-hot-toast"

const IconAlert = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
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

const PAGE_SIZE = 20

export default function MyStockPage() {
  const [stock, setStock]                           = useState([])
  const [loading, setLoading]                       = useState(true)
  const [showOnlyViolations, setShowOnlyViolations] = useState(false)
  const [search, setSearch]                         = useState("")
  const [page, setPage]                             = useState(0) // 0-indexed to match Spring

  // Reset to first page when filters change
  useEffect(() => { setPage(0) }, [search, showOnlyViolations])

  useEffect(() => { fetchStock() }, [page, showOnlyViolations])

  async function fetchStock() {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page,
        size: PAGE_SIZE,
        ...(showOnlyViolations && { lowStock: true }),
        ...(search.trim() && { search: search.trim() }),
      })
      const res = await api.get(`/stock?${params}`)
      if (res?.success) {
        setStock(res.data)   // full Page<> object: { content, totalElements, totalPages, number }
      } else {
        toast.error("Failed to load inventory")
      }
    } catch (err) {
      toast.error(err.message || "Failed to fetch stock levels")
    } finally {
      setLoading(false)
    }
  }

  // Trigger search on Enter or when search clears
  useEffect(() => {
    if (search === "") fetchStock()
  }, [search])

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") { setPage(0); fetchStock() }
  }

  const content      = stock.content      ?? []
  const totalElements = stock.totalElements ?? 0
  const totalPages   = stock.totalPages   ?? 1
  const currentPage  = stock.number       ?? 0

  // Use backend's isLowStock flag with fallback
  const isItemLow = (s) => s.isLowStock || s.quantityOnHand <= s.minimumThreshold

  const lowStockCount = content.filter(isItemLow).length

  const branchName = content.length > 0 ? content[0].branchName : "My Branch"

  const startItem = totalElements === 0 ? 0 : currentPage * PAGE_SIZE + 1
  const endItem   = Math.min((currentPage + 1) * PAGE_SIZE, totalElements)

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      <PageHeader
        title={`${branchName} — Inventory`}
        subtitle="Live stock levels, reserved balances, and low stock alerts for your branch."
      />

      {/* ── Low stock banner ── */}
      {!loading && lowStockCount > 0 && (
        <div style={{
          display: "flex", alignItems: "center", gap: 12,
          background: "#fef2f2", border: "1px solid #fee2e2",
          padding: "12px 16px",
        }}>
          <span style={{ color: "#dc2626", flexShrink: 0 }}><IconAlert /></span>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#dc2626", fontWeight: 500, margin: 0 }}>
            {lowStockCount} item{lowStockCount > 1 ? "s are" : " is"} below the minimum stock threshold on this page.
          </p>
          <button
            onClick={() => setShowOnlyViolations(true)}
            style={{
              marginLeft: "auto", background: "none", border: "none",
              cursor: "pointer", fontSize: 12, color: "#dc2626",
              fontFamily: "'Inter', sans-serif", textDecoration: "underline",
              flexShrink: 0,
            }}
          >
            Show only
          </button>
        </div>
      )}

      {/* ── Filter & Search Bar ── */}
      <div style={{
        background: "#fff", border: "1px solid #dde0d4",
        padding: "16px 24px", display: "flex",
        flexWrap: "wrap", alignItems: "center",
        justifyContent: "space-between", gap: 16,
      }}>
        {/* Search */}
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          border: "1px solid #dde0d4", background: "#f7f8f4",
          padding: "8px 12px", minWidth: 240,
        }}>
          <span style={{ color: "#9ca3af", flexShrink: 0 }}><IconSearch /></span>
          <input
            type="text"
            placeholder="Search by item name or code… (Enter)"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            style={{
              background: "transparent", border: "none", outline: "none",
              fontSize: 13, fontFamily: "'Inter', sans-serif",
              color: "#1a1f0e", width: "100%",
            }}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
          {/* Low stock toggle */}
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={showOnlyViolations}
              onChange={e => setShowOnlyViolations(e.target.checked)}
              style={{ accentColor: "#dc2626", width: 15, height: 15 }}
            />
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#1a1f0e" }}>
              Low stock only
            </span>
          </label>

          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#9ca3af" }}>
            {totalElements} item{totalElements !== 1 ? "s" : ""} total
          </span>
        </div>
      </div>

      {/* ── Table ── */}
      <div style={{ background: "#fff", border: "1px solid #dde0d4", overflow: "hidden" }}>
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "48px 0" }}>
            <div style={{
              width: 24, height: 24,
              border: "2px solid #dde0d4",
              borderTopColor: "#3d7a2b",
              borderRadius: "50%",
              animation: "sb-spin 0.7s linear infinite",
            }} />
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#6b7260", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Loading stock levels...
            </span>
            <style>{`@keyframes sb-spin { to { transform: rotate(360deg) } }`}</style>
          </div>
        ) : content.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 0", fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#9ca3af" }}>
            {search || showOnlyViolations
              ? "No items match your current filters."
              : "No stock records found for your branch."}
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#f7f8f4", borderBottom: "1px solid #e8ebe3" }}>
                {["Item Code", "Item Name", "On Hand", "Reserved", "Status"].map(h => (
                  <th key={h} style={{
                    textAlign: "left", padding: "10px 20px",
                    fontFamily: "'DM Mono', monospace", fontSize: 10,
                    textTransform: "uppercase", letterSpacing: "0.1em",
                    color: "#9ca3af", fontWeight: 500,
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {content.map((s, idx) => {
                const low = isItemLow(s)
                return (
                  <tr key={s.id ?? idx} style={{
                    borderBottom: idx < content.length - 1 ? "1px solid #f0f1ec" : "none",
                  }}>
                    <td style={{ padding: "12px 20px", fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#6b7260" }}>
                      {s.itemCode ?? "—"}
                    </td>
                    <td style={{ padding: "12px 20px", fontFamily: "'Inter', sans-serif", fontWeight: 500, color: "#1a1f0e" }}>
                      {s.itemName}
                    </td>
                    <td style={{ padding: "12px 20px", fontFamily: "'Inter', sans-serif", fontWeight: 600, color: low ? "#dc2626" : "#1a1f0e" }}>
                      {s.quantityOnHand}
                    </td>
                    <td style={{ padding: "12px 20px", fontFamily: "'Inter', sans-serif", color: "#9ca3af" }}>
                      {s.reservedQuantity ?? 0}
                    </td>
                    <td style={{ padding: "12px 20px" }}>
                      {low ? (
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: 4,
                          background: "#fef2f2", color: "#dc2626",
                          border: "1px solid #fee2e2",
                          fontFamily: "'DM Mono', monospace", fontSize: 10, fontWeight: 600,
                          padding: "2px 8px",
                        }}>
                          <IconAlert /> BELOW MIN ({s.minimumThreshold})
                        </span>
                      ) : (
                        <span style={{
                          display: "inline-block",
                          background: "#f0f7ed", color: "#3d7a2b",
                          border: "1px solid #e1eedb",
                          fontFamily: "'DM Mono', monospace", fontSize: 10,
                          padding: "2px 8px",
                        }}>
                          SAFE — MIN {s.minimumThreshold}
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Pagination ── */}
      {!loading && totalPages > 1 && (
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "12px 4px", flexWrap: "wrap", gap: 12,
        }}>
          {/* Range label */}
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#9ca3af" }}>
            Showing {startItem}–{endItem} of {totalElements}
          </span>

          {/* Page buttons */}
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {/* Prev */}
            <PaginationBtn onClick={() => setPage(p => p - 1)} disabled={currentPage === 0}>
              <IconChevronLeft />
            </PaginationBtn>

            {/* Page numbers */}
            {buildPageNumbers(currentPage, totalPages).map((p, i) =>
              p === "…" ? (
                <span key={`ellipsis-${i}`} style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#9ca3af", padding: "0 6px" }}>…</span>
              ) : (
                <PaginationBtn key={p} onClick={() => setPage(p)} active={p === currentPage}>
                  {p + 1}
                </PaginationBtn>
              )
            )}

            {/* Next */}
            <PaginationBtn onClick={() => setPage(p => p + 1)} disabled={currentPage >= totalPages - 1}>
              <IconChevronRight />
            </PaginationBtn>
          </div>
        </div>
      )}

    </div>
  )
}

// ─── Pagination helpers ───────────────────────────────────────────────────────

function buildPageNumbers(current, total) {
  // Always show: first, last, current, and 1 neighbour on each side. Rest → "…"
  const delta = 1
  const range = []
  const rangeWithDots = []

  for (let i = Math.max(0, current - delta); i <= Math.min(total - 1, current + delta); i++) {
    range.push(i)
  }
  if (!range.includes(0)) { rangeWithDots.push(0); if (range[0] > 1) rangeWithDots.push("…") }
  rangeWithDots.push(...range)
  if (!range.includes(total - 1)) {
    if (range[range.length - 1] < total - 2) rangeWithDots.push("…")
    rangeWithDots.push(total - 1)
  }
  return rangeWithDots
}

function PaginationBtn({ children, onClick, disabled, active }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        minWidth: 32, height: 32, display: "inline-flex",
        alignItems: "center", justifyContent: "center",
        border: active ? "1px solid #3d7a2b" : "1px solid #dde0d4",
        background: active ? "#f0f7ed" : disabled ? "#f7f8f4" : "#fff",
        color: active ? "#3d7a2b" : disabled ? "#c4c7be" : "#1a1f0e",
        fontFamily: "'DM Mono', monospace", fontSize: 12, fontWeight: active ? 700 : 400,
        cursor: disabled ? "not-allowed" : "pointer",
        borderRadius: 4, padding: "0 8px", transition: "all 0.1s",
      }}
    >
      {children}
    </button>
  )
}