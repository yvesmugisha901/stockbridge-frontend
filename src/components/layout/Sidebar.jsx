"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuthContext } from "@/lib/context/AuthContext"
import { ROLES } from "@/lib/utils/constants"

function DashboardIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
}
function BoxIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
}
function TruckIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
}
function PlusIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
}
function CheckCircleIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
}
function ReportIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
}
function UsersIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
}
function BranchIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
}
function DollarIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
}
function CatalogueIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
}
function ShieldIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
}
function LogIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M8 7h8M8 11h8M8 15h5"/></svg>
}
function ConfigIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
}
function SettingsIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
}

const NAV = {
  [ROLES.STAFF]: [
    { label: "Dashboard",         href: "/staff",               icon: DashboardIcon },
    { label: "My Stock",          href: "/staff/stock",         icon: BoxIcon       },
    { label: "Transfer Requests", href: "/staff/transfers",     icon: TruckIcon     },
    { label: "New Transfer",      href: "/staff/transfers/new", icon: PlusIcon      },
  ],
  [ROLES.MANAGER]: [
    { label: "Dashboard",         href: "/manager",             icon: DashboardIcon   },
    { label: "Branch Stock",      href: "/manager/stock",       icon: BoxIcon         },
    { label: "Pending Approvals", href: "/manager/approvals",   icon: CheckCircleIcon },
    { label: "Reports",           href: "/manager/reports",     icon: ReportIcon      },
  ],
  [ROLES.HO_ADMIN]: [
    { label: "Dashboard",           href: "/ho-admin",           icon: DashboardIcon   },
    { label: "All Stock",           href: "/ho-admin/stock",     icon: BoxIcon         },
    { label: "Final Approvals",     href: "/ho-admin/approvals", icon: CheckCircleIcon },
    { label: "Inventory Catalogue", href: "/ho-admin/inventory", icon: CatalogueIcon   },
    { label: "Reports",             href: "/ho-admin/reports",   icon: ReportIcon      },
  ],
  [ROLES.ACCOUNTANT]: [
    { label: "Dashboard",          href: "/accountant",           icon: DashboardIcon },
    { label: "Approved Transfers", href: "/accountant/transfers", icon: TruckIcon     },
    { label: "Finance Summary",    href: "/accountant/finance",   icon: DollarIcon    },
    { label: "Reports",            href: "/accountant/reports",   icon: ReportIcon    },
  ],
  [ROLES.ADMIN]: [
    { label: "Dashboard",           href: "/admin",           icon: DashboardIcon, group: "Overview"        },
    { label: "Users",               href: "/admin/users",     icon: UsersIcon,     group: "People & Places" },
    { label: "Branches",            href: "/admin/branches",  icon: BranchIcon,    group: "People & Places" },
    { label: "Item Catalogue",      href: "/admin/inventory", icon: CatalogueIcon, group: "Inventory"       },
    { label: "All Stock",           href: "/admin/stock",     icon: BoxIcon,       group: "Inventory"       },
    { label: "All Transfers",       href: "/admin/transfers", icon: TruckIcon,     group: "Transfers"       },
    { label: "Reports",             href: "/admin/reports",   icon: ReportIcon,    group: "Reports & Logs"  },
    { label: "Audit Log",           href: "/admin/logs",      icon: LogIcon,       group: "Reports & Logs"  },
    { label: "System Config",       href: "/admin/config",    icon: ConfigIcon,    group: "System"          },
    { label: "Roles & Permissions", href: "/admin/roles",     icon: ShieldIcon,    group: "System"          },
  ],
}

const ROLE_LABEL = {
  [ROLES.ADMIN]:      "System Admin",
  [ROLES.HO_ADMIN]:   "HO Admin",
  [ROLES.MANAGER]:    "Branch Manager",
  [ROLES.STAFF]:      "Staff",
  [ROLES.ACCOUNTANT]: "Accountant",
}

export default function Sidebar() {
  const { user }  = useAuthContext()
  const pathname  = usePathname()
  const links     = NAV[user?.role] || []
  const roleLabel = ROLE_LABEL[user?.role] || user?.role
  const isAdmin   = user?.role === ROLES.ADMIN

  // Resolve the display name — tries every field the JWT might use
  const displayName = user?.fullName || user?.full_name || user?.name || user?.username || user?.sub || "—"
  const initial     = displayName.charAt(0).toUpperCase()

  const navLinkStyle = (href) => {
    const active =
      pathname === href ||
      (href.length > 1 &&
        pathname.startsWith(href) &&
        href !== `/${user?.role?.toLowerCase().replace("_", "-")}`)
    return {
      active,
      style: {
        display: "flex", alignItems: "center", gap: 10,
        padding: "8px 10px", marginBottom: 1,
        textDecoration: "none", borderRadius: 6,
        fontFamily: "'Inter', system-ui, sans-serif",
        fontSize: 13, fontWeight: active ? 500 : 400,
        color: active ? "#3d7a2b" : "#4b5563",
        background: active ? "#f0f7ed" : "transparent",
        borderLeft: `2px solid ${active ? "#3d7a2b" : "transparent"}`,
        transition: "color 0.13s, background 0.13s",
      }
    }
  }

  const renderLinks = (items) =>
    items.map(({ label, href, icon: NavIcon }) => {
      const { active, style } = navLinkStyle(href)
      return (
        <Link
          key={href}
          href={href}
          style={style}
          onMouseEnter={(e) => {
            if (!active) {
              e.currentTarget.style.color = "#1a1f0e"
              e.currentTarget.style.background = "#f7f8f4"
            }
          }}
          onMouseLeave={(e) => {
            if (!active) {
              e.currentTarget.style.color = "#4b5563"
              e.currentTarget.style.background = "transparent"
            }
          }}
        >
          <span style={{ flexShrink: 0, color: active ? "#3d7a2b" : "#9ca3af" }}>
            <NavIcon />
          </span>
          {label}
        </Link>
      )
    })

  const renderAdminNav = () => {
    const groups = []
    const seen   = new Set()
    links.forEach((l) => {
      if (!seen.has(l.group)) { seen.add(l.group); groups.push(l.group) }
    })
    return groups.map((group) => (
      <div key={group} style={{ marginBottom: 4 }}>
        <p style={{
          fontFamily: "'DM Mono', monospace", fontSize: 9,
          textTransform: "uppercase", letterSpacing: "0.16em",
          color: "#b8bead", margin: "10px 0 4px", padding: "0 10px",
        }}>
          {group}
        </p>
        {renderLinks(links.filter((l) => l.group === group))}
      </div>
    ))
  }

  const settingsActive = pathname === "/settings"

  return (
    <aside style={{
      width: 228, minWidth: 228, height: "100vh",
      background: "#ffffff", borderRight: "1px solid #e8ebe3",
      display: "flex", flexDirection: "column",
    }}>

      {/* Logo bar */}
      <div style={{
        height: 60, display: "flex", alignItems: "center",
        padding: "0 20px", borderBottom: "1px solid #e8ebe3",
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{
            width: 30, height: 30, background: "#3d7a2b",
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontSize: 10, fontWeight: 600, flexShrink: 0,
            clipPath: "polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)",
            fontFamily: "'DM Mono', monospace",
          }}>
            SB
          </span>
          <span style={{
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: 17, color: "#1a1f0e", letterSpacing: "-0.3px",
          }}>
            StockBridge
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "12px 8px", overflowY: "auto" }}>
        {isAdmin ? renderAdminNav() : (
          <>
            <p style={{
              fontFamily: "'DM Mono', monospace", fontSize: 9,
              textTransform: "uppercase", letterSpacing: "0.16em",
              color: "#b8bead", margin: "0 0 6px", padding: "0 10px",
            }}>
              Menu
            </p>
            {renderLinks(links)}
          </>
        )}

        {/* Settings */}
        <div style={{ marginTop: 8, borderTop: "1px solid #e8ebe3", paddingTop: 8 }}>
          <Link
            href="/settings"
            style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "8px 10px", textDecoration: "none", borderRadius: 6,
              fontFamily: "'Inter', system-ui, sans-serif", fontSize: 13,
              fontWeight: settingsActive ? 500 : 400,
              color: settingsActive ? "#3d7a2b" : "#4b5563",
              background: settingsActive ? "#f0f7ed" : "transparent",
              borderLeft: `2px solid ${settingsActive ? "#3d7a2b" : "transparent"}`,
              transition: "color 0.13s, background 0.13s",
            }}
            onMouseEnter={(e) => {
              if (!settingsActive) {
                e.currentTarget.style.color = "#1a1f0e"
                e.currentTarget.style.background = "#f7f8f4"
              }
            }}
            onMouseLeave={(e) => {
              if (!settingsActive) {
                e.currentTarget.style.color = "#4b5563"
                e.currentTarget.style.background = "transparent"
              }
            }}
          >
            <span style={{ flexShrink: 0, color: settingsActive ? "#3d7a2b" : "#9ca3af" }}>
              <SettingsIcon />
            </span>
            Settings
          </Link>
        </div>
      </nav>

      {/* User strip — avatar + full name + role badge */}
      <div style={{
        flexShrink: 0, padding: "12px 16px",
        borderTop: "1px solid #e8ebe3", background: "#f9faf7",
        display: "flex", alignItems: "center", gap: 10,
      }}>
        {/* Avatar circle */}
        <span style={{
          width: 32, height: 32, borderRadius: "50%",
          background: "#e4f0df", color: "#3d7a2b",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "'DM Mono', monospace", fontSize: 12, fontWeight: 600,
          flexShrink: 0,
        }}>
          {initial}
        </span>

        {/* Name + role */}
        <div style={{ minWidth: 0 }}>
          <p style={{
            fontFamily: "'Inter', system-ui, sans-serif", fontSize: 13,
            fontWeight: 500, color: "#1a1f0e", margin: "0 0 3px",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {displayName}
          </p>
          <span style={{
            fontFamily: "'DM Mono', monospace", fontSize: 9,
            textTransform: "uppercase", letterSpacing: "0.14em",
            color: "#3d7a2b", background: "#e4f0df",
            padding: "2px 7px", borderRadius: 3, display: "inline-block",
          }}>
            {roleLabel}
          </span>
        </div>
      </div>

    </aside>
  )
}