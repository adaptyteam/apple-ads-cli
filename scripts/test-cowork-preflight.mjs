#!/usr/bin/env node

import {mkdtempSync, readFileSync, rmSync, writeFileSync} from 'node:fs'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {spawnSync} from 'node:child_process'

const ROOT = new URL('..', import.meta.url).pathname
const skill = readFileSync(join(ROOT, 'skills/apple-ads/SKILL.md'), 'utf8')
const block = skill.match(/# agent-preflight:start\n([\s\S]*?)# agent-preflight:end/)?.[1]

if (!block) {
  console.error('ERROR quiet preflight block is missing from skills/apple-ads/SKILL.md')
  process.exit(1)
}

const networkMessage =
  'Adapty API is unreachable from this sandbox. Allow network access for `adapty.io` and `*.adapty.io`, then start a new task.'
const occurrences = skill.split(networkMessage).length - 1
if (occurrences !== 1) {
  console.error(`ERROR concise network message must appear exactly once, found ${occurrences}`)
  process.exit(1)
}

const temp = mkdtempSync(join(tmpdir(), 'adapty-preflight-'))
const fakeAdapty = join(temp, 'adapty')
const callLog = join(temp, 'calls.log')
const success = [
  'Company: Example',
  'Access Source: payg',
  'Apple Credentials Status: active',
].join('\n')

writeFileSync(
  fakeAdapty,
  `#!/bin/sh
printf '%s\\n' "$*" >> "$PREFLIGHT_CALL_LOG"
if [ "$*" != "asa whoami" ]; then
  echo "unexpected adapty invocation: $*"
  exit 99
fi

noise() {
  i=0
  while [ "$i" -lt 60 ]; do
    echo 'ERROR: failed to copy trust settings of system certificate-25291'
    i=$((i + 1))
  done
}

case "$PREFLIGHT_FIXTURE" in
  noise_then_success)
    if [ "\${NODE_USE_SYSTEM_CA:-}" = "0" ]; then
      printf '%s\\n' '${success}'
      exit 0
    fi
    noise
    echo 'NetworkError: fetch failed'
    exit 1
    ;;
  noise_then_fail)
    if [ "\${NODE_USE_SYSTEM_CA:-}" != "0" ]; then noise; fi
    echo 'NetworkError: fetch failed'
    exit 1
    ;;
  direct_success)
    printf '%s\\n' '${success}'
    exit 0
    ;;
  auth_required)
    echo 'AuthRequiredError: Not authenticated. Run \`adapty auth login\`.'
    exit 1
    ;;
  no_subscription)
    echo 'Error: 402 ads_manager_subscription_required'
    exit 1
    ;;
  network_blocked)
    echo 'NetworkError: fetch failed'
    exit 1
    ;;
  unexpected)
    echo 'Error: unexpected failure'
    exit 1
    ;;
esac
`,
  {mode: 0o755},
)

const failures = []
const check = (condition, message) => {
  if (!condition) failures.push(message)
}
const expectedSuccess = `${success}\nREADY_AUTHED`

function run(name, expected, expectedStatus = 0, withCli = true) {
  writeFileSync(callLog, '')
  const path = withCli ? `${temp}:/usr/bin:/bin` : '/usr/bin:/bin'
  const result = spawnSync('/bin/sh', ['-c', block], {
    encoding: 'utf8',
    env: {
      ...process.env,
      PATH: path,
      PREFLIGHT_CALL_LOG: callLog,
      PREFLIGHT_FIXTURE: name,
    },
  })
  const stdout = result.stdout.trim()
  const stderr = result.stderr.trim()
  const calls = readFileSync(callLog, 'utf8')

  check(result.status === expectedStatus, `${name}: exit ${result.status}, expected ${expectedStatus}`)
  check(stdout === expected, `${name}: output ${JSON.stringify(stdout)}, expected ${JSON.stringify(expected)}`)
  check(stderr === '', `${name}: unexpected stderr ${JSON.stringify(stderr)}`)
  check(!stdout.includes('failed to copy trust settings'), `${name}: leaked certificate noise`)
  check(!calls.includes('auth login'), `${name}: started authentication`)
  check(!calls.includes('npm'), `${name}: started installation`)
}

try {
  run('noise_then_success', `${success}\nREADY_AUTHED_SYSTEM_CA_OFF`)
  run('noise_then_fail', 'RETRY_OUTSIDE_SANDBOX', 75)
  run('direct_success', expectedSuccess)
  run('auth_required', 'NEED_SETUP')
  run('no_subscription', 'Error: 402 ads_manager_subscription_required\nREADY_AUTHED_NO_SUB')
  run('network_blocked', 'NETWORK_BLOCKED')
  run('unexpected', 'Error: unexpected failure\nPREFLIGHT_ERROR')
  run('missing_cli', 'NEED_SETUP', 0, false)
} finally {
  rmSync(temp, {force: true, recursive: true})
}

if (failures.length > 0) {
  for (const failure of failures) console.error(`ERROR ${failure}`)
  console.error(`\n${failures.length} quiet preflight regression(s)`)
  process.exit(1)
}

console.log('Quiet Cowork preflight fixtures passed.')
