#!/bin/bash

source ci/utils.sh

start_collapsed_section nvm "Installing NVM and Node"

curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.34.0/install.sh| bash
export NVM_HOME=~/.nvm
export NVM_DIR="$HOME/.nvm"

[ -s "$NVM_DIR/nvm.sh" ]; \. "$NVM_DIR/nvm.sh"

nvm install $NODE_VERSION

end_section nvm



start_collapsed_section yarn_install "Installing Yarn"

export PATH="$HOME/.yarn/bin:$HOME/.config/yarn/global/node_modules/.bin:$PATH"

if ! [ -x "$(command -v yarn)" ]; then
  echo "+++ Installing Yarn +++"
  curl -Ss -o- -L https://yarnpkg.com/install.sh | bash  -x
else
  echo "    -> $(yarn -v)"
fi

end_section "yarn_install"
