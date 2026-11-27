---
title: Autopilot tuning
intent: user wants to change how the autopilot treats a keyword or a campaign, or to stop it
kind: procedural
risk: writes-money
requires: { cli: ">=0.34.0", subscription: true }
uses: [asa keyword-autopilot list, asa keyword-autopilot get, asa keyword-autopilot enroll, asa keyword-autopilot unenroll, asa budget-autopilot status, asa budget-autopilot fronts, asa budget-autopilot update, asa budget-autopilot exclude, asa budget-autopilot include, asa keywords list, asa keywords update, asa campaigns list]
time: ~15 min
---

# Autopilot tuning

Make one deliberate change to how Adapty's keyword or budget autopilot treats one keyword or campaign,
or stop it. Every intervention here is small, but none can be undone: there is no delete and no undo,
and the way back restores less than the user may expect.

## Apply when

- A review (`autopilot-review.md`) produced a finding and the user wants to act on it.
- The user wants a different target or cap on an enrolled keyword, a keyword or campaign taken off,
  or the budget autopilot to stop writing or be turned off.

## Do not apply when

- First enrollment or first turn-on → `keyword-autopilot-launch.md`, `budget-autopilot-launch.md`.
- Spend must stop now → `runaway-spend.md`, then come back.
- The user only asks what happened → `autopilot-review.md`.
- The user wants a one-off bid change on a keyword that is not enrolled → `bid-optimization.md`.

## Required inputs

- the exact keyword or campaign, and what the user wants to be different;
- for a new target or cap: the user's own numbers and their currency (the account currency; nothing is
  converted). Never propose a target, cap, bid or budget of your own;
- the user's explicit decision for any intervention that restarts the test.

## Decision table

Read the current state first (`keyword-autopilot list` or `get`, `budget-autopilot status` or
`fronts`). One row is one intervention; every write in it gets its own confirmation.

| Situation | Smallest correct intervention | Side effects | Way back |
|---|---|---|---|
| Wrong target or cap on an enrolled keyword | Unenroll, then enroll again with the user's numbers | Restarts the test: `ramp`, evidence and counters reset; a `working` keyword loses its confirmed state. The bid stays where it is | Enroll again; restarts again, earlier evidence is not reused |
| Keyword the autopilot paused, user wants it back | Three steps, each its own confirmation, in order: unenroll; resume in Apple Ads (an ordinary write); enroll again | Restarts the test; spend runs again from the Apple bid. Resuming while still enrolled leaves it `paused` and unmanaged; enrolling while still paused in Apple Ads leaves it `awaiting_activation` | Pause by hand; unenroll if enrolled |
| Keyword the user paused by hand (`external_pause`) | None if it should stay stopped. To manage it again: the same three steps | Resuming alone changes nothing in the autopilot | As above |
| Keyword frozen for review (`human_review`) | Check in Apple Ads that it exists, is active and has a valid bid; then unenroll, enroll | Restarts the test | Unenroll |
| Keyword should leave the autopilot | Unenroll | No Apple Ads call: bid and status stay; a paused keyword stays paused; history stays, row stays with `enabled: false`; repeating is harmless | Enroll again; restarts the test |
| Campaign should leave the budget autopilot | Exclude it | Budget stays; applied changes are not reverted; open unsent changes are cancelled; the spend guard skips it | Include it; the next weekly run decides |
| Campaign excluded after an outside change | Leave it excluded, or include it | Nothing was reverted. Including does not manage it at once | Exclude again |
| Budget autopilot should stop writing | Set the mode to dry run | Stops further writes; restores nothing | Live gate in `budget-autopilot-launch.md` |
| Budget autopilot should be off | Disable it; if it was Live, also set dry run | Same; restores nothing. Disabling keeps the stored `dry_run`: if it was Live, a later enable goes Live again | Turn-on in `budget-autopilot-launch.md` |

Target and cap of an enrolled keyword change only by unenrolling and enrolling again. Say plainly that
this restarts the test; offer no other way and no gradual steps.

## What each write does and when

- Keyword autopilot writes act on one keyword per call. The autopilot acts at its next scheduled run
  (four times a day, plus one daily run). Enrolling makes no Apple Ads call and sets no starting bid;
  it continues from the Apple bid at that moment.
- A bid above the cap is not cut at enrollment. It can be cut later while the keyword is tested, if
  taps cost more than the cap. The cap limits raises only while the keyword ramps and is tested; a
  `working` or `provisional` keyword may be bid above it.
- The mode of the keyword autopilot cannot be read or switched. Treat every enroll as a possibly live
  action that can move a real bid. Ask the user to confirm the mode with Adapty if it matters.
- `include` answers success even when nothing was excluded: read `fronts` first.
- Budget `update` sets two things, on or off and the mode. `--mode` alone keeps on or off, so on a
  company that is off it changes only the stored mode. The stored choice is `dry_run` in `status`;
  `mode` is the effective mode and reads `dry_run` for any company that is off or while
  `live_available` is false, so never read the stored choice from `mode`. Read `status` back after
  every `update` and check `enabled` and `dry_run`.
- Turning the budget autopilot off or to dry run: open changes that are not yet being sent are not
  sent. Exclusions stay stored. Turning budgets off does not stop the keyword autopilot, and the other
  way round.

## What is lost and what is never restored

- Test progress: enrolling again starts from `ramp`. A keyword that was `working` has to prove itself
  again, and its bid is not set to anything.
- Budgets the autopilot already changed stay where they are, in every way back above.
- Campaigns or keywords the autopilot paused stay paused. The autopilot never resumes anything, and
  turning it off does not either. Resuming is a separate manual action.
- Bids the autopilot changed stay where they are after an unenroll.

## Managed objects and ordinary commands

Before any ordinary write on an enrolled keyword or a managed campaign, read `keyword-autopilot list` or
`budget-autopilot fronts`. Effects:

- A manual bid change is noticed at the next daily run and adopted as the starting point. For
  `working` and `provisional` keywords the autopilot then waits before moving the bid again; a keyword
  in `ramp` or `learning` keeps raising from the new bid, so a manual cut there can be undone. It does
  not put the old bid back. Bid changes by hand alternating with its cuts make either unreadable.
- A manual pause takes the keyword out of the autopilot (`external_pause`); resuming later does nothing.
- A manual resume of a keyword the autopilot paused leaves it `paused` and unmanaged, so nobody watches
  its spend.
- A manual budget or status change of a managed campaign while Live excludes it
  (`excluded.reason: external_change`); nothing is reverted. In dry run changes are not tracked.
  The exception: resuming a campaign the spend guard paused does not exclude it, and the same pause
  can come back.

The rule: if the user wants manual control of an enrolled keyword or a managed campaign, do the
autopilot intervention first (unenroll or exclude) as its own confirmation, and only then the manual
change as a separate one. If the user wants to keep it managed, make no manual change.

## Proposal

One row per entity, one write per confirmation (a multi-step intervention is shown whole, each step
confirmed on its own):

- keyword text and id, or campaign name and id; the autopilot's `status`, `enabled`, `paused_code` or
  the front's state;
- current target, cap, Apple bid (as last synced) and `apple_status`, or current budget; each amount
  with its currency;
- the proposed state and the reason, with evidence from the review;
- the expected effect and the risk, including what restarts or stops;
- the way back and what it does not restore;
- `requires_confirmation: true`.

Never combine an autopilot change with a manual bid or budget change in one confirmation.

## Execute and verify

1. Get an explicit yes for exactly this entity and this change. `--yes` only on a command you run
   yourself; if the user runs it, leave `--yes` out so they read the printed request.
2. A fresh idempotency key for each distinct write, and one write per confirmation. Re-enrolling is
   unenroll then enroll, bringing back a paused keyword is unenroll, resume (`keywords update`), enroll:
   each step has its own confirmation and key, and the next starts only after the previous read back.
   After the resume, read `apple_status` in `keyword-autopilot list` (a synced copy, it can lag) and
   enroll only when it shows the keyword active; otherwise the new enrollment waits as
   `awaiting_activation`, and it can stay there.
3. Use the right id: `enroll` takes the targeting keyword id from `asa keywords list`; `get`, `unenroll`
   and the feeds take the autopilot keyword id from `keyword-autopilot list`; `exclude` and `include`
   take the campaign id from `asa campaigns list`.
4. Read back and compare. After unenroll: `enabled: false`, `disabled_reason: unenrolled`. After enroll:
   `ramp`, the target and cap in the account currency, and an unchanged Apple bid (or
   `awaiting_activation` if the keyword is not active in an enabled campaign). After exclude: the
   front's `excluded` field. After include the CLI returns only an acknowledgement, and absence from
   `fronts` is expected until the next weekly run. After `update`: `enabled` and `dry_run` in `status`.
5. Report partial or failed writes by entity. Never rerun an ambiguous write with a new key.

## Output

The proposal before the write; after it, the read-back per entity: what changed, what did not, and
`next_run_at` for budgets. No performance promises.

## Example

```text
Keyword "scanner app" (KW-1), `paused` with `no_auction`, Apple bid as last synced 0.85 USD, cap 0.85
USD, target <your target> USD. Step 1 of 3, unenroll: no Apple Ads call, bid and pause stay. Steps 2
and 3, each confirmed separately: resume in Apple Ads, then enroll with cap <your number> USD. Without
step 2 the new enrollment waits as `awaiting_activation`. Effect: the test restarts from `ramp`; the
bid is not changed at enrollment. Risk: spend can rise toward the new cap. Way back: unenroll; nothing
restores the old test. requires_confirmation: true.
```

## Failure modes

- Unenrolling and enrolling repeatedly to "reset" a keyword.
- Enrolling while the keyword is still enrolled: the server answers 409; unenroll first.
- Resuming an autopilot-paused keyword and leaving it unenrolled, running unwatched.
- Including a campaign without saying that the next weekly run decides, from its current budget.
- Excluding to "undo" a budget change: exclude restores nothing.
- The wrong id type for `enroll` or `unenroll`; a number in another currency than the account's.

## Related playbooks

- Find what to change → `autopilot-review.md`.
- First enrollment → `keyword-autopilot-launch.md`; first turn-on or Live → `budget-autopilot-launch.md`.
- Spend that must stop now → `runaway-spend.md`.
- A bid change on a keyword outside the autopilot → `bid-optimization.md`.
