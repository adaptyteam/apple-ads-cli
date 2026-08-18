---
description: Weekly Apple Ads check-in — direction, install comparison, outliers, and one action
---

Run the weekly check-in for my Apple Ads account.

Use the `apple-ads` skill. Start with `references/playbooks/preflight.md`, then follow
`references/playbooks/weekly-review.md` exactly — including its call budget. Ask me for the date
range if I did not give one and whether I want a comparison. If I did not name a success metric,
offer these choices in this exact order:

1. Cost per paid
2. Cost per trial
3. Net ROAS at day X

Ask for my numeric target or guardrail after the metric is selected. Always use net values for
revenue-family metrics; never offer gross or proceeds. Ask for a cohort day only when the selected
metric is `revenue`, `roas`, `arpu`, `arppu`, `arpas`, or `roi`. Never ask for a cohort window, pass
`--by-days` / `--order-by-day`, or label a result `day-X` for `cost_per_paid`, `cost_per_trial`, or
any other non-cohort metric. Include the same-window Apple total installs versus Adapty installs
comparison, up to two positive changes, up to two concerns, and one primary action. Do not
investigate attribution and do not write.
