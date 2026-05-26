"use client"
import { useState, useEffect } from "react"
import PageHeader      from "@/components/ui/PageHeader"
import AdminStatsGrid  from "@/components/dashboard/AdminStatsGrid"
import QuickActions    from "@/components/dashboard/QuickActions"
import RecentActivity  from "@/components/dashboard/RecentActivity"

const API = process.env.NEXT_PUBLIC_API_URL

const EMPTY_STATS = {
  totalUsers: 0, activeBranches: 0, activeItems: 0,
  systemStatus: "OK", totalTransfers: 0, pendingTransfers: 0,
  newUsersThisMonth: 0, lowStockCount: 0,
}

// inline until @/lib/auth/tokens.js is created
function getToken() {
  return document.cookie
    .split("; ")
    .find(r => r.startsWith("auth_token="))
    ?.split("=")[1]
}

export default function AdminDashboard() {
  const [stats,      setStats]      = useState(EMPTY_STATS)
  const [activities, setActivities] = useState([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        setLoading(true)
        setError(null)

        const headers = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        }

        const [statsRes, activityRes] = await Promise.all([
          fetch(`${API}/admin/stats`,    { headers }),
          fetch(`${API}/admin/activity`, { headers }),
        ])

        if (!cancelled) {
          if (statsRes.ok) {
            const j = await statsRes.json()
            setStats(j.data ?? j)
          }
          if (activityRes.ok) {
            const j = await activityRes.json()
            setActivities(j.data ?? j ?? [])
          }
        }
      } catch (err) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [])

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <PageHeader
        title="Admin Dashboard"
        subtitle="Manage users, branches, inventory, transfers, and system configuration."
      />

      {error && (
        <div style={{
          background: "#fef2f2", border: "1px solid #fecaca",
          color: "#dc2626", padding: "10px 16px",
          fontFamily: "'DM Mono', monospace", fontSize: 12,
        }}>
          Failed to load dashboard data: {error}
        </div>
      )}

      <AdminStatsGrid stats={stats} loading={loading} />

      <div style={{
        display: "grid",
        gridTemplateColumns: "minmax(0,1fr) minmax(0,1.4fr)",
        gap: 16,
      }}>
        <QuickActions />
        <RecentActivity activities={activities} loading={loading} />
      </div>
    </div>
  )
}