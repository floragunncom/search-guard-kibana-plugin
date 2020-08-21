#!/bin/bash

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
  echo "./patch.sh               Patch Kibana in a production environment."
  echo "./patch.sh dev           Patch Kibana in a development environment."
  exit 1
fi

EXT="js"
if [[ "$COMMAND" == "dev" ]]; then
  EXT="ts"
fi

echo
echo "Patching Kibana and Elasticsearch versions incompatibility in Kibana source code"
echo

FILE_PATH="../../src/core/server/elasticsearch/version_check/ensure_es_version.$EXT"
sed -i.bak 's/isCompatible: ignoreVersionMismatch || incompatibleNodes.length === 0/isCompatible: true/' $FILE_PATH 

echo "Patched $FILE_PATH. The original file backup is in $FILE_PATH.bak"
