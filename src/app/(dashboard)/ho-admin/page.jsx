"use client"
import { useState, useEffect } from "react"
import PageHeader from "@/components/ui/PageHeader"
import StatsCard from "@/components/ui/StatsCard"
import Link from "next/link"
import { api } from "@/lib/api/client"

// ── Icons ──────────────────────────────────────────────────────────────────────
const IconApprovals = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
)
const IconBranch = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
)
const IconAlert = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
)
const IconTruck = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13"/>
    <path d="M16 8h4l3 3v5h-7V8z"/>
    <circle cx="5.5" cy="18.5" r="2.5"/>
    <circle cx="18.5" cy="18.5" r="2.5"/>
  </svg>
)
const IconBox = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 8l-9-5-9 5v8l9 5 9-5V8z"/>
    <path d="M12 3v18M3 8l9 5 9-5"/>
  </svg>
)
const IconCatalogue = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
    <line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/>
    <line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
  </svg>
)
const IconReport = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
  </svg>
)
const IconAdjust = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
)

const QUICK = [
  { label: "Final Approvals", desc: "Review pending requests",  href: "/ho-admin/approvals",  Icon: IconApprovals },
  { label: "All Stock",       desc: "View all branch stock",    href: "/ho-admin/stock",       Icon: IconBox       },
  { label: "Item Catalogue",  desc: "Manage master items",      href: "/ho-admin/inventory",   Icon: IconCatalogue },
  { label: "Stock Adjust",    desc: "Manual adjustments",       href: "/ho-admin/inventory",   Icon: IconAdjust    },
  { label: "Reports",         desc: "Stock & transfer reports", href: "/ho-admin/reports",     Icon: IconReport    },
]

// ── Helper: safely read totalElements from either Page structure ───────────────
// Before @EnableSpringDataWebSupport: { content, totalElements, totalPages, ... }
// After  @EnableSpringDataWebSupport: { content, page: { totalElements, ... } }
function totalElements(pageData) {
  if (!pageData) return 0
  // New VIA_DTO structure
  if (pageData.page?.totalElements != null) return pageData.page.totalElements
  // Old flat structure (fallback)
  if (pageData.totalElements != null) return pageData.totalElements
  // If it's just an array
  if (Array.isArray(pageData)) return pageData.length
  return 0
}

function getContent(pageData) {
  if (!pageData) return []
  if (Array.isArray(pageData.content)) return pageData.content
  if (Array.isArray(pageData)) return pageData
  return []
}

function Spinner() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 0" }}>
      <div style={{ width: 24, height: 24, border: "2px solid #dde0d4", borderTopColor: "#3d7a2b", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}

export default function HOAdminDashboard() {
  const [stats, setStats] = useState({
    pendingApprovals: 0,
    totalBranches:    0,
    lowStockItems:    0,
    inTransit:        0,
    totalItems:       0,
    completedToday:   0,
  })
  const [pendingList,  setPendingList]  = useState([])
  const [lowStockList, setLowStockList] = useState([])
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState(null)

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true)

        const [
          pendingRes,
          branchesRes,
          lowStockRes,
          inTransitRes,
          itemsRes,
          completedRes,
        ] = await Promise.all([
          api.get("/approvals/pending/head-office?size=4&page=0"),
          api.get("/branches"),
          api.get("/stock/low-stock-alerts"),
          api.get("/transfers?status=IN_TRANSIT&size=1"),
          api.get("/items?size=1"),
          api.get("/transfers?status=COMPLETED&size=1"),
        ])

        // Pending approvals
        const pendingPage = pendingRes?.data
        setPendingList(getContent(pendingPage))

        // Low stock — plain List (not paged)
        const lowStockData = Array.isArray(lowStockRes?.data) ? lowStockRes.data : []
        setLowStockList(lowStockData.slice(0, 4))

        // Branches — plain List (not paged)
        const branchData = Array.isArray(branchesRes?.data) ? branchesRes.data : []

        setStats({
          // FIX: use totalElements() helper which handles both old and new Page structure
          pendingApprovals: totalElements(pendingPage),
          totalBranches:    branchData.length,
          lowStockItems:    lowStockData.length,
          inTransit:        totalElements(inTransitRes?.data),
          totalItems:       totalElements(itemsRes?.data),
          completedToday:   totalElements(completedRes?.data),
        })
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [])

  if (loading) return <Spinner />

  if (error) return (
    <div style={{ padding: "24px", background: "#fef2f2", border: "1px solid #fecaca", fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#dc2626" }}>
      Failed to load dashboard: {error}
    </div>
  )

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <PageHeader
        title="HO Admin Dashboard"
        subtitle="Final approvals, system-wide stock visibility, and inventory management."
      />

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
        <StatsCard label="Final Approvals Pending" value={stats.pendingApprovals} icon={<IconApprovals />} color={stats.pendingApprovals > 0 ? "yellow" : "green"} trend={stats.pendingApprovals > 0 ? "Requires your action" : "All clear"} trendUp={stats.pendingApprovals === 0} />
        <StatsCard label="Total Branches"          value={stats.totalBranches}    icon={<IconBranch />}    color="blue"                                              trend="All operational" />
        <StatsCard label="Low Stock Items"         value={stats.lowStockItems}    icon={<IconAlert />}     color={stats.lowStockItems > 0 ? "red" : "green"}         trend={stats.lowStockItems > 0 ? "Below threshold" : "Stock healthy"} trendUp={stats.lowStockItems === 0} />
        <StatsCard label="Transfers In Transit"    value={stats.inTransit}        icon={<IconTruck />}     color="blue"                                              trend="Awaiting receipt" />
        <StatsCard label="Catalogue Items"         value={stats.totalItems}       icon={<IconBox />}       color="green"                                             trend="Active items" />
        <StatsCard label="Completed Today"         value={stats.completedToday}   icon={<IconReport />}    color="green"                                             trend="Transfers finalised" trendUp={true} />
      </div>

      {/* Quick Actions */}
      <div style={{ background: "#fff", border: "1px solid #dde0d4", padding: "24px" }}>
        <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.15em", color: "#6b7260", margin: "0 0 16px" }}>
          Quick Actions
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10 }}>
          {QUICK.map(({ label, desc, href, Icon }) => (
            <Link
              key={href + label} href={href}
              style={{ display: "flex", flexDirection: "column", gap: 6, padding: "14px 16px", border: "1px solid #dde0d4", background: "#f7f8f4", textDecoration: "none", transition: "border-color 0.15s, background 0.15s" }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#3d7a2b"; e.currentTarget.style.background = "#f0f7ed" }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#dde0d4"; e.currentTarget.style.background = "#f7f8f4" }}
            >
              <span style={{ color: "#6b7260", display: "flex" }}><Icon /></span>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 500, color: "#1a1f0e" }}>{label}</span>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "#6b7260" }}>{desc}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Bottom row */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.2fr) minmax(0,1fr)", gap: 16 }}>

        {/* Pending Approvals */}
        <div style={{ background: "#fff", border: "1px solid #dde0d4", padding: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 600, color: "#1a1f0e", margin: 0 }}>Pending Final Approvals</p>
            <Link href="/ho-admin/approvals" style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#3d7a2b", textDecoration: "none", textTransform: "uppercase", letterSpacing: "0.08em" }}>View all →</Link>
          </div>

          {pendingList.length === 0 ? (
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#9ca3af", textAlign: "center", padding: "24px 0", margin: 0 }}>No transfers awaiting final approval.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              <div style={{ display: "grid", gridTemplateColumns: "80px 1fr 60px 100px", padding: "6px 0", borderBottom: "1px solid #e8ebe3", gap: 8 }}>
                {["ID", "Item / Route", "Qty", "Value"].map(h => (
                  <span key={h} style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.12em", color: "#9ca3af" }}>{h}</span>
                ))}
              </div>
              {pendingList.map((t, i) => (
                <div key={t.id} style={{ display: "grid", gridTemplateColumns: "80px 1fr 60px 100px", padding: "11px 0", borderBottom: i < pendingList.length - 1 ? "1px solid #f0f1ec" : "none", gap: 8, alignItems: "center" }}>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#3d7a2b", fontWeight: 600 }}>#{t.id}</span>
                  <div>
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 500, color: "#1a1f0e", margin: "0 0 2px" }}>{t.itemName}</p>
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "#6b7260", margin: 0 }}>{t.sourceBranchName} → {t.destinationBranchName}</p>
                  </div>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#1a1f0e" }}>{t.quantity}</span>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#1a1f0e" }}>
                    {t.totalValue != null
                      ? new Intl.NumberFormat("en-RW", { style: "currency", currency: "RWF", maximumFractionDigits: 0 }).format(t.totalValue)
                      : "—"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Low Stock Alerts */}
        <div style={{ background: "#fff", border: "1px solid #dde0d4", padding: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 600, color: "#1a1f0e", margin: 0 }}>Low Stock Alerts</p>
            <Link href="/ho-admin/stock" style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#dc2626", textDecoration: "none", textTransform: "uppercase", letterSpacing: "0.08em" }}>View all →</Link>
          </div>

          {lowStockList.length === 0 ? (
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#9ca3af", textAlign: "center", padding: "24px 0", margin: 0 }}>All stock levels healthy.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {lowStockList.map((s, i) => (
                <div key={`${s.itemId}-${s.branchId}`} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 0", borderBottom: i < lowStockList.length - 1 ? "1px solid #f0f1ec" : "none" }}>
                  <span style={{ width: 28, height: 28, flexShrink: 0, background: "#fef2f2", color: "#dc2626", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #fee2e2" }}>
                    <IconAlert />
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 500, color: "#1a1f0e", margin: "0 0 2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.itemName}</p>
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "#6b7260", margin: 0 }}>{s.branchName}</p>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 600, color: "#dc2626", margin: "0 0 2px" }}>{s.quantityOnHand} left</p>
                    <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: "#9ca3af", margin: 0 }}>min {s.minimumThreshold}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
