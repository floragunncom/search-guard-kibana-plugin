# Change in Memory

The watch alerts if memory used by a host has decreased by more than N in the last X days.

The watch searches for the last X days (default to 1 month), aggregates by a host, creates a date histogram per host using 1 day interval and calculates derivative to get change in memory usage between the intervals. Transform script is used to normalize data for mustache templating in action. If the change for any host is less the configured threshold N (default 0), an alert is triggered.

# Requirements

It is assumed you loaded [Kibana Sample Data Logs](https://www.elastic.co/guide/en/kibana/current/add-sample-data.html) index.

Make sure you have correct Slack webhook URL in the action's `url`.

# References

* [Derivative Aggregation](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-pipeline-derivative-aggregation.html)
* [Sum Aggregation](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-metrics-sum-aggregation.html)
* [Date Histogram Aggregation](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-bucket-datehistogram-aggregation.html)
* [Terms Aggregation](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-bucket-terms-aggregation.html)
* [Bool Query](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-bool-query.html)
* [Range Query](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-range-query.html)
