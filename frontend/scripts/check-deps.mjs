#!/usr/bin/env node
import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
/** Chặn đường dẫn tuyệt đối / file: / link: / ~user (không chặn semver ~1.2.3). */
const BAD_PREFIX = /^(?:\/|file:|link:|~\/|\.\.\/)/

async function* walkPackageJson(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  for (const ent of entries) {
    if (ent.name === 'node_modules' || ent.name === 'dist' || ent.name === '.git') continue
    const full = path.join(dir, ent.name)
    if (ent.isDirectory()) {
      yield* walkPackageJson(full)
    } else if (ent.name === 'package.json') {
      yield full
    }
  }
}

function checkDepsRecord(record, file, section) {
  const errors = []
  if (!record || typeof record !== 'object') return errors
  for (const [name, version] of Object.entries(record)) {
    if (typeof version !== 'string') continue
    if (BAD_PREFIX.test(version.trim())) {
      errors.push(`${file}: ${section}.${name} = "${version}" (dùng npm semver, local chỉ qua FIAI_SDK_PATH)`)
    }
  }
  return errors
}

const errors = []
for await (const file of walkPackageJson(root)) {
  const raw = await readFile(file, 'utf8')
  let pkg
  try {
    pkg = JSON.parse(raw)
  } catch {
    errors.push(`${file}: JSON không hợp lệ`)
    continue
  }
  for (const section of ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies']) {
    errors.push(...checkDepsRecord(pkg[section], file, section))
  }
}

if (errors.length > 0) {
  console.error('check-deps: phát hiện đường dẫn local trong package.json:\n')
  for (const e of errors) console.error(`  - ${e}`)
  process.exit(1)
}

console.log('check-deps: OK')