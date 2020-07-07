#!/bin/bash

# This patch makes Kibana v8 compatible with SearchGuard.

COMMAND="$1"
IFS=$'\n'       # make newlines the only separator
set -f          # disable globbing to not expand file path on "/"

if [ -z "$COMMAND" ]; then
  COMMAND="prod"
fi

if [[ "$COMMAND" != "prod" && "$COMMAND" != "dev" ]]; then
  echo "Unknown command: $COMMAND"
  echo
  echo "Usage:"
  echo "./patch_kibana.sh               Patch Kibana v8 in a production environment."
  echo "./patch_kibana.sh dev           Patch Kibana v8 in a development environment."
  exit 1
fi

EXT="js"
if [[ "$COMMAND" == "dev" ]]; then
  EXT="ts"
fi

FILE_PATH="../../src/core/server/plugins/plugin_context.$EXT"
HAPI_DEPENDENCY="hapiServer: deps.http.server"

if grep -q $HAPI_DEPENDENCY $FILE_PATH; then
  echo "Success! There is no need to patch!"
  echo "The file $FILE_PATH was patched already. The original file backup is in $FILE_PATH.bak"
else
  mv "$FILE_PATH" "$FILE_PATH.bak"
  touch "$FILE_PATH"

  DO_INSERT=false

  for i in $(cat < "$FILE_PATH.bak"); do
    echo "$i"

    if [[ "$i" == *"function createPluginSetupContext"* ]]; then
      DO_INSERT=true
    fi

    if [[ "$i" == *"return {"* && "$DO_INSERT" == true ]]; then
      echo "    hapiServer: deps.http.server,"
      DO_INSERT=false
    fi
  done > "$FILE_PATH"

  echo "Success!"
  echo "Patched $FILE_PATH. The original file backup is in $FILE_PATH.bak"
fi
