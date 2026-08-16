# Prompt gallery

Real requests, and which skill answers them.

## Needs nothing installed — `apple-ads-strategy`

```
I'm launching a universal TV remote app. Build me a campaign structure and a starting negative list.
What keywords should a VPN app bid on, and which ones will waste money?
Does Apple Search Ads even make sense for a $2.99/week utility app?
Structure an account for a language-learning app selling annual subscriptions in the US and Germany.
```

## Needs the CLI and an account — `apple-ads`

### Analysis

```
Which of my ad groups lost money last month at day-30 cohort ROAS?
How did last week compare to the week before?
Show me the 20 worst keywords by day-30 gross ROAS.
How many active campaigns do I have?
Why isn't this ad running?
```

### Action

```
Harvest last week's search terms into exact keywords and negatives — show me the plan first.
My CPI is 3x target on the Discovery campaign. Find the leak and stop it.
Move 30% of the Generic campaign budget to the campaign with the best day-30 ROAS.
Set up a rule that pauses any keyword spending over $50 with no conversion, and dry-run it first.
```

## What a good answer looks like

For "which keywords lost money last month", a correct answer:

1. runs preflight,
2. asks which cohort window matches the subscription period before ranking anything,
3. answers in **one** metrics call, sorted server-side,
4. splits the result into pays-back / does-not / not-enough-data,
5. recommends an action and its playbook — and does not execute it.

An answer that paginates and sums, invents a "good ROAS" threshold, or silently pauses keywords is
wrong even when the numbers happen to be right.
