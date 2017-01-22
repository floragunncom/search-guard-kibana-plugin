#!/bin/bash
set -e
LOGILE=build.log
echo "$(date)" > $LOGILE
PLUGIN_NAME=searchguard-kibana-alpha
PLUGIN_VERSION=5.1.2
echo "Building $PLUGIN_NAME-$PLUGIN_VERSION.zip"
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

if [ ! -d "$DIR/../kibana/.git" ]; then
    cd $DIR/..
    git clone https://github.com/elastic/kibana.git >> $LOGILE 2>&1
else
    cd "$DIR/../kibana"
    git fetch >> $LOGILE 2>&1
fi
git checkout tags/v$PLUGIN_VERSION >> $LOGILE 2>&1
hash nvm 2>/dev/null || export NVM_DIR=~/.nvm; mkdir -p $NVM_DIR; . $(brew --prefix nvm)/nvm.sh >> $LOGILE 2>&1
nvm install "$(cat .node-version)" >> $LOGILE 2>&1
cd "$DIR"
rm -rf build/
rm -rf $DIR/releases
rm -rf node_modules/
npm install --save hapi@16.0.1 >> $LOGILE 2>&1
npm install >> $LOGILE 2>&1
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
#ls -lah $PLUGIN_NAME-$PLUGIN_VERSION.zip
cd $DIR
mkdir -p $DIR/releases/$PLUGIN_VERSION/
cp $DIR/build/$PLUGIN_NAME-$PLUGIN_VERSION.zip $DIR/releases/$PLUGIN_VERSION/
echo "Created $DIR/releases/$PLUGIN_VERSION/$PLUGIN_NAME-$PLUGIN_VERSION.zip"
md5sum $DIR/releases/$PLUGIN_VERSION/$PLUGIN_NAME-$PLUGIN_VERSION.zip
