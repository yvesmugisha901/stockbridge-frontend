"use client"
import { useState, useEffect, useRef } from "react"
import PageHeader from "@/components/ui/PageHeader"
import { api } from "@/lib/api/client"
import toast from "react-hot-toast"

// ─── ALL SETTINGS ─────────────────────────────────────────────────────────────
const CONFIG_META = {
  // ── Approvals ──────────────────────────────────────────────────────────────
  APPROVAL_QUANTITY_THRESHOLD: {
    label: "Items that need Head Office approval",
    description: "If a transfer asks for this many items or more, the Branch Manager alone cannot approve it — Head Office must also sign off.",
    section: "approvals", type: "number", unit: "items", defaultValue: "50",
  },
  APPROVAL_VALUE_THRESHOLD: {
    label: "Transfer value that needs Head Office approval",
    description: "If the total value of a transfer reaches this amount or more, Head Office must approve it before it can proceed.",
    section: "approvals", type: "number", unit: "RWF", defaultValue: "500000",
  },
  SINGLE_APPROVER_LIMIT: {
    label: "Branch Manager can approve transfers up to",
    description: "Transfers below this value only need the Branch Manager to approve them. Nothing is sent to Head Office.",
    section: "approvals", type: "number", unit: "RWF", defaultValue: "100000",
  },
  APPROVAL_EXPIRY_HOURS: {
    label: "Unanswered approvals expire after",
    description: "If a manager has not approved or rejected a request within this time, it is automatically escalated to the next level.",
    section: "approvals", type: "number", unit: "hours", defaultValue: "48",
  },
  APPROVAL_REMINDER_HOURS: {
    label: "Send a reminder after",
    description: "A reminder notification is sent to the approver if they have not acted on a request within this time.",
    section: "approvals", type: "number", unit: "hours", defaultValue: "24",
  },
  REQUIRE_REJECTION_COMMENT: {
    label: "Require a reason when rejecting a transfer",
    description: "When this is on, a manager must write a reason before they can reject any transfer request.",
    section: "approvals", type: "boolean", defaultValue: "true",
  },

  // ── Transfers ──────────────────────────────────────────────────────────────
  MAX_TRANSFER_QUANTITY: {
    label: "Maximum items in one transfer",
    description: "No single transfer request can ask for more than this number of items. The form will block submission if exceeded.",
    section: "transfers", type: "number", unit: "items", defaultValue: "500",
  },
  MIN_TRANSFER_QUANTITY: {
    label: "Minimum items in one transfer",
    description: "Transfers below this number of items will be rejected. This prevents very small or unnecessary requests.",
    section: "transfers", type: "number", unit: "items", defaultValue: "1",
  },
  TRANSFER_AUTO_COMPLETE_DAYS: {
    label: "Auto-close transfers stuck in transit after",
    description: "If a transfer stays in In Transit status for this many days without being confirmed, it is automatically marked as Completed.",
    section: "transfers", type: "number", unit: "days", defaultValue: "7",
  },
  REQUIRE_JUSTIFICATION: {
    label: "Staff must write a reason before submitting",
    description: "When this is on, the justification field is required. Staff cannot submit a transfer request without typing a reason.",
    section: "transfers", type: "boolean", defaultValue: "true",
  },
  STOCK_RESERVATION_ENABLED: {
    label: "Hold stock as soon as a request is submitted",
    description: "When on, the requested items at the source branch are reserved the moment the request is submitted — before anyone approves it.",
    section: "transfers", type: "boolean", defaultValue: "true",
  },
  ALLOW_SAME_BRANCH_TRANSFER: {
    label: "Allow a branch to transfer to itself",
    description: "When on, staff can create a transfer where the source and destination are the same branch. Useful for moving stock between departments.",
    section: "transfers", type: "boolean", defaultValue: "false",
  },
  CANCEL_WINDOW_MINUTES: {
    label: "Staff can cancel a request within",
    description: "After submitting, staff can cancel their own request during this window. After this time, only a manager can cancel it.",
    section: "transfers", type: "number", unit: "minutes", defaultValue: "30",
  },

  // ── Inventory ──────────────────────────────────────────────────────────────
  LOW_STOCK_ALERT_ENABLED: {
    label: "Show low stock warnings on dashboards",
    description: "When on, a warning badge appears on any branch dashboard where stock has dropped below the set minimum level.",
    section: "inventory", type: "boolean", defaultValue: "true",
  },
  LOW_STOCK_THRESHOLD_PERCENT: {
    label: "Show a warning when stock drops to",
    description: "A yellow warning appears when the stock on hand falls to this percentage of the branch minimum. Example: set to 20 to warn at 20% of minimum.",
    section: "inventory", type: "number", unit: "%", defaultValue: "20",
  },
  CRITICAL_STOCK_THRESHOLD_PERCENT: {
    label: "Show a critical alert when stock drops to",
    description: "A red critical alert appears when stock falls to this percentage of the minimum. This should be lower than the warning level above.",
    section: "inventory", type: "number", unit: "%", defaultValue: "5",
  },
  MANUAL_ADJUSTMENT_REQUIRES_REASON: {
    label: "Require a reason for manual stock changes",
    description: "When on, anyone who manually adds or removes stock from a branch must type a written reason before the change is saved.",
    section: "inventory", type: "boolean", defaultValue: "true",
  },
  NEGATIVE_STOCK_ALLOWED: {
    label: "Allow stock to go below zero",
    description: "When off (recommended), the system prevents stock from going negative. Only turn this on if your process requires pre-allocating stock that has not yet arrived.",
    section: "inventory", type: "boolean", defaultValue: "false",
  },
  STOCK_RECONCILIATION_ENABLED: {
    label: "Allow branch stock reconciliation",
    description: "When on, branch managers can submit a reconciliation report to correct differences between the system stock and a physical count.",
    section: "inventory", type: "boolean", defaultValue: "true",
  },
  ITEM_DEACTIVATION_BLOCKS_TRANSFERS: {
    label: "Block transfers for deactivated items",
    description: "When on, staff cannot request a transfer for any item that has been marked inactive in the catalogue.",
    section: "inventory", type: "boolean", defaultValue: "true",
  },

  // ── Finance ────────────────────────────────────────────────────────────────
  DEFAULT_CURRENCY: {
    label: "Currency used across the system",
    description: "This is the currency shown on all cost records, reports, and approval thresholds. Use a standard code like RWF, USD, or EUR.",
    section: "finance", type: "text", defaultValue: "RWF",
  },
  COST_ENTRY_REQUIRED: {
    label: "Accountant must record a cost before closing a transfer",
    description: "When on, a transfer cannot be marked Completed until an accountant has attached a cost record to it.",
    section: "finance", type: "boolean", defaultValue: "true",
  },
  FINANCE_REPORT_DATE_RANGE_DAYS: {
    label: "Default date range on finance reports",
    description: "When an accountant opens the finance report, the date filter will default to showing this many days back from today.",
    section: "finance", type: "number", unit: "days", defaultValue: "30",
  },
  TAX_RATE_PERCENT: {
    label: "Default tax rate applied to transfer costs",
    description: "This percentage is used to calculate tax on transfer costs when an accountant records a cost. Set to 0 to disable.",
    section: "finance", type: "number", unit: "%", defaultValue: "0",
  },
  MULTI_CURRENCY_ENABLED: {
    label: "Allow costs to be recorded in other currencies",
    description: "When on, accountants can record costs in a currency different from the system default. The system will not convert the value automatically.",
    section: "finance", type: "boolean", defaultValue: "false",
  },

  // ── Security ───────────────────────────────────────────────────────────────
  SESSION_TIMEOUT_MINUTES: {
    label: "Sign users out after being idle for",
    description: "If a user does nothing for this many minutes, they are automatically signed out for security.",
    section: "security", type: "number", unit: "minutes", defaultValue: "1440",
  },
  MAX_LOGIN_ATTEMPTS: {
    label: "Lock account after this many wrong passwords",
    description: "If someone enters the wrong password this many times in a row, their account is locked until an admin unlocks it or the lockout period expires.",
    section: "security", type: "number", unit: "attempts", defaultValue: "5",
  },
  LOCKOUT_DURATION_MINUTES: {
    label: "Keep a locked account locked for",
    description: "After being locked out, this is how many minutes a user must wait before they can try to log in again.",
    section: "security", type: "number", unit: "minutes", defaultValue: "15",
  },
  REQUIRE_STRONG_PASSWORD: {
    label: "Require strong passwords",
    description: "When on, passwords must include uppercase and lowercase letters, at least one number, and one special character such as ! or @.",
    section: "security", type: "boolean", defaultValue: "true",
  },
  PASSWORD_EXPIRY_DAYS: {
    label: "Ask users to change their password every",
    description: "Users will be prompted to set a new password after this many days. Set to 0 to never ask for a password change.",
    section: "security", type: "number", unit: "days", defaultValue: "0",
  },
  TWO_FACTOR_ENABLED: {
    label: "Enable two-factor authentication",
    description: "When on, users must verify their identity with a second step (like an OTP) after entering their password.",
    section: "security", type: "boolean", defaultValue: "false",
  },

  // ── Audit ──────────────────────────────────────────────────────────────────
  AUDIT_RETENTION_DAYS: {
    label: "Keep audit logs for",
    description: "Log entries older than this number of days are deleted automatically each night. Set higher to keep more history.",
    section: "audit", type: "number", unit: "days", defaultValue: "365",
  },
  AUDIT_LOG_READS: {
    label: "Log when users view sensitive data",
    description: "When on, a log entry is created every time someone views user details, stock levels, or financial records.",
    section: "audit", type: "boolean", defaultValue: "false",
  },
  AUDIT_EXPORT_ENABLED: {
    label: "Allow audit log to be downloaded",
    description: "When on, admins can export the full audit log as a CSV file for external review or compliance.",
    section: "audit", type: "boolean", defaultValue: "true",
  },
  AUDIT_MAX_EXPORT_ROWS: {
    label: "Maximum rows in one audit export",
    description: "Limits how many rows can be downloaded at once to prevent very large file exports.",
    section: "audit", type: "number", unit: "rows", defaultValue: "10000",
  },
  AUDIT_INCLUDE_READ_EVENTS: {
    label: "Include view events in exports",
    description: "When on, exported audit files will include entries for every time a user viewed a record, not just when they changed something.",
    section: "audit", type: "boolean", defaultValue: "false",
  },

  // ── Notifications ──────────────────────────────────────────────────────────
  NOTIFY_ON_TRANSFER_SUBMIT: {
    label: "Notify managers when a new request comes in",
    description: "When on, branch managers receive an in-app notification every time a new transfer request is submitted in their branch.",
    section: "notifications", type: "boolean", defaultValue: "true",
  },
  NOTIFY_ON_APPROVAL: {
    label: "Notify staff when their request is approved",
    description: "When on, the person who submitted a transfer gets an in-app notification when it is approved or rejected.",
    section: "notifications", type: "boolean", defaultValue: "true",
  },
  NOTIFY_ON_LOW_STOCK: {
    label: "Notify managers when stock runs low",
    description: "When on, branch managers get an in-app notification when any item in their branch drops below the low stock level.",
    section: "notifications", type: "boolean", defaultValue: "true",
  },
  NOTIFY_DIGEST_ENABLED: {
    label: "Send a daily summary to managers",
    description: "When on, branch managers receive a single daily notification summarising pending requests and low stock items instead of individual alerts.",
    section: "notifications", type: "boolean", defaultValue: "false",
  },
  DIGEST_SEND_HOUR: {
    label: "Send the daily summary at",
    description: "The hour of the day (in 24-hour format) when the daily digest notification is sent. Example: 8 means 8:00 AM.",
    section: "notifications", type: "number", unit: "hour (0-23)", defaultValue: "8",
  },
}

const SECTIONS = [
  { key: "approvals",     label: "Approvals",      icon: "✓", desc: "Who approves transfers and when they expire" },
  { key: "transfers",     label: "Transfers",       icon: "⇄", desc: "Rules for creating and managing transfers" },
  { key: "inventory",     label: "Inventory",       icon: "▦", desc: "Stock alerts, adjustments, and item rules" },
  { key: "finance",       label: "Finance",         icon: "₣", desc: "Currency, costs, and report defaults" },
  { key: "security",      label: "Security",        icon: "⊕", desc: "Passwords, sessions, and account lockout" },
  { key: "audit",         label: "Audit log",       icon: "≡", desc: "What gets logged and for how long" },
  { key: "notifications", label: "Notifications",   icon: "◎", desc: "In-app alerts and daily digests" },
]

// ─── Toggle switch ────────────────────────────────────────────────────────────
function Toggle({ checked, onChange, disabled }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => !disabled && onChange(!checked)}
      style={{
        width: 44, height: 24, borderRadius: 12, border: "none",
        background: checked ? "#1a1f0e" : "#d1d5db",
        position: "relative", cursor: disabled ? "default" : "pointer",
        transition: "background 0.2s", flexShrink: 0, padding: 0,
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <span style={{
        position: "absolute", top: 4,
        left: checked ? 24 : 4,
        width: 16, height: 16, borderRadius: "50%", background: "#fff",
        transition: "left 0.2s", display: "block",
        boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
      }} />
    </button>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function SystemConfigPage() {
  const [configs,       setConfigs]       = useState([])
  const [editing,       setEditing]       = useState({})
  const [saving,        setSaving]        = useState({})
  const [saved,         setSaved]         = useState({})
  const [loading,       setLoading]       = useState(true)
  const [error,         setError]         = useState(null)
  const [search,        setSearch]        = useState("")
  const [activeSection, setActiveSection] = useState("approvals")
  const [showChangedOnly, setShowChangedOnly] = useState(false)
  const sectionRefs = useRef({})

  useEffect(() => {
    api.get("/config")
      .then(res => setConfigs(Array.isArray(res.data ?? res) ? (res.data ?? res) : []))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  // scroll spy — update active section as user scrolls
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) setActiveSection(entry.target.dataset.section)
        })
      },
      { rootMargin: "-30% 0px -60% 0px" }
    )
    Object.values(sectionRefs.current).forEach(el => el && observer.observe(el))
    return () => observer.disconnect()
  }, [configs])

  function startEdit(id, val) {
    setEditing(prev => ({ ...prev, [id]: String(val) }))
    setSaved(prev => ({ ...prev, [id]: false }))
  }
  function cancelEdit(id) {
    setEditing(prev => { const n = { ...prev }; delete n[id]; return n })
  }
  function resetToDefault(config) {
    const def = CONFIG_META[config.configKey]?.defaultValue
    if (def !== undefined) startEdit(config.id, def)
  }

  async function saveValue(id, value) {
    setSaving(prev => ({ ...prev, [id]: true }))
    try {
      const res = await api.put(`/config/${id}`, { configValue: String(value) })
      const updated = res.data ?? res
      setConfigs(prev => prev.map(c => c.id === id ? updated : c))
      setSaved(prev => ({ ...prev, [id]: true }))
      setEditing(prev => { const n = { ...prev }; delete n[id]; return n })
      toast.success("Saved")
      setTimeout(() => setSaved(prev => ({ ...prev, [id]: false })), 3000)
    } catch (e) {
      toast.error(e.message ?? "Could not save")
    } finally {
      setSaving(prev => ({ ...prev, [id]: false }))
    }
  }

  const isChanged = c => {
    const def = CONFIG_META[c.configKey]?.defaultValue
    return def !== undefined && c.configValue !== def
  }

  const q = search.trim().toLowerCase()
  const matchesSearch = c => {
    if (!q) return true
    const m = CONFIG_META[c.configKey]
    return c.configKey.toLowerCase().includes(q)
      || (m?.label ?? "").toLowerCase().includes(q)
      || (m?.description ?? "").toLowerCase().includes(q)
  }

  const getRows = key =>
    configs.filter(c => CONFIG_META[c.configKey]?.section === key
      && matchesSearch(c)
      && (!showChangedOnly || isChanged(c)))

  const unknownRows = configs.filter(c => !CONFIG_META[c.configKey] && matchesSearch(c))

  const totalEditing = Object.keys(editing).length
  const totalChanged = configs.filter(isChanged).length

  function scrollTo(key) {
    sectionRefs.current[key]?.scrollIntoView({ behavior: "smooth", block: "start" })
    setActiveSection(key)
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <style>{`
        @keyframes skeletonPulse { 0%,100%{opacity:1} 50%{opacity:.4} }
        .cfg-nav-item { transition: background .12s, color .12s; }
        .cfg-nav-item:hover { background: #f0f1ec !important; }
        .cfg-nav-item.on { background: #1a1f0e !important; color: #fff !important; }
        .cfg-row { transition: background .1s; }
        .cfg-row:hover { background: #fafaf8 !important; }
        .ghost-btn { transition: background .1s, border-color .1s; }
        .ghost-btn:hover { background: #f7f8f4 !important; border-color: #d1d5db !important; }
        .cfg-input:focus { border-color: #1a1f0e !important; box-shadow: 0 0 0 3px rgba(26,31,14,0.08) !important; }
      `}</style>

      <PageHeader
        title="System Configuration"
        subtitle="Control how approvals, transfers, inventory, finance, security, and notifications work across all branches."
      />

      {/* ── stat cards ── */}
      {!loading && (
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {[
            { n: configs.length,      label: "Total settings" },
            { n: SECTIONS.length,     label: "Sections" },
            { n: totalChanged,        label: "Changed from default", warn: totalChanged > 0 },
            { n: totalEditing,        label: "Unsaved changes",      danger: totalEditing > 0 },
          ].map(s => (
            <div key={s.label} style={{
              background: s.danger ? "#fef2f2" : s.warn ? "#fffbeb" : "#fff",
              border: `1px solid ${s.danger ? "#fecaca" : s.warn ? "#fde68a" : "#e8ebe3"}`,
              borderRadius: 8, padding: "10px 18px", minWidth: 120,
            }}>
              <div style={{ fontSize: 22, fontWeight: 600, color: s.danger ? "#dc2626" : s.warn ? "#92400e" : "#1a1f0e", fontFamily: "'DM Mono', monospace", lineHeight: 1.2 }}>{s.n}</div>
              <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", padding: "10px 16px", borderRadius: 6, fontFamily: "'DM Mono', monospace", fontSize: 12 }}>
          {error}
        </div>
      )}

      <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>

        {/* ── sidebar ── */}
        <nav style={{
          width: 196, flexShrink: 0,
          background: "#fff", border: "1px solid #e8ebe3", borderRadius: 10, overflow: "hidden",
          position: "sticky", top: 24,
        }}>
          <div style={{ padding: "11px 14px 9px", borderBottom: "1px solid #f3f4f0" }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: ".08em" }}>Jump to</span>
          </div>
          {SECTIONS.map(s => {
            const count   = configs.filter(c => CONFIG_META[c.configKey]?.section === s.key).length
            const changed = configs.filter(c => CONFIG_META[c.configKey]?.section === s.key && isChanged(c)).length
            const active  = activeSection === s.key
            return (
              <button
                key={s.key}
                onClick={() => scrollTo(s.key)}
                className={`cfg-nav-item${active ? " on" : ""}`}
                style={{
                  width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "9px 14px", border: "none", background: "transparent", cursor: "pointer",
                  borderBottom: "1px solid #f7f8f4", color: active ? "#fff" : "#374151",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 13, lineHeight: 1, opacity: .65 }}>{s.icon}</span>
                  <span style={{ fontSize: 12, fontWeight: 500 }}>{s.label}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  {changed > 0 && (
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: active ? "#fde68a" : "#f59e0b", flexShrink: 0 }} />
                  )}
                  <span style={{ fontSize: 10, opacity: .45, fontFamily: "'DM Mono', monospace" }}>{count}</span>
                </div>
              </button>
            )
          })}
          {/* help box */}
          <div style={{ margin: 10, background: "#f7f8f4", borderRadius: 6, padding: "10px 12px" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#374151", marginBottom: 4 }}>Need help?</div>
            <div style={{ fontSize: 11, color: "#9ca3af", lineHeight: 1.5 }}>Changes take effect immediately and are logged in the audit trail.</div>
          </div>
        </nav>

        {/* ── main content ── */}
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 16 }}>

          {/* toolbar */}
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <div style={{ position: "relative", flex: 1 }}>
              <span style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "#9ca3af", fontSize: 14, pointerEvents: "none" }}>⌕</span>
              <input
                type="text"
                placeholder="Search all settings…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="cfg-input"
                style={{
                  width: "100%", boxSizing: "border-box",
                  border: "1px solid #e8ebe3", borderRadius: 7,
                  padding: "8px 12px 8px 32px", fontSize: 13,
                  fontFamily: "'Inter', sans-serif", outline: "none",
                  background: "#fff", color: "#1a1f0e", transition: "border-color .15s",
                }}
              />
              {search && (
                <button onClick={() => setSearch("")} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9ca3af", fontSize: 16, lineHeight: 1 }}>×</button>
              )}
            </div>
            <button
              onClick={() => setShowChangedOnly(v => !v)}
              className="ghost-btn"
              style={{
                border: `1px solid ${showChangedOnly ? "#1a1f0e" : "#e8ebe3"}`,
                borderRadius: 7, padding: "8px 14px", fontSize: 12,
                fontFamily: "'Inter', sans-serif", cursor: "pointer",
                background: showChangedOnly ? "#1a1f0e" : "#fff",
                color: showChangedOnly ? "#fff" : "#374151",
                whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 6,
              }}
            >
              <span style={{ fontSize: 10 }}>{showChangedOnly ? "✕" : "◉"}</span>
              {showChangedOnly ? "All settings" : "Changed only"}
              {!showChangedOnly && totalChanged > 0 && (
                <span style={{ background: "#fde68a", color: "#92400e", borderRadius: 10, padding: "1px 6px", fontSize: 10, fontFamily: "'DM Mono', monospace" }}>{totalChanged}</span>
              )}
            </button>
          </div>

          {/* search result count */}
          {q && !loading && (
            <div style={{ fontSize: 12, color: "#9ca3af", fontFamily: "'DM Mono', monospace" }}>
              {configs.filter(matchesSearch).length} results for "{q}"
            </div>
          )}

          {/* sections */}
          {SECTIONS.map(section => {
            const rows = getRows(section.key)
            if (!loading && rows.length === 0) return null
            const sectionChanged = configs.filter(c => CONFIG_META[c.configKey]?.section === section.key && isChanged(c)).length
            return (
              <div
                key={section.key}
                ref={el => { sectionRefs.current[section.key] = el }}
                data-section={section.key}
                style={{ background: "#fff", border: "1px solid #e8ebe3", borderRadius: 10, overflow: "hidden" }}
              >
                {/* section header */}
                <div style={{ padding: "14px 20px 12px", borderBottom: "1px solid #eaebe6", background: "#f7f8f4", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#1a1f0e", display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 15, opacity: .55 }}>{section.icon}</span>
                      {section.label}
                    </div>
                    <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 3, fontFamily: "'DM Mono', monospace" }}>{section.desc}</div>
                  </div>
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    {sectionChanged > 0 && (
                      <span style={{ fontSize: 11, background: "#fffbeb", color: "#92400e", border: "1px solid #fde68a", borderRadius: 5, padding: "2px 8px", fontFamily: "'DM Mono', monospace" }}>
                        {sectionChanged} changed
                      </span>
                    )}
                    <span style={{ fontSize: 11, background: "#f3f4f0", color: "#6b7280", border: "1px solid #e8ebe3", borderRadius: 5, padding: "2px 8px", fontFamily: "'DM Mono', monospace" }}>
                      {configs.filter(c => CONFIG_META[c.configKey]?.section === section.key).length} settings
                    </span>
                  </div>
                </div>

                {/* column headers */}
                <div style={{ display: "flex", padding: "6px 20px", background: "#fafaf8", borderBottom: "1px solid #f0f1ec" }}>
                  <div style={{ flex: 1, fontSize: 10, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: ".06em" }}>Setting</div>
                  <div style={{ width: 220, fontSize: 10, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: ".06em", textAlign: "right" }}>Value</div>
                </div>

                {loading
                  ? [1,2,3].map(i => <SkeletonRow key={i} />)
                  : rows.map((c, idx) => (
                    <ConfigRow
                      key={c.id}
                      config={c}
                      meta={CONFIG_META[c.configKey]}
                      isEditing={editing[c.id] !== undefined}
                      draftValue={editing[c.id]}
                      isSaving={!!saving[c.id]}
                      isSaved={!!saved[c.id]}
                      isChanged={isChanged(c)}
                      isLast={idx === rows.length - 1}
                      onEdit={() => startEdit(c.id, c.configValue)}
                      onCancel={() => cancelEdit(c.id)}
                      onSave={() => saveValue(c.id, editing[c.id])}
                      onToggle={boolVal => saveValue(c.id, boolVal ? "true" : "false")}
                      onReset={() => resetToDefault(c)}
                      onChange={val => setEditing(prev => ({ ...prev, [c.id]: val }))}
                    />
                  ))
                }
              </div>
            )
          })}

          {/* unknown keys */}
          {!loading && unknownRows.length > 0 && (
            <div style={{ background: "#fff", border: "1px solid #e8ebe3", borderRadius: 10, overflow: "hidden" }}>
              <div style={{ padding: "14px 20px 12px", borderBottom: "1px solid #eaebe6", background: "#f7f8f4" }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#1a1f0e" }}>Other</div>
                <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 3, fontFamily: "'DM Mono', monospace" }}>Keys in the database that have not been assigned a section yet</div>
              </div>
              {unknownRows.map(c => (
                <ConfigRow
                  key={c.id}
                  config={c}
                  meta={{ label: c.configKey, description: c.description ?? "", type: "text" }}
                  isEditing={editing[c.id] !== undefined}
                  draftValue={editing[c.id]}
                  isSaving={!!saving[c.id]}
                  isSaved={!!saved[c.id]}
                  isChanged={false}
                  isLast={false}
                  onEdit={() => startEdit(c.id, c.configValue)}
                  onCancel={() => cancelEdit(c.id)}
                  onSave={() => saveValue(c.id, editing[c.id])}
                  onToggle={() => {}}
                  onReset={() => {}}
                  onChange={val => setEditing(prev => ({ ...prev, [c.id]: val }))}
                />
              ))}
            </div>
          )}

          {!loading && configs.length > 0 && !search && !showChangedOnly && (
            <p style={{ fontSize: 11, color: "#c0c7b8", fontFamily: "'DM Mono', monospace", margin: "0 0 8px" }}>
              {configs.length} settings across {SECTIONS.length} sections · all changes are saved instantly and logged in the audit trail
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── ConfigRow ────────────────────────────────────────────────────────────────
function ConfigRow({ config, meta, isEditing, draftValue, isSaving, isSaved, isChanged, isLast, onEdit, onCancel, onSave, onToggle, onReset, onChange }) {
  const isBoolean = meta.type === "boolean"
  const isNumber  = meta.type === "number"
  const val       = config.configValue
  const isOn      = val === "true"
  const hasDefault = meta.defaultValue !== undefined
  const isDefault  = hasDefault && val === meta.defaultValue

  return (
    <div
      className="cfg-row"
      style={{
        display: "flex", alignItems: "flex-start", padding: "15px 20px",
        borderBottom: isLast ? "none" : "1px solid #f3f4f0",
        background: isChanged ? "#fffef5" : "#fff", gap: 20,
      }}
    >
      {/* left: label + description */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap", marginBottom: 4 }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: "#1a1f0e" }}>{meta.label}</span>
          {isChanged && !isEditing && (
            <span style={{ fontSize: 10, background: "#fffbeb", color: "#92400e", border: "1px solid #fde68a", borderRadius: 3, padding: "1px 6px", fontFamily: "'DM Mono', monospace" }}>modified</span>
          )}
          {isSaved && (
            <span style={{ fontSize: 10, background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0", borderRadius: 3, padding: "1px 6px", fontFamily: "'DM Mono', monospace" }}>✓ saved</span>
          )}
        </div>
        <p style={{ fontSize: 12, color: "#6b7280", margin: "0 0 5px", lineHeight: 1.6 }}>{meta.description}</p>
        {hasDefault && (
          <span style={{ fontSize: 10, color: "#b5bdb0", fontFamily: "'DM Mono', monospace" }}>
            Default: <span style={{ color: isDefault ? "#b5bdb0" : "#92400e" }}>{meta.defaultValue}{meta.unit ? " " + meta.unit : ""}</span>
          </span>
        )}
      </div>

      {/* right: control */}
      <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 8, paddingTop: 3, width: 220, justifyContent: "flex-end" }}>
        {isBoolean ? (
          // instant toggle
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 12, color: isOn ? "#1a1f0e" : "#9ca3af", fontWeight: isOn ? 500 : 400, minWidth: 20 }}>
              {isSaving ? "…" : isOn ? "On" : "Off"}
            </span>
            <Toggle checked={isOn} onChange={onToggle} disabled={isSaving} />
          </div>
        ) : isEditing ? (
          // edit mode
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <input
                type={isNumber ? "number" : "text"}
                value={draftValue}
                onChange={e => onChange(e.target.value)}
                autoFocus
                min={isNumber ? 0 : undefined}
                className="cfg-input"
                style={{
                  border: "1px solid #1a1f0e", borderRadius: 6,
                  padding: "5px 9px", fontSize: 13,
                  fontFamily: "'DM Mono', monospace", width: 80,
                  outline: "none", color: "#1a1f0e", background: "#fff",
                  transition: "border-color .15s, box-shadow .15s",
                }}
              />
              {meta.unit && <span style={{ fontSize: 11, color: "#9ca3af", fontFamily: "'DM Mono', monospace", whiteSpace: "nowrap" }}>{meta.unit}</span>}
            </div>
            <button
              onClick={onSave} disabled={isSaving}
              style={{ background: "#1a1f0e", color: "#fff", border: "none", borderRadius: 6, padding: "5px 12px", fontSize: 12, cursor: isSaving ? "default" : "pointer", opacity: isSaving ? .6 : 1 }}
            >{isSaving ? "…" : "Save"}</button>
            <button
              onClick={onCancel}
              className="ghost-btn"
              style={{ background: "transparent", color: "#6b7280", border: "1px solid #e8ebe3", borderRadius: 6, padding: "5px 10px", fontSize: 12, cursor: "pointer" }}
            >Cancel</button>
          </div>
        ) : (
          // display mode
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{
              fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#374151",
              background: "#f7f8f4", border: "1px solid #e8ebe3", borderRadius: 5, padding: "3px 10px",
              whiteSpace: "nowrap",
            }}>
              {meta.unit ? `${val} ${meta.unit}` : val}
            </span>
            <button
              onClick={onEdit}
              className="ghost-btn"
              style={{ background: "transparent", color: "#6b7280", border: "1px solid #e8ebe3", borderRadius: 6, padding: "5px 11px", fontSize: 12, cursor: "pointer" }}
            >Edit</button>
            {isChanged && hasDefault && (
              <button
                onClick={onReset}
                title={`Reset to default: ${meta.defaultValue}`}
                className="ghost-btn"
                style={{ background: "transparent", color: "#9ca3af", border: "1px solid #e8ebe3", borderRadius: 6, padding: "5px 10px", fontSize: 11, cursor: "pointer" }}
              >Reset</button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function SkeletonRow() {
  const s = { borderRadius: 4, background: "#f0f1ec", animation: "skeletonPulse 1.4s ease-in-out infinite" }
  return (
    <div style={{ display: "flex", padding: "15px 20px", borderBottom: "1px solid #f3f4f0", gap: 20, alignItems: "flex-start" }}>
      <div style={{ flex: 1 }}>
        <div style={{ ...s, height: 13, width: 220, marginBottom: 8 }} />
        <div style={{ ...s, height: 11, width: "75%" }} />
        <div style={{ ...s, height: 11, width: "55%", marginTop: 6 }} />
        <div style={{ ...s, height: 10, width: 100, marginTop: 8 }} />
      </div>
      <div style={{ display: "flex", gap: 6, paddingTop: 3 }}>
        <div style={{ ...s, height: 28, width: 70 }} />
        <div style={{ ...s, height: 28, width: 50 }} />
      </div>
    </div>
  )
}