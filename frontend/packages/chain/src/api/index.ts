import type { AgentRegistryContract } from '../contracts/agent-registry.contract'
import type { BranchRegistryContract } from '../contracts/branch-registry.contract'
import type { AgentAccessContract } from '../contracts/agent-access.contract'
import type { LedgerContract } from '../contracts/ledger.contract'
import type { SalesSettingsContract } from '../contracts/sales-settings.contract'
import type { PlatformAccessContract } from '../contracts/platform-access.contract'
import { resolvePlatformRole, type PlatformRole } from '../roles'
import { asBigInt, asNumber, asString, unwrapNamed, unwrapValue } from '../normalize'
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
  mapLicense,
  mapModuleRollup,
  mapRollup,
  mergeModuleRollups,
  MODULE_IQR,
  MODULE_NET,
  mapTaxQuote,
} from './mappers'
import type { AgentProfile, BranchProfile, BranchProfileRecord } from '../decode'
import type {
  AgentProfileRecord,
  AgentView,
  BranchTax,
  BranchView,
  LedgerEntry,
  LedgerLicense,
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

  async branchCount(): Promise<number> {
    return asNumber(await this.inner.branchCount())
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

  async branchByDomain(domain: string): Promise<number> {
    return asNumber(await this.inner.branchByDomain(domain))
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

  async memberCountOf(branchId: number): Promise<number> {
    return asNumber(await this.inner.memberCountOf(String(branchId)))
  }

  async roleOf(branchId: number, account: string): Promise<number> {
    return asNumber(await this.inner.roleOf(String(branchId), account))
  }

  async grantRole(branchId: number, account: string, role: number): Promise<void> {
    await this.inner.grantRole(String(branchId), account, String(role))
  }

  async revokeRole(branchId: number, account: string): Promise<void> {
    await this.inner.revokeRole(String(branchId), account)
  }

  async renounceRole(branchId: number): Promise<void> {
    await this.inner.renounceRole(String(branchId))
  }
}

export class LedgerApi {
  constructor(private readonly inner: LedgerContract) {}

  /**
   * Bộ đếm ngày ở dạng 32 ô quen thuộc của frontend (`METRIC` trong metrics.ts).
   * Từ ADR 0031, chain tách: ô 0..9 ở `rollup`, bộ đếm từng module ở `moduleRollup` (9 ô / module).
   * Ở đây ghép lại: NET (module 1) vào ô 10..17 + 26, IQR (module 2) vào ô 18..25 + 27.
   * Frontend (T4) được biết tên module; contract nền tảng thì không.
   */
  async rollup(scope: number, id: number, fromDay: number, toDay: number): Promise<bigint[][]> {
    const [base, net, iqr] = await Promise.all([
      this.inner.rollup(String(scope), String(id), String(fromDay), String(toDay)),
      this.inner.moduleRollup(String(scope), String(id), String(MODULE_NET), String(fromDay), String(toDay)),
      this.inner.moduleRollup(String(scope), String(id), String(MODULE_IQR), String(fromDay), String(toDay)),
    ])
    return mergeModuleRollups(mapRollup(base), mapModuleRollup(net), mapModuleRollup(iqr))
  }

  async moduleRollup(scope: number, id: number, moduleId: number, fromDay: number, toDay: number): Promise<bigint[][]> {
    return mapModuleRollup(
      await this.inner.moduleRollup(String(scope), String(id), String(moduleId), String(fromDay), String(toDay)),
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
    return asBigInt(unwrapNamed(await this.inner.balanceOf(String(agentId), customer), 'sum'))
  }

  async walletLiability(agentId: number): Promise<bigint> {
    return asBigInt(await this.inner.walletLiability(String(agentId)))
  }

  async licenseOf(poster: string): Promise<LedgerLicense> {
    return mapLicense(await this.inner.licenseOf(poster))
  }

  /** ADR 0031: `moduleId` 0 = thanh toán nền tảng (Topup/TopupRefund), 1 NET, 2 IQR; `kindsMask` 0 = thu hồi. */
  async setPoster(poster: string, moduleId: number, kindsMask: number, maxAmount: bigint): Promise<void> {
    await this.inner.setPoster(poster, String(moduleId), String(kindsMask), maxAmount.toString())
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

  async setAgentTax(agentId: number, service: number, bps: number): Promise<void> {
    await this.inner.setAgentTax(String(agentId), String(service), String(bps))
  }

  async setBranchTax(branchId: number, service: number, bps: number): Promise<void> {
    await this.inner.setBranchTax(String(branchId), String(service), String(bps))
  }

  async clearBranchTax(branchId: number, service: number): Promise<void> {
    await this.inner.clearBranchTax(String(branchId), String(service))
  }

  async setTaxExclusive(agentId: number, service: number, exclusive: boolean): Promise<void> {
    await this.inner.setTaxExclusive(String(agentId), String(service), exclusive)
  }

  async setAgentPaymentMethods(agentId: number, methods: number): Promise<void> {
    await this.inner.setAgentPaymentMethods(String(agentId), String(methods))
  }

  async setBranchPaymentMethods(branchId: number, methods: number): Promise<void> {
    await this.inner.setBranchPaymentMethods(String(branchId), String(methods))
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
export * from './list-agent-branches'
export * from './fetch-agent-branches'