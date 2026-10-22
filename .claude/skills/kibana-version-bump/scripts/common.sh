#!/bin/bash
# Shared settings for the kibana-version-bump scripts. Source it, do not run it.
#
#   SCRATCH  work area outside the repo (export the session scratchpad dir);
#            default: ${TMPDIR:-/tmp}/sg-kibana-bump
#   DL       downloaded tarballs/zips           (default $SCRATCH/dl)
#   RT       runtime stack: es/, kb/, logs, pids (default $SCRATCH/rt)
#   REPO     the plugin repository (derived from this file's location)
SKILL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
REPO="$(cd "$SKILL_DIR/../../.." && pwd)"
SCRATCH="${SCRATCH:-${TMPDIR:-/tmp}/sg-kibana-bump}"
DL="${DL:-$SCRATCH/dl}"
RT="${RT:-$SCRATCH/rt}"
KIBANA_DIR="${KIBANA_DIR:-$REPO/kibana}"            # CI layout: Kibana checkout next to the plugin sources
PLUGIN_DIR="$KIBANA_DIR/plugins/search-guard"

KB_URL="${KB_URL:-http://127.0.0.1:5601}"
ES_URL="${ES_URL:-https://127.0.0.1:9200}"
ADMIN_USER="${ADMIN_USER:-admin}"
ADMIN_PASS="${ADMIN_PASS:-admin}"
TEST_TENANT="${TEST_TENANT:-sg_compat_tenant}"

case "$(uname -m)" in
  x86_64)        ES_ARCH=x86_64;  NODE_ARCH=x64;   CHROME_ARCH=x64 ;;
  aarch64|arm64) ES_ARCH=aarch64; NODE_ARCH=arm64; CHROME_ARCH=arm64 ;;
  *) echo "unsupported arch $(uname -m)" >&2; exit 1 ;;
esac

SG_MAVEN="https://maven.search-guard.com/search-guard-flx-release/com/floragunn"
sg_plugin_url() { echo "$SG_MAVEN/search-guard-flx-elasticsearch-plugin/$2-es-$1/search-guard-flx-elasticsearch-plugin-$2-es-$1.zip"; }

# Kibana internal routes answer 400 "not available with the current configuration"
# to plain curl; this header makes them behave like the browser.
KBN_HDR=(-H 'x-elastic-internal-origin: Kibana' -H 'kbn-xsrf: x' -H 'content-type: application/json')
COOKIES="$RT/cookies.txt"

section() { echo; echo "##### $* #####"; }
step() { echo; echo "### $*"; }

wait_for_kibana() {  # $1 = log file, $2 = pid file
  for _ in $(seq 1 240); do
    grep -qE 'Kibana is now available|\[FATAL\]|Unable to start|fatal error' "$1" 2>/dev/null && break
    kill -0 "$(cat "$2" 2>/dev/null)" 2>/dev/null || { echo "KIBANA PROCESS EXITED"; break; }
    sleep 2
  done
  echo "--- decisive log lines"
  # `|| true`: callers run with `set -e -o pipefail`, and a grep without matches (the good case) must not fail them
  { grep -nE 'Kibana is now available|\[FATAL\]|Unable to start|\[ERROR\]\[plugins\.searchguard|plugins\.searchguard.*Initialising' "$1" || true; } | head -20 | cut -c1-240
  echo "--- TypeError/ReferenceError/FATAL (expect none)"
  { grep -nE 'TypeError|ReferenceError|Cannot read|\[FATAL\]' "$1" || true; } | head -20 | cut -c1-300
  return 0
}

kibana_login() {  # fills $COOKIES
  rm -f "$COOKIES"
  curl -s -c "$COOKIES" -o /dev/null -w 'login status=%{http_code}\n' "${KBN_HDR[@]}" \
    -d "{\"username\":\"$ADMIN_USER\",\"password\":\"$ADMIN_PASS\"}" "$KB_URL/api/v1/auth/login"
}
