#!/bin/bash
# Usage: local_build.sh X.Y.Z
# Mirrors ci/init_build.sh: Kibana checkout at vX.Y.Z in $KIBANA_DIR (default ./kibana),
# exact Node from .node-version, pnpm from engines.pnpm, `pnpm kbn bootstrap`, plugin copied
# to kibana/plugins/search-guard, jest (server, public), production build with plugin_helpers.
# Result: $PLUGIN_DIR/build/kibana/searchguard (with node_modules) and $RT/searchguard-X.Y.Z.zip.
# Set FORCE_BOOTSTRAP=1 to re-run bootstrap although the checkout looks bootstrapped.
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/common.sh"
V="${1:?kibana version}"
mkdir -p "$SCRATCH" "$RT" "$DL"

section "Kibana checkout v$V in $KIBANA_DIR"
if [ ! -d "$KIBANA_DIR/.git" ]; then
  git clone --depth 1 --branch "v$V" --quiet --config advice.detachedHead=false https://github.com/elastic/kibana.git "$KIBANA_DIR"
elif [ "$(git -C "$KIBANA_DIR" describe --tags --exact-match 2>/dev/null)" != "v$V" ]; then
  git -C "$KIBANA_DIR" fetch --depth 1 origin "refs/tags/v$V:refs/tags/v$V"
  git -C "$KIBANA_DIR" checkout --quiet "v$V"
  rm -f "$KIBANA_DIR/.cached_version"
fi
cd "$KIBANA_DIR"
git checkout --quiet -- .                       # drop leftovers (optimizer patch, bootstrap edits)
git show-ref --verify --quiet refs/heads/main || git update-ref refs/heads/main HEAD   # moon needs `main`
unset GITLAB_CI                                  # moon must not look for GitLab pipeline SHAs

section "Node $(cat .node-version) and pnpm"
NV="$(cat .node-version)"
if [ "$(node -v 2>/dev/null)" != "v$NV" ]; then
  NODE_DIR="$SCRATCH/node-$NV"
  if [ ! -x "$NODE_DIR/bin/node" ]; then
    mkdir -p "$NODE_DIR.tmp" && cd "$NODE_DIR.tmp"
    curl -sSfL -o node.tar.xz "https://nodejs.org/dist/v$NV/node-v$NV-linux-$NODE_ARCH.tar.xz"
    tar xf node.tar.xz && mv "node-v$NV-linux-$NODE_ARCH" "$NODE_DIR" && cd "$KIBANA_DIR" && rm -rf "$NODE_DIR.tmp"
  fi
  export PATH="$NODE_DIR/bin:$PATH"
fi
PNPM_VERSION="$(node -p "require('./package.json').engines.pnpm.replace(/^[^\d]*/, '')")"
if [ "$(pnpm -v 2>/dev/null)" != "$PNPM_VERSION" ]; then
  (corepack enable && corepack prepare "pnpm@$PNPM_VERSION" --activate) 2>/dev/null || npm install -g "pnpm@$PNPM_VERSION" >/dev/null
fi
echo "node $(node -v)  pnpm $(pnpm -v)  (kibana wants node $NV, pnpm $PNPM_VERSION)"

section "pnpm kbn bootstrap"
# same optimizer patch as ci/init_build.sh (silences the stderr line stream of the optimizer)
sed -i "/observeLines(proc.stderr\!).pipe(Rx.map((line) => ({ type: 'stderr', data: line }))),/s/^/\/\//" packages/kbn-plugin-helpers/src/tasks/optimize.ts
if [ "${FORCE_BOOTSTRAP:-0}" = 1 ] || [ ! -x node_modules/.bin/jest ] || [ "$(cat .cached_version 2>/dev/null)" != "$V" ]; then
  CI=true pnpm kbn bootstrap 2>&1 | tee "$SCRATCH/bootstrap-$V.log" | tail -5
  echo "$V" > .cached_version
else
  echo "already bootstrapped for $V (FORCE_BOOTSTRAP=1 to redo)"
fi

section "Copy plugin into $PLUGIN_DIR"
rm -rf "$PLUGIN_DIR"; mkdir -p "$PLUGIN_DIR"
for f in babel.config.js package.json kibana.json tsconfig.json public server common tests __mocks__ pnpm-lock.yaml pnpm-workspace.yaml .kibana-plugin-helpers.json; do
  cp -a "$REPO/$f" "$PLUGIN_DIR/"
done
cd "$PLUGIN_DIR"
CI=true pnpm install --frozen-lockfile 2>&1 | tail -2

section "Unit tests"
JEST=../../node_modules/.bin/jest
$JEST --clearCache >/dev/null
echo "--- server"; $JEST --testPathIgnorePatterns=public --config ./tests/jest.config.js --reporters=default 2>&1 | tee "$SCRATCH/jest-server.log" | grep -E '^(Tests|Test Suites):|FAIL|●.*›' | head -30
$JEST --clearCache >/dev/null
echo "--- public"; $JEST --testPathIgnorePatterns=server --config ./tests/jest.config.js --reporters=default 2>&1 | tee "$SCRATCH/jest-public.log" | grep -E '^(Tests|Test Suites):|FAIL|●.*›' | head -30

section "Production build"
rm -rf node_modules build
CI=true pnpm install --prod --frozen-lockfile 2>&1 | tail -1
node ../../scripts/plugin_helpers build -v "$V" --skip-archive 2>&1 | tee "$SCRATCH/plugin-build-$V.log" | grep -iE 'succ|error|warn' | head
mv node_modules build/kibana/searchguard/node_modules
(cd build && rm -f "$RT/searchguard-$V.zip" && zip -qr "$RT/searchguard-$V.zip" kibana)
ls -la "$RT/searchguard-$V.zip"
echo "LOCAL_BUILD_DONE"
