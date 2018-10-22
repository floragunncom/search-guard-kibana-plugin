#!/bin/bash
KIBANA_VERSION="$1"
SG_PLUGIN_VERSION="$2"
COMMAND="$3"

# sanity checks for options
if [ -z "$KIBANA_VERSION" ] || [ -z "$SG_PLUGIN_VERSION" ] || [ -z "$COMMAND" ]; then
    echo "Usage: ./build.sh <kibana_version> <sg_plugin_version> <install|deploy>"
    exit 1;
fi

if [ "$COMMAND" != "release" ] && [ "$COMMAND" != "install" ]; then
    echo "Usage: ./build.sh <kibana_version> <sg_plugin_version> <install|deploy>"
    echo "Unknown command: $COMMAND"
    exit 1;
fi

# check version matches. Do not use jq here, only bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $DIR
while read -r line
do
    if [[ "$line" =~ ^\"version\".* ]]; then
      if [[ "$line" != "\"version\": \"$1-$2\"," ]]; then
        echo "Provided version \"version\": \"$1-$2\" does not match Kibana version: $line"
        exit 1;
      fi
    fi
done < "package.json"

# cleanup any leftovers
./clean.sh

# prepare artefacts
PLUGIN_NAME="searchguard-kibana-$KIBANA_VERSION-$SG_PLUGIN_VERSION"
echo "+++ Building $PLUGIN_NAME.zip +++"

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"
mkdir -p build_stage
cd build_stage

echo "+++ Cloning https://github.com/elastic/kibana.git +++"
git clone https://github.com/elastic/kibana.git || true
cd "kibana"
git fetch

echo "+++ Change to tags/v$KIBANA_VERSION +++"
git checkout "tags/v$KIBANA_VERSION"

echo "+++ Installting nvm +++"
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.11/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm install "$(cat .node-version)"
cd "$DIR"
rm -rf build/
rm -rf node_modules/

echo "+++ Installing node modules +++"
npm install

echo "+++ Copy plugin contents +++"
COPYPATH="build/kibana/$PLUGIN_NAME"
mkdir -p "$COPYPATH"
cp -a "$DIR/index.js" "$COPYPATH"
cp -a "$DIR/package.json" "$COPYPATH"
cp -a "$DIR/lib" "$COPYPATH"
cp -a "$DIR/node_modules" "$COPYPATH"
cp -a "$DIR/public" "$COPYPATH"

if [ "$COMMAND" = "release" ] ; then
    echo "+++ mvn clean deploy -Prelease +++"
    mvn clean deploy -Prelease
fi

if [ "$COMMAND" = "install" ] ; then
    echo "+++ mvn clean install +++"
    mvn clean install
fi