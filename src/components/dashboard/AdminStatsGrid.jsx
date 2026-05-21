/**
 * AdminStatsGrid — 6-card stats row for the Admin dashboard
 * Props: stats { totalUsers, activeBranches, activeItems, systemStatus,
 *               totalTransfers, pendingTransfers,
 *               newUsersThisMonth, lowStockCount, activeRoles }
 */
import StatsCard from "@/components/ui/StatsCard"

const IconUser = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
  </svg>
)
const IconBranch = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
)
const IconBox = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 8l-9-5-9 5v8l9 5 9-5V8z" />
    <path d="M12 3v18M3 8l9 5 9-5" />
  </svg>
)
const IconTruck = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13"/>
    <path d="M16 8h4l3 3v5h-7V8z"/>
    <circle cx="5.5" cy="18.5" r="2.5"/>
    <circle cx="18.5" cy="18.5" r="2.5"/>
  </svg>
)
const IconClock = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
)
const IconStatus = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z" />
    <path d="M8 12l3 3 5-5" />
  </svg>
)

export default function AdminStatsGrid({ stats }) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
      gap: 16,
    }}>
      <StatsCard
        label="Total Users"
        value={stats?.totalUsers}
        icon={<IconUser />}
        color="green"
        trend={stats?.newUsersThisMonth ? `+${stats.newUsersThisMonth} this month` : "No new users"}
        trendUp={stats?.newUsersThisMonth > 0}
      />
      <StatsCard
        label="Active Branches"
        value={stats?.activeBranches}
        icon={<IconBranch />}
        color="blue"
        trend="All operational"
      />
      <StatsCard
        label="Inventory Items"
        value={stats?.activeItems}
        icon={<IconBox />}
        color="yellow"
        trend={stats?.lowStockCount ? `${stats.lowStockCount} low stock` : "Stock healthy"}
        trendUp={stats?.lowStockCount === 0}
      />
      <StatsCard
        label="Total Transfers"
        value={stats?.totalTransfers}
        icon={<IconTruck />}
        color="blue"
        trend="All time"
      />
      <StatsCard
        label="Pending Transfers"
        value={stats?.pendingTransfers}
        icon={<IconClock />}
        color={stats?.pendingTransfers > 0 ? "yellow" : "green"}
        trend={stats?.pendingTransfers > 0 ? "Awaiting action" : "None pending"}
        trendUp={stats?.pendingTransfers === 0}
      />
      <StatsCard
        label="System Status"
        value={stats?.systemStatus ?? "OK"}
        icon={<IconStatus />}
        color="green"
        trend="All services running"
        trendUp={true}
      />
    </div>
  )
}