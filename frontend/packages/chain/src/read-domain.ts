/** Đọc `domain` từ phần search (trước `#`). */
export function readDomainParam(search: string): string | undefined {
  const rawSearch = search.startsWith('?') ? search.slice(1) : search
  const params = new URLSearchParams(rawSearch)
  const raw = params.get('domain')
  if (raw == null) return undefined
  const v = raw.trim().toLowerCase()
  return v.length > 0 ? v : undefined
}

/** Giữ `?domain=` khi tạo path HashRouter. */
export function withDomain(hashPath: string, domain?: string): string {
  const path = hashPath.startsWith('/') ? hashPath : `/${hashPath}`
  if (!domain) return path
  return `?domain=${encodeURIComponent(domain)}#${path}`
}