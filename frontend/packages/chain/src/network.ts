/** Lỗi khi lệnh đọc chain không trả lời trong thời hạn (RPC chết, chain tắt…). */
export class RpcTimeoutError extends Error {
  constructor(label: string, ms: number) {
    super(`${label}: RPC không phản hồi sau ${Math.round(ms / 1000)} giây`)
    this.name = 'RpcTimeoutError'
  }
}

export const DEFAULT_RPC_TIMEOUT_MS = 12_000

/** Chặn lời gọi treo vô hạn: quá `ms` thì ném RpcTimeoutError. */
export function withTimeout<T>(promise: Promise<T>, ms = DEFAULT_RPC_TIMEOUT_MS, label = 'Đọc chain'): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new RpcTimeoutError(label, ms)), ms)
  })
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer))
}

const CONNECTIVITY_PATTERNS = [
  'failed to fetch',
  'fetch failed',
  'networkerror',
  'network error',
  'network request failed',
  'load failed',
  'econnrefused',
  'econnreset',
  'enotfound',
  'etimedout',
  'socket hang up',
  'timed out',
  'timeout',
  'không phản hồi',
  'bad gateway',
  'service unavailable',
  'gateway timeout',
  ' 502',
  ' 503',
  ' 504',
  'could not connect',
  'connection refused',
  'connection closed',
  'websocket',
]

function textsOf(error: unknown, out: string[] = [], depth = 0): string[] {
  if (depth > 4 || error == null) return out
  if (typeof error === 'string') out.push(error)
  else if (error instanceof Error) {
    out.push(`${error.name} ${error.message}`)
    textsOf((error as Error & { cause?: unknown }).cause, out, depth + 1)
  } else if (typeof error === 'object') {
    for (const v of Object.values(error as Record<string, unknown>)) textsOf(v, out, depth + 1)
  }
  return out
}

/** Lỗi mạng / RPC / hết thời gian (khác với contract revert). */
export function isConnectivityError(error: unknown): boolean {
  if (error instanceof RpcTimeoutError) return true
  const text = ` ${textsOf(error).join(' ').toLowerCase()}`
  return CONNECTIVITY_PATTERNS.some((p) => text.includes(p))
}
