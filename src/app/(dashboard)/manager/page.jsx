"use client"
import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useAuthContext } from "@/lib/context/AuthContext"
import { api } from "@/lib/api/client"
import toast from "react-hot-toast"
import Link from "next/link"

// ─── Icons ────────────────────────────────────────────────────────────────────
const IconClock = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
)
const IconAlert = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
)
const IconTruck = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13" rx="1"/>
    <path d="M16 8h4l3 5v3h-7V8z"/>
    <circle cx="5.5" cy="18.5" r="2.5"/>
    <circle cx="18.5" cy="18.5" r="2.5"/>
  </svg>
)
const IconInbox = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/>
    <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>
  </svg>
)
const IconTransfer = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/>
    <polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>
  </svg>
)
const IconBuilding = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="1"/>
    <path d="M9 22V12h6v10"/><path d="M9 7h1"/><path d="M14 7h1"/><path d="M9 11h1"/><path d="M14 11h1"/>
  </svg>
)

const STATUS_STYLE = {
  PENDING:          { background: "#fef9c3", color: "#a16207" },
  MANAGER_APPROVED: { background: "#dbeafe", color: "#1d4ed8" },
  HO_APPROVED:      { background: "#e0e7ff", color: "#4338ca" },
  IN_TRANSIT:       { background: "#f3e8ff", color: "#7e22ce" },
  COMPLETED:        { background: "#dcfce7", color: "#15803d" },
  REJECTED:         { background: "#fee2e2", color: "#dc2626" },
  CANCELLED:        { background: "#f3f4f6", color: "#6b7280" },
}
const STATUS_LABEL = {
  PENDING: "Pending",
  MANAGER_APPROVED: "Approved — Awaiting HO",
  HO_APPROVED: "Approved",
  IN_TRANSIT: "In Transit",
  COMPLETED: "Completed",
  REJECTED: "Rejected",
  CANCELLED: "Cancelled",
}

function getRequestedBy(t) {
  return (
    t.requestedByName    ||
    t.requestedByEmail   ||
    t.requesterName      ||
    t.requesterEmail     ||
    t.requestedBy        ||
    t.createdByName      ||
    t.createdByEmail     ||
    null
  )
}

export default function ManagerDashboard() {
  const { user } = useAuthContext()
  const router = useRouter()

  const branchName = user?.branchName || "Your Branch"
  const fullName   = user?.fullName   || "Manager"

  const [pendingApprovals, setPendingApprovals] = useState([])
  const [recentTransfers,  setRecentTransfers]  = useState([])
  const [lowStock,         setLowStock]         = useState([])
  const [readyToDispatch,  setReadyToDispatch]  = useState([])
  const [incoming,         setIncoming]         = useState([])
  const [loading,          setLoading]          = useState(true)
  const [actionLoading,    setActionLoading]    = useState(null)

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true)
      const [pendingRes, transfersRes, stockRes, dispatchRes, incomingRes] =
        await Promise.allSettled([
          api.get("/approvals/pending/manager?size=5&page=0"),
          api.get("/transfers?size=5&page=0&sort=requestedAt,desc"),
          api.get("/stock?size=200"),
          api.get("/transfers/ready-to-dispatch?size=10"),
          api.get("/transfers/incoming?size=10"),
        ])

      if (pendingRes.status  === "fulfilled" && pendingRes.value?.success)
        setPendingApprovals(pendingRes.value.data?.content ?? [])
      if (transfersRes.status === "fulfilled" && transfersRes.value?.success)
        setRecentTransfers(transfersRes.value.data?.content ?? [])
      if (stockRes.status === "fulfilled" && stockRes.value?.success)
        setLowStock((stockRes.value.data?.content ?? []).filter(s => s.quantityOnHand <= s.minimumThreshold))
      if (dispatchRes.status === "fulfilled" && dispatchRes.value?.success)
        setReadyToDispatch(dispatchRes.value.data?.content ?? [])
      if (incomingRes.status === "fulfilled" && incomingRes.value?.success)
        setIncoming(incomingRes.value.data?.content ?? [])
    } catch {
      toast.error("Failed to load dashboard data")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadDashboard() }, [loadDashboard])

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await api.get("/approvals/pending/manager?size=5&page=0")
        if (res?.success) {
          const incoming = res.data?.content ?? []
          setPendingApprovals(prev => {
            if (incoming.length > prev.length) {
              const diff = incoming.length - prev.length
              toast(`${diff} new transfer request${diff > 1 ? "s" : ""} awaiting your approval`, {
                icon: "🔔",
                duration: 5000,
              })
            }
            return incoming
          })
        }
      } catch { /* silent */ }
    }, 30_000)
    return () => clearInterval(interval)
  }, [])

  const handleMarkInTransit = async (id) => {
    try {
      setActionLoading(id)
      await api.patch(`/transfers/${id}/mark-in-transit`)
      toast.success(`Transfer #${id} marked as In Transit`)
      loadDashboard()
    } catch (err) {
      toast.error(err.message || "Failed to mark in transit")
    } finally { setActionLoading(null) }
  }

  const handleConfirmReceipt = async (id) => {
    try {
      setActionLoading(id)
      await api.patch(`/transfers/${id}/confirm-receipt`)
      toast.success(`Transfer #${id} completed — stock updated`)
      loadDashboard()
    } catch (err) {
      toast.error(err.message || "Failed to confirm receipt")
    } finally { setActionLoading(null) }
  }

  const handleReview = (transferId) => {
    router.push(`/manager/approvals/${transferId}`)
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>

      {/* ── Header ── */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <span style={{ color: "#6b7260" }}><IconBuilding /></span>
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", color: "#6b7260" }}>
            {branchName}
          </span>
        </div>
        <h1 style={{ fontFamily: "'Inter', sans-serif", fontSize: 22, fontWeight: 700, color: "#1a1f0e", margin: 0 }}>
          Welcome back, {fullName}
        </h1>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#6b7260", margin: "4px 0 0" }}>
          Here is everything happening at {branchName} today.
        </p>
      </div>

      {/* ── Stat Cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }}>
        <StatCard icon={<IconClock />}   iconBg="#fefce8" iconColor="#ca8a04"
          label="Awaiting Your Approval" value={loading ? "—" : pendingApprovals.length} valueColor="#ca8a04" />
        <StatCard icon={<IconTruck />}   iconBg="#f3e8ff" iconColor="#7e22ce"
          label="Ready to Ship"          value={loading ? "—" : readyToDispatch.length}  valueColor="#7e22ce" />
        <StatCard icon={<IconInbox />}   iconBg="#e0e7ff" iconColor="#4338ca"
          label="Incoming to Branch"     value={loading ? "—" : incoming.length}         valueColor="#4338ca" />
        <StatCard icon={<IconAlert />}   iconBg="#fef2f2" iconColor="#dc2626"
          label="Low Stock Items"        value={loading ? "—" : lowStock.length}         valueColor="#dc2626" />
      </div>

      {/* ── Pending Approvals ── */}
      <Section icon={<IconClock />} iconColor="#ca8a04"
        title="Transfer Requests Awaiting Your Approval"
        link={{ href: "/manager/approvals", label: "View all →" }}>
        <Card>
          {loading ? <Spinner /> : (
            <Table cols={["Request", "Item", "Qty", "From → To", "Requested By", "Date", ""]}>
              {pendingApprovals.length === 0
                ? <EmptyRow cols={7} label="No pending approvals." />
                : pendingApprovals.map((t, i) => {
                    const requestedBy = getRequestedBy(t)
                    return (
                      <tr key={t.id} style={{ borderBottom: i < pendingApprovals.length - 1 ? "1px solid #f0f1ec" : "none" }}>
                        <Td mono>#{t.id}</Td>
                        <Td bold>{t.itemName}</Td>
                        <Td>{t.quantity}</Td>
                        <Td>{t.sourceBranchName} → {t.destinationBranchName}</Td>
                        <Td>{requestedBy ?? <span style={{ color: "#d1d5db", fontStyle: "italic" }}>Unknown</span>}</Td>
                        <Td mono small>{t.requestedAt ? new Date(t.requestedAt).toLocaleDateString() : "—"}</Td>
                        <td style={{ padding: "12px 20px" }}>
                          <button
                            onClick={() => handleReview(t.id)}
                            style={{
                              background: "none", border: "none", cursor: "pointer",
                              fontFamily: "'Inter', sans-serif", fontSize: 12,
                              color: "#3d7a2b", fontWeight: 600, padding: 0,
                            }}
                          >
                            Review →
                          </button>
                        </td>
                      </tr>
                    )
                  })}
            </Table>
          )}
        </Card>
      </Section>

      {/* ── Ready to Ship ── */}
      {!loading && readyToDispatch.length > 0 && (
        <Section icon={<IconTruck />} iconColor="#7e22ce"
          title={`Ready to Ship from ${branchName}`}
          subtitle="These transfers have been approved. Once you physically dispatch the items, mark them as In Transit.">
          <ActionTable rows={readyToDispatch} actionLabel="Mark In Transit"
            actionColor="#7e22ce" actionBg="#f3e8ff"
            actionLoading={actionLoading} onAction={handleMarkInTransit} />
        </Section>
      )}

      {/* ── Incoming ── */}
      {!loading && incoming.length > 0 && (
        <Section icon={<IconInbox />} iconColor="#4338ca"
          title={`Incoming Transfers to ${branchName}`}
          subtitle="These items are on their way to your branch. Confirm receipt once the stock physically arrives.">
          <ActionTable rows={incoming} actionLabel="Confirm Receipt"
            actionColor="#15803d" actionBg="#dcfce7"
            actionLoading={actionLoading} onAction={handleConfirmReceipt} />
        </Section>
      )}

      {/* ── Low Stock ── */}
      {!loading && lowStock.length > 0 && (
        <Section icon={<IconAlert />} iconColor="#dc2626"
          title={`Low Stock at ${branchName}`}>
          <Card>
            {lowStock.slice(0, 5).map((item, idx) => (
              <div key={item.itemId ?? idx} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "12px 20px",
                borderBottom: idx < Math.min(lowStock.length, 5) - 1 ? "1px solid #f0f1ec" : "none",
              }}>
                <div>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 500, color: "#1a1f0e", margin: 0 }}>
                    {item.itemName}
                  </p>
                  <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#9ca3af", marginTop: 2, marginBottom: 0 }}>
                    Minimum threshold: {item.minimumThreshold} {item.unitOfMeasure ?? ""}
                  </p>
                </div>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 700, color: "#dc2626" }}>
                  {item.quantityOnHand} remaining
                </span>
              </div>
            ))}
          </Card>
        </Section>
      )}

      {/* ── Recent Transfers ── */}
      <Section icon={<IconTransfer />} iconColor="#6b7260"
        title={`Recent Transfers — ${branchName}`}
        link={{ href: "/manager/reports", label: "Full report →" }}>
        <Card>
          {loading ? <Spinner /> : (
            <Table cols={["Request", "Item", "Qty", "From → To", "Status", "Date"]}>
              {recentTransfers.length === 0
                ? <EmptyRow cols={6} label="No transfers yet." />
                : recentTransfers.map((t, i) => (
                  <tr key={t.id} style={{ borderBottom: i < recentTransfers.length - 1 ? "1px solid #f0f1ec" : "none" }}>
                    <Td mono>#{t.id}</Td>
                    <Td bold>{t.itemName}</Td>
                    <Td>{t.quantity}</Td>
                    <Td>{t.sourceBranchName} → {t.destinationBranchName}</Td>
                    <td style={{ padding: "12px 20px" }}><Badge status={t.status} /></td>
                    <Td mono small>{t.requestedAt ? new Date(t.requestedAt).toLocaleDateString() : "—"}</Td>
                  </tr>
                ))}
            </Table>
          )}
        </Card>
      </Section>

    </div>
  )
}

// ─── Action table ─────────────────────────────────────────────────────────────
function ActionTable({ rows, actionLabel, actionColor, actionBg, actionLoading, onAction }) {
  return (
    <Card>
      <Table cols={["Request", "Item", "Qty", "From → To", "Status", "Date", "Action"]}>
        {rows.map((t, i) => (
          <tr key={t.id} style={{ borderBottom: i < rows.length - 1 ? "1px solid #f0f1ec" : "none" }}>
            <Td mono>#{t.id}</Td>
            <Td bold>{t.itemName}</Td>
            <Td>{t.quantity}</Td>
            <Td>{t.sourceBranchName} → {t.destinationBranchName}</Td>
            <td style={{ padding: "12px 20px" }}><Badge status={t.status} /></td>
            <Td mono small>{t.requestedAt ? new Date(t.requestedAt).toLocaleDateString() : "—"}</Td>
            <td style={{ padding: "12px 20px" }}>
              <button onClick={() => onAction(t.id)} disabled={actionLoading === t.id} style={{
                background: actionLoading === t.id ? "#f3f4f6" : actionBg,
                color: actionLoading === t.id ? "#9ca3af" : actionColor,
                border: "none", borderRadius: 6, padding: "6px 16px",
                fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 600,
                cursor: actionLoading === t.id ? "not-allowed" : "pointer", whiteSpace: "nowrap",
              }}>
                {actionLoading === t.id ? "…" : actionLabel}
              </button>
            </td>
          </tr>
        ))}
      </Table>
    </Card>
  )
}

// ─── Primitives ───────────────────────────────────────────────────────────────
function Section({ icon, iconColor, title, subtitle, link, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: iconColor }}>{icon}</span>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 600, color: "#1a1f0e" }}>{title}</span>
          </div>
          {subtitle && <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#6b7260", margin: "4px 0 0", paddingLeft: 28 }}>{subtitle}</p>}
        </div>
        {link && (
          <Link href={link.href} style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#3d7a2b", textDecoration: "none", fontWeight: 500, whiteSpace: "nowrap", paddingTop: 2 }}>
            {link.label}
          </Link>
        )}
      </div>
      {children}
    </div>
  )
}

function Card({ children }) {
  return <div style={{ background: "#fff", border: "1px solid #dde0d4", overflow: "hidden" }}>{children}</div>
}

function Table({ cols, children }) {
  return (
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
      <thead>
        <tr style={{ background: "#f7f8f4", borderBottom: "1px solid #e8ebe3" }}>
          {cols.map(h => (
            <th key={h} style={{ textAlign: "left", padding: "10px 20px", fontFamily: "'DM Mono', monospace", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "#9ca3af", fontWeight: 500 }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  )
}

function EmptyRow({ cols, label }) {
  return <tr><td colSpan={cols} style={{ padding: "40px 0", textAlign: "center", fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#9ca3af" }}>{label}</td></tr>
}

function Badge({ status }) {
  return (
    <span style={{ ...(STATUS_STYLE[status] ?? { background: "#f3f4f6", color: "#6b7280" }), fontFamily: "'DM Mono', monospace", fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 999, display: "inline-block" }}>
      {STATUS_LABEL[status] ?? status}
    </span>
  )
}

function Td({ children, mono, bold, small }) {
  return (
    <td style={{ padding: "12px 20px", fontFamily: mono ? "'DM Mono', monospace" : "'Inter', sans-serif", fontSize: small ? 11 : 13, fontWeight: bold ? 500 : 400, color: bold ? "#1a1f0e" : "#6b7260" }}>
      {children}
    </td>
  )
}

function StatCard({ icon, iconBg, iconColor, label, value, valueColor }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #dde0d4", padding: 20, display: "flex", alignItems: "center", gap: 16 }}>
      <div style={{ background: iconBg, color: iconColor, padding: 12, borderRadius: 8, display: "flex", flexShrink: 0 }}>{icon}</div>
      <div>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#6b7260", margin: 0, marginBottom: 4 }}>{label}</p>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 24, fontWeight: 700, color: valueColor, margin: 0 }}>{value}</p>
      </div>
    </div>
  )
}

function Spinner() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "32px 20px" }}>
      <div style={{ width: 18, height: 18, border: "2px solid #dde0d4", borderTopColor: "#3d7a2b", borderRadius: "50%", animation: "sb-spin 0.7s linear infinite" }} />
      <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.1em" }}>Loading…</span>
      <style>{`@keyframes sb-spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
