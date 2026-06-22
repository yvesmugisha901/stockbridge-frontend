"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { getTransfers } from "@/lib/api/financeApi"

function TrendUpIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
}
function ClockIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
}
function CheckIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
}
function ArrowRightIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
}

const STATUS_STYLE = {
  COMPLETED:   { color: "#3d7a2b", bg: "#f0f7ed" },
  IN_TRANSIT:  { color: "#1d6fa8", bg: "#eaf3fb" },
  HO_APPROVED: { color: "#b45309", bg: "#fef3e2" },
  RECEIVED:    { color: "#6b7260", bg: "#f3f4f0" },
}

function unwrapPage(raw) {
  if (raw?.data?.content && Array.isArray(raw.data.content)) return raw.data.content
  if (raw?.data && Array.isArray(raw.data)) return raw.data
  if (raw?.content && Array.isArray(raw.content)) return raw.content
  if (Array.isArray(raw)) return raw
  return []
}

function currentMonthRange() {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, "0")
  const lastDay = new Date(y, now.getMonth() + 1, 0).getDate()
  return {
    fromDate: `${y}-${m}-01`,
    toDate:   `${y}-${m}-${String(lastDay).padStart(2, "0")}`,
  }
}

/**
 * Cost model:
 *   transferValue  = monetary value of the goods being transferred (always set)
 *   costAmount     = additional logistics costs e.g. labour, transport, insurance (optional)
 *   totalCost      = transferValue + costAmount (if costAmount is absent, totalCost = transferValue)
 */
function getTransferValue(r) {
  return r.transferValue != null ? Number(r.transferValue) : 0
}
function getCostAmount(r) {
  // costAmount is optional — 0 when not recorded
  return r.costAmount != null ? Number(r.costAmount) : 0
}
function getTotalCost(r) {
  return getTransferValue(r) + getCostAmount(r)
}
function hasCostRecorded(r) {
  return r.costAmount != null
}

export default function AccountantDashboard() {
  const [transfers, setTransfers] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState(null)

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        setError(null)
        const { fromDate, toDate } = currentMonthRange()
        const trfRaw = await getTransfers({ fromDate, toDate })
        setTransfers(unwrapPage(trfRaw))
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const safe = Array.isArray(transfers) ? transfers : []

  const completedCount   = safe.filter(t => t.status === "COMPLETED").length
  // "Pending" only means transferValue itself is missing — costAmount is optional
  const pendingCount     = safe.filter(t => t.transferValue == null).length
  // Grand total sums transferValue + costAmount (0 when no extra cost recorded)
  const grandTotal       = safe.reduce((sum, t) => sum + getTotalCost(t), 0)
  const grandTotalRWF    = grandTotal > 0 ? `RWF ${grandTotal.toLocaleString()}` : "—"

  const recent = safe.slice(0, 4)

  const STATS = [
    {
      label: "Approved Transfers",
      value: loading ? "…" : completedCount,
      sub:   "Completed this period",
      icon:  CheckIcon,
      color: "#3d7a2b",
      bg:    "#f0f7ed",
    },
    {
      label: "Total Cost This Month",
      value: loading ? "…" : grandTotalRWF,
      sub:   "Transfer value + logistics costs",
      icon:  TrendUpIcon,
      color: "#1d6fa8",
      bg:    "#eaf3fb",
    },
    {
      label: "Missing Transfer Value",
      value: loading ? "…" : pendingCount,
      sub:   "Transfers with no value set",
      icon:  ClockIcon,
      color: "#b45309",
      bg:    "#fef3e2",
    },
  ]

  return (
    <div style={{ maxWidth: 1000 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 24, fontWeight: 400, color: "#1a1f0e", margin: "0 0 4px" }}>
          Accountant Dashboard
        </h1>
        <p style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: 13, color: "#6b7260", margin: 0 }}>
          Track approved transfers and record logistics costs.
        </p>
      </div>

      {error && (
        <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 7, padding: "10px 16px", marginBottom: 20, fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#b91c1c" }}>
          Failed to load data: {error}
        </div>
      )}

      {/* Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 32 }}>
        {STATS.map(({ label, value, sub, icon: Icon, color, bg }) => (
          <div key={label} style={{ background: "#fff", border: "1px solid #e8ebe3", borderRadius: 10, padding: "18px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <span style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: 12, color: "#6b7260" }}>{label}</span>
              <span style={{ width: 28, height: 28, borderRadius: 6, background: bg, display: "flex", alignItems: "center", justifyContent: "center", color }}>
                <Icon />
              </span>
            </div>
            <p style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 22, color: "#1a1f0e", margin: "0 0 4px" }}>{value}</p>
            <p style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: 11, color: "#9ca3af", margin: 0 }}>{sub}</p>
          </div>
        ))}
      </div>

      {/* Recent Transfers Table */}
      <div style={{ background: "#fff", border: "1px solid #e8ebe3", borderRadius: 10 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid #e8ebe3" }}>
          <span style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: 13, fontWeight: 500, color: "#1a1f0e" }}>Recent Transfers</span>
          <Link href="/accountant/transfers" style={{ display: "flex", alignItems: "center", gap: 5, fontFamily: "'Inter', system-ui, sans-serif", fontSize: 12, color: "#3d7a2b", textDecoration: "none" }}>
            View all <ArrowRightIcon />
          </Link>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f9faf7" }}>
              {["Transfer ID", "Route", "Item", "Qty", "Status", "Transfer Value", "Cost (Logistics)", "Total Cost"].map(h => (
                <th key={h} style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "#9ca3af", padding: "10px 16px", textAlign: "left", fontWeight: 400, borderBottom: "1px solid #e8ebe3" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} style={{ padding: "32px 16px", textAlign: "center", color: "#9ca3af", fontFamily: "'Inter', sans-serif", fontSize: 13 }}>Loading…</td></tr>
            ) : recent.length === 0 ? (
              <tr><td colSpan={8} style={{ padding: "32px 16px", textAlign: "center", color: "#9ca3af", fontFamily: "'Inter', sans-serif", fontSize: 13 }}>No transfers found.</td></tr>
            ) : recent.map((r, i) => {
              const s            = STATUS_STYLE[r.status] || { color: "#6b7260", bg: "#f3f4f0" }
              const tv           = getTransferValue(r)
              const ca           = getCostAmount(r)
              const total        = getTotalCost(r)  // tv + ca (ca=0 if not recorded)
              const costRecorded = hasCostRecorded(r)

              return (
                <tr key={r.transferId} style={{ borderBottom: i < recent.length - 1 ? "1px solid #f3f4f0" : "none" }}>
                  {/* Transfer ID */}
                  <td style={{ padding: "12px 16px", fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#3d7a2b" }}>
                    #{r.transferId}
                  </td>
                  {/* Route */}
                  <td style={{ padding: "12px 16px", fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#4b5563" }}>
                    {r.sourceBranchName} → {r.destinationBranchName}
                  </td>
                  {/* Item */}
                  <td style={{ padding: "12px 16px", fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#1a1f0e" }}>
                    {r.itemName}
                  </td>
                  {/* Qty */}
                  <td style={{ padding: "12px 16px", fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#4b5563" }}>
                    {r.quantity}
                  </td>
                  {/* Status */}
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: s.color, background: s.bg, padding: "3px 8px", borderRadius: 4 }}>
                      {r.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  {/* Transfer Value — value of goods */}
                  <td style={{ padding: "12px 16px", fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#1a1f0e" }}>
                    {tv > 0 ? `RWF ${tv.toLocaleString()}` : "—"}
                  </td>
                  {/* Cost Amount — optional extra: labour / transport / insurance */}
                  <td style={{ padding: "12px 16px", fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#6b7260" }}>
                    {costRecorded ? `RWF ${ca.toLocaleString()}` : <span style={{ color: "#9ca3af" }}>—</span>}
                  </td>
                  {/* Total Cost = transferValue + costAmount (costAmount treated as 0 if absent) */}
                  <td style={{ padding: "12px 16px", fontFamily: "'DM Mono', monospace", fontSize: 12, fontWeight: 600, color: "#1a1f0e" }}>
                    {tv > 0 ? `RWF ${total.toLocaleString()}` : "—"}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {/* Legend */}
        <div style={{ padding: "10px 16px", borderTop: "1px solid #f3f4f0", fontFamily: "'Inter', sans-serif", fontSize: 11, color: "#9ca3af" }}>
          Total Cost = Transfer Value + Logistics Cost (labour, transport, insurance). Logistics cost is optional.
        </div>
      </div>
    </div>
  )
}
