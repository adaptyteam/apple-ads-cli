#!/usr/bin/env bash
# Build the installable .plugin bundle for Cowork.
#
# Same plugin as the one Claude Code installs from the marketplace — this only changes the
# delivery. Cowork users do not run `claude plugin marketplace add` in a terminal; they accept
# a .plugin file, which is a zip of the plugin directory.
#
# The bundle carries only what the plugin needs at runtime. Repo scaffolding — CI, linters,
# CONTRIBUTING, the marketplace manifest — stays out: it is noise inside an installed plugin,
# and marketplace.json in particular means something different there.
set -euo pipefail
cd "$(dirname "$0")/.."
OUT="${1:-/tmp/apple-ads.plugin}"
STAGE="$(mktemp -d)"

mkdir -p "$STAGE/.claude-plugin"
cp .claude-plugin/plugin.json "$STAGE/.claude-plugin/"
cp -R skills commands "$STAGE/"
cp README.md README.zh-CN.md README.tr.md LICENSE "$STAGE/"

node -e '
const fs=require("fs"),p=process.argv[1];let bad=0;
const m=JSON.parse(fs.readFileSync(p+"/.claude-plugin/plugin.json","utf8"));
if(!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(m.name||"")){console.error("name is not kebab-case");bad++}
if(!/^\d+\.\d+\.\d+$/.test(m.version||"")){console.error("version is not semver");bad++}
for(const s of fs.readdirSync(p+"/skills"))
  if(!fs.existsSync(`${p}/skills/${s}/SKILL.md`)){console.error("skill without SKILL.md: "+s);bad++}
if(bad)process.exit(1);
console.log(`OK ${m.name}@${m.version}`)' "$STAGE"

rm -f "$OUT"
( cd "$STAGE" && zip -qr "$OUT" . -x "*.DS_Store" )
rm -rf "$STAGE"
echo "built $OUT ($(unzip -Z1 "$OUT" | grep -c .) entries)"
