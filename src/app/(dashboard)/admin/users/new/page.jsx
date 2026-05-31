"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api/client"
import toast from "react-hot-toast"
import PageHeader from "@/components/ui/PageHeader"

const ROLES = [
  { value: "STAFF",      label: "Branch Staff" },
  { value: "MANAGER",    label: "Branch Manager" },
  { value: "HO_ADMIN",   label: "Head Office Admin" },
  { value: "ACCOUNTANT", label: "Accountant" },
  { value: "ADMIN",      label: "System Admin" },
]

const BRANCHES = [
  "Kigali HQ", "Huye Branch", "Musanze Branch", "Rubavu Branch", "Nyagatare Branch",
]

function genPassword() {
  const c = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#"
  return Array.from({ length: 10 }, () => c[Math.floor(Math.random() * c.length)]).join("")
}

const SENDING_STEPS = [
  "Creating account...",
  "Saving credentials...",
  "Sending confirmation email...",
  "Done!",
]

// ── Sent banner shown after creation ─────────────────────────────────────────
function SentBanner({ user, onViewEmail, emailVisible }) {
  return (
    <div style={{
      background: "var(--color-background-success, #f0fdf4)",
      border: "1px solid var(--color-border-success, #bbf7d0)",
      borderRadius: 10, padding: "14px 18px",
      display: "flex", alignItems: "flex-start", gap: 12,
    }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" style={{ flexShrink: 0, marginTop: 2 }}>
        <circle cx="12" cy="12" r="10"/><path d="M9 12l2 2 4-4"/>
      </svg>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#166534", marginBottom: 4 }}>
          Password sent to{" "}
          <span style={{ fontFamily: "monospace", fontWeight: 400 }}>{user.email}</span>
        </div>
        <div style={{ fontSize: 12, color: "#166534", opacity: 0.8, lineHeight: 1.6 }}>
          A temporary password has been emailed to this address.
          The user can log in immediately and will be asked to set a new password on first sign-in.
        </div>
        {!emailVisible && (
          <button
            onClick={onViewEmail}
            style={{
              marginTop: 8, background: "none", border: "none", cursor: "pointer",
              fontSize: 12, color: "#166534", textDecoration: "underline",
              textUnderlineOffset: 2, padding: 0, fontFamily: "inherit",
              display: "flex", alignItems: "center", gap: 5,
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 7l10 7 10-7"/></svg>
            Click to view the email that was sent
          </button>
        )}
      </div>
    </div>
  )
}

// ── Inbox simulation ──────────────────────────────────────────────────────────
function EmailInbox({ user }) {
  const now    = new Date()
  const ts     = now.toLocaleDateString([], { day: "numeric", month: "short", year: "numeric" })
             + " " + now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  const first  = user.name.split(" ")[0]
  const role   = ROLES.find(r => r.value === user.role)?.label ?? user.role

  return (
    <div style={{ border: "1px solid #e8ebe3", borderRadius: 10, overflow: "hidden" }}>
      {/* window chrome */}
      <div style={{ background: "#f7f8f4", borderBottom: "1px solid #e8ebe3", padding: "8px 14px", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ display: "flex", gap: 5 }}>
          {["#f09595","#EF9F27","#97C459"].map(c => (
            <span key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c, display: "inline-block" }} />
          ))}
        </div>
        <div style={{ flex: 1, textAlign: "center", fontSize: 11, color: "#9ca3af", fontFamily: "monospace" }}>
          {user.email} — Inbox
        </div>
      </div>

      <div style={{ display: "flex", minHeight: 420 }}>
        {/* sidebar */}
        <div style={{ width: 156, flexShrink: 0, borderRight: "1px solid #e8ebe3", background: "#fff", padding: "10px 0" }}>
          {[
            { icon: "M22 7l-9.17 6.5a2 2 0 01-2.34 0L2 7", label: "Inbox", active: true, pip: true },
            { icon: "M22 2L11 13", label: "Sent" },
            { icon: "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z", label: "Drafts" },
            { icon: "M21 8V5a2 2 0 00-2-2H5a2 2 0 00-2 2v3m18 0H3m18 0v11a2 2 0 01-2 2H5a2 2 0 01-2-2V8", label: "Archive" },
          ].map(item => (
            <div key={item.label} style={{
              display: "flex", alignItems: "center", gap: 8, padding: "8px 14px",
              fontSize: 12, color: item.active ? "#1a1f0e" : "#6b7280",
              fontWeight: item.active ? 600 : 400,
              background: item.active ? "#f7f8f4" : "transparent", cursor: "pointer",
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d={item.icon}/>
              </svg>
              {item.label}
              {item.pip && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#378ADD", marginLeft: "auto" }} />}
            </div>
          ))}
        </div>

        {/* email list */}
        <div style={{ width: 200, flexShrink: 0, borderRight: "1px solid #e8ebe3" }}>
          <div style={{ padding: "7px 12px", fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: ".06em", borderBottom: "1px solid #f3f4f0", background: "#fafaf8" }}>
            Inbox — 1 new
          </div>
          {/* new email row */}
          <div style={{ padding: "10px 12px", borderBottom: "1px solid #f3f4f0", background: "#f7f8f4", cursor: "pointer" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: "#1a1f0e" }}>noreply@branchinv.rw</span>
              <span style={{ fontSize: 10, color: "#9ca3af", fontFamily: "monospace" }}>Just now</span>
            </div>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#1a1f0e", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              Your account is ready
            </div>
            <div style={{ fontSize: 10, color: "#9ca3af", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              Hi {first} — your account has been...
            </div>
          </div>
          {/* filler rows */}
          {[
            { from: "hr@company.rw", sub: "Welcome to the team", pre: "We are excited to have you...", t: "Yesterday" },
            { from: "it@company.rw", sub: "IT onboarding checklist", pre: "Please complete the steps...", t: "2 days ago" },
          ].map(r => (
            <div key={r.from} style={{ padding: "10px 12px", borderBottom: "1px solid #f3f4f0", cursor: "pointer", opacity: .45 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                <span style={{ fontSize: 11, color: "#6b7280" }}>{r.from}</span>
                <span style={{ fontSize: 10, color: "#9ca3af", fontFamily: "monospace" }}>{r.t}</span>
              </div>
              <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 2 }}>{r.sub}</div>
              <div style={{ fontSize: 10, color: "#9ca3af" }}>{r.pre}</div>
            </div>
          ))}
        </div>

        {/* reading pane */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {/* email header */}
          <div style={{ padding: "14px 18px 12px", borderBottom: "1px solid #f3f4f0", flexShrink: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#1a1f0e", marginBottom: 8 }}>
              Your account is ready — Branch Inventory System
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#E6F1FB", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#0C447C", flexShrink: 0 }}>
                BI
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#1a1f0e" }}>Branch Inventory System</div>
                <div style={{ fontSize: 11, color: "#9ca3af", fontFamily: "monospace" }}>noreply@branchinv.rw</div>
              </div>
              <div style={{ marginLeft: "auto", fontSize: 11, color: "#9ca3af", fontFamily: "monospace" }}>{ts}</div>
            </div>
          </div>

          {/* email body */}
          <div style={{ padding: "18px 20px", overflowY: "auto", flex: 1 }}>
            <div style={{ maxWidth: 460 }}>
              {/* logo */}
              <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 18, paddingBottom: 14, borderBottom: "1px solid #f3f4f0" }}>
                <div style={{ width: 28, height: 28, borderRadius: 6, background: "#1a1f0e", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#1a1f0e" }}>Branch Inventory System</div>
                  <div style={{ fontSize: 11, color: "#9ca3af" }}>Multi-Branch Transfer Management</div>
                </div>
              </div>

              <p style={{ fontSize: 14, color: "#1a1f0e", marginBottom: 10, lineHeight: 1.6 }}>Hi {first},</p>
              <p style={{ fontSize: 12, color: "#6b7280", marginBottom: 14, lineHeight: 1.7 }}>
                Your account has been set up by a system administrator. You can log in right away using the credentials below.
                You will be asked to choose a new password the first time you sign in.
              </p>

              {/* credentials */}
              <div style={{ background: "#f7f8f4", border: "1px solid #e8ebe3", borderRadius: 8, padding: "12px 14px", marginBottom: 14 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 10 }}>
                  Your login details
                </div>
                {[
                  ["Email",    user.email],
                  ["Password", user.password],
                  ["Role",     role],
                  ...(user.branch ? [["Branch", user.branch]] : []),
                ].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
                    <span style={{ fontSize: 11, color: "#9ca3af", width: 64, flexShrink: 0 }}>{k}</span>
                    <span style={{ fontSize: 11, color: "#1a1f0e", fontFamily: "monospace", background: "#fff", border: "1px solid #e8ebe3", borderRadius: 4, padding: "2px 7px" }}>{v}</span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "#1a1f0e", color: "#fff", borderRadius: 8, padding: "8px 16px", fontSize: 12, fontWeight: 600, marginBottom: 14 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3"/></svg>
                Sign in to your account
              </div>

              <p style={{ fontSize: 11, color: "#9ca3af", lineHeight: 1.6, paddingTop: 12, borderTop: "1px solid #f3f4f0", marginBottom: 12 }}>
                If you did not expect this email, please contact your system administrator immediately.
                Do not share your password with anyone.
              </p>
              <div style={{ fontSize: 11, color: "#b5bdb0", lineHeight: 1.7, paddingTop: 12, borderTop: "1px solid #f3f4f0" }}>
                This is an automated message — please do not reply.<br />
                &copy; {now.getFullYear()} Branch Inventory System. All rights reserved.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function NewUserPage() {
  const router = useRouter()
  const [form, setForm]         = useState({ name: "", email: "", role: "", branch: "", password: genPassword() })
  const [errors, setErrors]     = useState({})
  const [step, setStep]         = useState("form")   // form | sending | done
  const [sendingMsg, setSendingMsg] = useState("")
  const [createdUser, setCreatedUser] = useState(null)
  const [showEmail, setShowEmail]     = useState(false)

  function set(k, v) {
    setForm(p => ({ ...p, [k]: v }))
    setErrors(p => ({ ...p, [k]: "" }))
  }

  function validate() {
    const e = {}
    if (!form.name.trim())                                       e.name    = "Name is required"
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email   = "Enter a valid email"
    if (!form.role)                                              e.role    = "Role is required"
    setErrors(e)
    return !Object.keys(e).length
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return
    setStep("sending")
    let i = 0
    setSendingMsg(SENDING_STEPS[0])
    const iv = setInterval(() => {
      i++
      if (i < SENDING_STEPS.length - 1) {
        setSendingMsg(SENDING_STEPS[i])
      } else {
        clearInterval(iv)
        createUser()
      }
    }, 650)
  }

  async function createUser() {
    try {
      await api.post("/admin/users", {
        name:     form.name,
        email:    form.email,
        password: form.password,
        role:     form.role,
        branchId: form.branch || undefined,
      })
      setCreatedUser({ ...form })
      setStep("done")
    } catch (err) {
      toast.error(err.message ?? "Failed to create user")
      setStep("form")
    }
  }

  const inp = (hasErr) => ({
    width: "100%", border: `1px solid ${hasErr ? "#fca5a5" : "#e8ebe3"}`,
    borderRadius: 8, padding: "8px 11px", fontSize: 13,
    color: "#1a1f0e", outline: "none", fontFamily: "inherit", background: "#fff",
  })

  // ── form ────────────────────────────────────────────────────────────────
  if (step === "form") return (
    <div style={{ maxWidth: 600, display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader title="Create user" subtitle="A welcome email with login credentials will be sent after the account is created." />
      <div style={{ background: "#fff", border: "1px solid #e8ebe3", borderRadius: 10, padding: "1.5rem", display: "flex", flexDirection: "column", gap: 14 }}>
        <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {[["Full name","name","text","e.g. Alice Uwimana"],["Email address","email","email","alice@company.rw"]].map(([label,k,type,ph]) => (
              <div key={k}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 5 }}>{label}</label>
                <input type={type} value={form[k]} placeholder={ph} onChange={e => set(k, e.target.value)} style={inp(errors[k])} />
                {errors[k] && <span style={{ fontSize: 11, color: "#dc2626", display: "block", marginTop: 3 }}>{errors[k]}</span>}
              </div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 5 }}>Role</label>
              <select value={form.role} onChange={e => set("role", e.target.value)} style={{ ...inp(errors.role), appearance: "none" }}>
                <option value="">Select a role</option>
                {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
              {errors.role && <span style={{ fontSize: 11, color: "#dc2626", display: "block", marginTop: 3 }}>{errors.role}</span>}
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 5 }}>Branch</label>
              <select value={form.branch} onChange={e => set("branch", e.target.value)} style={{ ...inp(false), appearance: "none" }}>
                <option value="">No branch assigned</option>
                {BRANCHES.map(b => <option key={b}>{b}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 5 }}>Temporary password</label>
            <div style={{ display: "flex", gap: 8 }}>
              <input value={form.password} onChange={e => set("password", e.target.value)} style={{ ...inp(false), flex: 1, fontFamily: "monospace" }} />
              <button type="button" onClick={() => set("password", genPassword())} style={{ background: "transparent", border: "1px solid #e8ebe3", borderRadius: 8, padding: "8px 13px", fontSize: 12, cursor: "pointer", color: "#6b7280", whiteSpace: "nowrap" }}>
                Regenerate
              </button>
            </div>
            <span style={{ fontSize: 11, color: "#9ca3af", display: "block", marginTop: 4 }}>User must change this on first login.</span>
          </div>
          <div style={{ display: "flex", gap: 10, paddingTop: 4 }}>
            <button type="submit" style={{ background: "#1a1f0e", color: "#fff", border: "none", borderRadius: 8, padding: "9px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 7 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
              Create user
            </button>
            <button type="button" onClick={() => router.back()} style={{ background: "transparent", border: "1px solid #e8ebe3", borderRadius: 8, padding: "9px 16px", fontSize: 13, cursor: "pointer", color: "#6b7280" }}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )

  // ── sending ─────────────────────────────────────────────────────────────
  if (step === "sending") return (
    <div style={{ maxWidth: 600, display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader title="Create user" subtitle="" />
      <div style={{ background: "#fff", border: "1px solid #e8ebe3", borderRadius: 10, padding: "3rem", display: "flex", flexDirection: "column", alignItems: "center", gap: 16, textAlign: "center" }}>
        <div style={{ width: 36, height: 36, border: "2.5px solid #e8ebe3", borderTopColor: "#1a1f0e", borderRadius: "50%", animation: "spin .7s linear infinite" }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <div style={{ fontSize: 14, color: "#6b7280" }}>{sendingMsg}</div>
      </div>
    </div>
  )

  // ── done ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ maxWidth: 720, display: "flex", flexDirection: "column", gap: 16 }}>
      <PageHeader title="User created" subtitle="The account is active and the confirmation email has been delivered." />

      <SentBanner user={createdUser} onViewEmail={() => setShowEmail(true)} emailVisible={showEmail} />

      {showEmail && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ fontSize: 12, color: "#6b7280", display: "flex", alignItems: "center", gap: 7 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 7l10 7 10-7"/></svg>
            Showing what landed in <strong style={{ fontFamily: "monospace", fontWeight: 400, marginLeft: 4 }}>{createdUser.email}</strong>
          </div>
          <EmailInbox user={createdUser} />
        </div>
      )}

      <button
        onClick={() => { setForm({ name: "", email: "", role: "", branch: "", password: genPassword() }); setErrors({}); setCreatedUser(null); setShowEmail(false); setStep("form") }}
        style={{ alignSelf: "flex-start", background: "transparent", border: "1px solid #e8ebe3", borderRadius: 8, padding: "8px 16px", fontSize: 13, cursor: "pointer", color: "#6b7280", display: "flex", alignItems: "center", gap: 6 }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Create another user
      </button>
    </div>
  )
}