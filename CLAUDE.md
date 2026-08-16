# Working on this repository

This repo is the agent layer for Apple Search Ads. It contains **no CLI code** — the binary is
`adapty`, and it lives in [`adaptyteam/adapty-cli`](https://github.com/adaptyteam/adapty-cli).

## The one rule that explains the layout

Content is split by **what makes it change**, not by topic:

| Changes when | Lives in | Editable here |
|---|---|---|
| the CLI changes | `references/asa-*.md`, `skills/adapty-cli-setup/` | **No** — synced from adapty-cli |
| Apple Ads practice changes | `playbooks/`, `verticals/` | Yes |
| positioning changes | `README*.md`, `docs/`, `examples/` | Yes |

If you find yourself documenting a flag here, stop: that belongs upstream.

## Before opening a PR

```bash
node scripts/lint-playbooks.mjs   # contracts, command existence, skill portability
node scripts/lint-workflows.mjs   # flagship workflow behavior and safety contracts
node scripts/lint-i18n.mjs        # translation freshness
```

## Skill count discipline

Four skills is the ceiling: `apple-ads`, `apple-ads-strategy`, `adapty-cli-setup`, and a possible
read-only `apple-ads-audit`. Skills compete with each other at trigger time — two similar
descriptions produce a coin flip. A new capability is a **playbook** unless it needs different tool
permissions, different runtime dependencies, or a genuinely non-overlapping trigger vocabulary.

## Frontmatter is portable on purpose

Shipped `SKILL.md` files use only `name`, `description`, `license`, `compatibility`, `metadata`,
`allowed-tools`. Claude-Code-only fields (`context`, `model`, `effort`, `hooks`, `when_to_use`) fail
validation when the skill is packaged for claude.ai or the Skills API, and these skills ship to
Cowork and skills.sh too. The linter enforces this.
