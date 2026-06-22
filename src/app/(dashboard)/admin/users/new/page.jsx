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

const SENDING_STEPS = [
  "Preparing account details…",
  "Encrypting credentials…",
  "Connecting to mail server…",
  "Sending via Gmail SMTP…",
]

function genPassword() {
  const c = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#"
  return Array.from({ length: 10 }, () => c[Math.floor(Math.random() * c.length)]).join("")
}

// ── Debug panel ────────────────────────────────────────────────────────────
function DebugPanel({ step, createdUser }) {
  return (
    <div style={{
      position: "fixed", bottom: 12, right: 12, zIndex: 9999,
      background: "#1a1f0e", color: "#a3e635",
      fontFamily: "'DM Mono', monospace", fontSize: 11,
      padding: "12px 16px", borderRadius: 6, maxWidth: 360,
      boxShadow: "0 4px 16px rgba(0,0,0,0.4)", lineHeight: 1.6,
      whiteSpace: "pre-wrap", wordBreak: "break-all",
    }}>
      <div style={{ color: "#fbbf24", fontWeight: 700, marginBottom: 6 }}>DEBUG</div>
      <div>step: <strong>{step}</strong></div>
      <div>createdUser: {createdUser ? "SET ✅" : "null ❌"}</div>
      {createdUser && (
        <div style={{ marginTop: 6, color: "#86efac" }}>
          {JSON.stringify(createdUser, null, 2)}
        </div>
      )}
    </div>
  )
}

// ── Full Gmail-style modal ────────────────────────────────────────────────────
function GmailModal({ user, branches, onClose }) {
  const [selected, setSelected] = useState("inbox")
  const now        = new Date()
  const ts         = now.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
                   + ", " + now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  const first      = user.name.split(" ")[0]
  const role       = ROLES.find(r => r.value === user.role)?.label ?? user.role
  const branchName = branches.find(b => String(b.id) === String(user.branch))?.name ?? user.branch ?? null

  const sidebarItems = [
    { id: "inbox",   icon: "M22 7l-9.17 6.5a2 2 0 01-2.34 0L2 7",                                                                          label: "Inbox",  count: 1 },
    { id: "starred", icon: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",                label: "Starred" },
    { id: "sent",    icon: "M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z",                                                                         label: "Sent" },
    { id: "drafts",  icon: "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z",                                                        label: "Drafts", count: 2 },
    { id: "trash",   icon: "M3 6h18M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2",                       label: "Trash" },
  ]

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(2px)" }}>
      <div style={{ width: "min(960px, calc(100vw - 24px))", height: "min(700px, calc(100vh - 40px))", background: "#f6f8fc", borderRadius: 8, boxShadow: "0 24px 80px rgba(0,0,0,0.35)", display: "flex", flexDirection: "column", overflow: "hidden", fontFamily: "'Google Sans', Roboto, sans-serif" }}>

        {/* ── Gmail top bar ── */}
        <div style={{ background: "#f6f8fc", borderBottom: "1px solid #e0e0e0", padding: "8px 16px", display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 3.5, cursor: "pointer", padding: "6px 8px" }}>
              {[0,1,2].map(i => <div key={i} style={{ width: 18, height: 2, background: "#444746", borderRadius: 1 }} />)}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 1 }}>
              {[["#4285F4","G"],["#EA4335","m"],["#FBBC04","a"],["#4285F4","i"],["#34A853","l"]].map(([c,l],i) => (
                <span key={i} style={{ color: c, fontSize: 22, fontWeight: i === 0 ? 700 : 400, lineHeight: 1, letterSpacing: -0.5 }}>{l}</span>
              ))}
            </div>
          </div>
          <div style={{ flex: 1, maxWidth: 680, background: "#eaf1fb", borderRadius: 24, padding: "8px 16px", display: "flex", alignItems: "center", gap: 10 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#444746" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            <span style={{ fontSize: 14, color: "#444746" }}>Search mail</span>
          </div>
          <div style={{ display: "flex", gap: 4, marginLeft: "auto" }}>
            {["M12 2a10 10 0 100 20A10 10 0 0012 2z M12 8v4l3 3", "M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"].map((d, i) => (
              <div key={i} style={{ width: 40, height: 40, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#444746" strokeWidth="1.5"><path d={d}/></svg>
              </div>
            ))}
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#1a73e8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 600, color: "#fff", cursor: "pointer", marginLeft: 4 }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>

        {/* ── body ── */}
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

          {/* sidebar */}
          <div style={{ width: 220, flexShrink: 0, background: "#f6f8fc", padding: "8px 0", overflowY: "auto" }}>
            <div style={{ margin: "8px 16px 16px", background: "#c2e7ff", borderRadius: 16, padding: "14px 20px", display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 14, fontWeight: 500, color: "#001d35" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="#001d35"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
              Compose
            </div>
            {sidebarItems.map(item => (
              <div key={item.id} onClick={() => setSelected(item.id)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 16px 8px 26px", borderRadius: "0 16px 16px 0", background: selected === item.id ? "#d3e3fd" : "transparent", cursor: "pointer", fontSize: 14, fontWeight: selected === item.id ? 700 : 400, color: "#202124", marginRight: 16 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={selected === item.id ? 2.5 : 1.8}><path d={item.icon}/></svg>
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.count && <span style={{ fontSize: 12, fontWeight: 700, color: selected === item.id ? "#202124" : "#444746" }}>{item.count}</span>}
              </div>
            ))}
          </div>

          {/* email list + reading pane */}
          <div style={{ flex: 1, display: "flex", overflow: "hidden", borderLeft: "1px solid #e0e0e0" }}>

            {/* email list */}
            <div style={{ width: 300, flexShrink: 0, background: "#fff", borderRight: "1px solid #e0e0e0", overflowY: "auto" }}>
              <div style={{ padding: "8px 12px", borderBottom: "1px solid #e0e0e0", display: "flex", alignItems: "center", gap: 8 }}>
                <input type="checkbox" style={{ width: 16, height: 16 }} />
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#444746" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
                <div style={{ width: 1, height: 20, background: "#e0e0e0", margin: "0 4px" }} />
                {["M4 6h16M4 12h16M4 18h16", "M3 6h18M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6", "M23 4l-2 16H3L1 4M12 4v8"].map((d, i) => (
                  <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#444746" strokeWidth="2"><path d={d}/></svg>
                ))}
              </div>

              {/* the email we sent — highlighted + unread */}
              <div style={{ padding: "12px 16px", borderBottom: "1px solid #f1f3f4", background: "#fff", cursor: "pointer", borderLeft: "4px solid #1a73e8" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#ea4335", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#fff", flexShrink: 0 }}>B</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#202124" }}>Branch Inventory</span>
                      <span style={{ fontSize: 11, color: "#5f6368", whiteSpace: "nowrap", marginLeft: 8 }}>{now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#202124", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Your account is ready ✓</div>
                    <div style={{ fontSize: 12, color: "#5f6368", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Hi {first} — your login credentials are...</div>
                  </div>
                </div>
              </div>

              {/* filler emails */}
              {[
                { name: "Google",     color: "#4285F4", initials: "G",  subject: "Security alert for your account", preview: "A new sign-in on Windows",        time: "9:14 AM"   },
                { name: "HR Team",    color: "#34a853", initials: "H",  subject: "Welcome to the company!",         preview: "We're excited to have you join...", time: "Yesterday" },
                { name: "IT Support", color: "#fbbc04", initials: "IT", subject: "IT equipment checklist",          preview: "Please complete your setup by...", time: "Mon"       },
                { name: "Payroll",    color: "#ea4335", initials: "P",  subject: "Your first payslip details",      preview: "Bank details required before...",  time: "Sun"       },
              ].map((m, i) => (
                <div key={i} style={{ padding: "10px 16px", borderBottom: "1px solid #f1f3f4", cursor: "pointer", opacity: 0.5 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: m.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff", flexShrink: 0 }}>{m.initials}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontSize: 13, color: "#202124" }}>{m.name}</span>
                        <span style={{ fontSize: 11, color: "#5f6368" }}>{m.time}</span>
                      </div>
                      <div style={{ fontSize: 13, color: "#202124", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.subject}</div>
                      <div style={{ fontSize: 12, color: "#5f6368", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.preview}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* reading pane */}
            <div style={{ flex: 1, background: "#fff", overflowY: "auto", display: "flex", flexDirection: "column" }}>
              {/* subject + sender row */}
              <div style={{ padding: "16px 24px 12px", borderBottom: "1px solid #e0e0e0", flexShrink: 0 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <h2 style={{ fontSize: 20, fontWeight: 400, color: "#202124", margin: 0 }}>Your account is ready ✓</h2>
                  <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 8, borderRadius: "50%", display: "flex" }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#444746" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#ea4335", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, color: "#fff", flexShrink: 0 }}>B</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: "#202124" }}>Branch Inventory System</span>
                      <span style={{ fontSize: 12, color: "#5f6368" }}>&lt;noreply@branchinv.rw&gt;</span>
                    </div>
                    <div style={{ fontSize: 12, color: "#5f6368" }}>to <strong style={{ color: "#202124" }}>{user.email}</strong> · {ts}</div>
                  </div>
                  <div style={{ display: "flex", gap: 4 }}>
                    {["M3 10h10a8 8 0 018 8v2M3 10l6 6M3 10l6-6", "M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z", "M3 6h18M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"].map((d, i) => (
                      <div key={i} style={{ width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#444746" strokeWidth="2"><path d={d}/></svg>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* email body */}
              <div style={{ padding: "24px 32px", flex: 1 }}>
                <div style={{ maxWidth: 560, margin: "0 auto" }}>

                  {/* dark header banner */}
                  <div style={{ background: "linear-gradient(135deg, #1a1f0e 0%, #2d3520 100%)", borderRadius: "8px 8px 0 0", padding: "24px 28px", display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ width: 44, height: 44, background: "rgba(255,255,255,0.1)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                    </div>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 600, color: "#fff" }}>Branch Inventory System</div>
                      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", marginTop: 2 }}>Multi-Branch Transfer Management</div>
                    </div>
                  </div>

                  {/* green success stripe */}
                  <div style={{ background: "#dcfce7", padding: "12px 28px", display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid #bbf7d0" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M9 12l2 2 4-4"/></svg>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#166534" }}>Account successfully created</span>
                  </div>

                  {/* white body */}
                  <div style={{ background: "#fff", border: "1px solid #e0e0e0", borderTop: "none", borderRadius: "0 0 8px 8px", padding: "28px 28px 24px" }}>
                    <p style={{ fontSize: 15, color: "#202124", marginBottom: 8 }}>Hi {first},</p>
                    <p style={{ fontSize: 13, color: "#5f6368", marginBottom: 20, lineHeight: 1.7 }}>
                      Your account on <strong style={{ color: "#202124" }}>Branch Inventory System</strong> has been created by a system administrator.
                      You can sign in immediately using the details below. For security, you will be prompted to set a new password the first time you log in.
                    </p>

                    {/* credentials */}
                    <div style={{ background: "#f8f9fa", border: "1px solid #e8eaed", borderRadius: 8, padding: "16px 20px", marginBottom: 24 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#80868b", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 14 }}>
                        Your Login Credentials
                      </div>
                      {[
                        { label: "Email address",      value: user.email,    mono: true  },
                        { label: "Temporary password", value: user.password, mono: true, highlight: true },
                        { label: "Role",               value: role,          mono: false },
                        ...(branchName ? [{ label: "Branch", value: branchName, mono: false }] : []),
                      ].map(row => (
                        <div key={row.label} style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 10 }}>
                          <span style={{ fontSize: 12, color: "#80868b", width: 140, flexShrink: 0, paddingTop: 2 }}>{row.label}</span>
                          <span style={{
                            fontSize: 13,
                            color: row.highlight ? "#78350f" : "#202124",
                            fontFamily: row.mono ? "'Roboto Mono', monospace" : "inherit",
                            background: row.highlight ? "#fef9c3" : row.mono ? "#e8f0fe" : "transparent",
                            border: row.highlight ? "1px solid #fde047" : "none",
                            padding: row.mono ? "2px 8px" : "0",
                            borderRadius: 4,
                            display: "inline-block",
                            fontWeight: row.highlight ? 700 : 400,
                            letterSpacing: row.highlight ? ".06em" : "normal",
                          }}>
                            {row.value}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* CTA */}
                    <div style={{ marginBottom: 24 }}>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#1a73e8", color: "#fff", borderRadius: 4, padding: "10px 24px", fontSize: 14, fontWeight: 500, cursor: "pointer" }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3"/></svg>
                        Sign in to your account
                      </div>
                    </div>

                    {/* security notice */}
                    <div style={{ background: "#fff8e1", border: "1px solid #ffe082", borderRadius: 6, padding: "10px 14px", marginBottom: 20, display: "flex", gap: 10, alignItems: "flex-start" }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}>
                        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                        <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                      </svg>
                      <span style={{ fontSize: 12, color: "#92400e", lineHeight: 1.6 }}>
                        Your temporary password was delivered securely. Never share your credentials with anyone — Branch Inventory will never ask for your password.
                      </span>
                    </div>

                    <p style={{ fontSize: 11, color: "#9aa0a6", lineHeight: 1.7, paddingTop: 16, borderTop: "1px solid #f1f3f4", margin: 0 }}>
                      This is an automated message sent by Branch Inventory System via Gmail SMTP. Please do not reply to this email.
                      If you did not expect this account, contact your administrator immediately.<br /><br />
                      &copy; {now.getFullYear()} Branch Inventory System · Kigali, Rwanda
                    </p>
                  </div>

                  {/* Gmail sent-via badge */}
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 12, justifyContent: "center" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" stroke="#4285F4" strokeWidth="2"/></svg>
                    <span style={{ fontSize: 11, color: "#80868b" }}>
                      Sent via <strong style={{ color: "#4285F4" }}>Gmail</strong> SMTP · mailed-by: branchinv.rw · signed-by: branchinv.rw
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function NewUserPage({ branches = [] }) {
  const router = useRouter()
  const [form, setForm]             = useState({ name: "", email: "", role: "", branch: "", password: genPassword() })
  const [errors, setErrors]         = useState({})
  const [step, setStep]             = useState("form")   // form | sending | confirm | gmail
  const [sendingMsg, setSendingMsg] = useState("")
  const [sendingIdx, setSendingIdx] = useState(0)
  const [createdUser, setCreatedUser] = useState(null)

  function set(k, v) {
    setForm(p => ({ ...p, [k]: v }))
    setErrors(p => ({ ...p, [k]: "" }))
  }

  function validate() {
    const e = {}
    if (!form.name.trim())                                       e.name  = "Name is required"
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = "Enter a valid email"
    if (!form.role)                                              e.role  = "Role is required"
    setErrors(e)
    return !Object.keys(e).length
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return
    setStep("sending")
    setSendingIdx(0)
    setSendingMsg(SENDING_STEPS[0])
    let i = 0
    const iv = setInterval(() => {
      i++
      if (i < SENDING_STEPS.length) {
        setSendingIdx(i)
        setSendingMsg(SENDING_STEPS[i])
      } else {
        clearInterval(iv)
        doCreate()
      }
    }, 700)
  }

  async function doCreate() {
    try {
      const res = await api.post("/users", {
        username: form.name.trim().toLowerCase().replace(/\s+/g, ".").replace(/[^a-z0-9.]/g, ""),
        fullName: form.name.trim(),
        email:    form.email.trim(),
        password: form.password,
        role:     form.role,
        branchId: form.branch ? Number(form.branch) : null,
      })

      console.log("✅ create success, response:", res)
      setCreatedUser({ ...form })
      console.log("✅ setStep -> confirm, createdUser ->", { ...form })
      setStep("confirm")
    } catch (err) {
      console.error("❌ create failed:", err)
      toast.error(err.message ?? "Failed to create user")
      setStep("form")
    }
  }

  const inp = (hasErr) => ({
    width: "100%", boxSizing: "border-box",
    border: `1px solid ${hasErr ? "#fca5a5" : "#dde0d4"}`,
    background: hasErr ? "#fef2f2" : "#fafaf8",
    padding: "9px 12px", fontFamily: "'DM Mono', monospace",
    fontSize: 12, color: "#1a1f0e", outline: "none",
  })

  // ── form ──────────────────────────────────────────────────────────────────
  if (step === "form") return (
    <>
      <DebugPanel step={step} createdUser={createdUser} />
      <div style={{ maxWidth: 580, display: "flex", flexDirection: "column", gap: 20 }}>
        <PageHeader title="Create User" subtitle="A welcome email with login credentials will be sent after the account is created." />
        <div style={{ background: "#fff", border: "1px solid #dde0d4" }}>
          <form onSubmit={handleSubmit} noValidate style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: 16 }}>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {[["Full name","name","text","e.g. Alice Uwimana"],["Email","email","email","alice@company.rw"]].map(([label,k,type,ph]) => (
                <div key={k} style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  <label style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, textTransform: "uppercase", letterSpacing: ".1em", color: errors[k] ? "#dc2626" : "#6b7260" }}>{label}</label>
                  <input type={type} value={form[k]} placeholder={ph} onChange={e => set(k, e.target.value)} style={inp(errors[k])} />
                  {errors[k] && <span style={{ fontSize: 11, color: "#dc2626" }}>{errors[k]}</span>}
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <label style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, textTransform: "uppercase", letterSpacing: ".1em", color: errors.role ? "#dc2626" : "#6b7260" }}>Role</label>
                <select value={form.role} onChange={e => set("role", e.target.value)} style={inp(errors.role)}>
                  <option value="">Select a role</option>
                  {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
                {errors.role && <span style={{ fontSize: 11, color: "#dc2626" }}>{errors.role}</span>}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <label style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, textTransform: "uppercase", letterSpacing: ".1em", color: "#6b7260" }}>Branch</label>
                <select value={form.branch} onChange={e => set("branch", e.target.value)} style={inp(false)}>
                  <option value="">— No branch —</option>
                  {branches.map(b => <option key={b.id} value={String(b.id)}>{b.name} ({b.code})</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <label style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, textTransform: "uppercase", letterSpacing: ".1em", color: "#6b7260" }}>Temporary Password</label>
              <div style={{ display: "flex", gap: 8 }}>
                <input value={form.password} onChange={e => set("password", e.target.value)} style={{ ...inp(false), flex: 1 }} />
                <button type="button" onClick={() => set("password", genPassword())} style={{ background: "#f7f8f4", border: "1px solid #dde0d4", padding: "0 14px", cursor: "pointer", fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#6b7260", whiteSpace: "nowrap" }}>Regenerate</button>
              </div>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#9ba590" }}>User will be prompted to change this on first login</span>
            </div>

            <div style={{ display: "flex", gap: 10, paddingTop: 4 }}>
              <button type="submit" style={{ background: "#1a1f0e", color: "#fff", border: "none", padding: "10px 24px", cursor: "pointer", fontFamily: "'DM Mono', monospace", fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase" }}>Create User</button>
              <button type="button" onClick={() => router.back()} style={{ background: "#f7f8f4", color: "#6b7260", border: "1px solid #dde0d4", padding: "10px 18px", cursor: "pointer", fontFamily: "'DM Mono', monospace", fontSize: 11 }}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </>
  )

  // ── sending ────────────────────────────────────────────────────────────────
  if (step === "sending") return (
    <>
      <DebugPanel step={step} createdUser={createdUser} />
      <div style={{ maxWidth: 580, display: "flex", flexDirection: "column", gap: 20 }}>
        <PageHeader title="Create User" subtitle="" />
        <div style={{ background: "#fff", border: "1px solid #dde0d4", padding: "48px 28px", display: "flex", flexDirection: "column", alignItems: "center", gap: 20, textAlign: "center" }}>
          <div style={{ position: "relative", width: 48, height: 48 }}>
            <div style={{ position: "absolute", inset: 0, border: "3px solid #f1f3f4", borderRadius: "50%" }} />
            <div style={{ position: "absolute", inset: 0, border: "3px solid transparent", borderTopColor: "#4285F4", borderRightColor: "#EA4335", borderRadius: "50%", animation: "spin .8s linear infinite" }} />
          </div>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, color: "#1a1f0e", fontWeight: 600 }}>{sendingMsg}</div>
            <div style={{ display: "flex", gap: 6, justifyContent: "center", marginTop: 4 }}>
              {SENDING_STEPS.map((_, i) => (
                <div key={i} style={{ width: i === sendingIdx ? 20 : 6, height: 6, borderRadius: 3, background: i <= sendingIdx ? "#4285F4" : "#e0e0e0", transition: "all .3s ease" }} />
              ))}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" stroke="#4285F4" strokeWidth="2"/></svg>
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#9ba590" }}>
              Connecting via <span style={{ color: "#4285F4", fontWeight: 600 }}>Gmail</span> SMTP · smtp.gmail.com:587
            </span>
          </div>
        </div>
      </div>
    </>
  )

  // ── confirmation card ──────────────────────────────────────────────────────
  if (step === "confirm") return (
    <>
      <DebugPanel step={step} createdUser={createdUser} />
      <div style={{ maxWidth: 580, display: "flex", flexDirection: "column", gap: 20 }}>
        <PageHeader title="User Created" subtitle="Account is active. Login credentials delivered." />

        {/* BIG prominent View Email banner — impossible to miss */}
        <button
          onClick={() => setStep("gmail")}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            background: "#1a73e8", color: "#fff", border: "none",
            padding: "16px 24px", cursor: "pointer",
            fontFamily: "'DM Mono', monospace", fontSize: 13, fontWeight: 700,
            letterSpacing: ".08em", textTransform: "uppercase",
            borderRadius: 4, boxShadow: "0 2px 8px rgba(26,115,232,0.3)",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
            <rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 7l10 7 10-7"/>
          </svg>
          View Email Sent to {createdUser?.email}
        </button>

        <div style={{ background: "#fff", border: "1px solid #dde0d4" }}>

          {/* green stripe with credentials */}
          <div style={{ background: "#f0fdf4", borderBottom: "1px solid #bbf7d0", padding: "16px 20px", display: "flex", alignItems: "flex-start", gap: 12 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" style={{ flexShrink: 0, marginTop: 2 }}>
              <circle cx="12" cy="12" r="10"/><path d="M9 12l2 2 4-4"/>
            </svg>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, fontWeight: 600, color: "#166534", marginBottom: 12 }}>
                Account created for {createdUser?.name}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {[
                  { label: "Email sent to", value: createdUser?.email },
                  { label: "Temp password", value: createdUser?.password, highlight: true },
                  { label: "Role",          value: ROLES.find(r => r.value === createdUser?.role)?.label ?? createdUser?.role },
                ].map(row => (
                  <div key={row.label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#166534", opacity: .65, width: 110, flexShrink: 0, textTransform: "uppercase", letterSpacing: ".07em" }}>{row.label}</span>
                    <span style={{
                      fontFamily: "'DM Mono', monospace",
                      fontSize: 12, fontWeight: row.highlight ? 700 : 500,
                      color: row.highlight ? "#78350f" : "#166534",
                      background: row.highlight ? "#fef9c3" : "transparent",
                      border: row.highlight ? "1px solid #fde047" : "none",
                      padding: row.highlight ? "2px 10px" : "0",
                      borderRadius: row.highlight ? 4 : 0,
                      letterSpacing: row.highlight ? ".06em" : "normal",
                    }}>
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#166534", opacity: .6, marginTop: 12, lineHeight: 1.6 }}>
                These credentials were sent to the user via Gmail SMTP.
                Click the button above to see the exact email they received in their inbox.
              </div>
            </div>
          </div>

          {/* footer actions */}
          <div style={{ padding: "14px 24px", borderTop: "1px solid #dde0d4", background: "#f7f8f4", display: "flex", gap: 10 }}>
            <button
              onClick={() => { setForm({ name: "", email: "", role: "", branch: "", password: genPassword() }); setErrors({}); setCreatedUser(null); setStep("form") }}
              style={{ background: "#1a1f0e", color: "#fff", border: "none", padding: "9px 20px", cursor: "pointer", fontFamily: "'DM Mono', monospace", fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase" }}
            >
              + Create Another
            </button>
            <button
              onClick={() => router.push("/users")}
              style={{ background: "#f7f8f4", color: "#6b7260", border: "1px solid #dde0d4", padding: "9px 18px", cursor: "pointer", fontFamily: "'DM Mono', monospace", fontSize: 11 }}
            >
              Back to Users
            </button>
          </div>
        </div>
      </div>
    </>
  )

  // ── full Gmail simulation ──────────────────────────────────────────────────
  // step === "gmail"
  return (
    <>
      <DebugPanel step={step} createdUser={createdUser} />
      <GmailModal
        user={createdUser}
        branches={branches}
        onClose={() => setStep("confirm")}
      />
    </>
  )
}
