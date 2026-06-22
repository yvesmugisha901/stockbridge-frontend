"use client"
import { useState, useEffect, useCallback } from "react"
import PageHeader from "@/components/ui/PageHeader"
import { api } from "@/lib/api/client"

const TYPE_COLOR = {
  TRANSFER_APPROVED:   { bg: "#f0fdf4", color: "#16a34a", dot: "#16a34a" },
  TRANSFER_REJECTED:   { bg: "#fef2f2", color: "#dc2626", dot: "#dc2626" },
  TRANSFER_PENDING:    { bg: "#fffbeb", color: "#b45309", dot: "#f59e0b" },
  TRANSFER_RECEIVED:   { bg: "#eff6ff", color: "#1d4ed8", dot: "#3b82f6" },
  TRANSFER_IN_TRANSIT: { bg: "#f5f3ff", color: "#6d28d9", dot: "#8b5cf6" },
  DEFAULT:             { bg: "#f7f8f4", color: "#6b7280", dot: "#9ca3af" },
}

const PAGE_SIZE = 20

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const [filter, setFilter]   = useState("all") // "all" | "unread"
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  const fetchNotifications = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const res = await api.get("/notifications")
      setNotifications(Array.isArray(res) ? res : (res.data ?? []))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchNotifications() }, [fetchNotifications])

  const unreadCount = notifications.filter(n => !n.read).length

  const handleMarkAllRead = async () => {
    try {
      await api.patch("/notifications/mark-all-read")
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    } catch (err) {
      setError(err.message)
    }
  }

  const handleMarkRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`)
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    } catch (err) {
      setError(err.message)
    }
  }

  const filtered = filter === "unread"
    ? notifications.filter(n => !n.read)
    : notifications

  const visible    = filtered.slice(0, visibleCount)
  const hasMore     = filtered.length > visible.length

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 720 }}>
      <PageHeader
        title="Notifications"
        subtitle={unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}.` : "You're all caught up."}
      />

      <div style={{ background: "#fff", border: "1px solid #e8ebe3", borderRadius: 8, overflow: "hidden" }}>

        {/* Toolbar */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "14px 24px", borderBottom: "1px solid #e8ebe3", background: "#f7f8f4",
          flexWrap: "wrap", gap: 12,
        }}>
          <div style={{ display: "flex", gap: 6 }}>
            <FilterTab label="All" active={filter === "all"} onClick={() => { setFilter("all"); setVisibleCount(PAGE_SIZE) }} />
            <FilterTab label="Unread" active={filter === "unread"} onClick={() => { setFilter("unread"); setVisibleCount(PAGE_SIZE) }} count={unreadCount} />
          </div>

          {unreadCount > 0 && (
            <button onClick={handleMarkAllRead} style={btnGhost}>
              Mark all read
            </button>
          )}
        </div>

        {error && (
          <div style={{ padding: "10px 24px", fontSize: 12, color: "#dc2626", fontFamily: "'DM Mono', monospace" }}>
            {error}
          </div>
        )}

        {/* List */}
        {loading ? (
          <div style={{ padding: 24 }}><Skeleton /></div>
        ) : visible.length === 0 ? (
          <div style={{ padding: "60px 24px", textAlign: "center", color: "#9ca3af" }}>
            <div style={{ fontSize: 13 }}>
              {filter === "unread" ? "No unread notifications" : "No notifications yet"}
            </div>
          </div>
        ) : (
          <div>
            {visible.map(n => {
              const style = TYPE_COLOR[n.type] ?? TYPE_COLOR.DEFAULT
              return (
                <div
                  key={n.id}
                  onClick={() => !n.read && handleMarkRead(n.id)}
                  style={{
                    padding: "16px 24px", borderBottom: "1px solid #f3f4f0",
                    background: n.read ? "#fff" : "#fafdf8",
                    cursor: n.read ? "default" : "pointer",
                    display: "flex", gap: 12, alignItems: "flex-start",
                  }}
                >
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: n.read ? "#e8ebe3" : style.dot, flexShrink: 0, marginTop: 6 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: n.read ? 400 : 600, color: "#1a1f0e", marginBottom: 3 }}>
                      {n.title}
                    </div>
                    <div style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.5 }}>
                      {n.message}
                    </div>
                    <div style={{ fontSize: 10, color: "#9ca3af", marginTop: 6, fontFamily: "'DM Mono', monospace" }}>
                      {new Date(n.createdAt).toLocaleString()}
                    </div>
                  </div>
                  {!n.read && (
                    <span style={{
                      fontSize: 9, background: style.bg, color: style.color,
                      padding: "2px 7px", borderRadius: 3, flexShrink: 0, fontWeight: 600,
                    }}>
                      NEW
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Load more */}
        {!loading && hasMore && (
          <div style={{ padding: "14px 24px", textAlign: "center", borderTop: "1px solid #f3f4f0" }}>
            <button onClick={() => setVisibleCount(c => c + PAGE_SIZE)} style={btnGhost}>
              Load more
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function FilterTab({ label, active, onClick, count }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 6,
        padding: "6px 14px", borderRadius: 6, border: "none", cursor: "pointer",
        fontSize: 12, fontWeight: 500, fontFamily: "'Inter', sans-serif",
        background: active ? "#1a1f0e" : "transparent",
        color: active ? "#fff" : "#4b5563",
        transition: "background 0.13s, color 0.13s",
      }}
    >
      {label}
      {typeof count === "number" && count > 0 && (
        <span style={{
          fontSize: 9, fontWeight: 600, fontFamily: "'DM Mono', monospace",
          background: active ? "rgba(255,255,255,0.2)" : "#e4f0df",
          color: active ? "#fff" : "#3d7a2b",
          padding: "1px 6px", borderRadius: 8,
        }}>
          {count}
        </span>
      )}
    </button>
  )
}

function Skeleton() {
  return [1, 2, 3, 4].map(i => (
    <div key={i} style={{ height: 56, background: "#f3f4f0", borderRadius: 6, marginBottom: 12 }} />
  ))
}

const btnGhost = {
  fontSize: 11, color: "#3d7a2b", background: "none", border: "none",
  cursor: "pointer", fontFamily: "'Inter', sans-serif", fontWeight: 500,
  padding: "4px 8px",
}