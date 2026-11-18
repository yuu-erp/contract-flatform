import { MtnContract } from '@metanodejs/mtn-contract'
import { branchRegistryABI } from './abi'
import { asNumber, asRecord, asString, unwrapValue } from './normalize'

const BRANCH_FIELDS = ['id', 'agentId', 'status', 'services', 'isMain', 'tzOffsetMinutes', 'domainHash', 'createdAt', 'updatedAt', 'profileDocId'] as const
const PROFILE_FIELDS = ['name', 'location', 'phone', 'longlat', 'note'] as const
const RECORD_FIELDS = ['version', 'branchId', 'agentId', 'domain', 'profile', 'updatedAt'] as const

export type BranchProfileInput = {
  name: string
  location: string
  phone: string
  longlat: string
  note: string
}

export type BranchInitInput = {
  domain: string
  services: number
  tzOffsetMinutes: number
  profile: BranchProfileInput
}

export type BranchView = {
  id: string
  agentId: string
  status: number
  services: number
  domain: string
  name: string
}

function toBranch(value: unknown, domain: string, name: string): BranchView {
  const record = asRecord(value, BRANCH_FIELDS)
  return {
    id: asString(record.id),
    agentId: asString(record.agentId),
    status: asNumber(record.status),
    services: asNumber(record.services),
    domain,
    name,
  }
}

export class BranchRegistryContract extends MtnContract {
  constructor(from: string, to: string) {
    super({ from, to })
  }

  public async branchCount(): Promise<number> {
    const result = await this.sendTransaction({
      functionName: branchRegistryABI.branchCount.name,
      abiData: branchRegistryABI.branchCount,
      inputData: {},
      feeType: 'read',
    })
    return asNumber(unwrapValue(result))
  }

  public async agentOf(branchId: number): Promise<number> {
    const result = await this.sendTransaction({
      functionName: branchRegistryABI.agentOf.name,
      abiData: branchRegistryABI.agentOf,
      inputData: { branchId: String(branchId) },
      feeType: 'read',
    })
    return asNumber(unwrapValue(result))
  }

  public async getBranch(branchId: number): Promise<BranchView> {
    const [branch, profile] = await Promise.all([
      this.sendTransaction({
        functionName: branchRegistryABI.getBranch.name,
        abiData: branchRegistryABI.getBranch,
        inputData: { branchId: String(branchId) },
        feeType: 'read',
      }),
      this.getBranchProfile(branchId),
    ])
    return toBranch(branch, profile.domain, profile.name)
  }

  public async getBranchProfile(branchId: number): Promise<{ domain: string; name: string }> {
    const result = await this.sendTransaction({
      functionName: branchRegistryABI.getBranchProfile.name,
      abiData: branchRegistryABI.getBranchProfile,
      inputData: { branchId: String(branchId) },
      feeType: 'read',
    })
    const record = asRecord(result, RECORD_FIELDS)
    const profile = asRecord(record.profile, PROFILE_FIELDS)
    return { domain: asString(record.domain), name: asString(profile.name) }
  }

  public async createBranch(agentId: number, init: BranchInitInput): Promise<void> {
    await this.sendTransaction({
      functionName: branchRegistryABI.createBranch.name,
      abiData: branchRegistryABI.createBranch,
      inputData: {
        agentId: String(agentId),
        init: {
          domain: init.domain,
          services: String(init.services),
          tzOffsetMinutes: String(init.tzOffsetMinutes),
          profile: init.profile,
        },
      },
      feeType: 'sc',
    })
  }
}
