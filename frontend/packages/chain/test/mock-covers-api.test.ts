import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

/** Mock bọc bằng lớp *Api giống app thật; hàm thô nào lớp Api gọi mà mock thiếu thì xem trước hỏng. */
const read = (rel: string) => readFileSync(fileURLToPath(new URL(rel, import.meta.url)), 'utf8')

const MOCK_OBJECT: Record<string, string> = {
  PlatformAccessApi: 'access',
  AgentRegistryApi: 'agents',
  BranchRegistryApi: 'branches',
  AgentAccessApi: 'agentAccess',
  SalesSettingsApi: 'salesSettings',
  LedgerApi: 'ledger',
}

describe('mock có đủ hàm thô cho lớp Api', () => {
  const api = read('../src/api/index.ts')
  const roles = read('../src/roles.ts')
  const mock = read('../src/mock/create-mock-contracts.ts')
  const parts = api.split(/\nexport class (\w+)/)

  for (let i = 1; i < parts.length; i += 2) {
    const name = parts[i]!
    const obj = MOCK_OBJECT[name]
    if (!obj) continue
    it(name, () => {
      const used = new Set([...parts[i + 1]!.matchAll(/this\.inner\.(\w+)\(/g)].map((m) => m[1]!))
      if (name === 'PlatformAccessApi') for (const m of roles.matchAll(/access\.(\w+)\(/g)) used.add(m[1]!)
      const block = mock.match(new RegExp(`\\n  const ${obj} = \\{([\\s\\S]*?)\\n  \\} as unknown`))
      expect(block, `không thấy đối tượng mock ${obj}`).toBeTruthy()
      const have = new Set([...block![1]!.matchAll(/\n {4}(?:async )?(\w+)\(/g)].map((m) => m[1]!))
      expect([...used].filter((u) => !have.has(u))).toEqual([])
    })
  }
})
