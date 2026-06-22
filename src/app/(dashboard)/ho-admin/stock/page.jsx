"use client"
import { useState, useEffect, useCallback } from "react"
import PageHeader from "@/components/ui/PageHeader"
import { api } from "@/lib/api/client"
import toast from "react-hot-toast"

const IconAlert = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
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

export default function AllStockPage() {
  const [stock, setStock]                   = useState([])
  const [branches, setBranches]             = useState([])
  const [loading, setLoading]               = useState(true)
  const [error, setError]                   = useState(null)
  const [totalPages, setTotalPages]         = useState(0)
  const [totalElements, setTotalElements]   = useState(0)

  const [selectedBranchId, setSelectedBranchId] = useState("")
  const [showOnlyLow, setShowOnlyLow]           = useState(false)
  const [page, setPage]                         = useState(0)

  // ── Load branches ──────────────────────────────────────────────────────────
  // /branches returns { success, data: [...] } — data is a plain array, NOT paginated
  useEffect(() => {
    let cancelled = false
    async function fetchBranches() {
      try {
        const res = await api.get("/branches")
        if (!cancelled) {
          // res.data is a plain array
          const list = Array.isArray(res?.data) ? res.data : []
          setBranches(list)
        }
      } catch (e) {
        console.error("Failed to load branches:", e)
      }
    }
    fetchBranches()
    return () => { cancelled = true }
  }, [])

  // ── Load stock ─────────────────────────────────────────────────────────────
  const loadStock = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({ page: String(page), size: String(PAGE_SIZE) })
      if (selectedBranchId) params.append("branchId", selectedBranchId)
      if (showOnlyLow)      params.append("lowStock", "true")

      const res = await api.get(`/stock?${params.toString()}`)

      const data    = res?.data ?? res
      const content = (data?.content ?? [])
        .sort((a, b) => (a.branchName ?? "").localeCompare(b.branchName ?? ""))

      setStock(content)
      setTotalPages(data?.totalPages ?? 0)
      setTotalElements(data?.totalElements ?? 0)
    } catch (err) {
      setError(err.message)
      toast.error("Failed to load stock levels")
    } finally {
      setLoading(false)
    }
  }, [selectedBranchId, showOnlyLow, page])

  useEffect(() => { loadStock() }, [loadStock])
  useEffect(() => { setPage(0) }, [selectedBranchId, showOnlyLow])

  // API field is `lowStock` (boolean), not `isLowStock`
  const filtered = showOnlyLow
    ? stock.filter((s) => s.lowStock === true)
    : stock

  const canPrev     = page > 0
  const canNext     = page < totalPages - 1
  const displayFrom = totalElements === 0 ? 0 : page * PAGE_SIZE + 1
  const displayTo   = Math.min((page + 1) * PAGE_SIZE, totalElements)

  const pageNumbers = (() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i)
    const delta = 2
    const range = []
    const left  = Math.max(0, page - delta)
    const right = Math.min(totalPages - 1, page + delta)
    if (left > 0)               range.push(0)
    if (left > 1)               range.push("...")
    for (let i = left; i <= right; i++) range.push(i)
    if (right < totalPages - 2) range.push("...")
    if (right < totalPages - 1) range.push(totalPages - 1)
    return range
  })()

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      <PageHeader
        title="All Branches — Stock Levels"
        subtitle="System-wide inventory quantities, stock distributions, and threshold alert cross-referencing."
      />

      {/* Filter Controls */}
      <div style={{ background: "#fff", border: "1px solid #dde0d4", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, textTransform: "uppercase", color: "#6b7260" }}>Branch:</span>
            <select
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value)}
              style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#1a1f0e", padding: "6px 12px", border: "1px solid #dde0d4", background: "#f7f8f4", outline: "none", minWidth: 160 }}
            >
              <option value="">All Branches</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#1a1f0e" }}>
            <input
              type="checkbox"
              checked={showOnlyLow}
              onChange={(e) => setShowOnlyLow(e.target.checked)}
              style={{ accentColor: "#dc2626", width: 15, height: 15 }}
            />
            Show Low Stock Only
          </label>
        </div>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#6b7260" }}>
          {loading ? "Loading..." : `${totalElements} records`}
        </span>
      </div>

      {/* Table */}
      <div style={{ background: "#fff", border: "1px solid #dde0d4", padding: "24px" }}>
        {loading && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, padding: "48px 0" }}>
            <div style={{ width: 20, height: 20, border: "2px solid #dde0d4", borderTopColor: "#3d7a2b", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#6b7260", textTransform: "uppercase" }}>Loading stock...</span>
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          </div>
        )}

        {error && !loading && (
          <div style={{ padding: "16px", background: "#fef2f2", border: "1px solid #fecaca", fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#dc2626" }}>{error}</div>
        )}

        {!loading && !error && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "100px 1.5fr 1fr 1.2fr 90px 80px 110px 120px", padding: "8px 0", borderBottom: "1px solid #e8ebe3", gap: 12 }}>
              {["Item Code", "Item Name", "Category", "Branch", "On Hand", "Reserved", "Min Threshold", "Status"].map(h => (
                <span key={h} style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.12em", color: "#9ca3af" }}>{h}</span>
              ))}
            </div>

            {filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "48px 0", fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#6b7260" }}>
                {showOnlyLow ? "No low stock alerts." : "No stock records found."}
              </div>
            ) : (
              filtered.map((s, idx) => (
                <div
                  key={s.id}
                  style={{ display: "grid", gridTemplateColumns: "100px 1.5fr 1fr 1.2fr 90px 80px 110px 120px", padding: "12px 0", borderBottom: idx < filtered.length - 1 ? "1px solid #f0f1ec" : "none", gap: 12, alignItems: "center" }}
                >
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#6b7260" }}>{s.itemCode ?? "—"}</span>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 500, color: "#1a1f0e" }}>{s.itemName}</span>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#6b7260" }}>{s.category ?? "—"}</span>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#1a1f0e" }}>{s.branchName}</span>
                  {/* ✅ use s.lowStock (API field name), not s.isLowStock */}
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 600, color: s.lowStock ? "#dc2626" : "#1a1f0e" }}>{s.quantityOnHand}</span>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#9ca3af" }}>{s.reservedQuantity ?? 0}</span>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#6b7260" }}>{s.minimumThreshold}</span>
                  <div>
                    {s.lowStock ? (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "#fef2f2", color: "#dc2626", fontSize: 10, fontFamily: "'DM Mono', monospace", fontWeight: 600, border: "1px solid #fee2e2", padding: "2px 6px" }}>
                        <IconAlert /> LOW
                      </span>
                    ) : (
                      <span style={{ display: "inline-block", background: "#f0f7ed", color: "#3d7a2b", fontSize: 10, fontFamily: "'DM Mono', monospace", border: "1px solid #e1eedb", padding: "2px 6px" }}>
                        SAFE
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}

            {totalPages > 1 && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 20, paddingTop: 16, borderTop: "1px solid #e8ebe3", flexWrap: "wrap", gap: 12 }}>
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#6b7260" }}>{displayFrom}–{displayTo} of {totalElements}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <button onClick={() => setPage(p => p - 1)} disabled={!canPrev} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 30, height: 30, border: "1px solid #dde0d4", background: canPrev ? "#fff" : "#f7f8f4", color: canPrev ? "#1a1f0e" : "#c4c9bc", cursor: canPrev ? "pointer" : "not-allowed" }}>
                    <IconChevronLeft />
                  </button>
                  {pageNumbers.map((p, i) =>
                    p === "..." ? (
                      <span key={`e-${i}`} style={{ width: 30, textAlign: "center", fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#9ca3af" }}>…</span>
                    ) : (
                      <button key={p} onClick={() => setPage(p)} style={{ width: 30, height: 30, border: "1px solid", borderColor: p === page ? "#3d7a2b" : "#dde0d4", background: p === page ? "#3d7a2b" : "#fff", color: p === page ? "#fff" : "#1a1f0e", fontFamily: "'DM Mono', monospace", fontSize: 11, cursor: "pointer", fontWeight: p === page ? 600 : 400 }}>
                        {p + 1}
                      </button>
                    )
                  )}
                  <button onClick={() => setPage(p => p + 1)} disabled={!canNext} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 30, height: 30, border: "1px solid #dde0d4", background: canNext ? "#fff" : "#f7f8f4", color: canNext ? "#1a1f0e" : "#c4c9bc", cursor: canNext ? "pointer" : "not-allowed" }}>
                    <IconChevronRight />
                  </button>
                </div>
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#6b7260" }}>Page {page + 1} of {totalPages}</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
