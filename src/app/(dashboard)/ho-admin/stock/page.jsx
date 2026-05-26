"use client"
import { useState, useEffect, useCallback } from "react"
import PageHeader from "@/components/ui/PageHeader"
import { api } from "@/lib/api/client"
import toast from "react-hot-toast"

// ── Icons ──────────────────────────────────────────────────────────────────────
const IconAlert = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
)

export default function AllStockPage() {
  const [stock, setStock]       = useState([])
  const [branches, setBranches] = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)

  const [selectedBranchId, setSelectedBranchId] = useState("")
  const [showOnlyLow, setShowOnlyLow]           = useState(false)

  // Load branches for dropdown
  useEffect(() => {
    api.get("/branches?size=100&sort=name,asc")
      .then((r) => setBranches(r?.data?.content ?? []))
      .catch(() => {})
  }, [])

  // Load stock — NO sort param sent to backend (branchName is not a direct JPA field).
  // Sorting is done client-side after the response arrives.
  const loadStock = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const params = new URLSearchParams({ size: "500" })          // ← sort removed
      if (selectedBranchId) params.append("branchId", selectedBranchId)
      const res = await api.get(`/stock?${params.toString()}`)
      const content = (res?.data?.content ?? [])
        .sort((a, b) => (a.branchName ?? "").localeCompare(b.branchName ?? "")) // ← client-side sort
      setStock(content)
    } catch (err) {
      setError(err.message)
      toast.error("Failed to load stock levels")
    } finally {
      setLoading(false)
    }
  }, [selectedBranchId])

  useEffect(() => { loadStock() }, [loadStock])

  // Client-side low-stock filter
  const filtered = showOnlyLow
    ? stock.filter((s) => s.isLowStock === true || s.isLowStock === 1)
    : stock

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      <PageHeader
        title="All Branches — Stock Levels"
        subtitle="System-wide inventory quantities, stock distributions, and threshold alert cross-referencing."
      />

      {/* Filter Controls */}
      <div style={{ background: "#fff", border: "1px solid #dde0d4", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, textTransform: "uppercase", color: "#6b7260" }}>
              Branch:
            </span>
            <select
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value)}
              style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#1a1f0e", padding: "6px 12px", border: "1px solid #dde0d4", background: "#f7f8f4", outline: "none" }}
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
          {loading ? "Loading..." : `${filtered.length} records`}
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
          <div style={{ padding: "16px", background: "#fef2f2", border: "1px solid #fecaca", fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#dc2626" }}>
            {error}
          </div>
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
                {showOnlyLow ? "No low stock alerts. All items are above their minimum threshold." : "No stock records found."}
              </div>
            ) : (
              filtered.map((s, idx) => (
                <div
                  key={s.id}
                  style={{ display: "grid", gridTemplateColumns: "100px 1.5fr 1fr 1.2fr 90px 80px 110px 120px", padding: "12px 0", borderBottom: idx < filtered.length - 1 ? "1px solid #f0f1ec" : "none", gap: 12, alignItems: "center" }}
                >
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#6b7260" }}>
                    {s.itemCode ?? "—"}
                  </span>

                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 500, color: "#1a1f0e" }}>
                    {s.itemName}
                  </span>

                  {/* category not in StockLevelResponse — lives on ItemResponse */}
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#6b7260" }}>—</span>

                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#1a1f0e" }}>
                    {s.branchName}
                  </span>

                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 600, color: s.isLowStock ? "#dc2626" : "#1a1f0e" }}>
                    {s.quantityOnHand}
                  </span>

                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#9ca3af" }}>
                    {s.reservedQuantity ?? 0}
                  </span>

                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#6b7260" }}>
                    {s.minimumThreshold}
                  </span>

                  <div>
                    {s.isLowStock ? (
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
          </>
        )}
      </div>
    </div>
  )
}