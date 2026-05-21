import { ROLES } from "@/lib/utils/constants"

export const PERMISSIONS = {
  [ROLES.STAFF]: [
    "view:own_stock", "create:transfer", "view:own_transfers",
    "action:mark_in_transit", "action:confirm_receipt",
  ],
  [ROLES.MANAGER]: [
    "view:own_stock", "create:transfer", "view:own_transfers",
    "action:mark_in_transit", "action:confirm_receipt",
    "approve:level1", "view:branch_reports",
  ],
  [ROLES.HO_ADMIN]: [
    "view:all_stock", "approve:level2", "manage:inventory",
    "view:all_transfers", "view:all_reports", "action:adjust_stock",
  ],
  [ROLES.ACCOUNTANT]: [
    "view:all_stock", "view:approved_transfers",
    "create:transfer_cost", "view:finance_reports",
  ],
  [ROLES.ADMIN]: [
    "manage:users", "manage:branches", "view:all_stock",
    "view:all_transfers", "view:all_reports",
  ],
}

export function hasPermission(role, permission) {
  return PERMISSIONS[role]?.includes(permission) ?? false
}