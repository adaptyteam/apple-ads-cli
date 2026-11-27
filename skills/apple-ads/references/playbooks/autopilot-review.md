---
title: Autopilot review
intent: user wants to know what the keyword and budget autopilots did, whether they work, or what needs attention
kind: procedural
risk: read-only
requires: { cli: ">=0.34.0", subscription: true }
uses: [asa keyword-autopilot list, asa keyword-autopilot get, asa keyword-autopilot decisions, asa keyword-autopilot report, asa budget-autopilot status, asa budget-autopilot fronts, asa budget-autopilot decisions, asa metrics]
time: ~15 min
---

# Autopilot review

Read what Adapty's keyword and budget autopilots did and report what needs the user. The review is
read-only: `autopilot-tuning.md` executes any intervention after a separate confirmation. Finding
nothing to act on is a valid result.

## Apply when

- The user asks what the autopilots did, whether they work, or what needs attention, including a
  regular check-in or the first days after a launch.

## Do not apply when

- The question is account performance without the autopilots → `weekly-review.md`.
- The user already chose an intervention → `autopilot-tuning.md`.
- Spend is running away now → `runaway-spend.md`. Deciding what can be enrolled →
  `autopilot-readiness.md`.

## Required inputs

- scope (keyword autopilot, budget autopilot, or both; optionally one app or campaign) and window;
- the user's own target cost per paying user, only if they want a verdict against it. Without one,
  do not call a keyword good, bad or profitable.

## Read plan

Cheapest calls first; limits are in "Request budgets" of the reference.
1. One `keyword-autopilot list` for the scope: `status`, `tier`, `paused_code`, `enabled`,
   `disabled_reason`, the cap, the currency, the Apple bid as last synced and `apple_status`. Filter by
   `status` or `paused_code` instead of paging everything.
2. `keyword-autopilot get` for a keyword that needs a closer look: its current epoch and decisions.
3. `keyword-autopilot decisions` for what changed. Fix `--date-to` on the first call and reuse it
   for every page; the default end moves with every call.
4. `keyword-autopilot report` only when the user needs daily rows or outcome numbers. It is heavy, one
   in flight per company, and refuses very large companies; never call it in a loop.
5. Budget side: `budget-autopilot status`, then `fronts`, then `decisions` for the window.
6. At most one `asa metrics` call, only to check a funnel claim over a matured window.

## Reading the keyword feed and Apple Ads state

- The decisions feed holds only decisions that changed something or raised an alert. An empty feed is
  normal for a healthy or waiting keyword and is not a finding; infer state from `list`, `get` and
  the report rows. An empty feed is also what a company with the autopilot switched off, or an ad
  group under a custom product page A/B test, looks like. If a keyword stays in `ramp` and
  `last_tick_at` in `list` does not move, the finding is "nothing runs for this keyword": the user
  checks with Adapty.
- The keyword mode cannot be read, so assume it may be live. `status`, `tier`, `paused_code` and
  `enabled` change in dry run too, so `status` alone never proves what reached Apple Ads. Compare
  `apple_status` and the Apple bid with the decision first, and say that these two are a synced copy,
  not a live read. A dry-run decision text ends with "(dry run: not sent to Apple)".

## Keyword statuses

| `status` | Meaning | Reaction |
|---|---|---|
| `ramp` | Bid raised step by step toward the cap to get first impressions | Wait; at the cap with no impressions it becomes `dormant` |
| `learning` | Test window gathering taps, installs, trials, payments; verdict at the end | Wait; report spend and funnel, no verdict |
| `dormant` | Asleep: no auction at the cap, nothing to measure | Wait; it wakes when impressions return. A higher cap is a user decision (see below) |
| `working` | Passed the test on confirmed payments | Nothing; the bid may legitimately exceed the cap |
| `provisional` | Early signals look right, payments not confirmed yet | Nothing; regular raises toward the target are held back, thin traffic can still be raised toward the cap |
| `paused` | The autopilot stopped managing it; when live it paused it in Apple Ads | Read `paused_code`, below; it never resumes by itself |
| `human_review` | Apple refused a change; frozen until a person acts | Tell the user; the fix is in `autopilot-tuning.md` |

A bid above the cap is not a finding by itself: it is not cut at enrollment. Later cuts follow the
autopilot's normal rules (a spend spike, a borderline test result, a worse cost per paying user), and
while the keyword is tested a cut can also follow from taps costing more than the cap.

## Pause codes

| `paused_code` | What happened | Reaction |
|---|---|---|
| `no_download` | Taps, no installs | Tell the user |
| `spend_guard_no_trials` | Installs, no trials after enough spend | Check that Adapty events arrive for the app (`asa metrics`) before judging the keyword |
| `trials_dont_convert` | Trials, no matured payments after enough spend | Funnel after the trial; tell the user the keyword is not the only suspect |
| `weak_proxies` | Expected cost per paying user stayed far above the target | Tell the user; judge on the daily report rows, not only the forecast |
| `no_volume` | Too little traffic to judge, or a `provisional` keyword with no confirmed payment in time | Tell the user; compare the Apple bid with the cap (below) |
| `no_auction` | No auction at the cap | Tell the user; the cap is the limit (below) |
| `degraded` | A working keyword got worse and a cut did not help | Tell the user |
| `funnel_tap_to_install`, `funnel_install_to_trial`, `funnel_trial_to_paid` | That funnel step is confirmed broken | Fix the step (product page, onboarding, paywall, trial offer) before any retest; tell the user |

`no_auction` says something about the cap, not only the keyword. `no_volume` does not by itself:
compare the Apple bid with the cap, and if the bid was well below the cap, the cap is not what limited
the keyword. For `no_auction`, and for `no_volume` when the bid sat at the cap, a higher cap is an
option by the user's decision, never a number from you. Changing it restarts the test and is run only
through the handover to `autopilot-tuning.md`.

## Rows that are not managed

- `enabled: false` with `unenrolled`: taken off by a person. `awaiting_activation`: not `ACTIVE` in an
  `ENABLED` campaign; the autopilot activates nothing, so ask the user to activate or take it off.
- `external_pause`: paused by hand in Apple Ads. Its `status` keeps its old value, so read `enabled`.
  Resuming it does not bring it back.
- A `paused` row whose `apple_status` shows it running: someone resumed it in Apple Ads. The autopilot
  does not manage it and nobody watches its spend. Report it as a finding.

## Thin and immature data

- Judge on matured data only: payments count after the typical delay from install to first payment,
  and spend decisions use data complete through yesterday.
- A forecast can rest on very few taps, installs and trials: say the sample is thin and what would
  settle it. A cut on a `provisional` keyword can sharply reduce its traffic, so check delivery in the
  following days. Zero rows can be real zero traffic, not a sync gap.
- A before and after count of a few payments, with no control group, cannot show the autopilot helps.

## Budget autopilot

- `status`: `enrolled` (false means Adapty has not connected the company), `enabled`, `dry_run`,
  `mode`, `live_available`, the last weekly run, `next_run_at`, `next_guard_check_at`, and the spend
  guard alerts of the last 7 days. `dry_run` is the stored choice; `mode` is the effective mode and
  reads `dry_run` for any company that is off or while `live_available` is false. Report all four.
- In `dry_run` decisions are plans (`execution_status: dry_run`); nothing was written to Apple Ads.
  In Live read `execution_status`: `applied`, `failed`, `retry_wait` and `planned` differ.
- `fronts`: one row per managed or excluded campaign. `cpp`, `payers`, `spend` and `target_cpp` are as
  of the last weekly run, not live; budgets come from the synced copy. State the currency next to
  every amount; the autopilots convert nothing.
- Look for `excluded.reason: external_change` (a budget or status changed in Apple Ads while Live;
  nothing was reverted; resuming a campaign the spend guard paused does not exclude it, and the same
  pause can come back), and a stuck `pending_change`.
- Skipped campaigns need both `fronts` and `decisions`. A `fronts` row with `status: null` carries
  `skip_kind` `skipped_no_economics`, `skipped_c_revised` or `skipped_no_data`. These appear only as
  entries of the `decisions` feed, never as a row state: `skipped_multi_country`, `skipped_locked`,
  `skipped_ab_test`, `skipped_data_stale`, `skipped_invalid_state`, `skipped_budget_changed`. Name
  the kind; the decision text gives the reason.
- Severity: `critical` is a spend guard trigger, `notable` an external-change exclusion, a reduction
  dialog or a change not sent. A decision with `needs_attention` goes to the user first.
- In Live the spend guard pauses a campaign and never resumes it; do not suggest resuming before the
  cause (keywords, product page, paywall, trial offer) is fixed.
- A budget change shows in weekly numbers only weeks later. The budget target is not set through the
  CLI; a user who disagrees with it talks to Adapty.

## Disagreeing with the autopilot

If a decision looks wrong, report the disagreement with evidence (decision, daily rows, funnel,
window, sample limits) and hand over to `autopilot-tuning.md`. Never answer it with a silent manual
bid, pause or budget change: the autopilot adopts, excludes or ignores the entity.

## Output

Follow the skill's analysis contract, then a short "Needs you" list: only items needing a user
decision, each with entity, observed state and playbook. State that `apple_status` and the Apple bid
are a synced copy, that the keyword mode cannot be read, and the currency next to every amount. Do
not propose a target, cap, bid or budget.

## Example

```text
Needs you: keyword "scanner app" (KW-1) is `paused`, `paused_code: no_auction`; Apple bid as last
synced 0.85 USD, at the cap of 0.85 USD; `apple_status` shows it paused. This says something about the
cap. Option, by your decision: a higher cap; that restarts the test and would be handed over to
`autopilot-tuning.md`. Confidence: medium; the Apple data is a synced copy.
```

## Failure modes

- An empty feed read as a problem or as health; `status` read as proof of Apple Ads.
- A verdict from a few taps, installs or trials, or on immature payments.
- A feed paged without a fixed `--date-to`; repeated `report` calls; `fronts` read as live.

## Related playbooks

- Act on a finding → `autopilot-tuning.md`; before enrolling → `autopilot-readiness.md`.
- Account performance → `weekly-review.md`; spend that must stop now → `runaway-spend.md`.
