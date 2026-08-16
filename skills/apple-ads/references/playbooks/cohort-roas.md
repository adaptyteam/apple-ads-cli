---
title: Cohort ROAS — which keywords actually pay back
intent: user wants profitability by cohort revenue, not by install count
kind: procedural
risk: read-only
requires: { cli: ">=0.4.0", subscription: true }
uses: [asa metrics, asa metrics overview, asa keywords list]
time: ~10 min
---

# Cohort ROAS

The flagship read. Apple knows spend, taps and installs; it does not know that the install renewed
four times. This is the only question in the whole surface that no other Apple Ads tool can answer,
so it is worth doing precisely.

## The mental model

There is **no `ltv` metric.** Lifetime value is a cohort metric read at a renewal window, and
`--by-days` is how you ask for it. Cohort roots — `revenue`, `arpu`, `arppu`, `arpas`, `roas`, `roi`
— expand into `gross_`, `proceeds_` and `net_` variants. Ranking takes the **expanded** name:
`--order-by gross_roas`, never `--order-by roas`.

Pick the variant deliberately and say which one you used:

| Variant | What it is | Use when |
|---|---|---|
| `gross_` | before Apple's cut | comparing against Apple-side spend metrics |
| `proceeds_` | after Apple's commission | judging real margin |
| `net_` | after refunds and adjustments | closing the books |

## The one call

```
adapty asa metrics --entity keyword \
  --date-from <start> --date-to <end> \
  --metric roas --by-days 7 --by-days 30 --by-days 90 \
  --order-by gross_roas --order-by-day 30 \
  --page-size 100
```

- `--by-days` takes at most **16 windows** per call.
- `--order-by-day` must name one of the windows you passed.
- `--order asc` turns the same call into the losers list.
- `metrics` takes **no scope filters at all** — no `--app`, no `--campaign`. It covers the account
  at the entity level you asked for. Narrow the answer by matching returned rows against ids from a
  scoped `keywords list`, not by hunting for a flag that does not exist.

## Choosing the window

The window is a property of the monetization, not a preference:

| Subscription | Read at | Why |
|---|---|---|
| Weekly | day 7 and 30 | the first renewal is the whole signal; day 90 arrives too late to act on |
| Monthly | day 30 and 90 | day 7 is pre-renewal and always looks like a loss |
| Annual | day 30 for direction, day 180+ for truth | early windows measure trial behaviour, not value |

Reading a monthly subscription at day 7 and calling it unprofitable is the most common mistake in
this playbook. Every cohort looks bad before its first renewal.

## Turning it into a decision

1. State the window and the variant you used, before the numbers.
2. Compare against the **allowed** CPI derived from the app's own economics, not against a feeling.
3. Split into three buckets: pays back, does not pay back, not enough data. The third is a real
   bucket — do not force rows into the first two.
4. Hand each bucket to its playbook: `bid-optimization.md` for the first two,
   nothing at all for the third.

## Never

- Never compare cohort windows of different lengths against each other.
- Never rank by a root name — the call succeeds and ranks by something you did not mean.
- Never call a keyword unprofitable on a sample too small to carry the claim. Say the sample is thin.
- Never mix `gross_` in one sentence and `proceeds_` in the next.
