#!/bin/bash

start=`date +%s`
# WARNING! Do not use jq here, only bash.
COMMAND="$1"
EXIT_IF_VULNERABILITY=true

# sanity checks for options
if [ -z "$COMMAND" ]; then
    echo "Usage: ./build.sh <install-local|deploy-snapshot-maven>"
    exit 1
fi

if [ "$COMMAND" != "deploy-snapshot-maven" ] && [ "$COMMAND" != "install-local" ] && [ "$COMMAND" != "build-kibana" ]; then
    echo "Usage: ./build.sh <install-local|deploy-snapshot-maven|build-kibana>"
    echo "Unknown command: $COMMAND"
    exit 1
fi

echo "COMMAND: $COMMAND"

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

VERSION=$(grep -e '\bversion\b' package.json | tr -d "[:blank:]" | sed -E 's/"version":"(.*)"(.*)/\1/')
SG_TEST_VERSION=$(grep -e '\btest_sg_version\b' package.json | tr -d "[:blank:]" | sed -E 's/"test_sg_version":"(.*)"(.*)/\1/')

ES_VERSION=$(echo $SG_TEST_VERSION | cut -d "-" -f 1)
KIBANA_APP_BRANCH=$(grep -e '\bkibana_branch\b' package.json | tr -d "[:blank:]" | sed -E 's/"kibana_branch":"(.*)"(.*)/\1/')
KIBANA_VERSION=$(echo $VERSION | cut -d "-" -f 1)
KIBANA_PACKAGE_VERSION=$(echo $VERSION|rev|cut -d'-' -f2-|rev)
echo "+++ Cleanup any leftovers +++"
./clean.sh
if [ $? != 0 ]; then
    echo "Cleaning leftovers failed"
    exit 1
fi

# prepare artefacts
PLUGIN_NAME="searchguard-kibana-$KIBANA_PACKAGE_VERSION-SNAPSHOT"
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

echo "+++ Going to choose Kibana repo branch +++"
if [ -n "$KIBANA_APP_BRANCH" ]; then
  (git checkout "$KIBANA_APP_BRANCH" && echo "+++ Changed to $KIBANA_APP_BRANCH +++")  # >>"$WORK_DIR/build.log" 2>&1
    if [ $? != 0 ]; then
      echo "Switching to Kibana $KIBANA_APP_BRANCH failed"
      exit 1
    fi
else
  (git checkout "tags/v$KIBANA_VERSION" && echo "+++ Changed Kibana repository to v$KIBANA_VERSION +++")
    if [ $? != 0 ]; then
      echo "Switching to Kibana  $KIBANA_VERSION failed"
      exit 1
    fi
fi

#This is taken from Kibana GIT
KIBANA_APP_VERSION=$(grep -e '\bversion\b' package.json | tr -d "[:blank:]" | sed -E 's/"version":"(.*)",/\1/')
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
if [ "$COMMAND" == "build-kibana" ] ; then
  echo "Building Kibana package from checkout Kibana branch (see above) "
  yarn kbn bootstrap && yarn build --skip-os-packages --no-oss
  mv "/builds/search-guard/search-guard-kibana-plugin/build_stage/kibana/target/kibana-$KIBANA_APP_VERSION-SNAPSHOT-linux-x86_64.tar.gz" /builds/search-guard/search-guard-kibana-plugin/build_stage/kibana/target/kibana-linux-x86_64.tar.gz ||true
  exit 0
fi

echo "+++ Copy plugin contents to build stage +++"
BUILD_STAGE_PLUGIN_DIR="$BUILD_STAGE_DIR/kibana/plugins/search-guard-kibana-plugin"
mkdir -p $BUILD_STAGE_PLUGIN_DIR
cp -a "$WORK_DIR/index.js" "$BUILD_STAGE_PLUGIN_DIR"
cp -a "$WORK_DIR/package.json" "$BUILD_STAGE_PLUGIN_DIR"
cp -a "$WORK_DIR/kibana.json" "$BUILD_STAGE_PLUGIN_DIR"
cp -a "$WORK_DIR/lib" "$BUILD_STAGE_PLUGIN_DIR"
cp -a "$WORK_DIR/public" "$BUILD_STAGE_PLUGIN_DIR"
cp -a "$WORK_DIR/utils" "$BUILD_STAGE_PLUGIN_DIR"
cp -a "$WORK_DIR/examples" "$BUILD_STAGE_PLUGIN_DIR"
cp -a "$WORK_DIR/tests" "$BUILD_STAGE_PLUGIN_DIR"
cp -a "$WORK_DIR/patches" "$BUILD_STAGE_PLUGIN_DIR"
cp -a "$WORK_DIR/babel.config.js" "$BUILD_STAGE_PLUGIN_DIR"
cp -a "$WORK_DIR/server" "$BUILD_STAGE_PLUGIN_DIR"
cp -a "$WORK_DIR/__mocks__" "$BUILD_STAGE_PLUGIN_DIR"

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

# Build webpack bundles that must be part of the build since Kibana v7.9.
# The bundles are in the folder named "target".
echo "+++ Building webpack bundles +++"
yarn build:bundles

cd "$WORK_DIR"
rm -rf build/
rm -rf node_modules/

echo "+++ Copy plugin contents to finalize build +++"
COPYPATH="build/kibana/$PLUGIN_NAME"
mkdir -p "$COPYPATH"
cp -a "$BUILD_STAGE_PLUGIN_DIR/index.js" "$COPYPATH"
cp -a "$BUILD_STAGE_PLUGIN_DIR/package.json" "$COPYPATH"
cp -a "$BUILD_STAGE_PLUGIN_DIR/kibana.json" "$COPYPATH"
cp -a "$BUILD_STAGE_PLUGIN_DIR/node_modules" "$COPYPATH"
cp -a "$BUILD_STAGE_PLUGIN_DIR/lib" "$COPYPATH"
cp -a "$BUILD_STAGE_PLUGIN_DIR/public" "$COPYPATH"
cp -a "$BUILD_STAGE_PLUGIN_DIR/utils" "$COPYPATH"
cp -a "$BUILD_STAGE_PLUGIN_DIR/examples" "$COPYPATH"
cp -a "$BUILD_STAGE_PLUGIN_DIR/patches" "$COPYPATH"
cp -a "$BUILD_STAGE_PLUGIN_DIR/server" "$COPYPATH"
cp -a "$BUILD_STAGE_PLUGIN_DIR/target" "$COPYPATH"

end=`date +%s`
echo "Build time: $((end-start)) sec"

if [ "$COMMAND" == "deploy-snapshot-maven" ] ; then
    echo "+++ mvn clean deploy +++"
    $MAVEN_HOME/bin/mvn clean deploy -s settings.xml -Drevision="$KIBANA_PACKAGE_VERSION-SNAPSHOT"
    if [ $? != 0 ]; then
        echo "$MAVEN_HOME/bin/mvn clean deploy failed"
        exit 1
    fi
fi

if [ "$COMMAND" == "install-local" ] ; then
    echo "+++ mvn clean install +++"
    $MAVEN_HOME/bin/mvn clean install -Drevision="$KIBANA_PACKAGE_VERSION-SNAPSHOT"
    if [ $? != 0 ]; then
        echo "$MAVEN_HOME/bin/mvn clean install failed"
        exit 1
    fi
fi

end=`date +%s`
echo "Overall time: $((end-start)) sec"
