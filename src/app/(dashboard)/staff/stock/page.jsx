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

export default function MyStockPage() {
  const [stock, setStock]                       = useState([])
  const [loading, setLoading]                   = useState(true)
  const [showOnlyViolations, setShowOnlyViolations] = useState(false)
  const [search, setSearch]                     = useState("")

  useEffect(() => { fetchStock() }, [])

  async function fetchStock() {
    try {
      setLoading(true)
      // GET /api/v1/stock — role-filtered server-side (STAFF/MANAGER see own branch only)
      // Returns ApiResponse<Page<StockLevelResponse>>
      const res = await api.get("/stock?size=200")
      if (res?.success) {
        setStock(res.data.content || [])
      } else {
        toast.error("Failed to load inventory")
      }
    } catch (err) {
      toast.error(err.message || "Failed to fetch stock levels")
    } finally {
      setLoading(false)
    }
  }

  // Use backend's isLowStock flag (preferred) with client-side fallback
  const isItemLow = (s) => s.isLowStock || s.quantityOnHand <= s.minimumThreshold

  const lowStockCount = stock.filter(isItemLow).length

  const filteredStock = stock.filter(entry => {
    const matchesSearch =
      entry.itemName?.toLowerCase().includes(search.toLowerCase()) ||
      entry.itemCode?.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = !showOnlyViolations || isItemLow(entry)
    return matchesSearch && matchesFilter
  })

  // branchName comes from StockLevelResponse
  const branchName = stock.length > 0 ? stock[0].branchName : "My Branch"

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      <PageHeader
        title={`${branchName} — Inventory`}
        subtitle="Live stock levels, reserved balances, and low stock alerts for your branch."
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
              onChange={e => setShowOnlyViolations(e.target.checked)}
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
        </div>
      </div>

      {/* ── Table ── */}
      {/*
        StockLevelResponse fields used:
          id, itemCode, itemName, quantityOnHand, reservedQuantity,
          minimumThreshold, isLowStock, branchName
        NOTE: StockLevelResponse has NO unitOfMeasure field — column removed.
        If you add unitOfMeasure to the DTO later, add it back here.
      */}
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
              {filteredStock.map((s, idx) => {
                const low = isItemLow(s)
                return (
                  <tr key={s.id ?? idx} style={{
                    borderBottom: idx < filteredStock.length - 1 ? "1px solid #f0f1ec" : "none",
                  }}>

                    {/* itemCode — from StockLevelResponse */}
                    <td style={{ padding: "12px 20px", fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#6b7260" }}>
                      {s.itemCode ?? "—"}
                    </td>

                    {/* itemName */}
                    <td style={{ padding: "12px 20px", fontFamily: "'Inter', sans-serif", fontWeight: 500, color: "#1a1f0e" }}>
                      {s.itemName}
                    </td>

                    {/* quantityOnHand — red when low */}
                    <td style={{ padding: "12px 20px", fontFamily: "'Inter', sans-serif", fontWeight: 600, color: low ? "#dc2626" : "#1a1f0e" }}>
                      {s.quantityOnHand}
                    </td>

                    {/* reservedQuantity */}
                    <td style={{ padding: "12px 20px", fontFamily: "'Inter', sans-serif", color: "#9ca3af" }}>
                      {s.reservedQuantity ?? 0}
                    </td>

                    {/* Status badge — FR-12 */}
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

    </div>
  )
}