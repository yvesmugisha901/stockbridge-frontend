"use client"
import { useState, useEffect } from "react"
import PageHeader     from "@/components/ui/PageHeader"
import AdminStatsGrid from "@/components/dashboard/AdminStatsGrid"
import QuickActions   from "@/components/dashboard/QuickActions"
import RecentActivity from "@/components/dashboard/RecentActivity"
import { api }        from "@/lib/api/client"

const EMPTY_STATS = {
  totalUsers:        0,
  activeBranches:    0,
  activeItems:       0,
  systemStatus:      "OK",
  totalTransfers:    0,
  pendingTransfers:  0,
  newUsersThisMonth: 0,
  lowStockCount:     0,
}

function normaliseStats(raw) {
  const flat = raw?.data?.stats ?? raw?.data ?? raw?.stats ?? raw ?? {}
  return {
    totalUsers:        flat.totalUsers        ?? flat.total_users          ?? flat.users     ?? 0,
    activeBranches:    flat.activeBranches    ?? flat.active_branches      ?? flat.branches   ?? 0,
    activeItems:       flat.activeItems       ?? flat.active_items         ?? flat.items      ?? 0,
    systemStatus:      flat.systemStatus      ?? flat.system_status        ?? flat.status     ?? "OK",
    totalTransfers:    flat.totalTransfers    ?? flat.total_transfers      ?? flat.transfers   ?? 0,
    pendingTransfers:  flat.pendingTransfers  ?? flat.pending_transfers    ?? flat.pending     ?? 0,
    newUsersThisMonth: flat.newUsersThisMonth ?? flat.new_users_this_month ?? flat.newUsers   ?? 0,
    lowStockCount:     flat.lowStockCount     ?? flat.low_stock_count      ?? flat.lowStock    ?? 0,
  }
}

function normaliseActivities(raw) {
  const list = raw?.data?.activities ?? raw?.data ?? raw?.activities ?? raw ?? []
  return Array.isArray(list) ? list : []
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

        const [statsData, activityData] = await Promise.all([
          api.get("/admin/stats"),
          api.get("/admin/activity"),
        ])

        if (!cancelled) {
          setStats(normaliseStats(statsData))
          setActivities(normaliseActivities(activityData))
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
          borderRadius: 6, color: "#dc2626", padding: "10px 16px",
          fontFamily: "'DM Mono', monospace", fontSize: 12,
        }}>
          {error}
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