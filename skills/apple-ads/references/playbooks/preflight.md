---
title: Preflight — can this session run anything
intent: verify the CLI, the token, the Apple link and the subscription before any other work
kind: procedural
risk: read-only
requires: { cli: ">=0.4.0", subscription: false }
uses: [asa whoami, asa orgs list, asa apps list]
time: ~1 min
---

# Preflight

Run before every other playbook. In Cowork and any cloud session this is not optional: the machine
is clean, nothing carries over, and skipping it turns a missing CLI into ten confusing errors.

## Steps

1. `adapty asa whoami` — company, how access was granted, Apple connection state.
2. If Apple is not active → `adapty asa connect` (`--no-wait` when someone else authorizes).
3. `adapty asa orgs list` → `internal_id` is what `--org` takes on `campaigns create`; the numeric
   `org_id` is rejected there.
4. `adapty asa apps list` → `--adam-id` for `campaigns create`, and the app UUID for `--app` filters.

Stop after step 1 if it fails. Steps 3–4 only matter when something will be created.

## Reading the result

| Result | Meaning | Next |
|---|---|---|
| Company + `Apple Credentials Status: active` | Ready | Continue to the playbook you came for |
| `adapty: command not found` / auth error | Not set up | `adapty-cli-setup` skill. Do not improvise an install |
| `402 ads_manager_subscription_required` | Authenticated; no Ads Manager subscription | Not a bug, and no flag bypasses it. Reads and writes are both blocked. Offer `apple-ads-strategy`, which needs no account |
| Apple credentials inactive | Adapty is fine, Apple is not linked | `adapty asa connect` |
| `404` on something visible in the dashboard | The token is scoped to a different company | Apple authorization belongs to a company, not a user. There is no `--app` to switch scope |

## Never

- Never treat `adapty auth status` as proof of a working token — it never touches the network.
  `asa whoami` is the first call that asks the server.
- Never ask the user for a token, or part of one, because the session is remote. Browser login
  works in a cloud session.
- Never skip this because "setup was already done" in an earlier session.
