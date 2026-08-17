---
title: Negative keyword mining
intent: user wants to find irrelevant or misowned search terms and add the narrowest safe negatives
kind: procedural
risk: writes-money
requires: { cli: ">=0.4.0", subscription: true }
uses: [asa search-terms list, asa keywords list, asa negative-keywords list, asa negative-keywords add]
time: ~20 min
---

# Negative keyword mining

Remove traffic that cannot produce value while protecting relevant queries and deliberate Exact
owners. Poor economics is a reason to investigate; it is not automatically a reason to negate.

## Apply when

- The user wants wasteful or irrelevant live search terms identified.
- A Discovery or Broad source needs query isolation.
- Existing negatives may collide with positive keywords.

## Do not apply when

- The primary goal is promoting useful terms → `search-term-harvesting.md`.
- A relevant keyword merely needs a lower bid → `bid-optimization.md`.
- The user asks for a starter negative list before launch → `apple-ads-strategy`.

## Required inputs

- source campaign or ad-group scope;
- explicit search-term date window;
- app, country, and product intent;
- user-defined waste rule when performance is part of the decision;
- desired negative scope when more than one level is plausible.

## Read plan

1. Read scoped search terms for the explicit window.
2. Read active and paused positive keywords for the same app and country.
3. Read existing ad-group and campaign negatives.
4. Normalize text for comparison with Unicode normalization, trim, and lowercase. Preserve original
   text and do not stem or translate.
5. Map each candidate to positive owners and every existing negative that may cover it.

## Classify before proposing a negative

| Category | Meaning | Default action |
|---|---|---|
| `irrelevant_intent` | The query is for a different product, job, or meaning | Exact negative proposal |
| `inefficient_but_relevant` | Intent fits, but observed economics miss the user's rule | Bid review or observation; no negative by default |
| `insufficient_data` | The sample or value window cannot support a decision | No write |
| `wrong_owner` | The query belongs to a different confirmed Exact owner | Cross-negative proposal after owner verification |
| `positive_collision` | A proposed or existing negative conflicts with valid positive inventory | Block the proposal and show the conflict |
| `unsafe_broad` | Broad coverage cannot be bounded confidently | Exact alternative or no write |

Only `irrelevant_intent` and a verified `wrong_owner` are eligible for a mutation proposal. Spend
with no conversion does not prove irrelevance.

## Scope and match type

- Default to `EXACT`.
- Use the narrowest ad-group scope that solves the observed problem.
- Campaign-level negatives require evidence that the query is unwanted across every child ad group.
- `BROAD` requires a separate, explicit confirmation that names the broader intent being blocked and
  the positive themes checked for collisions.
- Never treat `--all-ad-groups` as a convenience flag; it widens the decision.

## Proposal

Show every candidate before writing:

- term and classification;
- source and proposed scope;
- match type;
- direct evidence and confidence;
- positive-owner and existing-negative checks;
- expected effect;
- rollback availability;
- `requires_confirmation: true`.

State plainly that the current CLI can list and add negatives but does not expose a dependable
negative-keyword update or delete path. A wrong addition may require dashboard repair.

## Execute and verify

1. Obtain explicit confirmation for the exact terms, scope, and match type.
2. Keep each call at 15 terms or fewer.
3. Use a fresh idempotency key per batch.
4. Omit `--yes` from commands handed to the user.
5. Read negatives back in the same scope.
6. Report applied, skipped, rejected, and unverifiable rows separately.

For ownership moves, verify the destination Exact owner before adding the source negative. Never
reverse that dependency.

## Output

Return all six categories, a collision report, the mutation proposal, unknowns, and the verification
result. Keep relevant but inefficient queries visible so the user can send them to bid review.

## Example

```text
irrelevant_intent — "remote desktop jobs" in TV Remote Discovery. The query describes employment,
not a TV-control task. Propose an ad-group Exact negative. No matching positive keyword exists.
Rollback is unavailable through the current CLI. Confidence: high. Evidence: E4, E9.
```

## Failure modes

- Never use bad CPA alone as proof of irrelevant intent.
- A Broad negative can cover valid variants that never appeared in the sample.
- A campaign-level negative can block a valid child ad group.
- Missing positive inventory makes collision safety unknown; do not write.
- A failed or ambiguous add is not a reason to rerun with a fresh key blindly.
- Never promise CLI rollback for a negative keyword.

## Related playbooks

- Promote and isolate a useful term → `search-term-harvesting.md`.
- Reduce a relevant term's bid → `bid-optimization.md`.
- Audit cross-negative architecture → `../../../apple-ads-audit/references/playbooks/structure-audit.md`.
