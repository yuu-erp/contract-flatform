import { keccak256Hex } from '@/lib/keccak256'
import { platformErrorAbi, type PlatformAbiEntry } from '@/services/contracts/abi'

const MESSAGES: Record<string, string> = {
  NotAuthorized: 'Không đủ quyền trên chi nhánh này.',
  RoleUnchanged: 'Ví đã có đúng vai trò này.',
  NotMember: 'Ví không phải thành viên chi nhánh.',
  BranchNotActive: 'Chi nhánh không ở trạng thái Active.',
  AccountIsPlatformRole: 'Ví nhận là owner, pending owner hoặc admin nền tảng.',
  AccountIsAgentOwner: 'Ví nhận đang là chủ agent.',
  TooManyMembers: 'Chi nhánh đã đủ 200 thành viên.',
  TooManyBranches: 'Ví này đã thuộc đủ 20 chi nhánh.',
  InvalidRole: 'Chỉ cấp được Staff hoặc Manager.',
  ZeroAddress: 'Địa chỉ không được là 0x0.',
  AgentNotActive: 'Agent không ở trạng thái Active.',
  OwnerAlreadyHasAgent: 'Ví này đã có agent.',
  OwnerIsPlatformRole: 'Ví này đang là owner, pending owner hoặc admin nền tảng.',
  InvalidStoreName: 'Tên cửa hàng phải từ 1 đến 100 byte UTF-8.',
  FieldTooLong: 'Một trường văn bản dài quá giới hạn của contract.',
  InvalidPhone: 'SĐT chỉ gồm chữ số và + - . ( ) hoặc khoảng trắng, tối đa 20 ký tự.',
  InvalidDomain: 'Domain phải là chữ thường, 3–253 ký tự a–z, 0–9, dấu chấm hoặc gạch ngang.',
  DomainTaken: 'Domain này đã thuộc chi nhánh khác.',
  InvalidServices: 'Phải bật NET hoặc IQR. Loyalty chỉ bật kèm một trong hai.',
  ServiceNotAllowed: 'Chi nhánh chỉ được dùng module đã cấp cho agent.',
  InvalidTimezone: 'Múi giờ phải từ -720 đến 840 phút so với UTC.',
  InvalidBranchName: 'Tên chi nhánh phải từ 1 đến 100 byte UTF-8.',
  InvalidLonglat: 'Toạ độ chỉ gồm chữ số, dấu chấm, phẩy, gạch ngang và khoảng trắng, tối đa 40 ký tự.',
  BranchNotFound: 'Không tìm thấy chi nhánh.',
  NotPlatformAdmin: 'Ví này không phải PLATFORM_ADMIN.',
  EnforcedPause: 'Hệ đang tạm dừng (pause).',
}

export function errorSignature(entry: PlatformAbiEntry): string {
  const types = (entry.inputs ?? []).map((input) => input.type ?? '').join(',')
  return `${entry.name}(${types})`
}

/** 4 byte đầu của keccak256("Name(types)"), cùng `cast sig`. */
export function selectorOf(signature: string): string {
  return `0x${keccak256Hex(signature).slice(0, 8)}`
}

const selectorMessages = new Map<string, string>()
for (const entry of platformErrorAbi) {
  if (entry.type !== 'error' || !entry.name) continue
  const message = MESSAGES[entry.name]
  if (!message) continue
  selectorMessages.set(selectorOf(errorSignature(entry)), message)
}

function collectText(value: unknown, out: string[], depth: number): void {
  if (depth > 5 || value == null) return
  if (typeof value === 'string') {
    out.push(value)
    return
  }
  if (typeof value === 'number' || typeof value === 'bigint' || typeof value === 'boolean') {
    out.push(String(value))
    return
  }
  if (value instanceof Error) {
    out.push(value.message)
    const extra = value as Error & { data?: unknown; cause?: unknown }
    collectText(extra.data, out, depth + 1)
    collectText(extra.cause, out, depth + 1)
    return
  }
  if (Array.isArray(value)) {
    for (const item of value) collectText(item, out, depth + 1)
    return
  }
  if (typeof value === 'object') {
    for (const item of Object.values(value)) collectText(item, out, depth + 1)
  }
}

function messageFromText(text: string): string | null {
  for (const match of text.matchAll(/0x[0-9a-fA-F]{8,}/g)) {
    const selector = match[0].slice(0, 10).toLowerCase()
    const known = selectorMessages.get(selector)
    if (known) return known
  }
  for (const [name, message] of Object.entries(MESSAGES)) {
    if (text.includes(name)) return message
  }
  return null
}

export function explainPlatformError(error: unknown): string {
  const texts: string[] = []
  collectText(error, texts, 0)
  for (const text of texts) {
    const known = messageFromText(text)
    if (known) return known
  }
  const raw = texts.find((text) => text.trim().length > 0)
  return raw?.trim() || 'Giao dịch thất bại.'
}
