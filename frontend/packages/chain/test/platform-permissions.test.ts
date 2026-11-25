import { describe, expect, it } from 'vitest'
import { platformPermissions } from '../src/platform-permissions'

const owner = { isOwner: true, isAdmin: false, isPendingOwner: false }
const admin = { isOwner: false, isAdmin: true, isPendingOwner: false }
const pending = { isOwner: false, isAdmin: false, isPendingOwner: true }

describe('platformPermissions', () => {
  it('owner làm được mọi việc', () => {
    const p = platformPermissions(owner, false)
    expect(p.canWriteTenants).toBe(true)
    expect(p.canPause).toBe(true)
    expect(p.canUnpause).toBe(false)
    expect(p.canManageSystem).toBe(true)
    expect(p.tenantWriteBlockedReason).toBeNull()
    expect(p.systemBlockedReason).toBeNull()
  })

  it('admin vận hành được nhưng không cấu hình hệ', () => {
    const p = platformPermissions(admin, false)
    expect(p.canWriteTenants).toBe(true)
    expect(p.canPause).toBe(true)
    expect(p.canManageSystem).toBe(false)
    expect(p.systemBlockedReason).toBe('Chỉ Owner nền tảng')
  })

  it('admin mở lại được khi hệ pause; ghi agent bị chặn', () => {
    const p = platformPermissions(admin, true)
    expect(p.canUnpause).toBe(true)
    expect(p.canPause).toBe(false)
    expect(p.canWriteTenants).toBe(false)
    expect(p.tenantWriteBlockedReason).toBe('Hệ đang tạm dừng')
  })

  it('pending owner và ví ngoài không ghi gì', () => {
    for (const role of [pending, undefined]) {
      const p = platformPermissions(role, false)
      expect(p.isOperator).toBe(false)
      expect(p.canWriteTenants).toBe(false)
      expect(p.canPause).toBe(false)
      expect(p.canManageSystem).toBe(false)
      expect(p.tenantWriteBlockedReason).toBe('Cần ví Owner hoặc Admin nền tảng')
    }
  })
})
