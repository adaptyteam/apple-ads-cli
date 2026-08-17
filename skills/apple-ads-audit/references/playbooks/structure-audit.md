---
title: Live account structure audit
intent: user wants a read-only review of live campaign structure, target overlap, and traffic ownership
kind: procedural
risk: read-only
requires: { cli: ">=0.4.0", subscription: true }
uses: [asa campaigns list, asa ad-groups list, asa ads list, asa keywords list, asa negative-keywords list, asa product-pages list, asa creatives list, asa search-terms list]
time: ~20 min
---

# Live account structure audit

Find structural conflicts in an existing account. Do not redesign a future account and do not apply
the fixes.

## Apply when

- The user asks whether Brand, Competitor, Discovery, and Exact traffic are separated correctly.
- Exact keywords may exist in multiple ad groups.
- Broad or Search Match may be taking traffic that should have an Exact owner.
- Cross-negatives, campaign negatives, CPP routing, or budget fragmentation look wrong.

## Do not apply when

- There is no connected account → `apple-ads-strategy`.
- The user only wants performance health → `account-health.md`.
- The user already chose a specific mutation → `apple-ads` and the matching operator playbook.

## Required inputs

- app and optional campaign scope;
- the intended role of each campaign or ad group when names do not establish it;
- the country when the same structure exists across markets;
- optional query theme or entity ids for a focused audit.

Do not infer a role solely from an entity name with high confidence. Ask when the role changes the
recommended owner.

## Build the structure inventory

1. Resolve scoped campaigns and their status, country, budget, and bidding strategy.
2. Resolve child ad groups and their status, default bid, and Search Match or automated-keyword
   setting when returned.
3. Resolve ads and the creative attached to each ad group.
4. Read positive keywords with text, match type, status, campaign, and ad-group ids.
5. Read ad-group and campaign-level negatives separately.
6. Read product pages and creatives only when CPP alignment is part of the question.
7. Read search terms only when observed query ownership is necessary. Pass explicit dates and keep
   the request scoped.

Normalize keyword text with Unicode normalization, trim, and lowercase for equality checks. Keep
the original spelling in the report. Do not stem, translate, or collapse semantically different
phrases.

## Controls

### Role separation

- A campaign or ad group should have one explainable traffic-acquisition role.
- Mixed Brand, Competitor, Discovery, and Exact intent is a finding only when the inventory proves
  the mix or the user confirms the intended roles.

### Exact ownership

- Group active Exact keywords by normalized text and country.
- More than one active Exact target for the same text and market is an ownership conflict unless the
  user supplies a deliberate reason.
- Name every conflicting entity and recommend one owner; do not choose silently when economics or
  intent does not settle it.

### Broad and Search Match isolation

- When a query has an active Exact owner, check whether Discovery/Broad sources can still capture
  it.
- A missing exact negative in the discovery source is a cross-negative gap, not proof that Apple
  actually routed traffic there. Search-term evidence raises confidence.

### Negative safety

- Match campaign-level negatives against all positive keywords below that campaign.
- Report an exact collision directly.
- Treat a Broad negative as high risk when it can cover a valid positive theme; do not claim the
  full affected query set without supporting data.

### Fragmentation and orphans

- Report empty or paused entities and entities with no active child needed to serve.
- Call budget fragmentation only against a user-defined minimum or a demonstrated inability to
  collect data. Entity count alone is not proof.

### CPP alignment

- Compare keyword or search-term intent with the selected creative only when the returned metadata
  or user-provided page description establishes that intent.
- If the CLI does not expose enough page content to judge, mark the control `unknown` and ask for the
  App Store page context. Do not guess from an opaque creative id.

## Finding types

Use these stable labels:

- `duplicate_exact_owner`;
- `missing_cross_negative`;
- `positive_negative_collision`;
- `mixed_intent`;
- `orphan_entity`;
- `budget_fragmentation`;
- `cpp_intent_mismatch`;
- `ownership_unknown`.

Each finding names the normalized target, original text, country, current owners, evidence ids,
confidence, recommended owner, and the reason the recommendation is safe or uncertain.

## Output

1. **Structure summary** — what the live hierarchy currently does.
2. **Confirmed conflicts** — direct duplicate or positive-negative collisions.
3. **Likely gaps** — missing isolation or mixed intent with confidence labels.
4. **Unknowns** — ambiguous roles, missing page context, or unobserved routing.
5. **Ownership map** — query/theme → current owner(s) → recommended owner.
6. **Operator handoff** — proposed changes in dependency order, with no write commands.

## Safe handoff order

When a fix requires moving ownership, recommend this order to `apple-ads`:

1. Create or confirm the destination Exact owner.
2. Verify the owner exists and is active in the intended market.
3. Add the narrow cross-negative to the source.
4. Verify both states.

Never recommend blocking the source first.

## Example

```text
duplicate_exact_owner — "scanner app" is active as Exact in AG-12 and AG-44 for US.
The account has no declared reason for two owners. Recommend the user choose the intent-matched ad
group before any change. Evidence: E8, E11. Confidence: high for the duplicate, low for which owner
should win.
```

## Failure modes

- An unscoped keyword list can create false cross-app duplicates.
- Duplicate text across countries is not automatically a conflict.
- A missing negative is not evidence of misrouting without query data.
- A paused keyword is not an active owner; report it separately.
- Opaque CPP ids do not prove creative mismatch.
- Never include mutation commands in this read-only result.

## Related playbooks

- Broad health and serving → `account-health.md`.
- Move proven search terms → `../../../apple-ads/references/playbooks/search-term-harvesting.md`.
- Add negatives → `../../../apple-ads/references/playbooks/negative-keyword-hygiene.md`.
- Attach a CPP → `../../../apple-ads/references/playbooks/creative-setup.md`.
