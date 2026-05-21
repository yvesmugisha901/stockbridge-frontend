"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import toast from "react-hot-toast"
import { saveToken } from "@/lib/auth/session"
import { useAuthContext } from "@/lib/context/AuthContext"
import { ROLE_HOME } from "@/lib/utils/constants"
import { jwtDecode } from "jwt-decode"

export default function LoginPage() {
  const router         = useRouter()
  const { setUser }    = useAuthContext()
  const [form, setForm]       = useState({ email: "", password: "" })
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(form),
      })
      if (!res.ok) throw new Error("Invalid credentials")

      const data = await res.json()
      // data = { token, email, fullName, role: "ADMIN", branchId, branchName }

      // 1. Save token to storage
      saveToken(data.token)

      // 2. Build user object from response body (not JWT) — role is already clean e.g. "ADMIN"
      const decoded = jwtDecode(data.token)
      const userObj = {
        sub:        decoded.sub,
        role:       data.role,          // "ADMIN" — matches ROLES.ADMIN key
        email:      data.email,
        name:       data.fullName,
        branchId:   data.branchId,
        branchName: data.branchName,
      }

      // 3. Immediately update AuthContext so DashboardLayout doesn't see null user
      setUser(userObj)

      const destination = ROLE_HOME[data.role]
      if (!destination) {
        toast.error(`No dashboard configured for role: ${data.role}`)
        return
      }

      toast.success(`Welcome back, ${data.fullName || data.email}!`)
      router.push(destination)

    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const roles = ["Staff", "Manager", "HO Admin", "Accountant", "Sys Admin"]

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@300;400;500&display=swap');
      `}</style>

      <div
        className="bg-white w-full overflow-hidden"
        style={{ maxWidth: 480, border: "1px solid #dde0d4", fontFamily: "'DM Mono', 'Courier New', monospace" }}
      >

        {/* ── Header ── */}
        <div style={{ padding: "36px 40px 28px", borderBottom: "1px solid #dde0d4" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28, textDecoration: "none" }}>
            <span style={{
              width: 34, height: 34, background: "#3d7a2b",
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontSize: 11, fontWeight: 500, flexShrink: 0,
              clipPath: "polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)",
              fontFamily: "'DM Mono', monospace",
            }}>SB</span>
            <span style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 20, color: "#1a1f0e", letterSpacing: "-0.3px" }}>
              StockBridge
            </span>
          </Link>
          <h1 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 34, lineHeight: 1.1, letterSpacing: "-0.5px", color: "#1a1f0e", margin: "0 0 8px" }}>
            Stock moves.<br />
            <em style={{ fontStyle: "italic", color: "#3d7a2b" }}>Sign in.</em>
          </h1>
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, color: "#6b7260", margin: 0, letterSpacing: "0.02em" }}>
            Multi-branch inventory &amp; transfer management
          </p>
        </div>

        {/* ── Body ── */}
        <form onSubmit={handleSubmit} autoComplete="off" style={{ padding: "32px 40px 36px" }}>

          {/* Role pills */}
          <div style={{ marginBottom: 28 }}>
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.15em", color: "#6b7260", margin: "0 0 10px" }}>
              Sign in as
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {roles.map((r) => (
                <span key={r} style={{
                  fontFamily: "'DM Mono', monospace", fontSize: 10,
                  textTransform: "uppercase", letterSpacing: "0.1em",
                  padding: "5px 12px", border: "1px solid #dde0d4",
                  color: "#6b7260", background: "#f7f8f4", whiteSpace: "nowrap",
                }}>{r}</span>
              ))}
            </div>
          </div>

          {/* Email */}
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: "block", fontFamily: "'DM Mono', monospace", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.15em", color: "#6b7260", marginBottom: 6 }}>
              Email
            </label>
            <div style={{ position: "relative" }}>
              <svg style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#b8bead", pointerEvents: "none" }}
                width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <input type="email" required autoComplete="username" placeholder="you@company.com"
                value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                suppressHydrationWarning
                style={{ width: "100%", boxSizing: "border-box", fontFamily: "'DM Mono', monospace", fontSize: 13, background: "#f7f8f4", border: "1px solid #dde0d4", padding: "11px 14px 11px 36px", color: "#1a1f0e", outline: "none", transition: "border-color 0.15s" }}
                onFocus={(e) => { e.target.style.borderColor = "#3d7a2b"; e.target.style.background = "#fff" }}
                onBlur={(e)  => { e.target.style.borderColor = "#dde0d4"; e.target.style.background = "#f7f8f4" }}
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: 6 }}>
            <label style={{ display: "block", fontFamily: "'DM Mono', monospace", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.15em", color: "#6b7260", marginBottom: 6 }}>
              Password
            </label>
            <div style={{ position: "relative" }}>
              <svg style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#b8bead", pointerEvents: "none" }}
                width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <input type="password" required autoComplete="current-password" placeholder="••••••••"
                value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                suppressHydrationWarning
                style={{ width: "100%", boxSizing: "border-box", fontFamily: "'DM Mono', monospace", fontSize: 13, background: "#f7f8f4", border: "1px solid #dde0d4", padding: "11px 14px 11px 36px", color: "#1a1f0e", outline: "none", transition: "border-color 0.15s" }}
                onFocus={(e) => { e.target.style.borderColor = "#3d7a2b"; e.target.style.background = "#fff" }}
                onBlur={(e)  => { e.target.style.borderColor = "#dde0d4"; e.target.style.background = "#f7f8f4" }}
              />
            </div>
          </div>

          {/* Forgot */}
          <div style={{ textAlign: "right", marginBottom: 28, marginTop: 8 }}>
            <a href="#"
              style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#6b7260", textDecoration: "none", letterSpacing: "0.04em" }}
              onMouseEnter={(e) => e.target.style.color = "#3d7a2b"}
              onMouseLeave={(e) => e.target.style.color = "#6b7260"}
            >Forgot password?</a>
          </div>

          {/* Submit */}
          <button type="submit" disabled={loading} suppressHydrationWarning
            style={{
              width: "100%", background: loading ? "#5a9e46" : "#3d7a2b",
              color: "#fff", border: "none", cursor: loading ? "not-allowed" : "pointer",
              fontFamily: "'DM Mono', monospace", fontSize: 12, textTransform: "uppercase",
              letterSpacing: "0.1em", fontWeight: 500, padding: "14px 20px",
              display: "flex", alignItems: "center", justifyContent: "center",
              gap: 10, transition: "background 0.2s", opacity: loading ? 0.6 : 1,
            }}
            onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = "#2a5a1e" }}
            onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = "#3d7a2b" }}
          >
            {loading ? "Signing in\u2026" : (
              <>
                Access dashboard
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                </svg>
              </>
            )}
          </button>
        </form>

        {/* ── Footer ── */}
        <div style={{ borderTop: "1px solid #dde0d4", padding: "16px 40px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#6b7260" }}>
            Need access?
          </span>
          <a href="#"
            style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#3d7a2b", textDecoration: "none", textTransform: "uppercase", letterSpacing: "0.08em", display: "flex", alignItems: "center", gap: 4 }}
            onMouseEnter={(e) => e.currentTarget.style.color = "#2a5a1e"}
            onMouseLeave={(e) => e.currentTarget.style.color = "#3d7a2b"}
          >
            Contact administrator
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
            </svg>
          </a>
        </div>

      </div>
    </>
  )
}