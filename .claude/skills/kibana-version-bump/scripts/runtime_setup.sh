#!/bin/bash
# Usage: runtime_setup.sh X.Y.Z SG_ES_PLUGIN_VERSION [plugin zip]
# Builds the runtime stack in $RT: Elasticsearch X.Y.Z + Search Guard plugin (demo config,
# multitenancy enabled, one test tenant) and the official Kibana X.Y.Z distribution with our
# plugin zip installed, then starts both. Downloads land in $DL and are reused.
# The plugin zip defaults to $RT/searchguard-X.Y.Z.zip as produced by local_build.sh.
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/common.sh"
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"   # the script cd-s around; keep an absolute path to its siblings
V="${1:?kibana/es version}"; SG="${2:?search guard es plugin version}"
ZIP="${3:-$RT/searchguard-$V.zip}"
[ -f "$ZIP" ] || { echo "plugin zip not found: $ZIP (run local_build.sh first)"; exit 1; }
mkdir -p "$DL" "$RT"

section "Downloads -> $DL"
dl() { [ -s "$DL/$1" ] && echo "have $1" || { echo "fetching $1"; curl -sSfL --http1.1 --retry 3 --retry-all-errors -o "$DL/$1.part" "$2" && mv "$DL/$1.part" "$DL/$1"; }; }
dl "elasticsearch-$V.tar.gz" "https://artifacts.elastic.co/downloads/elasticsearch/elasticsearch-$V-linux-$ES_ARCH.tar.gz"
dl "kibana-$V.tar.gz"        "https://artifacts.elastic.co/downloads/kibana/kibana-$V-linux-$ES_ARCH.tar.gz"
dl "sg-es-plugin-$SG-es-$V.zip" "$(sg_plugin_url "$V" "$SG")"
SGCTL_V="$(curl -s "$SG_MAVEN/sgctl/maven-metadata.xml" | grep -oE '<latest>[^<]+' | cut -d'>' -f2)"
dl "sgctl-$SGCTL_V.sh" "$SG_MAVEN/sgctl/$SGCTL_V/sgctl-$SGCTL_V.sh"

section "Elasticsearch $V + Search Guard $SG -> $RT/es"
if [ ! -f "$RT/es/.sg-ready" ]; then
  rm -rf "$RT/es"; mkdir -p "$RT/es"; cd "$RT/es"
  tar xzf "$DL/elasticsearch-$V.tar.gz" --strip-components 1
  ./bin/elasticsearch-plugin install --batch "file://$DL/sg-es-plugin-$SG-es-$V.zip" 2>&1 | tail -2
  # not executable inside the zip -> run through bash. -y: no prompts, -i: initialise the SG index on start
  bash ./plugins/search-guard-flx/tools/install_demo_configuration.sh -y -i > "$RT/es-demo-install.log" 2>&1 || { tail -20 "$RT/es-demo-install.log"; exit 1; }
  # the installer writes some of these itself (network.host: 0.0.0.0, cluster.initial_master_nodes);
  # ES rejects duplicate keys and refuses initial_master_nodes together with discovery.type single-node
  sed -i -E '/^(network\.host|http\.port|discovery\.type|cluster\.initial_master_nodes|xpack\.security\.enabled|xpack\.ml\.enabled):/d' config/elasticsearch.yml
  printf 'network.host: 127.0.0.1\nhttp.port: 9200\ndiscovery.type: single-node\nxpack.security.enabled: false\nxpack.ml.enabled: false\n' >> config/elasticsearch.yml
  touch .sg-ready
fi
cd "$RT/es"
if ! curl -sk -u "$ADMIN_USER:$ADMIN_PASS" "$ES_URL/_searchguard/authinfo" -o /dev/null -w '' 2>/dev/null; then
  pkill -f "$RT/es/jdk" 2>/dev/null || true; sleep 2
  ES_JAVA_OPTS="${ES_JAVA_OPTS:--Xms2g -Xmx2g}" ./bin/elasticsearch -d -p "$RT/es.pid" > "$RT/es-start.log" 2>&1 \
    || { echo "Elasticsearch failed to start:"; grep -hE 'ERROR|Exception' "$RT/es-start.log" "$RT/es/logs/"*.log 2>/dev/null | grep -v '^\s*at ' | head -10 | cut -c1-300; exit 1; }
fi
# wait until Search Guard itself answers (plain HTTP 503s during SG init would pass a cluster-health check)
for _ in $(seq 1 120); do
  code=$(curl -sk -u "$ADMIN_USER:$ADMIN_PASS" -o /dev/null -w '%{http_code}' "$ES_URL/_searchguard/authinfo" 2>/dev/null || true)
  [ "$code" = 200 ] && break; sleep 2
done
[ "$code" = 200 ] || { echo "Search Guard did not come up (last status $code)"; tail -30 "$RT/es-start.log" "$RT/es/logs/searchguard_demo.log" 2>/dev/null; exit 1; }
echo "ES + SG up: $(curl -sk -u "$ADMIN_USER:$ADMIN_PASS" "$ES_URL/_cluster/health" | grep -oE '"status":"[a-z]+"')"

section "Multitenancy + test tenant $TEST_TENANT"
C=(--cert "$RT/es/config/kirk.pem" --key "$RT/es/config/kirk-key.pem")   # admin certificate from the demo config
MT="$(curl -sk "${C[@]}" "$ES_URL/_searchguard/config" | python3 -c 'import sys,json; print(json.load(sys.stdin).get("frontend_multi_tenancy",{}).get("content"))')"
if ! echo "$MT" | grep -q "'enabled': True"; then
  # PUT /_searchguard/config/frontend_multi_tenancy is refused ("use sgctl special enable-mt")
  mkdir -p "$RT/sgctl/cfg"; cp "$DL/sgctl-$SGCTL_V.sh" "$RT/sgctl/sgctl.sh"; chmod +x "$RT/sgctl/sgctl.sh"
  export JAVA_HOME="$RT/es/jdk"; export PATH="$JAVA_HOME/bin:$PATH"
  "$RT/sgctl/sgctl.sh" connect -h 127.0.0.1 -p 9200 --cert "$RT/es/config/kirk.pem" --key "$RT/es/config/kirk-key.pem" --ca-cert "$RT/es/config/root-ca.pem" --sgctl-config-dir "$RT/sgctl/cfg" 2>&1 | tail -1
  "$RT/sgctl/sgctl.sh" special enable-mt --sgctl-config-dir "$RT/sgctl/cfg" 2>&1 | tail -2
fi
# single-type PUTs on /tenants are refused as well; the bulk endpoint works
curl -sk "${C[@]}" -X PUT -H 'content-type: application/json' -o /dev/null -w "tenants bulk put status=%{http_code}\n" \
  -d "{\"tenants\":{\"content\":{\"$TEST_TENANT\":{\"description\":\"compat test tenant\"}}}}" "$ES_URL/_searchguard/config"
curl -sk "${C[@]}" "$ES_URL/_searchguard/config" | python3 -c 'import sys,json; d=json.load(sys.stdin); print("MT:", d.get("frontend_multi_tenancy",{}).get("content")); print("tenants:", list((d.get("tenants",{}).get("content") or {}).keys()))'

section "Kibana $V distribution -> $RT/kb"
if [ ! -x "$RT/kb/bin/kibana" ]; then
  rm -rf "$RT/kb"; mkdir -p "$RT/kb"; cd "$RT/kb"
  tar xzf "$DL/kibana-$V.tar.gz" --strip-components 1
fi
cat > "$RT/kb/config/kibana.yml" <<YML
server.host: "127.0.0.1"
server.port: 5601
elasticsearch.hosts: "https://127.0.0.1:9200"
elasticsearch.username: "kibanaserver"
elasticsearch.password: "kibanaserver"
elasticsearch.ssl.verificationMode: none
elasticsearch.requestHeadersWhitelist: [ "Authorization", "sgtenant" ]
xpack.security.showInsecureClusterWarning: false
telemetry.enabled: false
telemetry.optIn: false
xpack.fleet.agents.enabled: false
logging.root.level: info
# one DEBUG line per response (method, path, status): lets log_report.sh name the routes behind "[http] 500 Server Error"
logging.loggers:
  - name: http.server.response
    level: debug
YML
"$HERE/kibana_restart.sh" "$ZIP"
echo "RUNTIME_SETUP_DONE"
