---
title: Keyword bid review
intent: user wants evidence-based keyword bid changes or pause candidates
kind: procedural
risk: writes-money
requires: { cli: ">=0.4.0", subscription: true }
uses: [asa metrics, asa keywords list, asa keywords update]
time: ~20 min
---

# Keyword bid review

Use mature keyword economics and delivery signals to propose bid changes. A review may finish with
no changes; forcing a thin row into a decision is a failure.

## Apply when

- The user wants to raise, lower, or review keyword bids.
- The user wants pause candidates based on an explicit value or cost rule.
- The user asks where additional volume may be available without abandoning unit economics.

## Do not apply when

- The user has not selected a performance goal and only wants a report → return outliers without a
  mutation proposal.
- The question is campaign budget allocation → keep it as a separate decision; this playbook does
  not implement budget changes.
- The cohort is too young for the selected subscription model → `cohort-roas.md`, then wait.

## Required inputs

- app and ad-group or campaign scope;
- exact date window;
- success metric and target; when offering metrics, use this exact priority: `cost_per_paid`,
  `cost_per_trial`, then net `roas` at day X;
- subscription period and selected cohort window only for `revenue`, `roas`, `arpu`, `arppu`,
  `arpas`, or `roi`;
- optional bid floor, ceiling, and aggressiveness policy.

Always use the `net_` variant for revenue-family metrics and do not ask the user to choose a
variant. Never ask for a cohort window or use `--by-days` / `--order-by-day` for `cost_per_paid`,
`cost_per_trial`, or any other non-cohort metric; those values apply directly to the report's date
window.

Do not invent a target, cutoff, bid, or fixed percentage adjustment. If the user has no bid-change
policy, identify the bucket first and ask for the exact proposed amount before writing.

## Read plan

1. Read scoped active and paused keyword metadata to obtain ids, current bids, status, text, and
   match type.
2. Make one keyword metrics request for spend, Apple and Adapty installs, the selected cost/value
   metrics, rank, search popularity, and impression midpoint. Only for a cohort root, include the
   approved `--by-days` window and rank by the expanded `net_` metric.
3. Match metrics rows to the scoped ids. `metrics` has no scope filters; an account-wide row is not
   permission to act outside the requested scope.
4. Record coverage. If the full scoped set does not fit in the returned page, do not claim a complete
   review and do not paginate-and-sum.

## Maturity gate

Evaluate maturity before performance:

- For a cohort root, the selected cohort window must fit the subscription renewal cycle.
- A row with too little sample to support the user's rule is `insufficient_data`.
- A zero or missing value after an immature window is not a pause signal.
- State why the sample is sufficient or insufficient; do not invent a universal install count.

## Classify

| Category | Required evidence |
|---|---|
| `increase` | Mature row meets the user's value rule and a delivery signal supports additional reach |
| `keep` | Mature row is inside the user's accepted band or no supported change is necessary |
| `decrease` | Mature row misses the user's rule and the approved policy prefers a lower bid over a pause |
| `pause_candidate` | Mature row breaches the user's explicit stop rule |
| `insufficient_data` | Maturity, sample, target, or scope is not enough to act |

Rank and popularity describe delivery opportunity, not profitability. ROAS or CPA describes the
observed economics, not guaranteed future performance. Keep the two claims separate.

## Proposal

Show one row per keyword:

- keyword text and id;
- current bid and status;
- selected metrics and cohort window when applicable;
- category;
- proposed bid or status, when supplied by the approved policy;
- evidence and confidence;
- expected effect and downside;
- rollback path (`keywords update` back to the previous bid or status);
- `requires_confirmation: true`.

Do not combine a budget change with this confirmation.

## Execute and verify

1. Ask for explicit confirmation of the exact keywords and changes.
2. Group only keywords receiving the identical change; `keywords update` applies one shared change
   to all ids in that call.
3. Use a fresh idempotency key for every distinct write.
4. If the user will run the command, omit `--yes`; the CLI preview is their confirmation surface.
5. Read the scoped keywords back and compare each bid and status with the approved proposal.
6. Report partial or failed writes by id. Never silently rerun an ambiguous write with a new key.

## Output

Return the five categories separately, then the mutation proposal, unknowns, and verification
result. State the target and sample limitation above the table. For a cohort root, also state the
cohort window and net variant; do not invent either field for a non-cohort metric.

## Example

```text
increase — KW-31, "scanner app": day-30 net ROAS 1.34 against the user's 1.20 target; rank and
impression midpoint indicate room for reach. Current bid: $1.10. Proposed bid: unknown until the
user supplies an amount or aggressiveness policy. Confidence: medium; economics are mature, future
volume is not guaranteed.
```

## Failure modes

- Root cohort names are not valid rank keys; use the expanded variant.
- `--order-by-day` without the same `--by-days` value is invalid.
- A metrics row outside the resolved scope cannot be changed.
- Different proposed bids cannot be grouped into one update call.
- Missing targets allow analysis, not mutation.
- A bid review and a budget reallocation are separate decisions.

## Related playbooks

- Choose the cohort window → `cohort-roas.md`.
- Add newly harvested keywords → `search-term-harvesting.md`.
