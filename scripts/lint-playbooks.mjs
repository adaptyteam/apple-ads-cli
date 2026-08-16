#!/usr/bin/env node
// Playbook contract linter.
//
// Enforces the three things that keep a 30-file library from rotting:
//   1. every playbook and vertical declares a machine-readable contract,
//   2. every command it claims to use actually exists in the synced CLI reference,
//   3. every file is reachable from its skill's INDEX.md, and every INDEX row resolves.
//
// Also checks that shipped SKILL.md frontmatter stays inside the portable subset, so the
// skills survive packaging for claude.ai / the Skills API, not just Claude Code.
//
// Usage: node scripts/lint-playbooks.mjs

import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join, relative, basename } from 'node:path'

const ROOT = new URL('..', import.meta.url).pathname
const errors = []
const warnings = []
const fail = (file, msg) => errors.push(`${relative(ROOT, file)}: ${msg}`)
const warn = (file, msg) => warnings.push(`${relative(ROOT, file)}: ${msg}`)

// Fields the Agent Skills spec accepts outside Claude Code. Anything else fails validation
// when a skill is packaged for claude.ai or the Skills API.
const PORTABLE_FRONTMATTER = new Set([
  'name', 'description', 'license', 'compatibility', 'metadata', 'allowed-tools',
])

const REQUIRED_PLAYBOOK_KEYS = ['title', 'intent', 'kind', 'risk', 'requires', 'uses']
const VALID_KIND = new Set(['procedural', 'vertical', 'reference'])
const VALID_RISK = new Set(['read-only', 'writes-money'])

function frontmatter(text) {
  if (!text.startsWith('---\n')) return null
  const end = text.indexOf('\n---', 3)
  if (end === -1) return null
  const body = text.slice(4, end)
  const out = {}
  let key = null
  for (const raw of body.split('\n')) {
    const m = raw.match(/^([A-Za-z0-9_-]+):\s*(.*)$/)
    // strip trailing " # comment", which the template uses to explain each slot
    const strip = (s) => s.replace(/\s+#\s.*$/, '').trim()
    if (m) {
      key = m[1]
      out[key] = strip(m[2])
    } else if (key && /^\s+\S/.test(raw)) {
      out[key] += ' ' + strip(raw)
    }
  }
  return out
}

const inlineList = (v) =>
  !v || v === '[]'
    ? []
    : v.replace(/^\[|\]$/g, '').split(',').map((s) => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean)

// ---- 1. Build the set of commands the synced reference actually documents -------------
const refDir = join(ROOT, 'skills/apple-ads/references')
const refText = ['asa-management.md', 'asa-metrics.md']
  .map((f) => join(refDir, f))
  .filter(existsSync)
  .map((f) => readFileSync(f, 'utf8'))
  .join('\n')

if (!refText) {
  fail(refDir, 'no synced CLI reference found — run scripts/sync-agent-docs.mjs')
}

const known = new Set()
for (const m of refText.matchAll(/`?asa\s+([a-z-]+)(?:\s+([a-z-]+))?/g)) {
  known.add(`asa ${m[1]}`)
  if (m[2] && !['list', 'get'].includes(m[2])) known.add(`asa ${m[1]} ${m[2]}`)
  if (m[2]) known.add(`asa ${m[1]} ${m[2]}`)
}

// ---- 2. Walk every contract-bearing file ---------------------------------------------
const targets = [
  { dir: join(ROOT, 'skills/apple-ads/references/playbooks'), kind: 'procedural', index: join(ROOT, 'skills/apple-ads/references/INDEX.md') },
  { dir: join(ROOT, 'skills/apple-ads-strategy/references/verticals'), kind: 'vertical', index: join(ROOT, 'skills/apple-ads-strategy/references/INDEX.md') },
]

for (const { dir, kind: expectedKind, index } of targets) {
  if (!existsSync(dir)) { fail(dir, 'directory missing'); continue }
  const files = readdirSync(dir).filter((f) => f.endsWith('.md'))
  const indexText = existsSync(index) ? readFileSync(index, 'utf8') : ''

  for (const f of files) {
    const path = join(dir, f)
    const text = readFileSync(path, 'utf8')
    const fm = frontmatter(text)

    if (!fm) { fail(path, 'missing frontmatter contract'); continue }
    for (const k of REQUIRED_PLAYBOOK_KEYS) {
      if (!(k in fm)) fail(path, `frontmatter is missing "${k}"`)
    }
    if (fm.kind && !VALID_KIND.has(fm.kind)) fail(path, `kind "${fm.kind}" is not one of ${[...VALID_KIND].join(', ')}`)
    if (fm.kind && fm.kind !== expectedKind) fail(path, `kind "${fm.kind}" does not belong in ${basename(dir)}/ (expected "${expectedKind}")`)
    if (fm.risk && !VALID_RISK.has(fm.risk)) fail(path, `risk "${fm.risk}" is not one of ${[...VALID_RISK].join(', ')}`)

    for (const cmd of inlineList(fm.uses)) {
      if (!known.has(cmd)) fail(path, `uses "${cmd}", which is not in the synced CLI reference`)
    }

    // Naming convention: verticals are <category>-<subject>, playbooks are <verb>-<object>.
    if (!/^[a-z0-9]+(-[a-z0-9]+)*\.md$/.test(f) && f !== '_TEMPLATE.md') {
      fail(path, 'filename must be lowercase kebab-case')
    }

    // Every file must be reachable from its INDEX, or nothing will ever open it.
    if (f !== '_TEMPLATE.md' && !indexText.includes(f)) {
      fail(path, `not listed in ${relative(ROOT, index)} — an unreachable playbook is a dead playbook`)
    }

    if (/^>\s*\*\*Stub\.\*\*/m.test(text)) warn(path, 'stub — contract only, body not written')
    if (text.includes('TODO(owner)')) warn(path, 'has unfilled TODO(owner) slots')
  }

  // Every INDEX row must resolve to a file that exists.
  for (const m of indexText.matchAll(/`([a-z0-9_/-]+\.md)`/g)) {
    const target = join(dir, basename(m[1]))
    const alt = join(dir, '..', m[1])
    if (!existsSync(target) && !existsSync(alt)) fail(index, `row points at "${m[1]}", which does not exist`)
  }
}

// ---- 3. Shipped skills must stay portable --------------------------------------------
const skillsDir = join(ROOT, 'skills')
for (const s of readdirSync(skillsDir)) {
  const path = join(skillsDir, s, 'SKILL.md')
  if (!existsSync(path)) { fail(join(skillsDir, s), 'skill directory has no SKILL.md'); continue }
  const fm = frontmatter(readFileSync(path, 'utf8'))
  if (!fm) { fail(path, 'missing frontmatter'); continue }
  if (!fm.name) fail(path, 'frontmatter is missing "name"')
  if (fm.name && fm.name !== s) fail(path, `frontmatter name "${fm.name}" does not match directory "${s}"`)
  if (!fm.description) fail(path, 'frontmatter is missing "description"')
  if (fm.description && fm.description.length > 1024) warn(path, `description is ${fm.description.length} chars; keep it under ~1024`)
  for (const k of Object.keys(fm)) {
    if (!PORTABLE_FRONTMATTER.has(k)) {
      fail(path, `frontmatter field "${k}" is Claude-Code-only and fails validation when this skill is packaged for claude.ai / the Skills API`)
    }
  }
}

// ---- report ---------------------------------------------------------------------------
for (const w of warnings) console.log(`warn  ${w}`)
for (const e of errors) console.error(`ERROR ${e}`)
console.log(`\n${errors.length} error(s), ${warnings.length} warning(s)`)
process.exit(errors.length ? 1 : 0)
