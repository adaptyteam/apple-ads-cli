# Keyword taxonomy — the generic method

Six buckets. Each has a different job, a different expected conversion rate and a different bid
ceiling, which is why they must never share an ad group.

| Bucket | Job | Expect |
|---|---|---|
| **Own brand** | defend the name you already earned | highest conversion, lowest cost. Cheap insurance against a competitor sitting on your name |
| **Competitor apps** | buy attention from rivals | moderate conversion, high cost. Judge on its own, not blended |
| **Generic / category** | volume | lowest conversion, most expensive. Necessary and dangerous |
| **Feature / job-to-be-done** | intent without the category word | frequently the best ROAS in the account, and the most under-built |
| **Long tail and misspellings** | cheap volume | little traffic, low cost, easy wins |
| **Category-specific** | whatever the vertical demands | see the vertical guide; may not exist |

The feature bucket is where most accounts leave money. People search for the job, not the category —
and those terms are cheaper than the category word for the same intent.

## Match types

- Exact is for terms you have already proven.
- Broad belongs in Discovery only, where the point is to find terms rather than buy installs.
- `keywords add` defaults to `BROAD`. Passing `--match-type EXACT` is not optional when promoting a
  proven term.

## Negatives are part of the plan, not an afterthought

Build the starter negative list at the same time as the keyword list. Two sources:

1. **Ambiguity** — every other meaning of the words you are bidding on. This is where the money goes
   in the first week, before anyone has looked at a report.
2. **Mismatch** — free-intent terms if there is no free tier; adjacent products you do not support;
   platforms, devices or brands you do not cover.

An install from a user whose device you do not support costs exactly as much as a good one.

## Limits

- 5000 targeting keywords per campaign **and** per ad group.
- `negative-keywords add` defaults to `EXACT` — the opposite of `keywords add`. Both defaults will
  surprise you at some point; pass the flag.
