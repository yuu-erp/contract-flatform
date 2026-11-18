import { MtnContract } from '@metanodejs/mtn-contract'
import { toAddress } from '@/lib/address'
import { agentRegistryABI } from './abi'
import { asNumber, asRecord, asString, unwrapValue } from './normalize'

const AGENT_FIELDS = ['id', 'owner', 'pendingOwner', 'status', 'createdAt', 'updatedAt', 'profileDocId'] as const
const PROFILE_FIELDS = ['storeName', 'storeAddress', 'note', 'storePhone'] as const
const RECORD_FIELDS = ['version', 'agentId', 'owner', 'profile', 'updatedAt'] as const

export type AgentView = {
  id: string
  owner: string
  pendingOwner: string
  status: number
  createdAt: number
  updatedAt: number
  profileDocId: string
}

export type AgentProfileInput = {
  storeName: string
  storeAddress: string
  note: string
  storePhone: string
}

export type AgentListRow = AgentView & { storeName: string; storePhone: string }

function toAgent(value: unknown): AgentView {
  const record = asRecord(value, AGENT_FIELDS)
  return {
    id: asString(record.id),
    owner: toAddress(asString(record.owner)),
    pendingOwner: toAddress(asString(record.pendingOwner)),
    status: asNumber(record.status),
    createdAt: asNumber(record.createdAt),
    updatedAt: asNumber(record.updatedAt),
    profileDocId: asString(record.profileDocId),
  }
}

function toProfile(value: unknown): AgentProfileInput {
  const record = asRecord(value, PROFILE_FIELDS)
  return {
    storeName: asString(record.storeName),
    storeAddress: asString(record.storeAddress),
    note: asString(record.note),
    storePhone: asString(record.storePhone),
  }
}

export class AgentRegistryContract extends MtnContract {
  constructor(from: string, to: string) {
    super({ from, to })
  }

  public async agentCount(): Promise<number> {
    const result = await this.sendTransaction({
      functionName: agentRegistryABI.agentCount.name,
      abiData: agentRegistryABI.agentCount,
      inputData: {},
      feeType: 'read',
    })
    return asNumber(unwrapValue(result))
  }

  public async agentIdOf(owner: string): Promise<number> {
    const result = await this.sendTransaction({
      functionName: agentRegistryABI.agentIdOf.name,
      abiData: agentRegistryABI.agentIdOf,
      inputData: { owner },
      feeType: 'read',
    })
    return asNumber(unwrapValue(result))
  }

  public async getAgent(agentId: number): Promise<AgentView> {
    const result = await this.sendTransaction({
      functionName: agentRegistryABI.getAgent.name,
      abiData: agentRegistryABI.getAgent,
      inputData: { agentId: String(agentId) },
      feeType: 'read',
    })
    return toAgent(result)
  }

  public async getAgentProfile(agentId: number): Promise<AgentProfileInput> {
    const result = await this.sendTransaction({
      functionName: agentRegistryABI.getAgentProfile.name,
      abiData: agentRegistryABI.getAgentProfile,
      inputData: { agentId: String(agentId) },
      feeType: 'read',
    })
    const record = asRecord(result, RECORD_FIELDS)
    return toProfile(record.profile)
  }

  public async createAgent(owner: string, profile: AgentProfileInput): Promise<void> {
    await this.sendTransaction({
      functionName: agentRegistryABI.createAgent.name,
      abiData: agentRegistryABI.createAgent,
      inputData: { owner, profile },
      feeType: 'sc',
    })
  }
}
