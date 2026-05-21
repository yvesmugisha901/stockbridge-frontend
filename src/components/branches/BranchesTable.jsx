/**
 * BranchesTable — lists all branches with status and actions
 * Props: branches [], onEdit(branch)
 */
"use client"
import SBTable, { SBRow, SBCell } from "@/components/ui/SBTable"
import Badge from "@/components/ui/Badge"

export default function BranchesTable({ branches = [], onEdit }) {
  const columns = [
    { key: "code",     label: "Code",     width: 90 },
    { key: "name",     label: "Branch Name" },
    { key: "location", label: "Location" },
    { key: "contact",  label: "Contact",  width: 160 },
    { key: "stock",    label: "Items",    width: 70 },
    { key: "status",   label: "Status",   width: 90 },
    { key: "actions",  label: "",         width: 80 },
  ]

  return (
    <div style={{ background: "#fff", border: "1px solid #dde0d4" }}>
      <SBTable columns={columns} empty="No branches configured.">
        {branches.map((b) => (
          <SBRow key={b.id}>
            <SBCell>
              <span style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 11,
                background: "#f0f7ed",
                color: "#3d7a2b",
                padding: "3px 8px",
                border: "1px solid #bbf7d0",
                letterSpacing: "0.08em",
              }}>
                {b.code}
              </span>
            </SBCell>
            <SBCell>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#1a1f0e", fontWeight: 500 }}>
                {b.name}
              </span>
            </SBCell>
            <SBCell muted>{b.location}</SBCell>
            <SBCell muted>{b.contact ?? "—"}</SBCell>
            <SBCell muted>{b.itemCount ?? "—"}</SBCell>
            <SBCell>
              <Badge
                label={b.active ? "Active" : "Inactive"}
                value={b.active ? "ACTIVE" : "INACTIVE"}
                variant="status"
              />
            </SBCell>
            <SBCell>
              <button
                onClick={() => onEdit?.(b)}
                style={{
                  background: "#eff6ff",
                  color: "#2563eb",
                  border: "1px solid #bfdbfe",
                  padding: "4px 12px",
                  cursor: "pointer",
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 10,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                Edit
              </button>
            </SBCell>
          </SBRow>
        ))}
      </SBTable>
    </div>
  )
}