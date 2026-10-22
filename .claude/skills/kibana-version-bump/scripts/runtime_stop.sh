#!/bin/bash
# Stops the Kibana and Elasticsearch processes started by runtime_setup.sh (data in $RT is kept)
# and waits until they are gone, so a following start on the same data directory does not hit
# "failed to obtain node locks".
source "$(dirname "${BASH_SOURCE[0]}")/common.sh"
# a pid counts as gone when it no longer exists or is a zombie (no init reaps orphans in some sandboxes)
alive() { kill -0 "$1" 2>/dev/null && ! grep -qE '^State:\s+Z' "/proc/$1/status" 2>/dev/null; }
pids=""
for p in kibana es; do
  if [ -f "$RT/$p.pid" ]; then pid=$(cat "$RT/$p.pid"); kill "$pid" 2>/dev/null && { echo "stopping $p ($pid)"; pids="$pids $pid"; }; fi
done
pkill -f "$RT/kb/node/.*/bin/node" 2>/dev/null || true
pkill -f "$RT/es/jdk" 2>/dev/null || true
for pid in $pids; do
  for _ in $(seq 1 60); do alive "$pid" || break; sleep 1; done
  alive "$pid" && { echo "pid $pid still alive after 60s, killing"; kill -9 "$pid" 2>/dev/null; sleep 2; }
done
for _ in $(seq 1 30); do pgrep -f "$RT/(es|kb)/" >/dev/null 2>&1 || break; sleep 1; done
echo "RUNTIME_STOPPED"
