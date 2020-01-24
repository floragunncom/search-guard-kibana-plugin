# Max Memory

The watch alerts if the maximum value of memory among all hosts is greater than the threshold N (default 10000).

The watch searches across the last X hours (default 12) and returns the maximum memory among all hosts extracted from the aggregated documents.

# Requirements

It is assumed you loaded [Kibana Sample Data Logs](https://www.elastic.co/guide/en/kibana/current/add-sample-data.html) index.

Make sure you have correct Slack webhook URL in the action's `url`.

# References

* [Signals Alerting](https://docs.search-guard.com/latest/elasticsearch-alerting-getting-started)
* [Max Aggregation](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-metrics-max-aggregation.html)
* [Bool Query](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-bool-query.html)
* [Range Query](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-range-query.html)
