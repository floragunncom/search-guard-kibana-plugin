#!/bin/bash

set -e

source ci/utils.sh

start_collapsed_section nvm "Installing NVM and Node"

curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.34.0/install.sh| bash
export NVM_HOME=~/.nvm
export NVM_DIR="$HOME/.nvm"

[ -s "$NVM_DIR/nvm.sh" ]; \. "$NVM_DIR/nvm.sh"

nvm install $NODE_VERSION

end_section nvm



# Kibana >= 9.5.5 uses pnpm instead of yarn. pnpm is provisioned through corepack in
# ci/init_build.sh, after the Node.js version required by the Kibana checkout is installed.
