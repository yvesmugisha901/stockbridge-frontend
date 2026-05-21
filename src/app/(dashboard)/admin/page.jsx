"use client"
import PageHeader     from "@/components/ui/PageHeader"
import AdminStatsGrid from "@/components/dashboard/AdminStatsGrid"
import QuickActions   from "@/components/dashboard/QuickActions"
import RecentActivity from "@/components/dashboard/RecentActivity"

const MOCK_STATS = {
  totalUsers:        24,
  activeBranches:     6,
  activeItems:       183,
  systemStatus:      "OK",
  totalTransfers:    341,
  pendingTransfers:    5,
  newUsersThisMonth:   3,
  lowStockCount:       4,
}

const MOCK_ACTIVITY = [
  { user: "alice@stockbridge.rw",  action: "Created user John Doe (STAFF)",        type: "create", time: "2 min ago"  },
  { user: "admin@stockbridge.rw",  action: "Deactivated branch Butare Depot",       type: "update", time: "14 min ago" },
  { user: "alice@stockbridge.rw",  action: "Reset password for bob@stockbridge.rw", type: "update", time: "1 hr ago"   },
  { user: "admin@stockbridge.rw",  action: "Created branch Musanze North",          type: "create", time: "3 hr ago"   },
  { user: "system",                action: "Low stock alert: Cement 42.5N at KGL",  type: "login",  time: "5 hr ago"   },
  { user: "admin@stockbridge.rw",  action: "Updated system config thresholds",      type: "update", time: "Yesterday"  },
  { user: "alice@stockbridge.rw",  action: "Deleted inactive user ghost@sb.rw",     type: "delete", time: "Yesterday"  },
]

export default function AdminDashboard() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <PageHeader
        title="Admin Dashboard"
        subtitle="Manage users, branches, inventory, transfers, and system configuration."
      />

      {/* 6 stat cards */}
      <AdminStatsGrid stats={MOCK_STATS} />

      {/* Quick Actions + Recent Activity */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "minmax(0,1fr) minmax(0,1.4fr)",
        gap: 16,
      }}>
        <QuickActions />
        <RecentActivity activities={MOCK_ACTIVITY} />
      </div>
    </div>
  )
}