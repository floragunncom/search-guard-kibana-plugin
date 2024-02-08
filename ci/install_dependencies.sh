#!/bin/bash

source ci/utils.sh

start_collapsed_section nvm "Installing NVM and Node"

curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.34.0/install.sh| bash
export NVM_HOME=~/.nvm
export NVM_DIR="$HOME/.nvm"

[ -s "$NVM_DIR/nvm.sh" ]; \. "$NVM_DIR/nvm.sh"

nvm install $KIBANA_BUILD_NODE_VERSION

end_section nvm


start_collapsed_section corepack "Installing corepack"


echo "Removing installed yarn $YARN_VERSION"
npm uninstall -g yarn pnpm
rm -r /opt/yarn-v$YARN_VERSION
echo "Install corepack"
npm install -g corepack

end_section "corepack"