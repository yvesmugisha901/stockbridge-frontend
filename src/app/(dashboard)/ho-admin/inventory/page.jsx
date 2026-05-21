"use client"

import { useState } from "react"
import PageHeader from "@/components/ui/PageHeader"
import Link from "next/link"
import toast from "react-hot-toast"

// ── Icons ─────────────────────────────────────────────────────────────────────
const IconAdjust = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
)

// ── Mock Initial Core Item Catalogue ─────────────────────────────────────────
const INITIAL_CATALOGUE = [
  { code: "CMNT-425", item: "Cement 42.5N", category: "Materials", unit: "Bags", status: "Active" },
  { code: "PNT-20L",  item: "Paint 20L",       category: "Finishing", unit: "Buckets", status: "Active" },
  { code: "STEL-12",  item: "Steel Rods 12mm", category: "Structural", unit: "Pieces", status: "Active" },
  { code: "PVC-04",   item: "PVC Pipe 4\"",     category: "Plumbing",   unit: "Lengths", status: "Active" },
]

export default function InventoryPage() {
  const [items, setItems] = useState(INITIAL_CATALOGUE)
  const [selectedItem, setSelectedItem] = useState(null)
  const [adjustQty, setAdjustQty] = useState("")
  const [adjustType, setAdjustType] = useState("ADD")

  const handleApplyAdjustment = (e) => {
    e.preventDefault()
    if (!adjustQty || parseInt(adjustQty) <= 0) {
      toast.error("Please specify a valid quantity amount.")
      return
    }

    toast.success(`Inventory adjustment logged for ${selectedItem.code}: ${adjustType} ${adjustQty} ${selectedItem.unit}.`)
    
    // Clear Workspace
    setSelectedItem(null)
    setAdjustQty("")
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      
      {/* ── Page Header Module ── */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
        <PageHeader
          title="Item Catalogue"
          subtitle="Manage your global system master item indexes, categories, and direct baseline adjustments."
        />
        <Link
          href="/ho-admin/inventory/new"
          style={{
            display: "inline-flex",
            alignItems: "center",
            padding: "8px 16px",
            border: "1px solid #3d7a2b",
            background: "#3d7a2b",
            color: "#fff",
            fontFamily: "'DM Mono', monospace",
            fontSize: 12,
            fontWeight: 600,
            textTransform: "uppercase",
            textDecoration: "none",
            transition: "background 0.15s, border-color 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#2f5e21"
            e.currentTarget.style.borderColor = "#2f5e21"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#3d7a2b"
            e.currentTarget.style.borderColor = "#3d7a2b"
          }}
        >
          + Add New Item
        </Link>
      </div>

      {/* ── Responsive Layout Grid Split for Adjustments Drawer ── */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: selectedItem ? "1fr 340px" : "1fr", 
        gap: 16,
        alignItems: "start"
      }}>
        
        {/* Left Side: Catalogue Table Block */}
        <div style={{ background: "#fff", border: "1px solid #dde0d4", padding: "24px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            
            {/* Table Header Row Component */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "120px 1.5fr 1fr 100px 100px 90px",
              padding: "6px 0",
              borderBottom: "1px solid #e8ebe3",
              gap: 8,
            }}>
              {["Code", "Name / Nomenclature", "Category", "Unit", "Status", "Actions"].map(h => (
                <span key={h} style={{
                  fontFamily: "'DM Mono', monospace", fontSize: 9,
                  textTransform: "uppercase", letterSpacing: "0.12em", color: "#9ca3af",
                }}>{h}</span>
              ))}
            </div>

            {/* Dynamic Items Row Loop */}
            {items.length === 0 ? (
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#9ca3af", textAlign: "center", padding: "40px 0" }}>
                No active items configured inside global master catalogue.
              </div>
            ) : (
              items.map((entry, idx) => (
                <div
                  key={entry.code}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "120px 1.5fr 1fr 100px 100px 90px",
                    padding: "12px 0",
                    borderBottom: idx < items.length - 1 ? "1px solid #f0f1ec" : "none",
                    gap: 8,
                    alignItems: "center",
                  }}
                >
                  {/* Item Code Tag */}
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#3d7a2b", fontWeight: 600 }}>
                    {entry.code}
                  </span>

                  {/* Name */}
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 500, color: "#1a1f0e" }}>
                    {entry.item}
                  </span>

                  {/* Category */}
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#6b7260" }}>
                    {entry.category}
                  </span>

                  {/* Unit Measure */}
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#1a1f0e" }}>
                    {entry.unit}
                  </span>

                  {/* Status Indicator Badge */}
                  <div>
                    <span style={{
                      display: "inline-block",
                      fontFamily: "'DM Mono', monospace",
                      fontSize: 9,
                      textTransform: "uppercase",
                      background: "#f0f7ed",
                      color: "#3d7a2b",
                      border: "1px solid #e1eedb",
                      padding: "1px 6px"
                    }}>
                      {entry.status}
                    </span>
                  </div>

                  {/* Interaction Control Action Button */}
                  <div>
                    <button
                      onClick={() => setSelectedItem(entry)}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        fontFamily: "'DM Mono', monospace",
                        fontSize: 10,
                        textTransform: "uppercase",
                        color: "#6b7260",
                        background: "#f7f8f4",
                        border: "1px solid #dde0d4",
                        padding: "4px 8px",
                        cursor: "pointer",
                        transition: "all 0.15s"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "#3d7a2b"
                        e.currentTarget.style.color = "#3d7a2b"
                        e.currentTarget.style.background = "#f0f7ed"
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "#dde0d4"
                        e.currentTarget.style.color = "#6b7260"
                        e.currentTarget.style.background = "#f7f8f4"
                      }}
                    >
                      <IconAdjust /> Adjust
                    </button>
                  </div>

                </div>
              ))
            )}

          </div>
        </div>

        {/* Right Side: Interactive Manual Dynamic Adjustment Form Workspace Panel */}
        {selectedItem && (
          <div style={{ background: "#fff", border: "1px solid #3d7a2b", padding: "24px", display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #dde0d4", paddingBottom: 10 }}>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 600, color: "#1a1f0e", margin: 0 }}>
                Stock Adjustment Node
              </p>
              <button 
                onClick={() => setSelectedItem(null)}
                style={{ background: "none", border: "none", color: "#9ca3af", cursor: "pointer", fontFamily: "'DM Mono', monospace", fontSize: 12 }}
              >
                ✕ Close
              </button>
            </div>

            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#6b7260" }}>
              Creating manual stock levels profile update for item:{" "}
              <strong style={{ color: "#1a1f0e", fontFamily: "'DM Mono', monospace" }}>{selectedItem.code}</strong> ({selectedItem.item})
            </div>

            <form onSubmit={handleApplyAdjustment} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              
              {/* Type Option Selector */}
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, textTransform: "uppercase", color: "#6b7260" }}>Correction Type</span>
                <select
                  value={adjustType}
                  onChange={(e) => setAdjustType(e.target.value)}
                  style={{
                    fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#1a1f0e",
                    padding: "6px 10px", border: "1px solid #dde0d4", background: "#f7f8f4", outline: "none"
                  }}
                >
                  <option value="ADD">Add Stock Quantities (+)</option>
                  <option value="DEDUCT">Deduct Stock Quantities (-)</option>
                </select>
              </div>

              {/* Quantity Input Field */}
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, textTransform: "uppercase", color: "#6b7260" }}>
                  Quantity Count ({selectedItem.unit})
                </span>
                <input
                  type="number"
                  min="1"
                  required
                  placeholder="e.g. 50"
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(e.target.value)}
                  style={{
                    fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#1a1f0e",
                    padding: "6px 10px", border: "1px solid #dde0d4", outline: "none"
                  }}
                />
              </div>

              {/* Apply Action Button */}
              <button
                type="submit"
                style={{
                  marginTop: 6,
                  fontFamily: "'DM Mono', monospace", fontSize: 12, fontWeight: 600, textTransform: "uppercase",
                  background: "#1a1f0e", color: "#fff", padding: "10px", border: "1px solid #1a1f0e",
                  cursor: "pointer", transition: "background 0.15s"
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "#3d7a2b"}
                onMouseLeave={(e) => e.currentTarget.style.background = "#1a1f0e"}
              >
                Apply Correction Loop
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  )
}