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
}

function normaliseStats(raw) {
  const flat = raw?.data?.stats ?? raw?.data ?? raw?.stats ?? raw ?? {}
  return {
    totalUsers:        flat.totalUsers        ?? flat.total_users          ?? flat.users      ?? 0,
    activeBranches:    flat.activeBranches    ?? flat.active_branches      ?? flat.branches   ?? 0,
    activeItems:       flat.activeItems       ?? flat.active_items         ?? flat.items      ?? 0,
    systemStatus:      flat.systemStatus      ?? flat.system_status        ?? flat.status     ?? "OK",
    totalTransfers:    flat.totalTransfers    ?? flat.total_transfers      ?? flat.transfers  ?? 0,
    pendingTransfers:  flat.pendingTransfers  ?? flat.pending_transfers    ?? flat.pending    ?? 0,
    newUsersThisMonth: flat.newUsersThisMonth ?? flat.new_users_this_month ?? flat.newUsers   ?? 0,
  }
}

// Maps AuditLogResponse fields → what RecentActivity expects
// Backend fields: { timestamp, performedBy, action, entityType, details }
function normaliseActivities(raw) {
  // Handle both ApiResponse<Page<T>> and plain arrays
  const list =
    raw?.data?.content ??   // ApiResponse<Page<T>>  ← audit-log shape
    raw?.data?.activities ?? // ApiResponse<{ activities }> 
    raw?.data ??
    raw?.activities ??
    raw ??
    []

  if (!Array.isArray(list)) return []

  return list.slice(0, 10).map((log) => ({
    // Primary line shown in the activity row
    action: [log.action, log.entityType].filter(Boolean).join(" — ") || "System event",
    // Secondary meta line
    user:   log.performedBy ?? "System",
    time:   log.timestamp
              ? new Date(log.timestamp).toLocaleString()
              : "—",
    // Badge letter: derive from action verb (CREATE→create, UPDATE→update, etc.)
    type:   deriveType(log.action),
    // Keep raw for any future use
    entity:  log.entityType ?? "",
    details: log.details    ?? "",
  }))
}

function deriveType(action = "") {
  const a = action.toLowerCase()
  if (a.includes("create") || a.includes("add") || a.includes("register")) return "create"
  if (a.includes("update") || a.includes("edit")  || a.includes("change"))  return "update"
  if (a.includes("delete") || a.includes("remove") || a.includes("reject"))  return "delete"
  if (a.includes("login")  || a.includes("logout") || a.includes("auth"))    return "login"
  return "login" // neutral gray fallback
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

        // Use allSettled so a failing activity request does not blank the stats cards
        const [statsResult, activityResult] = await Promise.allSettled([
          api.get("/admin/stats"),
          // Sort by performedAt (the DB column name), not timestamp (the DTO alias)
          api.get("/admin/audit-log?page=0&size=10&sort=performedAt,desc"),
        ])

        if (!cancelled) {
          if (statsResult.status === "fulfilled") setStats(normaliseStats(statsResult.value))
          if (activityResult.status === "fulfilled") setActivities(normaliseActivities(activityResult.value))
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
      <PageHeader title="Admin Dashboard" />

      {error && (
        <div style={{
          background: "#fef2f2", border: "1px solid #fecaca",
          color: "#dc2626", padding: "10px 16px",
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
