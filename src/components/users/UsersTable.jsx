/**
 * UsersTable — lists all system users with role, branch, status, actions
 * Props: users [], onEdit(user), onDeactivate(user)
 */
"use client"
import SBTable, { SBRow, SBCell } from "@/components/ui/SBTable"
import Badge from "@/components/ui/Badge"

const ROLE_LABELS = {
  ADMIN:      "Sys Admin",
  MANAGER:    "Manager",
  HO_ADMIN:   "HO Admin",
  ACCOUNTANT: "Accountant",
  STAFF:      "Staff",
}

export default function UsersTable({ users = [], onEdit, onDeactivate }) {
  const columns = [
    { key: "name",    label: "Name" },
    { key: "email",   label: "Email" },
    { key: "role",    label: "Role",   width: 130 },
    { key: "branch",  label: "Branch", width: 140 },
    { key: "status",  label: "Status", width: 90 },
    { key: "actions", label: "",       width: 120 },
  ]

  return (
    <div style={{ background: "#fff", border: "1px solid #dde0d4" }}>
      <SBTable columns={columns} empty="No users found.">
        {users.map((u) => (
          <SBRow key={u.id}>
            <SBCell>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{
                  width: 30, height: 30,
                  background: "#f0f7ed",
                  color: "#3d7a2b",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 11, fontWeight: 600, flexShrink: 0,
                }}>
                  {u.name?.charAt(0)?.toUpperCase() ?? "?"}
                </span>
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#1a1f0e" }}>
                  {u.name}
                </span>
              </div>
            </SBCell>
            <SBCell muted>{u.email}</SBCell>
            <SBCell>
              <Badge label={ROLE_LABELS[u.role] ?? u.role} value={u.role} variant="role" />
            </SBCell>
            <SBCell muted>{u.branchName ?? "—"}</SBCell>
            <SBCell>
              <Badge
                label={u.active ? "Active" : "Inactive"}
                value={u.active ? "ACTIVE" : "INACTIVE"}
                variant="status"
              />
            </SBCell>
            <SBCell>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => onEdit?.(u)}
                  style={actionBtn("#eff6ff", "#2563eb", "#bfdbfe")}
                >
                  Edit
                </button>
                <button
                  onClick={() => onDeactivate?.(u)}
                  style={actionBtn(u.active ? "#fef2f2" : "#f0f7ed", u.active ? "#dc2626" : "#3d7a2b", u.active ? "#fecaca" : "#bbf7d0")}
                >
                  {u.active ? "Deactivate" : "Activate"}
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
    background: bg,
    color,
    border: `1px solid ${border}`,
    padding: "4px 10px",
    cursor: "pointer",
    fontFamily: "'DM Mono', monospace",
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    transition: "opacity 0.15s",
  }
}