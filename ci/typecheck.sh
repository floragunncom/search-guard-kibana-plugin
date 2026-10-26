#!/bin/bash
#
# Type check of the plugin's JavaScript against the Kibana tree it is built in.
#
# Run from kibana/plugins/search-guard after `kbn bootstrap` and the plugin's
# `yarn install` (tsc needs both node_modules). Files opt in with a leading
# `// @ts-check` comment, see tsconfig.typecheck.json.
#
# tsc also loads Kibana's own sources to supply the types. Compiled as one
# program with the plugin's settings they produce diagnostics of their own
# (Kibana compiles each package separately with project references), so
# only diagnostics in the plugin's files are reported and fail the check.

set -u

PLUGIN_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." && pwd )"
TSC="$PLUGIN_DIR/../../node_modules/.bin/tsc"

if [[ ! -x "$TSC" ]]; then
   echo "typecheck: $TSC not found, run this from the plugin inside a bootstrapped Kibana tree" >&2
   exit 2
fi

cd "$PLUGIN_DIR"
CHECKED_FILES=$(grep -rlE '^// @ts-check' server public common --include='*.js' | grep -vc '\.test\.js$')
echo "typecheck: $CHECKED_FILES files opted in with // @ts-check"

OUTPUT=$("$TSC" -p tsconfig.typecheck.json --pretty false 2>&1)
TSC_EXIT=$?
PLUGIN_ERRORS=$(printf '%s\n' "$OUTPUT" | grep -E '^(server|public|common)/' || true)

if [[ -n "$PLUGIN_ERRORS" ]]; then
   echo "typecheck: FAILED"
   printf '%s\n' "$PLUGIN_ERRORS"
   echo "typecheck: $(printf '%s\n' "$PLUGIN_ERRORS" | wc -l | tr -d ' ') error(s) in plugin files (see above)"
   exit 1
fi

if [[ $TSC_EXIT -ne 0 ]] && ! printf '%s\n' "$OUTPUT" | grep -q 'error TS'; then
   # tsc failed without any diagnostics (bad config, crash): do not hide that.
   echo "typecheck: tsc exited with $TSC_EXIT"
   printf '%s\n' "$OUTPUT"
   exit $TSC_EXIT
fi

echo "typecheck: OK (no errors in plugin files; $(printf '%s\n' "$OUTPUT" | grep -c 'error TS' || true) diagnostics in Kibana's own sources ignored)"
