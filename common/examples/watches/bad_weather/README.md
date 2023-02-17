# Bad Weather

The watch alerts if there are any flights where certain weather problems (default to thunder or lightning) is occurring in the destination airport.

The watch query returns N hits (default 100) ordered by `timestamp` in descending order. The watch uses `query_string` to find all documents in the last X hours (default 4) which either contain the word thunder or lightning in the field `DestWeather`.

# Requirements

It is assumed you loaded [OpenSearch Dashboards Sample Data Flights](https://github.com/opensearch-project/OpenSearch-Dashboards/tree/main/src/plugins/home/server/services/sample_data/data_sets/flights) index.

Make sure you have correct Slack webhook URL in the action's `url`.

# References

* [Eliatra Suite Alerting Plus](https://docs.search-guard.com/latest/elasticsearch-alerting-getting-started)
* [Query String Query](https://opensearch.org/docs/latest/opensearch/query-dsl/full-text/)
* [Range Query](https://opensearch.org/docs/latest/opensearch/query-dsl/term/)
* [Field _source](https://opensearch.org/docs/latest/opensearch/mappings/)
* [Sort](https://opensearch.org/docs/latest/opensearch/search/sort/)
