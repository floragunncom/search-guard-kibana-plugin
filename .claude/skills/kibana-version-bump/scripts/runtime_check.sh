#!/bin/bash
# HTTP smoke test of the Search Guard plugin inside the running Kibana distribution
# (see runtime_setup.sh). Prints a status line per check; read them against the
# expectations in the step titles. Ends with the plugin-related errors from the Kibana log.
set -uo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/common.sh"
H=(-H 'x-elastic-internal-origin: Kibana'); J="$COOKIES"
step "GET / unauthenticated (expect 302 to the login page)"
curl -s "${H[@]}" -o /dev/null -w 'status=%{http_code} location=%{redirect_url}\n' "$KB_URL/"
step "GET /searchguard/login (expect 200 html)"
curl -s "${H[@]}" -o "$RT/login.html" -w 'status=%{http_code} bytes=%{size_download}\n' "$KB_URL/searchguard/login"
step "GET /api/v1/auth/config unauthenticated (expect 200 with auth types)"
curl -s "${H[@]}" -w '\nstatus=%{http_code}\n' "$KB_URL/api/v1/auth/config" | cut -c1-300
step "POST /api/core/capabilities unauthenticated (expect 200 default capabilities, 302 or 401; never 500)"
curl -s "${KBN_HDR[@]}" -o /dev/null -w 'status=%{http_code} location=%{redirect_url}\n' -d '{"applications":[]}' "$KB_URL/api/core/capabilities"
step "POST /api/v1/auth/login (expect 200 + cookie)"
kibana_login
step "GET /api/v1/auth/authinfo (expect 200, user_name=$ADMIN_USER)"
curl -s "${H[@]}" -b "$J" -w '\nstatus=%{http_code}\n' "$KB_URL/api/v1/auth/authinfo" | cut -c1-400
step "GET /api/status and /app/home with the session (expect 200, 200)"
curl -s "${H[@]}" -b "$J" -o /dev/null -w 'status=%{http_code}\n' "$KB_URL/api/status"
curl -s "${H[@]}" -b "$J" -o /dev/null -w 'status=%{http_code}\n' "$KB_URL/app/home"
step "GET /api/v1/multitenancy/info and /tenant (expect 200; 404 means MT is not enabled in SG)"
curl -s "${H[@]}" -b "$J" -w '\nstatus=%{http_code}\n' "$KB_URL/api/v1/multitenancy/info" | cut -c1-300
curl -s "${H[@]}" -b "$J" -w '\nstatus=%{http_code}\n' "$KB_URL/api/v1/multitenancy/tenant" | cut -c1-200
step "Switch to tenant $TEST_TENANT and create a dashboard there (expect 200, 200)"
curl -s "${KBN_HDR[@]}" -b "$J" -c "$J" -o /dev/null -w 'switch status=%{http_code}\n' -d "{\"tenant\":\"$TEST_TENANT\",\"username\":\"$ADMIN_USER\"}" "$KB_URL/api/v1/multitenancy/tenant"
curl -s "${KBN_HDR[@]}" -b "$J" -X DELETE -o /dev/null -w 'cleanup status=%{http_code}\n' "$KB_URL/api/saved_objects/dashboard/sg-compat-test"
curl -s "${KBN_HDR[@]}" -b "$J" -o /dev/null -w 'create status=%{http_code}\n' -d '{"attributes":{"title":"sg-compat-test","description":"","panelsJSON":"[]","optionsJSON":"{}","timeRestore":false,"kibanaSavedObjectMeta":{"searchSourceJSON":"{}"}}}' "$KB_URL/api/saved_objects/dashboard/sg-compat-test"
curl -s "${H[@]}" -b "$J" -o /dev/null -w 'get in tenant status=%{http_code} (expect 200)\n' "$KB_URL/api/saved_objects/dashboard/sg-compat-test"
step "Switch to SGS_GLOBAL_TENANT and fetch it again (expect 404: tenants are isolated)"
curl -s "${KBN_HDR[@]}" -b "$J" -c "$J" -o /dev/null -w 'switch status=%{http_code}\n' -d "{\"tenant\":\"SGS_GLOBAL_TENANT\",\"username\":\"$ADMIN_USER\"}" "$KB_URL/api/v1/multitenancy/tenant"
curl -s "${H[@]}" -b "$J" -o /dev/null -w 'get in global tenant status=%{http_code} (expect 404)\n' "$KB_URL/api/saved_objects/dashboard/sg-compat-test"
step "Search Guard browser bundle served (expect 200)"
# bundle URLs are /<build hash>/bundles/plugin/<id>/<manifest version>/<id>.plugin.js; the hash is in any app page
HASH=$(curl -s "${H[@]}" -b "$J" "$KB_URL/app/home" | grep -oE '/[0-9a-f]{12}/bundles/' | head -1 | cut -d/ -f2)
PV=$(python3 -c 'import json,sys; print(json.load(open(sys.argv[1]))["version"])' "$REPO/kibana.json")
curl -s -b "$J" -o /dev/null -w "status=%{http_code} bytes=%{size_download} (/$HASH/bundles/plugin/searchguard/$PV/searchguard.plugin.js)\n" "$KB_URL/$HASH/bundles/plugin/searchguard/$PV/searchguard.plugin.js"
step "POST /api/v1/auth/logout (expect 200)"
curl -s "${KBN_HDR[@]}" -b "$J" -c "$J" -X POST -w '\nstatus=%{http_code}\n' "$KB_URL/api/v1/auth/logout" | cut -c1-200
step "Kibana log: plugin errors (expect none; 'Could not check auth info' is accepted ReadOnlyMode noise)"
grep -nE 'TypeError|ReferenceError|Cannot read|\[ERROR\]\[plugins\.searchguard|\[FATAL\]' "$RT/kibana.log" | grep -v 'Could not check auth info' | head -20 | cut -c1-300
echo "readonly noise count: $(grep -c 'Could not check auth info' "$RT/kibana.log")"
echo "RUNTIME_CHECK_DONE"
