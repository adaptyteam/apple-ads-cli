<!-- i18n-canonical: this file. Translations must be regenerated when it changes. -->

**English** · [简体中文](README.zh-CN.md) · [Türkçe](README.tr.md)

# Apple Ads CLI

**Run Apple Search Ads from your AI agent — and see which keywords actually pay back, not just which ones convert.**

Skills, playbooks and vertical guides for Apple Search Ads, built on the [Adapty CLI](https://github.com/adaptyteam/adapty-cli). Works in Claude Code, Cowork, Codex, Gemini CLI and Copilot CLI.

> The CLI itself installs as `npm i -g adapty`. This repository is the agent layer on top of it: what to do, when, and why.

---

## Why this exists

Every Apple Ads tool can tell you a keyword's cost per install. None of them can tell you what that install was worth six weeks later.

Apple's API knows spend, taps and installs. It does not know that the user who came from `samsung tv remote` renewed a weekly subscription four times, while the user from `free remote app` cancelled on day two. That gap is where ad budgets die — and closing it needs subscription data, which is what Adapty has.

So this is the only Apple Search Ads setup where an agent can answer:

```
Which keywords are profitable at day 30, by cohort revenue — not by install count?
```

---

## Install

```bash
npm i -g adapty
adapty auth login
adapty asa connect
```

Then add the agent layer:

```bash
claude plugin marketplace add adaptyteam/apple-ads-cli
claude plugin install apple-ads@adapty
```

<details>
<summary>Other agents</summary>

```bash
# Codex, Gemini CLI, Copilot CLI, Cursor, Zed and others
npx skills add adaptyteam/apple-ads-cli --all

# One skill only
npx skills add adaptyteam/apple-ads-cli --skill apple-ads-strategy
```

Skills installed this way do not update themselves — run `npx skills update` later.
Plugins from third-party marketplaces do not auto-update either — run `claude plugin update apple-ads@adapty`.

</details>

<details>
<summary>Claude Cowork</summary>

Cowork runs commands in a sandbox that only reaches allowlisted domains. Before installing, add **both** `adapty.io` and `*.adapty.io` — a wildcard does not cover the apex domain in most allowlist implementations.

Settings → Capabilities → enable code execution → allow network egress → add both domains. Settings apply when a task starts, so changing them mid-conversation has no effect on the current task.

</details>

---

## What you get

| | |
|---|---|
| **`apple-ads`** | The operator. Reads performance, changes bids and budgets, adds keywords and negatives, harvests search terms, launches and pauses campaigns — all through the CLI, with confirmation before anything that spends money. |
| **`apple-ads-strategy`** | The planner. **Needs no account, no CLI, no subscription.** Turns "I have a TV remote app, where do I start" into a full account structure, keyword taxonomy, starting budget and negative list. |
| **Playbooks** | Weekly review · cohort ROAS · search-term harvesting · bid optimization · budget reallocation · campaign launch · negative keyword hygiene · competitor check · runaway spend · automation rules. |
| **Vertical guides** | Category-specific playbooks — demand profile, keyword taxonomy, account structure, starting economics and the failure modes specific to that category. |

Every playbook is readable right here on GitHub. You do not need to install anything, or have an Adapty account, to use them.

---

## Try it

```
> Which of my ad groups lost money last month at day-30 cohort ROAS?
> Harvest last week's search terms into exact keywords and negatives, show me the plan first.
> My weekly subscription utility app is at 3x target CPI. Where is the leak?
> I'm launching a universal TV remote app. Build me a campaign structure.
```

The last one needs nothing installed but the strategy skill.

---

## Safety

Apple Ads has **no sandbox**. Every call hits production and spends real money.

- Reads are free. Every write is previewed and requires explicit confirmation.
- Writes carry an idempotency key, so an ambiguous retry does not create a second campaign.
- Request budgets are enforced, so an agent cannot burn your rate limit into a multi-hour cooldown.
- There is no delete. Campaign deletion is dashboard-only, by design.

---

## Requirements and limits

- Node 18+, Adapty CLI 0.4.0 or newer.
- An Apple Ads **Advanced** account.
- An active Adapty Ads Manager subscription — **free below $5K/month revenue**, then 3.5% of ad spend. Without it, `asa` commands return `402`.
- The planning skill and every playbook in this repo work without any of the above.

---

## Roadmap

- **Apple Ads Platform API v1.** Apple sunsets the Campaign Management API on **26 January 2027**. Platform API v1 keeps the same OAuth flow but replaces `orgId` with `adAccountId` and adds Apple Maps ads. Migration status is tracked in the open.
- **Hosted MCP** — connect from Claude with no Node install and no domain allowlist.
- **More verticals** — the guide library grows by category.

---

## Links

- [Adapty CLI](https://github.com/adaptyteam/adapty-cli) · [CLI docs](https://adapty.io/docs/developer-cli-quickstart)
- [Ads Manager skill docs](https://adapty.io/docs/developer-cli-ads-manager-skill)
- [Adapty SDK integration skill](https://github.com/adaptyteam/adapty-sdk-integration-skill)

Issues and pull requests welcome — especially new vertical guides. See the [template](skills/apple-ads-strategy/references/verticals/_TEMPLATE.md).
