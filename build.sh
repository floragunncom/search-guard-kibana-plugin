#!/usr/bin/env bash

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
cd "$SCRIPT_DIR"

# sanity checks for nvm
if [ -z "$NVM_DIR" ]; then
    echo "NVM_DIR not set"
    exit 1
fi

echo "+++ Checking maven installed +++"
if ! [ -x "$(command -v mvn)" ]; then
    echo "Checking maven version failed"
    exit 1
else
    echo "    -> $(mvn --version | grep "Apache Maven" | cut -d ' ' -f 3) with Java $(mvn --version | grep "Java version" | cut -d ' ' -f 3 | tr -d ',')"
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

export SF_JSON=kibana.json
export SF_REPO_URL="https://github.com/elastic/kibana.git"
export SF_REPO_DIR=kibana
export SF_VERSION=$(grep '"version"' kibana.json | sed -E 's/.*"version" *: *"([^"]+)".*/\1/')   # 9.4.2

./ci/init_build.sh