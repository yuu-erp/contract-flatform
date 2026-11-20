import { allAbis, type AbiEntry } from './abi'
import { keccak256Hex } from './keccak256'

const MESSAGES: Record<string, string> = {
  OwnerAlreadyHasAgent: 'Ví này đã có agent.',
  OwnerIsPlatformRole: 'Ví này đang là owner, pending owner hoặc admin nền tảng.',
  InvalidStoreName: 'Tên cửa hàng phải từ 1 đến 100 byte UTF-8.',
  FieldTooLong: 'Một trường văn bản dài quá giới hạn của contract.',
  InvalidPhone: 'SĐT chỉ gồm chữ số và + - . ( ) hoặc khoảng trắng, tối đa 20 ký tự.',
  NotPlatformAdmin: 'Ví này không phải PLATFORM_ADMIN.',
  EnforcedPause: 'Hệ đang tạm dừng (pause).',
  ExpectedPause: 'Hệ đang chạy, không cần mở lại.',
  EmptyReason: 'Cần nhập lý do.',
  InvalidStatusTransition: 'Không đổi được trạng thái này.',
  AgentDeleted: 'Agent đã xoá mềm, chỉ còn đọc.',
  AgentNotActive: 'Agent không ở trạng thái Active.',
  AgentNotFound: 'Không tìm thấy agent.',
  BranchNotFound: 'Không tìm thấy chi nhánh.',
  BranchDeleted: 'Chi nhánh đã xoá mềm.',
  BranchNotActive: 'Chi nhánh không ở trạng thái Active.',
  CannotDeleteMainBranch: 'Không xoá chi nhánh chính khi agent còn tồn tại.',
  InvalidDomain: 'Domain phải là chữ thường, 3–253 ký tự a–z, 0–9, dấu chấm hoặc gạch ngang.',
  DomainTaken: 'Domain này đã thuộc chi nhánh khác.',
  InvalidTimezone: 'Múi giờ phải từ -720 đến 840 phút so với UTC.',
  InvalidBranchName: 'Tên chi nhánh phải từ 1 đến 100 byte UTF-8.',
  InvalidLonglat: 'Toạ độ không hợp lệ.',
  InvalidServices: 'Phải có NET hoặc IQR.',
  ServiceNotAllowed: 'Chi nhánh bật module ngoài trần được cấp cho agent.',
  ServiceNotEnabled: 'Dịch vụ chưa được bật tại chi nhánh này.',
  OwnableUnauthorizedAccount: 'Không đủ quyền thực hiện thao tác này.',
  NotPlatformOwner: 'Chỉ PLATFORM_OWNER làm được việc này.',
  TaxTooHigh: 'Thuế vượt quá 100%.',
  TaxModeNotAllowed: 'Không đổi được kiểu giá cho dịch vụ này.',
  InvalidMethods: 'Tổ hợp phương thức thanh toán không hợp lệ.',
  MethodsNotAllowed: 'Phương thức thanh toán không được phép.',
  MethodNotEnabled: 'Phương thức thanh toán chưa được bật tại chi nhánh này.',
  InsufficientBalance: 'Số dư ví không đủ để thực hiện giao dịch.',
  ZeroAddress: 'Địa chỉ không hợp lệ (zero address).',
  ZeroAmount: 'Số tiền phải lớn hơn 0.',
  ZeroRefId: 'Thiếu refId.',
  NotPoster: 'Module không được phép ghi loại bút toán này.',
  RefIdUsed: 'refId đã được dùng.',
  InvalidMethod: 'Phương thức thanh toán không hợp lệ cho bút toán này.',
  TooManyBuckets: 'Ví khách có quá nhiều túi theo chi nhánh.',
  InvalidRange: 'Khoảng thời gian không hợp lệ.',
  UnknownEntry: 'Không tìm thấy bút toán.',
  RefundExceedsOriginal: 'Số tiền hoàn vượt phần còn lại của bút toán gốc.',
  WrongBranch: 'Chi nhánh không khớp với bút toán.',
  InvalidService: 'Dịch vụ không hợp lệ.',
  InvalidReason: 'Lý do không hợp lệ.',
  NotWriter: 'Địa chỉ không được phép ghi FullDB.',
  KindNotAllowed: 'Writer không được ghi loại dữ liệu này.',
  InvalidKind: 'Loại FullDB không hợp lệ.',
  InvalidLimit: 'Giới hạn truy vấn vượt MAX_LIMIT.',
  UserRejected: 'Người dùng từ chối ký giao dịch.',
}

function signatureOf(entry: AbiEntry): string {
  const types = (entry.inputs ?? []).map((input) => input.type ?? '').join(',')
  return `${entry.name}(${types})`
}

function selectorOf(signature: string): string {
  return `0x${keccak256Hex(signature).slice(0, 8)}`
}

const selectorMessages = new Map<string, string>()
for (const entry of allAbis) {
  if (entry.type !== 'error' || !entry.name) continue
  const message = MESSAGES[entry.name]
  if (!message) continue
  selectorMessages.set(selectorOf(signatureOf(entry)).toLowerCase(), message)
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
  const lower = text.toLowerCase()
  if (lower.includes('user rejected') || lower.includes('user denied') || lower.includes('cancel')) {
    return MESSAGES.UserRejected
  }
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

/** Giải mã revert theo selector 4 byte, rồi theo tên lỗi trong message. */
export function decodeContractError(error: unknown): string {
  const texts: string[] = []
  collectText(error, texts, 0)
  for (const text of texts) {
    const known = messageFromText(text)
    if (known) return known
  }
  const raw = texts.find((text) => text.trim().length > 0)
  return raw?.trim() || 'Giao dịch thất bại.'
}

export { MESSAGES as contractErrorMessages }