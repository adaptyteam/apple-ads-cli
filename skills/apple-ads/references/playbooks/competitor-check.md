---
title: Legacy competitor-check redirect
intent: preserve old links while routing every competitor keyword request to keyword-opportunity
kind: procedural
risk: read-only
requires: { cli: ">=0.4.0", subscription: true }
uses: []
time: <1 min
---

# Legacy redirect

This path is retained so existing links do not break. It contains no workflow and must not issue a
CLI call.

Open `keyword-opportunity.md` and follow it as the single source of truth for:

- per-app, per-country Market Intelligence terms;
- SOV interpretation;
- active, paused, and negative inventory comparison;
- opportunity classification;
- the separate keyword-add confirmation boundary.

Do not summarize competitors from this redirect. Do not maintain decision rules in both files.
