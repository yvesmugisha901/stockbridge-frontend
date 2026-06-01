/**
 * UserFormModal — create or edit a user
 * Props: open, user (null = create), branches [], onClose(), onSave(data), onDelete(userId)
 *
 * onSave must return { user, plainPassword, emailPreview?, emailError? }
 * matching the same shape as createEmployee() in the other codebase.
 */
"use client"
import { useState, useEffect } from "react"
import { ROLES }               from "@/lib/utils/constants"
import toast                   from "react-hot-toast"

const EMPTY = { fullName: "", email: "", password: "", role: "", branchId: "" }

function toUsername(fullName) {
  return fullName.trim().toLowerCase().replace(/\s+/g, ".").replace(/[^a-z0-9.]/g, "")
}

function genPassword() {
  const c = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#"
  return Array.from({ length: 10 }, () => c[Math.floor(Math.random() * c.length)]).join("")
}

const ROLE_LABELS = {
  STAFF:      "Branch Staff",
  MANAGER:    "Branch Manager",
  HO_ADMIN:   "Head Office Admin",
  ACCOUNTANT: "Accountant",
  ADMIN:      "System Admin",
}

const SEND_STEPS = ["Creating account…", "Saving credentials…", "Sending confirmation email…"]

// ── Delete confirmation ───────────────────────────────────────────────────────
function DeleteConfirm({ user, onConfirm, onCancel, deleting }) {
  return (
    <div style={overlay}>
      <div style={{ ...panel, width: 400 }}>
        <div style={panelHeader}>
          <span style={{ ...panelTitle, color: "#dc2626" }}>Delete User</span>
          <button onClick={onCancel} style={closeBtn} disabled={deleting}>✕</button>
        </div>
        <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
            <div style={{ width: 40, height: 40, flexShrink: 0, background: "#fef2f2", border: "1px solid #fecaca", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
            <div>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, fontWeight: 600, color: "#1a1f0e", marginBottom: 6 }}>
                This action cannot be undone
              </div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#6b7260", lineHeight: 1.6 }}>
                You are about to permanently delete{" "}
                <strong style={{ color: "#1a1f0e" }}>{user?.fullName}</strong>
                {" "}({user?.email}). All data associated with this account will be removed.
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={onCancel} disabled={deleting} style={{ flex: 1, background: "#f7f8f4", color: "#6b7260", border: "1px solid #dde0d4", padding: "10px 0", cursor: deleting ? "default" : "pointer", fontFamily: "'DM Mono', monospace", fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase" }}>Cancel</button>
            <button onClick={onConfirm} disabled={deleting} style={{ flex: 1, background: deleting ? "#fca5a5" : "#dc2626", color: "#fff", border: "none", padding: "10px 0", cursor: deleting ? "default" : "pointer", fontFamily: "'DM Mono', monospace", fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase" }}>
              {deleting ? "Deleting…" : "Delete User"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Gmail inbox simulation ────────────────────────────────────────────────────
function EmailInbox({ data, onClose }) {
  const now    = new Date()
  const ts     = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  const dateStr = now.toLocaleDateString([], { month: "short", day: "numeric" })
  const first  = (data.fullName || data.full_name || "").split(" ")[0] || "there"
  const role   = ROLE_LABELS[data.role] ?? data.role
  const branch = data.branchName || null
  const pw     = data.password || data.plainPassword

  const sidebarItems = [
    { icon: "M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7", label: "Compose", active: false, count: null },
    { icon: "M22 12h-4l-3 9L9 3l-3 9H2",                              label: "Inbox",   active: true,  count: "1" },
    { icon: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z", label: "Starred", active: false, count: null },
    { icon: "M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z",                  label: "Sent",    active: false, count: null },
    { icon: "M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z", label: "Drafts", active: false, count: null },
    { icon: "M3 6h18M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6M10 11v6M14 11v6", label: "Trash", active: false, count: null },
  ]

  const fillerEmails = [
    { from: "hr@company.rw",      subject: "Welcome to the team",       time: "Yesterday" },
    { from: "it@company.rw",      subject: "IT onboarding checklist",   time: "Mon" },
    { from: "payroll@company.rw", subject: "Bank details required",     time: "Sun" },
    { from: "admin@company.rw",   subject: "Policy update Q2",          time: "May 30" },
  ]

  const actionIcons = [
    "M3 10h10a8 8 0 018 8v2M3 10l6 6M3 10l6-6",
    "M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z",
    "M3 6h18M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6",
  ]

  return (
    <div style={overlay}>
      {/* Gmail window */}
      <div style={{
        width: "min(820px, calc(100vw - 24px))",
        height: "min(580px, 92vh)",
        background: "#f6f8fc",
        border: "1px solid #e0e0e0",
        borderRadius: 10,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 8px 40px rgba(0,0,0,0.28)",
      }}>

        {/* Top bar */}
        <div style={{ background: "#f6f8fc", padding: "8px 16px", display: "flex", alignItems: "center", gap: 12, borderBottom: "0.5px solid #e0e0e0", flexShrink: 0 }}>
          {/* Gmail logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 4, minWidth: 90 }}>
            <svg width="30" height="22" viewBox="0 0 30 22" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="0" y="0" width="30" height="22" rx="2" fill="white" stroke="#e0e0e0" strokeWidth="0.5"/>
              <path d="M0 4L15 13L30 4" stroke="#e0e0e0" strokeWidth="0.5" fill="none"/>
              <path d="M0 4L15 13" stroke="#4285f4" strokeWidth="1.5"/>
              <path d="M30 4L15 13" stroke="#ea4335" strokeWidth="1.5"/>
            </svg>
            <span style={{ fontSize: 20, letterSpacing: "-0.5px", fontWeight: 400, color: "#444746" }}>
              <span style={{ color: "#4285f4" }}>G</span>
              <span style={{ color: "#ea4335" }}>m</span>
              <span style={{ color: "#fbbc05" }}>a</span>
              <span style={{ color: "#4285f4" }}>i</span>
              <span style={{ color: "#34a853" }}>l</span>
            </span>
          </div>

          {/* Search bar */}
          <div style={{ flex: 1, background: "#eaf1fb", borderRadius: 24, padding: "8px 16px", display: "flex", alignItems: "center", gap: 8 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#444746" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            <span style={{ fontSize: 14, color: "#444746" }}>Search mail</span>
          </div>

          {/* Avatar */}
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#1a73e8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#fff", flexShrink: 0 }}>A</div>

          {/* Close */}
          <button onClick={onClose} style={{ background: "transparent", border: "none", cursor: "pointer", color: "#444746", fontSize: 18, lineHeight: 1, padding: "4px 8px", borderRadius: "50%" }}>×</button>
        </div>

        {/* Body */}
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

          {/* Sidebar */}
          <div style={{ width: 200, background: "#f6f8fc", borderRight: "0.5px solid #e0e0e0", padding: "8px 0", flexShrink: 0, overflowY: "auto" }}>
            {sidebarItems.map(({ icon, label, active, count }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 16px", borderRadius: "0 24px 24px 0", marginRight: 12, fontSize: 13, color: active ? "#0b57d0" : "#444746", background: active ? "#d3e3fd" : "transparent", fontWeight: active ? 600 : 400, cursor: "pointer" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d={icon}/></svg>
                <span style={{ flex: 1 }}>{label}</span>
                {count && <span style={{ background: "#1a73e8", color: "#fff", borderRadius: 10, padding: "1px 6px", fontSize: 11, fontWeight: 700 }}>{count}</span>}
              </div>
            ))}
          </div>

          {/* Email list */}
          <div style={{ width: 240, borderRight: "0.5px solid #e0e0e0", overflowY: "auto", background: "#fff", flexShrink: 0 }}>
            {/* New unread email — highlighted */}
            <div style={{ padding: "10px 14px", borderBottom: "0.5px solid #f0f0f0", background: "#e8f0fe", cursor: "pointer" }}>
              <div style={{ fontSize: 11, color: "#1a73e8", float: "right", marginTop: 2 }}>{ts}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#0b57d0", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>BranchInv System</div>
              <div style={{ fontSize: 12, color: "#0b57d0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Your account credentials</div>
            </div>

            {/* Filler emails */}
            {fillerEmails.map(({ from, subject, time }) => (
              <div key={from} style={{ padding: "9px 14px", borderBottom: "0.5px solid #f0f0f0", background: "#fff", cursor: "pointer", opacity: 0.45 }}>
                <div style={{ fontSize: 11, color: "#999", float: "right" }}>{time}</div>
                <div style={{ fontSize: 13, color: "#444", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{from}</div>
                <div style={{ fontSize: 12, color: "#777", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{subject}</div>
              </div>
            ))}
          </div>

          {/* Reading pane */}
          <div style={{ flex: 1, background: "#fff", display: "flex", flexDirection: "column", overflow: "hidden" }}>

            {/* Email header */}
            <div style={{ padding: "14px 20px 12px", borderBottom: "0.5px solid #e0e0e0", flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                {/* Sender avatar */}
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#1a73e8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 700, color: "#fff", flexShrink: 0 }}>B</div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 17, fontWeight: 500, color: "#202124", marginBottom: 2 }}>Your account credentials for BranchInv System</div>
                  <div style={{ fontSize: 12, color: "#5f6368" }}>
                    <span style={{ fontWeight: 600 }}>noreply@branchinv.rw</span>
                    {" "}&lt;noreply@branchinv.rw&gt; · to {data.email}
                  </div>
                  <div style={{ fontSize: 11, color: "#999", marginTop: 2 }}>{dateStr} at {ts}</div>
                </div>

                {/* Action icons */}
                <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                  {actionIcons.map((d, i) => (
                    <button key={i} style={{ width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", background: "transparent", border: "none" }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#444746" strokeWidth="2"><path d={d}/></svg>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Email body */}
            <div style={{ padding: "16px 20px", overflowY: "auto", flex: 1, fontSize: 13, lineHeight: 1.7, color: "#202124" }}>

              {/* Brand header */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, paddingBottom: 12, borderBottom: "0.5px solid #f0f1ec", marginBottom: 14 }}>
                <div style={{ width: 28, height: 28, background: "#1a1f0e", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 4, flexShrink: 0 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#202124" }}>Branch Inventory System</div>
                  <div style={{ fontSize: 11, color: "#5f6368" }}>Multi-Branch Transfer Management · Kigali, Rwanda</div>
                </div>
              </div>

              {/* Success badge */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "8px 12px", borderRadius: 6, marginBottom: 14 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M9 12l2 2 4-4"/></svg>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#166534" }}>Account successfully created</span>
              </div>

              <p style={{ marginBottom: 8 }}>Hi <strong>{first}</strong>,</p>
              <p style={{ fontSize: 12, color: "#5f6368", marginBottom: 16 }}>
                Your account on <strong style={{ color: "#202124" }}>Branch Inventory System</strong> has been created by a system administrator.
                Log in immediately using the credentials below. You will be prompted to set a new password on first sign-in.
              </p>

              {/* Credentials table */}
              <div style={{ background: "#f8f9fa", border: "1px solid #e0e0e0", borderRadius: 6, padding: "12px 14px", marginBottom: 16 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#9ba590", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 10, fontFamily: "'DM Mono', monospace" }}>Your login credentials</div>
                {[
                  { label: "Email",    value: data.email,  highlight: false },
                  { label: "Password", value: pw,          highlight: true  },
                  { label: "Role",     value: role,        highlight: false },
                  ...(branch ? [{ label: "Branch", value: branch, highlight: false }] : []),
                ].map(row => (
                  <div key={row.label} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                    <span style={{ fontSize: 11, color: "#5f6368", width: 68, flexShrink: 0, fontFamily: "'DM Mono', monospace" }}>{row.label}</span>
                    <span style={{
                      fontSize: 12,
                      fontFamily: "'DM Mono', monospace",
                      fontWeight: row.highlight ? 700 : 400,
                      color:      row.highlight ? "#92400e" : "#202124",
                      background: row.highlight ? "#fef9c3" : "#fff",
                      border:     `1px solid ${row.highlight ? "#fde047" : "#e0e0e0"}`,
                      padding:    "2px 8px",
                      borderRadius: 4,
                      letterSpacing: row.highlight ? ".06em" : "normal",
                    }}>
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>

              {/* CTA button */}
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#1a73e8", color: "#fff", padding: "8px 16px", borderRadius: 6, fontSize: 12, fontWeight: 600, marginBottom: 16, cursor: "pointer" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3"/></svg>
                Sign in to your account
              </div>

              {/* Warning */}
              <div style={{ background: "#fffbeb", border: "1px solid #fde68a", padding: "10px 12px", borderRadius: 6, marginBottom: 14, display: "flex", gap: 8, alignItems: "flex-start" }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}>
                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                <span style={{ fontSize: 11, color: "#92400e", lineHeight: 1.6 }}>
                  Do not share your password with anyone. Branch Inventory will never ask for your password.
                </span>
              </div>

              {/* Footer */}
              <p style={{ fontSize: 11, color: "#9ba590", lineHeight: 1.6, paddingTop: 12, borderTop: "0.5px solid #f0f1ec", margin: 0 }}>
                This is an automated message — please do not reply.<br />
                If you did not expect this account, contact your administrator immediately.<br /><br />
                © {new Date().getFullYear()} Branch Inventory System · Kigali, Rwanda
              </p>

              {/* Gmail footer badge */}
              <div style={{ marginTop: 16, paddingTop: 12, borderTop: "0.5px solid #e0e0e0", display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#9ba590" }}>
                {["#4285f4","#ea4335","#fbbc05","#34a853"].map(c => (
                  <span key={c} style={{ width: 8, height: 8, borderRadius: "50%", background: c, display: "inline-block" }} />
                ))}
                Sent via Gmail SMTP · mailed-by: branchinv.rw
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Confirmation card ─────────────────────────────────────────────────────────
function ConfirmCard({ data, onViewEmail, onClose }) {
  const role = ROLE_LABELS[data.role] ?? data.role

  return (
    <div style={overlay}>
      <div style={{ ...panel, width: 480 }}>
        <div style={panelHeader}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M9 12l2 2 4-4"/></svg>
            <span style={panelTitle}>User Created</span>
          </div>
          <button onClick={onClose} style={closeBtn}>✕</button>
        </div>

        <div style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: 14 }}>

          {/* credentials */}
          <div style={{ background: "#f7f8f4", border: "1px solid #dde0d4", padding: "14px 16px" }}>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, fontWeight: 700, color: "#9ba590", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 12 }}>Account details</div>
            {[
              { label: "Name",     value: data.fullName || data.full_name },
              { label: "Email",    value: data.email },
              { label: "Password", value: data.password || data.plainPassword, highlight: true },
              { label: "Role",     value: role },
              ...(data.branchName ? [{ label: "Branch", value: data.branchName }] : []),
            ].map(row => (
              <div key={row.label} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#9ba590", width: 66, flexShrink: 0, textTransform: "uppercase", letterSpacing: ".06em" }}>{row.label}</span>
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, fontWeight: row.highlight ? 700 : 400, color: row.highlight ? "#78350f" : "#1a1f0e", background: row.highlight ? "#fef9c3" : "#fff", border: `1px solid ${row.highlight ? "#fde047" : "#dde0d4"}`, padding: "2px 9px", letterSpacing: row.highlight ? ".06em" : "normal" }}>
                  {row.value}
                </span>
              </div>
            ))}
          </div>

          {/* email delivery status */}
          {data.emailPreview ? (
            <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "12px 14px", display: "flex", gap: 10, alignItems: "flex-start" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 7l10 7 10-7"/></svg>
              <div>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, fontWeight: 600, color: "#166534", marginBottom: 4 }}>Welcome email sent</div>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#166534", opacity: .8, lineHeight: 1.6, marginBottom: 10 }}>
                  The credentials email was captured. Click below to preview the inbox simulation, or open the real captured email in a new tab.
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={onViewEmail}
                    style={{ display: "flex", alignItems: "center", gap: 6, background: "#fff", border: "1px solid #1a1f0e", padding: "7px 14px", cursor: "pointer", fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#1a1f0e", letterSpacing: ".06em", textTransform: "uppercase" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#f7f8f4"}
                    onMouseLeave={e => e.currentTarget.style.background = "#fff"}
                  >
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#1a1f0e" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 7l10 7 10-7"/></svg>
                    Inbox simulation
                  </button>
                  <a href={data.emailPreview} target="_blank" rel="noreferrer"
                    style={{ display: "flex", alignItems: "center", gap: 6, background: "#166534", border: "none", padding: "7px 14px", cursor: "pointer", fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#fff", letterSpacing: ".06em", textTransform: "uppercase", textDecoration: "none" }}
                  >
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/></svg>
                    Open real email →
                  </a>
                </div>
              </div>
            </div>
          ) : data.emailError ? (
            <div style={{ background: "#fffbeb", border: "1px solid #fde68a", padding: "12px 14px", display: "flex", gap: 10, alignItems: "flex-start" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}>
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              <div>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, fontWeight: 600, color: "#92400e", marginBottom: 4 }}>Email could not be sent</div>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#92400e", opacity: .85, lineHeight: 1.6, marginBottom: 10 }}>
                  {data.emailError} — share the temporary password above with the user manually.
                </div>
                <button onClick={onViewEmail}
                  style={{ display: "flex", alignItems: "center", gap: 6, background: "#fff", border: "1px solid #dde0d4", padding: "7px 14px", cursor: "pointer", fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#1a1f0e", letterSpacing: ".06em", textTransform: "uppercase" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#f7f8f4"}
                  onMouseLeave={e => e.currentTarget.style.background = "#fff"}
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#1a1f0e" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 7l10 7 10-7"/></svg>
                  Preview email anyway
                </button>
              </div>
            </div>
          ) : (
            <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "12px 14px", display: "flex", gap: 10, alignItems: "flex-start" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 7l10 7 10-7"/></svg>
              <div>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, fontWeight: 600, color: "#166534", marginBottom: 3 }}>Credentials emailed to {data.email}</div>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#166534", opacity: .75, lineHeight: 1.6, marginBottom: 10 }}>
                  The login details above — including the temporary password — have been sent to the user.
                  Click below to preview the exact email they received in their inbox.
                </div>
                <button onClick={onViewEmail}
                  style={{ display: "flex", alignItems: "center", gap: 6, background: "#fff", border: "1px solid #1a1f0e", padding: "7px 14px", cursor: "pointer", fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#1a1f0e", letterSpacing: ".06em", textTransform: "uppercase" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#f7f8f4"}
                  onMouseLeave={e => e.currentTarget.style.background = "#fff"}
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#1a1f0e" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 7l10 7 10-7"/></svg>
                  View email sent to user →
                </button>
              </div>
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button onClick={onClose} style={{ background: "#1a1f0e", color: "#fff", border: "none", padding: "9px 24px", cursor: "pointer", fontFamily: "'DM Mono', monospace", fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase" }}>Done</button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main modal ────────────────────────────────────────────────────────────────
export default function UserFormModal({ open, user, branches = [], onClose, onSave, onDelete }) {
  const [form,     setForm]     = useState(EMPTY)
  const [saving,   setSaving]   = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [errors,   setErrors]   = useState({})
  const [step,     setStep]     = useState("form")   // form | sending | confirm | email | confirmDelete
  const [sendMsg,  setSendMsg]  = useState("")
  const [sendIdx,  setSendIdx]  = useState(0)
  const [created,  setCreated]  = useState(null)

  const isEdit = Boolean(user)

  useEffect(() => {
    if (open) {
      if (user) {
        setForm({ fullName: user.fullName ?? "", email: user.email ?? "", password: "", role: user.role ?? "", branchId: user.branchId != null ? String(user.branchId) : "" })
      } else {
        setForm({ ...EMPTY, password: genPassword() })
      }
      setErrors({})
      setStep("form")
      setCreated(null)
    }
  }, [open, user])

  if (!open) return null

  function set(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }))
  }

  function validate() {
    const e = {}
    if (!form.fullName.trim())                       e.fullName = "Full name is required"
    if (!form.email.trim())                          e.email    = "Email is required"
    if (!isEdit && !form.password.trim())            e.password = "Password is required"
    if (!isEdit && form.password.trim().length < 6)  e.password = "At least 6 characters"
    if (!form.role)                                  e.role     = "Role is required"
    return e
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    if (isEdit) {
      setSaving(true)
      try {
        await onSave({ username: toUsername(form.fullName), fullName: form.fullName.trim(), email: form.email.trim(), role: form.role, branchId: form.branchId ? Number(form.branchId) : null })
        toast.success("User updated")
      } catch (err) {
        toast.error(err.message ?? "Save failed")
      } finally {
        setSaving(false)
      }
      return
    }

    const branchName = form.branchId ? branches.find(b => String(b.id) === form.branchId)?.name ?? "" : ""
    const snapshot = { fullName: form.fullName.trim(), email: form.email.trim(), password: form.password, role: form.role, branchName }

    setStep("sending")
    setSendIdx(0)
    setSendMsg(SEND_STEPS[0])
    let i = 0
    const iv = setInterval(() => {
      i++
      if (i < SEND_STEPS.length) { setSendIdx(i); setSendMsg(SEND_STEPS[i]) }
      else { clearInterval(iv); doCreate(snapshot) }
    }, 750)
  }

  async function doCreate(snapshot) {
    try {
      const result = await onSave({
        username: toUsername(snapshot.fullName),
        fullName: snapshot.fullName,
        email:    snapshot.email,
        password: snapshot.password,
        role:     snapshot.role,
        branchId: form.branchId ? Number(form.branchId) : null,
      })
      setCreated({
        ...snapshot,
        password:     result?.plainPassword ?? snapshot.password,
        emailPreview: result?.emailPreview  ?? null,
        emailError:   result?.emailError    ?? null,
      })
      setStep("confirm")
    } catch (err) {
      toast.error(err.message ?? "Save failed")
      setStep("form")
    }
  }

  async function confirmDelete() {
    setDeleting(true)
    try {
      await onDelete(user.id)
      toast.success(`${user.fullName} deleted`)
    } catch (err) {
      toast.error(err.message ?? "Delete failed")
      setDeleting(false)
      setStep("form")
    }
  }

  const usernamePreview = form.fullName.trim() ? toUsername(form.fullName) : null

  // ── sending ──────────────────────────────────────────────────────────────────
  if (step === "sending") return (
    <div style={overlay}>
      <div style={{ ...panel, display: "flex", flexDirection: "column" }}>
        <div style={panelHeader}><span style={panelTitle}>Creating user</span></div>
        <div style={{ padding: "48px 28px", display: "flex", flexDirection: "column", alignItems: "center", gap: 18, textAlign: "center" }}>
          {/* Google-coloured spinner */}
          <div style={{ width: 40, height: 40, borderRadius: "50%", border: "3px solid transparent", borderTopColor: "#4285f4", borderRightColor: "#ea4335", borderBottomColor: "#34a853", borderLeftColor: "#fbbc05", animation: "spin .8s linear infinite" }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#6b7260" }}>{sendMsg}</div>
          <div style={{ display: "flex", gap: 6 }}>
            {SEND_STEPS.map((_, i) => (
              <div key={i} style={{ width: i === sendIdx ? 20 : 6, height: 6, borderRadius: 3, background: i <= sendIdx ? "#1a1f0e" : "#dde0d4", transition: "all .3s" }} />
            ))}
          </div>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#9ba590" }}>smtp.gmail.com:587 · TLS</div>
        </div>
      </div>
    </div>
  )

  // ── confirmation card ────────────────────────────────────────────────────────
  if (step === "confirm") return (
    <ConfirmCard data={created} onViewEmail={() => setStep("email")} onClose={onClose} />
  )

  // ── Gmail inbox simulation ───────────────────────────────────────────────────
  if (step === "email") return (
    <EmailInbox data={created} onClose={onClose} />
  )

  // ── delete confirmation ──────────────────────────────────────────────────────
  if (step === "confirmDelete") return (
    <DeleteConfirm user={user} onConfirm={confirmDelete} onCancel={() => setStep("form")} deleting={deleting} />
  )

  // ── form ─────────────────────────────────────────────────────────────────────
  return (
    <div style={overlay}>
      <div style={panel}>
        <div style={panelHeader}>
          <span style={panelTitle}>{isEdit ? "Edit User" : "New User"}</span>
          <button onClick={onClose} style={closeBtn}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: 16 }}>

          <Field label="Full Name" error={errors.fullName}>
            <input style={inp(errors.fullName)} value={form.fullName} onChange={e => set("fullName", e.target.value)} />
            {usernamePreview && <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#9ba590", marginTop: 3 }}>username: {usernamePreview}</span>}
          </Field>

          <Field label="Email" error={errors.email}>
            <input type="email" style={inp(errors.email)} value={form.email} onChange={e => set("email", e.target.value)} autoComplete="off" />
          </Field>

          {!isEdit && (
            <Field label="Temporary password" error={errors.password}>
              <div style={{ display: "flex", gap: 8 }}>
                <input type="text" style={{ ...inp(errors.password), flex: 1, fontFamily: "'DM Mono', monospace" }} value={form.password} onChange={e => set("password", e.target.value)} autoComplete="new-password" />
                <button type="button" onClick={() => set("password", genPassword())} style={{ background: "#f7f8f4", border: "1px solid #dde0d4", padding: "0 12px", cursor: "pointer", fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#6b7260", whiteSpace: "nowrap" }}>New</button>
              </div>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#9ba590", marginTop: 3 }}>User must change this on first login</span>
            </Field>
          )}

          <Field label="Role" error={errors.role}>
            <select style={inp(errors.role)} value={form.role} onChange={e => set("role", e.target.value)}>
              <option value="">Select role</option>
              {Object.values(ROLES).map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </Field>

          <Field label="Branch (optional)">
            <select style={inp(false)} value={form.branchId} onChange={e => set("branchId", e.target.value)}>
              <option value="">— No branch —</option>
              {branches.map(b => <option key={b.id} value={String(b.id)}>{b.name} ({b.code})</option>)}
            </select>
          </Field>

          {errors.submit && (
            <div style={{ background: "#fef2f2", border: "1px solid #fecaca", padding: "10px 14px", fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#dc2626" }}>
              {errors.submit}
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 4, gap: 10 }}>
            <div>
              {isEdit && (
                <button type="button" onClick={() => setStep("confirmDelete")} style={{ background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", padding: "10px 16px", cursor: "pointer", fontFamily: "'DM Mono', monospace", fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 6 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
                  Delete
                </button>
              )}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button type="button" onClick={onClose} style={{ background: "#f7f8f4", color: "#6b7260", border: "1px solid #dde0d4", padding: "10px 20px", cursor: "pointer", fontFamily: "'DM Mono', monospace", fontSize: 12, letterSpacing: ".08em" }}>Cancel</button>
              <button type="submit" disabled={saving} style={{ background: saving ? "#b0b5a0" : "#1a1f0e", color: "#fff", border: "none", padding: "10px 24px", cursor: saving ? "default" : "pointer", fontFamily: "'DM Mono', monospace", fontSize: 12, letterSpacing: ".08em", textTransform: "uppercase" }}>
                {saving ? "Saving…" : isEdit ? "Save Changes" : "Create User"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── helpers ───────────────────────────────────────────────────────────────────
function Field({ label, error, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, textTransform: "uppercase", letterSpacing: ".1em", color: error ? "#dc2626" : "#6b7260" }}>{label}</label>
      {children}
      {error && <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "#dc2626" }}>{error}</span>}
    </div>
  )
}

const overlay     = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }
const panel       = { background: "#fff", border: "1px solid #dde0d4", width: 460, maxWidth: "calc(100vw - 32px)", maxHeight: "90vh", overflowY: "auto" }
const panelHeader = { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 28px", borderBottom: "1px solid #dde0d4", background: "#f7f8f4" }
const panelTitle  = { fontFamily: "'DM Mono', monospace", fontSize: 13, fontWeight: 600, color: "#1a1f0e", letterSpacing: ".04em" }
const closeBtn    = { background: "transparent", border: "none", cursor: "pointer", color: "#6b7260", fontSize: 16, lineHeight: 1, padding: 4 }

function inp(hasError) {
  return { width: "100%", boxSizing: "border-box", border: `1px solid ${hasError ? "#fca5a5" : "#dde0d4"}`, background: hasError ? "#fef2f2" : "#fafaf8", padding: "9px 12px", fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#1a1f0e", outline: "none" }
}