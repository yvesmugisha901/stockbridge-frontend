"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthContext } from "@/lib/context/AuthContext"
import Sidebar from "@/components/layout/Sidebar"
import Header  from "@/components/layout/Header"

export default function DashboardLayout({ children }) {
  const { user, loading } = useAuthContext()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) router.push("/login")
  }, [user, loading, router])

  if (loading || !user) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f7f8f4",
      }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          {/* spinner */}
          <div style={{
            width: 28, height: 28,
            border: "2.5px solid #dde0d4",
            borderTopColor: "#3d7a2b",
            borderRadius: "50%",
            animation: "sb-spin 0.7s linear infinite",
          }} />
          <span style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 11,
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            color: "#6b7260",
          }}>
            Loading…
          </span>
          <style>{`@keyframes sb-spin { to { transform: rotate(360deg) } }`}</style>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      display: "flex",
      height: "100vh",
      background: "#f7f8f4",
      overflow: "hidden",
    }}>
      <Sidebar />

      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        minWidth: 0,
      }}>
        <Header />

        <main style={{
          flex: 1,
          overflowY: "auto",
          padding: "32px 36px",
        }}>
          {children}
        </main>
      </div>
    </div>
  )
}