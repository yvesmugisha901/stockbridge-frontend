"use client"
import PageHeader from "@/components/ui/PageHeader"

const PERMISSIONS = [
  { action: "View local branch stock",     STAFF: true,  MANAGER: true,  HO_ADMIN: true,  ACCOUNTANT: true,  ADMIN: true  },
  { action: "View all branches' stock",    STAFF: false, MANAGER: false, HO_ADMIN: true,  ACCOUNTANT: true,  ADMIN: true  },
  { action: "Submit transfer request",     STAFF: true,  MANAGER: true,  HO_ADMIN: false, ACCOUNTANT: false, ADMIN: false },
  { action: "First-level approval",        STAFF: false, MANAGER: true,  HO_ADMIN: false, ACCOUNTANT: false, ADMIN: false },
  { action: "Second-level approval",       STAFF: false, MANAGER: false, HO_ADMIN: true,  ACCOUNTANT: false, ADMIN: false },
  { action: "Manage item catalogue",       STAFF: false, MANAGER: false, HO_ADMIN: true,  ACCOUNTANT: false, ADMIN: true  },
  { action: "Record transfer costs",       STAFF: false, MANAGER: false, HO_ADMIN: false, ACCOUNTANT: true,  ADMIN: false },
  { action: "Manage users & branches",     STAFF: false, MANAGER: false, HO_ADMIN: false, ACCOUNTANT: false, ADMIN: true  },
  { action: "Generate system-wide reports",STAFF: false, MANAGER: true,  HO_ADMIN: true,  ACCOUNTANT: true,  ADMIN: true  },
]

const ROLES = ["STAFF", "MANAGER", "HO_ADMIN", "ACCOUNTANT", "ADMIN"]

export default function RolesPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <PageHeader title="Roles & Permissions" subtitle="Read-only permission matrix for all system roles." />
      <div style={{ background: "#fff", border: "1px solid #e8ebe3", borderRadius: 8, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, fontFamily: "'Inter', sans-serif" }}>
          <thead>
            <tr style={{ background: "#f7f8f4", borderBottom: "1px solid #e8ebe3" }}>
              <th style={{ padding: "10px 16px", textAlign: "left", fontWeight: 500, color: "#6b7280", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em" }}>Action</th>
              {ROLES.map(r => (
                <th key={r} style={{ padding: "10px 16px", textAlign: "center", fontWeight: 500, color: "#6b7280", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em" }}>{r.replace("_", " ")}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PERMISSIONS.map((row, i) => (
              <tr key={i} style={{ borderBottom: "1px solid #f3f4f0" }}>
                <td style={{ padding: "10px 16px", color: "#1a1f0e" }}>{row.action}</td>
                {ROLES.map(r => (
                  <td key={r} style={{ padding: "10px 16px", textAlign: "center" }}>
                    {row[r]
                      ? <span style={{ color: "#3d7a2b", fontSize: 16 }}>✓</span>
                      : <span style={{ color: "#e8ebe3", fontSize: 16 }}>✗</span>
                    }
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}