const MASK = (1n << 64n) - 1n

const RC = [
  0x0000000000000001n, 0x0000000000008082n, 0x800000000000808an, 0x8000000080008000n,
  0x000000000000808bn, 0x0000000080000001n, 0x8000000080008081n, 0x8000000000008009n,
  0x000000000000008an, 0x0000000000000088n, 0x0000000080008009n, 0x000000008000000an,
  0x000000008000808bn, 0x800000000000008bn, 0x8000000000008089n, 0x8000000000008003n,
  0x8000000000008002n, 0x8000000000000080n, 0x000000000000800an, 0x800000008000000an,
  0x8000000080008081n, 0x8000000000008080n, 0x0000000080000001n, 0x8000000080008008n,
]

const ROT = [
  [0, 36, 3, 41, 18],
  [1, 44, 10, 45, 2],
  [62, 6, 43, 15, 61],
  [28, 55, 25, 21, 56],
  [27, 20, 39, 8, 14],
]

function rotl(x: bigint, n: number): bigint {
  const shift = BigInt(n)
  return ((x << shift) | (x >> (64n - shift))) & MASK
}

function keccakF(state: bigint[]): void {
  for (let round = 0; round < 24; round++) {
    const c = [0n, 0n, 0n, 0n, 0n]
    for (let x = 0; x < 5; x++) {
      c[x] = state[x] ^ state[x + 5] ^ state[x + 10] ^ state[x + 15] ^ state[x + 20]
    }
    const d = [0n, 0n, 0n, 0n, 0n]
    for (let x = 0; x < 5; x++) d[x] = c[(x + 4) % 5] ^ rotl(c[(x + 1) % 5], 1)
    for (let i = 0; i < 25; i++) state[i] = (state[i] ^ d[i % 5]) & MASK

    const b = new Array<bigint>(25).fill(0n)
    for (let x = 0; x < 5; x++) {
      for (let y = 0; y < 5; y++) {
        b[y + 5 * ((2 * x + 3 * y) % 5)] = rotl(state[x + 5 * y], ROT[x][y])
      }
    }
    for (let y = 0; y < 5; y++) {
      for (let x = 0; x < 5; x++) {
        const next = ((x + 1) % 5) + 5 * y
        const after = ((x + 2) % 5) + 5 * y
        state[x + 5 * y] = (b[x + 5 * y] ^ ((~b[next] & MASK) & b[after])) & MASK
      }
    }
    state[0] = (state[0] ^ RC[round]) & MASK
  }
}

/** Keccak-256 (không phải SHA3-256). Dùng cho selector custom error. */
export function keccak256(bytes: Uint8Array): Uint8Array {
  const rate = 136
  const paddedSize = bytes.length + 1 + ((rate - ((bytes.length + 1) % rate)) % rate)
  const padded = new Uint8Array(paddedSize)
  padded.set(bytes)
  padded[bytes.length] = 0x01
  padded[padded.length - 1] ^= 0x80

  const state = new Array<bigint>(25).fill(0n)
  for (let offset = 0; offset < padded.length; offset += rate) {
    for (let i = 0; i < rate / 8; i++) {
      let lane = 0n
      for (let byte = 0; byte < 8; byte++) {
        lane |= BigInt(padded[offset + i * 8 + byte]) << BigInt(8 * byte)
      }
      state[i] ^= lane
    }
    keccakF(state)
  }

  const out = new Uint8Array(32)
  for (let i = 0; i < 4; i++) {
    let lane = state[i]
    for (let byte = 0; byte < 8; byte++) {
      out[i * 8 + byte] = Number(lane & 0xffn)
      lane >>= 8n
    }
  }
  return out
}

export function keccak256Hex(text: string): string {
  const hash = keccak256(new TextEncoder().encode(text))
  return [...hash].map((byte) => byte.toString(16).padStart(2, '0')).join('')
}
