export function buildManagerAgentUrl(domain: string, origin = typeof window !== 'undefined' ? window.location.origin : ''): string {
  const base = origin.replace(/\/$/, '')
  return `${base}/agent/?domain=${encodeURIComponent(domain.trim().toLowerCase())}`
}

export async function copyManagerAgentLink(domain: string): Promise<void> {
  const url = buildManagerAgentUrl(domain)
  await navigator.clipboard.writeText(url)
}