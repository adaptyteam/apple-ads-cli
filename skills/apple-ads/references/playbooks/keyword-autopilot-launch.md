---
title: Keyword autopilot launch
intent: user wants specific keywords put on Adapty's keyword autopilot
kind: procedural
risk: writes-money
requires: { cli: ">=0.34.0", subscription: true }
uses: [asa keywords list, asa keyword-autopilot list, asa keyword-autopilot get, asa keyword-autopilot enroll, asa keyword-autopilot decisions, asa orgs list]
time: ~25 min
---

# Keyword autopilot launch

Enroll keywords the readiness pass cleared, one at a time, each with the user's own target. Enrolling
hands the bid of a real keyword to the autopilot, which can raise it step by step toward the cap,
can lower it, and can pause the keyword in Apple Ads. Nothing here is deleted or undone.

## Apply when

- `autopilot-readiness.md` is done and the user supplied a target for every keyword to enroll.
- The user names the keywords, the country of each, and who owns their bids from now on.

## Do not apply when

- No readiness pass yet, or a keyword is `blocked` or `needs_user_input` → `autopilot-readiness.md`.
- The user wants to know what the autopilot did → `autopilot-review.md`.
- The user wants to change the target or cap, or take an enrolled keyword off → `autopilot-tuning.md`.
- Spend must stop now → `runaway-spend.md`.

## Required inputs

- for each keyword: its id from `asa keywords list` (the targeting keyword id, not an autopilot id),
  text, campaign, country, current bid and status;
- the target cost per paying user for each keyword, in the currency of the Apple Ads account, and
  that currency named (read it from `asa orgs list`); the target is the user's number, never yours;
- optionally a bid cap, also the user's number, in the same currency;
- the user's answer on who owns bids and statuses of these keywords, and on rule-based automations
  that touch the same ad groups;
- for a keyword that is not active in an enabled campaign: the user's explicit acceptance that it is
  enrolled and waits as `awaiting_activation`, or its activation first.

Never enroll without a target the user gave for that keyword. Never pass an aggressiveness value or a
cap the user did not give. Never enroll a keyword that a rule-based automation changes, or that the
user edits by hand, until that is settled. Enroll an inactive keyword only with the acceptance above.

## The mode gate

You cannot read whether the keyword autopilot is live or in dry run, and you cannot switch it.
Treat every enrollment as live. Before the first enrollment, tell the user in plain words:

- the autopilot may start changing the bid of each enrolled keyword at its next run, which can be
  hours away: every keyword starts in `ramp`, where a live autopilot raises the bid step by step
  toward the cap, and it may later cut the bid or pause a keyword that does not prove itself;
- enrolling does not change the bid on the spot, and the autopilot counts only from the moment of
  enrollment;
- if they want to know the mode, they ask Adapty before the first enrollment, not after it.

Get an explicit yes to that statement. Do not enroll before it.

## Bid and cap

- A keyword whose current bid is above its cap is accepted, and the bid is not cut at enrollment.
  It may get a lower bid later while it is tested, if taps cost more than the cap. Tell the user
  this for each such keyword and promise neither outcome.
- You cannot read the cap the autopilot would compute before enrolling. Only an explicit cap from
  the user is known in advance; otherwise the cap appears in the readback.
- A cap limits raises while the keyword ramps and is tested; a keyword that proves itself may be bid
  above it.

## Proposal

One row per keyword:

- keyword text and id, campaign, country;
- current bid and status, with the currency;
- the user's target, and the cap if the user gave one or "computed by the autopilot", with the
  currency;
- what happens next: it starts at `ramp`, no Apple call is made at enrollment, the first changes
  come at a later run; if the keyword is not active in an enabled campaign it waits as
  `awaiting_activation` and nothing is managed until it is activated in Apple Ads;
- the risk: bid raises toward the cap and higher spend, later cuts, a pause;
- the way back: `unenroll` makes no Apple call. The bid and status stay where the autopilot left them,
  a keyword it paused stays paused, and the original bid is not restored. Name the previous bid so
  the user can set it by hand later (`bid-optimization.md`). Enrolling again restarts the test;
- `requires_confirmation: true`.

State how many keywords the confirmation covers. Cover only as many as the user can read row by row;
no recommended batch size exists, so ask the user and keep the first group small.

## Execute and verify

1. Get an explicit yes for exactly these keywords, targets and caps.
2. One keyword per call. Use a fresh idempotency key for every call. The writes share one budget
   (see "Request budgets" in the reference); if it runs out, wait for the reset and do not loop.
3. If the user runs the commands, omit `--yes`; the CLI prints the request and waits. Add `--yes`
   only on a command you run yourself after the explicit yes.
4. Enroll the first keyword and read it back before the next. Compare `asa keyword-autopilot get`
   and `list` with the proposal: `status` is `ramp`, the `target_cpp` and `currency` match, `cap` is
   as expected, `enabled` is true (or `awaiting_activation`), and the Apple bid is unchanged.
5. A refusal is an answer, not an obstacle. Never work around one.

| Refusal | Meaning | Reaction |
|---|---|---|
| 404 | Keyword unknown, deleted, not theirs, or too new to have synced | Check the id; if the keyword is new, stop and retry later with a fresh key |
| 409 | Already enrolled | Stop. Do not enroll twice; changes go through `autopilot-tuning.md` |
| 422, country | A multi-country campaign needs one named country | Ask the user for the country; fix the input |
| 422, app not linked | The app is not linked to Adapty data | Stop. Ask whether the app is connected in Adapty; nothing bypasses the check |
| 422, not enough funnel data | Too little history for this country | Stop for this keyword; a target or cap does not help |
| 422, disabled | Autopilot switched off for the company | Stop. Ask the user to contact Adapty |
| 429 | Budget exhausted | Wait for `Retry-After`; never loop |

A repeat of an ambiguous write uses the same key only to replay the same request. A different
target or cap is not a retry: it goes through `autopilot-tuning.md`.

## After the launch

- The decision feed shows only actions and alerts, so a healthy keyword has an empty feed. An empty
  feed is also what a company with the autopilot switched off, or an ad group under a custom product
  page A/B test, looks like. Read `list` and `get`, not the feed alone. If a keyword stays in `ramp`
  and `last_tick_at` in `list` does not move, ask the user to check with Adapty.
- `apple_bid` and `apple_status` are as last synced, not a live Apple read. If the user doubts them,
  ask them to look in Apple Ads.
- `status` alone does not prove what happened in Apple Ads. In a dry run it also changes, and the
  mode cannot be read. `operation_id` is not in the table output of `decisions`; it is in the
  `--json` answer. With `--json`, an `operation_id` means a change was sent to Apple Ads; its absence,
  or a text ending "not sent to Apple" (a dry run or a dropped change), means it was not. A change
  Apple refused shows later as an alert that applying failed, and the keyword goes to `human_review`.
- First day: `ramp`, `enabled: true`, no `paused_code`, bid unchanged or changed by the autopilot only.
  First week: the first bid changes follow the first runs; a test verdict does not come in the first
  days, and a keyword can be paused on thin data. Do not judge by volume alone, and do not judge on
  immature payments.
- Tell the user early, not at the weekly review: an alert that a change failed, a keyword in
  `human_review`, a first bid change that never shows as applied, a `paused` keyword in the first
  days, or `external_pause` they did not expect.

## Output

The proposal table, the mode statement and the user's yes, one line per enrollment with the readback
result, the refusals met, and the list of keywords not enrolled with the reason. State the
currency next to every number.

## Example

```text
KW-31 "scan pdf", US, campaign C-4, active. Current bid 1.15 USD. Target 19.00 USD per paying user
(the user's number). Cap: computed. Next: ramp, no Apple call now, first changes at a later run.
Risk: bid raises toward the cap and higher spend, later cuts, a pause; a bid above the computed cap
may get a lower bid during the test.
Way back: unenroll leaves the bid where the autopilot put it; previous bid 1.15 USD, restore by hand.
```

## Failure modes

- Enrolling without a user target, or with a target in an unstated currency.
- Promising that a bid above the cap will or will not be cut.
- Treating the empty feed or `status` as proof that Apple Ads changed or did not.
- Enrolling a keyword that a rule or a person also edits; the two work against each other.
- Unenrolling and enrolling in a loop to "reset" a keyword; each cycle loses the test.
- Passing a targeting keyword id where an autopilot id is expected, or the reverse.

## Related playbooks

- Cleared keywords first → `autopilot-readiness.md`.
- Check what it did → `autopilot-review.md`.
- Change target, cap, or take a keyword off → `autopilot-tuning.md`.
- Hand bid changes on keywords not enrolled → `bid-optimization.md`.
- Spend incident → `runaway-spend.md`.
