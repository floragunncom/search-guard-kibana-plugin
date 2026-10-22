# Runtime checks 9.5.5 (2026-10-22)

## runtime_check.sh
```

### GET / unauthenticated (expect 302 to the login page)
status=302 location=http://127.0.0.1:5601/searchguard/login?nextUrl=/

### GET /searchguard/login (expect 200 html)
status=200 bytes=149336

### GET /api/v1/auth/config unauthenticated (expect 200 with auth types)
{"authTypes":[{"type":"basicauth","title":"basic","loginURL":null,"message_body":"If you have forgotten your username or password, please ask your system administrator"}],"loginPage":{"brand_image":"/plugins/searchguard/assets/searchguard_logo.svg","show_brand_image":true,"title":"Please log in","bu
status=200

### POST /api/core/capabilities unauthenticated (expect 302/401, not 500)
status=200 location=

### POST /api/v1/auth/login (expect 200 + cookie)
login status=200

### GET /api/v1/auth/authinfo (expect 200, user_name=admin)
{"user":"User admin [backend_roles=[admin] requestedTenant=SGS_GLOBAL_TENANT]","user_name":"admin","user_requested_tenant":"SGS_GLOBAL_TENANT","backend_roles":["admin"],"attribute_names":[],"sg_roles":["SGS_ALL_ACCESS","SGS_OWN_INDEX"],"sg_tenants":{"sg_compat_tenant":true,"SGS_GLOBAL_TENANT":true},"principal":null,"peer_certificates":"0","cluster_name":"searchguard_demo"}
status=200

### GET /api/status and /app/home with the session (expect 200, 200)
status=200
status=200

### GET /api/v1/multitenancy/info and /tenant (expect 200; 404 means MT is not enabled in SG)
{"user_name":"admin","not_fail_on_forbidden_enabled":true,"kibana_mt_enabled":true,"kibana_index":".kibana","kibana_server_user":"kibanaserver","kibana_rbac_enabled":false}
status=200

status=200

### Switch to tenant sg_compat_tenant and create a dashboard there (expect 200, 200)
switch status=200
cleanup status=404
create status=200
get in tenant status=200 (expect 200)

### Switch to SGS_GLOBAL_TENANT and fetch it again (expect 404: tenants are isolated)
switch status=200
get in global tenant status=404 (expect 404)

### Search Guard browser bundle served (expect 200)
status=200 bytes=827272 (/a2890159e248/bundles/plugin/searchguard/9.5.5/searchguard.plugin.js)

### POST /api/v1/auth/logout (expect 200)
{"authType":"basicauth","redirectURL":"/searchguard/login?type=basicauthLogout"}
status=200

### Kibana log: plugin errors (expect none; 'Could not check auth info' is accepted ReadOnlyMode noise)
readonly noise count: 1
RUNTIME_CHECK_DONE
```

## browser_check.sh (admin)
```
PAGEERRORS (0, expect 0):
SEARCH GUARD PROBLEMS (0, expect 0):
OTHER (0, read them):
known Kibana noise ignored: 64
BROWSER_DONE
```

## browser_check.sh --dashboard sg_compat_watch
```
panel groups: ["dashboardEditorMenu-visualizationsGroup","dashboardEditorMenu-controlsGroup","dashboardEditorMenu-annotation-and-navigationGroup","dashboardEditorMenu-observabilityGroup","dashboardEditorMenu-legacyGroup","dashboardEditorMenu-searchGuardGroup"]
"Add Signals watch" item present: true
clicked watch row: true
panel rendered with watch id: yes; panel error element present: false
save modal opened via: [data-test-subj="dashboardInteractiveSaveMenuItem"]
saved -> http://127.0.0.1:5601/app/dashboards#/view/5a3aa9e6-3876-4421-89f7-1c0cd6b380bf
dashboard id: 5a3aa9e6-3876-4421-89f7-1c0cd6b380bf
after reload: panel renders with watch id: yes
DASHBOARD_ID=5a3aa9e6-3876-4421-89f7-1c0cd6b380bf
PROBLEMS (0):
DASHBOARD_DONE
```

## user_check.sh (kibanaro)
```
##### HTTP pass as kibanaro #####

### login (expect 200)
login status=200

### authinfo: roles and tenants of kibanaro
user: kibanaro sg_roles: ['SGS_KIBANA_USER', 'SGS_READALL', 'SGS_OWN_INDEX'] tenants: ['SGS_GLOBAL_TENANT']

### routes a user session touches (expect 200 unless noted)
  GET /app/home                                                  200
  GET /api/v1/multitenancy/info                                  200
  GET /api/v1/multitenancy/tenant                                200
  GET /api/saved_objects/_find?type=dashboard&per_page=5         200
  GET /api/data_views                                            200
  GET /api/v1/searchguard/kibana_config                          200
  GET /api/v1/auth/config                                        200
  POST /api/core/capabilities                                    200
  POST /api/searchguard-signals/watch/summary                    403  (403 is fine for a user without Signals permissions)

### logout (expect 200)
status=200

##### Browser pass as kibanaro (Forbidden errors from the Signals and Auth Tokens apps are expected for a user without those permissions; judge by the privilege blocks below) #####
PAGEERRORS (0, expect 0):
SEARCH GUARD PROBLEMS (1, expect 0):
  console.error: AuthTokens, init, isServiceEnabled HttpFetchError: Forbidden
OTHER (3, read them):
  console.error: Watches -- getWatches HttpFetchError: Forbidden
  console.error: useResourcesTable, fetchTableResources HttpFetchError: Forbidden
  console.error: handleTriggerCallout HttpFetchError: Forbidden
known Kibana noise ignored: 72
BROWSER_DONE

##### Search Guard privilege blocks for kibanaro during this pass (expect none) #####
      9 User: User kibanaro [backend_roles=[kibanauser, readall] requestedTenant=SGS_GLOBAL_TENANT]
      9 Roles: [SGS_KIBANA_USER, SGS_READALL, SGS_OWN_INDEX]
      6 ### No cluster privileges for cluster:admin:searchguard:authtoken/_own/search (com.floragunn.searchguard.authtoken.api.SearchAuthTokensRequest)
      2 ### No cluster privileges for cluster:admin:searchguard:signals:summary/load (com.floragunn.signals.actions.summary.LoadOperatorSummaryRequest)
      1 ### No cluster privileges for cluster:admin:searchguard:authtoken/info (com.floragunn.searchguard.authtoken.api.AuthTokenInfoRequest)
USER_CHECK_DONE
```
