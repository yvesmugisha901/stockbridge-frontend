"use client"
import { useState } from "react"
import PageHeader      from "@/components/ui/PageHeader"
import BranchesTable   from "@/components/branches/BranchesTable"
import BranchFormModal from "@/components/branches/BranchFormModal"

const MOCK_BRANCHES = [
  { id: "1", code: "KGL", name: "Kigali HQ",      location: "KG 11 Ave, Kigali",         contact: "+250 788 000 001", itemCount: 48, active: true  },
  { id: "2", code: "BUT", name: "Butare Depot",    location: "RN3, Huye District",         contact: "+250 788 000 002", itemCount: 31, active: true  },
  { id: "3", code: "MSZ", name: "Musanze North",   location: "Musanze Town Centre",        contact: "+250 788 000 003", itemCount: 27, active: true  },
  { id: "4", code: "GSY", name: "Gisenyi West",    location: "Rubavu District, Lake Shore",contact: "+250 788 000 004", itemCount: 19, active: true  },
  { id: "5", code: "RWM", name: "Rwamagana East",  location: "Rwamagana Town",             contact: "+250 788 000 005", itemCount: 22, active: true  },
  { id: "6", code: "NYZ", name: "Nyanza South",    location: "Nyanza District",            contact: null,               itemCount: 0,  active: false },
]

export default function BranchesPage() {
  const [branches, setBranches] = useState(MOCK_BRANCHES)
  const [modalOpen, setModal]   = useState(false)
  const [editing, setEditing]   = useState(null)

  function openCreate() { setEditing(null); setModal(true) }
  function openEdit(b)  { setEditing(b);    setModal(true) }

  async function handleSave(data) {
    if (editing) {
      setBranches((prev) => prev.map((x) => x.id === data.id ? { ...x, ...data } : x))
    } else {
      setBranches((prev) => [...prev, { ...data, id: String(Date.now()), itemCount: 0, active: true }])
    }
    // TODO: swap for real API
    // const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/branches${editing ? `/${data.id}` : ""}`, {
    //   method: editing ? "PUT" : "POST",
    //   headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
    //   body: JSON.stringify(data),
    // })
  }

  const active   = branches.filter((b) => b.active).length
  const inactive = branches.length - active

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      <PageHeader
        title="Branch Management"
        subtitle={`${branches.length} branches · ${active} active · ${inactive} inactive`}
        action={{ label: "New Branch", onClick: openCreate }}
      />

      {/* Summary pills */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        {[
          { label: "Total",    value: branches.length, bg: "#f7f8f4", color: "#1a1f0e" },
          { label: "Active",   value: active,           bg: "#f0f7ed", color: "#3d7a2b" },
          { label: "Inactive", value: inactive,         bg: "#fef2f2", color: "#dc2626" },
        ].map((p) => (
          <div key={p.label} style={{
            background: p.bg, padding: "8px 16px",
            border: "1px solid #dde0d4",
            fontFamily: "'DM Mono', monospace", fontSize: 12,
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <span style={{ color: "#6b7260", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em" }}>
              {p.label}
            </span>
            <span style={{ color: p.color, fontWeight: 600 }}>{p.value}</span>
          </div>
        ))}
      </div>

      <BranchesTable
        branches={branches}
        onEdit={openEdit}
      />

      <BranchFormModal
        open={modalOpen}
        branch={editing}
        onClose={() => setModal(false)}
        onSave={handleSave}
      />

    </div>
  )
}