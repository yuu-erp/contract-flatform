import type { AgentRegistryContract } from '../contracts/agent-registry.contract'
import type { BranchRegistryContract } from '../contracts/branch-registry.contract'
import type { AgentAccessContract } from '../contracts/agent-access.contract'
import type { LedgerContract } from '../contracts/ledger.contract'
import type { SalesSettingsContract } from '../contracts/sales-settings.contract'
import type { PlatformAccessContract } from '../contracts/platform-access.contract'
import { resolvePlatformRole, type PlatformRole } from '../roles'
import { asBigInt, asNumber, asString, unwrapValue } from '../normalize'
import { toAddress } from '../address'
import {
  mapAddressPage,
  mapAgent,
  mapAgentProfileRecord,
  mapBranch,
  mapBranchIdList,
  mapBranchTax,
  mapEntry,
  mapMembers,
  mapPortions,
  mapRollup,
  mapTaxQuote,
} from './mappers'
import type { AgentProfile } from '../decode'
import type {
  AgentProfileRecord,
  AgentView,
  BranchTax,
  BranchView,
  LedgerEntry,
  LedgerPortionView,
  MemberView,
  TaxQuote,
} from './types'

/** Quy ước SDK: uint/uint64 gửi `String(n)`, address giữ `0x…`. */
export class AgentRegistryApi {
  constructor(private readonly inner: AgentRegistryContract) {}

  async agentCount(): Promise<number> {
    return asNumber(await this.inner.agentCount())
  }

  async agentIdOf(owner: string): Promise<number> {
    return asNumber(await this.inner.agentIdOf(owner))
  }

  async getAgent(agentId: number): Promise<AgentView> {
    return mapAgent(await this.inner.getAgent(String(agentId)))
  }

  async getAgentProfile(agentId: number): Promise<AgentProfileRecord> {
    return mapAgentProfileRecord(await this.inner.getAgentProfile(String(agentId)))
  }

  async createAgent(owner: string, allowedServices: number, profile: AgentProfile): Promise<void> {
    await this.inner.createAgent(owner, String(allowedServices), profile)
  }
}

export class BranchRegistryApi {
  constructor(private readonly inner: BranchRegistryContract) {}

  async agentOf(branchId: number): Promise<number> {
    return asNumber(await this.inner.agentOf(String(branchId)))
  }

  async branchCountOf(agentId: number): Promise<number> {
    return asNumber(await this.inner.branchCountOf(String(agentId)))
  }

  async getBranch(branchId: number): Promise<BranchView> {
    return mapBranch(await this.inner.getBranch(String(branchId)))
  }
}

export class AgentAccessApi {
  constructor(private readonly inner: AgentAccessContract) {}

  async effectiveRoleOf(branchId: number, account: string): Promise<number> {
    return asNumber(await this.inner.effectiveRoleOf(String(branchId), account))
  }

  async membersOf(branchId: number, offset: number, limit: number): Promise<MemberView[]> {
    return mapMembers(await this.inner.membersOf(String(branchId), String(offset), String(limit)))
  }

  async branchesOfAccount(account: string, offset: number, limit: number): Promise<number[]> {
    return mapBranchIdList(await this.inner.branchesOfAccount(account, String(offset), String(limit)))
  }
}

export class LedgerApi {
  constructor(private readonly inner: LedgerContract) {}

  async rollup(scope: number, id: number, fromDay: number, toDay: number): Promise<bigint[][]> {
    return mapRollup(
      await this.inner.rollup(String(scope), String(id), String(fromDay), String(toDay)),
    )
  }

  async bucketsOf(agentId: number, customer: string): Promise<LedgerPortionView[]> {
    return mapPortions(await this.inner.bucketsOf(String(agentId), customer))
  }

  async portionsOf(refId: string): Promise<LedgerPortionView[]> {
    return mapPortions(await this.inner.portionsOf(refId))
  }

  async entryOf(refId: string): Promise<LedgerEntry> {
    return mapEntry(await this.inner.entryOf(refId))
  }

  async balanceOf(agentId: number, customer: string): Promise<bigint> {
    return asBigInt(await this.inner.balanceOf(String(agentId), customer))
  }

  async walletLiability(agentId: number): Promise<bigint> {
    return asBigInt(await this.inner.walletLiability(String(agentId)))
  }
}

export class SalesSettingsApi {
  constructor(private readonly inner: SalesSettingsContract) {}

  async quoteTax(branchId: number, service: number, amount: bigint): Promise<TaxQuote> {
    return mapTaxQuote(
      await this.inner.quoteTax(String(branchId), String(service), amount.toString()),
    )
  }

  async branchTaxOf(branchId: number, service: number): Promise<BranchTax> {
    return mapBranchTax(await this.inner.branchTaxOf(String(branchId), String(service)))
  }
}

export class PlatformAccessApi {
  constructor(private readonly inner: PlatformAccessContract) {}

  async platformAdmins(offset: number, limit: number): Promise<string[]> {
    return mapAddressPage(await this.inner.platformAdmins(String(offset), String(limit)))
  }

  async paused(): Promise<boolean> {
    return Boolean(unwrapValue(await this.inner.paused()))
  }

  async resolvePlatformRole(account: string): Promise<PlatformRole> {
    return resolvePlatformRole(this.inner, account)
  }

  async ownerAddress(): Promise<string> {
    return toAddress(asString(unwrapValue(await this.inner.owner())))
  }

  async pendingOwnerAddress(): Promise<string> {
    return toAddress(asString(unwrapValue(await this.inner.pendingOwner())))
  }
}

export * from './types'
export * from './mappers'