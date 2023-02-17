# Min Product Price

The watch alerts if the minimum price among all products is less than the threshold N (default 10).

The watch searches across the last X days (default 1) and returns the minimum price among all products extracted from the aggregated documents.

# Requirements

It is assumed you loaded [OpenSearch Dashboards Sample eCommerce orders](https://github.com/opensearch-project/OpenSearch-Dashboards/tree/main/src/plugins/home/server/services/sample_data/data_sets/ecommerce) index.

Make sure you have correct Slack webhook URL in the action's `url`.

# References

* [Eliatra Suite Alerting Plus](https://docs.search-guard.com/latest/elasticsearch-alerting-getting-started)
* [Min Aggregation](https://opensearch.org/docs/latest/opensearch/aggregations/)
* [Bool Query](https://opensearch.org/docs/latest/opensearch/query-dsl/bool/)
* [Range Query](https://opensearch.org/docs/latest/opensearch/query-dsl/term/)
