"use client"

import { useState } from "react"
import PageHeader from "@/components/ui/PageHeader"
import toast from "react-hot-toast"

// ── Icons ─────────────────────────────────────────────────────────────────────
const IconExport = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v4M7 10l5 5 5-5M12 15V3"/>
  </svg>
)

export default function HOReportsPage() {
  const [reportType, setReportType] = useState("STOCK_LEVELS")
  const [selectedBranch, setSelectedBranch] = useState("All Branches")
  const [startDate, setStartDate] = useState("2026-05-01")
  const [endDate, setEndDate] = useState("2026-05-21")
  const [isGenerating, setIsGenerating] = useState(false)

  // Simulation execution handler fulfilling CSV file generation parameters
  const handleExportCSV = () => {
    setIsGenerating(true)
    
    setTimeout(() => {
      // Mock CSV data structured to mirror system reporting attributes
      const headers = reportType === "TRANSFER_HISTORY" 
        ? "Transfer ID,Source Branch,Destination Branch,Item Details,Quantity,Timestamp,Status\n"
        : "Item Code,Item Nomenclature,Classification,Current OnHand Qty,Alert Status\n"
      
      const mockRow = reportType === "TRANSFER_HISTORY"
        ? "TR-0041,Branch North,Head Office,Cement 42.5N,120,2026-05-21,MANAGER_APPROVED\n"
        : "ITM-001,Cement 42.5N,Materials,8,CRITICAL_LOW\n"
        
      const csvBlobContent = headers + mockRow
      const blob = new Blob([csvBlobContent], { type: "text/csv;charset=utf-8;" })
      const link = document.createElement("a")
      
      link.href = URL.createObjectURL(blob)
      link.setAttribute("download", `HO_REPORT_${reportType}_${selectedBranch.replace(/\s+/g, '_')}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      setIsGenerating(false)
      toast.success(`${reportType.replace(/_/g, ' ')} data generated. CSV download initiated.`)
    }, 750)
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      
      <PageHeader
        title="System Reports"
        subtitle="Generate system-wide audit reports, track inter-branch transfer logs, and analyze localized low stock warnings."
      />

      {/* ── Side-by-Side Settings and Preview Layout ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 24, alignItems: "start" }}>
        
        {/* Left Side: Filter Parameters Control Panel */}
        <div style={{ background: "#fff", border: "1px solid #dde0d4", padding: "24px", display: "flex", flexDirection: "column", gap: 20 }}>
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.15em", color: "#6b7260", margin: "0" }}>
            Report Configuration Scope
          </p>

          {/* Report Classification Filter */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 500, color: "#1a1f0e" }}>Report Scope Target</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, padding: "8px 12px", border: "1px solid #dde0d4", background: "#f7f8f4", outline: "none" }}
            >
              <option value="STOCK_LEVELS">Stock Level Audit Matrix</option>
              <option value="TRANSFER_HISTORY">Inter-Branch Transfer Ledger Logs</option>
              <option value="CONSOLIDATED_LOW_STOCK">Consolidated Global Low Stock Violations</option>
            </select>
          </div>

          {/* Geographic Node Scope Filter */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 500, color: "#1a1f0e" }}>Branch Location Scope</label>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              disabled={reportType === "CONSOLIDATED_LOW_STOCK"}
              style={{ 
                fontFamily: "'Inter', sans-serif", fontSize: 13, padding: "8px 12px", border: "1px solid #dde0d4", 
                background: reportType === "CONSOLIDATED_LOW_STOCK" ? "#eaeaea" : "#f7f8f4", 
                color: reportType === "CONSOLIDATED_LOW_STOCK" ? "#8c8c8c" : "#1a1f0e", outline: "none" 
              }}
            >
              <option value="All Branches">All Network Branches Combined</option>
              <option value="Branch North">Branch North Hub</option>
              <option value="Branch East">Branch East Hub</option>
              <option value="Branch South">Branch South Hub</option>
              <option value="Branch West">Branch West Hub</option>
            </select>
          </div>

          {/* Date Boundaries Selection Matrix */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "#6b7260" }}>Start Date</label>
              <input 
                type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, padding: "6px 10px", border: "1px solid #dde0d4", background: "#f7f8f4" }}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "#6b7260" }}>End Date</label>
              <input 
                type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, padding: "6px 10px", border: "1px solid #dde0d4", background: "#f7f8f4" }}
              />
            </div>
          </div>

          {/* Export Generation Execute Trigger Key */}
          <button
            onClick={handleExportCSV}
            disabled={isGenerating}
            style={{
              marginTop: 10, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              fontFamily: "'DM Mono', monospace", fontSize: 12, fontWeight: 600, textTransform: "uppercase",
              background: isGenerating ? "#6b7260" : "#1a1f0e", color: "#fff", padding: "12px",
              border: "1px solid #1a1f0e", cursor: isGenerating ? "not-allowed" : "pointer", transition: "background 0.15s"
            }}
            onMouseEnter={(e) => { if(!isGenerating) e.currentTarget.style.background = "#3d7a2b" }}
            onMouseLeave={(e) => { if(!isGenerating) e.currentTarget.style.background = "#1a1f0e" }}
          >
            <IconExport />
            {isGenerating ? "Compiling Structure..." : "Export Structural CSV"}
          </button>
        </div>

        {/* Right Side: Live Compilation Manifest Preview Info Box */}
        <div style={{ background: "#f7f8f4", border: "1px solid #dde0d4", padding: "24px", minHeight: "280px" }}>
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.15em", color: "#3d7a2b", margin: "0 0 16px" }}>
            Compilation Parameters Preview Manifest
          </p>
          
          <div style={{ display: "flex", flexDirection: "column", gap: 14, fontFamily: "'Inter', sans-serif", fontSize: 12 }}>
            <div style={{ borderBottom: "1px solid #e8ebe3", paddingBottom: 8 }}>
              <span style={{ color: "#6b7260", display: "block", fontSize: 11, marginBottom: 2 }}>Output Filename Construct:</span>
              <span style={{ fontFamily: "'DM Mono', monospace", fontWeight: 600, color: "#1a1f0e", fontSize: 11 }}>
                HO_REPORT_{reportType}_{selectedBranch.replace(/\s+/g, '_')}.csv
              </span>
            </div>
            
            <div style={{ borderBottom: "1px solid #e8ebe3", paddingBottom: 8 }}>
              <span style={{ color: "#6b7260", display: "block", fontSize: 11, marginBottom: 2 }}>Data Range Boundaries:</span>
              <span style={{ fontFamily: "'DM Mono', monospace", color: "#1a1f0e" }}>{startDate} ➔ {endDate}</span>
            </div>
            
            <div>
              <span style={{ color: "#6b7260", display: "block", fontSize: 11, marginBottom: 4 }}>Target Rules Processing Context:</span>
              <span style={{ color: "#1a1f0e", fontWeight: 500, lineHeight: "1.4" }}>
                {reportType === "STOCK_LEVELS" && "Compiles on-hand matrix snapshots from the designated branch nodes into localized rows."}
                {reportType === "TRANSFER_HISTORY" && "Extracts the timestamp records of multi-branch workflows and system approval metrics."}
                {reportType === "CONSOLIDATED_LOW_STOCK" && "Bypasses structural filtering to aggregate items beneath safety thresholds across all global nodes."}
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}