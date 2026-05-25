import { api } from "@/lib/api/client"

// ─────────────────────────────────────────────
// TRANSFERS  (FR-22)
// GET /finance/transfers
// Backend returns PageImpl: { content: TransferResponse[], totalElements, ... }
// ─────────────────────────────────────────────
export async function getTransfers() {
  const raw = await api.get("/finance/transfers")
  // Unwrap Spring PageImpl or plain array
  if (Array.isArray(raw)) return raw
  if (raw?.content) return raw.content
  if (raw?.data)    return raw.data
  return []
}

// ─────────────────────────────────────────────
// COSTS  (FR-23)
// POST /finance/transfers/{id}/cost
// PUT  /finance/transfers/{id}/cost
// ─────────────────────────────────────────────
export async function recordCost(transferId, body) {
  return api.post(`/finance/transfers/${transferId}/cost`, body)
}

export async function updateCost(transferId, body) {
  return api.put(`/finance/transfers/${transferId}/cost`, body)
}

// ─────────────────────────────────────────────
// FINANCE SUMMARY  (FR-24)
// GET /finance/summary?branchId=&from=&to=
// Returns: FinanceSummaryResponse
// ─────────────────────────────────────────────
export async function getFinanceSummary({ branchId, from, to } = {}) {
  const q = new URLSearchParams()
  if (branchId) q.set("branchId", branchId)
  if (from)     q.set("from",     from)
  if (to)       q.set("to",       to)
  const qs = q.toString()
  return api.get(`/finance/summary${qs ? `?${qs}` : ""}`)
}