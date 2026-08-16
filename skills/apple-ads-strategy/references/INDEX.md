# Routing — planning

One row, one file. Read only the file the row names.

| The user is asking | Open |
|---|---|
| How to launch ASA for a universal TV remote / device-control app | `verticals/utility-tv-remote.md` |
| How to launch ASA for a VPN app | `verticals/utility-vpn.md` |
| How to launch ASA for a scanner / document app | `verticals/utility-scanner.md` |
| How to launch ASA for a cleaner / storage app | `verticals/utility-cleaner.md` |
| Which campaigns and ad groups to create, in any category | `account-structure.md` |
| Which keywords to target, how to group them, what to negate | `keyword-taxonomy.md` |
| A category with no guide here yet | `account-structure.md` + `keyword-taxonomy.md`, then offer to draft one from `verticals/_TEMPLATE.md` |

Adding a vertical: copy `verticals/_TEMPLATE.md`, fill every section, add a row above.
`scripts/lint-playbooks.mjs` fails the build if a vertical is missing frontmatter, a mandatory
section, or an INDEX row.
