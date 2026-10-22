#!/bin/bash
# Saved objects storage as multitenancy sees it. Search Guard multitenancy stores tenant objects in
# Kibana's own saved object indices with a tenant-specific document id, and the plugin writes a
# default "space" document per tenant itself (server/applications/multitenancy/spaces_service.js).
# Any change in Kibana's index layout, aliases, or the space document therefore matters.
# Run after runtime_check.sh (which creates a dashboard in $TEST_TENANT). Needs the admin cert.
set -uo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/common.sh"
C=(-sk --cert "$RT/es/config/kirk.pem" --key "$RT/es/config/kirk-key.pem")
PY="python3 $(dirname "${BASH_SOURCE[0]}")/report_helpers.py"

step "Saved object indices and aliases (compare with the previous bump's output in references/)"
curl "${C[@]}" "$ES_URL/_cat/indices/.kibana*?h=index,docs.count,health&s=index"
echo "--- aliases"
curl "${C[@]}" "$ES_URL/_cat/aliases/.kibana*?h=alias,index&s=alias"

step "Which saved object types live in which index"
for idx in $(curl "${C[@]}" "$ES_URL/_cat/indices/.kibana*?h=index&s=index" | grep -vE '^\.ds-|security_session|locks'); do
  printf '%-45s ' "$idx"
  curl "${C[@]}" -H 'content-type: application/json' -d '{"size":0,"aggs":{"t":{"terms":{"field":"type","size":60}}}}' "$ES_URL/$idx/_search" \
    | $PY types
done

step "Tenant documents: Search Guard stores them with an id suffix (__sg_ten__<hash>_<tenant>) and an sg_tenant field"
curl "${C[@]}" -H 'content-type: application/json' -d '{"size":200,"_source":["type","sg_tenant"],"query":{"exists":{"field":"sg_tenant"}}}' "$ES_URL/.kibana*/_search" | $PY tenant-docs "$TEST_TENANT"

step "Default space document: Kibana's own (global tenant) vs the one the plugin writes (tenant)"
curl "${C[@]}" -H 'content-type: application/json' -d '{"size":20,"query":{"term":{"type":"space"}}}' "$ES_URL/.kibana*/_search" | $PY space-diff
echo "SO_INDEX_CHECK_DONE"
