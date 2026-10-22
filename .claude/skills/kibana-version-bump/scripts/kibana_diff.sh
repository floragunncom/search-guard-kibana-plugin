#!/bin/bash
# Usage: kibana_diff.sh vOLD vNEW
# What changed between two Kibana tags in the parts THIS plugin depends on. Everything is derived
# from the plugin itself (kibana.json dependencies, @kbn imports, core services used) plus the
# known hotspots listed in ../references/hotspots.tsv. Needs the kibana/ checkout; missing tags
# are fetched shallowly. Read the output top to bottom; it predicts most of the bump work.
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/common.sh"
OLD="${1:?old tag, e.g. v9.4.3}"; NEW="${2:?new tag, e.g. v9.5.5}"
HOTSPOTS="$SKILL_DIR/references/hotspots.tsv"
cd "$KIBANA_DIR"
for t in "$OLD" "$NEW"; do
  git rev-parse -q --verify "refs/tags/$t" >/dev/null || { echo "fetching $t"; git fetch --depth 1 origin "refs/tags/$t:refs/tags/$t"; }
done
shortstat() { local s; s=$(git diff --shortstat "$OLD" "$NEW" -- "$@" 2>/dev/null | sed -E 's/^ *//; s/ changed//; s/ insertions?\(\+\)/+/; s/ deletions?\(-\)/-/'); echo "${s:-unchanged}"; }
count() { { git grep -c -E "$1" "$2" -- "${@:3}" 2>/dev/null || true; } | awk -F: '{s+=$NF} END{print s+0}'; }
strip_tag() { sed -E "s#^$NEW:##"; }

section "1. Toolchain and build tooling"
for t in "$OLD" "$NEW"; do
  echo "$t: node=$(git show "$t:.node-version" 2>/dev/null | tr -d '\n')  $(git show "$t:package.json" | grep -E '"(packageManager|pnpm|yarn|@moonrepo/cli)"' | tr -d ' \n' | sed 's/,$//')"
done
for p in .node-version package.json pnpm-workspace.yaml .npmrc .moon packages/kbn-plugin-helpers; do printf '  %-32s %s\n' "$p" "$(shortstat "$p")"; done

section "2. Kibana plugins we depend on (kibana.json requiredPlugins + optionalPlugins)"
IDS=$(python3 -c 'import json,sys; m=json.load(open(sys.argv[1])); print("|".join(m.get("requiredPlugins",[])+m.get("optionalPlugins",[])))' "$REPO/kibana.json")
FOUND=""
for f in $(git grep -l -E "\"id\": \"($IDS)\"" "$NEW" -- '*/kibana.jsonc' | strip_tag); do
  dir="${f%/kibana.jsonc}"; id=$(git show "$NEW:$f" | grep -oE '"id": "[^"@]+"' | head -1 | cut -d'"' -f4); FOUND="$FOUND $id"
  contract=(); for c in public/plugin.ts public/plugin.tsx server/plugin.ts public/index.ts server/index.ts public/types.ts server/types.ts common/index.ts; do
    git cat-file -e "$NEW:$dir/$c" 2>/dev/null && contract+=("$dir/$c"); done
  printf '  %-18s %-55s whole plugin: %-28s contract files: %s\n' "$id" "$dir" "$(shortstat "$dir")" "$(shortstat "${contract[@]}")"
  if [ "$(shortstat "${contract[@]}")" != unchanged ]; then
    echo "      removed/changed lines in the setup/start contract (what we may have relied on):"
    { git diff "$OLD" "$NEW" -- "${contract[@]}" | grep -E '^-[^-]' | grep -vE '^-\s*(//|\*|import )' || true; } | sed -E 's/^-\s*/        - /' | head -12
  fi
done

for id in ${IDS//|/ }; do
  case " $FOUND " in *" $id "*) ;; *) echo "  !! $id is declared in kibana.json but has no kibana.jsonc in $NEW: removed or renamed plugin, the bump cannot work until kibana.json is fixed";; esac
done

section "3. @kbn packages we import (export presence in $OLD vs $NEW; import_check.js is the authoritative runtime check)"
declare -A NAMES
while IFS= read -r line; do
  pkg=$(echo "$line" | grep -oE "@kbn/[^'\"]+" | head -1)
  clause=$(echo "$line" | sed -E "s/^import\s+//; s/\s+from.*//")
  if [[ "$clause" == *"{"* ]]; then
    for n in $(echo "$clause" | sed -E 's/.*\{//; s/\}.*//' | tr ',' '\n' | sed -E 's/\s+as\s+.*//; s/^\s*type\s+//; s/\s//g' | grep -v '^$'); do NAMES["$pkg"]+="$n "; done
  else NAMES["$pkg"]+="(default) "; fi
done < <({ grep -rhoE "^import\s+[^;]*from\s+['\"]@kbn/[^'\"]+['\"]" "$REPO/server" "$REPO/public" "$REPO/common" --include=*.js --include=*.ts --include=*.tsx 2>/dev/null || true; } | grep -v '^import type' || true)
PKG_RE=$(printf '%s\n' "${!NAMES[@]}" | sed -E 's#^@kbn/##; s#/.*##' | sort -u | paste -sd'|')
declare -A PKGDIR
for f in $(git grep -l -E "\"name\": \"@kbn/($PKG_RE)\"" "$NEW" -- '*/package.json' | strip_tag); do
  PKGDIR["$(git show "$NEW:$f" | grep -oE '"name": "@kbn/[^"]+"' | head -1 | cut -d'"' -f4)"]="${f%/package.json}"; done
for pkg in $(printf '%s\n' "${!NAMES[@]}" | sort); do
  base="@kbn/$(echo "$pkg" | sed -E 's#^@kbn/##; s#/.*##')"; dir="${PKGDIR[$base]:-}"
  if [ -z "$dir" ]; then printf '  %-45s NOT FOUND in %s (package removed or renamed?)\n' "$pkg" "$NEW"; continue; fi
  printf '  %-45s %-60s %s\n' "$pkg" "$dir" "$(shortstat "$dir")"
  # plugin entry points (@kbn/<x>-plugin/public|server|common): only what <entry>/index.ts exports is importable;
  # 9.5 dropped `export { triggers }` from ui_actions/public/index.ts and ADD_PANEL_TRIGGER became undefined
  # although the constant still existed elsewhere in the plugin directory.
  scope="$dir"; entry=""
  if [[ "$pkg" =~ ^@kbn/.*-plugin/(public|server|common)$ ]]; then entry="${BASH_REMATCH[1]}"; scope="$dir/$entry/index.ts"; fi
  for n in $(printf '%s\n' ${NAMES[$pkg]} | sort -u); do
    [ "$n" = "(default)" ] && continue
    re="export\s+(declare\s+)?(const|let|var|function|async function|class|enum|interface|type|abstract class)\s+$n\b|export\s*\{[^}]*\b$n\b"
    new=$(count "$re" "$NEW" "$scope"); old=$(count "$re" "$OLD" "$scope")
    if [ "$new" = 0 ] && [ "$old" != 0 ]; then echo "      REMOVED since $OLD: $n"
    elif [ "$new" = 0 ] && [ -n "$entry" ]; then
      star=$(count "export\s*\*\s*from" "$NEW" "$scope")
      echo "      not exported by name from $entry/index.ts in either tag: $n  ($star 'export * from' lines there; check where it really lives, e.g. git grep 'export const $n')"
    elif [ "$new" = 0 ]; then echo "      not found as a direct export in either tag: $n  (re-export or type? import_check.js decides)"; fi
  done
done

section "4. Core services we call (core.<service>) -> src/core/packages/<service>"
for svc in $(grep -rhoE '\b(core|coreSetup|coreStart|kibanaCore|coreContext)\.[a-zA-Z]+' "$REPO/server" "$REPO/public" --include=*.js --include=*.ts 2>/dev/null | sed -E 's/^[a-zA-Z]+\.//' | sort -u); do
  dir="src/core/packages/$(echo "$svc" | sed -E 's/([A-Z])/-\L\1/g')"
  git cat-file -e "$NEW:$dir" 2>/dev/null || continue
  printf '  %-16s %-45s server: %-26s browser: %s\n' "$svc" "$dir" "$(shortstat "$dir/server" "$dir/server-internal")" "$(shortstat "$dir/browser" "$dir/browser-internal")"
done

section "5. New core server routes since $OLD (the anonymous login page may call them; AuthManager must let them through or they must tolerate a 401)"
{ git diff "$OLD" "$NEW" -- 'src/core/packages/*/server-internal/*' | grep -E "^\+.*path: ['\`]/(internal|api)/" || true; } | sed -E "s/^\+\s*/  + /" | sort -u | head -20
echo "  (empty = none)"

section "6. Known hotspots ($HOTSPOTS)"
grep -vE '^\s*(#|$)' "$HOTSPOTS" | while IFS=$'\t' read -r label path pattern; do
  printf '  %s\n      %-75s %s\n' "$label" "$path" "$(shortstat "$path")"
  if [ "$pattern" != "-" ]; then
    old=$(count "$pattern" "$OLD" "$path"); new=$(count "$pattern" "$NEW" "$path")
    flag=""; [ "$new" = 0 ] && [ "$old" != 0 ] && flag="  <-- GONE in $NEW"
    printf '      pattern /%s/: %s in %s, %s in %s%s\n' "$pattern" "$old" "$OLD" "$new" "$NEW" "$flag"
    { git grep -n -E "$pattern" "$NEW" -- "$path" 2>/dev/null || true; } | strip_tag | sed 's/^/        /' | cut -c1-150 | head -6
  fi
done
section "7. Release notes added between $OLD and $NEW (docs/release-notes in the Kibana repo; the newest minor may still be missing there, then read https://www.elastic.co/docs/release-notes/kibana/{breaking-changes,deprecations,index})"
echo "--- versions whose notes were added:"
{ git diff "$OLD" "$NEW" -- docs/release-notes/index.md | grep -E '^\+## ' || true; } | sed -E 's/^\+## ([0-9.]+).*/  \1/' | tr '\n' ' '; echo
echo "--- breaking changes:"
{ git diff "$OLD" "$NEW" -- docs/release-notes/breaking-changes.md | grep -E '^\+(## |::::\{dropdown\}|\*\*Details\*\*)' || true; } | sed -E 's/^\+## /  == /; s/^\+::::\{dropdown\} /  * /; s/^\+\*\*Details\*\*<br> /      /' | cut -c1-200
echo "--- deprecations:"
{ git diff "$OLD" "$NEW" -- docs/release-notes/deprecations.md | grep -E '^\+(## |::::\{dropdown\}|\*\*Details\*\*)' || true; } | sed -E 's/^\+## /  == /; s/^\+::::\{dropdown\} /  * /; s/^\+\*\*Details\*\*<br> /      /' | cut -c1-200
echo "--- release-note lines touching our area (saved objects, security, session, spaces, basePath, dashboards, embeddable, kibana.yml):"
{ git diff "$OLD" "$NEW" -- docs/release-notes/ | grep -E '^\+\* ' | grep -iE 'saved object|security|authentic|session|cookie|spaces?\b|basePath|dashboard|embeddable|kibana\.yml|feature flag|deprecat' || true; } | sed -E 's/^\+\* /  * /' | cut -c1-200 | head -25

echo; echo "KIBANA_DIFF_DONE"
