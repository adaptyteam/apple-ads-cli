---
title: Weekly account review
intent: user wants to know how the account did and what to do next
kind: procedural
risk: read-only
requires: { cli: ">=0.4.0", subscription: true }
uses: [asa metrics overview, asa metrics, asa search-terms list]
time: ~10 min
---

# Weekly account review

A whole week's review is **three to four calls**. The metrics budget is 5 per minute; a review that
loops per campaign or per day exhausts it and then answers nothing.

## The four calls

1. **Account totals and the trend, in one call.** A per-period series already contains this week
   and last week — never call once per period.
   ```
   adapty asa metrics overview --entity campaign --date-from <start> --date-to <end> --period-unit week
   ```
2. **Winners and losers at the level that matters.** One call, sorted server-side. `--order asc`
   asks the same call for losers instead of winners.
   ```
   adapty asa metrics --entity campaign --date-from <start> --date-to <end> \
     --order-by gross_roas --by-days 30 --order-by-day 30 --page-size 20
   ```
3. **One level down, only into what looked wrong in call 2.** Ad group, or keyword.
4. **Search terms**, only if the review is going to end in a harvest →
   `playbooks/search-term-harvesting.md`.

Counting anything ("how many active campaigns") is not a metrics call: any list at `--page-size 1`
carries `meta.pagination.count`.

## What to actually report

Three things, in this order. Anything else is noise in a weekly.

1. **Direction** — spend, installs and cohort ROAS versus the previous period, with the delta.
2. **The two outliers** — the best and the worst performer at one level, with the number that makes
   each one an outlier.
3. **One recommended action**, with the playbook that executes it and what it would cost.

## Definitions come from the user

"Best-performing", "losing", "bad ROAS" are business definitions, not query results. Name the metric
and the window, get an explicit yes, then rank. A review that silently picks its own definition of
"losing" and recommends a pause is a review that will pause the wrong thing.

## Baselines

If `apple-ads-benchmarks` is installed, compare the account's rates against its category before
calling anything good or bad — and quote the period and sample size with the number. If it is not,
compare the account against its own previous periods and say there is no external baseline.

## Never

- Never sum pages yourself. The server aggregates.
- Never add a period comparison the user did not ask for — propose it instead.
- Never end a review with a write. A review recommends; a separate, confirmed step executes.
