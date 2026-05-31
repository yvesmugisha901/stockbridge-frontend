"use client"
import { useState, useEffect } from "react"
import PageHeader from "@/components/ui/PageHeader"
import { getToken } from "@/lib/auth/tokens"

// Fails loudly at dev time if the var is missing
const API = process.env.NEXT_PUBLIC_API_URL
if (!API) console.error("[AuditLog] NEXT_PUBLIC_API_URL is not set")

export default function AuditLogPage() {
  const [logs,    setLogs]    = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        const res = await fetch(`${API}/admin/audit-log?page=0&size=100`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const j = await res.json()
        // Backend: ApiResponse<Page<AuditLogResponse>> → j.data.content
        if (!cancelled) setLogs(j.data?.content ?? [])
      } catch (err) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])  // ← runs once on mount only, this is correct

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <PageHeader title="Audit Log" subtitle="Immutable record of all significant system events." />
      {error && <ErrorBanner msg={error} />}
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
              <tr><td colSpan={5} style={{ padding: 32, textAlign: "center", color: "#9ca3af" }}>Loading…</td></tr>
            ) : logs.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: 32, textAlign: "center", color: "#9ca3af" }}>No audit logs found</td></tr>
            ) : logs.map((log, i) => (
              <tr key={log.id ?? i} style={{ borderBottom: "1px solid #f3f4f0" }}>
                <td style={{ padding: "10px 16px", fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#9ca3af", whiteSpace: "nowrap" }}>
                  {/* Backend DTO field is "timestamp" mapped from performedAt */}
                  {log.timestamp ? new Date(log.timestamp).toLocaleString() : "—"}
                </td>
                <td style={{ padding: "10px 16px", color: "#6b7280", fontSize: 12 }}>{log.performedBy ?? "—"}</td>
                <td style={{ padding: "10px 16px", color: "#1a1f0e", fontWeight: 500 }}>{log.action}</td>
                <td style={{ padding: "10px 16px", color: "#6b7280" }}>{log.entityType}</td>
                <td style={{ padding: "10px 16px", color: "#6b7280", fontSize: 12 }}>{log.details ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function ErrorBanner({ msg }) {
  return <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", padding: "10px 16px", fontFamily: "'DM Mono', monospace", fontSize: 12 }}>{msg}</div>
}