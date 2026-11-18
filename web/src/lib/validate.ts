import { isAddress, toAddress } from '@/lib/address'

const ZERO = '0x0000000000000000000000000000000000000000'
const PHONE = /^[0-9+\-. ()]{0,20}$/
const DOMAIN = /^[a-z0-9][a-z0-9.-]{1,251}[a-z0-9]$/
const LONGLAT = /^[0-9.\-, ]{0,40}$/

export type AgentFormValues = {
  owner: string
  storeName: string
  storeAddress: string
  storePhone: string
  note: string
}

export type AgentFormContext = {
  agentIdOfOwner?: number
  platformOwner?: string
  pendingOwner?: string
  ownerIsPlatformAdmin?: boolean
}

export type BranchFormValues = {
  domain: string
  name: string
  location: string
  phone: string
  longlat: string
  note: string
  net: boolean
  iqr: boolean
  loyalty: boolean
  tzOffsetMinutes: string
}

function utf8Length(value: string): number {
  return new TextEncoder().encode(value).length
}

function sameAddress(left?: string, right?: string): boolean {
  if (!left || !right || !isAddress(left) || !isAddress(right)) return false
  const a = toAddress(left).toLowerCase()
  const b = toAddress(right).toLowerCase()
  if (a === ZERO || b === ZERO) return false
  return a === b
}

export function validateAgentForm(values: AgentFormValues, context?: AgentFormContext): Record<string, string> {
  const errors: Record<string, string> = {}
  const owner = toAddress(values.owner.trim())

  if (!isAddress(owner) || owner.toLowerCase() === ZERO) {
    errors.owner = 'Ví chủ phải là địa chỉ hợp lệ, khác 0x0.'
  } else if (context) {
    if ((context.agentIdOfOwner ?? 0) !== 0) {
      errors.owner = `Ví này đã có agent #${context.agentIdOfOwner}.`
    } else if (
      sameAddress(owner, context.platformOwner) ||
      sameAddress(owner, context.pendingOwner) ||
      context.ownerIsPlatformAdmin
    ) {
      errors.owner = 'Ví này đang là owner, pending owner hoặc admin nền tảng, không làm chủ agent được.'
    }
  }

  const nameBytes = utf8Length(values.storeName)
  if (nameBytes < 1 || nameBytes > 100) {
    errors.storeName = `Tên cửa hàng phải từ 1 đến 100 byte UTF-8 (đang ${nameBytes}).`
  }
  const addressBytes = utf8Length(values.storeAddress)
  if (addressBytes > 200) errors.storeAddress = `Địa chỉ cửa hàng tối đa 200 byte UTF-8 (đang ${addressBytes}).`
  const noteBytes = utf8Length(values.note)
  if (noteBytes > 500) errors.note = `Ghi chú tối đa 500 byte UTF-8 (đang ${noteBytes}).`
  if (!PHONE.test(values.storePhone)) {
    errors.storePhone = 'SĐT chỉ gồm chữ số và + - . ( ) hoặc khoảng trắng, tối đa 20 ký tự.'
  }
  return errors
}

/** Luật BranchInit: domain, dịch vụ, múi giờ, hồ sơ. */
export function validateBranchForm(values: BranchFormValues): Record<string, string> {
  const errors: Record<string, string> = {}
  if (!DOMAIN.test(values.domain)) {
    errors.domain = 'Domain chữ thường, 3–253 ký tự a–z, 0–9, dấu chấm hoặc gạch ngang, không bắt đầu hay kết thúc bằng chúng.'
  }
  const nameBytes = utf8Length(values.name)
  if (nameBytes < 1 || nameBytes > 100) {
    errors.name = `Tên chi nhánh phải từ 1 đến 100 byte UTF-8 (đang ${nameBytes}).`
  }
  const locationBytes = utf8Length(values.location)
  if (locationBytes > 200) errors.location = `Địa điểm tối đa 200 byte UTF-8 (đang ${locationBytes}).`
  const noteBytes = utf8Length(values.note)
  if (noteBytes > 500) errors.note = `Ghi chú tối đa 500 byte UTF-8 (đang ${noteBytes}).`
  if (!PHONE.test(values.phone)) {
    errors.phone = 'SĐT chỉ gồm chữ số và + - . ( ) hoặc khoảng trắng, tối đa 20 ký tự.'
  }
  if (!LONGLAT.test(values.longlat)) {
    errors.longlat = 'Toạ độ dạng lat,long hoặc rỗng. Chỉ gồm chữ số, dấu chấm, phẩy, gạch ngang và khoảng trắng, tối đa 40 ký tự.'
  }
  if (!values.net && !values.iqr) {
    errors.services = 'Phải bật NET hoặc IQR. Loyalty chỉ bật kèm một trong hai.'
  }
  const tz = Number(values.tzOffsetMinutes)
  if (!Number.isInteger(tz) || tz < -720 || tz > 840) {
    errors.tzOffsetMinutes = 'Múi giờ là số nguyên từ -720 đến 840 phút so với UTC. Việt Nam là 420.'
  }
  return errors
}

export function servicesFromForm(values: Pick<BranchFormValues, 'net' | 'iqr' | 'loyalty'>): number {
  return (values.net ? 1 : 0) | (values.iqr ? 2 : 0) | (values.loyalty ? 4 : 0)
}
