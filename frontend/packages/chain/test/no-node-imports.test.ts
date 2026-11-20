import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const srcRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../src')

async function listTsFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true })
  const files: string[] = []
  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) files.push(...(await listTsFiles(full)))
    else if (entry.name.endsWith('.ts') && !entry.name.endsWith('.node.ts')) files.push(full)
  }
  return files
}

describe('browser-safe src', () => {
  it('no node: imports outside *.node.ts', async () => {
    const files = await listTsFiles(srcRoot)
    for (const file of files) {
      const content = await readFile(file, 'utf8')
      expect(content.includes('node:'), `${path.relative(srcRoot, file)} must not import node:`).toBe(false)
    }
  })
})