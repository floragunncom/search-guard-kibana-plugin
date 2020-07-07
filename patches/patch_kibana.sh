#!/bin/bash

# This patch makes Kibana v8 compatible with SearchGuard.

COMMAND="$1"
set -f
set -e

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

if grep -q "$HAPI_DEPENDENCY" "$FILE_PATH"; then
  echo "Success! There is no need to patch!"
  echo "The file $FILE_PATH was patched already. The original file backup is in $FILE_PATH.bak"
else
  mv $FILE_PATH "$FILE_PATH.bak"
  touch $FILE_PATH

  DO_INSERT=false

  while IFS="" read -r line || [ -n "$line" ]
  do
    printf "%s\n" "$line" >> $FILE_PATH

    if [[ "$line" == *"function createPluginSetupContext"* ]]; then
      DO_INSERT=true
    fi

    if [[ "$line" == *"return {"* && "$DO_INSERT" == true ]]; then
      printf "%s\n" "    hapiServer: deps.http.server," >> $FILE_PATH
      DO_INSERT=false
    fi
  done < "$FILE_PATH.bak"

  echo "Success!"
  echo "Patched $FILE_PATH. The original file backup is in $FILE_PATH.bak"
fi
