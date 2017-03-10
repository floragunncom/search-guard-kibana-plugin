#!/bin/bash
PLUGIN_NAME=searchguard-kibana
PLUGIN_VERSION=5.2.2-1
echo "Building $PLUGIN_NAME-$PLUGIN_VERSION.zip"
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $DIR/..
git clone https://github.com/elastic/kibana.git
cd "kibana"
git checkout tags/v$PLUGIN_VERSION
hash nvm 2>/dev/null || export NVM_DIR=~/.nvm; mkdir -p $NVM_DIR; . $(brew --prefix nvm)/nvm.sh
nvm install "$(cat .node-version)"
cd "$DIR"
rm -rf build/
rm -rf node_modules/
npm install --save hapi@16.0.1
npm install
COPYPATH="build/kibana/$PLUGIN_NAME"
mkdir -p $COPYPATH
cp -a index.js $COPYPATH
cp -a package.json $COPYPATH
cp -a lib $COPYPATH
cp -a node_modules $COPYPATH
cp -a public $COPYPATH
#cp -a server $COPYPATH
cd build
zip --quiet -r $PLUGIN_NAME-$PLUGIN_VERSION.zip kibana
ls -lah $PLUGIN_NAME-$PLUGIN_VERSION.zip
cd $DIR
mkdir -p releases/$PLUGIN_VERSION/
cp build/$PLUGIN_NAME-$PLUGIN_VERSION.zip releases/$PLUGIN_VERSION/
echo "Created releases/$PLUGIN_VERSION/$PLUGIN_NAME-$PLUGIN_VERSION.zip"
md5sum build/$PLUGIN_NAME-$PLUGIN_VERSION.zip
