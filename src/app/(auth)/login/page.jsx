"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import toast from "react-hot-toast"
import { saveToken } from "@/lib/auth/tokens"        // ← new in-memory store
import { useAuthContext } from "@/lib/context/AuthContext"
import { ROLE_HOME } from "@/lib/utils/constants"
import { jwtDecode } from "jwt-decode"

export default function LoginPage() {
  const router      = useRouter()
  const { setUser } = useAuthContext()
  const [form,    setForm]    = useState({ email: "", password: "" })
  const [loading, setLoading] = useState(false)
  const [showPw,  setShowPw]  = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(form),
        credentials: "include",   // ← critical: lets browser store the httpOnly refresh_token cookie
      })
      if (!res.ok) throw new Error("Invalid email or password")

      const data    = await res.json()
      const decoded = jwtDecode(data.token)

      // Save access token in memory (replaces old cookie approach)
      saveToken(data.token)

      setUser({
        sub:        decoded.sub,
        role:       data.role,
        email:      data.email,
        fullName:   data.fullName,
        branchId:   data.branchId,
        branchName: data.branchName,
      })

      const destination = ROLE_HOME[data.role]
      if (!destination) { toast.error(`No dashboard for role: ${data.role}`); return }

      toast.success(`Welcome, ${data.fullName || data.email}!`)
      router.push(destination)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@300;400;500&display=swap');`}</style>

      <div style={{
        width: "100%", maxWidth: 420,
        background: "#fff", border: "1px solid #dde0d4",
        fontFamily: "'DM Mono', monospace",
      }}>

        {/* Header */}
        <div style={{ padding: "28px 32px 24px", borderBottom: "1px solid #dde0d4" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 20 }}>
            <span style={{
              width: 30, height: 30, background: "#3d7a2b", flexShrink: 0,
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontSize: 10, fontWeight: 500,
              clipPath: "polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)",
            }}>SB</span>
            <span style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 18, color: "#1a1f0e" }}>
              StockBridge
            </span>
          </div>
          <h1 style={{
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: 26, lineHeight: 1.2, color: "#1a1f0e", margin: "0 0 6px",
          }}>
            Sign in to your account
          </h1>
          <p style={{ fontSize: 12, color: "#6b7260", margin: 0 }}>
            Multi-branch inventory &amp; transfer management
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: "24px 32px 28px", display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Email */}
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <label style={labelStyle}>Email</label>
            <input
              suppressHydrationWarning
              type="email" required placeholder="you@company.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              autoComplete="username"
              style={inputStyle}
              onFocus={(e) => { e.target.style.borderColor = "#3d7a2b"; e.target.style.background = "#fff" }}
              onBlur={(e)  => { e.target.style.borderColor = "#dde0d4"; e.target.style.background = "#f7f8f4" }}
            />
          </div>

          {/* Password */}
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label style={labelStyle}>Password</label>
              <Link
                href="/forgot-password"
                style={{ fontSize: 11, color: "#6b7260", textDecoration: "none", fontFamily: "'DM Mono', monospace" }}
                onMouseEnter={(e) => e.currentTarget.style.color = "#3d7a2b"}
                onMouseLeave={(e) => e.currentTarget.style.color = "#6b7260"}
              >
                Forgot password?
              </Link>
            </div>
            <div style={{ position: "relative" }}>
              <input
                suppressHydrationWarning
                type={showPw ? "text" : "password"} required placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                autoComplete="current-password"
                style={{ ...inputStyle, paddingRight: 52 }}
                onFocus={(e) => { e.target.style.borderColor = "#3d7a2b"; e.target.style.background = "#fff" }}
                onBlur={(e)  => { e.target.style.borderColor = "#dde0d4"; e.target.style.background = "#f7f8f4" }}
              />
              <button
                suppressHydrationWarning
                type="button" onClick={() => setShowPw(v => !v)}
                style={{
                  position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer",
                  fontSize: 11, color: "#9a9e8f", fontFamily: "'DM Mono', monospace",
                  textTransform: "uppercase", letterSpacing: "0.06em",
                }}
              >
                {showPw ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            suppressHydrationWarning
            type="submit" disabled={loading}
            style={{
              marginTop: 6,
              background: loading ? "#5a9e46" : "#3d7a2b",
              color: "#fff", border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              fontFamily: "'DM Mono', monospace", fontSize: 12,
              textTransform: "uppercase", letterSpacing: "0.1em",
              padding: "12px 0", opacity: loading ? 0.7 : 1,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}
            onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = "#2a5a1e" }}
            onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = "#3d7a2b" }}
          >
            {loading ? "Signing in…" : (
              <>
                Access dashboard
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                </svg>
              </>
            )}
          </button>

        </form>

        {/* Footer */}
        <div style={{
          borderTop: "1px solid #dde0d4", padding: "12px 32px",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <span style={{ fontSize: 11, color: "#6b7260" }}>Need access?</span>
          <span style={{ fontSize: 11, color: "#3d7a2b", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Contact administrator
          </span>
        </div>

      </div>
    </>
  )
}

const labelStyle = {
  fontFamily: "'DM Mono', monospace", fontSize: 10,
  textTransform: "uppercase", letterSpacing: "0.12em", color: "#6b7260",
}
const inputStyle = {
  width: "100%", boxSizing: "border-box",
  fontFamily: "'DM Mono', monospace", fontSize: 13,
  background: "#f7f8f4", border: "1px solid #dde0d4",
  padding: "10px 14px", color: "#1a1f0e", outline: "none",
  transition: "border-color 0.15s",
}
