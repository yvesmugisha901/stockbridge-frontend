"use client"
import { useState, useEffect, useRef } from "react"
import PageHeader from "@/components/ui/PageHeader"
import { getToken } from "@/lib/auth/tokens"

const API = process.env.NEXT_PUBLIC_API_URL
if (!API) console.error("[AuditLog] NEXT_PUBLIC_API_URL is not set")

const ACTION_TYPES = [
  "",
  "TRANSFER_CREATED",
  "MANAGER_APPROVED",
  "HO_APPROVED",
  "MARKED_IN_TRANSIT",
  "RECEIPT_CONFIRMED",
  "CREATE",
  "UPDATE",
  "DELETE",
  "LOGIN",
  "LOGOUT",
]
const PAGE_SIZE = 10

export default function AuditLogPage() {
  const [logs,       setLogs]       = useState([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState(null)
  const [page,       setPage]       = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [total,      setTotal]      = useState(0)

  // Filters
  const [search,   setSearch]   = useState("")
  const [action,   setAction]   = useState("")
  const [entity,   setEntity]   = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo,   setDateTo]   = useState("")

  // Debounce search
  const [debouncedSearch, setDebouncedSearch] = useState("")
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(t)
  }, [search])

  // Reset to page 0 when filters change (skip first render)
  const isFirstRender = useRef(true)
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return }
    setPage(0)
  }, [debouncedSearch, action, entity, dateFrom, dateTo])

  // Fetch
  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        page: String(page),
        size: String(PAGE_SIZE),
        sort: "performedAt,desc",
      })
      if (debouncedSearch) params.set("search",     debouncedSearch)
      if (action)          params.set("action",     action)
      if (entity)          params.set("entityType", entity)
      if (dateFrom)        params.set("from",       dateFrom)
      if (dateTo)          params.set("to",         dateTo)

      try {
        const res = await fetch(`${API}/admin/audit-log?${params}`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const j = await res.json()
        const pageData = j.data ?? {}
        if (!cancelled) {
          setLogs(pageData.content ?? [])
          setTotalPages(pageData.totalPages ?? 0)
          setTotal(pageData.totalElements ?? 0)
        }
      } catch (err) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [page, debouncedSearch, action, entity, dateFrom, dateTo])

  const clearFilters = () => {
    setSearch("")
    setAction("")
    setEntity("")
    setDateFrom("")
    setDateTo("")
  }

  const hasFilters = search || action || entity || dateFrom || dateTo

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <PageHeader title="Audit Log" subtitle="Immutable record of all significant system events." />

      {error && <ErrorBanner msg={error} />}

      {/* ── Filters ── */}
      <div style={{
        background: "#fff",
        border: "1px solid #e8ebe3",
        borderRadius: 8,
        padding: "16px 20px",
        display: "flex",
        flexWrap: "wrap",
        gap: 10,
        alignItems: "flex-end",
      }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: "1 1 200px" }}>
          <label style={labelStyle}>Search</label>
          <input
            type="text"
            placeholder="User, action, details…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: "0 1 140px" }}>
          <label style={labelStyle}>Action</label>
          <select value={action} onChange={e => setAction(e.target.value)} style={inputStyle}>
            {ACTION_TYPES.map(a => (
              <option key={a} value={a}>{a || "All actions"}</option>
            ))}
          </select>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: "0 1 140px" }}>
          <label style={labelStyle}>Entity</label>
          <input
            type="text"
            placeholder="e.g. USER"
            value={entity}
            onChange={e => setEntity(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: "0 1 150px" }}>
          <label style={labelStyle}>From</label>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={inputStyle} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: "0 1 150px" }}>
          <label style={labelStyle}>To</label>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={inputStyle} />
        </div>

        {hasFilters && (
          <button onClick={clearFilters} style={{
            alignSelf: "flex-end",
            background: "none",
            border: "1px solid #dde0d4",
            borderRadius: 6,
            padding: "7px 14px",
            fontFamily: "'DM Mono', monospace",
            fontSize: 11,
            color: "#6b7260",
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}>
            Clear ×
          </button>
        )}
      </div>

      {/* ── Table ── */}
      <div style={{ background: "#fff", border: "1px solid #e8ebe3", borderRadius: 8, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, fontFamily: "'Inter', sans-serif" }}>
          <thead>
            <tr style={{ background: "#f7f8f4", borderBottom: "1px solid #e8ebe3" }}>
              {["Time", "User", "Action", "Entity", "Details"].map(h => (
                <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontWeight: 500, color: "#6b7280", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} style={{ padding: 40, textAlign: "center", color: "#9ca3af", fontFamily: "'DM Mono', monospace", fontSize: 12 }}>
                  Loading…
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: 40, textAlign: "center", color: "#9ca3af" }}>
                  No audit logs found
                </td>
              </tr>
            ) : logs.map((log, i) => (
              <tr
                key={log.id ?? i}
                style={{ borderBottom: "1px solid #f3f4f0", transition: "background 0.1s" }}
                onMouseEnter={e => e.currentTarget.style.background = "#fafaf8"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <td style={{ padding: "10px 16px", fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#9ca3af", whiteSpace: "nowrap" }}>
                  {log.timestamp ? new Date(log.timestamp).toLocaleString() : "—"}
                </td>
                <td style={{ padding: "10px 16px", color: "#6b7280", fontSize: 12 }}>{log.performedBy ?? "—"}</td>
                <td style={{ padding: "10px 16px" }}>
                  <ActionBadge action={log.action} />
                </td>
                <td style={{ padding: "10px 16px", color: "#6b7280" }}>{log.entityType ?? "—"}</td>
                <td style={{ padding: "10px 16px", color: "#6b7280", fontSize: 12, maxWidth: 320, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {log.details ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ── */}
      {total > 0 && (
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
          padding: "10px 4px",
          fontFamily: "'DM Mono', monospace",
          fontSize: 11,
          color: "#6b7260",
        }}>
          {/* Left: "Page X of Y · Z records" */}
          <span style={{ color: "#9ca3af" }}>
            Page {page + 1} of {totalPages || 1} · {total} {total === 1 ? "record" : "records"}
          </span>

          {/* Right: « ‹ 1 2 3 … N › » */}
          {totalPages > 1 && (
            <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
              {/* First page */}
              <NavBtn label="«" onClick={() => setPage(0)} disabled={page === 0 || loading} />
              {/* Prev */}
              <NavBtn label="‹" onClick={() => setPage(p => p - 1)} disabled={page === 0 || loading} />

              {/* Numbered pages */}
              {getPageNumbers(page, totalPages).map((p, i) =>
                p === "…"
                  ? <span key={`ellipsis-${i}`} style={{ padding: "0 4px", color: "#9ca3af" }}>…</span>
                  : <NavBtn
                      key={p}
                      label={String(p + 1)}
                      active={p === page}
                      disabled={loading}
                      onClick={() => setPage(p)}
                    />
              )}

              {/* Next */}
              <NavBtn label="›" onClick={() => setPage(p => p + 1)} disabled={page >= totalPages - 1 || loading} />
              {/* Last page */}
              <NavBtn label="»" onClick={() => setPage(totalPages - 1)} disabled={page >= totalPages - 1 || loading} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Page number logic ─────────────────────────────────────────────────────────
function getPageNumbers(current, total) {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i)
  }

  const pages = new Set()
  pages.add(0)
  pages.add(total - 1)
  for (let i = Math.max(0, current - 2); i <= Math.min(total - 1, current + 2); i++) {
    pages.add(i)
  }

  const sorted = Array.from(pages).sort((a, b) => a - b)
  const result = []
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) result.push("…")
    result.push(sorted[i])
  }
  return result
}

// ─── Action badge ──────────────────────────────────────────────────────────────
const BADGE_RULES = [
  { keywords: ["DELETE", "REMOVE", "REJECT", "CANCEL", "VOID"],            bg: "#fef2f2", color: "#dc2626" },
  { keywords: ["APPROVED", "CONFIRMED", "CREATED", "ADD", "CREATE", "APPROVE"], bg: "#f0f7ed", color: "#3d7a2b" },
  { keywords: ["TRANSIT", "DISPATCH", "UPDATE", "EDIT", "FORWARD"],        bg: "#eff6ff", color: "#2563eb" },
  { keywords: ["LOGIN", "LOGOUT", "AUTH"],                                  bg: "#f5f3ff", color: "#7c3aed" },
]

function getBadgeStyle(action = "") {
  const up = action.toUpperCase()
  for (const rule of BADGE_RULES) {
    if (rule.keywords.some(k => up.includes(k))) {
      return { bg: rule.bg, color: rule.color }
    }
  }
  return { bg: "#f3f4f6", color: "#6b7280" }
}

function ActionBadge({ action = "" }) {
  const s = getBadgeStyle(action)
  return (
    <span style={{
      background: s.bg,
      color: s.color,
      fontFamily: "'DM Mono', monospace",
      fontSize: 10,
      fontWeight: 600,
      padding: "3px 8px",
      borderRadius: 999,
      whiteSpace: "nowrap",
      letterSpacing: "0.04em",
    }}>
      {action}
    </span>
  )
}

// ─── Pagination button (matches Reports page style) ───────────────────────────
function NavBtn({ label, onClick, disabled, active }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        minWidth: 32,
        height: 32,
        padding: "0 6px",
        border: active ? "1.5px solid #1a1f0e" : "1px solid #e8ebe3",
        borderRadius: 6,
        background: active ? "#1a1f0e" : disabled ? "#f9fafb" : "#fff",
        color: active ? "#fff" : disabled ? "#d1d5db" : "#3d4535",
        fontFamily: "'DM Mono', monospace",
        fontSize: 12,
        fontWeight: active ? 600 : 400,
        cursor: disabled ? "not-allowed" : "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.1s",
        lineHeight: 1,
      }}
    >
      {label}
    </button>
  )
}

// ─── Error banner ──────────────────────────────────────────────────────────────
function ErrorBanner({ msg }) {
  return (
    <div style={{
      background: "#fef2f2",
      border: "1px solid #fecaca",
      borderRadius: 6,
      color: "#dc2626",
      padding: "10px 16px",
      fontFamily: "'DM Mono', monospace",
      fontSize: 12,
    }}>
      {msg}
    </div>
  )
}

// ─── Shared styles ─────────────────────────────────────────────────────────────
const inputStyle = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 13,
  color: "#1a1f0e",
  background: "#fff",
  border: "1px solid #dde0d4",
  borderRadius: 6,
  padding: "7px 10px",
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
}

const labelStyle = {
  fontFamily: "'DM Mono', monospace",
  fontSize: 10,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: "#9ca3af",
}
