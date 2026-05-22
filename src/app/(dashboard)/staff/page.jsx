"use client"
import { useAuthContext } from "@/lib/context/AuthContext"
import PageHeader from "@/components/ui/PageHeader"

// ─── Icons ────────────────────────────────────────────────────────────────────
const IconPackage = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
    <line x1="12" y1="22.08" x2="12" y2="12"/>
  </svg>
)
const IconAlert = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
)
const IconClock = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
)
const IconTransfer = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="17 1 21 5 17 9"/>
    <path d="M3 11V9a4 4 0 0 1 4-4h14"/>
    <polyline points="7 23 3 19 7 15"/>
    <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
  </svg>
)

// ─── Mock Data ────────────────────────────────────────────────────────────────
const mockStats = { totalItems: 142, lowStockAlerts: 5, pendingTransfers: 3 }

const mockLowStock = [
  { id: 1, name: "A4 Paper Ream",      quantity: 4, threshold: 10, unit: "Ream" },
  { id: 2, name: "Printer Ink – Black", quantity: 1, threshold: 5,  unit: "Cartridge" },
  { id: 3, name: "Staples Box",         quantity: 2, threshold: 5,  unit: "Box" },
]

const mockTransfers = [
  { id: "TRF-001", item: "A4 Paper Ream",      qty: 20, destination: "Branch B",   status: "PENDING",          date: "2026-05-20" },
  { id: "TRF-002", item: "Ballpoint Pens",      qty: 50, destination: "Head Office", status: "MANAGER_APPROVED", date: "2026-05-19" },
  { id: "TRF-003", item: "Printer Ink – Black", qty: 10, destination: "Branch C",   status: "COMPLETED",        date: "2026-05-17" },
]

const STATUS_STYLE = {
  PENDING:          { background: "#fef9c3", color: "#a16207" },
  MANAGER_APPROVED: { background: "#dbeafe", color: "#1d4ed8" },
  HO_APPROVED:      { background: "#e0e7ff", color: "#4338ca" },
  IN_TRANSIT:       { background: "#f3e8ff", color: "#7e22ce" },
  COMPLETED:        { background: "#dcfce7", color: "#15803d" },
  REJECTED:         { background: "#fee2e2", color: "#dc2626" },
  CANCELLED:        { background: "#f3f4f6", color: "#6b7280" },
}

const STATUS_LABEL = {
  PENDING: "Pending", MANAGER_APPROVED: "Manager Approved",
  HO_APPROVED: "HO Approved", IN_TRANSIT: "In Transit",
  COMPLETED: "Completed", REJECTED: "Rejected", CANCELLED: "Cancelled",
}

export default function StaffDashboard() {
  const { user } = useAuthContext()

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      <PageHeader
        title={`Welcome, ${user?.name || "Branch Staff"}`}
        subtitle="Here is your branch stock overview."
      />

      {/* ── Stat Cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
        <StatCard icon={<IconPackage />} iconBg="#f0f7ed" iconColor="#3d7a2b"
          label="Total Items" value={mockStats.totalItems} valueColor="#1a1f0e" />
        <StatCard icon={<IconAlert />}   iconBg="#fef2f2" iconColor="#dc2626"
          label="Low Stock Alerts" value={mockStats.lowStockAlerts} valueColor="#dc2626" />
        <StatCard icon={<IconClock />}   iconBg="#fefce8" iconColor="#ca8a04"
          label="My Pending Transfers" value={mockStats.pendingTransfers} valueColor="#ca8a04" />
      </div>

      {/* ── Low Stock Items ── */}
      {mockLowStock.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: "#dc2626" }}><IconAlert /></span>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 600, color: "#1a1f0e" }}>
              Low Stock Items
            </span>
          </div>
          <div style={{ background: "#fff", border: "1px solid #dde0d4" }}>
            {mockLowStock.map((item, idx) => (
              <div key={item.id} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "12px 20px",
                borderBottom: idx < mockLowStock.length - 1 ? "1px solid #f0f1ec" : "none",
              }}>
                <div>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 500, color: "#1a1f0e" }}>
                    {item.name}
                  </p>
                  <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#9ca3af", marginTop: 2 }}>
                    Min threshold: {item.threshold} {item.unit}
                  </p>
                </div>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 700, color: "#dc2626" }}>
                  {item.quantity} left
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Recent Transfers ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: "#6b7260" }}><IconTransfer /></span>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 600, color: "#1a1f0e" }}>
              My Recent Transfers
            </span>
          </div>
          <a href="/dashboard/staff/transfers" style={{
            fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#3d7a2b",
            textDecoration: "none", fontWeight: 500,
          }}>
            View all →
          </a>
        </div>

        <div style={{ background: "#fff", border: "1px solid #dde0d4", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#f7f8f4", borderBottom: "1px solid #e8ebe3" }}>
                {["Request ID", "Item", "Qty", "Destination", "Status", "Date"].map(h => (
                  <th key={h} style={{
                    textAlign: "left", padding: "10px 20px",
                    fontFamily: "'DM Mono', monospace", fontSize: 10,
                    textTransform: "uppercase", letterSpacing: "0.1em", color: "#9ca3af",
                    fontWeight: 500,
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mockTransfers.map((t, idx) => (
                <tr key={t.id} style={{ borderBottom: idx < mockTransfers.length - 1 ? "1px solid #f0f1ec" : "none" }}>
                  <td style={{ padding: "12px 20px", fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#6b7260" }}>{t.id}</td>
                  <td style={{ padding: "12px 20px", fontFamily: "'Inter', sans-serif", fontWeight: 500, color: "#1a1f0e" }}>{t.item}</td>
                  <td style={{ padding: "12px 20px", fontFamily: "'Inter', sans-serif", color: "#6b7260" }}>{t.qty}</td>
                  <td style={{ padding: "12px 20px", fontFamily: "'Inter', sans-serif", color: "#6b7260" }}>{t.destination}</td>
                  <td style={{ padding: "12px 20px" }}>
                    <span style={{
                      ...STATUS_STYLE[t.status],
                      fontFamily: "'DM Mono', monospace", fontSize: 10,
                      fontWeight: 600, padding: "2px 8px",
                      borderRadius: 999, display: "inline-block",
                    }}>
                      {STATUS_LABEL[t.status]}
                    </span>
                  </td>
                  <td style={{ padding: "12px 20px", fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#9ca3af" }}>{t.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}

function StatCard({ icon, iconBg, iconColor, label, value, valueColor }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #dde0d4", padding: 20, display: "flex", alignItems: "center", gap: 16 }}>
      <div style={{ background: iconBg, color: iconColor, padding: 12, borderRadius: 8, display: "flex" }}>
        {icon}
      </div>
      <div>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#6b7260", marginBottom: 4 }}>{label}</p>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 24, fontWeight: 700, color: valueColor }}>{value}</p>
      </div>
    </div>
  )
}