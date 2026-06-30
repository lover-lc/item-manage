import { execSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'
import { join } from 'node:path'

function getAppVersion() {
  if (process.env.VITE_APP_VERSION) return process.env.VITE_APP_VERSION
  if (process.env.GITHUB_SHA) return process.env.GITHUB_SHA.slice(0, 7)
  try {
    return execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim()
  } catch {
    return `dev-${Date.now()}`
  }
}

const version = getAppVersion()
writeFileSync(join('dist', 'version.json'), `${JSON.stringify({ version }, null, 2)}\n`)
console.log(`Wrote dist/version.json (${version})`)
