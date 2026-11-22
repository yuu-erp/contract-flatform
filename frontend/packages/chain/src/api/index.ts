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
  mapAddressList,
  mapAddressPage,
  mapAgent,
  mapAgentProfileRecord,
  mapBranchProfileRecord,
  mapBranch,
  mapBranchIdList,
  mapAgentTaxBps,
  mapBranchTax,
  mapEntry,
  mapMembers,
  mapPortions,
  mapRollup,
  mapTaxQuote,
} from './mappers'
import type { AgentProfile, BranchProfile, BranchProfileRecord } from '../decode'
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

  async updateAgentProfile(agentId: number, profile: AgentProfile): Promise<void> {
    await this.inner.updateAgentProfile(String(agentId), profile)
  }

  async setAgentServices(agentId: number, allowedServices: number): Promise<void> {
    await this.inner.setAgentServices(String(agentId), String(allowedServices))
  }

  async suspendAgent(agentId: number, reason: string): Promise<void> {
    await this.inner.suspendAgent(String(agentId), reason)
  }

  async resumeAgent(agentId: number, reason: string): Promise<void> {
    await this.inner.resumeAgent(String(agentId), reason)
  }

  async deleteAgent(agentId: number, reason: string): Promise<void> {
    await this.inner.deleteAgent(String(agentId), reason)
  }

  async proposeAgentOwner(agentId: number, newOwner: string): Promise<void> {
    await this.inner.proposeAgentOwner(String(agentId), newOwner)
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

  async getBranchProfile(branchId: number): Promise<BranchProfileRecord> {
    return mapBranchProfileRecord(await this.inner.getBranchProfile(String(branchId)))
  }

  async mainBranchOf(agentId: number): Promise<number> {
    return asNumber(await this.inner.mainBranchOf(String(agentId)))
  }

  async createBranch(agentId: number, init: unknown): Promise<void> {
    await this.inner.createBranch(String(agentId), init)
  }

  async updateBranchProfile(branchId: number, profile: BranchProfile): Promise<void> {
    await this.inner.updateBranchProfile(String(branchId), profile)
  }

  async setBranchDomain(branchId: number, domain: string): Promise<void> {
    await this.inner.setBranchDomain(String(branchId), domain)
  }

  async setBranchServices(branchId: number, services: number): Promise<void> {
    await this.inner.setBranchServices(String(branchId), String(services))
  }

  async setBranchTimezone(branchId: number, tzOffsetMinutes: number): Promise<void> {
    await this.inner.setBranchTimezone(String(branchId), String(tzOffsetMinutes))
  }

  async setMainBranch(branchId: number): Promise<void> {
    await this.inner.setMainBranch(String(branchId))
  }

  async suspendBranch(branchId: number, reason: string): Promise<void> {
    await this.inner.suspendBranch(String(branchId), reason)
  }

  async resumeBranch(branchId: number, reason: string): Promise<void> {
    await this.inner.resumeBranch(String(branchId), reason)
  }

  async deleteBranch(branchId: number, reason: string): Promise<void> {
    await this.inner.deleteBranch(String(branchId), reason)
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

  async posterKinds(poster: string): Promise<number> {
    return asNumber(unwrapValue(await this.inner.posterKinds(poster)))
  }

  async setPoster(poster: string, kindsMask: number): Promise<void> {
    await this.inner.setPoster(poster, String(kindsMask))
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

  async agentTaxOf(agentId: number, service: number): Promise<number> {
    return mapAgentTaxBps(await this.inner.agentTaxOf(String(agentId), String(service)))
  }

  async agentPaymentMethodsOf(agentId: number): Promise<number> {
    return asNumber(await this.inner.agentPaymentMethodsOf(String(agentId)))
  }

  async paymentMethodsOf(branchId: number): Promise<number> {
    return asNumber(await this.inner.paymentMethodsOf(String(branchId)))
  }

  async isTaxExclusive(agentId: number, service: number): Promise<boolean> {
    return Boolean(unwrapValue(await this.inner.isTaxExclusive(String(agentId), String(service))))
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

  async pause(): Promise<void> {
    await this.inner.pause()
  }

  async unpause(): Promise<void> {
    await this.inner.unpause()
  }

  async addPlatformAdmin(account: string): Promise<void> {
    await this.inner.addPlatformAdmin(account)
  }

  async removePlatformAdmin(account: string): Promise<void> {
    await this.inner.removePlatformAdmin(account)
  }

  async acceptOwnership(): Promise<void> {
    await this.inner.acceptOwnership()
  }

  async transferOwnership(newOwner: string): Promise<void> {
    await this.inner.transferOwnership(newOwner)
  }

  async platformAdminCount(): Promise<number> {
    return asNumber(await this.inner.platformAdminCount())
  }

  async agentRoleSources(): Promise<string[]> {
    return mapAddressList(await this.inner.agentRoleSources())
  }
}

export * from './types'
export * from './mappers'