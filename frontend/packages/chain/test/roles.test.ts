import { describe, expect, it } from 'vitest'
import { buildAgentContexts, Role } from '../src/roles'

describe('resolveAgentContexts', () => {
  it('owner + manager contexts; staff excluded', () => {
    const contexts = buildAgentContexts(
      '0xMe',
      {
        ownedAgentId: 1,
        branches: [
          { branchId: 7, agentId: 2, role: Role.Manager },
          { branchId: 9, agentId: 3, role: Role.Staff },
        ],
      },
    )
    expect(contexts).toEqual([
      { type: 'owner', agentId: 1 },
      { type: 'manager', agentId: 2, branchIds: [7] },
    ])
  })
})