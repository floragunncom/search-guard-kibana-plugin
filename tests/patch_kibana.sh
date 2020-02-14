#!/bin/bash
echo "Replacing error with log message about Kibana and Elasticsearch versions incompatibility in Kibana source code"
sed -i.bak 's/isCompatible: ignoreVersionMismatch || incompatibleNodes.length === 0/isCompatible: true/' ../../src/core/server/elasticsearch/version_check/ensure_es_version.ts
