---
title: Autopilot readiness check
intent: user asks whether keywords or campaigns can go on Adapty's autopilot, what blocks them, or what they must supply before enrolling
kind: procedural
risk: read-only
requires: { cli: ">=0.34.0", subscription: true }
uses: [asa whoami, asa orgs list, asa campaigns get, asa ad-groups get, asa keywords list, asa keywords duplicates, asa keyword-autopilot list, asa automations list, asa automations get, asa change-history list, asa metrics, asa budget-autopilot status, asa budget-autopilot fronts, asa budget-autopilot decisions]
time: ~15 min
---

# Autopilot readiness check

Sort the user's keywords or campaigns into what can go on Adapty's autopilots, what is blocked, and
what only an enrollment can answer. The check is read-only: it ends with a classification and a
handover, never with a write.

## Apply when

- The user asks "can I put this keyword or campaign on autopilot", or what is stopping it.
- The user asks what target cost per paying user or bid cap to use.
- Before any enrollment, even when the user says they are sure.

## Do not apply when

- The user decided and wants keywords enrolled → `keyword-autopilot-launch.md`.
- The user wants the budget autopilot turned on or moved to Live → `budget-autopilot-launch.md`.
- The user asks how enrolled keywords or managed campaigns are doing → `autopilot-review.md`.
- The user wants to change or stop something already on autopilot → `autopilot-tuning.md`.

## Required inputs

- scope: the app, the campaigns or ad groups, and the keywords, by name from the user;
- the country each keyword is for;
- the user's own target cost per paying user for each keyword, if they have one, with its currency.

With no target the check still runs and ends in `needs_user_input`; never fill the gap yourself.

## Keyword checks: what you can verify

Use existing reads. Each answer goes into the classification with the evidence behind it.

1. Access and connection: `asa whoami` tells whether Ads Manager access exists, how it was granted,
   and the Apple connection state. Without
   Ads Manager access the other commands used here answer 402; `whoami` itself still answers.
2. Keyword state: read the scoped keywords (the live-only filter of the list keeps active keywords in
   an enabled ad group and campaign, so to classify a keyword that is not active, read the scoped
   list without that filter). A keyword that is not active in an enabled campaign is
   `needs_user_input`: the user either activates it first, or explicitly accepts that it is enrolled
   and waits as `awaiting_activation` (`enabled: false`, nothing manages it until it is active in
   Apple Ads). The autopilot never activates anything.
3. Ad group state: enrollment does not check the ad group, and every enrolled keyword starts in
   `ramp`. While a keyword in a paused ad group has no impressions, a live autopilot keeps raising its
   bid toward the cap. Read the ad group and campaign state yourself (`asa ad-groups get`,
   `asa campaigns get`) and treat a paused ad group as something the user decides first.
4. Countries: the keyword rows carry `countries`. If the campaign targets several countries the
   enrollment needs one named country, and a named country is not checked against the campaign.
   Verify it yourself.
5. Current bid and its currency: the bid comes from the keyword row; the currency of the Apple Ads
   account comes from `asa orgs list`. The target and the cap are plain numbers in that currency and
   nothing is converted. If the user quotes a number in another currency, ask them to restate it;
   never pick a rate.
6. Already enrolled: `asa keyword-autopilot list`. A keyword that is still enrolled, even a paused
   one, cannot be enrolled again; only an unenrolled row can.
7. Rule-based automations: `asa automations list`, then `get`, for active rules whose scope covers
   the same ad groups or their parents and that change bids or statuses. Treat each one as a conflict
   the user must resolve (stop the rule or keep the keyword off autopilot) before enrollment. Do not
   tell the user the autopilot protects keywords from rules, or that rules leave it alone.
8. Recent manual changes: `asa change-history list` for the campaign group shows recent bid edits,
   so the user knows who changes these bids (`modified_by` is an Apple user id, not a name). A bid
   changed by hand after enrolling is adopted at the next daily run with an alert, so the user should
   not edit enrolled bids.
9. A custom product page A/B test on the ad group: there is no direct read. The autopilot skips such
   an ad group silently, so a keyword that never moves may be frozen by it. Ask the user whether a
   test runs there; the keyword duplicates read shows the test id only for repeated keyword text.
10. Whether Adapty events reach the app: not readable. Non-zero `adapty_installs`, `trials_started`
    and `paid` for the campaign in `asa metrics` suggest that they do; it is a hint, not proof.

## Keyword checks: what only an enrollment reveals

Do not guess these; the answer to a real enrollment is the only source. Tell the user what each
refusal will mean, so none of them surprises them later.

- 404: the keyword is unknown, deleted, not theirs, or created so recently that it has not synced yet.
- 409: the keyword is already enrolled.
- 422, country missing: a multi-country campaign needs one named country.
- 422, app not linked: the app is not linked to Adapty data. Ask the user whether the app is
  connected in Adapty. Nothing bypasses this check.
- 422, not enough funnel data: the country has too little history of installs, trials and payments
  for the autopilot to work from. A target or cap does not help.
- 422, disabled: the autopilot is switched off for the company. Only Adapty can change that.

## Keyword checks: what to ask the user or Adapty

- The mode of the keyword autopilot (live or dry run) cannot be read or switched through the CLI.
  Treat every enrollment as live: bid changes can start at the next run. If the user needs to know
  the mode, they ask Adapty.
- Who owns the bids of these keywords from now on; see `autopilot-tuning.md` for manual changes.

## Budget checks

1. `asa budget-autopilot status`: is the company connected (`enrolled`)? A company that is not
   connected shows `enrolled: false`. Only Adapty connects a company; tell the user to ask Adapty.
2. Read `enabled`, `dry_run` and `live_available`. `dry_run` is the stored choice. `mode` is the
   effective mode and reads `dry_run` for any company that is off or while `live_available` is false,
   so conclude nothing about the stored mode from `mode`. Live cannot be chosen while
   `live_available` is false.
3. Read `asa budget-autopilot fronts` and `asa budget-autopilot decisions` to say which campaigns are
   managed and which are skipped, and why. Rows of `fronts` with `status: null` carry one of these
   `skip_kind` values: `skipped_no_economics`, `skipped_c_revised`, `skipped_no_data`. These appear
   only as entries of the `decisions` feed, never as a row state: `skipped_multi_country`,
   `skipped_locked`, `skipped_ab_test`, `skipped_data_stale`, `skipped_invalid_state`,
   `skipped_budget_changed`. The decision text gives the reason; do not guess one.
4. The budget autopilot's target is set by Adapty and cannot be set through the CLI. Do not ask the
   user for one; say so.

## Choosing the target

The target cost per paying user is the user's number, in the currency of the Apple Ads account.
You may show a reference next to it, never instead of it:

- observed cost per paying user (`cost_per_paid` in `asa metrics`) for a window the user agrees to,
  stated with its dates, entity and currency, and labelled as an observed average, not a
  recommendation. Pick a window that ended long enough ago for payments to have arrived; a young
  window overstates it, because payments have not arrived yet (see the maturity gate in `bid-optimization.md`).

You must not turn that figure into a target, add a margin, name a strategy, or pick a cap. The bid
cap is also the user's choice. It limits the autopilot's raises while a keyword ramps up and is
tested; a keyword that proves itself may later be bid above it. A keyword whose current bid is above
the cap is not cut when enrolled, but it may get a lower bid later during its test if taps cost
more than the cap. Say that plainly and promise neither outcome.

## Classify

| Category | Meaning |
|---|---|
| `ready` | Every check you can run passed and the user supplied target, country and bid owner |
| `blocked` | A named reason stops it: already enrolled, conflicting automation, no Adapty access |
| `needs_user_input` | A target, country, currency, answer on A/B tests or bid ownership, or a decision on an inactive keyword or paused ad group is missing |
| `unknown_until_enrollment` | The remaining gates (data link, funnel data, disabled engine) show only in the answer |

`ready` means "nothing I can read stands in the way", never "will be accepted".

## Output

Return the four categories as separate lists, one line per keyword or campaign with its reason, then
the open inputs, then one handover line naming the launch playbook. State the currency next to
every number. Propose no write and no target.

## Example

```text
blocked — KW-17 "photo editor": an active rule changes bids on the same ad group. The user stops
the rule or keeps the keyword off autopilot.
needs_user_input — KW-18 "pdf editor": ad group paused in Apple Ads; the user decides first.
needs_user_input — KW-22 "scan pdf": campaign targets two countries; which country, and what
target in the account currency (USD)? Observed cost per paying user, 2025-09-01..2025-10-15,
campaign level: 17.80 USD (average, not a recommendation; the target is the user's number).
unknown_until_enrollment — KW-25: app link and funnel data show only in the enrollment answer.
```

## Failure modes

- Telling the user a keyword "will be accepted": three gates are visible only in the answer.
- Calling a rule-based automation harmless, or the autopilot a protection against it.

## Related playbooks

- Enroll the ready keywords → `keyword-autopilot-launch.md`.
- Turn on the budget autopilot → `budget-autopilot-launch.md`.
- Check what the autopilots did → `autopilot-review.md`.
- Change or stop an enrolled keyword or campaign → `autopilot-tuning.md`.
