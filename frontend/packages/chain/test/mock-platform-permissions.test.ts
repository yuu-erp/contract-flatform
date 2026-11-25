import { describe, expect, it } from 'vitest'
import { createMockContracts, PREVIEW_WALLETS } from '../src/mock'
import type { AgentProfile } from '../src/decode'

const profile: AgentProfile = { storeName: 'Cyber test', storeAddress: '1 Le Loi', note: '', storePhone: '0900000000' }

describe('mock: quyền owner/admin nền tảng', () => {
  it('owner tạo được agent và pause/unpause được', async () => {
    const c = createMockContracts(1, PREVIEW_WALLETS.owner)
    const before = await c.agents.agentCount()
    await c.agents.createAgent('0x0000000000000000000000000000000000007777', 1, profile)
    expect(await c.agents.agentCount()).toBe(before + 1)
    await c.access.pause()
    expect(await c.access.paused()).toBe(true)
    await expect(c.agents.createAgent('0x0000000000000000000000000000000000007778', 1, profile)).rejects.toThrow(
      'EnforcedPause',
    )
    await c.access.unpause()
    expect(await c.access.paused()).toBe(false)
  }, 20_000)

  it('admin pause/unpause được nhưng không thêm admin', async () => {
    const c = createMockContracts(1, PREVIEW_WALLETS.admin)
    await c.access.pause()
    await c.access.unpause()
    await expect(c.access.addPlatformAdmin('0x0000000000000000000000000000000000007779')).rejects.toThrow(
      'NotPlatformOwner',
    )
  }, 20_000)

  it('ví ngoài không ghi được', async () => {
    const c = createMockContracts(1, PREVIEW_WALLETS.none)
    await expect(c.access.pause()).rejects.toThrow('NotPlatformAdmin')
    await expect(c.agents.createAgent('0x0000000000000000000000000000000000007780', 1, profile)).rejects.toThrow(
      'NotPlatformAdmin',
    )
  })
})

describe('mock: hàm thô mà lớp Api gọi', () => {
  it('resolvePlatformRole qua lớp Api đúng cho owner / admin / ví ngoài', async () => {
    const c = createMockContracts(42, PREVIEW_WALLETS.owner)
    expect(await c.access.resolvePlatformRole(PREVIEW_WALLETS.owner)).toEqual({
      isOwner: true,
      isAdmin: false,
      isPendingOwner: false,
    })
    expect((await c.access.resolvePlatformRole(PREVIEW_WALLETS.admin)).isAdmin).toBe(true)
    const none = await c.access.resolvePlatformRole(PREVIEW_WALLETS.none)
    expect(none.isOwner || none.isAdmin).toBe(false)
    expect(await c.access.ownerAddress()).toBe(PREVIEW_WALLETS.owner)
    expect(await c.branches.branchCount()).toBeGreaterThan(0)
  })
})
