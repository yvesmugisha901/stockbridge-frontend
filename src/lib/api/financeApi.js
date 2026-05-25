// lib/api/financeApi.js
// All accountant-facing API calls wired to the real backend.
// Uses the shared `api` helper from @/lib/api (your existing file).

import { api } from "@/lib/api/client"

// ─────────────────────────────────────────────
// TRANSFERS  (FR-22)
// GET /api/v1/finance/transfers
// Returns: TransferResponse[]
// ─────────────────────────────────────────────

/**
 * Fetch all transfers visible to the accountant.
 * Statuses: HO_APPROVED | IN_TRANSIT | RECEIVED | COMPLETED
 */
export async function getTransfers() {
  return api.get("/api/v1/finance/transfers")
}

// ─────────────────────────────────────────────
// COSTS  (FR-23)
// POST /api/v1/finance/transfers/{id}/cost
// PUT  /api/v1/finance/transfers/{id}/cost
// Body: TransferCostRequest { amount, currency, costType, notes }
// Returns: TransferCostResponse
// ─────────────────────────────────────────────

/**
 * Record a cost for the first time on a transfer.
 * @param {number|string} transferId  — numeric backend ID (NOT the "TRF-xxxx" display ID)
 * @param {{ amount: number, currency: string, costType: string, notes?: string }} body
 */
export async function recordCost(transferId, body) {
  return api.post(`/api/v1/finance/transfers/${transferId}/cost`, body)
}

/**
 * Update an existing cost record.
 * @param {number|string} transferId
 * @param {{ amount: number, currency: string, costType: string, notes?: string }} body
 */
export async function updateCost(transferId, body) {
  return api.put(`/api/v1/finance/transfers/${transferId}/cost`, body)
}

// ─────────────────────────────────────────────
// FINANCE SUMMARY  (FR-24)
// GET /api/v1/finance/summary?branchId=&from=&to=
// Returns: FinanceSummaryResponse { totalTransfers, totalCost, branchId, fromDate, toDate }
// ─────────────────────────────────────────────

/**
 * Fetch the finance summary.
 * All params are optional — omit to get the full summary.
 * @param {{ branchId?: number, from?: string, to?: string }} params
 *   from / to format: "YYYY-MM-DD"
 */
export async function getFinanceSummary({ branchId, from, to } = {}) {
  const q = new URLSearchParams()
  if (branchId) q.set("branchId", branchId)
  if (from)     q.set("from",     from)
  if (to)       q.set("to",       to)
  const qs = q.toString()
  return api.get(`/api/v1/finance/summary${qs ? `?${qs}` : ""}`)
}