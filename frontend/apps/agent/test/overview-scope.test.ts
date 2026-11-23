import { describe, expect, it } from 'vitest'
import { SCOPE_AGENT, SCOPE_BRANCH } from '@meta-platform/ui'
import { overviewRollupTarget } from '../src/lib/overview-scope'

describe('overviewRollupTarget', () => {
  it('manager chỉ dùng scope chi nhánh', () => {
    expect(overviewRollupTarget({ kind: 'manager', agentId: 1, branchId: 5, domain: 'x.mock' })).toEqual({
      scope: SCOPE_BRANCH,
      id: 5,
    })
  })

  it('chủ agent dùng scope agent', () => {
    expect(overviewRollupTarget({ kind: 'owner', agentId: 2 })).toEqual({
      scope: SCOPE_AGENT,
      id: 2,
    })
  })
})