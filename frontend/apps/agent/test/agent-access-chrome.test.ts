import { describe, expect, it } from 'vitest'
import { agentAccessErrorMessage } from '../src/layout/AgentAppChrome'

describe('agentAccessErrorMessage', () => {
  it('giải mã lỗi contract / RPC', () => {
    expect(agentAccessErrorMessage(new Error('NotAgentOwner'))).toMatch(/chủ agent|NotAgentOwner/i)
  })

  it('fallback khi không có error', () => {
    expect(agentAccessErrorMessage(undefined)).toMatch(/Không xác định được vai trò/)
  })
})