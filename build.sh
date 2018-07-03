#!/bin/bash
KIBANA_VERSION="$1"
PLUGIN_VERSION="$1"
PLUGIN_NAME="searchguard-kibana-$1-$2"
echo "Building $PLUGIN_NAME.zip"
set -e
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"
mkdir -p build_stage
cd build_stage
git clone https://github.com/elastic/kibana.git || true
cd "kibana"
git fetch
git checkout "tags/v$KIBANA_VERSION"
hash nvm 2>/dev/null || export NVM_DIR=~/.nvm; mkdir -p "$NVM_DIR"; . $(brew --prefix nvm)/nvm.sh
nvm install "$(cat .node-version)"
cd "$DIR"
rm -rf build/
rm -rf node_modules/
#npm install --save hapi@16.0.1
npm install
COPYPATH="build/kibana/$PLUGIN_NAME"
mkdir -p "$COPYPATH"
cp -a "$DIR/index.js" "$COPYPATH"
cp -a "$DIR/package.json" "$COPYPATH"
cp -a "$DIR/lib" "$COPYPATH"
cp -a "$DIR/node_modules" "$COPYPATH"
cp -a "$DIR/public" "$COPYPATH"