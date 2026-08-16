---
title: Account health audit
intent: user wants a read-only health check of a connected Apple Ads account
kind: procedural
risk: read-only
requires: { cli: ">=0.4.0", subscription: true }
uses: [asa whoami, asa campaigns list, asa ad-groups list, asa ads list, asa ads get, asa keywords list, asa negative-keywords list, asa product-pages list, asa creatives list, asa metrics overview, asa metrics]
time: ~15 min
---

# Account health audit

Answer what needs attention in a live account without changing it. This is a broad triage, not a
structure redesign, weekly ritual, or attribution investigation.

## Apply when

- The user asks whether a connected account is healthy or what is broken.
- Spend, installs, serving, or entity state looks suspicious.
- The user wants a simple same-window Apple-versus-Adapty install comparison.
- The user wants to know which campaigns deserve a deeper follow-up.

## Do not apply when

- The account does not exist yet → `apple-ads-strategy`.
- The primary question is duplicate targeting or traffic ownership → `structure-audit.md`.
- The user asks for a scheduled weekly report → `apple-ads` and `weekly-review.md`.
- The user asks to fix or pause something → finish the audit, then hand off to `apple-ads`.

## Required inputs

Resolve or ask for:

- company and app;
- exact date window;
- the business success metric and cohort window, if the user wants value judgments;
- any user-defined spend, CPA, or ROAS limits;
- optional campaign scope.

Without a business target, report observations and outliers but do not label performance good,
bad, profitable, or unprofitable.

## Read plan

1. Run preflight with `asa whoami`.
2. Resolve the app and requested campaign scope.
3. Read scoped campaign, ad-group, and ad counts and statuses. Use `--page-size 1` when only the
   count is needed.
4. Read one account overview for spend, Apple installs, Adapty installs, the requested cost metric,
   and the requested cohort root. The time series supplies the trend; do not call once per period.
5. Read one ranked campaign result only when the user asks which campaigns need attention. Use the
   user's metric, direction, and cohort window.
6. Drill into one suspicious level only when the broad evidence cannot answer the question.
7. Read `ads get` only for an ad whose serving state requires an explanation.
8. Read keyword, negative, product-page, or creative inventory only when the corresponding control
   is in scope. Do not turn a health audit into an exhaustive account dump.

Keep the normal audit at no more than three metrics-family calls. A fourth call requires an explicit
drill-down question. Metadata reads do not justify unscoped lists.

## Controls

### Access and scope

- Confirm the company and active Apple credentials.
- Confirm every reported entity belongs to the resolved app and campaign scope.
- Treat missing access as a setup result, not an account-health failure.

### Delivery and serving

- Flag confirmed paused or non-serving entities only when the returned status proves it.
- For a non-serving ad, cite `serving_state_reasons` before offering an explanation.
- A campaign with spend and zero installs is an observation. It becomes `critical` only when it
  breaches a user-defined limit; otherwise use `attention`.

### Performance

- State the metric, date window, cohort window, and revenue variant before interpreting it.
- Keep immature cohorts in `unknown` or `insufficient evidence`.
- Compare against the user's target or the account's own requested historical period. Do not invent
  a universal threshold.

### Inventory readiness

- Report the presence or absence of ads, active keywords, negatives, product pages, and creatives
  only for the requested scope.
- Absence is not automatically a defect: mark a control `not_applicable` when the campaign type does
  not need that inventory.

### Apple versus Adapty installs

Use values from the same overview response and exact date window:

```text
apple_installs = total_installs
adapty_installs = adapty_installs
absolute_gap = apple_installs - adapty_installs
relative_gap = absolute_gap / apple_installs  # only when apple_installs > 0
```

Report the two values, the signed absolute gap, and the percentage only when defined. Add one plain
sentence: Apple and Adapty use different attribution and event definitions, so an exact match is not
expected. Do not investigate or assign fault.

## Decision rules

| Status | Use when |
|---|---|
| `healthy` | The requested control is directly supported by evidence and no user-defined limit is breached |
| `attention` | A direct signal deserves follow-up, but impact or cause is not proven |
| `critical` | Serving is confirmed broken or a user-defined safety limit is breached |
| `unknown` | Required data, target, maturity, or scope is missing |
| `not_applicable` | The control does not apply to this campaign or request |

Do not average statuses into a score.

## Output

Return these sections in order:

1. **Summary** — at most three sentences in the user's language.
2. **Critical findings** — confirmed failures only.
3. **Needs attention** — supported concerns and their impact.
4. **Healthy signals** — concise evidence, not reassurance.
5. **Apple vs Adapty installs** — same-window values and the limited explanation above.
6. **Unknowns** — missing targets, maturity, metadata, or unsupported causes.
7. **Recommended actions** — one primary follow-up and an optional backlog.

Every finding must include status, observation, evidence ids, confidence, limitation, and next step.

## Example

```text
ATTENTION — Campaign C-17 spent $420 in the selected window and Apple reported 96 installs.
Adapty reported 81 installs for the same dates: a gap of 15 installs (15.6% of Apple's count).
The systems use different attribution and event definitions, so this gap is a comparison signal,
not proof that either system is wrong. Evidence: E3. Confidence: high for the counts, low for cause.
```

## Failure modes

- A mismatched window invalidates the install comparison; rerun one same-window overview.
- Apple installs equal to zero makes the percentage undefined; show no percentage.
- Missing Adapty installs makes the comparison `unknown`, not zero.
- No change history means a timing relationship is not causation.
- A category benchmark is optional context, not a substitute for the user's target.
- Never finish this playbook by executing a recommended action.

## Related playbooks

- Live targeting conflicts → `structure-audit.md`.
- Weekly operating report → `../../../apple-ads/references/playbooks/weekly-review.md`.
- Cohort value question → `../../../apple-ads/references/playbooks/cohort-roas.md`.
