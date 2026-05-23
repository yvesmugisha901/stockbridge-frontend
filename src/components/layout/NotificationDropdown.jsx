export function NotificationDropdown({ notifications = [], onMarkAllRead, onClose }) {
  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div style={{
      position: "absolute",
      top: "calc(100% + 8px)",
      right: 0,
      width: 300,
      background: "#fff",
      border: "1px solid #e8ebe3",
      borderRadius: 8,
      boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
      zIndex: 1000,
    }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 14px 8px",
        borderBottom: "1px solid #e8ebe3",
      }}>
        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 500, color: "#1a1f0e" }}>
          Notifications {unreadCount > 0 && `(${unreadCount})`}
        </span>
        {unreadCount > 0 && (
          <button onClick={onMarkAllRead} style={{
            background: "none", border: "none", cursor: "pointer",
            fontFamily: "'Inter', sans-serif", fontSize: 11, color: "#3d7a2b",
          }}>
            Mark all read
          </button>
        )}
      </div>

      <div style={{ maxHeight: 280, overflowY: "auto" }}>
        {notifications.length === 0 ? (
          <p style={{ padding: "16px 14px", fontSize: 13, color: "#9ca3af", textAlign: "center" }}>
            No notifications
          </p>
        ) : notifications.map((n) => (
          <div key={n.id} style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 10,
            padding: "10px 14px",
            borderBottom: "1px solid #f3f4f0",
            cursor: "pointer",
            background: n.read ? "transparent" : "#fafdf9",
          }}
            onMouseEnter={e => e.currentTarget.style.background = "#f7f8f4"}
            onMouseLeave={e => e.currentTarget.style.background = n.read ? "transparent" : "#fafdf9"}
          >
            <span style={{
              width: 7, height: 7, borderRadius: "50%", flexShrink: 0, marginTop: 5,
              background: n.read ? "transparent" : "#3d7a2b",
              border: n.read ? "1.5px solid #d1d5db" : "none",
            }} />
            <div>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12.5, color: "#1a1f0e", margin: 0, lineHeight: 1.5 }}>
                {n.message}
              </p>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#9ca3af" }}>
                {n.time}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ padding: "8px 14px", borderTop: "1px solid #e8ebe3", textAlign: "center" }}>
        <a href="/notifications" style={{
          fontFamily: "'Inter', sans-serif", fontSize: 11, color: "#3d7a2b", textDecoration: "none",
        }}>
          View all notifications →
        </a>
      </div>
    </div>
  )
}