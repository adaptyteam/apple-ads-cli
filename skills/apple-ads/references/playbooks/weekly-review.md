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
- The user asks for a deep attribution investigation. This playbook only compares install counts.

## Required inputs

Ask for any missing decision-changing input:

- exact report window;
- whether to compare it with another period;
- the success metric and revenue variant;
- the cohort window that matches the app's subscription model;
- any user-defined target or guardrail;
- optional app or campaign focus.

If the user does not supply a business target, report facts and outliers without calling them good,
bad, profitable, or unprofitable. Do not add an unrequested period comparison.

## Call budget

Use at most four analytics-family calls:

1. **Overview and trend.** One `metrics overview` call across the requested window. Request spend,
   `total_installs`, `adapty_installs`, the selected cost metric, and the selected cohort root. A
   per-period series already contains the comparison; never call once per period.
2. **Campaign outliers.** One server-sorted campaign call using the user-approved metric, direction,
   and cohort window.
3. **Keyword outliers.** One server-sorted keyword call only when the campaign result warrants that
   level or the user requested it.
4. **Search terms.** One scoped call only when the report is expected to end in growth or waste
   analysis.

Prefer one `--page-size 1000` response to pagination. Use the first and last rows as global extremes
only when pagination metadata proves the full result fits in that response. Otherwise report the
returned coverage and do not claim a global worst row.

Counting entities is not an analytics call. A scoped list with `--page-size 1` already returns the
count.

## Simple Apple versus Adapty install comparison

Use values from the same overview response and date window:

```text
apple_installs = total_installs
adapty_installs = adapty_installs
absolute_gap = apple_installs - adapty_installs
relative_gap = absolute_gap / apple_installs  # only when apple_installs > 0
```

- Show both values and the signed absolute gap.
- Show the percentage only when Apple installs are greater than zero.
- Treat a missing value as unknown, not zero.
- Explain in one sentence that Apple and Adapty use different attribution and event definitions, so
  exact equality is not expected.
- Do not assign fault or investigate attribution.

## Decision method

1. State the metric, date window, cohort window, and revenue variant before the result.
2. Separate direct observations from explanations.
3. Choose up to two positive changes and two concerns supported by the requested metric.
4. Mark thin or immature cohorts `insufficient_data`.
5. Recommend one primary action whose expected value and risk are explainable from the evidence.
6. Put every other useful idea in a backlog; do not execute any of them.

If change history is unavailable, say a configuration and a metric change "coincided". Never say
one caused the other.

## Output

Return these sections in order:

1. **Direction** — spend, Apple installs, Adapty installs, selected cost metric, and selected value
   metric for the requested period or comparison.
2. **Apple vs Adapty installs** — the limited same-window comparison above.
3. **Two positive changes** — or fewer when evidence does not support two.
4. **Two concerns** — confirmed observations, not invented failures.
5. **Primary action** — one read-only recommendation and its operator playbook.
6. **Backlog** — optional later checks.
7. **Unknowns and confidence** — targets, maturity, scope, or unavailable causes.

Every finding names evidence ids, entities, metrics, windows, confidence, and limitations.

## Example

```text
Direction: spend rose 8% in the requested comparison while day-30 proceeds ROAS was flat.
Apple vs Adapty installs: 540 vs 497, a gap of 43 (8.0% of Apple's count). The systems use
different attribution and event definitions, so this is a comparison signal, not proof of an
error. Primary action: review bids for the three mature keywords below the user's ROAS target.
```

## Failure modes

- Different install windows invalidate the comparison.
- Apple installs equal to zero makes the percentage undefined.
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
