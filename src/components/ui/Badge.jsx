/**
 * Badge — role & status labels
 * Props: label, variant (role|status), value (the key e.g. "ADMIN", "PENDING")
 */

const ROLE_STYLES = {
  ADMIN:       { bg: "#fef2f2", color: "#dc2626", border: "#fecaca" },
  MANAGER:     { bg: "#eff6ff", color: "#2563eb", border: "#bfdbfe" },
  HO_ADMIN:    { bg: "#f5f3ff", color: "#7c3aed", border: "#ddd6fe" },
  ACCOUNTANT:  { bg: "#fefce8", color: "#ca8a04", border: "#fde68a" },
  STAFF:       { bg: "#f0f7ed", color: "#3d7a2b", border: "#bbf7d0" },
}

const STATUS_STYLES = {
  PENDING:          { bg: "#fefce8", color: "#ca8a04", border: "#fde68a" },
  MANAGER_APPROVED: { bg: "#eff6ff", color: "#2563eb", border: "#bfdbfe" },
  HO_APPROVED:      { bg: "#f5f3ff", color: "#7c3aed", border: "#ddd6fe" },
  IN_TRANSIT:       { bg: "#fff7ed", color: "#ea580c", border: "#fed7aa" },
  RECEIVED:         { bg: "#f0fdfa", color: "#0d9488", border: "#99f6e4" },
  COMPLETED:        { bg: "#f0f7ed", color: "#3d7a2b", border: "#bbf7d0" },
  REJECTED:         { bg: "#fef2f2", color: "#dc2626", border: "#fecaca" },
  CANCELLED:        { bg: "#f7f8f4", color: "#6b7260", border: "#dde0d4" },
  ACTIVE:           { bg: "#f0f7ed", color: "#3d7a2b", border: "#bbf7d0" },
  INACTIVE:         { bg: "#fef2f2", color: "#dc2626", border: "#fecaca" },
}

export default function Badge({ label, value, variant = "status" }) {
  const map = variant === "role" ? ROLE_STYLES : STATUS_STYLES
  const style = map[value] ?? { bg: "#f7f8f4", color: "#6b7260", border: "#dde0d4" }

  return (
    <span style={{
      fontFamily: "'DM Mono', monospace",
      fontSize: 10,
      textTransform: "uppercase",
      letterSpacing: "0.1em",
      padding: "4px 10px",
      background: style.bg,
      color: style.color,
      border: `1px solid ${style.border}`,
      whiteSpace: "nowrap",
      display: "inline-block",
    }}>
      {label}
    </span>
  )
}