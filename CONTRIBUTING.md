# Contributing

The most useful contribution is a **vertical guide** for a category that has none.

## Adding a vertical guide

1. Copy `skills/apple-ads-strategy/references/verticals/_TEMPLATE.md`.
2. Fill **every** section. A section you cannot fill gets `> TODO(owner): ...`, never a deletion —
   missing sections are what make a guide library feel unreliable.
3. Every number is sourced, given as a range to calibrate, or marked TODO. A fabricated CPI
   benchmark is worse than none, because the agent will act on it.
4. Add a row to `skills/apple-ads-strategy/references/INDEX.md`. A guide with no INDEX row is never
   opened.
5. `node scripts/lint-playbooks.mjs` and `node scripts/lint-workflows.mjs` must pass.

`verticals/utility-tv-remote.md` is the worked example. Imitate its section order and its discipline
about numbers.

## Adding a playbook

Same contract, in `skills/apple-ads/references/playbooks/`. Two rules that are not obvious:

- **Command syntax never goes in a playbook.** It lives in `references/asa-management.md` and
  `references/asa-metrics.md`, which are generated. A playbook carries decisions; the reference
  carries syntax. Duplicating syntax is how the library starts lying.
- **`uses:` is checked.** The linter fails if a playbook claims a command the synced reference does
  not document. That is deliberate — it is the mechanism that stops hallucinated flags.

## What you may not edit here

Anything with a `GENERATED` header:

- `skills/apple-ads/references/asa-management.md`
- `skills/apple-ads/references/asa-metrics.md`
- `skills/adapty-cli-setup/SKILL.md`

These are synced one-way from [`adaptyteam/adapty-cli`](https://github.com/adaptyteam/adapty-cli)
(`docs/agent/`). Edit them there; the next sync overwrites anything changed here.

## Translations

`README.md` is canonical. After changing it, retranslate `README.zh-CN.md` and `README.tr.md`, then
run `node scripts/lint-i18n.mjs --update`. CI fails on a stale translation.

Skill and reference files are **English only, by design** — the agent reads English and answers in
the user's language. Three translations of a safety rule is three chances for one of them to drift.
