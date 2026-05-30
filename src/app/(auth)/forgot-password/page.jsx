"use client"
import { useState } from "react"
import Link from "next/link"

export default function ForgotPasswordPage() {
  const [email,     setEmail]     = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [error,     setError]     = useState("")

  function handleSubmit(e) {
    e.preventDefault()
    if (!email.trim() || !email.includes("@")) {
      setError("Enter a valid email address")
      return
    }
    // No backend endpoint yet — shows confirmation UI
    setSubmitted(true)
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
            {submitted ? "Check your email" : "Reset your password"}
          </h1>
          <p style={{ fontSize: 12, color: "#6b7260", margin: 0 }}>
            {submitted
              ? `We sent a reset link to ${email}`
              : "Enter your email and we will send you a reset link"}
          </p>
        </div>

        {/* Body */}
        <div style={{ padding: "24px 32px 28px" }}>
          {submitted ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{
                background: "#f0f7ed", border: "1px solid #c6dfc0",
                padding: "14px 16px", borderRadius: 6,
                display: "flex", gap: 10, alignItems: "flex-start",
              }}>
                <span style={{ color: "#3d7a2b", fontSize: 16, lineHeight: 1 }}>✓</span>
                <p style={{ margin: 0, fontSize: 12, color: "#3d7a2b", lineHeight: 1.5 }}>
                  If <strong>{email}</strong> is registered, a password reset link has been sent. Check your inbox and spam folder.
                </p>
              </div>
              <Link href="/login" style={backLinkStyle}>← Back to sign in</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <label style={labelStyle}>Email address</label>
                <input
                  type="email" placeholder="you@company.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError("") }}
                  style={{
                    ...inputStyle,
                    borderColor: error ? "#fca5a5" : "#dde0d4",
                    background:  error ? "#fef2f2" : "#f7f8f4",
                  }}
                  onFocus={(e) => { e.target.style.borderColor = "#3d7a2b"; e.target.style.background = "#fff" }}
                  onBlur={(e)  => {
                    e.target.style.borderColor = error ? "#fca5a5" : "#dde0d4"
                    e.target.style.background  = error ? "#fef2f2" : "#f7f8f4"
                  }}
                />
                {error && <span style={{ fontSize: 11, color: "#dc2626" }}>{error}</span>}
              </div>

              <button type="submit" style={submitBtnStyle}
                onMouseEnter={(e) => e.currentTarget.style.background = "#2a5a1e"}
                onMouseLeave={(e) => e.currentTarget.style.background = "#3d7a2b"}
              >
                Send reset link
              </button>

              <Link href="/login" style={backLinkStyle}>← Back to sign in</Link>
            </form>
          )}
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
}
const submitBtnStyle = {
  background: "#3d7a2b", color: "#fff", border: "none",
  padding: "12px 0", cursor: "pointer",
  fontFamily: "'DM Mono', monospace", fontSize: 12,
  textTransform: "uppercase", letterSpacing: "0.1em",
  transition: "background 0.15s",
}
const backLinkStyle = {
  display: "block", textAlign: "center",
  fontFamily: "'DM Mono', monospace", fontSize: 11,
  color: "#6b7260", textDecoration: "none",
}