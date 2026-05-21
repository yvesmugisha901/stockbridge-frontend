/**
 * QuickActions — Admin shortcut tiles
 */
import Link from "next/link"

const IconUser = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
  </svg>
)

const IconBranch = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="8" y="14" width="8" height="7" rx="1" />
    <path d="M6.5 10v2.5M17.5 10v2H12v2" />
  </svg>
)

const IconBox = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 8l-9-5-9 5v8l9 5 9-5V8z" />
    <path d="M12 3v18M3 8l9 5 9-5" />
  </svg>
)

const IconChart = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="12" width="4" height="9" rx="0.5" />
    <rect x="10" y="7" width="4" height="14" rx="0.5" />
    <rect x="17" y="3" width="4" height="18" rx="0.5" />
  </svg>
)

const IconLog = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="2" width="16" height="20" rx="2" />
    <path d="M8 7h8M8 11h8M8 15h5" />
  </svg>
)

const IconConfig = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
  </svg>
)

const actions = [
  { label: "Manage Users",    href: "/admin/users",     Icon: IconUser,   desc: "Create, edit, deactivate" },
  { label: "Manage Branches", href: "/admin/branches",  Icon: IconBranch, desc: "Add locations & contacts"  },
  { label: "Item Catalogue",  href: "/admin/inventory", Icon: IconBox,    desc: "Master item list"           },
  { label: "Reports",         href: "/admin/reports",   Icon: IconChart,  desc: "Stock & transfer reports"   },
  { label: "Audit Log",       href: "/admin/logs",      Icon: IconLog,    desc: "All system events"          },
  { label: "System Config",   href: "/admin/config",    Icon: IconConfig, desc: "Thresholds & settings"      },
]

export default function QuickActions() {
  return (
    <div style={{ background: "#fff", border: "1px solid #dde0d4", padding: "24px" }}>
      <p style={{
        fontFamily: "'DM Mono', monospace",
        fontSize: 10,
        textTransform: "uppercase",
        letterSpacing: "0.15em",
        color: "#6b7260",
        margin: "0 0 16px",
      }}>
        Quick Actions
      </p>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
        gap: 10,
      }}>
        {actions.map(({ href, label, desc, Icon }) => (
          <Link
            key={href}
            href={href}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 6,
              padding: "14px 16px",
              border: "1px solid #dde0d4",
              background: "#f7f8f4",
              textDecoration: "none",
              transition: "border-color 0.15s, background 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#3d7a2b"
              e.currentTarget.style.background = "#f0f7ed"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#dde0d4"
              e.currentTarget.style.background = "#f7f8f4"
            }}
          >
            {/* SVG icon — accent color on hover via parent, neutral by default */}
            <span style={{ color: "#6b7260", display: "flex" }}>
              <Icon />
            </span>

            <span style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 13,
              fontWeight: 500,
              color: "#1a1f0e",
              letterSpacing: 0,
            }}>
              {label}
            </span>

            <span style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 11,
              fontWeight: 400,
              color: "#6b7260",
            }}>
              {desc}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}