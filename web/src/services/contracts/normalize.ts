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

export function asList(value: unknown): unknown[] {
  const raw = unwrapValue(value)
  if (Array.isArray(raw)) return raw
  if (raw && typeof raw === 'object') {
    const record = raw as Record<string, unknown>
    if (Array.isArray(record.out)) return record.out
    const values = Object.values(record)
    if (values.length === 1 && Array.isArray(values[0])) return values[0] as unknown[]
  }
  return []
}

export function asNumber(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'bigint') return Number(value)
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : 0
  }
  return 0
}
