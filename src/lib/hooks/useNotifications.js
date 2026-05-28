import { useState, useEffect, useCallback } from "react"
import { api } from "@/lib/api/client"

export function useNotifications() {
  const [notifications, setNotifications] = useState([])
  const [unreadCount,   setUnreadCount]   = useState(0)

  const load = useCallback(async () => {
    try {
      const res = await api.get("/notifications")
      const list = res.data ?? res
      setNotifications(list)
      setUnreadCount(list.filter(n => !n.read).length)
    } catch { /* silent — don't break the page if notifs fail */ }
  }, [])

  useEffect(() => {
    load()
    const interval = setInterval(load, 30000) // poll every 30s (NFR-06)
    return () => clearInterval(interval)
  }, [load])

  const markAllRead = async () => {
    await api.patch("/notifications/mark-all-read")
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setUnreadCount(0)
  }

  const markRead = async (id) => {
    await api.patch(`/notifications/${id}/read`)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  return { notifications, unreadCount, markAllRead, markRead, reload: load }
}