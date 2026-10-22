# Runtime log report (2026-10-22T14:48Z)

## Kibana: ERROR lines (count, normalised)
```
      3 [ERROR][http] 500 Server Error
      2 [ERROR][plugins.securitySolution.entityAnalytics.migration] Error checking prebuilt watchlist 'Privileged Users': Unauthorized: authentication_exception
      1 [ERROR][plugins.workflowsExecutionEngine.data-stream-rollover] Error rolling over workflows data stream .workflows-execution-data-stream-logs: index_not_found_exception
```

## Kibana: plugins.searchguard WARN/ERROR lines
```
      2 [WARN ][plugins.searchguard.searchguard] Default cookie password detected, please set a password in kibana.yml by setting 'searchguard.cookie.password' (min. 32 characters).
      2 [WARN ][plugins.searchguard.searchguard] 'searchguard.cookie.secure' is set to false, cookies are transmitted over unsecure HTTP connection. Consider using HTTPS and set this key to 'true'
```

## Kibana: config deprecation warnings (settings in kibana.yml / docker/kibana.yml / docs that must change)
```
      1 [WARN ][config.deprecation] TLS is not enabled, or the HTTP protocol is set to HTTP/1. Enabling TLS and using HTTP/2 improves security and performance.
```

## Kibana: TypeError / ReferenceError / unhandled (expect none)
```
```

## Search Guard: INSUFFICIENT privilege evaluations in <scratch>/rt/es/logs/searchguard_demo.log
(each block = a user lacked a permission; decide whether SGS_KIBANA_SERVER / SGS_KIBANA_USER need it)
```
      9 User: User kibanaro [backend_roles=[kibanauser, readall] requestedTenant=SGS_GLOBAL_TENANT]
      9 Roles: [SGS_KIBANA_USER, SGS_READALL, SGS_OWN_INDEX]
      6 ### No cluster privileges for cluster:admin:searchguard:authtoken/_own/search (com.floragunn.searchguard.authtoken.api.SearchAuthTokensRequest)
      2 ### No cluster privileges for cluster:admin:searchguard:signals:summary/load (com.floragunn.signals.actions.summary.LoadOperatorSummaryRequest)
      1 User: User kibanaserver <basic/internal_users_db>
      1 Roles: [SGS_KIBANA_SERVER, SGS_OWN_INDEX]
      1 Resolved Indices: local: {nonExistingIndices: [.fleet-actions]}; remote: []
      1 Required Privileges: [indices:data/read/search]
      1 ### No index privileges for indices:data/read/search (org.elasticsearch.action.search.SearchRequest)
      1 ### No cluster privileges for cluster:admin:searchguard:authtoken/info (com.floragunn.searchguard.authtoken.api.AuthTokenInfoRequest)
```

## Search Guard audit index: MISSING_PRIVILEGES per user / privilege / index
(secondary source; the log blocks above are authoritative, e.g. denials on non-existing indices are not audited)
```
0 MISSING_PRIVILEGES events
```

## Elasticsearch: ERROR/WARN lines from the SG plugin (c.f.s.*), normalised
```
    300 [WARN ][c.f.s.a.a.ActionRequestIntrospector] Unknown action request: org.elasticsearch.xpack.esql.action.EsqlQueryRequest 
     27 [WARN ][c.f.s.a.b.RequestAuthenticationProcessor] Authentication failed for null from [request=/.kibana_ingest_9.5.5/_search, directIpAddress=127.0.0.1, originatingIpAddress=127.0.0.1, clientCertSubje
      8 [WARN ][c.f.s.a.c.Role           ] Role assigns a FLS rule '[myfields*, otherfield]' to wildcard (*) index_patterns
      8 [WARN ][c.f.s.a.c.Role           ] Role assigns a DLS rule '{"term" : { "test": "myvalue"}}' to wildcard (*) index_patterns
      4 [WARN ][c.f.s.a.b.RequestAuthenticationProcessor] Authentication failed for null from [request=/.kibana_9.5.5/_doc/config:9.5.5, directIpAddress=127.0.0.1, originatingIpAddress=127.0.0.1, clientCertSu
      3 [WARN ][c.f.s.a.b.RequestAuthenticationProcessor] Authentication failed for null from [request=/.kibana_security_solution_9.5.5/_doc/watchlist-config:privileged-user-monitoring-watchlist-id-default, d
      2 [WARN ][c.f.s.a.b.RequestAuthenticationProcessor] Authentication failed for null from [request=/.kibana_security_solution_9.5.5/_doc/watchlist-config:privileged-user-monitoring-watchlist-id-default__s
      1 [WARN ][c.f.s.a.b.RequestAuthenticationProcessor] Authentication failed for null from [request=/_security/user/_has_privileges, directIpAddress=127.0.0.1, originatingIpAddress=127.0.0.1, clientCertSub
      1 [WARN ][c.f.s.a.b.RequestAuthenticationProcessor] Authentication failed for null from [request=/_searchguard/authinfo, directIpAddress=127.0.0.1, originatingIpAddress=127.0.0.1, clientCertSubject=null
      1 [WARN ][c.f.s.a.b.RequestAuthenticationProcessor] Authentication failed for null from [request=/.kibana_9.5.5/_doc/space:default, directIpAddress=127.0.0.1, originatingIpAddress=127.0.0.1, clientCertS
      1 [WARN ][c.f.s.SearchGuardPlugin  ] File <scratch>/rt/es/config/root-ca.pem has insecure file permissions (should be 0600)
      1 [WARN ][c.f.s.SearchGuardPlugin  ] File <scratch>/rt/es/config/kirk.pem has insecure file permissions (should be 0600)
      1 [WARN ][c.f.s.SearchGuardPlugin  ] File <scratch>/rt/es/config/kirk-key.pem has insecure file permissions (should be 0600)
      1 [WARN ][c.f.s.SearchGuardPlugin  ] File <scratch>/rt/es/config/esnode.pem has insecure file permissions (should be 0600)
      1 [WARN ][c.f.s.SearchGuardPlugin  ] File <scratch>/rt/es/config/esnode-key.pem has insecure file permissions (should be 0600)
      1 [WARN ][c.f.s.SearchGuardPlugin  ] Directory <scratch>/rt/es/config has insecure file permissions (should be 0700)
```
