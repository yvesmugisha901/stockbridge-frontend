"use client"

import { useState, useEffect } from "react"
import PageHeader from "@/components/ui/PageHeader"
import { api } from "@/lib/api/client"
import toast from "react-hot-toast"

// ── Icons ─────────────────────────────────────────────────────────────────────
const IconAlert = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
)

export default function MyStockPage() {
  const [stock, setStock] = useState([])
  const [loading, setLoading] = useState(true)
  const [showOnlyViolations, setShowOnlyViolations] = useState(false)

  useEffect(() => {
    fetchStock()
  }, [])

  async function fetchStock() {
    try {
      setLoading(true)
      const res = await api.get("/stock?size=200")
      if (res && res.success) {
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

  // Filter low stock violations
  const filteredStock = stock.filter(entry => {
    return !showOnlyViolations || entry.quantityOnHand <= entry.minimumThreshold
  })

  // Branch Name from first entry if available, else standard header
  const branchName = stock.length > 0 ? stock[0].branchName : "My Branch"

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      
      <PageHeader
        title={`${branchName} — Inventory`}
        subtitle="Manage and track live physical stock, reserved balances, and low stock thresholds for your location."
      />

      {/* ── Filter Controls Panel ── */}
      <div style={{ background: "#fff", border: "1px solid #dde0d4", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          {/* Toggle Alert Filter Checkbox */}
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#1a1f0e" }}>
            <input
              type="checkbox"
              checked={showOnlyViolations}
              onChange={(e) => setShowOnlyViolations(e.target.checked)}
              style={{ accentColor: "#dc2626", width: 15, height: 15 }}
            />
            <span>Show Low Stock Violations Only</span>
          </label>
        </div>

        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#6b7260" }}>
          Tracked Items: {filteredStock.length}
        </span>
      </div>

      {/* ── Global Matrix Inventory Ledger ── */}
      <div style={{ background: "#fff", border: "1px solid #dde0d4", padding: "24px" }}>
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "48px 0" }}>
            <div style={{
              width: 24, height: 24,
              border: "2px solid #dde0d4",
              borderTopColor: "#3d7a2b",
              borderRadius: "50%",
              animation: "sb-spin 0.7s linear infinite",
            }} />
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#6b7260" }}>LOADING STOCK LEVELS...</span>
            <style>{`@keyframes sb-spin { to { transform: rotate(360deg) } }`}</style>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            
            {/* Table Structural Header Line */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "100px 1.8fr 100px 100px 120px",
              padding: "8px 0",
              borderBottom: "1px solid #e8ebe3",
              gap: 12,
            }}>
              {["Item Code", "Item Nomenclature", "On Hand", "Reserved", "Alert Context"].map(h => (
                <span key={h} style={{
                  fontFamily: "'DM Mono', monospace", fontSize: 9,
                  textTransform: "uppercase", letterSpacing: "0.12em", color: "#9ca3af",
                }}>{h}</span>
              ))}
            </div>

            {/* Dynamic Table Items Content Row Loop */}
            {filteredStock.length === 0 ? (
              <div style={{ textAlign: "center", padding: "48px 0", fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#6b7260" }}>
                No inventory records located matching selection rules. All operations steady.
              </div>
            ) : (
              filteredStock.map((s, idx) => {
                const isLow = s.quantityOnHand <= s.minimumThreshold
                return (
                  <div
                    key={s.itemId + idx}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "100px 1.8fr 100px 100px 120px",
                      padding: "12px 0",
                      borderBottom: idx < filteredStock.length - 1 ? "1px solid #f0f1ec" : "none",
                      gap: 12,
                      alignItems: "center",
                    }}
                  >
                    {/* System Code Tag */}
                    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#6b7260" }}>
                      {s.itemCode}
                    </span>

                    {/* Nomenclature String Descriptor */}
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 500, color: "#1a1f0e" }}>
                      {s.itemName}
                    </span>

                    {/* Live Balance Quantification */}
                    <span style={{ 
                      fontFamily: "'Inter', sans-serif", 
                      fontSize: 13, 
                      fontWeight: 600, 
                      color: isLow ? "#dc2626" : "#1a1f0e" 
                    }}>
                      {s.quantityOnHand} units
                    </span>

                    {/* Reserved quantity */}
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#6b7260" }}>
                      {s.reservedQuantity}
                    </span>

                    {/* Alert Threshold Pill Execution */}
                    <div>
                      {isLow ? (
                        <span style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          background: "#fef2f2",
                          color: "#dc2626",
                          fontSize: 10,
                          fontFamily: "'DM Mono', monospace",
                          fontWeight: 600,
                          border: "1px solid #fee2e2",
                          padding: "2px 6px"
                        }}>
                          <IconAlert /> MIN {s.minimumThreshold}
                        </span>
                      ) : (
                        <span style={{
                          display: "inline-block",
                          background: "#f0f7ed",
                          color: "#3d7a2b",
                          fontSize: 10,
                          fontFamily: "'DM Mono', monospace",
                          border: "1px solid #fee2e2",
                          borderColor: "#e1eedb",
                          padding: "2px 6px"
                        }}>
                          SAFE (MIN {s.minimumThreshold})
                        </span>
                      )}
                    </div>

                  </div>
                )
              })
            )}

          </div>
        )}
      </div>

    </div>
  )
}
