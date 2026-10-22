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



# pnpm is installed in ci/init_build.sh, once the Node version required by Kibana is active.
