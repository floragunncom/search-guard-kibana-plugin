# Average Ticket Price

The watch alerts if average price among all flight tickets is less than the threshold N (default 800).

The watch searches across the last X hours (default 1) and returns the average price among all flight tickets extracted from the aggregated documents.

# Requirements

It is assumed you loaded [OpenSearch Dashboards Sample Data Flights](https://github.com/opensearch-project/OpenSearch-Dashboards/tree/main/src/plugins/home/server/services/sample_data/data_sets/flights) index.

Make sure you have correct Slack webhook URL in the action's `url`.

# References

* [Alerting Alerting](https://docs.search-guard.com/latest/elasticsearch-alerting-getting-started)
* [Min Aggregation](https://opensearch.org/docs/latest/opensearch/metric-agg/)
* [Bool Query](https://opensearch.org/docs/latest/opensearch/query-dsl/bool/)
* [Range Query](https://opensearch.org/docs/latest/opensearch/query-dsl/term/)
