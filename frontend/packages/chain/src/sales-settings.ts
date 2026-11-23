export const SERVICE_NET = 1
export const SERVICE_IQR = 2

export const PAYMENT_CASH = 1
export const PAYMENT_TRANSFER = 2
export const PAYMENT_CARD = 4
export const PAYMENT_WALLET = 8
export const ALL_PAYMENT_METHODS = PAYMENT_CASH | PAYMENT_TRANSFER | PAYMENT_CARD | PAYMENT_WALLET
export const DEFAULT_AGENT_PAYMENT_METHODS = PAYMENT_CASH | PAYMENT_WALLET

/** Giá trị lưu on-chain: chi nhánh theo agent. */
export const BRANCH_PAYMENT_FOLLOW_AGENT = 0

export const MAX_TAX_BPS = 10_000

export class PercentParseError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'PercentParseError'
  }
}

/** `8,5` / `8.5` → 850 bps; chặn > 100%. */
export function parsePercentToBps(input: string): number {
  const trimmed = input.trim().replace(/\s/g, '')
  if (!trimmed) throw new PercentParseError('Nhập phần trăm thuế.')
  const normalized = trimmed.replace(',', '.')
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) {
    throw new PercentParseError('Phần trăm không hợp lệ (tối đa hai chữ số thập phân).')
  }
  const [wholePart, fracPart = ''] = normalized.split('.')
  const whole = Number(wholePart)
  const fracDigits = fracPart.padEnd(2, '0').slice(0, 2)
  const bps = whole * 100 + Number(fracDigits || '0')
  if (!Number.isFinite(bps) || bps < 0) throw new PercentParseError('Phần trăm không hợp lệ.')
  if (bps > MAX_TAX_BPS) throw new PercentParseError('Thuế không được vượt 100%.')
  return bps
}

export function bpsToPercentInput(bps: number): string {
  const whole = Math.floor(bps / 100)
  const frac = bps % 100
  if (frac === 0) return String(whole)
  const fracStr = String(frac).padStart(2, '0').replace(/0$/, '')
  return `${whole},${fracStr}`
}

/** `(branchStored || agentEff) & agentEff` theo `SalesSettings.paymentMethodsOf`. */
export function effectiveBranchPaymentMethods(branchStored: number, agentEffective: number): number {
  const raw = branchStored === BRANCH_PAYMENT_FOLLOW_AGENT ? agentEffective : branchStored
  return raw & agentEffective
}

export function isPaymentMethodEnabled(mask: number, bit: number): boolean {
  return (mask & bit) !== 0
}

export function togglePaymentMethodBit(mask: number, bit: number, enabled: boolean): number {
  return enabled ? mask | bit : mask & ~bit
}