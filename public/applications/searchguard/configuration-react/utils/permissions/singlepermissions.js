export const CLUSTER_PERMISSIONS = [
  { name: 'cluster:admin/component_template/delete' },
  { name: 'cluster:admin/component_template/get' },
  { name: 'cluster:admin/component_template/put' },
  { name: 'cluster:admin/indices/dangling/delete' },
  { name: 'cluster:admin/indices/dangling/find' },
  { name: 'cluster:admin/indices/dangling/import' },
  { name: 'cluster:admin/indices/dangling/list' },
  { name: 'cluster:admin/ingest/pipeline/delete' },
  { name: 'cluster:admin/ingest/pipeline/get' },
  { name: 'cluster:admin/ingest/pipeline/put' },
  { name: 'cluster:admin/ingest/pipeline/simulate' },
  { name: 'cluster:admin/nodes/reload_secure_settings' },
  { name: 'cluster:admin/persistent/completion' },
  { name: 'cluster:admin/persistent/remove' },
  { name: 'cluster:admin/persistent/start' },
  { name: 'cluster:admin/persistent/update_status' },
  { name: 'cluster:admin/repository/_cleanup' },
  { name: 'cluster:admin/repository/delete' },
  { name: 'cluster:admin/repository/get' },
  { name: 'cluster:admin/repository/put' },
  { name: 'cluster:admin/repository/verify' },
  { name: 'cluster:admin/reroute' },
  { name: 'cluster:admin/script/delete' },
  { name: 'cluster:admin/script/get' },
  { name: 'cluster:admin/script/put' },
  { name: 'cluster:admin/script_context/get' },
  { name: 'cluster:admin/script_language/get' },
  { name: 'cluster:admin/searchguard/auth_token/update/push' },
  { name: 'cluster:admin/searchguard/components/state' },
  { name: 'cluster:admin/searchguard/config/update' },
  { name: 'cluster:admin/searchguard/license/info' },
  { name: 'cluster:admin/searchguard/session_token/update/push' },
  { name: 'cluster:admin/searchsupport/scheduler/config/update' },
  { name: 'cluster:admin/searchsupport/scheduler/executing_triggers/check' },
  { name: 'cluster:admin/settings/update' },
  { name: 'cluster:admin/snapshot/clone' },
  { name: 'cluster:admin/snapshot/create' },
  { name: 'cluster:admin/snapshot/delete' },
  { name: 'cluster:admin/snapshot/get' },
  { name: 'cluster:admin/snapshot/restore' },
  { name: 'cluster:admin/snapshot/status' },
  { name: 'cluster:admin/snapshot/status[nodes]' },
  { name: 'cluster:admin/tasks/cancel' },
  { name: 'cluster:admin/voting_config/add_exclusions' },
  { name: 'cluster:admin/voting_config/clear_exclusions' },
  { name: 'cluster:admin:searchguard:auth/frontend/config/get' },
  { name: 'cluster:admin:searchguard:authtoken/_own/create' },
  { name: 'cluster:admin:searchguard:authtoken/_own/get' },
  { name: 'cluster:admin:searchguard:authtoken/_own/revoke' },
  { name: 'cluster:admin:searchguard:authtoken/_own/search' },
  { name: 'cluster:admin:searchguard:authtoken/info' },
  { name: 'cluster:admin:searchguard:config/auth_token_service/get' },
  { name: 'cluster:admin:searchguard:config/auth_token_service/patch' },
  { name: 'cluster:admin:searchguard:config/auth_token_service/put' },
  { name: 'cluster:admin:searchguard:config/authz_dlsfls/get' },
  { name: 'cluster:admin:searchguard:config/authz_dlsfls/patch' },
  { name: 'cluster:admin:searchguard:config/authz_dlsfls/put' },
  { name: 'cluster:admin:searchguard:config/bulk/get' },
  { name: 'cluster:admin:searchguard:config/bulk/update' },
  { name: 'cluster:admin:searchguard:config/fe_multi_tenancy/get' },
  { name: 'cluster:admin:searchguard:config/fe_multi_tenancy/patch' },
  { name: 'cluster:admin:searchguard:config/fe_multi_tenancy/put' },
  { name: 'cluster:admin:searchguard:config/internal_users/delete' },
  { name: 'cluster:admin:searchguard:config/internal_users/get' },
  { name: 'cluster:admin:searchguard:config/internal_users/patch' },
  { name: 'cluster:admin:searchguard:config/internal_users/put' },
  { name: 'cluster:admin:searchguard:config/multitenancy/activate' },
  { name: 'cluster:admin:searchguard:config/multitenancy/frontend_data_migration/8_8_0/get' },
  { name: 'cluster:admin:searchguard:config/multitenancy/frontend_data_migration/8_8_0/start' },
  { name: 'cluster:admin:searchguard:config/sessions/get' },
  { name: 'cluster:admin:searchguard:config/sessions/patch' },
  { name: 'cluster:admin:searchguard:config/sessions/put' },
  { name: 'cluster:admin:searchguard:config/vars/delete' },
  { name: 'cluster:admin:searchguard:config/vars/get' },
  { name: 'cluster:admin:searchguard:config/vars/get/all' },
  { name: 'cluster:admin:searchguard:config/vars/put' },
  { name: 'cluster:admin:searchguard:config/vars/put/all' },
  { name: 'cluster:admin:searchguard:config_vars/refresh' },
  { name: 'cluster:admin:searchguard:femt:user/available_tenants/get' },
  { name: 'cluster:admin:searchguard:login/session' },
  { name: 'cluster:admin:searchguard:session/_own/delete' },
  { name: 'cluster:admin:searchguard:session/_own/get/extended' },
  { name: 'cluster:admin:searchguard:session/create' },
  { name: 'cluster:admin:searchguard:signals:account/delete' },
  { name: 'cluster:admin:searchguard:signals:account/get' },
  { name: 'cluster:admin:searchguard:signals:account/put' },
  { name: 'cluster:admin:searchguard:signals:account/search' },
  { name: 'cluster:admin:searchguard:signals:admin/start_stop' },
  { name: 'cluster:admin:searchguard:signals:destination/update' },
  { name: 'cluster:admin:searchguard:signals:proxies/createorreplace' },
  { name: 'cluster:admin:searchguard:signals:proxies/delete' },
  { name: 'cluster:admin:searchguard:signals:proxies/findall' },
  { name: 'cluster:admin:searchguard:signals:proxies/findone' },
  { name: 'cluster:admin:searchguard:signals:proxies/update' },
  { name: 'cluster:admin:searchguard:signals:settings/get' },
  { name: 'cluster:admin:searchguard:signals:settings/put' },
  { name: 'cluster:admin:searchguard:signals:settings/update' },
  { name: 'cluster:admin:searchguard:signals:summary/load' },
  { name: 'cluster:admin:searchguard:signals:truststores/createorreplace' },
  { name: 'cluster:admin:searchguard:signals:truststores/delete' },
  { name: 'cluster:admin:searchguard:signals:truststores/findall' },
  { name: 'cluster:admin:searchguard:signals:truststores/findone' },
  { name: 'cluster:admin:searchguard:signals:truststores/update' },
  { name: 'cluster:monitor/allocation/explain' },
  { name: 'cluster:monitor/health' },
  { name: 'cluster:monitor/main' },
  { name: 'cluster:monitor/nodes/hot_threads' },
  { name: 'cluster:monitor/nodes/info' },
  { name: 'cluster:monitor/nodes/stats' },
  { name: 'cluster:monitor/nodes/usage' },
  { name: 'cluster:monitor/remote/info' },
  { name: 'cluster:monitor/state' },
  { name: 'cluster:monitor/stats' },
  { name: 'cluster:monitor/task' },
  { name: 'cluster:monitor/task/get' },
  { name: 'cluster:monitor/tasks/lists' },
  { name: 'indices:admin/index_template/delete' },
  { name: 'indices:admin/index_template/get' },
  { name: 'indices:admin/index_template/put' },
  { name: 'indices:admin/index_template/simulate' },
  { name: 'indices:admin/index_template/simulate_index' },
  { name: 'indices:admin/template/delete' },
  { name: 'indices:admin/template/get' },
  { name: 'indices:admin/template/put' },
  { name: 'indices:data/read/async_search/delete' },
  { name: 'indices:data/read/async_search/get' },
  { name: 'indices:data/read/async_search/submit' },
  { name: 'indices:data/read/mget' },
  { name: 'indices:data/read/msearch' },
  { name: 'indices:data/read/msearch/template' },
  { name: 'indices:data/read/mtv' },
  { name: 'indices:data/read/scroll' },
  { name: 'indices:data/read/scroll/clear' },
  { name: 'indices:data/read/search/template' },
  { name: 'indices:data/read/sql' },
  { name: 'indices:data/read/sql/close_cursor' },
  { name: 'indices:data/read/sql/translate' },
  { name: 'indices:data/write/bulk' },
  { name: 'indices:data/write/reindex' },
  { name: 'indices:monitor/recovery' },
  { name: 'indices:searchguard:async_search/_all_owners' },
  ];

export const INDEX_PERMISSIONS = [
  { name: 'indices:admin/aliases' },
  { name: 'indices:admin/aliases/get' },
  { name: 'indices:admin/analyze' },
  { name: 'indices:admin/auto_create' },
  { name: 'indices:admin/block/add' },
  { name: 'indices:admin/cache/clear' },
  { name: 'indices:admin/close' },
  { name: 'indices:admin/create' },
  { name: 'indices:admin/data_stream/create' },
  { name: 'indices:admin/data_stream/delete' },
  { name: 'indices:admin/data_stream/get' },
  { name: 'indices:admin/data_stream/migrate' },
  { name: 'indices:admin/data_stream/modify' },
  { name: 'indices:admin/data_stream/promote' },
  { name: 'indices:admin/delete' },
  { name: 'indices:admin/flush' },
  { name: 'indices:admin/forcemerge' },
  { name: 'indices:admin/get' },
  { name: 'indices:admin/mapping/auto_put' },
  { name: 'indices:admin/mapping/put' },
  { name: 'indices:admin/mappings/fields/get' },
  { name: 'indices:admin/mappings/get' },
  { name: 'indices:admin/open' },
  { name: 'indices:admin/refresh' },
  { name: 'indices:admin/refresh*' },
  { name: 'indices:admin/resize' },
  { name: 'indices:admin/resolve/cluster' },
  { name: 'indices:admin/resolve/index' },
  { name: 'indices:admin/rollover' },
  { name: 'indices:admin/search/search_shards' },
  { name: 'indices:admin/settings/update' },
  { name: 'indices:admin/shards/search_shards' },
  { name: 'indices:admin/validate/query' },
  { name: 'indices:data/read/explain' },
  { name: 'indices:data/read/field_caps' },
  { name: 'indices:data/read/get' },
  { name: 'indices:data/read/mget' },
  { name: 'indices:data/read/mget*' },
  { name: 'indices:data/read/open_point_in_time' },
  { name: 'indices:data/read/search' },
  { name: 'indices:data/read/tv' },
  { name: 'indices:data/write/bulk' },
  { name: 'indices:data/write/bulk*' },
  { name: 'indices:data/write/delete' },
  { name: 'indices:data/write/delete/byquery' },
  { name: 'indices:data/write/index' },
  { name: 'indices:data/write/update' },
  { name: 'indices:data/write/update/byquery' },
  { name: 'indices:monitor/data_stream/stats' },
  { name: 'indices:monitor/segments' },
  { name: 'indices:monitor/settings/get' },
  { name: 'indices:monitor/shard_stores' },
  { name: 'indices:monitor/stats' },
  ];


