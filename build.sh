#!/bin/bash

# WARNING! Do not use jq here, only bash.
KIBANA_VERSION="$1"
SG_PLUGIN_VERSION="$2"
COMMAND="$3"

# sanity checks for options
if [ -z "$KIBANA_VERSION" ] || [ -z "$SG_PLUGIN_VERSION" ] || [ -z "$COMMAND" ]; then
    echo "Usage: ./build.sh <kibana_version> <sg_plugin_version> <install|deploy>"
    exit 1;
fi

if [ "$COMMAND" != "deploy" ] && [ "$COMMAND" != "deploy-snapshot" ] && [ "$COMMAND" != "install" ]; then
    echo "Usage: ./build.sh <kibana_version> <sg_plugin_version> <install|deploy>"
    echo "Unknown command: $COMMAND"
    exit 1;
fi

# sanity checks for maven
if [ -z "$MAVEN_HOME" ]; then
    echo "MAVEN_HOME not set"
    exit 1;
fi

echo "+++ Checking Maven version +++"
$MAVEN_HOME/bin/mvn -version
if [ $? != 0 ]; then
    echo "Checking maven version failed";
    exit 1;
fi

# sanity checks for nvm
if [ -z "$NVM_HOME" ]; then
    echo "NVM_HOME not set"
    exit 1;
fi

echo "+++ Sourcing nvm +++"
[ -s "$NVM_HOME/nvm.sh" ] && \. "$NVM_HOME/nvm.sh"

echo "+++ Checking nvm version +++"
nvm version
if [ $? != 0 ]; then
    echo "Checking mvn version failed";
    exit 1;
fi

# check version matches
WORK_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $WORK_DIR
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
if [ $? != 0 ]; then
    echo "Cleaning leftovers failed";
    exit 1;
fi

# prepare artefacts
PLUGIN_NAME="searchguard-kibana-$KIBANA_VERSION-$SG_PLUGIN_VERSION"
echo "+++ Building $PLUGIN_NAME.zip +++"

WORK_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$WORK_DIR"
BUILD_STAGE_DIR="$WORK_DIR/build_stage"
mkdir -p $BUILD_STAGE_DIR
cd $BUILD_STAGE_DIR

echo "+++ Cloning https://github.com/elastic/kibana.git +++"
git clone https://github.com/elastic/kibana.git || true > /dev/null 2>&1
if [ $? != 0 ]; then
    echo "Got clone Kibana repository failed";
    exit 1;
fi

cd "kibana"
git fetch

echo "+++ Change to tags/v$KIBANA_VERSION +++"
git checkout "tags/v$KIBANA_VERSION"

if [ $? != 0 ]; then
    echo "Switching to Kibana tags/v$KIBANA_VERSION failed";
    exit 1;
fi

echo "+++ Installing node version $(cat .node-version) +++"
nvm install "$(cat .node-version)"
if [ $? != 0 ]; then
    echo "Installing node $(cat .node-version) failed";
    exit 1;
fi

echo "+++ Installing Yarn +++"
curl -o- -L https://yarnpkg.com/install.sh | bash
if [ $? != 0 ]; then
    echo "Installing Yarn failed";
    exit 1;
fi

echo "+++ Sourcing Yarn +++"
export PATH="$HOME/.yarn/bin:$HOME/.config/yarn/global/node_modules/.bin:$PATH"

echo "+++ Copy plugin contents to build stage +++"
BUILD_STAGE_PLUGIN_DIR="$BUILD_STAGE_DIR/kibana/plugins/search-guard-kibana-plugin"
mkdir -p $BUILD_STAGE_PLUGIN_DIR
cp -a "$WORK_DIR/index.js" "$BUILD_STAGE_PLUGIN_DIR"
cp -a "$WORK_DIR/package.json" "$BUILD_STAGE_PLUGIN_DIR"
cp -a "$WORK_DIR/lib" "$BUILD_STAGE_PLUGIN_DIR"
cp -a "$WORK_DIR/public" "$BUILD_STAGE_PLUGIN_DIR"
cp -a "$WORK_DIR/utils" "$BUILD_STAGE_PLUGIN_DIR"
cp -a "$WORK_DIR/examples" "$BUILD_STAGE_PLUGIN_DIR"
cp -a "$WORK_DIR/tests" "$BUILD_STAGE_PLUGIN_DIR"
cp -a "$WORK_DIR/babel.config.js" "$BUILD_STAGE_PLUGIN_DIR"

cd $BUILD_STAGE_PLUGIN_DIR

echo "+++ Installing plugin node modules +++"
yarn kbn bootstrap
if [ $? != 0 ]; then
    echo "Installing node modules failed";
    exit 1;
fi

echo "+++ Testing (unit) UI +++"
testsResult=`./node_modules/.bin/jest --clearCache && ./node_modules/.bin/jest public --config ./tests/jest.config.js --json`
if [[ ! $testsResult =~ .*\"numFailedTests\":0.* ]]; then
  echo "Browser unit tests failed"
  exit 1
fi

echo "+++ Testing (unit) Server +++"
testsResult=`./node_modules/.bin/jest --clearCache && ./node_modules/.bin/jest lib --config ./tests/jest.config.js --json`
if [[ ! $testsResult =~ .*\"numFailedTests\":0.* ]]; then
  echo "Server unit tests failed"
  exit 1
fi

echo "+++ Installing plugin node modules for production +++"
rm -rf "node_modules"
yarn install --production --pure-lockfile
if [ $? != 0 ]; then
    echo "Installing node modules failed";
    exit 1;
fi

cd "$WORK_DIR"
rm -rf build/
rm -rf node_modules/

echo "+++ Copy plugin contents to finalize build +++"
COPYPATH="build/kibana/$PLUGIN_NAME"
mkdir -p "$COPYPATH"
cp -a "$BUILD_STAGE_PLUGIN_DIR/index.js" "$COPYPATH"
cp -a "$BUILD_STAGE_PLUGIN_DIR/package.json" "$COPYPATH"
cp -a "$BUILD_STAGE_PLUGIN_DIR/node_modules" "$COPYPATH"
cp -a "$BUILD_STAGE_PLUGIN_DIR/lib" "$COPYPATH"
cp -a "$BUILD_STAGE_PLUGIN_DIR/public" "$COPYPATH"
cp -a "$BUILD_STAGE_PLUGIN_DIR/utils" "$COPYPATH"
cp -a "$BUILD_STAGE_PLUGIN_DIR/examples" "$COPYPATH"

# Replace pom version
rm -f pom.xml

sed -e "s/RPLC_PLUGIN_VERSION/$KIBANA_VERSION-$SG_PLUGIN_VERSION/" ./pom.template.xml > ./pom.xml
if [ $? != 0 ]; then
    echo "sed failed";
    exit 1;
fi

if [ "$COMMAND" = "deploy" ] ; then
    echo "+++ mvn clean deploy -Prelease +++"
    $MAVEN_HOME/bin/mvn clean deploy -Prelease
    if [ $? != 0 ]; then
        echo "$MAVEN_HOME/bin/mvn clean deploy -Prelease failed";
        exit 1;
    fi
fi

#-s settings.xml is needed on circleci only
if [ "$COMMAND" = "deploy-snapshot" ] ; then
    echo "+++ mvn clean deploy +++"
    $MAVEN_HOME/bin/mvn clean deploy -s settings.xml
    if [ $? != 0 ]; then
        echo "$MAVEN_HOME/bin/mvn clean deploy -s settings.xml failed";
        exit 1;
    fi
fi

if [ "$COMMAND" = "install" ] ; then
    echo "+++ mvn clean install +++"
    $MAVEN_HOME/bin/mvn clean install
    if [ $? != 0 ]; then
        echo "$MAVEN_HOME/bin/mvn clean install failed";
        exit 1;
    fi
fi
