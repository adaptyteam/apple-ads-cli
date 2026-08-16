---
title: Runaway spend — stop the bleeding
intent: spend is far above plan and the user wants it stopped now
kind: procedural
risk: writes-money
requires: { cli: ">=0.4.0", subscription: true }
uses: [asa metrics, asa campaigns list, asa campaigns update, asa ad-groups update, asa keywords update]
time: ~10 min
---

# Runaway spend

An incident playbook. The goal is to stop the loss with the smallest correct action, not the
largest available one.

## There is no delete, and no undo

`--status PAUSED` is the only stop in the entire surface. A campaign paused now can be enabled
again; nothing you do here is irreversible, which is exactly why pausing is the right first move and
restructuring is not.

## Order of operations

1. **Find where it is going — one call.**
   ```
   adapty asa metrics --entity campaign --date-from <today-7> --date-to <today> \
     --metric spend --order-by spend --page-size 20
   ```
   Then one call at the level below, into the campaign that dominates.
2. **Name the smallest object that explains most of the spend.** A keyword, an ad group, a campaign
   — in that order of preference. Pausing an account because one keyword ran away is an overreaction
   that costs a week of learning.
3. **Confirm with the user, naming the exact object and the exact spend it accounts for.**
4. **Pause it.**
   ```
   adapty asa campaigns update <id> --status PAUSED --idempotency-key <key>
   adapty asa ad-groups update <id> --status PAUSED --idempotency-key <key>
   adapty asa keywords update <id> [<id>...] --status PAUSED --idempotency-key <key>
   ```
   The keyword enum is `ACTIVE`/`PAUSED`; everything else is `ENABLED`/`PAUSED`. There is no
   `DISABLED` anywhere.
5. **Only then** lower budgets or bids, as a separate confirmed step.

## Usual causes, in the order they actually occur

| Cause | Signal | Fix |
|---|---|---|
| Broad match where exact was meant | many search terms unrelated to the app | negatives + change the keyword to `EXACT`; see `search-term-harvesting.md` |
| Missing negatives on a Discovery campaign | high taps, near-zero conversion | `negative-keyword-hygiene.md` |
| Daily budget raised and forgotten | step change on one date | `campaigns update --daily-budget` |
| A rule automation doing its job badly | change coincides with a run | `automations update <id> --stop`, then read `automations runs <id>` |
| Seasonal auction spike | CPT up across every campaign at once | not an incident. Decide budget, do not pause |

The last row matters: pausing during an industry-wide auction spike costs the account its learning
and does not save money later.

## Never

- Never pause the whole account as a first move.
- Never pause and re-bid in one confirmation.
- Never act on "spend looks high" without the call that says where it went.
- Never skip `--idempotency-key` in an incident. Incidents are exactly where a command gets run
  twice.
