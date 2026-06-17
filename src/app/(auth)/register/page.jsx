"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import toast from "react-hot-toast"

// ── Roles — must match Role enum values exactly ───────────────────────────
const ROLES = [
  { value: "STAFF",      label: "Staff"       },
  { value: "MANAGER",    label: "Manager"     },
  { value: "HO_ADMIN",   label: "HO Admin"    },
  { value: "ACCOUNTANT", label: "Accountant"  },
]
// ADMIN excluded — cannot self-register as admin
export default function RegisterPage() {
  const router = useRouter()
  const [step,     setStep]     = useState("form")
  const [loading,  setLoading]  = useState(false)
  const [showPw,   setShowPw]   = useState(false)
  const [showCpw,  setShowCpw]  = useState(false)
  const [branches, setBranches] = useState([])
  const [branchesLoading, setBranchesLoading] = useState(true)
  const [form, setForm] = useState({
    fullName: "", email: "", role: "", branchId: "", password: "", confirm: "",
  })
  const [errors, setErrors] = useState({})

  // ── Fetch branches on mount ───────────────────────────────────────────────
 // ── Fetch branches on mount ───────────────────────────────────────────────
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/branches`)
      .then(r => {
        if (!r.ok) throw new Error(`Failed to load branches: ${r.status}`)
        return r.json()
      })
      .then(data => {
        const list = data?.data
        setBranches(Array.isArray(list) ? list : [])
      })
      .catch((err) => {
        console.error(err)
        toast.error("Could not load branches. Please refresh.")
        setBranches([])
      })
      .finally(() => setBranchesLoading(false))
  }, [])

  // ── patch — update one form field and clear its error ────────────────────
  function patch(key, val) {
    setForm(f => ({ ...f, [key]: val }))
    setErrors(e => ({ ...e, [key]: undefined }))
  }

  function validate() {
    const e = {}
    if (!form.fullName.trim()) e.fullName = "Full name is required"
    if (!form.email.trim())    e.email    = "Email is required"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email"
    if (!form.role)            e.role     = "Select a role"
    if (!form.branchId)        e.branchId = "Select a branch"
    if (!form.password)        e.password = "Password is required"
    else if (form.password.length < 8) e.password = "At least 8 characters"
    if (form.confirm !== form.password) e.confirm = "Passwords do not match"
    return e
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.fullName,
          email:    form.email,
          role:     form.role,
          branchId: Number(form.branchId), // ← send as Long
          password: form.password,
        }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.message || "Registration failed. Try again.")
      }

      setStep("pending")
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  /* ── Pending screen ── */
  if (step === "pending") {
    return (
      <>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@300;400;500&display=swap');`}</style>
        <div style={{ width: "100%", maxWidth: 420, background: "#fff", border: "1px solid #dde0d4", fontFamily: "'DM Mono', monospace" }}>
          <div style={{ padding: "28px 32px 24px", borderBottom: "1px solid #dde0d4" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 20 }}>
              <span style={logoStyle}>SB</span>
              <span style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 18, color: "#1a1f0e" }}>StockBridge</span>
            </div>
          </div>
          <div style={{ padding: "32px 32px 36px", display: "flex", flexDirection: "column", alignItems: "center", gap: 20, textAlign: "center" }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#f0f7ed", border: "1.5px solid #b2d9a5", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3d7a2b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            <div>
              <h2 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 22, color: "#1a1f0e", margin: "0 0 8px" }}>Request submitted</h2>
              <p style={{ fontSize: 12, color: "#6b7260", margin: "0 0 4px", lineHeight: 1.6 }}>Your account is pending administrator approval.</p>
              <p style={{ fontSize: 12, color: "#6b7260", margin: 0, lineHeight: 1.6 }}>
                You'll receive an email at <strong style={{ color: "#1a1f0e" }}>{form.email}</strong> once access is granted.
              </p>
            </div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "#fef9ec", border: "1px solid #f5e0a0", padding: "7px 14px" }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#d4a017", flexShrink: 0 }} />
              <span style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.12em", color: "#a07010" }}>Awaiting activation</span>
            </div>
            <Link href="/login" style={{ marginTop: 4, fontSize: 11, color: "#6b7260", textDecoration: "none", textTransform: "uppercase", letterSpacing: "0.1em", display: "flex", alignItems: "center", gap: 6 }}
              onMouseEnter={(e) => e.currentTarget.style.color = "#3d7a2b"}
              onMouseLeave={(e) => e.currentTarget.style.color = "#6b7260"}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
              </svg>
              Back to sign in
            </Link>
          </div>
        </div>
      </>
    )
  }

  /* ── Registration form ── */
  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@300;400;500&display=swap');`}</style>

      <div style={{ width: "100%", maxWidth: 420, background: "#fff", border: "1px solid #dde0d4", fontFamily: "'DM Mono', monospace" }}>

        {/* Header */}
        <div style={{ padding: "28px 32px 24px", borderBottom: "1px solid #dde0d4" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 20 }}>
            <span style={logoStyle}>SB</span>
            <span style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 18, color: "#1a1f0e" }}>StockBridge</span>
          </div>
          <h1 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 26, lineHeight: 1.2, color: "#1a1f0e", margin: "0 0 6px" }}>
            Request account access
          </h1>
          <p style={{ fontSize: 12, color: "#6b7260", margin: 0 }}>
            Submit your details — an administrator will review and activate your account.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: "24px 32px 28px", display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Full Name */}
          <Field label="Full name" error={errors.fullName}>
            <input
              type="text" placeholder="Jane Doe" required
              value={form.fullName}
              onChange={(e) => patch("fullName", e.target.value)}
              style={{ ...inputStyle, borderColor: errors.fullName ? "#c0392b" : "#dde0d4" }}
              onFocus={(e) => { e.target.style.borderColor = errors.fullName ? "#c0392b" : "#3d7a2b"; e.target.style.background = "#fff" }}
              onBlur={(e)  => { e.target.style.borderColor = errors.fullName ? "#c0392b" : "#dde0d4"; e.target.style.background = "#f7f8f4" }}
            />
          </Field>

          {/* Email */}
          <Field label="Work email" error={errors.email}>
            <input
              type="email" placeholder="you@company.com" required
              value={form.email}
              onChange={(e) => patch("email", e.target.value)}
              autoComplete="username"
              style={{ ...inputStyle, borderColor: errors.email ? "#c0392b" : "#dde0d4" }}
              onFocus={(e) => { e.target.style.borderColor = errors.email ? "#c0392b" : "#3d7a2b"; e.target.style.background = "#fff" }}
              onBlur={(e)  => { e.target.style.borderColor = errors.email ? "#c0392b" : "#dde0d4"; e.target.style.background = "#f7f8f4" }}
            />
          </Field>

          {/* Role dropdown */}
          <Field label="Role" error={errors.role}>
            <select
              value={form.role}
              onChange={(e) => patch("role", e.target.value)}
              style={{ ...selectStyle, borderColor: errors.role ? "#c0392b" : "#dde0d4", color: form.role ? "#1a1f0e" : "#9a9e8f" }}
              onFocus={(e) => { e.target.style.borderColor = errors.role ? "#c0392b" : "#3d7a2b"; e.target.style.background = "#fff" }}
              onBlur={(e)  => { e.target.style.borderColor = errors.role ? "#c0392b" : "#dde0d4"; e.target.style.background = "#f7f8f4" }}
            >
              <option value="" disabled>Select a role…</option>
              {ROLES.map(r => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </Field>

          {/* Branch dropdown */}
          <Field label="Branch" error={errors.branchId}>
            <select
              value={form.branchId}
              onChange={(e) => patch("branchId", e.target.value)}
              disabled={branchesLoading}
              style={{ ...selectStyle, borderColor: errors.branchId ? "#c0392b" : "#dde0d4", color: form.branchId ? "#1a1f0e" : "#9a9e8f", opacity: branchesLoading ? 0.6 : 1 }}
              onFocus={(e) => { e.target.style.borderColor = errors.branchId ? "#c0392b" : "#3d7a2b"; e.target.style.background = "#fff" }}
              onBlur={(e)  => { e.target.style.borderColor = errors.branchId ? "#c0392b" : "#dde0d4"; e.target.style.background = "#f7f8f4" }}
            >
              <option value="" disabled>
                {branchesLoading ? "Loading branches…" : "Select a branch…"}
              </option>
              {branches.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </Field>

          {/* Divider */}
          <div style={{ borderTop: "1px solid #dde0d4", margin: "2px 0" }} />

          {/* Password */}
          <Field label="Password" error={errors.password}>
            <div style={{ position: "relative" }}>
              <input
                type={showPw ? "text" : "password"} placeholder="Min. 8 characters"
                value={form.password}
                onChange={(e) => patch("password", e.target.value)}
                autoComplete="new-password"
                style={{ ...inputStyle, paddingRight: 52, borderColor: errors.password ? "#c0392b" : "#dde0d4" }}
                onFocus={(e) => { e.target.style.borderColor = errors.password ? "#c0392b" : "#3d7a2b"; e.target.style.background = "#fff" }}
                onBlur={(e)  => { e.target.style.borderColor = errors.password ? "#c0392b" : "#dde0d4"; e.target.style.background = "#f7f8f4" }}
              />
              <TogglePw show={showPw} onToggle={() => setShowPw(v => !v)} />
            </div>
          </Field>

          {/* Confirm Password */}
          <Field label="Confirm password" error={errors.confirm}>
            <div style={{ position: "relative" }}>
              <input
                type={showCpw ? "text" : "password"} placeholder="Repeat password"
                value={form.confirm}
                onChange={(e) => patch("confirm", e.target.value)}
                autoComplete="new-password"
                style={{ ...inputStyle, paddingRight: 52, borderColor: errors.confirm ? "#c0392b" : "#dde0d4" }}
                onFocus={(e) => { e.target.style.borderColor = errors.confirm ? "#c0392b" : "#3d7a2b"; e.target.style.background = "#fff" }}
                onBlur={(e)  => { e.target.style.borderColor = errors.confirm ? "#c0392b" : "#dde0d4"; e.target.style.background = "#f7f8f4" }}
              />
              <TogglePw show={showCpw} onToggle={() => setShowCpw(v => !v)} />
            </div>
          </Field>

          {/* Notice */}
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start", background: "#f7f8f4", border: "1px solid #dde0d4", padding: "10px 12px" }}>
            <svg style={{ flexShrink: 0, marginTop: 1 }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6b7260" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span style={{ fontSize: 11, color: "#6b7260", lineHeight: 1.55 }}>
              Your account won't be active until an administrator reviews and approves your request.
            </span>
          </div>

          {/* Submit */}
          <button
            type="submit" disabled={loading || branchesLoading}
            style={{
              marginTop: 4, background: loading ? "#5a9e46" : "#3d7a2b",
              color: "#fff", border: "none", cursor: loading ? "not-allowed" : "pointer",
              fontFamily: "'DM Mono', monospace", fontSize: 12,
              textTransform: "uppercase", letterSpacing: "0.1em",
              padding: "12px 0", opacity: loading ? 0.7 : 1,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}
            onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = "#2a5a1e" }}
            onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = "#3d7a2b" }}
          >
            {loading ? "Submitting request…" : (
              <>
                Submit access request
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                </svg>
              </>
            )}
          </button>

        </form>

        {/* Footer */}
        <div style={{ borderTop: "1px solid #dde0d4", padding: "12px 32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 11, color: "#6b7260" }}>Already have access?</span>
          <Link href="/login" style={{ fontSize: 11, color: "#3d7a2b", textDecoration: "none", textTransform: "uppercase", letterSpacing: "0.08em" }}
            onMouseEnter={(e) => e.currentTarget.style.color = "#2a5a1e"}
            onMouseLeave={(e) => e.currentTarget.style.color = "#3d7a2b"}
          >
            Sign in →
          </Link>
        </div>

      </div>
    </>
  )
}

/* ── Small reusable components ── */

function Field({ label, error, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label style={labelStyle}>{label}</label>
      {children}
      {error && <span style={{ fontSize: 10, color: "#c0392b", letterSpacing: "0.04em" }}>{error}</span>}
    </div>
  )
}

function TogglePw({ show, onToggle }) {
  return (
    <button type="button" onClick={onToggle}
      style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 11, color: "#9a9e8f", fontFamily: "'DM Mono', monospace", textTransform: "uppercase", letterSpacing: "0.06em" }}
    >
      {show ? "Hide" : "Show"}
    </button>
  )
}

/* ── Styles ── */

const logoStyle = {
  width: 30, height: 30, background: "#3d7a2b", flexShrink: 0,
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  color: "#fff", fontSize: 10, fontWeight: 500,
  clipPath: "polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)",
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

const selectStyle = {
  ...inputStyle,
  appearance: "none", cursor: "pointer",
  backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%236b7260' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 14px center",
  paddingRight: 36,
}
