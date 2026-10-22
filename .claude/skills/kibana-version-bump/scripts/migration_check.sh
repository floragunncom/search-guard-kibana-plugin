#!/bin/bash
# Usage: migration_check.sh OLD_KIBANA NEW_KIBANA OLD_SG NEW_SG [--old-zip PATH] [--new-zip PATH] [--phase seed|upgrade|verify|all]
#
# Optional upgrade check: does tenant data created under the PREVIOUS Kibana + plugin survive the
# saved objects migration to the NEW one? Runs in its own work dir ($SCRATCH/mig), never in $RT.
#   1. old stack  : Elasticsearch OLD + Search Guard OLD_SG, Kibana OLD + the old plugin zip
#   2. seed       : dashboards and a visualization in the global tenant and in $TEST_TENANT (and
#                   $TEST_TENANT2 if set), plus a Signals watch; inventory written to $MIG/before/
#   3. upgrade    : Elasticsearch NEW on the OLD data directory with Search Guard NEW_SG, then
#                   Kibana NEW with the new plugin zip -> Kibana migrates the .kibana* indices
#   4. verify     : migration finished without errors, tenant docs kept their suffix and count,
#                   every seeded object is readable in its tenant and invisible from the global one
# Old plugin zip: --old-zip, else the published release
#   maven.search-guard.com/.../search-guard-flx-kibana-plugin/<OLD_SG>-es-<OLD>/...zip
# New plugin zip: --new-zip, else $RT/searchguard-<NEW>.zip from local_build.sh.
# Stop the regular runtime stack first (runtime_stop.sh); both use ports 9200 and 5601.
set -uo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/common.sh"
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OLD="${1:?old kibana version}"; NEW="${2:?new kibana version}"; OLD_SG="${3:?old sg version}"; NEW_SG="${4:?new sg version}"; shift 4
OLD_ZIP=""; NEW_ZIP="$RT/searchguard-$NEW.zip"; PHASE=all
while [ $# -gt 0 ]; do case "$1" in --old-zip) OLD_ZIP="$2"; shift 2;; --new-zip) NEW_ZIP="$2"; shift 2;; --phase) PHASE="$2"; shift 2;; *) echo "unknown arg $1"; exit 1;; esac; done
MIG="${SCRATCH:?}/mig"; mkdir -p "$MIG/before" "$MIG/after" "$DL"
export RT="$MIG"            # every helper script now works on the migration stack
C=(-sk --cert "$MIG/es/config/kirk.pem" --key "$MIG/es/config/kirk-key.pem")
H=(-H 'x-elastic-internal-origin: Kibana'); J="$COOKIES"
# no private tenant: Search Guard removed __user__ support; add more named tenants via TEST_TENANT2=...
TENANTS=("SGS_GLOBAL_TENANT" "$TEST_TENANT" ${TEST_TENANT2:+"$TEST_TENANT2"})
slug() { echo "$1" | tr -c 'a-zA-Z0-9\n' '-' | tr 'A-Z' 'a-z'; }
# The plugin's POST /multitenancy/tenant handler uses a module-level sessionStorageFactory that only
# the GET handler initialises (same code in 9.4.3 and 9.5.5); the UI always GETs first, curl must too.
prime_tenant_api() { curl -s "${H[@]}" -b "$J" -c "$J" -o /dev/null "$KB_URL/api/v1/multitenancy/tenant"; }
switch_tenant() { curl -s "${KBN_HDR[@]}" -b "$J" -c "$J" -o /dev/null -w '%{http_code}' -d "{\"tenant\":\"$1\",\"username\":\"$ADMIN_USER\"}" "$KB_URL/api/v1/multitenancy/tenant"; }
tenant_counts() {  # docs per sg_tenant value across .kibana*
  curl "${C[@]}" -H 'content-type: application/json' -d '{"size":0,"query":{"exists":{"field":"sg_tenant"}},"aggs":{"t":{"terms":{"field":"sg_tenant","size":50}}}}' "$ES_URL/.kibana*/_search" \
    | python3 "$HERE/report_helpers.py" tenant-counts 2>/dev/null
}
dl() { [ -s "$DL/$1" ] && echo "have $1" || { echo "fetching $1"; curl -sSfL --http1.1 --retry 3 --retry-all-errors -o "$DL/$1.part" "$2" && mv "$DL/$1.part" "$DL/$1"; }; }

if [ "$PHASE" = all ] || [ "$PHASE" = seed ]; then
  section "Phase 1: old stack Kibana $OLD + Search Guard $OLD_SG in $MIG"
  if [ -z "$OLD_ZIP" ]; then
    OLD_ZIP="$DL/sg-kibana-plugin-$OLD_SG-es-$OLD.zip"
    dl "$(basename "$OLD_ZIP")" "$SG_MAVEN/search-guard-flx-kibana-plugin/$OLD_SG-es-$OLD/search-guard-flx-kibana-plugin-$OLD_SG-es-$OLD.zip" || true
  fi
  [ -s "$OLD_ZIP" ] || { echo "no old plugin zip ($OLD_ZIP); pass --old-zip"; exit 1; }
  [ -s "$NEW_ZIP" ] || { echo "no new plugin zip ($NEW_ZIP); run local_build.sh or pass --new-zip"; exit 1; }
  "$HERE/runtime_stop.sh" >/dev/null 2>&1 || true     # RT is $MIG here: leftovers of an earlier (aborted) run would keep ports 9200/5601
  for d in es kb es-old kb-old; do rm -rf "${MIG:?}/$d"; done
  rm -f "${MIG:?}"/*.log "${MIG:?}"/*.pid "$MIG/before/"* "$MIG/after/"*
  "$HERE/runtime_setup.sh" "$OLD" "$OLD_SG" "$OLD_ZIP" > "$MIG/setup-old.log" 2>&1 || { echo "old stack did not come up (see $MIG/setup-old.log):"; tail -15 "$MIG/setup-old.log"; exit 1; }
  grep -E '#####|ES \+ SG|MT:|Kibana is now|FATAL|EXITED|failed' "$MIG/setup-old.log" || true

  section "Phase 2: seed tenant data under Kibana $OLD"
  kibana_login; prime_tenant_api
  curl -s -b "$J" "${KBN_HDR[@]}" -o /dev/null -w 'data view status=%{http_code}\n' -d '{"data_view":{"title":"sg-mig-*","name":"sg-mig","allowNoIndex":true},"override":true}' "$KB_URL/api/data_views/data_view"
  : > "$MIG/before/objects.txt"
  for t in "${TENANTS[@]}"; do
    echo "tenant $t: switch=$(switch_tenant "$t")"
    for n in 1 2; do
      id="mig-$(slug "$t")-$n"
      code=$(curl -s "${KBN_HDR[@]}" -b "$J" -o /dev/null -w '%{http_code}' -d "{\"attributes\":{\"title\":\"$id\",\"description\":\"seeded in $t under Kibana $OLD\",\"panelsJSON\":\"[]\",\"optionsJSON\":\"{}\",\"timeRestore\":false,\"kibanaSavedObjectMeta\":{\"searchSourceJSON\":\"{}\"}}}" "$KB_URL/api/saved_objects/dashboard/$id")
      echo "  dashboard $id -> $code"; echo "$t dashboard $id" >> "$MIG/before/objects.txt"
    done
    id="mig-vis-$(slug "$t")"
    code=$(curl -s "${KBN_HDR[@]}" -b "$J" -o /dev/null -w '%{http_code}' -d "{\"attributes\":{\"title\":\"$id\",\"visState\":\"{}\",\"uiStateJSON\":\"{}\",\"kibanaSavedObjectMeta\":{\"searchSourceJSON\":\"{}\"}}}" "$KB_URL/api/saved_objects/visualization/$id")
    echo "  visualization $id -> $code"; echo "$t visualization $id" >> "$MIG/before/objects.txt"
  done
  switch_tenant SGS_GLOBAL_TENANT >/dev/null
  "$HERE/seed_watch.sh" sg_mig_watch | grep status
  echo "--- tenant doc counts before:"; tenant_counts | tee "$MIG/before/tenant-counts.txt"
  "$HERE/so_index_check.sh" > "$MIG/before/so-indices.txt" 2>&1; grep -E '^\.kibana' "$MIG/before/so-indices.txt" | head -20
fi

if [ "$PHASE" = all ] || [ "$PHASE" = upgrade ]; then
  section "Phase 3: upgrade in place to Elasticsearch/Kibana $NEW, Search Guard $NEW_SG"
  "$HERE/runtime_stop.sh" >/dev/null; sleep 3
  [ -d "$MIG/es-old" ] || mv "$MIG/es" "$MIG/es-old"
  [ -d "$MIG/kb-old" ] || mv "$MIG/kb" "$MIG/kb-old"
  dl "elasticsearch-$NEW.tar.gz" "https://artifacts.elastic.co/downloads/elasticsearch/elasticsearch-$NEW-linux-$ES_ARCH.tar.gz"
  dl "kibana-$NEW.tar.gz" "https://artifacts.elastic.co/downloads/kibana/kibana-$NEW-linux-$ES_ARCH.tar.gz"
  dl "sg-es-plugin-$NEW_SG-es-$NEW.zip" "$(sg_plugin_url "$NEW" "$NEW_SG")"
  mkdir -p "$MIG/es" && tar xzf "$DL/elasticsearch-$NEW.tar.gz" -C "$MIG/es" --strip-components 1
  (cd "$MIG/es" && ./bin/elasticsearch-plugin install --batch "file://$DL/sg-es-plugin-$NEW_SG-es-$NEW.zip" 2>&1 | tail -1)
  # keep the old node's identity (config, demo certificates, keystore) and point it at the OLD data directory
  cp "$MIG/es-old/config/"*.pem "$MIG/es/config/"; cp "$MIG/es-old/config/elasticsearch.yml" "$MIG/es/config/elasticsearch.yml"
  [ -f "$MIG/es-old/config/elasticsearch.keystore" ] && cp "$MIG/es-old/config/elasticsearch.keystore" "$MIG/es/config/"
  grep -q '^path.data:' "$MIG/es/config/elasticsearch.yml" || echo "path.data: $MIG/es-old/data" >> "$MIG/es/config/elasticsearch.yml"
  touch "$MIG/es/.sg-ready"
  (cd "$MIG/es" && ES_JAVA_OPTS="${ES_JAVA_OPTS:--Xms2g -Xmx2g}" ./bin/elasticsearch -d -p "$MIG/es.pid" > "$MIG/es-start.log" 2>&1) \
    || { echo "Elasticsearch $NEW failed to start on the old data:"; grep -hE 'ERROR|Exception' "$MIG/es-start.log" "$MIG/es/logs/"*.log 2>/dev/null | grep -v '^\s*at ' | head -8 | cut -c1-300; exit 1; }
  code=000; for _ in $(seq 1 120); do code=$(curl -sk -u "$ADMIN_USER:$ADMIN_PASS" -o /dev/null -w '%{http_code}' "$ES_URL/_searchguard/authinfo" 2>/dev/null || true); [ "$code" = 200 ] && break; sleep 2; done
  echo "ES $NEW + SG $NEW_SG on the old data: authinfo=$code, indices: $(curl "${C[@]}" "$ES_URL/_cat/indices/.kibana*_001?h=index" | tr '\n' ' ')"
  mkdir -p "$MIG/kb" && tar xzf "$DL/kibana-$NEW.tar.gz" -C "$MIG/kb" --strip-components 1
  cp "$MIG/kb-old/config/kibana.yml" "$MIG/kb/config/kibana.yml"
  "$HERE/kibana_restart.sh" "$NEW_ZIP"
fi

if [ "$PHASE" = all ] || [ "$PHASE" = verify ]; then
  section "Phase 4: verify after the migration to Kibana $NEW"
  echo "--- saved objects migration log lines:"
  grep -E '\[savedobjects-service\]' "$MIG/kibana.log" | grep -E 'Migration completed|completed after|MIGRATION|FATAL|rror|-> DONE' | sed -E 's/^\[[^]]+\]//' | cut -c1-180 | head -20
  echo "--- errors mentioning migration or saved objects (expect none):"
  grep -E '\[ERROR\].*(migrat|savedobjects|saved objects)' "$MIG/kibana.log" | cut -c1-200 | head -10
  echo "--- tenant doc counts after (compare with before):"; tenant_counts | tee "$MIG/after/tenant-counts.txt"
  if diff <(sort "$MIG/before/tenant-counts.txt") <(sort "$MIG/after/tenant-counts.txt") >/dev/null; then echo "tenant counts: IDENTICAL"; else echo "tenant counts: DIFFER"; diff <(sort "$MIG/before/tenant-counts.txt") <(sort "$MIG/after/tenant-counts.txt") | sed 's/^/    /'; fi
  "$HERE/so_index_check.sh" > "$MIG/after/so-indices.txt" 2>&1; grep -E '^\.kibana|DIFFERENCES|__sg_ten__ suffix' "$MIG/after/so-indices.txt" | head -24
  echo "--- every seeded object readable in its tenant, and not from the global tenant:"
  kibana_login >/dev/null; prime_tenant_api; fail=0
  while read -r t type id; do
    switch_tenant "$t" >/dev/null
    own=$(curl -s "${H[@]}" -b "$J" -o /dev/null -w '%{http_code}' "$KB_URL/api/saved_objects/$type/$id")
    other=""; if [ "$t" != SGS_GLOBAL_TENANT ]; then switch_tenant SGS_GLOBAL_TENANT >/dev/null; other=$(curl -s "${H[@]}" -b "$J" -o /dev/null -w '%{http_code}' "$KB_URL/api/saved_objects/$type/$id"); fi
    ok=ok; { [ "$own" = 200 ] && { [ -z "$other" ] || [ "$other" = 404 ]; }; } || { ok=FAIL; fail=$((fail+1)); }
    printf '  %-20s %-14s %-36s in tenant=%s  from global=%s  %s\n' "$t" "$type" "$id" "$own" "${other:-n/a}" "$ok"
  done < "$MIG/before/objects.txt"
  switch_tenant SGS_GLOBAL_TENANT >/dev/null
  w=$(curl -s -b "$J" "${H[@]}" -o /dev/null -w '%{http_code}' "$KB_URL/api/searchguard-signals/watch/sg_mig_watch")
  echo "--- seeded watch readable after the upgrade: $w (expect 200; the summary needs one execution under the new Kibana first)"
  [ "$w" = 200 ] || fail=$((fail+1))
  echo; [ "$fail" = 0 ] && echo "MIGRATION_CHECK_OK" || echo "MIGRATION_CHECK_FAILED ($fail objects)"
fi
