---
title: Budget autopilot launch
intent: user wants the budget autopilot turned on, or moved from dry run to Live
kind: procedural
risk: writes-money
requires: { cli: ">=0.34.0", subscription: true }
uses: [asa budget-autopilot status, asa budget-autopilot update, asa budget-autopilot fronts, asa budget-autopilot decisions, asa automations list, asa change-history list]
time: ~25 min
---

# Budget autopilot launch

Turn Adapty's budget autopilot on in two separate stages: dry run first, Live only after the user has
read what dry run planned. Each stage is its own write with its own confirmation. Live moves real
daily budgets and can pause real campaigns, and there is no undo.

## Apply when

- The user wants the budget autopilot on, moved to Live, or asks how a company gets connected.

## Do not apply when

- Spend is running away right now → `runaway-spend.md`.
- One campaign should leave, or an exclusion be lifted → `autopilot-tuning.md`.
- The user asks what the autopilot did or whether it works → `autopilot-review.md`.
- The question is whether campaigns qualify → `autopilot-readiness.md`.
- The user wants keywords on the keyword autopilot → `keyword-autopilot-launch.md`.

## Required inputs

- The company state from `asa budget-autopilot status`: `enrolled`, `enabled`, `dry_run` (the
  stored choice of mode), `mode` (the effective mode), `live_available`, the last weekly run,
  `next_run_at`, `next_guard_check_at`.
- The user's wish: dry run only, or Live as well. Live is never assumed.

The budget autopilot's target is not set through the CLI. Never propose a target or budget of your own.

## Not connected

If `status` returns `enrolled: false`, the company is not connected. Only Adapty connects a company;
`update` stops with an error and sends nothing. Do not retry. Tell the user to ask Adapty to connect
the company, and stop: nothing else here can be done until `status` shows `enrolled: true`.

## Stage 1: dry run

1. Read `status`. Stage 1 is done only when `enabled` is true and `dry_run` is true. A company that is
   on with stored `dry_run` true stays in dry run when Adapty changes its global switch; only a change
   to this company's own setting moves it.
2. Read `enabled` and `dry_run`; never rely on `mode` for this. `mode` is the effective mode and reads
   `dry_run` for any company that is off, or while `live_available` is false. Enabling keeps the stored
   choice, so a company that is off with `dry_run` false goes Live the moment it is enabled. In that
   case first set the mode to dry run while it is off, read `status` back and confirm `dry_run` is true,
   and only then enable. Never let one call do both.
   If `enabled` is true and `dry_run` is false, the company is on with a stored Live choice. If `mode`
   is `live` it is already Live: tell the user and stop. If `mode` is `dry_run` only because
   `live_available` is false, it will go Live when Live becomes available: set the mode to dry run (its
   own confirmation) and read `dry_run` back. Do not treat such a company as being in dry run.
3. Propose and, after a yes, enable. Read `status` back and compare.

Dry run plans the weekly run and records decisions marked `execution_status: dry_run` ("not sent to
Apple"). It writes nothing to Apple Ads and locks no campaign. The spend guard records what it would do
and pauses nothing. Changes made by hand in Apple Ads are not tracked.

The weekly run happens Monday morning UTC; the exact time is `next_run_at`. Managed campaigns and
decisions appear only after a weekly run, so right after enabling, `fronts` and `decisions` are empty.
That is normal; wait for the run.

## Reading dry run

After a weekly run, read `fronts` and `decisions` (fix the end of the window when paging).

- `fronts`: one row per campaign managed or excluded, with budgets and `currency`. `cpp`, `payers`,
  `spend` and `target_cpp` are as of the last weekly run, not live. Name the currency next to every
  amount you show.
- To see what was skipped, read both `fronts` and `decisions`. A `fronts` row with `status: null`
  carries one `skip_kind`: `skipped_no_economics` (too little data or too few paying users for the
  country), `skipped_c_revised` or `skipped_no_data`. These appear only as entries of `decisions`,
  never as a row state: `skipped_multi_country` (several countries), `skipped_locked`, `skipped_ab_test`
  (custom product page A/B test), `skipped_data_stale`, `skipped_invalid_state`,
  `skipped_budget_changed`. For `skipped_c_revised` and `skipped_invalid_state` the decision text
  explains the reason. Report each with its reason; do not work around a skip.
- Campaigns of unsupported types or without a daily budget do not appear at all, and the CLI does not
  show a campaign's type. If an expected campaign is absent, say so.
- Read `decisions` critically: transfers, reductions, reduction dialogs (`needs_attention`) and would-be
  spend guard pauses. A decision you cannot explain is a finding for the user.

## Stage 2: the Live gate

Move to Live only when all of these hold:

1. The user has seen at least one weekly run of dry-run decisions and has read them with you.
2. `live_available` is true. If false, Live is refused and nothing is sent; the global switch belongs to
   Adapty. Tell the user to ask Adapty; do not retry.
3. The user says yes to exactly this change, in a message after the proposal below, not in the message
   that enabled dry run.
4. Rule-based automations are settled. Run `asa automations list` and look for an active rule that
   changes budgets or statuses of a managed campaign, directly or through its app or campaign group.
   Do not claim the autopilot protects against it. It is a conflict the user must resolve (stop or
   rescope the rule) before Live.
5. Currency is confirmed. Budget amounts are in the campaign's own currency and the autopilot converts
   nothing. If the account's currency is not USD, tell the user to confirm with Adapty before the switch.

Dry run shows what the autopilot would do on current data; the first Live run plans again and may
differ, and nothing planned in dry run is replayed. Weekly dry-run plans pause nothing; only spend
guard triggers are recorded. Ask the user to add up the monthly budget of the campaigns dry run planned
to reduce, and to look at the campaigns it flagged with a spend guard trigger. Do not estimate it for
them.

What Live does:

- The weekly run changes campaign daily budgets; the spend guard, checked every 6 hours, can pause a
  campaign that spends with no trials or no payments. It never resumes a campaign and never changes
  bids, keywords or lifetime budgets, and it creates no campaigns.
- Switching to Live changes no budget at once. The first budget change comes with the next weekly run;
  the spend guard can pause a campaign at its next check, within 6 hours.
- Before the confirmation `update` prints, to stderr, up to 20 campaigns with their monthly budgets. It
  covers every campaign under the autopilot that is not excluded, including ones the last run skipped.
  Show it, but do not present it as "campaigns whose budgets will change".

## Proposal

For each of the two writes, show:

- the company, current `enabled` and `dry_run`, and the proposed state;
- for Live: the campaigns under the autopilot with budgets and currency, the planned reductions you
  read, the automations check, `live_available`;
- reason and risk: stage 1 writes nothing to Apple Ads; Live changes budgets at the next weekly run
  and may pause a campaign within 6 hours;
- way back: `dry_run` or off stops further writes and releases the locks. It restores no budget and does
  not resume a campaign the guard paused. A budget decision shows monthly amounts, while Apple Ads
  takes a daily budget; do not convert one into the other. To restore a budget by hand, read the
  campaign's change history (the organization comes from the campaign row). If it shows the previous
  daily budget, use it; if it does not, ask the user for the amount. Never derive a daily budget from
  the monthly figure. Confirm the amount with the user before any write;
- `requires_confirmation: true`.

## Execute and verify

1. One confirmation covers one write; enabling dry run and switching to Live are never one.
2. Use a fresh idempotency key for each write. If the user runs the command, omit `--yes`.
3. Read `status` back and compare `enabled` and `dry_run` with the proposal. "Nothing to change" means
   the state was already set; report it, do not repeat the write.
4. After Live, give the dates to watch: `next_run_at` and `next_guard_check_at`.

First week of Live:

- After the first weekly run, read `decisions` for `applied`, `failed` and `retry_wait` changes. A
  `failed` change has a `last_error_code` in the `--json` answer, not in the human output. It is
  Apple's code or an internal one; report it as printed, do not interpret it, do not retry by hand.
- A `critical` decision is a spend guard pause: tell the user which campaign and why. Do not resume it
  until the cause (keywords, product page, paywall, trial offer) is fixed.
- A budget or status change of a managed campaign made in Apple Ads, by the user or by you, excludes it
  (`excluded.reason: external_change`). Nothing is reverted. The exception: resuming a campaign the
  spend guard paused does not exclude it, and the same pause can come back. `include` lifts an exclusion and the next
  weekly run decides whether the campaign is managed again → `autopilot-tuning.md`.
- Do not judge results from one run; numbers lag the changes by weeks.

## Output

Per the skill's analysis contract: stage reached, evidence shown, the write and its read-back, dates to
watch, open items for the user (automations, currency, Adapty).

## Example

```text
Status: enrolled, enabled, dry_run true, live_available true. After one weekly run, `fronts` has
<n> rows: <a> managed, <b> with status null (skipped_no_economics); one multi-country campaign appears
only as a skipped_multi_country decision. Proposed: switch to Live. Under the autopilot (monthly, USD):
"<campaign A>" <amount>, "<campaign B>" <amount>; this list includes the skipped ones. No automation
changes these budgets. Effect: no budget change at the switch; the first change comes with the next
weekly run (`next_run_at`). Way back: dry run; budgets already moved stay moved. Confirm this switch only?
```

## Failure modes

- `enrolled: false` or `live_available: false`: stop and ask Adapty; the agent can do neither.
- Enabling a company whose `dry_run` is false skips the Live gate. Check `dry_run`, not `mode`.
- Never change budgets or statuses of managed campaigns with ordinary commands while Live; exclude the
  campaign first → `autopilot-tuning.md`.
- Never convert a currency, propose a budget, or set a target.

## Related playbooks

- Qualification → `autopilot-readiness.md`. What it did → `autopilot-review.md`.
- Exclude, include, stop writing → `autopilot-tuning.md`. Incident → `runaway-spend.md`.
