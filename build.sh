#!/bin/bash
PLUGIN_NAME=searchguard-kibana
KIBANA_VERSION="$1"
echo "Building $PLUGIN_NAME-$KIBANA_VERSION.zip"
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

#cd build
#zip --quiet -r $PLUGIN_NAME-$PLUGIN_VERSION.zip kibana
#ls -lah $PLUGIN_NAME-$PLUGIN_VERSION.zip
#cd $DIR
#mkdir -p releases/$PLUGIN_VERSION/
#rm -f releases/$PLUGIN_VERSION/$PLUGIN_NAME-$PLUGIN_VERSION.zip
#cp build/$PLUGIN_NAME-$PLUGIN_VERSION.zip releases/$PLUGIN_VERSION/
#echo "Created releases/$PLUGIN_VERSION/$PLUGIN_NAME-$PLUGIN_VERSION.zip"
#md5sum build/$PLUGIN_NAME-$PLUGIN_VERSION.zip
