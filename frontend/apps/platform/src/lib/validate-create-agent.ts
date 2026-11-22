import { utf8Length } from '@meta-platform/chain'
import { isValidEthAddress } from '@meta-platform/ui'

const MAX_STORE_NAME = 100
const MAX_STORE_ADDRESS = 200
const MAX_NOTE = 500
const MAX_PHONE_LEN = 20

export const SERVICE_MASK = {
  NET: 1,
  IQR: 2,
  LOYALTY: 4,
  ALL: 7,
} as const

export function isValidServiceMask(mask: number): boolean {
  if (mask === 0 || (mask & ~SERVICE_MASK.ALL) !== 0) return false
  if ((mask & SERVICE_MASK.LOYALTY) !== 0 && (mask & (SERVICE_MASK.NET | SERVICE_MASK.IQR)) === 0) return false
  return true
}

/** Mirror `TextRules.isPhone` (byte length trong Solidity). */
export function isPhone(s: string): boolean {
  if (s.length > MAX_PHONE_LEN) return false
  if (!s) return true
  return /^[0-9+\-.\s()]+$/.test(s)
}

export type CreateAgentForm = {
  owner: string
  storeName: string
  storeAddress: string
  note: string
  storePhone: string
  allowedServices: number
}

export function validateCreateAgentForm(values: CreateAgentForm): Record<string, string> {
  const errors: Record<string, string> = {}
  const owner = values.owner.trim()
  if (!isValidEthAddress(owner)) errors.owner = 'Địa chỉ ví chủ không hợp lệ.'
  const name = values.storeName.trim()
  const nameLen = utf8Length(name)
  if (nameLen === 0 || nameLen > MAX_STORE_NAME) {
    errors.storeName = `Tên cửa hàng 1–${MAX_STORE_NAME} byte UTF-8.`
  }
  if (utf8Length(values.storeAddress) > MAX_STORE_ADDRESS) {
    errors.storeAddress = `Địa chỉ tối đa ${MAX_STORE_ADDRESS} byte.`
  }
  if (utf8Length(values.note) > MAX_NOTE) {
    errors.note = `Ghi chú tối đa ${MAX_NOTE} byte.`
  }
  if (!isPhone(values.storePhone.trim())) {
    errors.storePhone = 'Số điện thoại không đúng định dạng.'
  }
  if (!isValidServiceMask(values.allowedServices)) {
    errors.allowedServices = 'Chọn ít nhất một dịch vụ hợp lệ (LOYALTY cần NET hoặc IQR).'
  }
  return errors
}