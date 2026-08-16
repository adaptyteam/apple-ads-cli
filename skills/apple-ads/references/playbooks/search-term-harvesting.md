---
title: Harvest search terms into keywords and negatives
intent: user wants new keywords from real queries, and wants to stop paying for junk
kind: procedural
risk: writes-money
requires: { cli: ">=0.4.0", subscription: true }
uses: [asa search-terms list, asa keywords add, asa negative-keywords add]
time: ~20 min
---

# Search-term harvesting

The highest-return recurring job in Apple Search Ads, and the one where an agent does the most
damage if it writes before it shows.

## Read

```
adapty asa search-terms list --ad-group <id> --date-from <start> --date-to <end> --page-size 1000
```

Dates **default to today** — pass them explicitly or the result is a single day and the harvest is
meaningless. `search-terms list` draws on the analytics pool (30/min, shared 2-concurrent), not the
metadata store the other lists use.

## Sort into three piles

| Pile | Test | Destination |
|---|---|---|
| Promote | converted, or converted at an acceptable cost | exact keyword in the matching ad group |
| Block | spend with no conversion, or plainly the wrong intent | negative keyword |
| Wait | too little data to say | nothing — leave it, note it |

The "wait" pile is not a failure of the analysis. Forcing it into promote or block is.

Intent errors are usually visible without any data at all — a term from a different product
category, a different job, or a different meaning of the same word. Block those on sight.

## Show, then write

Print the full plan — every term, its pile, and the reason — and get an explicit yes. Then:

```
adapty asa keywords add --ad-group <id> --text <term> --match-type EXACT --idempotency-key <run>-kw-1
adapty asa negative-keywords add --ad-group <id> --text <term> --idempotency-key <run>-neg-1
```

- **15 per call.** The cap is 100; the practice is 15, because nine rejected rows inside a 40-item
  response is a repair job while inside a 15-item call it is a re-run.
- **A fresh `--idempotency-key` per call**, not per session. Same key with a different body is a
  `422`.
- `--match-type` defaults differ and both defaults will surprise you: `keywords add` defaults to
  `BROAD`, `negative-keywords add` defaults to `EXACT`. Promoting a term means `EXACT` — pass it.
- `--yes` only if **you** are running the command after an explicit yes. Never on a command handed
  to the user: it deletes the preview they were going to read.

## After

Promoted terms start at the ad group's default bid. Set them deliberately in a separate, separately
confirmed step → `bid-optimization.md`. A harvest and a bid change are two decisions, not one.

## Never

- Never harvest and re-bid in the same confirmation.
- Never promote a term into an ad group whose theme it does not match, just because that is where it
  was found.
- Never negate a term at campaign level when the problem is one ad group. `--all-ad-groups` requires
  `--campaign` and is much wider than it looks.
