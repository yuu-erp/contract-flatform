import { describe, expect, it } from 'vitest'
import { isValidBranchDomain, validateCreateBranchForm } from '../src/lib/validate-create-branch'
import { SERVICE_MASK } from '../src/lib/validate-create-agent'

describe('isValidBranchDomain', () => {
  it('chấp nhận domain hợp lệ, từ chối sai chữ hoa hoặc ký tự đầu/cuối', () => {
    expect(isValidBranchDomain('q1.vn')).toBe(true)
    expect(isValidBranchDomain('Q1.vn')).toBe(false)
    expect(isValidBranchDomain('-q1.vn')).toBe(false)
    expect(isValidBranchDomain('ab')).toBe(false)
  })
})

describe('validateCreateBranchForm', () => {
  const base = {
    domain: 'q1.vn',
    services: SERVICE_MASK.NET,
    tzOffsetMinutes: 420,
    name: 'Q1',
    location: '',
    phone: '02838220000',
    longlat: '10.5,106.5',
    note: '',
  }

  it('LOYALTY một mình không hợp lệ', () => {
    const errors = validateCreateBranchForm({ ...base, services: SERVICE_MASK.LOYALTY })
    expect(errors.services).toBeTruthy()
  })

  it('dịch vụ ngoài allowedServices của agent bị chặn', () => {
    const errors = validateCreateBranchForm({ ...base, services: SERVICE_MASK.IQR }, SERVICE_MASK.NET)
    expect(errors.services).toBeTruthy()
  })
})