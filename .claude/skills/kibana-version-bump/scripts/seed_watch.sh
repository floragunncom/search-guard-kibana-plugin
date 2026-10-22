#!/bin/bash
# Usage: seed_watch.sh [watchId]
# Creates an active Signals watch WITH a severity block (the "Watch status" widget only lists
# watches that have severity), waits for one execution and prints the summary the widget uses.
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/common.sh"
W="${1:-sg_compat_watch}"
kibana_login
# A fresh cluster has no data views, and then /app/dashboards#/create shows the "How do you want to
# explore your data?" screen instead of the editor (no "Add panel" button). Any user data view fixes that.
curl -s -b "$COOKIES" "${KBN_HDR[@]}" -o /dev/null -w 'data view status=%{http_code}\n' \
  -d '{"data_view":{"title":"sg-compat-*","name":"sg-compat","allowNoIndex":true},"override":true}' "$KB_URL/api/data_views/data_view"
curl -s -b "$COOKIES" -X PUT "${KBN_HDR[@]}" -w '\nput watch status=%{http_code}\n' \
  -d '{"trigger":{"schedule":{"cron":["*/10 * * * * ?"]}},"checks":[{"type":"static","name":"constants","target":"constants","value":{"threshold":5}}],"severity":{"value":"data.constants.threshold","order":"ascending","mapping":[{"threshold":1,"level":"warning"},{"threshold":4,"level":"error"}]},"actions":[],"_meta":{},"_ui":{},"active":true}' \
  "$KB_URL/api/searchguard-signals/watch/$W" | cut -c1-200
sleep 25
curl -s -b "$COOKIES" -X POST "${KBN_HDR[@]}" -w '\nsummary status=%{http_code}\n' -d '{"query":{"size":500}}' "$KB_URL/api/searchguard-signals/watch/summary" | cut -c1-400
