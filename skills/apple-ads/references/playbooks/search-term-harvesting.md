---
title: Harvest search terms into exact owners and negatives
intent: user wants to promote real queries, preserve traffic ownership, and block proven waste
kind: procedural
risk: writes-money
requires: { cli: ">=0.4.0", subscription: true }
uses: [asa search-terms list, asa keywords list, asa negative-keywords list, asa keywords add, asa negative-keywords add]
time: ~25 min
---

# Search-term harvesting

Promote proven queries into deliberate Exact owners without letting Discovery or Broad keep taking
the same traffic. The safe unit is an ownership move, not an isolated keyword addition.

## Apply when

- The user wants real search queries promoted to Exact keywords.
- Discovery or Broad has produced useful terms that need a stable owner.
- A harvest should also identify clearly irrelevant or ownership-conflicting queries.

## Do not apply when

- The user only wants waste cleanup → `negative-keyword-hygiene.md`.
- The source is competitor Market Intelligence rather than live search terms →
  `keyword-opportunity.md`.
- The user wants to change bids at the same time → finish harvest, then use
  `bid-optimization.md` under a separate confirmation.

## Required inputs

- source campaign or ad-group id;
- explicit start and end dates;
- promoted app and country;
- the intended role of the source;
- destination ad group for each promoted theme;
- user-defined conversion, cost, or value rule when performance drives the classification.

Dates default to today, so always pass them. Do not use a performance label when the user has not
defined its metric and threshold.

## Read before classifying

1. Read the scoped search terms for the explicit window.
2. Read active and paused keywords in the intended destination.
3. Read positive keywords across other plausible owners in the same app and country.
4. Read ad-group and campaign negatives that could block the destination.
5. Normalize text with Unicode normalization, trim, and lowercase for exact comparisons. Preserve
   original spelling for output and writes; do not stem or translate.

## Classify every term

| Category | Rule | Action |
|---|---|---|
| `promote` | Relevant term meets the user's rule, has a clear destination, and has no active Exact owner | Propose a new Exact owner |
| `block` | Plainly irrelevant intent, or a confirmed ownership conflict after the correct owner exists | Propose the narrowest negative |
| `keep_observing` | Relevant but the evidence is not mature enough | No write |
| `already_owned` | An active Exact owner already exists in the market | Show the owner; do not duplicate |
| `ownership_conflict` | Multiple owners or the intended owner is ambiguous | Ask the user to choose; no write |
| `insufficient_evidence` | Scope, metric, destination, or inventory is incomplete | No write |

High spend with no conversion is not enough by itself to call a relevant query irrelevant. Route a
relevant but inefficient term to bid review or keep it under observation.

## Ownership plan

For each `promote` row, show:

- original term and normalized comparison key;
- source campaign and ad group;
- destination ad group and theme;
- current owner, if any;
- evidence, date window, and confidence;
- the Exact keyword addition;
- the source-level Exact negative needed after ownership moves;
- rollback availability;
- `requires_confirmation: true`.

If the destination theme is wrong or unclear, the row cannot be promoted.

## Execute in dependency order

After explicit confirmation:

1. Add the destination keyword with explicit `EXACT` match type.
2. Keep each addition batch at 15 terms or fewer and use a fresh idempotency key.
3. Read scoped destination keywords back and verify every new owner.
4. Only for verified owners, add the narrow source negative required to isolate traffic.
5. Keep negative batches at 15 terms or fewer, use fresh keys, and read negatives back.
6. Report each row as applied, skipped, or failed. A failed keyword add blocks its dependent
   negative.

If the user runs a command, omit `--yes` so the CLI shows its request preview. If the agent runs it,
append `--yes` only after the explicit confirmation.

## Evidence and confidence

- **High:** direct query performance, exact scope, clear destination, and complete inventory.
- **Medium:** query relevance is clear but performance or ownership evidence is incomplete.
- **Low:** destination intent is inferred from names or the sample is thin; no mutation.

## Output

Return all six categories, then the ordered ownership plan, unknowns, and confirmation boundary.
Do not hide rejected or already-owned terms; they prove the inventory comparison happened.

## Example

```text
promote — "pdf scanner app" from Discovery AG-7 to Exact Scanning AG-21. It meets the user's
day-30 value rule, no active Exact owner exists in US, and no destination negative conflicts.
Create the Exact owner first; add an Exact negative to AG-7 only after verification. Confidence:
high. Evidence: E2, E8, E11.
```

## Failure modes

- An unscoped positive inventory read can miss or invent ownership conflicts.
- A paused Exact keyword is not an active owner; show it before creating a duplicate.
- A campaign-level negative is too wide when only one source ad group needs isolation.
- Never add the negative before verifying the destination owner.
- Never combine harvest, bid changes, and CPP changes under one confirmation.
- The current CLI has no dependable negative-keyword rollback; name that risk before adding one.

## Related playbooks

- Dedicated waste cleanup → `negative-keyword-hygiene.md`.
- New keyword bids → `bid-optimization.md`.
- Competitor-derived terms → `keyword-opportunity.md`.
