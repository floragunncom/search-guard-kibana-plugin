#!/bin/bash
# Usage: log_report.sh [out file]
# Normalised inventory of what went wrong during the runtime test, for diffing against the
# previous bump (references/log-baseline-<version>.md):
#   1. Kibana log: every ERROR line (normalised, counted) and the plugin's own WARN/ERROR lines
#   2. Search Guard / Elasticsearch log: privilege evaluations that ended INSUFFICIENT
#      (= a role such as SGS_KIBANA_SERVER or SGS_KIBANA_USER needs a new permission)
#   3. Search Guard audit log index: MISSING_PRIVILEGES events per user / action / index
# Run it after runtime_check.sh and browser_check.sh so "during use" is covered, not only startup.
set -uo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/common.sh"
OUT="${1:-$RT/log-report.md}"
KLOG="$RT/kibana.log"
ESLOG="$(ls "$RT"/es/logs/*.log 2>/dev/null | grep -v gc.log | head -1)"
norm() { sed -E 's/^\[[^]]+\]//; s/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/<uuid>/g; s/[0-9]+(\.[0-9]+)?(ms|s)\b/<n>\2/g; s/[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9:.]+Z/<ts>/g' | cut -c1-220; }
{
echo "# Runtime log report ($(date -u +%Y-%m-%dT%H:%MZ))"
echo
echo "## Kibana: ERROR lines (count, normalised)"
echo '```'
grep '\[ERROR\]' "$KLOG" | norm | sort | uniq -c | sort -rn
echo '```'
echo
echo "## Kibana: plugins.searchguard WARN/ERROR lines"
echo '```'
grep -E '\[(WARN|ERROR) ?\]\[plugins\.searchguard' "$KLOG" | norm | sort | uniq -c | sort -rn
echo '```'
echo
echo "## Kibana: config deprecation warnings (settings in kibana.yml / docker/kibana.yml / docs that must change)"
echo '```'
grep -E '\[WARN \]\[config\.deprecation\]' "$KLOG" | norm | sort | uniq -c | sort -rn
echo '```'
echo
echo "## Kibana: HTTP 5xx responses per route (from the http.server.response debug logger; plugin routes are regressions, elastic_assistant/cloud_connect are Kibana's own)"
echo '```'
grep -E '\[http\.server\.response\] [A-Z]+ \S+ 5[0-9]{2} ' "$KLOG" | sed -E 's/^.*\[http\.server\.response\] //; s/ [0-9]+ms.*//' | sort | uniq -c | sort -rn | head -20
echo '```'
echo
echo "## Kibana: TypeError / ReferenceError / unhandled (expect none)"
echo '```'
grep -nE 'TypeError|ReferenceError|Cannot read|Unhandled|unhandledRejection' "$KLOG" | cut -c1-220
echo '```'
echo
echo "## Search Guard: INSUFFICIENT privilege evaluations in $ESLOG"
echo "(each block = a user lacked a permission; decide whether SGS_KIBANA_SERVER / SGS_KIBANA_USER need it)"
echo '```'
awk '/### No (index|cluster|tenant) privileges/ {blk=1; buf=""} blk {buf=buf $0 "\n"} blk && /^Status:/ {blk=0; if (buf ~ /INSUFFICIENT/) print buf}' "$ESLOG" \
  | sed -E 's/^\[[^]]+\]\[[^]]+\]\[[^]]+\] \[[^]]+\] //' | grep -E '^(###|User:|Roles:|Required Privileges:|Resolved Indices:|Reason:|.*: MISSING)' | sort | uniq -c | sort -rn
echo '```'
echo
echo "## Search Guard audit index: MISSING_PRIVILEGES per user / privilege / index"
echo "(secondary source; the log blocks above are authoritative, e.g. denials on non-existing indices are not audited)"
echo '```'
curl -sk --cert "$RT/es/config/kirk.pem" --key "$RT/es/config/kirk-key.pem" -H 'content-type: application/json' \
  -d '{"size":0,"query":{"term":{"audit_category":"MISSING_PRIVILEGES"}},"aggs":{"u":{"terms":{"field":"audit_request_effective_user.keyword","size":20},"aggs":{"p":{"terms":{"field":"audit_request_privilege.keyword","size":30,"missing":"(no privilege field)"},"aggs":{"i":{"terms":{"field":"audit_trace_indices.keyword","size":20}}}}}}}}' \
  "$ES_URL/sg7-auditlog-*/_search" | python3 "$(dirname "${BASH_SOURCE[0]}")/report_helpers.py" audit
echo '```'
echo
echo "## Elasticsearch: ERROR/WARN lines from the SG plugin (c.f.s.*), normalised"
echo '```'
grep -E '\]\[(ERROR|WARN) \]\[c\.f\.s\.' "$ESLOG" | sed -E 's/^\[[^]]+\]//; s/\[[^]]*node[^]]*\] //' | cut -c1-200 | sort | uniq -c | sort -rn | head -30
echo '```'
} | tee "$OUT"
echo "written: $OUT"
