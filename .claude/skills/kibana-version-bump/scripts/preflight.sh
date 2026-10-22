#!/bin/bash
# Usage: preflight.sh X.Y.Z SG_ES_PLUGIN_VERSION
# Checks that every artifact a bump needs exists, and shows what Kibana's toolchain
# looks like at the tag (Node, pnpm/yarn, moon) next to what the repo currently has.
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/common.sh"
V="${1:?kibana version}"; SG="${2:?search guard es plugin version}"
RAW="https://raw.githubusercontent.com/elastic/kibana/v$V"
fail=0
check() { local code; code=$(curl -sIL -o /dev/null -w '%{http_code}' "$1" || true); printf '%-4s %s\n' "$code" "$1"; [ "$code" = 200 ] || fail=1; }

section "Artifacts for Kibana $V / Search Guard $SG"
check "https://github.com/elastic/kibana/tree/v$V"
check "https://artifacts.elastic.co/downloads/kibana/kibana-$V-linux-x86_64.tar.gz"
check "https://artifacts.elastic.co/downloads/kibana/kibana-$V-linux-aarch64.tar.gz"
check "https://artifacts.elastic.co/downloads/elasticsearch/elasticsearch-$V-linux-x86_64.tar.gz"
check "https://artifacts.elastic.co/downloads/elasticsearch/elasticsearch-$V-linux-aarch64.tar.gz"
check "$(sg_plugin_url "$V" "$SG")"
echo "--- Search Guard releases built for Kibana/ES $V (from maven-metadata.xml):"
curl -s "$SG_MAVEN/search-guard-flx-elasticsearch-plugin/maven-metadata.xml" | grep -oE "<version>[^<]*-es-$V</version>" | sed 's/<[^>]*>//g' | sed 's/^/    /' || true

section "Kibana toolchain at v$V"
echo "node-version : $(curl -sf "$RAW/.node-version" || echo '??')"
curl -sf "$RAW/package.json" | grep -E '"(packageManager|node|pnpm|yarn|@moonrepo/cli)"' | sed 's/^ */    /' || true

section "Repo state"
cd "$REPO"
echo "kibana.json  : $(grep -E '"version"' kibana.json | tr -d ' ,')"
echo "package.json : $(grep -m1 -E '"version"' package.json | tr -d ' ,')"
cat .gitlab-ci-branch-specific.yml | sed 's/^/    /'
[ -d "$KIBANA_DIR/.git" ] && echo "kibana/ checkout: $(git -C "$KIBANA_DIR" describe --tags --always 2>/dev/null)  (.cached_version=$(cat "$KIBANA_DIR/.cached_version" 2>/dev/null))"
echo
[ $fail = 0 ] && echo "PREFLIGHT_OK" || { echo "PREFLIGHT_FAILED (see non-200 lines above)"; exit 1; }
