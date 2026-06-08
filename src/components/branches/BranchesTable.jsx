"use client"
import SBTable, { SBRow, SBCell } from "@/components/ui/SBTable"
import Badge from "@/components/ui/Badge"

export default function BranchesTable({ branches = [], onEdit, onToggleActive, loading }) {
  const columns = [
    { key: "code",     label: "Code",     width: 90  },
    { key: "name",     label: "Branch Name"           },
    { key: "location", label: "Location"              },
    { key: "contact",  label: "Contact",  width: 160 },
    { key: "stock",    label: "Items",    width: 70  },
    { key: "status",   label: "Status",   width: 90  },
    { key: "actions",  label: "",         width: 140 },
  ]

  return (
    <div style={{ background: "#fff", border: "1px solid #dde0d4" }}>
      <SBTable columns={columns} empty="No branches configured." loading={loading}>
        {branches.map((b) => (
          <SBRow key={b.id}>
            <SBCell>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, background: "#f0f7ed", color: "#3d7a2b", padding: "3px 8px", border: "1px solid #bbf7d0", letterSpacing: "0.08em" }}>
                {b.code}
              </span>
            </SBCell>
            <SBCell>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#1a1f0e", fontWeight: 500 }}>
                {b.name}
              </span>
            </SBCell>
            <SBCell muted>{b.location}</SBCell>
            <SBCell muted>{b.contactInfo ?? b.contact ?? "—"}</SBCell>

            {/* BranchSummaryResponse.totalItems — was wrongly b.itemCount */}
            <SBCell muted>{b.totalItems ?? "—"}</SBCell>

            <SBCell>
              <Badge
                label={b.active ? "Active" : "Inactive"}
                value={b.active ? "ACTIVE" : "INACTIVE"}
                variant="status"
              />
            </SBCell>
            <SBCell>
              <div style={{ display: "flex", gap: 6 }}>
                <button
                  onClick={() => onEdit?.(b)}
                  style={{ background: "#eff6ff", color: "#2563eb", border: "1px solid #bfdbfe", padding: "4px 10px", cursor: "pointer", fontFamily: "'DM Mono', monospace", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em" }}
                >
                  Edit
                </button>
                <button
                  onClick={() => onToggleActive?.(b)}
                  style={{
                    background: b.active ? "#fef2f2" : "#f0f7ed",
                    color:      b.active ? "#dc2626" : "#3d7a2b",
                    border:     b.active ? "1px solid #fecaca" : "1px solid #bbf7d0",
                    padding: "4px 10px", cursor: "pointer", fontFamily: "'DM Mono', monospace", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em",
                  }}
                >
                  {b.active ? "Suspend" : "Activate"}
                </button>
              </div>
            </SBCell>
          </SBRow>
        ))}
      </SBTable>
    </div>
  )
}
