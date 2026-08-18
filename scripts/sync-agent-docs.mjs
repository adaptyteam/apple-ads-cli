#!/usr/bin/env node
// One-way sync: adapty-cli -> this repo. Never the other direction.
//
// The CLI's flag syntax, scope-filter matrix, request budgets and metric vocabulary are
// generated upstream, next to the commands, where CI can check them against the real
// oclif manifest. This script copies the result here and stamps the version it came from.
//
// Usage: node scripts/sync-agent-docs.mjs [--ref=v0.4.0]
//        node scripts/sync-agent-docs.mjs --source-dir=../adapty-cli [--only=<upstream path>]
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'

const ROOT = new URL('..', import.meta.url).pathname
const ref = (process.argv.find((a) => a.startsWith('--ref='))?.split('=')[1]) ?? 'main'
const sourceDirArg = process.argv.find((a) => a.startsWith('--source-dir='))
const sourceDir = sourceDirArg ? resolve(sourceDirArg.slice('--source-dir='.length)) : null
const only = process.argv.find((a) => a.startsWith('--only='))?.slice('--only='.length) ?? null
const REPO = 'adaptyteam/adapty-cli'

// upstream path -> path in this repo
const FILES = {
  'docs/agent/asa-management.md': 'skills/apple-ads/references/asa-management.md',
  'docs/agent/asa-metrics.md': 'skills/apple-ads/references/asa-metrics.md',
  'docs/agent/skills/adapty-cli-setup/SKILL.md': 'skills/adapty-cli-setup/SKILL.md',
}

const header = (src) =>
  `<!-- GENERATED — synced from ${REPO}@${ref} (${src}). Do not edit here.\n` +
  `     Edits are overwritten by .github/workflows/sync-from-cli.yml on the next CLI release. -->\n\n`

let failed = 0
for (const [src, dest] of Object.entries(FILES)) {
  if (only && src !== only) continue

  let body
  if (sourceDir) {
    try {
      body = readFileSync(join(sourceDir, src), 'utf8')
    } catch (error) {
      console.error(`ERROR ${src}: ${error instanceof Error ? error.message : 'local read failed'}`)
      failed++
      continue
    }
  } else {
    const url = `https://raw.githubusercontent.com/${REPO}/${ref}/${src}`
    const res = await fetch(url)
    if (!res.ok) {
      console.error(`ERROR ${src}: ${res.status} ${res.statusText}`)
      console.error(`      upstream has not published this file yet — leaving the local copy alone.`)
      failed++
      continue
    }
    body = await res.text()
  }
  // a synced SKILL.md keeps its frontmatter first; the header goes after it
  if (body.startsWith('---\n')) {
    const end = body.indexOf('\n---', 3) + 4
    body = body.slice(0, end) + '\n\n' + header(src) + body.slice(end).replace(/^\n+/, '')
  } else {
    body = header(src) + body
  }
  mkdirSync(dirname(ROOT + dest), { recursive: true })
  writeFileSync(ROOT + dest, body)
  console.log(`synced ${src} -> ${dest}`)
}
if (failed) console.error(`\n${failed} file(s) not synced. This is expected until adapty-cli publishes docs/agent/.`)
process.exit(0)
