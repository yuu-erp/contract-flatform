/** SDK trả tuple thành object theo tên, mảng theo thứ tự ABI, hoặc bọc `{ "": value }`. */

export function unwrapValue(value: unknown): unknown {
  if (value && typeof value === 'object' && '' in (value as object)) {
    return (value as { '': unknown })['']
  }
  return value
}

export function asRecord(value: unknown, fields: readonly string[]): Record<string, unknown> {
  const raw = unwrapValue(value)
  if (Array.isArray(raw)) {
    const record: Record<string, unknown> = {}
    fields.forEach((field, index) => {
      record[field] = raw[index]
    })
    return record
  }
  if (raw && typeof raw === 'object') {
    const source = raw as Record<string, unknown>
    const record: Record<string, unknown> = { ...source }
    fields.forEach((field, index) => {
      if (record[field] == null && source[String(index)] != null) record[field] = source[String(index)]
    })
    return record
  }
  return {}
}

export function asString(value: unknown): string {
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'bigint') return String(value)
  return ''
}

export function asBool(value: unknown): boolean {
  if (typeof value === 'boolean') return value
  if (typeof value === 'number') return value !== 0
  if (typeof value === 'string') return value === 'true' || value === '1'
  return false
}

export function asNumber(value: unknown): number {
  const raw = unwrapValue(value)
  if (typeof raw === 'number' && Number.isFinite(raw)) return raw
  if (typeof raw === 'bigint') {
    if (raw > BigInt(Number.MAX_SAFE_INTEGER)) return Number(raw)
    return Number(raw)
  }
  if (typeof raw === 'string' && raw.trim()) {
    const parsed = Number(raw)
    return Number.isFinite(parsed) ? parsed : 0
  }
  return 0
}

export function asBigInt(value: unknown): bigint {
  const raw = unwrapValue(value)
  if (typeof raw === 'bigint') return raw
  if (typeof raw === 'number' && Number.isFinite(raw)) return BigInt(Math.trunc(raw))
  if (typeof raw === 'string' && raw.trim()) {
    try {
      return BigInt(raw)
    } catch {
      return 0n
    }
  }
  return 0n
}

export function asBigIntArray32(value: unknown): bigint[] {
  const raw = unwrapValue(value)
  if (Array.isArray(raw)) return raw.map((item) => asBigInt(item))
  if (raw && typeof raw === 'object') {
    const source = raw as Record<string, unknown>
    return Array.from({ length: 32 }, (_, i) => asBigInt(source[String(i)] ?? source[i]))
  }
  return Array.from({ length: 32 }, () => 0n)
}

/** Chuẩn hoá bytes từ SDK (hex, `Uint8Array`, hoặc mảng số) về `0x…`. */
export function asHexData(value: unknown): `0x${string}` {
  const raw = unwrapValue(value)
  if (typeof raw === 'string') {
    const trimmed = raw.trim()
    if (!trimmed) return '0x'
    return (trimmed.startsWith('0x') ? trimmed : `0x${trimmed}`).toLowerCase() as `0x${string}`
  }
  if (raw instanceof Uint8Array) {
    const hex = [...raw].map((b) => b.toString(16).padStart(2, '0')).join('')
    return `0x${hex}` as `0x${string}`
  }
  if (Array.isArray(raw)) {
    const hex = raw.map((b) => Number(b).toString(16).padStart(2, '0')).join('')
    return `0x${hex}` as `0x${string}`
  }
  return '0x'
}