"use client"
import PageHeader from "@/components/ui/PageHeader"
import StatsCard  from "@/components/ui/StatsCard"
import Link       from "next/link"

// ── Icons ─────────────────────────────────────────────────────────────────────
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
    <line x1="8" y1="6" x2="21" y2="6"/>
    <line x1="8" y1="12" x2="21" y2="12"/>
    <line x1="8" y1="18" x2="21" y2="18"/>
    <line x1="3" y1="6" x2="3.01" y2="6"/>
    <line x1="3" y1="12" x2="3.01" y2="12"/>
    <line x1="3" y1="18" x2="3.01" y2="18"/>
  </svg>
)
const IconReport = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
  </svg>
)
const IconAdjust = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
)

// ── Mock data ─────────────────────────────────────────────────────────────────
const MOCK_STATS = {
  pendingApprovals: 7,
  totalBranches:    6,
  lowStockItems:    4,
  inTransit:        3,
  totalItems:      183,
  completedToday:   12,
}

const MOCK_PENDING = [
  { id: "TR-0041", from: "Branch North", to: "Head Office",  item: "Cement 42.5N",   qty: 120, value: "RWF 360,000", time: "8 min ago"  },
  { id: "TR-0040", from: "Branch East",  to: "Branch South", item: "Steel Rods 12mm", qty: 50,  value: "RWF 275,000", time: "32 min ago" },
  { id: "TR-0038", from: "Branch West",  to: "Head Office",  item: "Paint 20L",       qty: 30,  value: "RWF 180,000", time: "1 hr ago"   },
  { id: "TR-0037", from: "Branch North", to: "Branch East",  item: "Nails 4\"",       qty: 200, value: "RWF 40,000",  time: "2 hr ago"   },
]

const MOCK_LOW_STOCK = [
  { item: "Cement 42.5N",    branch: "Branch South", qty: 8,  threshold: 50  },
  { item: "Paint 20L",       branch: "Branch West",  qty: 3,  threshold: 20  },
  { item: "Steel Rods 12mm", branch: "Branch North", qty: 12, threshold: 30  },
  { item: "PVC Pipe 4\"",    branch: "Branch East",  qty: 5,  threshold: 25  },
]

const QUICK = [
  { label: "Final Approvals", desc: "Review pending requests",  href: "/ho-admin/approvals",  Icon: IconApprovals },
  { label: "All Stock",       desc: "View all branch stock",    href: "/ho-admin/stock",       Icon: IconBox       },
  { label: "Item Catalogue",  desc: "Manage master items",      href: "/ho-admin/inventory",   Icon: IconCatalogue },
  { label: "Stock Adjust",    desc: "Manual adjustments",       href: "/ho-admin/inventory",   Icon: IconAdjust    },
  { label: "Reports",         desc: "Stock & transfer reports", href: "/ho-admin/reports",     Icon: IconReport    },
]

// ── Component ─────────────────────────────────────────────────────────────────
export default function HOAdminDashboard() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      <PageHeader
        title="HO Admin Dashboard"
        subtitle="Final approvals, system-wide stock visibility, and inventory management."
      />

      {/* ── Stats ── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: 16,
      }}>
        <StatsCard
          label="Final Approvals Pending"
          value={MOCK_STATS.pendingApprovals}
          icon={<IconApprovals />}
          color={MOCK_STATS.pendingApprovals > 0 ? "yellow" : "green"}
          trend={MOCK_STATS.pendingApprovals > 0 ? "Requires your action" : "All clear"}
          trendUp={MOCK_STATS.pendingApprovals === 0}
        />
        <StatsCard
          label="Total Branches"
          value={MOCK_STATS.totalBranches}
          icon={<IconBranch />}
          color="blue"
          trend="All operational"
        />
        <StatsCard
          label="Low Stock Items"
          value={MOCK_STATS.lowStockItems}
          icon={<IconAlert />}
          color={MOCK_STATS.lowStockItems > 0 ? "red" : "green"}
          trend={MOCK_STATS.lowStockItems > 0 ? "Below threshold" : "Stock healthy"}
          trendUp={MOCK_STATS.lowStockItems === 0}
        />
        <StatsCard
          label="Transfers In Transit"
          value={MOCK_STATS.inTransit}
          icon={<IconTruck />}
          color="blue"
          trend="Awaiting receipt"
        />
        <StatsCard
          label="Catalogue Items"
          value={MOCK_STATS.totalItems}
          icon={<IconBox />}
          color="green"
          trend="Active items"
        />
        <StatsCard
          label="Completed Today"
          value={MOCK_STATS.completedToday}
          icon={<IconReport />}
          color="green"
          trend="Transfers finalised"
          trendUp={true}
        />
      </div>

      {/* ── Quick Actions ── */}
      <div style={{ background: "#fff", border: "1px solid #dde0d4", padding: "24px" }}>
        <p style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: 10,
          textTransform: "uppercase",
          letterSpacing: "0.15em",
          color: "#6b7260",
          margin: "0 0 16px",
        }}>
          Quick Actions
        </p>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: 10,
        }}>
          {QUICK.map(({ label, desc, href, Icon }) => (
            <Link
              key={href + label}
              href={href}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 6,
                padding: "14px 16px",
                border: "1px solid #dde0d4",
                background: "#f7f8f4",
                textDecoration: "none",
                transition: "border-color 0.15s, background 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#3d7a2b"
                e.currentTarget.style.background  = "#f0f7ed"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#dde0d4"
                e.currentTarget.style.background  = "#f7f8f4"
              }}
            >
              <span style={{ color: "#6b7260", display: "flex" }}><Icon /></span>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 500, color: "#1a1f0e" }}>
                {label}
              </span>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "#6b7260" }}>
                {desc}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Bottom row: Pending Approvals + Low Stock ── */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.2fr) minmax(0,1fr)", gap: 16 }}>

        {/* Pending Approvals table */}
        <div style={{ background: "#fff", border: "1px solid #dde0d4", padding: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 600, color: "#1a1f0e", margin: 0 }}>
              Pending Final Approvals
            </p>
            <Link href="/ho-admin/approvals" style={{
              fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#3d7a2b",
              textDecoration: "none", textTransform: "uppercase", letterSpacing: "0.08em",
            }}>
              View all →
            </Link>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {/* Table header */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "80px 1fr 60px 90px",
              padding: "6px 0",
              borderBottom: "1px solid #e8ebe3",
              gap: 8,
            }}>
              {["ID", "Item / Route", "Qty", "Value"].map(h => (
                <span key={h} style={{
                  fontFamily: "'DM Mono', monospace", fontSize: 9,
                  textTransform: "uppercase", letterSpacing: "0.12em", color: "#9ca3af",
                }}>{h}</span>
              ))}
            </div>

            {MOCK_PENDING.map((t, i) => (
              <div
                key={t.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "80px 1fr 60px 90px",
                  padding: "11px 0",
                  borderBottom: i < MOCK_PENDING.length - 1 ? "1px solid #f0f1ec" : "none",
                  gap: 8,
                  alignItems: "center",
                }}
              >
                <span style={{
                  fontFamily: "'DM Mono', monospace", fontSize: 11,
                  color: "#3d7a2b", fontWeight: 600,
                }}>{t.id}</span>
                <div>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 500, color: "#1a1f0e", margin: "0 0 2px" }}>
                    {t.item}
                  </p>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "#6b7260", margin: 0 }}>
                    {t.from} → {t.to}
                  </p>
                </div>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#1a1f0e" }}>{t.qty}</span>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#1a1f0e" }}>{t.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div style={{ background: "#fff", border: "1px solid #dde0d4", padding: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 600, color: "#1a1f0e", margin: 0 }}>
              Low Stock Alerts
            </p>
            <Link href="/ho-admin/stock" style={{
              fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#dc2626",
              textDecoration: "none", textTransform: "uppercase", letterSpacing: "0.08em",
            }}>
              View all →
            </Link>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {MOCK_LOW_STOCK.map((s, i) => (
              <div
                key={s.item + s.branch}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "11px 0",
                  borderBottom: i < MOCK_LOW_STOCK.length - 1 ? "1px solid #f0f1ec" : "none",
                }}
              >
                {/* alert dot */}
                <span style={{
                  width: 28, height: 28, flexShrink: 0,
                  background: "#fef2f2", color: "#dc2626",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  border: "1px solid #fee2e2",
                }}>
                  <IconAlert />
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 500, color: "#1a1f0e", margin: "0 0 2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {s.item}
                  </p>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "#6b7260", margin: 0 }}>
                    {s.branch}
                  </p>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 600, color: "#dc2626", margin: "0 0 2px" }}>
                    {s.qty} left
                  </p>
                  <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: "#9ca3af", margin: 0 }}>
                    min {s.threshold}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}