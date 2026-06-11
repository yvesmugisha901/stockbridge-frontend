import StatsCard from "@/components/ui/StatsCard"

const IconUser = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
  </svg>
)
const IconBranch = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
)
const IconBox = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 8l-9-5-9 5v8l9 5 9-5V8z" />
    <path d="M12 3v18M3 8l9 5 9-5" />
  </svg>
)
const IconTruck = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13"/>
    <path d="M16 8h4l3 3v5h-7V8z"/>
    <circle cx="5.5" cy="18.5" r="2.5"/>
    <circle cx="18.5" cy="18.5" r="2.5"/>
  </svg>
)
const IconClock = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
)
const IconStatus = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z" />
    <path d="M8 12l3 3 5-5" />
  </svg>
)
const IconNewUser = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <line x1="19" y1="8" x2="19" y2="14"/>
    <line x1="22" y1="11" x2="16" y2="11"/>
  </svg>
)

export default function AdminStatsGrid({ stats }) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
      gap: 10,
    }}>
      <StatsCard
        label="People Registered"
        subLabel="All user accounts in the system"
        value={stats?.totalUsers}
        icon={<IconUser />}
        color="green"
        trend={stats?.newUsersThisMonth > 0 ? `${stats.newUsersThisMonth} new this month` : "No new users this month"}
        trendUp={stats?.newUsersThisMonth > 0}
      />
      <StatsCard
        label="New This Month"
        subLabel="User accounts created this month"
        value={stats?.newUsersThisMonth ?? 0}
        icon={<IconNewUser />}
        color="teal"
        trend={stats?.newUsersThisMonth > 0 ? "Growing" : "No new signups"}
        trendUp={stats?.newUsersThisMonth > 0}
      />
      <StatsCard
        label="Open Branches"
        subLabel="Locations currently running"
        value={stats?.activeBranches}
        icon={<IconBranch />}
        color="blue"
        trend="All working fine"
        trendUp={true}
      />
      <StatsCard
        label="Products in Stock"
        subLabel="Total items available across branches"
        value={stats?.activeItems}
        icon={<IconBox />}
        color="yellow"
        trend="Active catalogue items"
      />
      <StatsCard
        label="Transfers Done"
        subLabel="Items moved between branches, ever"
        value={stats?.totalTransfers}
        icon={<IconTruck />}
        color="blue"
        trend="Since the start"
      />
      <StatsCard
        label="Waiting to Move"
        subLabel="Transfer requests not yet approved"
        value={stats?.pendingTransfers}
        icon={<IconClock />}
        color={stats?.pendingTransfers > 0 ? "yellow" : "green"}
        trend={stats?.pendingTransfers > 0 ? "Needs someone to approve" : "Nothing pending"}
        trendUp={stats?.pendingTransfers === 0}
      />
      <StatsCard
        label="System Health"
        subLabel="Is everything working right now?"
        value={stats?.systemStatus ?? "All Good"}
        icon={<IconStatus />}
        color="green"
        trend="No issues found"
        trendUp={true}
      />
    </div>
  )
}
