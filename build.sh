#!/bin/bash

start=`date +%s`
# WARNING! Do not use jq here, only bash.
COMMAND="$1"
EXIT_IF_VULNERABILITY=true
output=$(mktemp)

# sanity checks for options
if [ -z "$COMMAND" ]; then
    echo "Usage: ./build.sh <install-local|deploy-snapshot-maven>"
    exit 1
fi

if [ "$COMMAND" != "deploy-snapshot-maven" ] && [ "$COMMAND" != "install-local" ] && [ "$COMMAND" != "build-kibana" ] && [ "$COMMAND" != "build" ]; then
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
grep "\-SNAPSHOT" package.json > /dev/null &> $output
if [ $? != 0 ]; then
    echo "Not a snapshot version in package.json"
    cat $output
    exit 1
fi

VERSION=$(grep -e '\bversion\b' package.json | tr -d "[:blank:]" | sed -E 's/"version":"(.*)"(.*)/\1/')
SG_TEST_VERSION=$(grep -e '\btest_sg_version\b' package.json | tr -d "[:blank:]" | sed -E 's/"test_sg_version":"(.*)"(.*)/\1/')

ES_VERSION=$(echo $SG_TEST_VERSION | cut -d "-" -f 1)
KIBANA_APP_BRANCH=$(grep -e '\bkibana_branch\b' package.json | tr -d "[:blank:]" | sed -E 's/"kibana_branch":"(.*)"(.*)/\1/')
KIBANA_VERSION=$(echo $VERSION | cut -d "-" -f 1)
KIBANA_PLUGIN_VERSION=$(echo $VERSION | cut -d "-" -f 2)

SNAPSHOT=$(echo $VERSION | cut -d "-" -f 3)

if [ $SNAPSHOT != "SNAPSHOT" ]; then
    echo "$VERSION is not a SNAPSHOT version"
    exit 1
fi

echo "+++ Cleanup any leftovers +++"
./clean.sh
if [ $? != 0 ]; then
    echo "Cleaning leftovers failed"
    exit 1
fi

# prepare artefacts
PLUGIN_NAME="searchguard-kibana-$KIBANA_VERSION-$KIBANA_PLUGIN_VERSION-SNAPSHOT"
echo "+++ Building $PLUGIN_NAME.zip +++"

WORK_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$WORK_DIR"
BUILD_STAGE_DIR="$WORK_DIR/build_stage"
mkdir -p $BUILD_STAGE_DIR
cd $BUILD_STAGE_DIR

rm -f "$WORK_DIR/build.log"

echo "Logfile: $WORK_DIR/build.log"

if [ -n "$KIBANA_APP_BRANCH" ]; then
  KIBANA_BRANCH_NAME="$KIBANA_APP_BRANCH"
else
  KIBANA_BRANCH_NAME="v$KIBANA_VERSION"
fi

echo -e "\e[0Ksection_start:`date +%s`:kibana_clone\r\e[0KCloning https://github.com/elastic/kibana.git $KIBANA_BRANCH_NAME"

#git clone --depth 1 --branch $KIBANA_BRANCH_NAME https://github.com/elastic/kibana.git >>"$WORK_DIR/build.log" &> $output
#if [ $? != 0 ]; then
#    echo "Failed to clone Kibana"
#    cat $output
#    exit 1
#fi

echo -e "\e[0Ksection_end:`date +%s`:kibana_clone\r\e[0K"

cd "kibana"

#This is taken from Kibana GIT
KIBANA_APP_VERSION=$(grep -e '\bversion\b' package.json | tr -d "[:blank:]" | sed -E 's/"version":"(.*)",/\1/')

echo "KIBANA_APP_VERSION: $KIBANA_APP_VERSION"

echo -e "\e[0Ksection_start:`date +%s`:node_install\r\e[0KInstalling node"

echo "+++ Installing node version $(cat .node-version) +++"
nvm install "$(cat .node-version)" >>"$WORK_DIR/build.log" &> $output
if [ $? != 0 ]; then
    echo "Installing node $(cat .node-version) failed"
    cat $output
    exit 1
else
    echo "    -> $(cat .node-version)"
fi

echo -e "\e[0Ksection_end:`date +%s`:node_install\r\e[0K"

echo -e "\e[0Ksection_start:`date +%s`:yarn_install\r\e[0KSourcing Yarn"

echo "+++ Sourcing Yarn +++"
export PATH="$HOME/.yarn/bin:$HOME/.config/yarn/global/node_modules/.bin:$PATH"

if ! [ -x "$(command -v yarn)" ]; then
    echo "+++ Installing Yarn +++"
    curl -Ss -o- -L https://yarnpkg.com/install.sh | bash >>"$WORK_DIR/build.log" &> $output
    if [ $? != 0 ]; then
        echo "Installing Yarn failed"
        cat $output
        exit 1
    fi
else
echo "    -> $(yarn -v)"
fi

echo -e "\e[0Ksection_end:`date +%s`:yarn_install\r\e[0K"


if [ "$COMMAND" == "build-kibana" ] ; then
  echo "Building Kibana package from checkout Kibana branch (see above) "
  yarn kbn bootstrap && yarn build --skip-os-packages --no-oss
  mv "/builds/search-guard/search-guard-kibana-plugin/build_stage/kibana/target/kibana-$KIBANA_APP_VERSION-SNAPSHOT-linux-x86_64.tar.gz" /builds/search-guard/search-guard-kibana-plugin/build_stage/kibana/target/kibana-linux-x86_64.tar.gz ||true
  exit 0
fi

echo "+++ Copy plugin contents to build stage +++"
BUILD_STAGE_PLUGIN_DIR="$BUILD_STAGE_DIR/kibana/plugins/search-guard-kibana-plugin"
mkdir -p $BUILD_STAGE_PLUGIN_DIR
cp -a "$WORK_DIR/babel.config.js" "$BUILD_STAGE_PLUGIN_DIR"
cp -a "$WORK_DIR/package.json" "$BUILD_STAGE_PLUGIN_DIR"
cp -a "$WORK_DIR/kibana.json" "$BUILD_STAGE_PLUGIN_DIR"
cp -a "$WORK_DIR/tsconfig.json" "$BUILD_STAGE_PLUGIN_DIR"
cp -a "$WORK_DIR/public" "$BUILD_STAGE_PLUGIN_DIR"
cp -a "$WORK_DIR/server" "$BUILD_STAGE_PLUGIN_DIR"
cp -a "$WORK_DIR/common" "$BUILD_STAGE_PLUGIN_DIR"
cp -a "$WORK_DIR/tests" "$BUILD_STAGE_PLUGIN_DIR"
cp -a "$WORK_DIR/__mocks__" "$BUILD_STAGE_PLUGIN_DIR"
cd $BUILD_STAGE_PLUGIN_DIR

echo -e "\e[0Ksection_start:`date +%s`:yarn_audit\r\e[0KChecking yarn packages for vulnerabilities"

echo "+++ Checking yarn packages for vulnerabilities +++"
auditResult=`yarn audit --groups dependencies --level 4 2>&1`
isNoVulnerability="[^\d]0 vulnerabilities found.*$"
let limit=1*10**20 # Limit num of chars because the result can be huge
if [[ ! $auditResult =~ $isNoVulnerability && $EXIT_IF_VULNERABILITY = true ]]; then
    echo ${auditResult::limit}
#    exit 1
fi
echo ${auditResult::limit} >>"$WORK_DIR/build.log" 2>&1

echo -e "\e[0Ksection_end:`date +%s`:yarn_audit\r\e[0K"

echo -e "\e[0Ksection_start:`date +%s`:yarn_kbn_bootstrap\r\e[0KInstalling plugin node modules"

echo "+++ Installing plugin node modules +++"
yarn kbn bootstrap --oss
if [ $? != 0 ]; then
    echo "Installing node modules failed"
    cat $output
    exit 1
fi

echo -e "\e[0Ksection_end:`date +%s`:yarn_kbn_bootstrap\r\e[0K"

echo -e "\e[0Ksection_start:`date +%s`:tests\r\e[0KTests"

echo "+++ Testing UI +++"
uitestsResult=`../../node_modules/.bin/jest --clearCache && ../../node_modules/.bin/jest --testPathIgnorePatterns=server --config ./tests/jest.config.js --silent --json`
echo $uitestsResult >>"$WORK_DIR/build.log" 2>&1
if [[ ! $uitestsResult =~ .*\"numFailedTests\":0.* || ! $uitestsResult =~ .*\"numFailedTestSuites\":0.* ]]; then
  echo "Browser tests failed"
  exit 1
fi

echo "+++ Testing UI Server +++"
srvtestsResult=`../../node_modules/.bin/jest --clearCache && ../../node_modules/.bin/jest --testPathIgnorePatterns=public  --config ./tests/jest.config.js --silent --json`
echo $srvtestsResult >>"$WORK_DIR/build.log" 2>&1
if [[ ! $srvtestsResult =~ .*\"numFailedTests\":0.* || ! $srvtestsResult =~ .*\"numFailedTestSuites\":0.* ]]; then
    echo "Server unit tests failed"
    exit 1
fi

echo -e "\e[0Ksection_end:`date +%s`:tests\r\e[0K"

echo -e "\e[0Ksection_start:`date +%s`:package\r\e[0KPackaging"

echo "+++ Installing plugin node modules for production +++"
rm -rf "node_modules"
yarn install --production >>"$WORK_DIR/build.log" &> $output
if [ $? != 0 ]; then
    echo "Installing node modules failed"
    cat $output
    exit 1
fi

echo "+++ Building webpack bundles for the the browser code  +++"
echo "+++ And transpiling the server code  +++"
yarn build -v $KIBANA_VERSION --skip-archive
# The following files may be omitted by the Kibana build helpers but we must have them.
mv node_modules build/kibana/searchguard
cp -a "$WORK_DIR/public" build/kibana/searchguard
cp -a "$WORK_DIR/package.json" build/kibana/searchguard
cp -a "$WORK_DIR/install_demo_configuration.ps1" build/kibana/searchguard
cp -a "$WORK_DIR/install_demo_configuration.sh" build/kibana/searchguard
cp -a "$WORK_DIR/install_demo_configuration.js" build/kibana/searchguard

echo "+++ Copy plugin contents to finalize build +++"
cd "$WORK_DIR"
rm -rf build
mv "$BUILD_STAGE_PLUGIN_DIR/build" build
mv build/kibana/searchguard "build/kibana/$PLUGIN_NAME"

echo -e "\e[0Ksection_end:`date +%s`:package\r\e[0K"


end=`date +%s`
echo "Build time: $((end-start)) sec"

if [ "$COMMAND" == "deploy-snapshot-maven" ] ; then
	echo -e "\e[0Ksection_start:`date +%s`:deploy[collapsed=true]\r\e[0KDeploying"

    echo "+++ mvn clean deploy +++"
    $MAVEN_HOME/bin/mvn clean deploy -s settings.xml -Drevision="$KIBANA_VERSION-$KIBANA_PLUGIN_VERSION-SNAPSHOT"
    if [ $? != 0 ]; then
        echo "$MAVEN_HOME/bin/mvn clean deploy failed"
        exit 1
    fi
    
    echo -e "\e[0Ksection_end:`date +%s`:deploy\r\e[0K"
fi

if [ "$COMMAND" == "install-local" ] ; then
    echo "+++ mvn clean install +++"
    $MAVEN_HOME/bin/mvn clean install -Drevision="$KIBANA_VERSION-$KIBANA_PLUGIN_VERSION-SNAPSHOT"
    if [ $? != 0 ]; then
        echo "$MAVEN_HOME/bin/mvn clean install failed"
        exit 1
    fi
fi

end=`date +%s`
echo "Overall time: $((end-start)) sec"
