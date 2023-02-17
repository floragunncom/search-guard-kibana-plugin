# Max Memory

The watch alerts if the maximum value of memory among all hosts is greater than the threshold N (default 10000).

The watch searches across the last X hours (default 12) and returns the maximum memory among all hosts extracted from the aggregated documents.

# Requirements

It is assumed you loaded [OpenSearch Dashboards Sample Data Logs](https://github.com/opensearch-project/OpenSearch-Dashboards/tree/main/src/plugins/home/server/services/sample_data/data_sets/logs) index.

Make sure you have correct Slack webhook URL in the action's `url`.

# References

* [Eliatra Suite Alerting Plus](https://docs.search-guard.com/latest/elasticsearch-alerting-getting-started)
* [Max Aggregation](https://opensearch.org/docs/latest/opensearch/aggregations/)
* [Bool Query](https://opensearch.org/docs/latest/opensearch/query-dsl/bool/)
* [Range Query](https://opensearch.org/docs/latest/opensearch/query-dsl/term/)

