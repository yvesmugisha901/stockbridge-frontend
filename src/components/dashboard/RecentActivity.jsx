/**
 * RecentActivity — latest audit log events for Admin dashboard
 * Props: activities [{ user, action, entity, time, type }]
 */
import Link from "next/link"

const TYPE_COLORS = {
  create: { bg: "#f0f7ed", color: "#3d7a2b" },
  update: { bg: "#eff6ff", color: "#2563eb" },
  delete: { bg: "#fef2f2", color: "#dc2626" },
  login:  { bg: "#f7f8f4", color: "#6b7260" },
}

export default function RecentActivity({ activities = [] }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #dde0d4", padding: "24px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <p style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 14,
          fontWeight: 600,
          color: "#1a1f0e",
          margin: 0,
          letterSpacing: 0,
        }}>
          Recent Activity
        </p>
        <Link href="/admin/logs" style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: 10,
          color: "#3d7a2b",
          textDecoration: "none",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
        }}>
          View all →
        </Link>
      </div>

      {activities.length === 0 ? (
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#6b7260", margin: 0 }}>
          No recent activity.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {activities.map((a, i) => {
            const tc = TYPE_COLORS[a.type] ?? TYPE_COLORS.login
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                  padding: "12px 0",
                  borderBottom: i < activities.length - 1 ? "1px solid #f0f1ec" : "none",
                }}
              >
                <span style={{
                  width: 28,
                  height: 28,
                  background: tc.bg,
                  color: tc.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 11,
                  fontFamily: "'DM Mono', monospace",
                  fontWeight: 600,
                  flexShrink: 0,
                  marginTop: 1,
                }}>
                  {a.type?.[0]?.toUpperCase() ?? "·"}
                </span>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 13,
                    fontWeight: 500,
                    color: "#1a1f0e",
                    margin: "0 0 2px",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}>
                    {a.action}
                  </p>
                  <p style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 11,
                    fontWeight: 400,
                    color: "#6b7260",
                    margin: 0,
                  }}>
                    {a.user} · {a.time}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}