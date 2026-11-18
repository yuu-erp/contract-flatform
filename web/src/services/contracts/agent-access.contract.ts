import { MtnContract } from '@metanodejs/mtn-contract'
import { toAddress } from '@/lib/address'
import { agentAccessABI } from './abi'
import { asList, asNumber, asRecord, asString, unwrapValue } from './normalize'

const MEMBER_FIELDS = ['account', 'role', 'grantedBy', 'grantedAt'] as const

export type MemberView = {
  account: string
  role: number
  grantedBy: string
  grantedAt: number
}

function toMember(value: unknown): MemberView {
  const record = asRecord(value, MEMBER_FIELDS)
  return {
    account: toAddress(asString(record.account)),
    role: asNumber(record.role),
    grantedBy: toAddress(asString(record.grantedBy)),
    grantedAt: asNumber(record.grantedAt),
  }
}

export class AgentAccessContract extends MtnContract {
  constructor(from: string, to: string) {
    super({ from, to })
  }

  public async roleOf(branchId: number, account: string): Promise<number> {
    const result = await this.sendTransaction({
      functionName: agentAccessABI.roleOf.name,
      abiData: agentAccessABI.roleOf,
      inputData: { branchId: String(branchId), account },
      feeType: 'read',
    })
    return asNumber(unwrapValue(result))
  }

  public async effectiveRoleOf(branchId: number, account: string): Promise<number> {
    const result = await this.sendTransaction({
      functionName: agentAccessABI.effectiveRoleOf.name,
      abiData: agentAccessABI.effectiveRoleOf,
      inputData: { branchId: String(branchId), account },
      feeType: 'read',
    })
    return asNumber(unwrapValue(result))
  }

  public async memberCountOf(branchId: number): Promise<number> {
    const result = await this.sendTransaction({
      functionName: agentAccessABI.memberCountOf.name,
      abiData: agentAccessABI.memberCountOf,
      inputData: { branchId: String(branchId) },
      feeType: 'read',
    })
    return asNumber(unwrapValue(result))
  }

  public async membersOf(branchId: number, offset: number, limit: number): Promise<MemberView[]> {
    const result = await this.sendTransaction({
      functionName: agentAccessABI.membersOf.name,
      abiData: agentAccessABI.membersOf,
      inputData: { branchId: String(branchId), offset: String(offset), limit: String(limit) },
      feeType: 'read',
    })
    return asList(result).map(toMember)
  }

  public async branchCountOfAccount(account: string): Promise<number> {
    const result = await this.sendTransaction({
      functionName: agentAccessABI.branchCountOfAccount.name,
      abiData: agentAccessABI.branchCountOfAccount,
      inputData: { account },
      feeType: 'read',
    })
    return asNumber(unwrapValue(result))
  }

  public async branchesOfAccount(account: string, offset: number, limit: number): Promise<number[]> {
    const result = await this.sendTransaction({
      functionName: agentAccessABI.branchesOfAccount.name,
      abiData: agentAccessABI.branchesOfAccount,
      inputData: { account, offset: String(offset), limit: String(limit) },
      feeType: 'read',
    })
    return asList(result).map((item) => asNumber(unwrapValue(item)))
  }

  public async grantRole(branchId: number, account: string, role: number): Promise<void> {
    await this.sendTransaction({
      functionName: agentAccessABI.grantRole.name,
      abiData: agentAccessABI.grantRole,
      inputData: { branchId: String(branchId), account, role: String(role) },
      feeType: 'sc',
    })
  }

  public async revokeRole(branchId: number, account: string): Promise<void> {
    await this.sendTransaction({
      functionName: agentAccessABI.revokeRole.name,
      abiData: agentAccessABI.revokeRole,
      inputData: { branchId: String(branchId), account },
      feeType: 'sc',
    })
  }

  public async renounceRole(branchId: number): Promise<void> {
    await this.sendTransaction({
      functionName: agentAccessABI.renounceRole.name,
      abiData: agentAccessABI.renounceRole,
      inputData: { branchId: String(branchId) },
      feeType: 'sc',
    })
  }
}
