#!/bin/bash

start=`date +%s`
# WARNING! Do not use jq here, only bash.
COMMAND="$1"
KIBANA_BRANCH="$2"
EXIT_IF_VULNERABILITY=true

# sanity checks for options
if [ -z "$COMMAND" ]; then
    echo "Usage:"
    echo "    build.sh deploy-snapshot-maven          Deploy snapshot to maven repository."
    echo "    build.sh install-local                  Build a distributable archive of the plugin locally."
    echo "    build.sh install-local tags/v7.6.2      Build for a specific Kibana tag."
    echo "    build.sh install-local master           Build for a specific Kibana branch."
    exit 1
fi

if [ "$COMMAND" != "deploy-snapshot-maven" ] && [ "$COMMAND" != "install-local" ]; then
    echo "Usage: ./build.sh <install-local|deploy-snapshot-maven>"
    echo "Unknown command: $COMMAND"
    exit 1
fi

# sanity checks for maven
if [ -z "$MAVEN_HOME" ]; then
    echo "MAVEN_HOME not set"
    exit 1
fi

# sanity checks for nvm
if [ -z "$NVM_DIR" ]; then
    echo "NVM_DIR not set"
    exit 1
fi

echo "+++ Checking maven installed +++"
if ! [ -x "$(command -v $MAVEN_HOME/bin/mvn)" ]; then
    echo "Checking maven version failed"
    exit 1
else
    echo "    -> $($MAVEN_HOME/bin/mvn --version | grep "Apache Maven" | cut -d ' ' -f 3) with Java $($MAVEN_HOME/bin/mvn --version | grep "Java version" | cut -d ' ' -f 3 | tr -d ',')"
fi

# sanity checks for nvm
if [ -z "$NVM_DIR" ]; then
    echo "NVM_DIR not set"
    exit 1
fi

echo "+++ Checking npm installed (optional) +++"
if ! [ -x "$(command -v npm)" ]; then
    echo "    -> not installed"
else
    echo "    -> $(npm -v)"
fi

echo "+++ Sourcing nvm ($NVM_DIR) +++"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm


echo "+++ Checking nvm installed +++"
NVM_VERSION=$(nvm --version)
if [ "$?" != 0 ]; then
    echo "Checking nvm version failed ($NVM_VERSION)"
    exit 1
else
    echo "    ->  $NVM_VERSION"
fi

# check for snapshot
WORK_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $WORK_DIR
grep "\-SNAPSHOT" package.json > /dev/null 2>&1
if [ $? != 0 ]; then
    echo "Not a snapshot version in package.json"
    exit 1
fi

VERSION=$(cat package.json | tr -d '"' | tr -d ',' | grep version: | tr -d ' ' | tr -d 'version:')
KIBANA_VERSION=$(echo $VERSION | cut -d "-" -f 1)
SG_PLUGIN_VERSION=$(echo $VERSION | cut -d "-" -f 2)
SNAPSHOT=$(echo $VERSION | cut -d "-" -f 3)

if [ $SNAPSHOT != "SNAPSHOT" ]; then
    echo "$KIBANA_VERSION-$SG_PLUGIN_VERSION is not a SNAPSHOT version"
    exit 1
fi

echo "+++ Cleanup any leftovers +++"
./clean.sh
if [ $? != 0 ]; then
    echo "Cleaning leftovers failed"
    exit 1
fi

# prepare artefacts
PLUGIN_NAME="searchguard-kibana-$KIBANA_VERSION-$SG_PLUGIN_VERSION-SNAPSHOT"
echo "+++ Building $PLUGIN_NAME.zip +++"

WORK_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$WORK_DIR"
BUILD_STAGE_DIR="$WORK_DIR/build_stage"
mkdir -p $BUILD_STAGE_DIR
cd $BUILD_STAGE_DIR

rm -f "$WORK_DIR/build.log"

echo "Logfile: $WORK_DIR/build.log"

echo "+++ Cloning https://github.com/elastic/kibana.git +++"
git clone https://github.com/elastic/kibana.git >>"$WORK_DIR/build.log" 2>&1

cd "kibana"
git fetch >>"$WORK_DIR/build.log" 2>&1

if [ "$KIBANA_BRANCH" == "" ]; then
  KIBANA_BRANCH="tags/v$KIBANA_VERSION"
fi

echo "+++ Change to $KIBANA_BRANCH +++"
git checkout "$KIBANA_BRANCH" >>"$WORK_DIR/build.log" 2>&1

if [ $? != 0 ]; then
    echo "Switching to Kibana $KIBANA_BRANCH failed"
    exit 1
fi

echo "+++ Installing node version $(cat .node-version) +++"
nvm install "$(cat .node-version)" >>"$WORK_DIR/build.log" 2>&1
if [ $? != 0 ]; then
    echo "Installing node $(cat .node-version) failed"
    exit 1
else
    echo "    -> $(cat .node-version)"
fi

echo "+++ Sourcing Yarn +++"
export PATH="$HOME/.yarn/bin:$HOME/.config/yarn/global/node_modules/.bin:$PATH"

if ! [ -x "$(command -v yarn)" ]; then
    echo "+++ Installing Yarn +++"
    curl -Ss -o- -L https://yarnpkg.com/install.sh | bash >>"$WORK_DIR/build.log" 2>&1
    if [ $? != 0 ]; then
        echo "Installing Yarn failed"
        exit 1
    fi
else
echo "    -> $(yarn -v)"
fi


echo "+++ Copy plugin contents to build stage +++"
BUILD_STAGE_PLUGIN_DIR="$BUILD_STAGE_DIR/kibana/plugins/search-guard-kibana-plugin"
mkdir -p $BUILD_STAGE_PLUGIN_DIR
cp -a "$WORK_DIR/index.js" "$BUILD_STAGE_PLUGIN_DIR"
cp -a "$WORK_DIR/package.json" "$BUILD_STAGE_PLUGIN_DIR"
cp -a "$WORK_DIR/lib" "$BUILD_STAGE_PLUGIN_DIR"
cp -a "$WORK_DIR/server" "$BUILD_STAGE_PLUGIN_DIR"
cp -a "$WORK_DIR/public" "$BUILD_STAGE_PLUGIN_DIR"
cp -a "$WORK_DIR/utils" "$BUILD_STAGE_PLUGIN_DIR"
cp -a "$WORK_DIR/examples" "$BUILD_STAGE_PLUGIN_DIR"
cp -a "$WORK_DIR/tests" "$BUILD_STAGE_PLUGIN_DIR"
cp -a "$WORK_DIR/babel.config.js" "$BUILD_STAGE_PLUGIN_DIR"
cp -a "$WORK_DIR/patch_kibana.sh" "$BUILD_STAGE_PLUGIN_DIR"
cp -a "$WORK_DIR/kibana.json" "$BUILD_STAGE_PLUGIN_DIR"

cd $BUILD_STAGE_PLUGIN_DIR

echo "+++ Checking yarn packages for vulnerabilities +++"
auditResult=`yarn audit --groups dependencies --level 4 2>&1`
isNoVulnerability="[^\d]0 vulnerabilities found.*$"
let limit=1*10**20 # Limit num of chars because the result can be huge
if [[ ! $auditResult =~ $isNoVulnerability && $EXIT_IF_VULNERABILITY = true ]]; then
    echo ${auditResult::limit}
#    exit 1
fi
echo ${auditResult::limit} >>"$WORK_DIR/build.log" 2>&1

echo "+++ Installing plugin node modules +++"
yarn kbn bootstrap >>"$WORK_DIR/build.log" 2>&1
if [ $? != 0 ]; then
    echo "Installing node modules failed"
    exit 1
fi

echo "+++ Testing UI +++"
uitestsResult=`./node_modules/.bin/jest --clearCache && ./node_modules/.bin/jest public --config ./tests/jest.config.js --silent --json`
echo $uitestsResult >>"$WORK_DIR/build.log" 2>&1
if [[ ! $uitestsResult =~ .*\"numFailedTests\":0.* || ! $uitestsResult =~ .*\"numFailedTestSuites\":0.* ]]; then
  echo "Browser tests failed"
  exit 1
fi

echo "+++ Testing UI Server +++"
srvtestsResult=`./node_modules/.bin/jest --clearCache && ./node_modules/.bin/jest lib --config ./tests/jest.config.js --passWithNoTests --silent --json`
echo $srvtestsResult >>"$WORK_DIR/build.log" 2>&1
if [[ ! $srvtestsResult =~ .*\"numFailedTests\":0.* || ! $srvtestsResult =~ .*\"numFailedTestSuites\":0.* ]]; then
    echo "Server unit tests failed"
    exit 1
fi

echo "+++ Installing plugin node modules for production +++"
rm -rf "node_modules"
yarn install --production --pure-lockfile >>"$WORK_DIR/build.log" 2>&1
if [ $? != 0 ]; then
    echo "Installing node modules failed"
    exit 1
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
cp -a "$BUILD_STAGE_PLUGIN_DIR/server" "$COPYPATH"
cp -a "$BUILD_STAGE_PLUGIN_DIR/public" "$COPYPATH"
cp -a "$BUILD_STAGE_PLUGIN_DIR/utils" "$COPYPATH"
cp -a "$BUILD_STAGE_PLUGIN_DIR/examples" "$COPYPATH"
cp -a "$BUILD_STAGE_PLUGIN_DIR/patch_kibana.sh" "$COPYPATH"
cp -a "$BUILD_STAGE_PLUGIN_DIR/kibana.json" "$COPYPATH"

end=`date +%s`
echo "Build time: $((end-start)) sec"

if [ "$COMMAND" == "deploy-snapshot-maven" ] ; then
    echo "+++ mvn clean deploy +++"
    $MAVEN_HOME/bin/mvn clean deploy -s settings.xml -Drevision="$KIBANA_VERSION-$SG_PLUGIN_VERSION-SNAPSHOT"
    if [ $? != 0 ]; then
        echo "$MAVEN_HOME/bin/mvn clean deploy failed"
        exit 1
    fi
fi

if [ "$COMMAND" == "install-local" ] ; then
    echo "+++ mvn clean install +++"
    $MAVEN_HOME/bin/mvn clean install -Drevision="$KIBANA_VERSION-$SG_PLUGIN_VERSION-SNAPSHOT"
    if [ $? != 0 ]; then
        echo "$MAVEN_HOME/bin/mvn clean install failed"
        exit 1
    fi
fi

end=`date +%s`
echo "Overall time: $((end-start)) sec"
