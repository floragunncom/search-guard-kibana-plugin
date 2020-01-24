# Min Product Price

The watch alerts if the minimum price among all products is less than the threshold N (default 10).

The watch searches across the last X days (default 1) and returns the minimum price among all products extracted from the aggregated documents.

# Requirements

It is assumed you loaded [Kibana Sample eCommerce orders](https://www.elastic.co/guide/en/kibana/current/add-sample-data.html) index.

Make sure you have correct Slack webhook URL in the action's `url`.

# References

* [Signals Alerting](https://docs.search-guard.com/latest/elasticsearch-alerting-getting-started)
* [Min Aggregation](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-metrics-min-aggregation.html)
* [Bool Query](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-bool-query.html)
* [Range Query](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-range-query.html)
