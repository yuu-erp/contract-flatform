import { utf8Length } from '@meta-platform/chain'

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
const TZ_MIN = -720
const TZ_MAX = 840

export function validateCreateBranchForm(values: CreateBranchForm): Record<string, string> {
  const errors: Record<string, string> = {}
  const domain = values.domain.trim()
  if (!domain) errors.domain = 'Domain bắt buộc'
  else if (domain !== domain.toLowerCase()) errors.domain = 'Domain phải viết thường'
  const name = values.name.trim()
  if (!name) errors.name = 'Tên chi nhánh bắt buộc'
  else if (utf8Length(name) > MAX_NAME) errors.name = `Tối đa ${MAX_NAME} byte UTF-8`
  if (utf8Length(values.location) > MAX_LOC) errors.location = `Tối đa ${MAX_LOC} byte`
  if (utf8Length(values.note) > MAX_NOTE) errors.note = `Tối đa ${MAX_NOTE} byte`
  if (values.services === 0) errors.services = 'Chọn ít nhất một dịch vụ'
  if (values.tzOffsetMinutes < TZ_MIN || values.tzOffsetMinutes > TZ_MAX) {
    errors.tzOffsetMinutes = `Múi giờ trong khoảng ${TZ_MIN}…${TZ_MAX} phút`
  }
  return errors
}