# Change in Memory

The watch alerts if memory used by a host has decreased by more than N in the last X days.

The watch searches for the last X days (default to 1 month), aggregates by a host, creates a date histogram per host using 1 day interval and calculates derivative to get change in memory usage between the intervals. Transform script is used to normalize data for mustache templating in action. If the change for any host is less the configured threshold N (default 0), an alert is triggered.

# Requirements

It is assumed you loaded [OpenSearch Dashboards Sample Data Logs](https://github.com/opensearch-project/OpenSearch-Dashboards/tree/main/src/plugins/home/server/services/sample_data/data_sets/logs) index.

Make sure you have correct Slack webhook URL in the action's `url`.

# References

* [Eliatra Suite Alerting Plus](https://docs.search-guard.com/latest/elasticsearch-alerting-getting-started)
* [Derivative Aggregation](https://opensearch.org/docs/latest/opensearch/pipeline-agg/)
* [Sum Aggregation](https://opensearch.org/docs/2.0/opensearch/metric-agg/)
* [Date Histogram Aggregation](https://opensearch.org/docs/latest/opensearch/pipeline-agg/)
* [Terms Aggregation](https://opensearch.org/docs/latest/opensearch/aggregations/)
* [Bool Query](https://opensearch.org/docs/latest/opensearch/query-dsl/bool/)
* [Range Query](https://opensearch.org/docs/latest/opensearch/query-dsl/term/)
