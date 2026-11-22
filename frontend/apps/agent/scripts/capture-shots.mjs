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
const PORT = 4174
const ORIGIN = `http://127.0.0.1:${PORT}/agent/`

const ROLES = [
  { tag: 'owner', search: '', storage: { role: 'owner1' } },
  { tag: 'manager', search: '?domain=agent1-cn1.mock.local', storage: { role: 'manager3001' } },
  { tag: 'pick-branch', search: '', storage: { role: 'manager3001' } },
  { tag: 'no-access', search: '?domain=agent1-cn1.mock.local', storage: { role: 'staff' } },
  { tag: 'domain-not-found', search: '?domain=khong-co.mock.local', storage: { role: 'owner1' } },
]

const ROUTES = [
  ['overview', '/'],
  ['branches', '/branches'],
  ['staff', '/staff'],
  ['settings', '/settings'],
  ['wallets', '/wallets'],
  ['transactions', '/transactions'],
  ['audit', '/audit'],
]

function run(cmd, args, env, cwd) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { cwd, env, stdio: 'inherit', shell: false })
    child.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`${cmd} exit ${code}`))))
  })
}

function waitForServer(url, timeoutMs = 90_000) {
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

async function applyTheme(page, mode) {
  await page.evaluate((m) => {
    localStorage.setItem('meta-platform-theme', m)
    const root = document.documentElement
    if (m === 'dark') {
      root.classList.add('dark')
      root.classList.remove('light')
    } else {
      root.classList.remove('dark')
      root.classList.add('light')
    }
  }, mode)
}

async function setPreviewRole(page, role) {
  await page.evaluate((r) => {
    window.sessionStorage.setItem('agent-preview-role', r)
  }, role)
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
    await waitForServer(`${ORIGIN}`)
    const launchOpts = process.env.PW_CHROMIUM_PATH ? { executablePath: process.env.PW_CHROMIUM_PATH } : {}
    const browser = await chromium.launch(launchOpts)
    const jobs = [
      { tag: '1440-light', width: 1440, height: 900, theme: 'light' },
      { tag: '1440-dark', width: 1440, height: 900, theme: 'dark' },
      { tag: '390-light', width: 390, height: 844, theme: 'light' },
    ]

    for (const role of ROLES) {
      for (const job of jobs) {
        const context = await browser.newContext({ viewport: { width: job.width, height: job.height } })
        const page = await context.newPage()
        await page.goto(`${ORIGIN}${role.search}`, { waitUntil: 'networkidle' })
        await setPreviewRole(page, role.storage.role)
        await page.reload({ waitUntil: 'networkidle' })
        await applyTheme(page, job.theme)
        const routes =
          role.tag === 'owner' || role.tag === 'manager'
            ? ROUTES.filter(([name]) => {
                if (role.tag === 'manager' && name === 'branches') return false
                if (role.tag !== 'owner' && name === 'branches') return false
                return true
              })
            : [['gate', '/']]
        for (const [name, route] of routes) {
          await page.goto(`${ORIGIN}${role.search}#${route}`, { waitUntil: 'networkidle' })
          await applyTheme(page, job.theme)
          await page.waitForTimeout(400)
          const file = path.join(shotsDir, `${role.tag}--${name}--${job.tag}.png`)
          await page.screenshot({ path: file, fullPage: true })
          console.log('shot', file)
        }
        await context.close()
      }
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