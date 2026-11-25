#!/usr/bin/env node
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import http from 'node:http'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const appRoot = path.resolve(__dirname, '..')
const shotsDir = path.join(appRoot, 'shots')
const PORT = 4173
const BASE = `http://127.0.0.1:${PORT}/platform/#`

const AGENT_TABS = ['overview', 'branches', 'profile', 'sales', 'wallets', 'transactions', 'audit']
const BRANCH_TABS = ['overview', 'info', 'members', 'sales', 'transactions', 'audit']
const CHART_SHOTS = new Set(['overview', 'agent-overview', 'branch-overview'])

function run(cmd, args, env, cwd) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { cwd, env, stdio: 'inherit', shell: false })
    child.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`${cmd} exit ${code}`))))
  })
}

function waitForServer(url, timeoutMs = 60_000) {
  const start = Date.now()
  return new Promise((resolve, reject) => {
    const tick = () => {
      http
        .get(url, (res) => {
          res.resume()
          resolve()
        })
        .on('error', () => {
          if (Date.now() - start > timeoutMs) reject(new Error('preview timeout'))
          else setTimeout(tick, 300)
        })
    }
    tick()
  })
}

function routes() {
  const list = [
    ['overview', '/'],
    ['agents', '/agents'],
    ['audit', '/audit'],
    ['system', '/system'],
  ]
  for (const tab of AGENT_TABS) {
    list.push([`agent-${tab}`, `/agents/1?tab=${tab}`])
  }
  for (const tab of BRANCH_TABS) {
    list.push([`branch-${tab}`, `/branches/1?tab=${tab}`])
  }
  return list
}

async function applyTheme(page, mode) {
  // Cài đặt Hiển thị (nền + màu chủ đạo) lưu ở localStorage 'meta-display'; reload để áp dụng.
  const background = mode === 'dark' ? 'dark' : mode === 'dim' ? 'dim' : 'light'
  const changed = await page.evaluate((bg) => {
    const raw = localStorage.getItem('meta-display')
    const cur = raw ? JSON.parse(raw) : {}
    if (cur.background === bg) return false
    localStorage.setItem('meta-display', JSON.stringify({ accent: cur.accent ?? 'blue', background: bg }))
    return true
  }, background)
  if (changed) await page.reload({ waitUntil: 'networkidle' })
}

async function main() {
  fs.mkdirSync(shotsDir, { recursive: true })
  const env = { ...process.env, VITE_PREVIEW: 'mock' }
  await run('pnpm', ['build'], env, appRoot)

  const preview = spawn('pnpm', ['preview', '--host', '127.0.0.1', '--port', String(PORT)], {
    cwd: appRoot,
    env,
    stdio: 'pipe',
  })

  try {
    await waitForServer(`http://127.0.0.1:${PORT}/platform/`)
    const launchOpts = process.env.PW_CHROMIUM_PATH ? { executablePath: process.env.PW_CHROMIUM_PATH } : {}
    const browser = await chromium.launch(launchOpts)
    const jobs = [
      { tag: '1440-light', width: 1440, height: 900, theme: 'light' },
      { tag: '1440-dark', width: 1440, height: 900, theme: 'dark' },
      { tag: '390-light', width: 390, height: 844, theme: 'light' },
    ]

    for (const job of jobs) {
      const context = await browser.newContext({ viewport: { width: job.width, height: job.height } })
      const page = await context.newPage()
      for (const [name, route] of routes()) {
        await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle' })
        await applyTheme(page, job.theme)
        if (CHART_SHOTS.has(name)) {
          await page.waitForSelector('.recharts-surface', { timeout: 3000 }).catch(() => {})
        }
        await page.waitForTimeout(400)
        const file = path.join(shotsDir, `${name}--${job.tag}.png`)
        await page.screenshot({ path: file, fullPage: true })
        console.log('shot', file)
      }
      await context.close()
    }
    await browser.close()
  } finally {
    preview.kill('SIGTERM')
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})