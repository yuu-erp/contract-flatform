import type { PreviewAgentRole } from './PreviewBootstrap'
import { readDomainParam } from '../lib/read-domain'

export type PreviewAccess =
  | { kind: 'login' }
  | { kind: 'owner'; agentId: number; storeName: string; focusBranchId?: number; focusDomain?: string }
  | { kind: 'manager'; agentId: number; branchId: number; domain: string; branchName: string; storeName: string }
  | { kind: 'pick-branch'; branches: { branchId: number; agentId: number; domain: string; name: string }[] }
  | { kind: 'no-access'; domain?: string; message: string }
  | { kind: 'domain-not-found'; domain: string }

const PICK_BRANCHES = [
  { branchId: 1, agentId: 1, domain: 'agent1-cn1.mock.local', name: 'Cyber Quận 1 · 1' },
  { branchId: 4, agentId: 2, domain: 'agent2-cn2.mock.local', name: 'Nhà hàng Phở Hà Nội · 2' },
]

export function resolvePreviewAccess(role: PreviewAgentRole, search: string): PreviewAccess {
  const domain = readDomainParam(search)
  if (role === 'none') {
    return { kind: 'no-access', message: 'Ví này không có quyền truy cập app agent.' }
  }
  if (role === 'staff') {
    return {
      kind: 'no-access',
      domain,
      message: domain ? `Ví này không phải quản lý của ${domain}` : 'Ví Staff không có quyền quản trị.',
    }
  }
  if (domain === 'khong-co.mock.local' || domain === 'khong-co.test') {
    return { kind: 'domain-not-found', domain }
  }
  if (role === 'owner1') {
    if (domain === 'agent1-cn1.mock.local') {
      return {
        kind: 'owner',
        agentId: 1,
        storeName: 'Cyber Quận 1',
        focusBranchId: 1,
        focusDomain: domain,
      }
    }
    return { kind: 'owner', agentId: 1, storeName: 'Cyber Quận 1' }
  }
  if (role === 'manager3001') {
    if (!domain) {
      return { kind: 'pick-branch', branches: PICK_BRANCHES }
    }
    if (domain === 'agent2-cn2.mock.local') {
      return { kind: 'no-access', domain, message: `Ví này không phải quản lý của ${domain}` }
    }
    if (domain !== 'agent1-cn1.mock.local') {
      return { kind: 'domain-not-found', domain }
    }
    return {
      kind: 'manager',
      agentId: 1,
      branchId: 1,
      domain,
      branchName: 'Cyber Quận 1 · 1',
      storeName: 'Cyber Quận 1',
    }
  }
  if (role === 'dual3002') {
    if (domain === 'agent3-cn1.mock.local') {
      return {
        kind: 'manager',
        agentId: 3,
        branchId: 5,
        domain,
        branchName: 'Spa Sen Vàng · 1',
        storeName: 'Spa Sen Vàng',
      }
    }
    return { kind: 'owner', agentId: 2, storeName: 'Nhà hàng Phở Hà Nội' }
  }
  return { kind: 'login' }
}