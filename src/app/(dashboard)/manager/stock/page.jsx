"use client"
import { useState, useEffect } from "react"
import { api } from "@/lib/api/client"
import toast from "react-hot-toast"
import PageHeader from "@/components/ui/PageHeader"

// ─── Icons ────────────────────────────────────────────────────────────────────
const IconAlert = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
)
const IconSearch = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
)
const IconDownload = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
)

export default function ManagerStockPage() {
  const [stock, setStock]                     = useState([])
  const [loading, setLoading]                 = useState(true)
  const [search, setSearch]                   = useState("")
  const [showOnlyViolations, setViolations]   = useState(false)

  useEffect(() => { fetchStock() }, [])

  async function fetchStock() {
    try {
      setLoading(true)
      const res = await api.get("/stock?size=200")
      if (res?.success) setStock(res.data.content || [])
      else toast.error("Failed to load stock levels")
    } catch (err) {
      toast.error(err.message || "Failed to fetch stock")
    } finally {
      setLoading(false)
    }
  }

  // ─── CSV Export — FR-28 ───────────────────────────────────────────────────
  function exportCSV() {
    if (filteredStock.length === 0) {
      toast.error("Nothing to export")
      return
    }
    const headers = ["Item Code", "Item Name", "Unit", "On Hand", "Reserved", "Min Threshold", "Status"]
    const rows = filteredStock.map(s => [
      s.itemCode ?? "",
      s.itemName ?? "",
      s.unitOfMeasure ?? "",
      s.quantityOnHand,
      s.reservedQuantity ?? 0,
      s.minimumThreshold,
      s.quantityOnHand <= s.minimumThreshold ? "BELOW MIN" : "SAFE",
    ])
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement("a")
    a.href     = url
    a.download = `stock-levels-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success("CSV exported")
  }

  const lowStockCount = stock.filter(s => s.quantityOnHand <= s.minimumThreshold).length

  const filteredStock = stock.filter(s => {
    const matchSearch =
      s.itemName?.toLowerCase().includes(search.toLowerCase()) ||
      s.itemCode?.toLowerCase().includes(search.toLowerCase())
    const matchFilter = !showOnlyViolations || s.quantityOnHand <= s.minimumThreshold
    return matchSearch && matchFilter
  })

  const branchName = stock.length > 0 ? stock[0].branchName : "My Branch"

  const labelStyle = {
    fontFamily: "'DM Mono', monospace", fontSize: 9,
    textTransform: "uppercase", letterSpacing: "0.12em",
    color: "#9ca3af", marginBottom: 6, display: "block",
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      <PageHeader
        title={`${branchName} — Stock Levels`}
        subtitle="Live inventory for your branch. Export to CSV or filter by low stock."
      />

      {/* ── Low stock banner — FR-12 ── */}
      {!loading && lowStockCount > 0 && (
        <div style={{
          display: "flex", alignItems: "center", gap: 12,
          background: "#fef2f2", border: "1px solid #fee2e2",
          padding: "12px 16px",
        }}>
          <span style={{ color: "#dc2626", flexShrink: 0 }}><IconAlert /></span>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#dc2626", fontWeight: 500, margin: 0 }}>
            {lowStockCount} item{lowStockCount > 1 ? "s are" : " is"} below the minimum stock threshold.
          </p>
          <button
            onClick={() => setViolations(true)}
            style={{
              marginLeft: "auto", background: "none", border: "none",
              cursor: "pointer", fontSize: 12, color: "#dc2626",
              fontFamily: "'Inter', sans-serif", textDecoration: "underline", flexShrink: 0,
            }}
          >
            Show only
          </button>
        </div>
      )}

      {/* ── Filter & Search bar ── */}
      <div style={{
        background: "#fff", border: "1px solid #dde0d4",
        padding: "16px 24px", display: "flex",
        flexWrap: "wrap", alignItems: "center",
        justifyContent: "space-between", gap: 16,
      }}>

        {/* Search — FR-29 */}
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          border: "1px solid #dde0d4", background: "#f7f8f4",
          padding: "8px 12px", minWidth: 240,
        }}>
          <span style={{ color: "#9ca3af", flexShrink: 0 }}><IconSearch /></span>
          <input
            type="text"
            placeholder="Search by item name or code..."
            value={search}
            onChange={e => setSearch(e.target.value)}
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
              onChange={e => setViolations(e.target.checked)}
              style={{ accentColor: "#dc2626", width: 15, height: 15 }}
            />
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#1a1f0e" }}>
              Low stock only
            </span>
            {lowStockCount > 0 && (
              <span style={{
                background: "#fee2e2", color: "#dc2626",
                fontSize: 10, fontWeight: 700,
                fontFamily: "'DM Mono', monospace",
                padding: "2px 7px", borderRadius: 999,
              }}>
                {lowStockCount}
              </span>
            )}
          </label>

          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#9ca3af" }}>
            {filteredStock.length} item{filteredStock.length !== 1 ? "s" : ""}
          </span>

          {/* CSV Export — FR-28 */}
          <button
            onClick={exportCSV}
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              background: "#f7f8f4", border: "1px solid #dde0d4",
              cursor: "pointer", padding: "7px 14px",
              fontFamily: "'Inter', sans-serif", fontSize: 12,
              color: "#1a1f0e", fontWeight: 500,
            }}
          >
            <IconDownload /> Export CSV
          </button>
        </div>
      </div>

      {/* ── Table ── */}
      <div style={{ background: "#fff", border: "1px solid #dde0d4", overflow: "hidden" }}>
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "48px 0" }}>
            <div style={{
              width: 24, height: 24,
              border: "2px solid #dde0d4", borderTopColor: "#3d7a2b",
              borderRadius: "50%", animation: "sb-spin 0.7s linear infinite",
            }} />
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#6b7260", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Loading stock levels...
            </span>
            <style>{`@keyframes sb-spin { to { transform: rotate(360deg) } }`}</style>
          </div>
        ) : filteredStock.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 0", fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#9ca3af" }}>
            {search || showOnlyViolations
              ? "No items match your current filters."
              : "No stock records found for your branch."}
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#f7f8f4", borderBottom: "1px solid #e8ebe3" }}>
                {["Item Code", "Item Name", "Unit", "On Hand", "Reserved", "Min Threshold", "Status"].map(h => (
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
              {filteredStock.map((s, idx) => {
                const isLow = s.quantityOnHand <= s.minimumThreshold
                return (
                  <tr key={s.itemId ?? idx} style={{
                    borderBottom: idx < filteredStock.length - 1 ? "1px solid #f0f1ec" : "none",
                  }}>

                    {/* Item Code */}
                    <td style={{ padding: "12px 20px", fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#6b7260" }}>
                      {s.itemCode ?? "—"}
                    </td>

                    {/* Item Name */}
                    <td style={{ padding: "12px 20px", fontFamily: "'Inter', sans-serif", fontWeight: 500, color: "#1a1f0e" }}>
                      {s.itemName}
                    </td>

                    {/* Unit — FR-09 */}
                    <td style={{ padding: "12px 20px", fontFamily: "'Inter', sans-serif", color: "#6b7260" }}>
                      {s.unitOfMeasure ?? "—"}
                    </td>

                    {/* On Hand */}
                    <td style={{ padding: "12px 20px", fontFamily: "'Inter', sans-serif", fontWeight: 600, color: isLow ? "#dc2626" : "#1a1f0e" }}>
                      {s.quantityOnHand}
                    </td>

                    {/* Reserved */}
                    <td style={{ padding: "12px 20px", fontFamily: "'Inter', sans-serif", color: "#9ca3af" }}>
                      {s.reservedQuantity ?? 0}
                    </td>

                    {/* Min Threshold */}
                    <td style={{ padding: "12px 20px", fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#6b7260" }}>
                      {s.minimumThreshold}
                    </td>

                    {/* Status — FR-12 */}
                    <td style={{ padding: "12px 20px" }}>
                      {isLow ? (
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: 4,
                          background: "#fef2f2", color: "#dc2626",
                          border: "1px solid #fee2e2",
                          fontFamily: "'DM Mono', monospace", fontSize: 10, fontWeight: 600,
                          padding: "2px 8px",
                        }}>
                          <IconAlert /> BELOW MIN
                        </span>
                      ) : (
                        <span style={{
                          display: "inline-block",
                          background: "#f0f7ed", color: "#3d7a2b",
                          border: "1px solid #e1eedb",
                          fontFamily: "'DM Mono', monospace", fontSize: 10,
                          padding: "2px 8px",
                        }}>
                          SAFE
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

    </div>
  )
}