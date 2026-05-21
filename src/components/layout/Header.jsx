"use client"
import { useAuthContext } from "@/lib/context/AuthContext"

// ── SVG icons ─────────────────────────────────────────────────────────────────
function LogOutIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  )
}

function UserIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

export default function Header() {
  const { user, logout } = useAuthContext()

  return (
    <header style={{
      height: 60,
      background: "#fff",
      borderBottom: "1px solid #dde0d4",
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-end",
      padding: "0 28px",
      flexShrink: 0,
      gap: 16,
    }}>

      {/* User info */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        color: "#6b7260",
      }}>
        <UserIcon />
        <span style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: 12,
          color: "#1a1f0e",
          letterSpacing: "0.02em",
        }}>
          {user?.email || user?.sub}
        </span>
      </div>

      {/* Divider */}
      <div style={{ width: 1, height: 20, background: "#dde0d4" }} />

      {/* Logout */}
      <button
        onClick={logout}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 7,
          background: "none",
          border: "none",
          cursor: "pointer",
          fontFamily: "'DM Mono', monospace",
          fontSize: 11,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          color: "#6b7260",
          padding: "6px 10px",
          transition: "color 0.13s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = "#dc2626"
          e.currentTarget.querySelector("svg").style.stroke = "#dc2626"
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = "#6b7260"
          e.currentTarget.querySelector("svg").style.stroke = "currentColor"
        }}
      >
        <LogOutIcon />
        Sign out
      </button>

    </header>
  )
}