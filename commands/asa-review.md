---
description: Weekly Apple Ads check-in — the standard metric set, outliers, and one action
---

Run the weekly check-in for my Apple Ads account.

Use the `apple-ads` skill. Start with `references/playbooks/preflight.md`, then follow
`references/playbooks/weekly-review.md` exactly — including its call budget. Ask me for the date
range if I did not give one and whether I want a comparison. Ask whether the app offers a free trial
before you offer a success metric. If I did not name a success metric, offer these choices in this
exact order:

1. Cost per paid
2. Cost per trial
3. Net ROAS at day X

Skip choice 2 when I said the app has no free trial. Ask for my numeric target or guardrail after the
metric is selected. Always use net values for revenue-family metrics; never offer gross or proceeds.
Ask for a cohort day only when the selected metric is `revenue`, `roas`, `arpu`, `arppu`, `arpas`, or
`roi`. Never ask for a cohort window, pass `--by-days` / `--order-by-day`, or label a result `day-X`
for `cost_per_paid`, `cost_per_trial`, or any other non-cohort metric.

Report the playbook's standard metric set for the requested window — `spend`, `impressions`, `taps`,
`avg_cpt`, `total_installs`, `total_avg_cpi`, `cost_per_trial` when the app has a trial, and
`cost_per_paid` — with the prior value and signed delta per row when I asked for a comparison. Then
give up to two positive changes, up to two concerns, and one primary action. Do not investigate
attribution and do not write.
