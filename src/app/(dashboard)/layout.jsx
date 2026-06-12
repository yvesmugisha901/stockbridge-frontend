"use client"
import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useAuthContext } from "@/lib/context/AuthContext"
import Sidebar from "@/components/layout/Sidebar"
import Header  from "@/components/layout/Header"
import { api } from "@/lib/api/client"

export default function DashboardLayout({ children }) {
  const { user, loading } = useAuthContext()
  const router = useRouter()
  const [notifications, setNotifications] = useState([])
  const [sidebarOpen, setSidebarOpen] = useState(false) // mobile drawer state

  const fetchNotifications = useCallback(async () => {
    if (!user) return
    try {
      const res = await api.get("/notifications")
      setNotifications(Array.isArray(res) ? res : (res.data ?? []))
    } catch (e) {
      setNotifications([])
    }
  }, [user])

  useEffect(() => {
    if (!loading && !user) router.push("/login")
  }, [user, loading, router])

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [fetchNotifications])

  // Close the mobile drawer whenever the route changes
  useEffect(() => {
    setSidebarOpen(false)
  }, [])

  const handleMarkAllRead = async () => {
    try {
      await api.patch("/notifications/mark-all-read")
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    } catch (e) {}
  }

  const handleMarkRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`)
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    } catch (e) {}
  }

  if (loading || !user) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f7f8f4",
      }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <div style={{
            width: 28, height: 28,
            border: "2.5px solid #dde0d4",
            borderTopColor: "#3d7a2b",
            borderRadius: "50%",
            animation: "sb-spin 0.7s linear infinite",
          }} />
          <span style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 11,
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            color: "#6b7260",
          }}>
            Loading…
          </span>
          <style>{`@keyframes sb-spin { to { transform: rotate(360deg) } }`}</style>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-shell" style={{
      display: "flex",
      height: "100vh",
      background: "#f7f8f4",
      overflow: "hidden",
    }}>
      {/* Backdrop for mobile drawer */}
      {sidebarOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        minWidth: 0,
      }}>
        <Header
          notifications={notifications}
          onMarkAllRead={handleMarkAllRead}
          onMarkRead={handleMarkRead}
          onMenuClick={() => setSidebarOpen(prev => !prev)}
        />

        <main className="dashboard-main" style={{
          flex: 1,
          overflowY: "auto",
          padding: "32px 36px",
        }}>
          {children}
        </main>
      </div>
    </div>
  )
}
