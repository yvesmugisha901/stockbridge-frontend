/**
 * StatsCard — reusable metric card
 * Props: label, value, icon (SVG element), trend (string), color (green|blue|yellow|red|gray)
 */
export default function StatsCard({ label, value, icon, trend, trendUp, color = "green" }) {
  const palette = {
    green:  { bg: "#f0f7ed", accent: "#3d7a2b", light: "#e6f2e1" },
    blue:   { bg: "#eff6ff", accent: "#2563eb", light: "#dbeafe" },
    yellow: { bg: "#fefce8", accent: "#ca8a04", light: "#fef9c3" },
    red:    { bg: "#fef2f2", accent: "#dc2626", light: "#fee2e2" },
    gray:   { bg: "#f7f8f4", accent: "#6b7260", light: "#e5e7eb" },
  }
  const c = palette[color] ?? palette.green

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #dde0d4",
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        gap: 14,
        transition: "box-shadow 0.2s",
        position: "relative",
        overflow: "hidden",
      }}
      onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 4px 24px rgba(61,122,43,0.08)"}
      onMouseLeave={(e) => e.currentTarget.style.boxShadow = "none"}
    >
      {/* top accent line */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: c.accent }} />

      {/* label + icon row */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <span style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: 10,
          textTransform: "uppercase",
          letterSpacing: "0.15em",
          color: "#6b7260",
          lineHeight: 1.4,
          maxWidth: "70%",
        }}>
          {label}
        </span>

        {/* SVG icon container — no emojis */}
        <span style={{
          background: c.bg,
          color: c.accent,
          width: 36,
          height: 36,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          border: `1px solid ${c.light}`,
        }}>
          {icon}
        </span>
      </div>

      {/* big value — Inter */}
      <p style={{
        fontFamily: "'Inter', sans-serif",
        fontSize: 36,
        fontWeight: 600,
        color: "#1a1f0e",
        margin: 0,
        lineHeight: 1,
        letterSpacing: "-0.5px",
      }}>
        {value ?? "—"}
      </p>

      {/* trend line — Inter */}
      {trend && (
        <p style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 12,
          fontWeight: 400,
          color: trendUp === false ? "#dc2626" : c.accent,
          margin: 0,
          display: "flex",
          alignItems: "center",
          gap: 4,
        }}>
          {trendUp === true ? "↑" : trendUp === false ? "↓" : "·"} {trend}
        </p>
      )}
    </div>
  )
}