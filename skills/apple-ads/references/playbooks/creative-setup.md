---
title: Route keyword intent to a custom product page
intent: user wants to choose an existing CPP for an intent and create the corresponding ad safely
kind: procedural
risk: writes-money
requires: { cli: ">=0.4.0", subscription: true }
uses: [asa product-pages sync, asa product-pages list, asa creatives list, asa ads list, asa ads get, asa ads create, asa ads update]
time: ~20 min
---

# CPP routing

Match one clear keyword or search-term intent to an existing Custom Product Page, then create and
verify the ad that uses it. The CLI selects existing pages; it does not author or edit them.

## Apply when

- The user wants to choose a CPP for a keyword theme or ad group.
- An existing ad appears misaligned with search intent.
- The user wants a new ad created from an approved product-page creative.

## Do not apply when

- The user needs to create or edit a CPP in App Store Connect.
- Product intent is unknown and cannot be established from user context or returned metadata.
- The task is only diagnosing why an ad does not serve → use the dead-ad workflow in `SKILL.md`.

## Required inputs

- app and country;
- destination ad-group id and declared theme;
- keyword or search-term intent;
- available CPP descriptions or App Store context when CLI metadata is not descriptive enough;
- the old ad id when the user wants a replacement.

An opaque creative id is not evidence that a page matches an intent. Ask for page context when the
returned catalog cannot establish the match.

## Read before writing

1. Read product pages scoped to the app.
2. If the catalog is empty or the user says it is stale, propose a product-page sync. Sync is a
   queued write and requires its own confirmation and idempotency key.
3. After a confirmed sync, wait for or verify the resulting catalog rather than assuming completion.
4. Read creatives scoped to the app and map the selected page to its creative id.
5. Read existing ads in the destination ad group.
6. Read a current ad with `ads get` when serving state or replacement safety matters.

## Routing decision

Compare:

- query job or feature intent;
- the ad-group theme;
- CPP message and first-screen promise, when available;
- locale and country, when returned or provided;
- approval and availability state, when returned;
- current ad coverage.

Classify the result:

- `matched` — one existing CPP clearly expresses the same intent;
- `ambiguous` — multiple pages fit and the user must choose;
- `missing_page` — no existing page represents the intent;
- `metadata_insufficient` — the catalog does not expose enough content to judge;
- `current_ad_mismatch` — current creative conflicts with established intent.

Do not create a numeric creative score.

## Proposal

Before any write, show:

- intent and supporting terms;
- destination ad group id and theme;
- selected product page and creative id;
- current ads;
- proposed new ad name;
- why the page matches;
- evidence, confidence, risk, and unknowns;
- whether an old ad may later be paused;
- `requires_confirmation: true`.

If no approved matching CPP exists, stop and tell the user to create or approve it in App Store
Connect. Do not fall back to a weak page merely to finish the workflow.

## Execute and verify

1. Obtain confirmation for the new ad only.
2. Create it with a fresh idempotency key. An ad's creative and parent ad group are fixed at
   creation; never try to replace the creative with `ads update`.
3. Read the new ad and inspect status and `serving_state_reasons`.
4. Report whether the new ad exists and can serve.
5. If the user wants the old ad paused, show that as a second mutation with a new idempotency key and
   obtain a separate confirmation.
6. Read both ads back and report the final state.

Never pause the old ad before the new one is verified.

## Output

Return the intent map, candidate pages, selected route, rejected alternatives, mutation proposal,
verification result, and remaining unknowns.

## Example

```text
matched — the "remove duplicate photos" theme maps to CPP-14 because its supplied first-screen
message addresses duplicate cleanup directly. Create a new ad in AG-22 with creative CR-14. Keep
the current ad active until the new ad is created and its serving state is verified. Confidence:
high from user-supplied page context and catalog ids.
```

## Failure modes

- Product-page sync is a write; do not run it as a harmless read.
- A queued sync is not a completed catalog refresh.
- An ad creative cannot be changed with `ads update`.
- Missing page content makes intent matching unknown.
- Never create the new ad and pause the old one under one confirmation.
- Never claim the CLI can edit CPP content.

## Related playbooks

- Find keyword themes from competitors → `keyword-opportunity.md`.
- Harvest live query themes → `search-term-harvesting.md`.
- Audit existing CPP alignment → `../../../apple-ads-audit/references/playbooks/structure-audit.md`.
