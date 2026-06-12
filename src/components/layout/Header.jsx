"use client"
import { useState, useRef, useEffect } from "react"
import { useAuthContext } from "@/lib/context/AuthContext"
import { NotificationDropdown } from "@/components/layout/NotificationDropdown"

function LogOutIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  )
}
function BellIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  )
}
function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  )
}

export default function Header({ notifications = [], onMarkAllRead, onMarkRead, onMenuClick }) {
  const { user, logout } = useAuthContext()
  const [bellOpen, setBellOpen] = useState(false)
  const bellRef = useRef(null)
  const unreadCount = notifications.filter(n => !n.read).length

  // Resolve name — tries every field the JWT might use
  const displayName = user?.fullName || user?.full_name || user?.name || user?.username || user?.sub || "—"
  const initial     = displayName.charAt(0).toUpperCase()

  useEffect(() => {
    if (!bellOpen) return
    const handler = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target)) setBellOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [bellOpen])

  return (
    <header style={{
      height: 60,
      background: "#fff",
      borderBottom: "1px solid #dde0d4",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 28px",
      flexShrink: 0,
      gap: 16,
    }}>

      {/* Mobile menu toggle */}
      <button
        onClick={onMenuClick}
        className="menu-toggle"
        aria-label="Toggle menu"
        style={{
          background: "none",
          border: "1px solid #e8ebe3",
          cursor: "pointer",
          padding: "6px 8px",
          borderRadius: 6,
          color: "#6b7260",
        }}
      >
        <MenuIcon />
      </button>

      {/* Right-side controls */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginLeft: "auto" }}>

        {/* Notification bell */}
        <div ref={bellRef} style={{ position: "relative" }}>
          <button
            onClick={() => setBellOpen(o => !o)}
            aria-label="Notifications"
            style={{
              position: "relative",
              background: bellOpen ? "#f0f7ed" : "none",
              border: "1px solid #e8ebe3",
              cursor: "pointer",
              padding: "6px 8px",
              borderRadius: 6,
              color: bellOpen ? "#3d7a2b" : "#6b7260",
              display: "flex",
              alignItems: "center",
              transition: "color 0.13s, background 0.13s",
            }}
            onMouseEnter={e => {
              if (!bellOpen) {
                e.currentTarget.style.background = "#f7f8f4"
                e.currentTarget.style.color = "#1a1f0e"
              }
            }}
            onMouseLeave={e => {
              if (!bellOpen) {
                e.currentTarget.style.background = "none"
                e.currentTarget.style.color = "#6b7260"
              }
            }}
          >
            <BellIcon />
            {unreadCount > 0 && (
              <span style={{
                position: "absolute",
                top: 2, right: 2,
                width: 7, height: 7,
                background: "#e24b4a",
                borderRadius: "50%",
                border: "2px solid #fff",
              }} />
            )}
          </button>

          {bellOpen && (
            <div style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, zIndex: 1000 }}>
              <NotificationDropdown
                notifications={notifications}
                onMarkAllRead={() => { onMarkAllRead?.(); setBellOpen(false) }}
                onMarkRead={onMarkRead}
                onClose={() => setBellOpen(false)}
              />
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="header-divider" style={{ width: 1, height: 20, background: "#dde0d4" }} />

        {/* Avatar + Name */}
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <span style={{
            width: 30, height: 30, borderRadius: "50%",
            background: "#e4f0df", color: "#3d7a2b",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "'DM Mono', monospace", fontSize: 11, fontWeight: 600,
            flexShrink: 0,
          }}>
            {initial}
          </span>
          <span className="header-username" style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 12,
            color: "#1a1f0e",
            letterSpacing: "0.02em",
            maxWidth: 160,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}>
            {displayName}
          </span>
        </div>

        {/* Divider */}
        <div className="header-divider" style={{ width: 1, height: 20, background: "#dde0d4" }} />

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
          <span className="header-signout-label">Sign out</span>
        </button>

      </div>

    </header>
  )
}
