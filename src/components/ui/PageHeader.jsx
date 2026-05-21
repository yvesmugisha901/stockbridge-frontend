/**
 * PageHeader — consistent page title + subtitle + optional action button
 * Props: title, subtitle, action ({ label, onClick, href })
 */
import Link from "next/link"

export default function PageHeader({ title, subtitle, action }) {
  return (
    <div style={{
      display: "flex",
      alignItems: "flex-end",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: 16,
      paddingBottom: 24,
      borderBottom: "1px solid #dde0d4",
      marginBottom: 24,
    }}>
      <div>
        <h1 style={{
          fontFamily: "'DM Serif Display', Georgia, serif",
          fontSize: 30,
          color: "#1a1f0e",
          margin: "0 0 4px",
          letterSpacing: "-0.4px",
          lineHeight: 1.1,
        }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 13,
            color: "#6b7260",
            margin: 0,
            letterSpacing: "0.02em",
          }}>
            {subtitle}
          </p>
        )}
      </div>

      {action && (
        action.href ? (
          <Link href={action.href} style={btnStyle}>
            {action.label}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </Link>
        ) : (
          <button onClick={action.onClick} style={btnStyle}
            onMouseEnter={(e) => e.currentTarget.style.background = "#2a5a1e"}
            onMouseLeave={(e) => e.currentTarget.style.background = "#3d7a2b"}
          >
            {action.label}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        )
      )}
    </div>
  )
}

const btnStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  background: "#3d7a2b",
  color: "#fff",
  border: "none",
  cursor: "pointer",
  fontFamily: "'DM Mono', monospace",
  fontSize: 11,
  textTransform: "uppercase",
  letterSpacing: "0.1em",
  fontWeight: 500,
  padding: "11px 20px",
  textDecoration: "none",
  transition: "background 0.2s",
}