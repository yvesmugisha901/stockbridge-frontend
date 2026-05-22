"use client"
import { useAuthContext } from "@/lib/context/AuthContext"
import PageHeader from "@/components/ui/PageHeader"

// ─── Icons ────────────────────────────────────────────────────────────────────
const IconClock = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
)
const IconCheck = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)
const IconAlert = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
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

// ─── Mock Data (replace with API calls when ready) ────────────────────────────
const mockStats = {
  pendingApprovals: 4,
  approvedThisMonth: 11,
  lowStockItems: 3,
}

const mockPendingApprovals = [
  { id: "TRF-008", item: "A4 Paper Ream",       qty: 30,  destination: "Branch C",    requestedBy: "John M.",   date: "2026-05-22" },
  { id: "TRF-009", item: "Printer Ink – Black",  qty: 10,  destination: "Head Office", requestedBy: "Alice K.",  date: "2026-05-21" },
  { id: "TRF-010", item: "Ballpoint Pens",        qty: 100, destination: "Branch D",    requestedBy: "Peter N.",  date: "2026-05-20" },
]

const mockLowStock = [
  { id: 1, name: "A4 Paper Ream",       quantity: 4,  threshold: 10, unit: "Ream"       },
  { id: 2, name: "Printer Ink – Black", quantity: 1,  threshold: 5,  unit: "Cartridge"  },
  { id: 3, name: "Staples Box",         quantity: 2,  threshold: 5,  unit: "Box"        },
]

const mockRecentTransfers = [
  { id: "TRF-005", item: "A4 Paper Ream",       qty: 20, destination: "Branch B",   status: "COMPLETED",        date: "2026-05-18" },
  { id: "TRF-006", item: "Ballpoint Pens",       qty: 50, destination: "Head Office", status: "IN_TRANSIT",      date: "2026-05-19" },
  { id: "TRF-007", item: "Staples Box",          qty: 15, destination: "Branch C",   status: "MANAGER_APPROVED", date: "2026-05-20" },
]

// ─── Status styles ────────────────────────────────────────────────────────────
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

// ─── Component ────────────────────────────────────────────────────────────────
export default function ManagerDashboard() {
  const { user } = useAuthContext()

  // TODO: replace mock data with real API calls:
  // const [stats, setStats] = useState(null)
  // useEffect(() => { api.get("/approvals/pending?size=1").then(...) }, [])

  const stats           = mockStats
  const pendingApprovals = mockPendingApprovals
  const lowStock        = mockLowStock
  const recentTransfers = mockRecentTransfers

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      <PageHeader
        title={`Welcome, ${user?.name || "Manager"}`}
        subtitle="Branch overview — review pending approvals and stock alerts."
      />

      {/* ── Stat Cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
        <StatCard
          icon={<IconClock />}   iconBg="#fefce8" iconColor="#ca8a04"
          label="Pending Approvals"    value={stats.pendingApprovals}   valueColor="#ca8a04"
        />
        <StatCard
          icon={<IconCheck />}   iconBg="#f0f7ed" iconColor="#3d7a2b"
          label="Approved This Month"  value={stats.approvedThisMonth}  valueColor="#3d7a2b"
        />
        <StatCard
          icon={<IconAlert />}   iconBg="#fef2f2" iconColor="#dc2626"
          label="Low Stock Items"      value={stats.lowStockItems}      valueColor="#dc2626"
        />
      </div>

      {/* ── Pending Approvals Queue ── */}
      <section style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: "#ca8a04" }}><IconClock /></span>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 600, color: "#1a1f0e" }}>
              Pending Approvals
            </span>
          </div>
          <a href="/dashboard/manager/approvals" style={{
            fontFamily: "'Inter', sans-serif", fontSize: 12,
            color: "#3d7a2b", textDecoration: "none", fontWeight: 500,
          }}>
            View all →
          </a>
        </div>

        <div style={{ background: "#fff", border: "1px solid #dde0d4", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#f7f8f4", borderBottom: "1px solid #e8ebe3" }}>
                {["Request ID", "Item", "Qty", "Destination", "Requested By", "Date", "Action"].map(h => (
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
              {pendingApprovals.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: "40px 0", textAlign: "center", fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#9ca3af" }}>
                    No pending approvals.
                  </td>
                </tr>
              ) : pendingApprovals.map((t, idx) => (
                <tr key={t.id} style={{ borderBottom: idx < pendingApprovals.length - 1 ? "1px solid #f0f1ec" : "none" }}>
                  <td style={{ padding: "12px 20px", fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#6b7260" }}>{t.id}</td>
                  <td style={{ padding: "12px 20px", fontFamily: "'Inter', sans-serif", fontWeight: 500, color: "#1a1f0e" }}>{t.item}</td>
                  <td style={{ padding: "12px 20px", fontFamily: "'Inter', sans-serif", color: "#6b7260" }}>{t.qty}</td>
                  <td style={{ padding: "12px 20px", fontFamily: "'Inter', sans-serif", color: "#6b7260" }}>{t.destination}</td>
                  <td style={{ padding: "12px 20px", fontFamily: "'Inter', sans-serif", color: "#6b7260" }}>{t.requestedBy}</td>
                  <td style={{ padding: "12px 20px", fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#9ca3af" }}>{t.date}</td>
                  <td style={{ padding: "12px 20px" }}>
                    <a href="/dashboard/manager/approvals" style={{
                      fontFamily: "'Inter', sans-serif", fontSize: 12,
                      color: "#3d7a2b", fontWeight: 500, textDecoration: "none",
                    }}>
                      Review →
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Low Stock Alerts ── */}
      {lowStock.length > 0 && (
        <section style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: "#dc2626" }}><IconAlert /></span>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 600, color: "#1a1f0e" }}>
              Low Stock Items
            </span>
          </div>
          <div style={{ background: "#fff", border: "1px solid #dde0d4" }}>
            {lowStock.map((item, idx) => (
              <div key={item.id} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "12px 20px",
                borderBottom: idx < lowStock.length - 1 ? "1px solid #f0f1ec" : "none",
              }}>
                <div>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 500, color: "#1a1f0e", margin: 0 }}>
                    {item.name}
                  </p>
                  <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#9ca3af", marginTop: 2, marginBottom: 0 }}>
                    Min threshold: {item.threshold} {item.unit}
                  </p>
                </div>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 700, color: "#dc2626" }}>
                  {item.quantity} left
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Recent Branch Transfers ── */}
      <section style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: "#6b7260" }}><IconTransfer /></span>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 600, color: "#1a1f0e" }}>
              Recent Branch Transfers
            </span>
          </div>
          <a href="/dashboard/manager/approvals" style={{
            fontFamily: "'Inter', sans-serif", fontSize: 12,
            color: "#3d7a2b", textDecoration: "none", fontWeight: 500,
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
                    textTransform: "uppercase", letterSpacing: "0.1em",
                    color: "#9ca3af", fontWeight: 500,
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentTransfers.map((t, idx) => (
                <tr key={t.id} style={{ borderBottom: idx < recentTransfers.length - 1 ? "1px solid #f0f1ec" : "none" }}>
                  <td style={{ padding: "12px 20px", fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#6b7260" }}>{t.id}</td>
                  <td style={{ padding: "12px 20px", fontFamily: "'Inter', sans-serif", fontWeight: 500, color: "#1a1f0e" }}>{t.item}</td>
                  <td style={{ padding: "12px 20px", fontFamily: "'Inter', sans-serif", color: "#6b7260" }}>{t.qty}</td>
                  <td style={{ padding: "12px 20px", fontFamily: "'Inter', sans-serif", color: "#6b7260" }}>{t.destination}</td>
                  <td style={{ padding: "12px 20px" }}>
                    <span style={{
                      ...(STATUS_STYLE[t.status] ?? { background: "#f3f4f6", color: "#6b7280" }),
                      fontFamily: "'DM Mono', monospace", fontSize: 10,
                      fontWeight: 600, padding: "2px 8px", borderRadius: 999,
                    }}>
                      {STATUS_LABEL[t.status] ?? t.status}
                    </span>
                  </td>
                  <td style={{ padding: "12px 20px", fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#9ca3af" }}>{t.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

    </div>
  )
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ icon, iconBg, iconColor, label, value, valueColor }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #dde0d4", padding: 20, display: "flex", alignItems: "center", gap: 16 }}>
      <div style={{ background: iconBg, color: iconColor, padding: 12, borderRadius: 8, display: "flex" }}>
        {icon}
      </div>
      <div>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#6b7260", margin: 0, marginBottom: 4 }}>{label}</p>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 24, fontWeight: 700, color: valueColor, margin: 0 }}>{value}</p>
      </div>
    </div>
  )
}