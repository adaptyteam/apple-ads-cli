---
title: Competitor keyword opportunities
intent: user wants relevant keywords found in Market Intelligence competitor data
kind: procedural
risk: writes-money
requires: { cli: ">=0.4.0", subscription: true }
uses: [asa competitors summary, asa keywords list, asa negative-keywords list, asa keywords add]
time: ~15 min
---

# Competitor keyword opportunities

Find search terms present in Market Intelligence for competing apps, compare them with the live
account, and propose deliberate keyword tests. The source exposes terms and share of voice, not the
competitors' economics.

## Apply when

- The user asks which terms one or more competitors appear on.
- The user wants terms shared by competitors but missing from the account.
- The user wants country-specific keyword opportunities from Market Intelligence.
- A previous "competitor check" request is really asking for keyword ideas.

## Do not apply when

- The user asks for competitor bids, spend, conversions, revenue, or profitability. The source does
  not provide them.
- The user wants category benchmarks → use `apple-ads-benchmarks` when available.
- The user wants ideas without named competitors or App Store ids → use `apple-ads-strategy` keyword
  taxonomy first.

## Required inputs

- one to five competitor App Store ids (`adam_id`), never internal ASA app UUIDs;
- the country or countries to inspect;
- the promoted app and product intent;
- optional destination ad group, match type, and bid only when the user wants to add selected terms.

More than five ids is not a pagination problem. Ask the user to choose five; do not issue multiple
Market Intelligence requests automatically.

## Read Market Intelligence

Run exactly one analytics request:

```text
adapty asa competitors summary --app-ids <comma-separated-adam-ids> --json
```

The endpoint covers the last full month and every country. It has no date or country flags. Select
the requested country from the returned JSON:

- `byApps[].adamId` and `byApps[].name` identify a competitor;
- `byApps[].countries[country][]` contains `{term, sov}` rows;
- `total.mostContestedTerms` contains market-wide contested terms;
- `total.topAppsByPerformance` summarizes competitor coverage.

Do not substitute the human-readable summary for `byApps` when the user asks what a specific app
targets.

## Normalize and compare

1. Apply Unicode normalization, trim outer whitespace, and lowercase for equality checks.
2. Preserve the original term for display and mutation proposals.
3. Do not stem, translate, or merge semantically different phrases.
4. Merge normalized terms across competitors and retain every source app, country, and SOV value.
5. Count the distinct competitors carrying each term.
6. Read scoped active and paused positive keywords.
7. Read scoped ad-group and campaign negatives.
8. Compare exact normalized text; do not guess coverage from a vaguely similar phrase.

## Classify

| Category | Rule |
|---|---|
| `test_exact` | Relevant, specific intent, absent from active inventory, and no unresolved negative conflict |
| `discovery_candidate` | Relevant enough to explore, but intent or destination is not yet specific |
| `already_covered` | Matching active keyword already exists; name its owner |
| `blocked_by_negative` | A matching or clearly covering negative exists; show the conflict before proposing a write |
| `competitor_brand` | The term is another app or company brand; isolate it from generic opportunities |
| `irrelevant` | The product intent plainly does not match |
| `insufficient_context` | Relevance, country, page intent, or ownership cannot be established |

Never create a composite opportunity score. Explain priority with separate signals:

- number of competitors carrying the term;
- per-competitor SOV;
- number of requested countries containing it;
- product relevance;
- current account coverage;
- negative conflicts;
- App Store metadata or CPP alignment when the user supplied that context.

SOV is evidence that a competitor appeared for a term in this dataset. It is not evidence of the
competitor's bid, spend, conversion rate, or profitability.

## Evidence and confidence

- **High:** exact per-app, per-country term plus a direct inventory comparison.
- **Medium:** a contested term is present, but per-app detail or destination intent is incomplete.
- **Low:** relevance depends on inferred product or CPP intent.

If `byApps` is empty but `mostContestedTerms` exists, return a partial market-level list. Do not
attribute those terms to a specific competitor.

## Output

Return:

1. Market Intelligence scope and fixed data period.
2. Competitors and countries actually represented in the response.
3. `test_exact` opportunities with source apps and SOV values.
4. Discovery candidates.
5. Already-covered and paused inventory.
6. Negative conflicts.
7. Rejected or insufficient-context terms.
8. Unknowns and coverage limitations.

## Optional keyword-add handoff

Analysis is complete before any write. For each selected term, resolve and show:

- destination ad group id and theme;
- match type;
- exact bid supplied or approved by the user;
- current inventory state;
- evidence and risk;
- `requires_confirmation: true`.

After explicit confirmation, add no more than 15 keywords per call, use a fresh idempotency key per
batch, and read scoped keywords back. Never add a negative or change a bid inside the same
confirmation.

## Example

```text
test_exact — "photo cleaner": present for Competitor A in US at 38.2 SOV and Competitor B at 21.6
SOV; not found in active or paused US keywords; no exact negative conflict. Relevance is high for
the app's stated cleanup intent. This does not reveal either competitor's bid or profitability.
```

## Failure modes

- Reject non-numeric App Store ids before the request.
- Do not silently batch more than five competitors.
- A country absent from `countries` means no returned data for that country, not zero demand.
- Paused inventory is not missing inventory; report it separately.
- A negative conflict must be resolved before a keyword-add proposal.
- Never claim Market Intelligence data is current beyond the endpoint's last-full-month period.

## Related playbooks

- Add a chosen list directly → use workflow 3 in `SKILL.md` and the keyword-write contract in
  `../asa-management.md`.
- Choose or change its bid → `bid-optimization.md`.
- Route a theme to a page → `creative-setup.md`.
- Design initial taxonomy without competitor ids → `../../../apple-ads-strategy/references/keyword-taxonomy.md`.
