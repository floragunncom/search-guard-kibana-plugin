#!/bin/bash

set -e

echo
echo "Patching Kibana and Elasticsearch versions incompatibility in Kibana source code"
echo "ATTENTION! It is only for the developers! It doesn't work in a production environment."
echo

FILE_PATH="../../src/core/server/elasticsearch/version_check/ensure_es_version.ts"
sed -i.bak 's/isCompatible: ignoreVersionMismatch || incompatibleNodes.length === 0/isCompatible: true/' $FILE_PATH 

echo "Patched $FILE_PATH. The original file backup is in $FILE_PATH.bak"