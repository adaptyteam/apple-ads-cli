#!/usr/bin/env node
// Translations go stale silently. This makes them go stale loudly.
//
// README.md is canonical. Every translation carries the hash of the English file it was
// translated from; if the English changed and the translation did not, CI fails.
//
// Usage: node scripts/lint-i18n.mjs          # check
//        node scripts/lint-i18n.mjs --update # stamp current hash into translations
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { createHash } from 'node:crypto'

const ROOT = new URL('..', import.meta.url).pathname
const CANONICAL = 'README.md'
const TRANSLATIONS = ['README.zh-CN.md', 'README.tr.md']
const update = process.argv.includes('--update')

const hash = createHash('sha256').update(readFileSync(ROOT + CANONICAL)).digest('hex').slice(0, 16)
let bad = 0

for (const f of TRANSLATIONS) {
  const path = ROOT + f
  if (!existsSync(path)) { console.error(`ERROR ${f}: missing`); bad++; continue }
  const text = readFileSync(path, 'utf8')
  const m = text.match(/i18n-hash:\s*([0-9a-f]+|<[^>]+>)/)
  if (!m) { console.error(`ERROR ${f}: no i18n-hash header`); bad++; continue }
  if (update) {
    writeFileSync(path, text.replace(m[0], `i18n-hash: ${hash}`))
    console.log(`stamped ${f} -> ${hash}`)
  } else if (m[1] !== hash) {
    console.error(`ERROR ${f}: stale — built from ${m[1]}, ${CANONICAL} is now ${hash}`)
    console.error(`      retranslate, then: node scripts/lint-i18n.mjs --update`)
    bad++
  }
}
if (!update) console.log(`\n${bad} error(s)`)
process.exit(bad && !update ? 1 : 0)
