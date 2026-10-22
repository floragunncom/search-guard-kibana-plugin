#!/bin/bash
# Usage: browser_check.sh [/app/path ...]            login form -> home -> each app, report problems
#        browser_check.sh --dashboard <watchId>     add the Watch status panel, save, reload
# Uses the headless Chromium and puppeteer-core shipped inside the Kibana distribution in $RT/kb,
# so nothing has to be installed. Screenshots go to $RT/shots.
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/common.sh"
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
mkdir -p "$RT/shots"
CHROME="$RT/kb/node_modules/@kbn/screenshotting-plugin/chromium/headless_shell-linux_$CHROME_ARCH/headless_shell"
[ -x "$CHROME" ] || CHROME="$(find ~/.cache/ms-playwright -maxdepth 3 -type f \( -name chrome-headless-shell -o -name headless_shell \) 2>/dev/null | tail -1)"
[ -x "$CHROME" ] || { echo "no headless chromium found"; exit 1; }
NODE_BIN="$(ls "$RT"/kb/node/*/bin/node 2>/dev/null | head -1 || command -v node)"
# the Kibana chromium needs NSS libs; the Playwright Firefox bundle carries them if the OS doesn't
if ldd "$CHROME" 2>/dev/null | grep -q 'not found'; then
  NSS="$(dirname "$(find ~/.cache/ms-playwright -name 'libnss3.so' 2>/dev/null | head -1)")"
  [ -n "$NSS" ] && export LD_LIBRARY_PATH="$NSS${LD_LIBRARY_PATH:+:$LD_LIBRARY_PATH}"
fi
export NODE_PATH="$RT/kb/node_modules" SHOTS="$RT/shots" SG_USER="$ADMIN_USER" SG_PASS="$ADMIN_PASS"
if [ "${1:-}" = "--dashboard" ]; then
  "$NODE_BIN" "$HERE/browser_dashboard.js" "$CHROME" "$KB_URL" "${2:?watchId}"
else
  [ $# -gt 0 ] || set -- /app/searchguard-configuration /app/searchguard-signals /app/searchguard-authtokens /app/dashboards
  "$NODE_BIN" "$HERE/browser_login.js" "$CHROME" "$KB_URL" "$@"
fi
ls "$RT/shots"
