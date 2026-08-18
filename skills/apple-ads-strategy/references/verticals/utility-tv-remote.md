---
title: Universal TV Remote — launch and scale Apple Search Ads
intent: user wants to launch or fix Apple Search Ads for a universal TV remote / device-control app
kind: vertical
risk: read-only
requires:
  cli: ">=0.4.0"
  subscription: false
uses: []
benchmarks: utilities
updated: 2026-08-16
---

# Universal TV Remote — Apple Search Ads playbook

**Thesis.** This vertical combines some of the highest intent with some of the cheapest targeting
mistakes in the App Store. A person searches for a remote because the physical remote is missing
right now and may buy within two minutes. But "remote" also means remote work, remote desktop, and a
garage-door remote, and those three meanings can waste more budget than every other targeting error
combined.

---

## 0. When this playbook does not apply

- The app has no subscription or uses a one-time purchase; all economics below are based on cohort
  revenue.
- The app controls one brand and ships with that manufacturer's hardware; manufacturer-owned brand
  traffic behaves differently from competition for generic queries.
- The app is not live in the store or has not passed review; Apple Ads cannot advertise an
  unpublished listing.
- The budget is below the level at which a Discovery campaign can collect useful data within one
  week; see §5.

---

## 1. Demand profile

| Property | Value | Advertising implication |
|---|---|---|
| Intent | Urgent, immediate task resolution | The conversion window is measured in minutes. Use a short trial and an early paywall; there is no research journey |
| Seasonality | Peaks in late December and early January, Black Friday, major sporting events, and summer travel when people use hotel and rental TVs | Plan budget in bursts rather than as a flat line. Bids rise across the market during peaks |
| Query depth | One or two words, often including a TV brand | Exact-match hardware-brand queries are the primary bucket, not a supporting one |
| Redownload share | High: users delete the app after solving the problem and reinstall it months later | `total_installs` systematically overstates acquisition. Evaluate `total_new_downloads` and `tap_new_downloads` |
| Geography | Global demand with sharply different purchasing power | Start with Tier 1. Add Tier 2 and Tier 3 only after the Tier-1 cohort economics work |

This is a **rare utility category where intent is expressed through somebody else's product brand**.
The user searches for "Samsung TV remote," not simply "remote." That fact determines the account
structure in §4.

---

## 2. Unit economics: what must work

```text
allowable CPI = ARPU at day N × (install → paid rate) × risk buffer
```

All three factors work against this vertical: prices are low, subscriptions are often weekly, and
users churn quickly after solving the immediate problem. Most cohort revenue therefore arrives in
the first few weeks, so scaling decisions use a short horizon.

| Input | Source | Value |
|---|---|---|
| Day-7 and day-30 net ARPU | Adapty cohorts, `--by-days 7,30` | Read from the app's own cohorts; unknown before data exists |
| Install → trial | First-party analytics | Read from the app's own funnel for the same acquisition window |
| Trial → paid | First-party analytics or Utilities benchmarks | Prefer the app's own mature cohort; otherwise keep the input unknown |
| Redownload share | `total_redownloads / total_installs` | Calculate from first-party day-7 data |
| Allowable CPT | Derived from the rows above | Calculate it; never guess |

> **Practical consequence.** A long-LTV category can tolerate negative ROAS for a month. This
> category cannot. If a cohort has not converged by day 30, it is unlikely to recover. Use a 30-day
> decision horizon, not 180 days.

---

## 3. Keyword taxonomy

| Bucket | Role | Seed examples | Expectation |
|---|---|---|---|
| **Hardware brand** (primary) | Highest intent | `samsung tv remote`, `lg tv remote`, `roku remote`, `vizio remote`, `sony bravia remote`, `fire tv remote`, `tcl remote`, `hisense remote` | Best CR and ROAS in the vertical; allocate the largest share of budget here |
| **Generic** | Volume | `tv remote`, `universal remote`, `remote control`, `remote for tv` | Expensive and lower-converting, but no other bucket replaces its volume |
| **Function or task** | Adjacent intent | `screen mirroring`, `cast to tv`, `phone as tv remote`, `tv controller app` | Often undervalued: cheaper than brand traffic with nearly the same intent |
| **Own brand** | Defense | App name and common misspellings | Cheap and mandatory; otherwise a competitor can capture searches for your name |
| **Competitor brand** | Interception | Competing app names | Moderate CR and expensive CPT; evaluate profitability separately |
| **Misspellings and long tail** | Low-cost volume | `samsng tv remote`, `remote for samsung smart tv 2020` | Low volume, but often materially cheaper CPT |

**Splitting by hardware brand is the main optimization lever, not cosmetic structure.** CR and CPT
for `samsung tv remote` and `roku remote` can differ enough that one averaged bid loses money on both.
A dedicated custom product page (CPP) per brand is also possible (§6), which is the strongest
conversion multiplier in this vertical.

---

## 4. Account structure

| Campaign | Type | Ad groups | Keywords | Role |
|---|---|---|---|---|
| `Brand` | Search Results | 1 | Own brand and misspellings, exact | Defend the app name |
| `Device brands` | Search Results | **One per TV brand** | Hardware-brand queries, exact | Primary driver; use a separate bid and CPP for each brand |
| `Generic` | Search Results | Split by intent (`remote`, `universal`, `control`) | Exact | Volume with a hard bid ceiling |
| `Function` | Search Results | Split by task (`mirroring`, `cast`) | Exact | Undervalued adjacent bucket |
| `Competitors` | Search Results | 1–2 | Competing app names, exact | Interception; evaluate separately |
| `Discovery` | Search Results | Broad + Search Match | — | **Search-term source only**, not an acquisition channel |

Today Tab usually does not pay back in this vertical: it has no explicit intent, while allowable CPI
is too low to buy broad reach. Test it only after Search Results is profitable.

**Discovery is a sensor, not a growth campaign.** Its job is to produce search terms for harvesting,
not installs. Keep the budget at the smallest meaningful level, apply aggressive negatives, and move
every useful query into an exact-match campaign. Without this rule, the multiple meanings of
"remote" consume budget faster than the reporting loop can react.

---

## 5. Starting bids and budget

> The ranges below are calibration hypotheses, not benchmarks.

| Bucket | Starting bid | Ceiling | Review cadence |
|---|---|---|---|
| Own brand | Lowest bid that preserves delivery | Below every non-brand ceiling | Monthly |
| Hardware brand | Start below the derived allowable CPT | Allowable CPT | Every 3–4 days during the first two weeks |
| Generic | Discount from the hardware-brand starting bid | Below the hardware-brand ceiling | Weekly |
| Function | Start between own-brand and hardware-brand bids | Allowable CPT | Weekly |
| Competitors | Conservative test bid | Ceiling derived from measured net value | Weekly |
| Discovery | Minimum | Minimum | Never scale |

The minimum daily budget must let each ad group collect a statistically meaningful number of installs
within seven days. If the budget supports only one bucket, start with hardware brands rather than
generic terms; they validate the economics at lower cost.

---

## 6. Creatives and custom product pages

The strongest non-obvious lever is a **dedicated CPP for each TV brand**. A user searching
`samsung tv remote` should see a Samsung-like remote interface in the first screenshot. Matching the
creative to the expectation can improve conversion more than bid optimization.

- Show the remote UI in the first two screenshots, not a marketing collage. Recognition should take
  less than a second.
- Make the supported-brand list visible without scrolling.
- ⚠️ Create CPPs in App Store Connect. The API can only select an existing page by `productPageId`;
  it cannot create one.
- ⚠️ CPP text and graphics containing third-party trademarks are a legal-risk area; see §11.

---

## 7. Starting negatives

This list is essential because "remote" is highly ambiguous. Without these negatives, Discovery
starts buying unrelated intent on day one.

| Negative | Reason |
|---|---|
| `remote work`, `remote job`, `work from home` | Different audience, high volume, effectively no conversion |
| `remote desktop`, `remote access`, `rdp`, `vnc`, `teamviewer` | The second-largest irrelevant cluster |
| `car remote`, `key fob`, `garage remote`, `gate remote` | Different device type |
| `drone remote`, `rc car` | Different device type |
| `ac remote`, `air conditioner` | Exclude only when air conditioners are unsupported |
| `free`, `free download` | Use when monetization is a paid subscription with no free tier |
| TV brands the app does **not** support | The install may happen, but the user will churn and produce no value |

The last row is commonly missed. An install from an unsupported-TV owner costs the same as a
supported one and is worth zero.

---

## 8. Launch sequence

Execution commands live in the procedural playbooks; this section defines only the order.

1. Verify the connection and permissions → `playbooks/preflight.md`
2. Create the campaigns and ad groups from §4 → `apple-ads` skill, workflow 3
3. Load the keywords from §3 and negatives from §7 → `apple-ads` skill, workflow 3
4. Attach CPPs to hardware-brand ad groups → `playbooks/creative-setup.md`
5. Configure overspend and zero-conversion stop rules → `apple-ads` skill, workflow 9
6. Day 3: harvest Discovery search terms → `playbooks/search-term-harvesting.md`
7. Day 7: run the first cohort review → `playbooks/cohort-roas.md`

---

## 9. Success criteria

| Horizon | Measure | Continue | Cut or fix |
|---|---|---|---|
| Day 3 | Share of irrelevant Discovery search terms | Falls after harvesting | Remains high: fix negatives, not bids |
| Day 7 | `tap_install_cpi` for hardware-brand ad groups versus allowable CPT; `trials_started` | CPI remains inside the hypothesis | CPI exceeds the user's allowable CPT with enough volume to support the comparison |
| Day 30 | Cohort ROAS (`net_roas`, `--by-days 30`) by bucket | At or above target | Below target: do not scale the bucket; more time is unlikely to fix it |
| Day 90 | Cohort stability and renewal share | Confirms the day-30 conclusion | Diverges: investigate retention rather than acquisition |

---

## 10. Common failure modes

| Failure | Signal | Corrective action |
|---|---|---|
| Irrelevant meanings of "remote" | High impressions and taps, low install rate, almost no trial conversion | Apply the §7 negatives before launch |
| Redownloads counted as growth | `total_installs` rises while `total_new_downloads` is flat | Evaluate new downloads only; a redownload is not acquisition |
| One averaged bid across all TV brands | Some brands receive no impressions while others overpay | Use a separate ad group and bid for each brand |
| Discovery scaled as a channel | Spend rises while ROAS falls | Treat Discovery as a sensor and keep a fixed budget ceiling |
| Cohort decision made on day 7 | A weekly subscription has not renewed yet | Make the scaling decision on day 30 |
| Seasonal peak omitted from planning | Market bids rise, impressions fall, and reporting looks like degradation | Plan peaks in advance and compare with the same period last year |
| Unsupported models | Normal CPI followed by a first-day retention collapse | Add brand negatives and show the supported list in the CPP |

---

## 11. Legal risks

⚠️ **Get legal review before launch; this is not a marketing-only decision.**

The vertical depends on third-party trademarks such as `samsung`, `lg`, `roku`, `sony`, and
`vizio`. Bidding on those queries in Apple Search Ads is technically possible and widely practiced,
but the material risks lie elsewhere:

- **A rights-holder complaint.** Apple has a process for trademark complaints, and the consequences
  can affect the app listing rather than only the ad campaign.
- **Metadata and creatives.** Using another company's marks in the app name, subtitle, or CPP copy is
  materially riskier than bidding on a keyword and can cause review rejection.

A common pattern is compatibility wording such as "works with ... TVs" rather than implying brand
ownership. Legal counsel and the applicable jurisdiction determine the boundary, not this playbook.

---

## 12. What to measure in Adapty

Apple metrics alone are insufficient. `avg_cpt` and `total_avg_cpi` cannot distinguish a user who
renews a weekly subscription four times from one who cancels on day two. In a weekly-subscription
utility, that difference determines profit.

- `metrics --entity keyword --order-by net_roas --by-days 7,30` — profitability at keyword level,
  not only campaign level. The §4 structure exists to make this cut useful.
- `trials_started` and `trials_converted` by ad group — identify whether the funnel breaks before
  installation or before payment.
- `total_new_downloads` versus `total_redownloads` — true acquisition versus returning users.
- `metrics overview` grouped by week — seasonality and peak effects.

> Query discipline: metrics allow five calls per minute and no more than two per ten seconds.
> A weekly review should fit into three or four calls. See the metrics reference for details.
