# Memory Usage

The watch alerts if memory usage for a host is greater than a configured threshold N (default 10000).

The watch searches across the last X minutes, taking into account the hosts with memory usage higher than N. The watch uses terms aggregation to retrieve the matched hosts and their maximum memory usage. An alert triggered if the number of hosts is greater than 0.

# Requirements

It is assumed you loaded [Kibana Sample Data Logs](https://www.elastic.co/guide/en/kibana/current/add-sample-data.html) index.

Make sure you have correct Slack webhook URL in the action's `url`.

# References

* [Signals Alerting](https://docs.search-guard.com/latest/elasticsearch-alerting-getting-started)
* [Max Aggregation](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-metrics-max-aggregation.html)
* [Terms Aggregation](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-bucket-terms-aggregation.html)
* [Bool Query](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-bool-query.html)
* [Range Query](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-range-query.html)
