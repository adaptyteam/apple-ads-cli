# Apple Ads CLI improvement ideas

This document records follow-up ideas after the account-health, structure-audit, weekly-check-in,
keyword-opportunity, keyword-bid-review, search-term-harvesting, negative-keyword-mining, and CPP
routing workflows were completed.

It is a backlog, not a runtime reference. Shipped skill behavior remains authoritative in
`skills/`, and CLI syntax remains authoritative in the generated `asa-*` references.

## Guiding direction

The next quality gains should come from deterministic evaluation, complete execution chains, and
safer CLI primitives. Do not add more top-level skills. Keep the current separation:

- `apple-ads-strategy` plans an account before it exists.
- `apple-ads-audit` diagnoses a connected account without writes.
- `apple-ads` operates a connected account and owns confirmed mutations.
- `adapty-cli-setup` installs, authenticates, and connects the CLI.

## P0 — validate behavior, not only Markdown

### Build a workflow evaluation harness

The current linters verify playbook shape and required safety language. They do not prove that an
agent follows those rules on a realistic task.

Create an evaluation harness where every case contains:

- a user request;
- synthetic CLI responses;
- the expected skill and primary playbook;
- allowed CLI calls;
- forbidden CLI calls;
- required findings and confidence labels;
- the expected mutation proposal, when applicable;
- the condition that requires the agent to stop.

Minimum case set:

- one successful case for each of the eight flagship workflows;
- one insufficient-data case for each workflow;
- audit versus operator versus strategy routing conflicts;
- a metric missing from a `metrics overview` response;
- `cost_per_trial` requested for an app with no free trial;
- Market Intelligence response without `byApps`;
- more than five competitor App Store ids;
- an opportunity already present as an active keyword;
- an opportunity present only as a paused keyword;
- a positive-keyword and negative-keyword collision;
- a Broad negative without separate approval;
- a failed Exact-owner creation that must block its dependent cross-negative;
- a new CPP ad that cannot serve;
- entity state changing between proposal and execution.

Acceptance criteria:

- Every prompt routes to exactly one primary playbook.
- Read-only workflows never emit or execute mutations.
- Low-confidence findings never create mutation proposals.
- Dependent writes stop when a prerequisite fails.
- Tests fail when a safety boundary is removed from a workflow.

## P1 — standardize mutation plans

### Introduce one Action Plan contract

All write-capable workflows should produce the same machine-readable proposal shape.

Plan-level fields:

```text
plan_id
created_at
expires_at
source_workflow
company_id
app_id
scope
evidence
preconditions
operations
risk
rollback
requires_confirmation
verification
```

Operation-level fields:

```text
entity_type
entity_id
current_state
proposed_state
reason
idempotency_key
depends_on
```

Acceptance criteria:

- Every mutation points to direct evidence.
- Every dependent operation names its prerequisite.
- A failed prerequisite blocks its dependents.
- The proposal records whether rollback is available.
- The execution result can be compared with the approved proposal field by field.

### Revalidate state before writing

Between analysis and confirmation, a user or automation may change the live account. Before each
write, verify that:

- the target entity still exists;
- status and bid still match the proposal's current state;
- a keyword or negative has not appeared since analysis;
- destination ownership has not changed;
- the selected creative remains available;
- all dependencies are still satisfied.

If state changed, return `state_changed_since_proposal` and build a new plan. Do not apply a stale
plan partially.

### Expire performance-based proposals

- Include `data_through` and an explicit expiry time.
- Require a new read after expiry.
- Treat a metadata-only plan as invalid after the target entity changes.
- Mint idempotency keys for the current confirmed plan, not for an abandoned draft.

## P1 — expand Adapty CLI safety and read surfaces

These changes belong in the Adapty CLI repository first. The generated references in this
repository must be updated only through the existing sync process.

### Negative-keyword rollback

The current surface can list and add negatives but does not expose a dependable rollback. Add a
supported operation such as:

```text
adapty asa negative-keywords update <id> --status PAUSED
```

If the Apple API cannot update status, expose another supported removal or recovery mechanism.

Until then:

- default to Exact negatives;
- require a separate decision for Broad;
- name dashboard repair as the fallback;
- keep automated negative additions conservative.

### Universal dry-run and plan/apply flow

Add consistent support across writes:

```text
--dry-run
--plan
--apply-plan
--json
```

A dry-run should return:

- resolved target;
- request body;
- current and proposed state;
- precondition failures;
- operation count;
- rollback availability;
- plan hash.

### Account snapshot

Add one read optimized for audits:

```text
adapty asa snapshot --app <id>
```

Suggested response:

- campaign, ad-group, and ad hierarchy;
- positive keywords;
- negatives with their scope;
- product pages and creatives;
- entity status and serving reasons;
- parent relationships;
- current bids and budgets;
- snapshot timestamp and data-through metadata.

This reduces unscoped reads, rate-limit pressure, and incorrect joins between entities.

### Dedicated Market Intelligence keyword command

The current workflow correctly reads the full JSON returned by `asa competitors summary`, but the
command name hides the per-app term inventory. Consider a dedicated interface:

```text
adapty asa competitors keywords \
  --app-ids 111,222 \
  --country US \
  --exclude-existing \
  --page-size 1000
```

Suggested response fields:

- term;
- competitor app;
- country;
- SOV;
- competitor count;
- existing keyword status;
- negative conflict.

Keep semantic relevance and product intent in the skill. Move deterministic normalization,
country filtering, deduplication, and inventory joins into the CLI or server.

### Change history

Add a read-only command such as:

```text
adapty asa changes list
```

Suggested fields:

- actor;
- timestamp;
- source: dashboard, CLI, automation, or API;
- entity and entity id;
- before and after state;
- plan id;
- idempotency key.

This would let weekly reports explain a supported sequence of events instead of treating timing as
causation.

## P2 — improve data coverage and product-page context

### Richer CPP metadata

Expose enough information to route intent without guessing from opaque ids:

- page name;
- locale;
- approval status;
- storefront availability;
- deep link;
- short description or message tags;
- screenshot or asset tags;
- current creative id;
- ads currently using the page.

### Analytics coverage metadata

Include in metrics responses:

- `data_through`;
- account timezone;
- attribution and event definitions;
- cohort maturity;
- returned row count;
- total row count;
- filters actually applied;
- response generation timestamp.

This lets the agent distinguish a real zero from incomplete data, a partial page, or an immature
cohort.

### Consistent skill UI metadata

If Codex and other OpenAI skill surfaces are a distribution target, add consistent
`agents/openai.yaml` metadata for all top-level skills at once:

- display name;
- short description;
- default prompt;
- consistent operator, auditor, planner, and setup terminology.

Do not add metadata only to one skill and leave the rest inconsistent.

### Retire the competitor-check redirect later

`competitor-check.md` is currently a compatibility redirect with no decision logic or CLI calls.
Remove it only in a breaking release after:

- all internal routing points directly to `keyword-opportunity.md`;
- documentation and examples no longer link to the old path;
- routing evaluations pass without the redirect.

## Deliberate non-goals

Do not add these until a concrete product need changes the decision:

- more top-level skills;
- a Maximize readiness workflow;
- any comparison between Apple install counts and Adapty install counts;
- deep attribution reconciliation;
- a universal account health score;
- universal CPA, ROAS, or bid-change percentages;
- an LLM-generated composite keyword-opportunity score;
- one shortcut for every small operation.

## Recommended implementation order

1. Build the workflow evaluation harness.
2. Complete keyword load.
3. Introduce the Action Plan contract and stale-state checks.
4. Complete budget reallocation.
5. Complete campaign launch.
6. Complete automation rules.
7. Plan and implement the Adapty CLI changes: negative rollback, universal dry-run, account
   snapshot, dedicated Market Intelligence keywords, and change history.
