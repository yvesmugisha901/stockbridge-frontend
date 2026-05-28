"use client"
import PageHeader from "@/components/ui/PageHeader"

const PERMISSIONS = [
  { action: "View local branch stock",      STAFF: true,  MANAGER: true,  HO_ADMIN: true,  ACCOUNTANT: true,  ADMIN: true  },
  { action: "View all branches' stock",     STAFF: false, MANAGER: false, HO_ADMIN: true,  ACCOUNTANT: true,  ADMIN: true  },
  { action: "Submit transfer request",      STAFF: true,  MANAGER: true,  HO_ADMIN: false, ACCOUNTANT: false, ADMIN: false },
  { action: "First-level approval",         STAFF: false, MANAGER: true,  HO_ADMIN: false, ACCOUNTANT: false, ADMIN: false },
  { action: "Second-level (final) approval",STAFF: false, MANAGER: false, HO_ADMIN: true,  ACCOUNTANT: false, ADMIN: false },
  { action: "Manage item catalogue",        STAFF: false, MANAGER: false, HO_ADMIN: true,  ACCOUNTANT: false, ADMIN: true  },
  { action: "Record transfer costs",        STAFF: false, MANAGER: false, HO_ADMIN: false, ACCOUNTANT: true,  ADMIN: false },
  { action: "Manage users & branches",      STAFF: false, MANAGER: false, HO_ADMIN: false, ACCOUNTANT: false, ADMIN: true  },
  { action: "Generate system-wide reports", STAFF: false, MANAGER: true,  HO_ADMIN: true,  ACCOUNTANT: true,  ADMIN: true  },
  { action: "Manual stock adjustment",      STAFF: false, MANAGER: false, HO_ADMIN: true,  ACCOUNTANT: false, ADMIN: false },
  { action: "View audit log",               STAFF: false, MANAGER: false, HO_ADMIN: false, ACCOUNTANT: false, ADMIN: true  },
  { action: "System configuration",         STAFF: false, MANAGER: false, HO_ADMIN: false, ACCOUNTANT: false, ADMIN: true  },
]

const ROLES = [
  { key: "STAFF",      label: "Staff",      desc: "Branch employee" },
  { key: "MANAGER",    label: "Manager",    desc: "Branch manager"  },
  { key: "HO_ADMIN",   label: "HO Admin",   desc: "Head office"     },
  { key: "ACCOUNTANT", label: "Accountant", desc: "Finance"         },
  { key: "ADMIN",      label: "Admin",      desc: "System admin"    },
]

export default function RolesPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <PageHeader title="Roles & Permissions" subtitle="Read-only permission matrix for all system roles." />

      {/* Role cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
        {ROLES.map(r => (
          <div key={r.key} style={{ background: "#fff", border: "1px solid #e8ebe3", borderRadius: 8, padding: "14px 16px" }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#1a1f0e", textTransform: "uppercase", letterSpacing: "0.06em" }}>{r.label}</div>
            <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 3, fontFamily: "'DM Mono', monospace" }}>{r.desc}</div>
            <div style={{ marginTop: 10, fontSize: 12, color: "#3d7a2b", fontWeight: 500 }}>
              {PERMISSIONS.filter(p => p[r.key]).length} permissions
            </div>
          </div>
        ))}
      </div>

      {/* Permission matrix */}
      <div style={{ background: "#fff", border: "1px solid #e8ebe3", borderRadius: 8, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, fontFamily: "'Inter', sans-serif" }}>
          <thead>
            <tr style={{ background: "#f7f8f4", borderBottom: "1px solid #e8ebe3" }}>
              <th style={{ padding: "10px 16px", textAlign: "left", fontWeight: 500, color: "#6b7280", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", width: "32%" }}>
                Action
              </th>
              {ROLES.map(r => (
                <th key={r.key} style={{ padding: "10px 16px", textAlign: "center", fontWeight: 500, color: "#6b7280", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  {r.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PERMISSIONS.map((row, i) => (
              <tr key={i} style={{ borderBottom: "1px solid #f3f4f0", background: i % 2 === 0 ? "#fff" : "#fafaf8" }}>
                <td style={{ padding: "11px 16px", color: "#1a1f0e", fontSize: 13 }}>{row.action}</td>
                {ROLES.map(r => (
                  <td key={r.key} style={{ padding: "11px 16px", textAlign: "center" }}>
                    {row[r.key] ? (
                      <span style={{
                        display: "inline-flex", alignItems: "center", justifyContent: "center",
                        width: 22, height: 22, borderRadius: "50%",
                        background: "#f0fdf4", color: "#16a34a", fontSize: 13, fontWeight: 600
                      }}>✓</span>
                    ) : (
                      <span style={{
                        display: "inline-flex", alignItems: "center", justifyContent: "center",
                        width: 22, height: 22, borderRadius: "50%",
                        background: "#f9fafb", color: "#d1d5db", fontSize: 13
                      }}>✗</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ fontSize: 11, color: "#9ca3af", fontFamily: "'DM Mono', monospace" }}>
        Permissions are enforced via Spring Security @PreAuthorize on every API endpoint. This matrix reflects section 3.2 of the SRS.
      </div>
    </div>
  )
}