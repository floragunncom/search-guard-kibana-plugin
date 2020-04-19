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

PATH_TO_PLUGIN_CONTEXT="../../src/core/server/plugins/plugin_context.$EXT"

mv "$PATH_TO_PLUGIN_CONTEXT" "$PATH_TO_PLUGIN_CONTEXT.bak"
touch "$PATH_TO_PLUGIN_CONTEXT"

DO_INSERT_IN_FN_createPluginInitializerContext=false
DO_INSERT_IN_FN_createPluginSetupContext=false

for i in $(cat < "$PATH_TO_PLUGIN_CONTEXT.bak"); do
  echo "$i"

  if [[ "$i" == *"function createPluginInitializerContext"* ]]; then
    DO_INSERT_IN_FN_createPluginInitializerContext=true
  fi

  if [[ "$i" == *"return {"* && "$DO_INSERT_IN_FN_createPluginInitializerContext" == true ]]; then
    echo "    configService: coreContext.configService,"
    echo "    envAll: { ...coreContext.env },"
    DO_INSERT_IN_FN_createPluginInitializerContext=false
  fi

  if [[ "$i" == *"function createPluginSetupContext"* ]]; then
    DO_INSERT_IN_FN_createPluginSetupContext=true
  fi

  if [[ "$i" == *"return {"* && "$DO_INSERT_IN_FN_createPluginSetupContext" == true ]]; then
    echo "    hapiServer: deps.http.server,"
    DO_INSERT_IN_FN_createPluginSetupContext=false
  fi
done > "$PATH_TO_PLUGIN_CONTEXT"

