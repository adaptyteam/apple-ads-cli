# Account structure — the generic method

Use when no vertical guide covers the category. A vertical guide, where one exists, overrides
everything here.

## The four roles

Apple's canonical structure is four campaigns, and the reason it survives is that each one answers a
different question. Copying the shape without the roles produces four campaigns that compete with
each other.

| Campaign | Question it answers | Budget posture |
|---|---|---|
| **Brand** | are we defending our own name | small, permanent, cheap |
| **Competitor** | can we buy attention from rivals | measured separately; the most likely to lose money |
| **Discovery** | what are people actually typing | **capped source of search terms, not a growth channel** |
| **Exact / scaling** | which proven terms deserve more money | where the budget goes as the account matures |

Discovery is the one people get wrong. It runs broad match and Search Match, so its job is to
produce search terms for harvesting. Give it a fixed, small budget and never scale it — a scaled
Discovery campaign is an account bleeding on autopilot.

## Ad groups

An ad group is a bid and a creative, so split by whatever changes the bid or the creative:

- the **subject** of the search (a brand of device, a task, a use case),
- the **country**, when the auction differs sharply,
- the **match type**, so exact and broad never share a bid.

Do not split for tidiness. Every extra ad group divides the data, and a split that never gets its
own bid or its own creative has only made the account harder to read.

## Launch posture

1. Create everything with `--status PAUSED`.
2. Verify the structure — ids, budgets, bids, creatives.
3. Enable. Nothing spends until this step.

Set `--match-type` deliberately. `keywords add` defaults to `BROAD`, which is the widest and most
expensive targeting available.

## Budget

Split by role, not evenly. Brand needs very little. Discovery needs a cap, not a share. The floor
that matters is per ad group: below the point where an ad group gathers enough installs in a week to
be readable, adding ad groups makes the account less legible, not more.

## Placements

`--supply-source` defaults to `APPSTORE_SEARCH_RESULTS`. Today-tab and product-page-browse
placements exist, but they carry no search intent, so they only make sense once Search Results is
demonstrably profitable. Apple Maps ads are not in this API — they arrive with Platform API v1.
