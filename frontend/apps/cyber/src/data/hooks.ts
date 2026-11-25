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
