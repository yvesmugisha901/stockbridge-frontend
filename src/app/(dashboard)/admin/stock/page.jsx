"use client"
import { useState, useEffect } from "react"
import PageHeader from "@/components/ui/PageHeader"
import { getToken } from "@/lib/auth/tokens"

const API = process.env.NEXT_PUBLIC_API_URL

export default function AllStockPage() {
  const [stock,   setStock]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        const res = await fetch(`${API}/stock?page=0&size=100`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        })
        if (!cancelled && res.ok) {
          const j = await res.json()
          setStock(j.data?.content ?? j.content ?? j.data ?? j ?? [])
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
      <PageHeader
        title="All Stock"
        subtitle="Current stock levels across all branches."
      />
      {error && <ErrorBanner msg={error} />}
      <div style={{ background: "#fff", border: "1px solid #e8ebe3", borderRadius: 8, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, fontFamily: "'Inter', sans-serif" }}>
          <thead>
            <tr style={{ background: "#f7f8f4", borderBottom: "1px solid #e8ebe3" }}>
              {["Branch", "Item", "Category", "On Hand", "Reserved", "Min Threshold", "Status"].map(h => (
                <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontWeight: 500, color: "#6b7280", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ padding: 32, textAlign: "center", color: "#9ca3af" }}>Loading…</td></tr>
            ) : stock.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: 32, textAlign: "center", color: "#9ca3af" }}>No stock records found</td></tr>
            ) : stock.map((s, i) => {
              const low = s.quantityOnHand <= s.minimumThreshold
              return (
                <tr key={s.id ?? i} style={{ borderBottom: "1px solid #f3f4f0" }}>
                  <td style={{ padding: "10px 16px", color: "#1a1f0e", fontWeight: 500 }}>{s.branchName ?? s.branch?.name}</td>
                  <td style={{ padding: "10px 16px", color: "#1a1f0e" }}>{s.itemName ?? s.item?.name}</td>
                  <td style={{ padding: "10px 16px", color: "#6b7280" }}>{s.category ?? s.item?.category}</td>
                  <td style={{ padding: "10px 16px", fontFamily: "'DM Mono', monospace", color: low ? "#dc2626" : "#1a1f0e", fontWeight: low ? 600 : 400 }}>{s.quantityOnHand}</td>
                  <td style={{ padding: "10px 16px", fontFamily: "'DM Mono', monospace", color: "#6b7280" }}>{s.reservedQuantity ?? 0}</td>
                  <td style={{ padding: "10px 16px", fontFamily: "'DM Mono', monospace", color: "#6b7280" }}>{s.minimumThreshold}</td>
                  <td style={{ padding: "10px 16px" }}>
                    {low
                      ? <span style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", textTransform: "uppercase", letterSpacing: "0.1em", padding: "3px 8px", borderRadius: 3, background: "#fef2f2", color: "#dc2626" }}>Low</span>
                      : <span style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", textTransform: "uppercase", letterSpacing: "0.1em", padding: "3px 8px", borderRadius: 3, background: "#e4f0df", color: "#3d7a2b" }}>OK</span>
                    }
                  </td>
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