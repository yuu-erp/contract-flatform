import { utf8Length } from '@meta-platform/chain'
import { isPhone, isValidServiceMask } from './validate-create-agent'

export type BranchFormProfile = {
  name: string
  location: string
  phone: string
  longlat: string
  note: string
}

export type CreateBranchForm = {
  domain: string
  services: number
  tzOffsetMinutes: number
} & BranchFormProfile

const MAX_NAME = 100
const MAX_LOC = 200
const MAX_NOTE = 500
const MAX_LONGLAT = 40
const TZ_MIN = -720
const TZ_MAX = 840
const DOMAIN_MIN = 3
const DOMAIN_MAX = 253

/** Mirror `TextRules` domain: chữ thường, `a-z0-9-.`, 3–253, không `-`/`.` đầu cuối. */
export function isValidBranchDomain(domain: string): boolean {
  const d = domain.trim()
  if (d.length < DOMAIN_MIN || d.length > DOMAIN_MAX) return false
  if (d !== d.toLowerCase()) return false
  if (!/^[a-z0-9.-]+$/.test(d)) return false
  if (d.startsWith('-') || d.startsWith('.') || d.endsWith('-') || d.endsWith('.')) return false
  return true
}

export function isValidLonglat(value: string): boolean {
  const s = value.trim()
  if (!s) return true
  if (utf8Length(s) > MAX_LONGLAT) return false
  return /^[0-9.,\-\s]+$/.test(s)
}

function validateServices(services: number, agentAllowedServices?: number): string | undefined {
  if (!isValidServiceMask(services)) {
    return 'Dịch vụ không hợp lệ (LOYALTY cần NET hoặc IQR).'
  }
  if (agentAllowedServices != null && (services & ~agentAllowedServices) !== 0) {
    return 'Dịch vụ vượt quá allowedServices của agent.'
  }
  return undefined
}

export function validateCreateBranchForm(
  values: CreateBranchForm,
  agentAllowedServices?: number,
): Record<string, string> {
  const errors: Record<string, string> = {}
  const domain = values.domain.trim()
  if (!domain) errors.domain = 'Domain bắt buộc'
  else if (!isValidBranchDomain(domain)) errors.domain = 'Domain 3–253 ký tự, chữ thường, a-z0-9-. không bắt đầu/kết thúc bằng - hoặc .'
  const name = values.name.trim()
  if (!name) errors.name = 'Tên chi nhánh bắt buộc'
  else if (utf8Length(name) > MAX_NAME) errors.name = `Tối đa ${MAX_NAME} byte UTF-8`
  if (utf8Length(values.location) > MAX_LOC) errors.location = `Tối đa ${MAX_LOC} byte`
  if (utf8Length(values.note) > MAX_NOTE) errors.note = `Tối đa ${MAX_NOTE} byte`
  if (!isPhone(values.phone.trim())) errors.phone = 'Số điện thoại không đúng định dạng.'
  if (!isValidLonglat(values.longlat)) errors.longlat = 'Toạ độ không hợp lệ (tối đa 40 ký tự, số . - , và khoảng trắng).'
  const servicesErr = validateServices(values.services, agentAllowedServices)
  if (servicesErr) errors.services = servicesErr
  if (values.tzOffsetMinutes < TZ_MIN || values.tzOffsetMinutes > TZ_MAX) {
    errors.tzOffsetMinutes = `Múi giờ trong khoảng ${TZ_MIN}…${TZ_MAX} phút`
  }
  return errors
}

export function validateBranchProfileForm(
  values: BranchFormProfile & { services: number },
  agentAllowedServices?: number,
): Record<string, string> {
  const errors: Record<string, string> = {}
  const name = values.name.trim()
  if (!name) errors.name = 'Tên chi nhánh bắt buộc'
  else if (utf8Length(name) > MAX_NAME) errors.name = `Tối đa ${MAX_NAME} byte UTF-8`
  if (utf8Length(values.location) > MAX_LOC) errors.location = `Tối đa ${MAX_LOC} byte`
  if (utf8Length(values.note) > MAX_NOTE) errors.note = `Tối đa ${MAX_NOTE} byte`
  if (!isPhone(values.phone.trim())) errors.phone = 'Số điện thoại không đúng định dạng.'
  if (!isValidLonglat(values.longlat)) errors.longlat = 'Toạ độ không hợp lệ.'
  const servicesErr = validateServices(values.services, agentAllowedServices)
  if (servicesErr) errors.services = servicesErr
  return errors
}