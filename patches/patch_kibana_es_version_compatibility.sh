#!/bin/bash

set -e

echo
echo "Patching Kibana and Elasticsearch versions incompatibility in Kibana source code"
echo "ATTENTION! It is only for the developers! It doesn't work in a production environment."
echo

FILE_PATH="../../src/legacy/core_plugins/elasticsearch/lib/ensure_es_version.js"
sed -i.bak 's/throw new Error/console.log/' $FILE_PATH

echo "Patched $FILE_PATH. The original file backup is in $FILE_PATH.bak"
