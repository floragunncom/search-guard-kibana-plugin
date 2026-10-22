#!/bin/bash
# Usage: user_check.sh [user] [password] [/app/path ...]      default: kibanaro / kibanaro (demo config)
# Read-only pass as a NON-admin user: the admin passes never trigger SGS_KIBANA_USER permission
# denials, so a new Kibana API called on behalf of normal users would go unnoticed. Logs in,
# calls the routes a user session touches, drives the browser through the apps, then prints the
# Search Guard privilege blocks for that user from the Elasticsearch log. Run log_report.sh after it.
set -uo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/common.sh"
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
U="${1:-kibanaro}"; P="${2:-kibanaro}"; shift 2 2>/dev/null || true
export ADMIN_USER="$U" ADMIN_PASS="$P"
H=(-H 'x-elastic-internal-origin: Kibana'); J="$COOKIES"
ESLOG="$(ls "$RT"/es/logs/*.log 2>/dev/null | grep -v gc.log | head -1)"
MARK=$(wc -l < "$ESLOG")

section "HTTP pass as $U"
step "login (expect 200)"; kibana_login
step "authinfo: roles and tenants of $U"
curl -s "${H[@]}" -b "$J" "$KB_URL/api/v1/auth/authinfo" | python3 -c 'import sys,json; d=json.load(sys.stdin); print("user:", d.get("user_name"), "sg_roles:", d.get("sg_roles"), "tenants:", list((d.get("sg_tenants") or {}).keys())[:8])' 2>/dev/null
step "routes a user session touches (expect 200 unless noted)"
for r in "GET /app/home" "GET /api/v1/multitenancy/info" "GET /api/v1/multitenancy/tenant" "GET /api/saved_objects/_find?type=dashboard&per_page=5" "GET /api/data_views" "GET /api/v1/searchguard/kibana_config" "GET /api/v1/auth/config"; do
  m=${r%% *}; p=${r#* }
  printf '  %-62s %s\n' "$r" "$(curl -s "${H[@]}" -b "$J" -X "$m" -o /dev/null -w '%{http_code}' "$KB_URL$p")"
done
printf '  %-62s %s\n' "POST /api/core/capabilities" "$(curl -s "${KBN_HDR[@]}" -b "$J" -o /dev/null -w '%{http_code}' -d '{"applications":[]}' "$KB_URL/api/core/capabilities")"
printf '  %-62s %s  (403 is fine for a user without Signals permissions)\n' "POST /api/searchguard-signals/watch/summary" "$(curl -s "${KBN_HDR[@]}" -b "$J" -o /dev/null -w '%{http_code}' -d '{"query":{"size":5}}' "$KB_URL/api/searchguard-signals/watch/summary")"
step "logout (expect 200)"
curl -s "${KBN_HDR[@]}" -b "$J" -c "$J" -X POST -o /dev/null -w 'status=%{http_code}\n' "$KB_URL/api/v1/auth/logout"

section "Browser pass as $U (Forbidden errors from the Signals and Auth Tokens apps are expected for a user without those permissions; judge by the privilege blocks below)"
"$HERE/browser_check.sh" "$@" 2>&1 | sed -n '/PAGEERRORS/,/BROWSER_DONE/p'

section "Search Guard privilege blocks for $U during this pass (expect none)"
tail -n +"$((MARK + 1))" "$ESLOG" | awk '/### No (index|cluster|tenant) privileges/ {blk=1; buf=""} blk {buf=buf $0 "\n"} blk && /^Status:/ {blk=0; if (buf ~ /INSUFFICIENT/) print buf}' \
  | sed -E 's/^\[[^]]+\]\[[^]]+\]\[[^]]+\] \[[^]]+\] //' | grep -E '^(###|User:|Roles:|Required Privileges:|Resolved Indices:|Reason:|.*: MISSING)' | sort | uniq -c | sort -rn
echo "USER_CHECK_DONE"
