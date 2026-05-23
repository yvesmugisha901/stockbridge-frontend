"use client"
import Link from "next/link"

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

const STATS = [
  {
    label: "Approved Transfers",
    value: "24",
    sub: "This month",
    icon: CheckIcon,
    color: "#3d7a2b",
    bg: "#f0f7ed",
  },
  {
    label: "Total Cost This Month",
    value: "RWF 4,820,000",
    sub: "Across all branches",
    icon: TrendUpIcon,
    color: "#1d6fa8",
    bg: "#eaf3fb",
  },
  {
    label: "Pending Cost Entry",
    value: "7",
    sub: "Transfers need costing",
    icon: ClockIcon,
    color: "#b45309",
    bg: "#fef3e2",
  },
]

const RECENT = [
  { id: "TRF-0091", from: "Branch A", to: "Branch C", item: "Office Chairs", qty: 10, status: "COMPLETED",     cost: "RWF 320,000" },
  { id: "TRF-0089", from: "Branch B", to: "Branch A", item: "Laptops",       qty: 3,  status: "IN_TRANSIT",    cost: "—"           },
  { id: "TRF-0085", from: "HQ",       to: "Branch D", item: "Stationery",    qty: 50, status: "HO_APPROVED",   cost: "—"           },
  { id: "TRF-0082", from: "Branch C", to: "Branch B", item: "Desks",         qty: 5,  status: "COMPLETED",     cost: "RWF 750,000" },
]

const STATUS_STYLE = {
  COMPLETED:   { color: "#3d7a2b", bg: "#f0f7ed" },
  IN_TRANSIT:  { color: "#1d6fa8", bg: "#eaf3fb" },
  HO_APPROVED: { color: "#b45309", bg: "#fef3e2" },
}

export default function AccountantDashboard() {
  return (
    <div style={{ maxWidth: 900 }}>

      {/* Page header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{
          fontFamily: "'DM Serif Display', Georgia, serif",
          fontSize: 24,
          fontWeight: 400,
          color: "#1a1f0e",
          margin: "0 0 4px",
        }}>
          Accountant Dashboard
        </h1>
        <p style={{
          fontFamily: "'Inter', system-ui, sans-serif",
          fontSize: 13,
          color: "#6b7260",
          margin: 0,
        }}>
          Track approved transfers and record costs.
        </p>
      </div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 32 }}>
        {STATS.map(({ label, value, sub, icon: Icon, color, bg }) => (
          <div key={label} style={{
            background: "#fff",
            border: "1px solid #e8ebe3",
            borderRadius: 10,
            padding: "18px 20px",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <span style={{
                fontFamily: "'Inter', system-ui, sans-serif",
                fontSize: 12,
                color: "#6b7260",
              }}>
                {label}
              </span>
              <span style={{
                width: 28, height: 28,
                borderRadius: 6,
                background: bg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color,
              }}>
                <Icon />
              </span>
            </div>
            <p style={{
              fontFamily: "'DM Serif Display', Georgia, serif",
              fontSize: 22,
              color: "#1a1f0e",
              margin: "0 0 4px",
            }}>
              {value}
            </p>
            <p style={{
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: 11,
              color: "#9ca3af",
              margin: 0,
            }}>
              {sub}
            </p>
          </div>
        ))}
      </div>

      {/* Recent transfers */}
      <div style={{
        background: "#fff",
        border: "1px solid #e8ebe3",
        borderRadius: 10,
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 20px",
          borderBottom: "1px solid #e8ebe3",
        }}>
          <span style={{
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: 13,
            fontWeight: 500,
            color: "#1a1f0e",
          }}>
            Recent Transfers
          </span>
          <Link href="/accountant/transfers" style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: 12,
            color: "#3d7a2b",
            textDecoration: "none",
          }}>
            View all <ArrowRightIcon />
          </Link>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f9faf7" }}>
              {["Transfer ID", "Route", "Item", "Qty", "Status", "Cost"].map(h => (
                <th key={h} style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 10,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: "#9ca3af",
                  padding: "10px 16px",
                  textAlign: "left",
                  fontWeight: 400,
                  borderBottom: "1px solid #e8ebe3",
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {RECENT.map((r, i) => {
              const s = STATUS_STYLE[r.status] || { color: "#6b7260", bg: "#f3f4f0" }
              return (
                <tr key={r.id} style={{ borderBottom: i < RECENT.length - 1 ? "1px solid #f3f4f0" : "none" }}>
                  <td style={{ padding: "12px 16px", fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#3d7a2b" }}>{r.id}</td>
                  <td style={{ padding: "12px 16px", fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#4b5563" }}>{r.from} → {r.to}</td>
                  <td style={{ padding: "12px 16px", fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#1a1f0e" }}>{r.item}</td>
                  <td style={{ padding: "12px 16px", fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#4b5563" }}>{r.qty}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{
                      fontFamily: "'DM Mono', monospace",
                      fontSize: 10,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      color: s.color,
                      background: s.bg,
                      padding: "3px 8px",
                      borderRadius: 4,
                    }}>
                      {r.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", fontFamily: "'DM Mono', monospace", fontSize: 12, color: r.cost === "—" ? "#9ca3af" : "#1a1f0e" }}>{r.cost}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}