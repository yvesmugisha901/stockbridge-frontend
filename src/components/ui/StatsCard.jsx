export default function StatsCard({ label, subLabel, value, icon, trend, trendUp, color = "green" }) {
  const palette = {
    green:  { bg: "#EAF3DE", accent: "#639922", light: "#C0DD97" },
    blue:   { bg: "#E6F1FB", accent: "#185FA5", light: "#B5D4F4" },
    yellow: { bg: "#FAEEDA", accent: "#BA7517", light: "#FAC775" },
    red:    { bg: "#FCEBEB", accent: "#A32D2D", light: "#F7C1C1" },
    teal:   { bg: "#E1F5EE", accent: "#0F6E56", light: "#9FE1CB" },
    purple: { bg: "#EEEDFE", accent: "#534AB7", light: "#CECBF6" },
    gray:   { bg: "#F1EFE8", accent: "#5F5E5A", light: "#D3D1C7" },
  }
  const c = palette[color] ?? palette.green

  return (
    <div
      style={{
        background: "#fff",
        border: "0.5px solid #dde0d4",
        borderRadius: 8,
        padding: "12px 14px 10px",
        display: "flex",
        flexDirection: "column",
        gap: 5,
        position: "relative",
        overflow: "hidden",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#b5b9ab")}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#dde0d4")}
    >
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: c.accent }} />

      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 6 }}>
        <div>
          <div style={{
            fontSize: 11,
            fontWeight: 500,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "#6b7260",
            lineHeight: 1.3,
          }}>
            {label}
          </div>
          {subLabel && (
            <div style={{ fontSize: 10, color: "#9a9e8f", lineHeight: 1.3, marginTop: 1 }}>
              {subLabel}
            </div>
          )}
        </div>
        <span style={{
          background: c.bg,
          color: c.accent,
          width: 28,
          height: 28,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          borderRadius: 6,
          border: `0.5px solid ${c.light}`,
        }}>
          {icon}
        </span>
      </div>

      <p style={{
        fontSize: 26,
        fontWeight: 500,
        color: "#1a1f0e",
        margin: 0,
        lineHeight: 1,
        letterSpacing: "-0.5px",
      }}>
        {value ?? "—"}
      </p>

      {trend && (
        <p style={{
          fontSize: 11,
          color: trendUp === false ? "#dc2626" : c.accent,
          margin: 0,
          display: "flex",
          alignItems: "center",
          gap: 3,
        }}>
          {trendUp === true ? "↑" : trendUp === false ? "↓" : "·"} {trend}
        </p>
      )}
    </div>
  )
}