# Bad Weather

The watch alerts if there are any flights where certain weather problems (default to thunder or lightning) is occurring in the destination airport.

The watch query returns N hits (default 100) ordered by `timestamp` in descending order. The watch uses `query_string` to find all documents in the last X hours (default 4) which either contain the word thunder or lightning in the field `DestWeather`.

# Requirements

It is assumed you loaded [Kibana Sample Data Flights](https://www.elastic.co/guide/en/kibana/current/add-sample-data.html) index.

Make sure you have correct Slack webhook URL in the action's `url`.

# References

* [Query String Query](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-query-string-query.html)
* [Range Query](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-range-query.html)
* [Field _source](https://www.elastic.co/guide/en/elasticsearch/reference/current/mapping-source-field.html#include-exclude)
* [Sort](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-request-body.html#request-body-search-sort)
