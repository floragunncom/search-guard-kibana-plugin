
### Saved object indices and aliases (compare with the previous bump's output in references/)
.ds-.kibana-event-log-ds-2026.10.22-000001   167 green
.ds-.kibana_change_history-2026.10.22-000001   0 green
.kibana-siem-rule-migrations-integrations      0 green
.kibana-siem-rule-migrations-prebuiltrules     0 green
.kibana_9.5.5_001                             10 green
.kibana_alerting_cases_9.5.5_001               1 green
.kibana_analytics_9.5.5_001                    6 green
.kibana_ingest_9.5.5_001                       0 green
.kibana_locks-000001                           0 green
.kibana_search_solution_9.5.5_001              0 green
.kibana_security_solution_9.5.5_001            1 green
.kibana_streams-000001                         2 green
.kibana_task_manager_9.5.5_001                63 green
.kibana_usage_counters_9.5.5_001              11 green
--- aliases
.kibana                         .kibana_9.5.5_001
.kibana_9.5.5                   .kibana_9.5.5_001
.kibana_alerting_cases          .kibana_alerting_cases_9.5.5_001
.kibana_alerting_cases_9.5.5    .kibana_alerting_cases_9.5.5_001
.kibana_analytics               .kibana_analytics_9.5.5_001
.kibana_analytics_9.5.5         .kibana_analytics_9.5.5_001
.kibana_ingest                  .kibana_ingest_9.5.5_001
.kibana_ingest_9.5.5            .kibana_ingest_9.5.5_001
.kibana_search_solution         .kibana_search_solution_9.5.5_001
.kibana_search_solution_9.5.5   .kibana_search_solution_9.5.5_001
.kibana_security_solution       .kibana_security_solution_9.5.5_001
.kibana_security_solution_9.5.5 .kibana_security_solution_9.5.5_001
.kibana_streams                 .kibana_streams-000001
.kibana_task_manager            .kibana_task_manager_9.5.5_001
.kibana_task_manager_9.5.5      .kibana_task_manager_9.5.5_001
.kibana_usage_counters          .kibana_usage_counters_9.5.5_001
.kibana_usage_counters_9.5.5    .kibana_usage_counters_9.5.5_001

### Which saved object types live in which index
.kibana-siem-rule-migrations-integrations     (no docs)
.kibana-siem-rule-migrations-prebuiltrules    (no docs)
.kibana_9.5.5_001                             intercept_trigger_record:2, space:2, apm-telemetry:1, config:1, config-global:1, core-usage-stats:1, event_loop_delays_daily:1, telemetry:1
.kibana_alerting_cases_9.5.5_001              cases-telemetry:1
.kibana_analytics_9.5.5_001                   canvas-workpad-template:5, dashboard:1
.kibana_ingest_9.5.5_001                      (no docs)
.kibana_search_solution_9.5.5_001             (no docs)
.kibana_security_solution_9.5.5_001           security:reference-data:1
.kibana_streams-000001                        wired:2
.kibana_task_manager_9.5.5_001                task:62, background-task-node:1
.kibana_usage_counters_9.5.5_001              usage-counter:11

### Tenant documents: Search Guard stores them with an id suffix (__sg_ten__<hash>_<tenant>) and an sg_tenant field
2 docs with an sg_tenant field (expect > 0 after runtime_check.sh)
  .kibana_9.5.5_001                        space:default__sg_ten__-764716708_sgcompattenant                       type=space sg_tenant=-764716708_sgcompattenant
  .kibana_analytics_9.5.5_001              dashboard:sg-compat-test__sg_ten__-764716708_sgcompattenant            type=dashboard sg_tenant=-764716708_sgcompattenant
ids without the __sg_ten__ suffix (expect 0): 0
test tenant present: True

### Default space document: Kibana's own (global tenant) vs the one the plugin writes (tenant)
Kibana space:default fields : {"coreMigrationVersion": "str", "created_at": "str", "managed": "bool", "references": "list", "space": {"_reserved": "bool", "color": "str", "description": "str", "disabledFeatures": "list", "name": "str"}, "type": "str", "typeMigrationVersion": "str", "updated_at": "str"}
tenant space:default__sg_ten__-764716708_sgcompattenant fields: {"coreMigrationVersion": "str", "created_at": "str", "managed": "bool", "references": "list", "sg_tenant": "str", "space": {"_reserved": "bool", "color": "str", "description": "str", "disabledFeatures": "list", "name": "str"}, "type": "str", "typeMigrationVersion": "str", "updated_at": "str"}
DIFFERENCES (expect only sg_tenant, which Search Guard adds): {"sg_tenant": [null, "str"]}
SO_INDEX_CHECK_DONE
