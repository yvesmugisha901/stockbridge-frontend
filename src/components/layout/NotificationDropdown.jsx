"use client"
export function NotificationDropdown({ notifications, onMarkAllRead, onMarkRead, onClose }) {
  const TYPE_COLOR = {
    TRANSFER_APPROVED:  { bg: "#f0fdf4", color: "#16a34a", dot: "#16a34a" },
    TRANSFER_REJECTED:  { bg: "#fef2f2", color: "#dc2626", dot: "#dc2626" },
    TRANSFER_PENDING:   { bg: "#fffbeb", color: "#b45309", dot: "#f59e0b" },
    TRANSFER_RECEIVED:  { bg: "#eff6ff", color: "#1d4ed8", dot: "#3b82f6" },
    TRANSFER_IN_TRANSIT:{ bg: "#f5f3ff", color: "#6d28d9", dot: "#8b5cf6" },
    DEFAULT:            { bg: "#f7f8f4", color: "#6b7280", dot: "#9ca3af" },
  }

  return (
    <div style={{
      position: "absolute", top: 36, right: 0, zIndex: 999,
      width: 320, background: "#fff",
      border: "1px solid #e8ebe3", borderRadius: 10,
      boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
      fontFamily: "'Inter', sans-serif",
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: "1px solid #e8ebe3" }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: "#1a1f0e" }}>Notifications</span>
        {notifications.some(n => !n.read) && (
          <button onClick={onMarkAllRead} style={{ fontSize: 11, color: "#3d7a2b", background: "none", border: "none", cursor: "pointer", fontFamily: "'Inter', sans-serif" }}>
            Mark all read
          </button>
        )}
      </div>

      {/* List */}
      <div style={{ maxHeight: 360, overflowY: "auto" }}>
        {notifications.length === 0 ? (
          <div style={{ padding: 32, textAlign: "center", color: "#9ca3af", fontSize: 13 }}>
            No notifications yet
          </div>
        ) : notifications.slice(0, 20).map(n => {
          const style = TYPE_COLOR[n.type] ?? TYPE_COLOR.DEFAULT
          return (
            <div
              key={n.id}
              onClick={() => !n.read && onMarkRead?.(n.id)}
              style={{
                padding: "12px 16px", borderBottom: "1px solid #f3f4f0",
                background: n.read ? "#fff" : "#fafdf8",
                cursor: n.read ? "default" : "pointer",
                display: "flex", gap: 10, alignItems: "flex-start",
              }}
            >
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: n.read ? "#e8ebe3" : style.dot, flexShrink: 0, marginTop: 5 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: n.read ? 400 : 600, color: "#1a1f0e", marginBottom: 2 }}>{n.title}</div>
                <div style={{ fontSize: 11, color: "#6b7280", lineHeight: 1.5 }}>{n.message}</div>
                <div style={{ fontSize: 10, color: "#9ca3af", marginTop: 4, fontFamily: "'DM Mono', monospace" }}>
                  {new Date(n.createdAt).toLocaleString()}
                </div>
              </div>
              {!n.read && (
                <span style={{ fontSize: 9, background: style.bg, color: style.color, padding: "2px 6px", borderRadius: 3, flexShrink: 0, fontWeight: 600 }}>
                  NEW
                </span>
              )}
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div style={{ padding: "10px 16px", borderTop: "1px solid #e8ebe3", textAlign: "center" }}>
        <button onClick={onClose} style={{ fontSize: 11, color: "#9ca3af", background: "none", border: "none", cursor: "pointer" }}>
          Close
        </button>
      </div>
    </div>
  )
}