"use client"
import { useState } from "react"
import Link from "next/link"
import PageHeader    from "@/components/ui/PageHeader"
import UsersTable    from "@/components/users/UsersTable"
import UserFormModal from "@/components/users/UserFormModal"

const MOCK_BRANCHES = [
  { id: "1", name: "Kigali HQ"      },
  { id: "2", name: "Butare Depot"   },
  { id: "3", name: "Musanze North"  },
  { id: "4", name: "Gisenyi West"   },
]

const MOCK_USERS = [
  { id: "1", name: "Alice Uwimana",    email: "alice@stockbridge.rw",  role: "ADMIN",      branchName: null,            active: true  },
  { id: "2", name: "Bob Nkurunziza",   email: "bob@stockbridge.rw",    role: "MANAGER",    branchName: "Kigali HQ",     active: true  },
  { id: "3", name: "Claire Ingabire",  email: "claire@stockbridge.rw", role: "STAFF",      branchName: "Butare Depot",  active: true  },
  { id: "4", name: "David Hakizimana", email: "david@stockbridge.rw",  role: "HO_ADMIN",   branchName: null,            active: true  },
  { id: "5", name: "Eve Mukamana",     email: "eve@stockbridge.rw",    role: "ACCOUNTANT", branchName: "Kigali HQ",     active: false },
  { id: "6", name: "Frank Bizimana",   email: "frank@stockbridge.rw",  role: "STAFF",      branchName: "Musanze North", active: true  },
]

export default function UsersPage() {
  const [users, setUsers]     = useState(MOCK_USERS)
  const [modalOpen, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [search, setSearch]   = useState("")

  function openCreate() { setEditing(null); setModal(true) }
  function openEdit(u)  { setEditing(u);    setModal(true) }

  function handleDeactivate(u) {
    setUsers((prev) => prev.map((x) => x.id === u.id ? { ...x, active: !x.active } : x))
  }

  async function handleSave(data) {
    if (editing) {
      setUsers((prev) => prev.map((x) => x.id === data.id ? { ...x, ...data } : x))
    } else {
      setUsers((prev) => [...prev, { ...data, id: String(Date.now()), active: true }])
    }
    // TODO: swap for real API
    // const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users${editing ? `/${data.id}` : ""}`, {
    //   method: editing ? "PUT" : "POST",
    //   headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
    //   body: JSON.stringify(data),
    // })
  }

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      <PageHeader
        title="User Management"
        subtitle={`${users.length} users · ${users.filter((u) => u.active).length} active`}
        action={{ label: "New User", onClick: openCreate }}
      />

      {/* Search bar */}
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1, maxWidth: 340 }}>
          <svg
            style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#b8bead", pointerEvents: "none" }}
            width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            style={{
              width: "100%", boxSizing: "border-box",
              fontFamily: "'DM Mono', monospace", fontSize: 12,
              background: "#fff", border: "1px solid #dde0d4",
              padding: "9px 14px 9px 32px", color: "#1a1f0e", outline: "none",
            }}
            onFocus={(e) => e.target.style.borderColor = "#3d7a2b"}
            onBlur={(e)  => e.target.style.borderColor = "#dde0d4"}
          />
        </div>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#6b7260" }}>
          {filtered.length} result{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      <UsersTable
        users={filtered}
        onEdit={openEdit}
        onDeactivate={handleDeactivate}
      />

      <UserFormModal
        open={modalOpen}
        user={editing}
        branches={MOCK_BRANCHES}
        onClose={() => setModal(false)}
        onSave={handleSave}
      />

    </div>
  )
}