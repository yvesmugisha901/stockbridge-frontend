import { api } from "@/lib/api/client"

// ─────────────────────────────────────────────
// TRANSFERS  (FR-22)
// GET /finance/transfers
// Backend returns ApiResponse<Page<TransferCostResponse>>
// ─────────────────────────────────────────────
export async function getTransfers({ branchId, fromDate, toDate, status } = {}) {
  const q = new URLSearchParams()
  if (branchId) q.set("branchId", branchId)
  if (fromDate) q.set("fromDate", fromDate)   // matches @RequestParam("fromDate")
  if (toDate)   q.set("toDate",   toDate)     // matches @RequestParam("toDate")
  if (status)   q.set("status",   status)
  const qs = q.toString()
  return api.get(`/finance/transfers${qs ? `?${qs}` : ""}`)
  // Caller is responsible for unwrapping: raw.data.content (ApiResponse<Page<T>>)
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
// GET /finance/summary?branchId=&fromDate=&toDate=
// Returns: ApiResponse<FinanceSummaryResponse>
//   { totalCost, totalTransfers, branchId, fromDate, toDate }
// ─────────────────────────────────────────────
export async function getFinanceSummary({ branchId, fromDate, toDate } = {}) {
  const q = new URLSearchParams()
  if (branchId) q.set("branchId", branchId)
  if (fromDate) q.set("fromDate", fromDate)   // ✅ was "from" — backend expects "fromDate"
  if (toDate)   q.set("toDate",   toDate)     // ✅ was "to"   — backend expects "toDate"
  const qs = q.toString()
  return api.get(`/finance/summary${qs ? `?${qs}` : ""}`)
  // Caller unwraps: raw.data.totalCost, raw.data.totalTransfers
}

