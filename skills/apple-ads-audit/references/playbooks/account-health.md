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
- The user wants a performance snapshot for the account over a date window.
- The user wants to know which campaigns deserve a deeper follow-up.

## Do not apply when

- The user asks about attribution. Never compare Apple install counts with Adapty install counts,
  never report an install gap, and never explain a difference between the two systems.
- The account does not exist yet → `apple-ads-strategy`.
- The primary question is duplicate targeting or traffic ownership → `structure-audit.md`.
- The user asks for a scheduled weekly report → `apple-ads` and `weekly-review.md`.
- The user asks to fix or pause something → finish the audit, then hand off to `apple-ads`.

## Required inputs

Resolve or ask for:

- company and app;
- exact date window;
- whether the app offers a free trial — when the answer is no, drop the `cost_per_trial` row from the
  snapshot;
- the business success metric, and a cohort window only when that metric is `revenue`, `roas`,
  `arpu`, `arppu`, `arpas`, or `roi`, if the user wants value judgments;
- any user-defined spend, CPA, or ROAS limits;
- optional campaign scope.

Without a business target, report observations and outliers but do not label performance good,
bad, profitable, or unprofitable.

## Read plan

1. Run preflight with `asa whoami`.
2. Resolve the app and requested campaign scope.
3. Read scoped campaign, ad-group, and ad counts and statuses. Use `--page-size 1` when only the
   count is needed.
4. Read one account overview for the whole standard metric set below plus the requested cohort root.
   The time series supplies the trend; do not call once per period.
5. Read one ranked campaign result only when the user asks which campaigns need attention. Use the
   user's metric and direction, request the same standard metric set, and add a cohort window only
   for a cohort root.
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

The snapshot is one fixed metric set, in this order, for the requested scope and window. All of it
comes back from the single overview call in step 4 — extra metrics on one call cost no extra calls.

| Row | Metric | Notes |
|---|---|---|
| Spend | `spend` | use `local_spend` only when the user asks for account currency |
| Impressions | `impressions` | |
| Taps | `taps` | |
| Avg CPT | `avg_cpt` | |
| Installs | `total_installs` | Apple's own count, reported on its own |
| CPI | `total_avg_cpi` | Apple's average cost per install. It counts redownloads. Read the field; never recompute it as spend ÷ installs |
| Cost per trial | `cost_per_trial` | only when the user said the app has a free trial |
| Cost per paid | `cost_per_paid` | |

- A metric absent from the response is `unknown`, never zero.
- `cost_per_trial` and `cost_per_paid` are values for the requested date window. Never pass
  `--by-days` / `--order-by-day` for them and never attach a `day-X` label.
- State the metric and date window before interpreting it. State a cohort window only for a cohort
  root, and always use net rather than asking the user to choose a revenue variant.
- Keep immature cohorts in `unknown` or `insufficient evidence`.
- Compare against the user's target or the account's own requested historical period. Do not invent
  a universal threshold. `total_avg_cpi` is not the benchmarks skill's CPA — that figure is spend per
  download, so check the denominator before placing them side by side.
- Never compare Apple install counts with Adapty install counts, and never report a gap or a
  percentage of Apple's count between them.

### Inventory readiness

- Report the presence or absence of ads, active keywords, negatives, product pages, and creatives
  only for the requested scope.
- Absence is not automatically a defect: mark a control `not_applicable` when the campaign type does
  not need that inventory.

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
5. **Performance snapshot** — the standard metric set above for the requested scope and window.
6. **Unknowns** — missing targets, maturity, metadata, or unsupported causes.
7. **Recommended actions** — one primary follow-up and an optional backlog.

Every finding must include status, observation, evidence ids, confidence, limitation, and next step.

## Example

```text
ATTENTION — Campaign C-17 spent $420 in the selected window on 1,050 taps at an avg CPT of $0.40,
and produced 96 installs at a CPI of $4.38 — roughly double the account's $2.08. Cost per paid is
unknown for this campaign: the window returned no paid conversions. Evidence: E3. Confidence: high
for the counts, low for cause. Next step: check whether the ad group's keywords match intent.
```

## Failure modes

- A metric absent from the response is `unknown`; printing it as zero invents a result.
- Reporting `cost_per_trial` for an app with no free trial produces a meaningless row; ask first.
- `total_avg_cpi` read against a benchmark CPA compares two different denominators.
- No change history means a timing relationship is not causation.
- A category benchmark is optional context, not a substitute for the user's target.
- Never finish this playbook by executing a recommended action.

## Related playbooks

- Live targeting conflicts → `structure-audit.md`.
- Weekly operating report → `../../../apple-ads/references/playbooks/weekly-review.md`.
- Cohort value question → `../../../apple-ads/references/playbooks/cohort-roas.md`.
