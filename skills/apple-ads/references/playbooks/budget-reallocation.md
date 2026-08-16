---
title: Budget reallocation
intent: user wants to move money between campaigns
kind: procedural
risk: writes-money
requires: { cli: ">=0.4.0", subscription: true }
uses: [asa metrics, asa campaigns list, asa campaigns update]
time: TODO
---

# Budget reallocation

> **Stub.** The contract above is real and the linter checks it; the body is not written yet.
> Until it is, follow `SKILL.md` — its numbered workflows cover the command shapes — and treat
> the checklist below as the outline to fill in.

## To write

- [ ] When this playbook applies, and when it does not
- [ ] The minimum number of reads that answer the question
- [ ] How the decision is made, and which parts are the user's call rather than yours
- [ ] What to show before writing, and what an explicit confirmation looks like here
- [ ] The write commands, batching and `--idempotency-key` discipline
- [ ] How to verify it landed
- [ ] The failure modes specific to this job

## Rules that already apply

- Every write is previewed and confirmed. `--yes` only on a command you run yourself.
- 15 keywords per call; a fresh idempotency key per call.
- Metrics: 5 calls/min, at most 2 per 10s. Plan the whole answer inside that.
- No delete exists. `--status PAUSED` is the only stop.
