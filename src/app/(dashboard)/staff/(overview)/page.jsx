"use client"
import { useState, useEffect } from "react"
import { useAuthContext } from "@/lib/context/AuthContext"
import PageHeader from "@/components/ui/PageHeader"
import Link from "next/link"
import { api } from "@/lib/api/client"
import toast from "react-hot-toast"

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

// ─── Status badges ─────────────────────────────────────────────────────────────
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

  const [stock, setStock]         = useState([])
  const [transfers, setTransfers] = useState([])
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    async function fetchDashboard() {
      try {
        setLoading(true)
        // Both requests in parallel
        const [stockRes, transferRes] = await Promise.all([
          api.get("/stock?size=200"),
          api.get("/transfers/my?size=5"),
        ])
        if (stockRes?.success)    setStock(stockRes.data.content || [])
        if (transferRes?.success) setTransfers(transferRes.data.content || [])
      } catch (err) {
        toast.error(err.message || "Failed to load dashboard")
      } finally {
        setLoading(false)
      }
    }
    fetchDashboard()
  }, [])

  // ── Derived stats ────────────────────────────────────────────────────────────
  const totalItems      = stock.length
  const lowStockItems   = stock.filter(s => s.isLowStock || s.quantityOnHand <= s.minimumThreshold)
  const lowStockCount   = lowStockItems.length
  const pendingCount    = transfers.filter(t => t.status === "PENDING").length
  // Show only the 3 most recent for the dashboard table
  const recentTransfers = transfers.slice(0, 5)

  // ── Loading skeleton ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <PageHeader
          title={`Welcome, ${user?.name || "Branch Staff"}`}
          subtitle="Here is your branch stock overview."
        />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "64px 0" }}>
          <div style={{
            width: 24, height: 24,
            border: "2px solid #dde0d4", borderTopColor: "#3d7a2b",
            borderRadius: "50%", animation: "sb-spin 0.7s linear infinite",
          }} />
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#6b7260", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            Loading dashboard...
          </span>
          <style>{`@keyframes sb-spin { to { transform: rotate(360deg) } }`}</style>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      <PageHeader
        title={`Welcome, ${user?.name || "Branch Staff"}`}
        subtitle="Here is your branch stock overview."
      />

      {/* ── Stat Cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
        <StatCard
          icon={<IconPackage />} iconBg="#f0f7ed" iconColor="#3d7a2b"
          label="Total Items" value={totalItems} valueColor="#1a1f0e"
        />
        <StatCard
          icon={<IconAlert />} iconBg="#fef2f2" iconColor="#dc2626"
          label="Low Stock Alerts" value={lowStockCount} valueColor="#dc2626"
        />
        <StatCard
          icon={<IconClock />} iconBg="#fefce8" iconColor="#ca8a04"
          label="My Pending Transfers" value={pendingCount} valueColor="#ca8a04"
        />
      </div>

      {/* ── Low Stock Banner ── */}
      {lowStockItems.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: "#dc2626" }}><IconAlert /></span>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 600, color: "#1a1f0e" }}>
              Low Stock Items
            </span>
          </div>
          <div style={{ background: "#fff", border: "1px solid #dde0d4" }}>
            {lowStockItems.slice(0, 5).map((item, idx) => (
              <div key={item.id} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "12px 20px",
                borderBottom: idx < Math.min(lowStockItems.length, 5) - 1 ? "1px solid #f0f1ec" : "none",
              }}>
                <div>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 500, color: "#1a1f0e" }}>
                    {item.itemName}
                  </p>
                  <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#9ca3af", marginTop: 2 }}>
                    Min threshold: {item.minimumThreshold}
                  </p>
                </div>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 700, color: "#dc2626" }}>
                  {item.quantityOnHand} left
                </span>
              </div>
            ))}
          </div>
          {lowStockItems.length > 5 && (
            <Link href="/dashboard/staff/stock" style={{
              fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#dc2626",
              textDecoration: "none", fontWeight: 500, alignSelf: "flex-start",
            }}>
              +{lowStockItems.length - 5} more low stock items →
            </Link>
          )}
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
          <Link href="/dashboard/staff/transfers" style={{
            fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#3d7a2b",
            textDecoration: "none", fontWeight: 500,
          }}>
            View all →
          </Link>
        </div>

        <div style={{ background: "#fff", border: "1px solid #dde0d4", overflow: "hidden" }}>
          {recentTransfers.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 0", fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#9ca3af" }}>
              No transfer requests yet.
            </div>
          ) : (
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
                {recentTransfers.map((t, idx) => (
                  <tr key={t.id} style={{ borderBottom: idx < recentTransfers.length - 1 ? "1px solid #f0f1ec" : "none" }}>
                    {/* Use id since no referenceNumber field in TransferResponse */}
                    <td style={{ padding: "12px 20px", fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#6b7260" }}>
                      #{t.id}
                    </td>
                    <td style={{ padding: "12px 20px", fontFamily: "'Inter', sans-serif", fontWeight: 500, color: "#1a1f0e" }}>
                      {t.itemName}
                    </td>
                    <td style={{ padding: "12px 20px", fontFamily: "'Inter', sans-serif", color: "#6b7260" }}>
                      {t.quantity}
                    </td>
                    <td style={{ padding: "12px 20px", fontFamily: "'Inter', sans-serif", color: "#6b7260" }}>
                      {t.destinationBranchName}
                    </td>
                    <td style={{ padding: "12px 20px" }}>
                      <span style={{
                        ...(STATUS_STYLE[t.status] ?? { background: "#f3f4f6", color: "#6b7280" }),
                        fontFamily: "'DM Mono', monospace", fontSize: 10,
                        fontWeight: 600, padding: "2px 8px",
                        borderRadius: 999, display: "inline-block",
                      }}>
                        {STATUS_LABEL[t.status] ?? t.status}
                      </span>
                    </td>
                    {/* requestedAt is the correct field from TransferResponse */}
                    <td style={{ padding: "12px 20px", fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#9ca3af" }}>
                      {t.requestedAt ? new Date(t.requestedAt).toLocaleDateString() : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
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