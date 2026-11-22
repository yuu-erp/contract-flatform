/** Mulberry32 — RNG có seed cho dữ liệu giả tất định. */
export function createRng(seed: number) {
  let t = seed >>> 0
  return {
    next(): number {
      t += 0x6d2b79f5
      let x = Math.imul(t ^ (t >>> 15), 1 | t)
      x ^= x + Math.imul(x ^ (x >>> 7), 61 | x)
      return ((x ^ (x >>> 14)) >>> 0) / 4294967296
    },
    int(min: number, max: number): number {
      return Math.floor(this.next() * (max - min + 1)) + min
    },
    pick<T>(items: readonly T[]): T {
      return items[this.int(0, items.length - 1)]!
    },
    chance(p: number): boolean {
      return this.next() < p
    },
  }
}