---
title: Weekly account check-in
intent: user wants to know what changed, what needs attention, and what to do next
kind: procedural
risk: read-only
requires: { cli: ">=0.4.0", subscription: true }
uses: [asa metrics overview, asa metrics, asa search-terms list]
time: ~15 min
---

# Weekly account check-in

Turn one operating period into a short decision-ready report. The check-in is read-only: it may
recommend one action, but a separate playbook and a separate confirmation execute it.

## Apply when

- The user asks how the last week or month went.
- The user wants the largest positive and negative changes and the next action.
- A recurring operating review needs Apple performance and Adapty cohort value together.

## Do not apply when

- The user wants a broad health or structure diagnosis → `apple-ads-audit`.
- The user already chose a bid, negative, harvest, or CPP action → open that playbook.
- The user asks for an attribution investigation. Attribution is out of scope here and everywhere
  else in this skill. Never compare Apple install counts with Adapty install counts, never report an
  install gap, and never explain one away.

## Required inputs

Ask for any missing decision-changing input:

- exact report window;
- whether to compare it with another period;
- whether the app offers a free trial — ask this before offering a success metric. When the answer is
  no, drop the cost-per-trial row from the standard metric set and do not offer cost per trial as a
  success metric;
- the success metric; when offering choices, use this exact priority: `cost_per_paid`,
  `cost_per_trial`, then net `roas` at day X;
- any user-defined target or guardrail;
- the cohort window that matches the app's subscription model, only when the selected metric is a
  cohort root: `revenue`, `roas`, `arpu`, `arppu`, `arpas`, or `roi`;
- optional app or campaign focus.

Revenue-family analysis always uses the `net_` variant. Do not ask the user to choose gross,
proceeds, or net. `--by-days` and `--order-by-day` apply only to the six cohort roots above. For
`cost_per_paid`, `cost_per_trial`, and every other non-cohort metric, use the value aggregated over
the requested date window as returned: never ask for a cohort window, pass a day flag, or attach a
`day-X` label.

If the user does not supply a business target, report facts and outliers without calling them good,
bad, profitable, or unprofitable. Do not add an unrequested period comparison.

## Call budget

Use at most four analytics-family calls:

1. **Overview and trend.** One `metrics overview` call across the requested window. Request the whole
   standard metric set below plus the selected success metric. For a cohort root, request its root and
   the approved `--by-days` window, then read the `net_` value. A per-period series already contains
   the comparison; never call once per period.
2. **Campaign outliers.** One server-sorted campaign call using the user-approved metric, direction,
   and, only for a cohort root, cohort window. Request the same standard metric set on that call so
   the outlier rows are readable against the account totals. Rank revenue-family metrics by their
   expanded `net_` name.
3. **Keyword outliers.** One server-sorted keyword call only when the campaign result warrants that
   level or the user requested it.
4. **Search terms.** One scoped call only when the report is expected to end in growth or waste
   analysis.

Prefer one `--page-size 1000` response to pagination. Use the first and last rows as global extremes
only when pagination metadata proves the full result fits in that response. Otherwise report the
returned coverage and do not claim a global worst row.

Counting entities is not an analytics call. A scoped list with `--page-size 1` already returns the
count.

## Standard metric set

Every check-in reports these rows, in this order, for the requested window. All of them come back
from the one overview call in step 1 — adding metrics to a call costs no extra calls.

| Row | Metric | Notes |
|---|---|---|
| Spend | `spend` | use `local_spend` only when the user asks for account currency |
| Impressions | `impressions` | |
| Taps | `taps` | |
| Avg CPT | `avg_cpt` | |
| Installs | `total_installs` | the denominator behind CPI; report it as Apple's own count |
| CPI | `total_avg_cpi` | Apple's average cost per install. It counts redownloads. Read the field; never recompute it as spend ÷ installs |
| Cost per trial | `cost_per_trial` | only when the user said the app has a free trial |
| Cost per paid | `cost_per_paid` | |

- A metric the response did not return is `unknown`, never zero.
- With a comparison period, give each row its current value, its prior value, and the signed delta.
  The per-period series in the same response supplies both sides.
- `cost_per_trial` and `cost_per_paid` are values for the requested date window. Never pass
  `--by-days` / `--order-by-day` for them and never attach a `day-X` label.
- Call a row good, bad, profitable, or unprofitable only when the user gave a target for it.
- `total_avg_cpi` is not the benchmarks skill's CPA. That figure is spend per download; check the
  denominator before putting the two side by side, and never rename one to the other.
- Never compare Apple install counts with Adapty install counts, and never report a gap, a
  percentage of Apple's count, or an attribution explanation between them.

## Decision method

1. State the metric and date window before the result. State the cohort window only for a cohort
   root; name net as the revenue variant without asking the user to choose it.
2. Separate direct observations from explanations.
3. Choose up to two positive changes and two concerns supported by the requested metric.
4. Mark thin or immature cohorts `insufficient_data`.
5. Recommend one primary action whose expected value and risk are explainable from the evidence.
6. Put every other useful idea in a backlog; do not execute any of them.

If change history is unavailable, say a configuration and a metric change "coincided". Never say
one caused the other.

## Output

Return these sections in order:

1. **Direction** — the standard metric set for the requested period or comparison, plus the selected
   value metric when it is not already one of those rows.
2. **Two positive changes** — or fewer when evidence does not support two.
3. **Two concerns** — confirmed observations, not invented failures.
4. **Primary action** — one read-only recommendation and its operator playbook.
5. **Backlog** — optional later checks.
6. **Unknowns and confidence** — targets, maturity, scope, or unavailable causes.

Every finding names evidence ids, entities, metrics, windows, confidence, and limitations.

## Example

```text
Direction (Aug 10-16 vs Aug 3-9)
Spend           $4,180    $3,870    +8.0%
Impressions     612,400   588,100   +4.1%
Taps            9,240     9,010     +2.6%
Avg CPT         $0.45     $0.43     +4.7%
Installs        2,010     1,940     +3.6%
CPI             $2.08     $1.99     +4.5%
Cost per trial  $9.40     $8.85     +6.2%
Cost per paid   $31.20    $29.60    +5.4%

Spend rose 8% while taps rose 2.6%, so the whole increase landed in CPT. Cost per paid moved
with it and is $1.20 above the user's $30 guardrail. Primary action: review bids for the three
mature keywords carrying that CPT increase.
```

## Failure modes

- Reporting `cost_per_trial` for an app with no free trial produces a meaningless row; ask first.
- `total_avg_cpi` read against a benchmark CPA compares two different denominators.
- A metric absent from the response is `unknown`; printing it as zero invents a result.
- A monthly cohort read at day 7 is immature, not losing.
- A server-sorted top page does not prove the global worst when more pages exist.
- No user-defined target means no performance verdict and no mutation proposal.
- A weekly check-in never ends with a write.

## Related playbooks

- Cohort window and value interpretation → `cohort-roas.md`.
- Confirmed bid action → `bid-optimization.md`.
- Query growth → `search-term-harvesting.md`.
- Query waste → `negative-keyword-hygiene.md`.
- CPP mismatch → `creative-setup.md`.
