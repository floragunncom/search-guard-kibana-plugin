#!/bin/bash
# Usage: kibana_restart.sh [plugin zip]
# (Re)starts the Kibana distribution in $RT/kb. With a zip argument the Search Guard plugin
# is reinstalled first (after rebuilding with local_build.sh). Prints the decisive log lines.
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/common.sh"
cd "$RT/kb"
[ -f "$RT/kibana.pid" ] && kill "$(cat "$RT/kibana.pid")" 2>/dev/null || true
pkill -f "$RT/kb/node/.*/bin/node" 2>/dev/null || true; sleep 3
if [ -n "${1:-}" ]; then
  ./bin/kibana-plugin remove searchguard 2>&1 | tail -1 || true
  ./bin/kibana-plugin install "file://$(readlink -f "$1")" 2>&1 | tail -1
fi
rm -f "$RT/kibana.log"
nohup ./bin/kibana > "$RT/kibana.log" 2>&1 &
echo $! > "$RT/kibana.pid"
wait_for_kibana "$RT/kibana.log" "$RT/kibana.pid"
