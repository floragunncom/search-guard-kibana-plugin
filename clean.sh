#!/bin/bash
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
cd "$SCRIPT_DIR"
set -e
find . -name '.DS_Store' -type f -delete
rm -rf ./target
rm -rf ./releases
rm -rf ./node_modules
rm -rf ./build
rm -f *.log
rm -rf build_stage/kibana/plugins/* || true

rm -rf ./kibana/target
rm -rf ./kibana/releases
rm -rf ./kibana/node_modules
rm -rf ./kibana/build
rm -rf ./kibana/.buildkite/node_modules/
rm -rf ./kibana/.moon/cache/
rm -rf ./kibana/.yarn-local-mirror/
rm -rf ./kibana/data/
rm -rf ./kibana/packages/kbn-ts-projects/config-paths.json
rm -rf ./kibana/src/platform/packages/private/kbn-repo-packages/package-map.json
