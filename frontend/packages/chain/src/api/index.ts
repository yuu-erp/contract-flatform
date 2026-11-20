import type { AgentRegistryContract } from '../contracts/agent-registry.contract'
import type { BranchRegistryContract } from '../contracts/branch-registry.contract'
import type { AgentAccessContract } from '../contracts/agent-access.contract'
import type { LedgerContract } from '../contracts/ledger.contract'
import type { SalesSettingsContract } from '../contracts/sales-settings.contract'
import type { PlatformAccessContract } from '../contracts/platform-access.contract'
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
import { asBigInt } from '../normalize'
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

  async getAgent(agentId: number): Promise<AgentView> {
    return mapAgent(await this.inner.getAgent(String(agentId)))
  }

  async getAgentProfile(agentId: number): Promise<AgentProfileRecord> {
    return mapAgentProfileRecord(await this.inner.getAgentProfile(String(agentId)))
  }
}

export class BranchRegistryApi {
  constructor(private readonly inner: BranchRegistryContract) {}

  async getBranch(branchId: number): Promise<BranchView> {
    return mapBranch(await this.inner.getBranch(String(branchId)))
  }
}

export class AgentAccessApi {
  constructor(private readonly inner: AgentAccessContract) {}

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
      await this.inner.rollup(scope, String(id), String(fromDay), String(toDay)),
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
      await this.inner.quoteTax(String(branchId), service, amount.toString()),
    )
  }

  async branchTaxOf(branchId: number, service: number): Promise<BranchTax> {
    return mapBranchTax(await this.inner.branchTaxOf(String(branchId), service))
  }
}

export class PlatformAccessApi {
  constructor(private readonly inner: PlatformAccessContract) {}

  async platformAdmins(offset: number, limit: number): Promise<string[]> {
    return mapAddressPage(await this.inner.platformAdmins(String(offset), String(limit)))
  }
}

export * from './types'
export * from './mappers'