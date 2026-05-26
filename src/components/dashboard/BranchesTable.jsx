/**
 * BranchesTable — lists all branches with status and actions
 * Props: branches (BranchSummaryResponse[]), onEdit(branch), onToggleActive(branch)
 *
 * BranchSummaryResponse fields:
 *   id, name, code, location, contactInfo, active, totalItems, lowStockCount
 */
"use client"
import SBTable, { SBRow, SBCell } from "@/components/ui/SBTable"
import Badge from "@/components/ui/Badge"

export default function BranchesTable({ branches = [], loading, onEdit, onToggleActive }) {
  const columns = [
    { key: "code",        label: "Code",        width: 90  },
    { key: "name",        label: "Branch Name"              },
    { key: "location",    label: "Location"                 },
    { key: "contact",     label: "Contact",     width: 180 },
    { key: "items",       label: "Items",       width: 70  },
    { key: "lowStock",    label: "Low Stock",   width: 80  },
    { key: "status",      label: "Status",      width: 90  },
    { key: "actions",     label: "",            width: 120 },
  ]

  if (loading) {
    return (
      <div style={{
        background: "#fff", border: "1px solid #dde0d4",
        padding: "32px", textAlign: "center",
        fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#b0b5a0",
      }}>
        Loading branches…
      </div>
    )
  }

  return (
    <div style={{ background: "#fff", border: "1px solid #dde0d4" }}>
      <SBTable columns={columns} empty="No branches configured.">
        {branches.map((b) => (
          <SBRow key={b.id}>

            {/* Code chip */}
            <SBCell>
              <span style={{
                fontFamily:    "'DM Mono', monospace",
                fontSize:      11,
                background:    b.active ? "#f0f7ed" : "#f7f8f4",
                color:         b.active ? "#3d7a2b" : "#6b7260",
                padding:       "3px 8px",
                border:        `1px solid ${b.active ? "#bbf7d0" : "#dde0d4"}`,
                letterSpacing: "0.08em",
              }}>
                {b.code}
              </span>
            </SBCell>

            {/* Name */}
            <SBCell>
              <span style={{
                fontFamily: "'DM Mono', monospace",
                fontSize:   12,
                color:      "#1a1f0e",
                fontWeight: 500,
              }}>
                {b.name}
              </span>
            </SBCell>

            {/* Location */}
            <SBCell muted>{b.location ?? "—"}</SBCell>

            {/* Contact — field is contactInfo on BranchSummaryResponse */}
            <SBCell muted>{b.contactInfo ?? "—"}</SBCell>

            {/* Total items — field is totalItems on BranchSummaryResponse */}
            <SBCell muted>{b.totalItems ?? 0}</SBCell>

            {/* Low stock count */}
            <SBCell>
              {b.lowStockCount > 0 ? (
                <span style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize:   11,
                  background: "#fef9ec",
                  color:      "#92400e",
                  padding:    "2px 8px",
                  border:     "1px solid #fde68a",
                }}>
                  {b.lowStockCount} low
                </span>
              ) : (
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#b0b5a0" }}>—</span>
              )}
            </SBCell>

            {/* Status badge */}
            <SBCell>
              <Badge
                label={b.active ? "Active" : "Inactive"}
                value={b.active ? "ACTIVE" : "INACTIVE"}
                variant="status"
              />
            </SBCell>

            {/* Actions */}
            <SBCell>
              <div style={{ display: "flex", gap: 6 }}>
                <button
                  onClick={() => onEdit?.(b)}
                  style={actionBtn("#eff6ff", "#2563eb", "#bfdbfe")}
                >
                  Edit
                </button>
                <button
                  onClick={() => onToggleActive?.(b)}
                  style={b.active
                    ? actionBtn("#fef2f2", "#dc2626", "#fecaca")
                    : actionBtn("#f0f7ed", "#3d7a2b", "#bbf7d0")
                  }
                >
                  {b.active ? "Deactivate" : "Activate"}
                </button>
              </div>
            </SBCell>

          </SBRow>
        ))}
      </SBTable>
    </div>
  )
}

function actionBtn(bg, color, border) {
  return {
    background:    bg,
    color,
    border:        `1px solid ${border}`,
    padding:       "4px 10px",
    cursor:        "pointer",
    fontFamily:    "'DM Mono', monospace",
    fontSize:      10,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    whiteSpace:    "nowrap",
  }
}