---
title: <Category> — launch and scale Apple Search Ads
intent: user wants to launch or fix Apple Search Ads for a <category> app
kind: vertical
risk: read-only            # planning only; execution steps link to procedural playbooks
requires:
  cli: ">=0.4.0"           # only for the execution section
  subscription: false      # planning works with no Adapty account
uses: []                   # a vertical guide calls no commands itself — it links to playbooks
benchmarks: <app-store-category>   # key into subscription-benchmarks, if that skill is installed
updated: YYYY-MM-DD
---

<!--
HOW TO USE THIS TEMPLATE

Every section below is mandatory. A section you cannot fill is a section you mark
`> TODO(owner): <what is missing>` — never one you delete. Missing sections are
what make a guide library feel unreliable.

Every number is either (a) sourced and linked, (b) marked as a range to calibrate,
or (c) marked TODO. Never write a confident number you cannot source: a made-up
CPT benchmark is worse than no benchmark, because the agent will act on it.

Slots to fill are marked `[fill in]`.
-->

# [Category] — Apple Search Ads playbook

**One-line thesis.** [Explain in one sentence what makes this vertical different from every other
vertical. If that is not possible, it should not be a separate vertical.]

---

## 0. When this playbook does not apply

[Define the boundaries. Examples: not for apps without subscriptions; not below budget X; not before
the app has passed store review.]

A reader should recognize that the guide applies to them or leave within thirty seconds.

---

## 1. Demand profile

| Property | Value | Advertising implication |
|---|---|---|
| Intent | [Impulse / urgent task / research] | [Effect on trial length and whether Today Tab can work] |
| Seasonality | [Peaks and troughs tied to events] | [When to raise or reduce budget] |
| Query depth | [One-word queries or longer phrases] | [Importance of broad versus exact match] |
| Redownload share | [Low / high] | [Whether redownloads distort CPI and new downloads should be used] |
| Geographic concentration | [Tier 1 / global] | [Where to launch first] |

---

## 2. Unit economics: what must add up

State the formula that makes this vertical economically viable:

```text
allowable CPI = ARPU at day N × install-to-paid conversion × risk buffer
```

| Input | Source | Value |
|---|---|---|
| Day-30/90/180 ARPU | Adapty cohorts | [Range or TODO] |
| Install → trial | First-party analytics | [Fill in] |
| Trial → paid | Category benchmarks | [Link to subscription benchmarks or TODO] |
| Allowable CPT | Derived from the rows above | [Fill in] |

> **Calibration.** Treat every value above as a starting hypothesis. Recalculate it from first-party
> data after seven days: `references/playbooks/cohort-roas.md`.

---

## 3. Keyword taxonomy

Define six buckets, each with its own role, bid ceiling, and success criterion.

| Bucket | Role | Seed examples | Expectation |
|---|---|---|---|
| Own brand | Defense | [Fill in] | High CR, low CPT |
| Competitor | Interception | [Fill in] | Moderate CR, high CPT |
| Generic / category | Volume | [Fill in] | Low CR, expensive |
| Feature / job to be done | Intent | [Fill in] | Best ROAS |
| Long tail / misspelling | Low-cost volume | [Fill in] | Low traffic, inexpensive |
| Third-party brand, not a competitor | [Depends on vertical] | [Fill in] | ⚠️ See the risk section |

---

## 4. Account structure

Explain which Apple campaign types to use and why they fit this vertical:

| Campaign | Type | Ad groups | Keywords | Starting budget |
|---|---|---|---|---|
| `Brand` | Search Results | [Fill in] | Brand exact | [Share of total] |
| `Competitor` | Search Results | [Fill in] | Competitor exact | [Fill in] |
| `Discovery` | Search Results | Broad + Search Match | — | [Fill in] |
| `Exact / scaling` | Search Results | Split by theme | Harvested exact | [Fill in] |
| `Today Tab` *(when applicable)* | Today Tab | — | — | [Fill in] |

Define the ad-group split for this vertical: by device, brand, task, or another meaningful dimension.

---

## 5. Starting bids and budget

> These are calibration ranges, not benchmarks. Actual values depend on geography, seasonality, and
> competition during the specific week.

| Bucket | Starting bid | Ceiling | Review rule |
|---|---|---|---|
| [Fill in] | [Range or TODO] | [Fill in] | [After how many days and based on which signal] |

Minimum budget below which the campaign cannot collect enough data: [Fill in]

---

## 6. Creative and custom product pages

- Which CPPs make sense for this vertical and which keyword buckets should use them: [Fill in]
- What the first two screenshots should show: [Fill in]
- ⚠️ CPPs are created in App Store Connect. The API can only select one by `productPageId`.

---

## 7. Starter negative keywords

List the negatives that save money from day one and explain every entry.

| Negative | Reason |
|---|---|
| `free` | [Use when monetization is a paid subscription with no free tier] |
| [Fill in] | [Fill in] |

---

## 8. Launch sequence

Provide ordered steps that link to procedural playbooks. Commands belong in those playbooks, not in
this guide; that is the only way to avoid duplicating CLI syntax across many vertical guides.

1. Verify the connection and access → `playbooks/preflight.md`
2. Create the campaign structure → `playbooks/campaign-launch.md`
3. Load starting keywords and negatives → `playbooks/keyword-load.md`
4. Configure automation rules → `playbooks/automation-rules.md`
5. Run the first review after seven days → `playbooks/weekly-review.md`

---

## 9. Success criteria

| Horizon | Measure | Continue threshold | Cut threshold |
|---|---|---|---|
| Day 7 | [Fill in] | [Fill in] | [Fill in] |
| Day 30 | Cohort ROAS | [Fill in] | [Fill in] |
| Day 90 | [Fill in] | [Fill in] | [Fill in] |

---

## 10. Failure modes of this vertical

List the category-specific ways to waste budget. Give each one an observable signal and a corrective
action.

| Failure | Signal | Corrective action |
|---|---|---|
| [Fill in] | [Fill in] | [Fill in] |

---

## 11. Legal and policy risks

[Include this section only when the vertical carries specific risks. If it does not, write
"No category-specific risks" rather than deleting the section.]

---

## 12. What to measure in Adapty

[Identify the cohort metrics that answer whether advertising works in this vertical, and explain why
standard Apple metrics are insufficient.]

---

<!-- Pre-merge checklist:
[ ] Frontmatter is complete; uses is empty or every command exists in the CLI reference
[ ] Every number has a source, a calibration range, or a TODO
[ ] Section 0 defines when the playbook does not apply
[ ] Launch steps link to playbooks instead of duplicating commands
[ ] The updated date is set
-->
