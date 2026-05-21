"use client"

import { useState } from "react"
import PageHeader from "@/components/ui/PageHeader"
import Link from "next/link"

// ── Icons ─────────────────────────────────────────────────────────────────────
const IconAlert = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
)

const IconCatalogue = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6"/>
    <line x1="8" y1="12" x2="21" y2="12"/>
    <line x1="8" y1="18" x2="21" y2="18"/>
  </svg>
)

// ── Mock Comprehensive Stock Data ─────────────────────────────────────────────
// Contains cross-referenced branch profiles mapping to your primary dashboard matrix
const MOCK_STOCK_LEDGER = [
  { item: "Cement 42.5N",    code: "CMNT-425", category: "Materials", branch: "Branch South", qty: 8,  threshold: 50 },
  { item: "Cement 42.5N",    code: "CMNT-425", category: "Materials", branch: "Branch North", qty: 112, threshold: 50 },
  { item: "Paint 20L",       code: "PNT-20L",  category: "Finishing", branch: "Branch West",  qty: 3,  threshold: 20 },
  { item: "Paint 20L",       code: "PNT-20L",  category: "Finishing", branch: "Branch North", qty: 45,  threshold: 20 },
  { item: "Steel Rods 12mm", code: "STEL-12",  category: "Structural", branch: "Branch North", qty: 12, threshold: 30 },
  { item: "Steel Rods 12mm", code: "STEL-12",  category: "Structural", branch: "Branch East",  qty: 85,  threshold: 30 },
  { item: "PVC Pipe 4\"",     code: "PVC-04",   category: "Plumbing",   branch: "Branch East",  qty: 5,  threshold: 25 },
  { item: "PVC Pipe 4\"",     code: "PVC-04",   category: "Plumbing",   branch: "Branch South", qty: 40,  threshold: 25 },
]

const BRANCH_OPTIONS = ["All Branches", "Branch North", "Branch East", "Branch South", "Branch West"]

export default function AllStockPage() {
  const [selectedBranch, setSelectedBranch] = useState("All Branches")
  const [showOnlyViolations, setShowOnlyViolations] = useState(false)

  // Filter computation system matching branch allocation parameters
  const filteredStock = MOCK_STOCK_LEDGER.filter(entry => {
    const branchMatches = selectedBranch === "All Branches" || entry.branch === selectedBranch
    const violationMatches = !showOnlyViolations || entry.qty < entry.threshold
    return branchMatches && violationMatches
  })

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      
      <PageHeader
        title="All Branches — Stock Levels"
        subtitle="System-wide corporate inventory quantities, stock distributions, and threshold alert cross-referencing."
      />

      {/* ── Filter Controls Panel ── */}
      <div style={{ background: "#fff", border: "1px solid #dde0d4", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          {/* Branch Filter Dropdown */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, textTransform: "uppercase", color: "#6b7260" }}>Node Selection:</span>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              style={{
                fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#1a1f0e",
                padding: "6px 12px", border: "1px solid #dde0d4", background: "#f7f8f4", outline: "none"
              }}
            >
              {BRANCH_OPTIONS.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

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
          Tracked Variants: {filteredStock.length}
        </span>
      </div>

      {/* ── Global Matrix Inventory Ledger ── */}
      <div style={{ background: "#fff", border: "1px solid #dde0d4", padding: "24px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          
          {/* Table Structural Header Line */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "100px 1.5fr 1fr 1.2fr 100px 120px",
            padding: "8px 0",
            borderBottom: "1px solid #e8ebe3",
            gap: 12,
          }}>
            {["Item Code", "Item Nomenclature", "Category Group", "Location Branch", "Balance", "Alert Context"].map(h => (
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
              const isLow = s.qty < s.threshold
              return (
                <div
                  key={s.item + s.branch + idx}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "100px 1.5fr 1fr 1.2fr 100px 120px",
                    padding: "12px 0",
                    borderBottom: idx < filteredStock.length - 1 ? "1px solid #f0f1ec" : "none",
                    gap: 12,
                    alignItems: "center",
                  }}
                >
                  {/* System Code Tag */}
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#6b7260" }}>
                    {s.code}
                  </span>

                  {/* Nomenclature String Descriptor */}
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 500, color: "#1a1f0e" }}>
                    {s.item}
                  </span>

                  {/* Category Target */}
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#6b7260" }}>
                    {s.category}
                  </span>

                  {/* Target Branch Assignment Node */}
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#1a1f0e" }}>
                    {s.branch}
                  </span>

                  {/* Live Balance Quantification */}
                  <span style={{ 
                    fontFamily: "'Inter', sans-serif", 
                    fontSize: 13, 
                    fontWeight: 600, 
                    color: isLow ? "#dc2626" : "#1a1f0e" 
                  }}>
                    {s.qty} units
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
                        <IconAlert /> MIN {s.threshold}
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
                        SAFE (MIN {s.threshold})
                      </span>
                    )}
                  </div>

                </div>
              )
            })
          )}

        </div>
      </div>

    </div>
  )
}