import { MtnContract } from '@metanodejs/mtn-contract'
import { toAddress } from '@/lib/address'
import { platformAccessABI } from './abi'
import { asString, unwrapValue } from './normalize'

function readBool(value: unknown): boolean {
  const raw = unwrapValue(value)
  if (typeof raw === 'boolean') return raw
  if (typeof raw === 'string') return raw === 'true' || raw === '1'
  return Boolean(raw)
}

export class PlatformAccessContract extends MtnContract {
  constructor(from: string, to: string) {
    super({ from, to })
  }

  public async owner(): Promise<string> {
    const result = await this.sendTransaction<string | { '': string }>({
      functionName: platformAccessABI.owner.name,
      abiData: platformAccessABI.owner,
      inputData: {},
      feeType: 'read',
    })
    return toAddress(asString(unwrapValue(result)))
  }

  public async pendingOwner(): Promise<string> {
    const result = await this.sendTransaction<string | { '': string }>({
      functionName: platformAccessABI.pendingOwner.name,
      abiData: platformAccessABI.pendingOwner,
      inputData: {},
      feeType: 'read',
    })
    return toAddress(asString(unwrapValue(result)))
  }

  public async isPlatformAdmin(account: string): Promise<boolean> {
    const result = await this.sendTransaction({
      functionName: platformAccessABI.isPlatformAdmin.name,
      abiData: platformAccessABI.isPlatformAdmin,
      inputData: { account },
      feeType: 'read',
    })
    return readBool(result)
  }

  public async paused(): Promise<boolean> {
    const result = await this.sendTransaction({
      functionName: platformAccessABI.paused.name,
      abiData: platformAccessABI.paused,
      inputData: {},
      feeType: 'read',
    })
    return readBool(result)
  }
}
