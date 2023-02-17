# Memory Usage

The watch alerts if memory usage for a host is greater than a configured threshold N (default 10000).

The watch searches across the last X minutes, taking into account the hosts with memory usage higher than N. The watch uses terms aggregation to retrieve the matched hosts and their maximum memory usage. An alert triggered if the number of hosts is greater than 0.

# Requirements

It is assumed you loaded [OpenSearch Dashboards Sample Data Logs](https://github.com/opensearch-project/OpenSearch-Dashboards/tree/main/src/plugins/home/server/services/sample_data/data_sets/logs) index.

Make sure you have correct Slack webhook URL in the action's `url`.

# References

* [Eliatra Suite Alerting Plus](https://docs.search-guard.com/latest/elasticsearch-alerting-getting-started)
* [Max Aggregation](https://opensearch.org/docs/latest/opensearch/aggregations/)
* [Bool Query](https://opensearch.org/docs/latest/opensearch/query-dsl/bool/)
* [Range Query](https://opensearch.org/docs/latest/opensearch/query-dsl/term/)
* [Terms Aggregation](https://opensearch.org/docs/latest/opensearch/aggregations/)
