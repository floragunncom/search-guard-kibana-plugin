#!/usr/bin/bash
echo "Replacing error with log message about Kibana and Elasticsearch versions incompatibility in Kibana source code"
sed -i.bak 's/throw new Error/console.log/' ../../src/legacy/core_plugins/elasticsearch/lib/ensure_es_version.js