import { useEffect, useMemo, useState } from 'react'
import {
  ALERTS,
  BRANCHES,
  buildPcs,
  FOODS,
  GAME_SHARES,
  GAMES,
  HOURLY,
  PLAYER,
  PLAYER_SESSION,
  REQUESTS,
  SHIFT,
  VOUCHER_SHOP,
  VOUCHERS,
  WALLET_TX,
  ZONES,
} from './mock'
import {
  AUDIT,
  BRANCH_DETAILS,
  BRANCH_REVENUE,
  CAMPAIGNS,
  CLOSEOUTS,
  MEMBERS,
  MODULE_REVENUE,
  PERMISSION_CATALOG,
  POSITIONS,
  PRICE_PLANS,
  SHIFTS,
  STAFF,
  TIME_PACKAGES,
  WALLET_LIABILITY,
} from './mock-owner'

/*
 * Nguồn dữ liệu của mọi màn hình. Hiện trả dữ liệu giả; khi module NET có contract/indexer,
 * chỉ cần đổi phần thân các hook này (vd. sang TanStack Query), component không đổi.
 */

export function useOwnerOverview() {
  return { branches: BRANCHES, hourly: HOURLY, gameShares: GAME_SHARES, alerts: ALERTS }
}

export function useBranchFloor(branchId: string) {
  const pcs = useMemo(() => buildPcs(branchId === 'q1' ? 21 : 7), [branchId])
  return { zones: ZONES, pcs, shift: SHIFT }
}

/** Chi nhánh manager được giao (hiện 3 chi nhánh đầu) và ca đang chạy. */
export function useManagerScope() {
  return { branches: BRANCHES.slice(0, 3), shift: SHIFT, shiftRevenue: 5_100_000 }
}

export function useCustomerRequests() {
  return REQUESTS
}

/** Dữ liệu của người chơi đang đăng nhập (app webview). */
export function usePlayer() {
  return {
    player: PLAYER,
    session: PLAYER_SESSION,
    recentGames: GAMES.filter((g) => g.lastPlayed),
    foods: FOODS,
    walletTx: WALLET_TX,
    vouchers: VOUCHERS,
    voucherShop: VOUCHER_SHOP,
  }
}

/** Đếm ngược theo giây (thời gian còn lại của phiên chơi). */
export function useCountdown(initialSec: number): number {
  const [left, setLeft] = useState(initialSec)
  useEffect(() => {
    setLeft(initialSec)
    const id = setInterval(() => setLeft((s) => (s > 0 ? s - 1 : 0)), 1000)
    return () => clearInterval(id)
  }, [initialSec])
  return left
}

// ─── Owner ────────────────────────────────────────────────────────────
// Nguồn thật sau này: BranchRegistry + SalesSettings (chi nhánh), Permission + Duty (nhân sự, ca),
// Ledger.rollup / moduleRollup (doanh thu), AgentUserRegistry + Ledger.bucketsOf (hội viên), event + indexer (nhật ký).

export function useOwnerBranches() {
  return BRANCH_DETAILS
}

export function branchName(id: string) {
  return BRANCH_DETAILS.find((b) => b.id === id)?.name ?? id
}

export function useOwnerStaff() {
  return { staff: STAFF, positions: POSITIONS, shifts: SHIFTS, catalog: PERMISSION_CATALOG }
}

export function useOwnerShifts() {
  return { shifts: SHIFTS, staff: STAFF, positions: POSITIONS, closeouts: CLOSEOUTS, branches: BRANCH_DETAILS }
}

export function useOwnerRevenue() {
  return { modules: MODULE_REVENUE, branches: BRANCH_REVENUE, liability: WALLET_LIABILITY, hourly: HOURLY }
}

export function useOwnerMembers() {
  return MEMBERS
}

export function useOwnerPricing() {
  return { plans: PRICE_PLANS, packages: TIME_PACKAGES, zones: ZONES }
}

export function useOwnerCampaigns() {
  return CAMPAIGNS
}

export function useOwnerAudit() {
  return AUDIT
}
