"use client"
import { useState, useEffect } from "react"
import PageHeader from "@/components/ui/PageHeader"
import { getToken } from "@/lib/auth/tokens"

const API = process.env.NEXT_PUBLIC_API_URL

const STATUS_COLORS = {
  PENDING:           { bg: "#fef9e7", color: "#b45309" },
  MANAGER_APPROVED:  { bg: "#eff6ff", color: "#1d4ed8" },
  HO_APPROVED:       { bg: "#e4f0df", color: "#3d7a2b" },
  IN_TRANSIT:        { bg: "#f0f4ff", color: "#4338ca" },
  RECEIVED:          { bg: "#e4f0df", color: "#3d7a2b" },
  COMPLETED:         { bg: "#e4f0df", color: "#3d7a2b" },
  REJECTED:          { bg: "#fef2f2", color: "#dc2626" },
  CANCELLED:         { bg: "#f3f4f0", color: "#6b7280" },
}

export default function AllTransfersPage() {
  const [transfers, setTransfers] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        const res = await fetch(`${API}/transfers?page=0&size=100`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        })
        if (!cancelled && res.ok) {
          const j = await res.json()
          setTransfers(j.data?.content ?? j.content ?? j.data ?? j ?? [])
        }
      } catch (err) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <PageHeader title="All Transfers" subtitle="Complete transfer history across all branches." />
      {error && <ErrorBanner msg={error} />}
      <div style={{ background: "#fff", border: "1px solid #e8ebe3", borderRadius: 8, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, fontFamily: "'Inter', sans-serif" }}>
          <thead>
            <tr style={{ background: "#f7f8f4", borderBottom: "1px solid #e8ebe3" }}>
              {["ID", "From", "To", "Item", "Qty", "Status", "Date"].map(h => (
                <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontWeight: 500, color: "#6b7280", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ padding: 32, textAlign: "center", color: "#9ca3af" }}>Loading…</td></tr>
            ) : transfers.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: 32, textAlign: "center", color: "#9ca3af" }}>No transfers found</td></tr>
            ) : transfers.map((t, i) => {
              const sc = STATUS_COLORS[t.status] ?? STATUS_COLORS.CANCELLED
              return (
                <tr key={t.id ?? i} style={{ borderBottom: "1px solid #f3f4f0" }}>
                  <td style={{ padding: "10px 16px", fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#9ca3af" }}>#{t.id}</td>
                  <td style={{ padding: "10px 16px", color: "#1a1f0e" }}>{t.sourceBranchName ?? t.sourceBranch?.name}</td>
                  <td style={{ padding: "10px 16px", color: "#1a1f0e" }}>{t.destinationBranchName ?? t.destinationBranch?.name}</td>
                  <td style={{ padding: "10px 16px", color: "#6b7280" }}>{t.itemName ?? t.item?.name}</td>
                  <td style={{ padding: "10px 16px", fontFamily: "'DM Mono', monospace" }}>{t.quantity}</td>
                  <td style={{ padding: "10px 16px" }}>
                    <span style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", textTransform: "uppercase", letterSpacing: "0.1em", padding: "3px 8px", borderRadius: 3, ...sc }}>{t.status}</span>
                  </td>
                  <td style={{ padding: "10px 16px", color: "#6b7280", fontSize: 12 }}>{t.createdAt ? new Date(t.createdAt).toLocaleDateString() : "—"}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function ErrorBanner({ msg }) {
  return <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", padding: "10px 16px", fontFamily: "'DM Mono', monospace", fontSize: 12 }}>{msg}</div>
}