#!/usr/bin/env node
// Behavioral contracts for the flagship Apple Ads workflows.
//
// The playbook linter validates shape and command existence. This file protects the decisions that
// are easy to weaken accidentally: read-only audit boundaries, simple install comparison, Market
// Intelligence detail, and mutation ordering.

import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join, relative } from 'node:path'

const ROOT = new URL('..', import.meta.url).pathname
const errors = []
const fail = (file, message) => errors.push(`${relative(ROOT, file)}: ${message}`)
const read = (path) => {
  if (!existsSync(path)) {
    fail(path, 'missing')
    return ''
  }
  return readFileSync(path, 'utf8')
}
const requireText = (path, text, label = text) => {
  if (!read(path).includes(text)) fail(path, `missing workflow contract: ${label}`)
}
const requireOrder = (path, first, second) => {
  const text = read(path)
  const firstAt = text.indexOf(first)
  const secondAt = text.indexOf(second)
  if (firstAt === -1 || secondAt === -1 || firstAt >= secondAt) {
    fail(path, `must place "${first}" before "${second}"`)
  }
}
const frontmatterValue = (text, key) => {
  const match = text.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'))
  return match?.[1]?.trim() ?? ''
}

const auditDir = join(ROOT, 'skills/apple-ads-audit')
const auditSkill = join(auditDir, 'SKILL.md')
const accountHealth = join(auditDir, 'references/playbooks/account-health.md')
const structureAudit = join(auditDir, 'references/playbooks/structure-audit.md')
const operatorPlaybooks = join(ROOT, 'skills/apple-ads/references/playbooks')
const weekly = join(operatorPlaybooks, 'weekly-review.md')
const opportunities = join(operatorPlaybooks, 'keyword-opportunity.md')
const legacyCompetitors = join(operatorPlaybooks, 'competitor-check.md')
const bids = join(operatorPlaybooks, 'bid-optimization.md')
const harvest = join(operatorPlaybooks, 'search-term-harvesting.md')
const negatives = join(operatorPlaybooks, 'negative-keyword-hygiene.md')
const cpp = join(operatorPlaybooks, 'creative-setup.md')
const operatorIndex = join(ROOT, 'skills/apple-ads/references/INDEX.md')

requireText(auditSkill, 'This skill has no write', 'explicit read-only audit boundary')
requireText(auditSkill, 'relative_gap = absolute_gap / apple_installs', 'install-gap formula')
requireText(auditSkill, 'only when `apple_installs > 0`', 'zero-denominator guard')

const WRITE_COMMAND = /asa\s+(?:campaigns|ad-groups|ads|keywords|negative-keywords|product-pages|automations)\s+(?:create|update|add|sync|run)/
for (const path of [accountHealth, structureAudit]) {
  const text = read(path)
  if (frontmatterValue(text, 'risk') !== 'read-only') fail(path, 'audit playbook risk must be read-only')
  const uses = frontmatterValue(text, 'uses')
  if (WRITE_COMMAND.test(uses)) fail(path, `audit playbook declares a write command in uses: ${uses}`)
}

for (const path of [accountHealth, weekly]) {
  requireText(path, 'total_installs', 'Apple install metric')
  requireText(path, 'adapty_installs', 'Adapty install metric')
  requireText(path, 'only when', 'zero-safe percentage rule')
  requireText(path, 'different attribution and event definitions', 'plain install-gap explanation')
}
if (frontmatterValue(read(weekly), 'risk') !== 'read-only') fail(weekly, 'weekly check-in must stay read-only')

requireText(opportunities, 'competitors summary --app-ids', 'Market Intelligence command')
requireText(opportunities, '--json', 'full Market Intelligence JSON')
requireText(opportunities, 'byApps[].countries[country][]', 'per-app per-country term path')
requireText(opportunities, '{term, sov}', 'term and SOV shape')
requireText(opportunities, 'one to five', 'competitor request cap')
requireText(opportunities, "competitor's bid, spend, conversion rate, or profitability", 'competitor economics disclaimer')
requireText(legacyCompetitors, '# Legacy redirect', 'legacy competitor link must be a redirect')
if (frontmatterValue(read(legacyCompetitors), 'uses') !== '[]') {
  fail(legacyCompetitors, 'legacy competitor redirect must not call the CLI')
}

for (const category of ['increase', 'keep', 'decrease', 'pause_candidate', 'insufficient_data']) {
  requireText(bids, `\`${category}\``, `bid category ${category}`)
}
requireText(bids, 'Do not invent a target', 'no universal bid threshold')
requireText(bids, 'Read the scoped keywords back', 'bid read-back verification')

for (const category of ['promote', 'block', 'keep_observing', 'already_owned', 'ownership_conflict', 'insufficient_evidence']) {
  requireText(harvest, `\`${category}\``, `harvest category ${category}`)
}
requireOrder(harvest, 'Add the destination keyword', 'Only for verified owners')
requireText(harvest, '15 terms or fewer', 'harvest batch cap')

requireText(negatives, 'Default to `EXACT`', 'Exact negative default')
requireText(negatives, '`BROAD` requires a separate, explicit confirmation', 'Broad negative gate')
requireText(negatives, 'does not expose a dependable', 'negative rollback warning')
requireText(negatives, 'positive keywords', 'positive inventory collision check')

requireText(cpp, "creative and parent ad group are fixed", 'immutable ad creative rule')
requireOrder(cpp, 'Read the new ad', 'old ad paused')
requireText(cpp, 'separate confirmation', 'separate old-ad pause gate')
requireText(cpp, 'does not author or edit', 'CPP editing boundary')

for (const route of ['weekly-review.md', 'keyword-opportunity.md', 'bid-optimization.md', 'search-term-harvesting.md', 'negative-keyword-hygiene.md', 'creative-setup.md']) {
  requireText(operatorIndex, route, `operator route ${route}`)
}

for (const command of ['asa-audit.md', 'asa-opportunities.md', 'asa-negatives.md', 'asa-cpp.md']) {
  const path = join(ROOT, 'commands', command)
  if (!existsSync(path)) fail(path, 'shortcut missing')
}

const workflowNames = []
for (const skill of readdirSync(join(ROOT, 'skills'), { withFileTypes: true })) {
  if (!skill.isDirectory()) continue
  const playbooks = join(ROOT, 'skills', skill.name, 'references', 'playbooks')
  if (!existsSync(playbooks)) continue
  for (const file of readdirSync(playbooks)) workflowNames.push(file)
}
for (const excluded of ['maximize-readiness.md', 'attribution-reconcile.md']) {
  if (workflowNames.includes(excluded)) fail(join(ROOT, 'skills'), `${excluded} is explicitly out of scope`)
}

for (const error of errors) console.error(`ERROR ${error}`)
console.log(`\n${errors.length} error(s)`)
process.exit(errors.length ? 1 : 0)
