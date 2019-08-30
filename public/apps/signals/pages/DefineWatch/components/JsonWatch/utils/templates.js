import { stringifyPretty } from '../../../../../utils/helpers';
import { DOC_LINKS } from '../../../../../utils/constants';
import { QUERIES } from './constants';

// TODO: fix lint errors
const templates = {
  [QUERIES.FULL_TEXT]: {
    match: {
      example: stringifyPretty({
        query: {
          match: {
            message: 'this is a test'
          }
        }
      }),
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-match-query.html',
      description: 'The match queries accept text/numerics/dates, analyzes them, and constructs a query.'
    },
    match_phrase: {
      example: stringifyPretty({
        query: {
          match_phrase: {
            message: 'this is a test'
          }
        }
      }),
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-match-query-phrase.html',
      description: 'The match_phrase query analyzes the text and creates a phrase query out of the analyzed text.'
    },
    match_phrase_prefix: {
      example: stringifyPretty({
        query: {
          match_phrase_prefix: {
            message: 'quick brown f'
          }
        }
      }),
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-match-query-phrase-prefix.html',
      description: 'The match_phrase_prefix is the same as match_phrase, except that it allows for prefix matches on the last term in the text.'
    },
    multi_match: {
      example: stringifyPretty({
        query: {
          multi_match: {
            query: 'this is a test',
            fields: [ 'subject', 'message' ]
          }
        }
      }),
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-multi-match-query.html',
      description: 'The multi_match query builds on the match query to allow multi-field queries.'
    },
    common_terms: {
      example: stringifyPretty({
        query: {
          common: {
            body: {
              query: 'this is bonsai cool',
              cutoff_frequency: 0.001
            }
          }
        }
      }),
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-common-terms-query.html',
      description: 'The common terms query is a modern alternative to stopwords which improves the precision and recall of search results (by taking stopwords into account), without sacrificing performance.'
    },
    query_string: {
      example: stringifyPretty({
        query: {
          query_string: {
            default_field: 'content',
            query: 'this AND that OR thus'
          }
        }
      }),
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-query-string-query.html',
      description: 'A query that uses a query parser in order to parse its content.'
    },
    simple_query_string: {
      example: stringifyPretty({
        query: {
          simple_query_string: {
            query: '\fried eggs\ +(eggplant | potato) -frittata',
            fields: '[title^5, body]',
            default_operator: 'and'
          }
        }
      }),
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-simple-query-string-query.html',
      description: 'A query that uses the SimpleQueryParser to parse its context. Unlike the regular query_string query, the simple_query_string query will never throw an exception, and discards invalid parts of the query.'
    },
    intervals: {
      example: stringifyPretty({
        query: {
          intervals: {
            my_text: {
              all_of: {
                ordered: true,
                intervals: [
                  {
                    match: {
                      query: 'my favourite food',
                      max_gaps: 0,
                      ordered: true
                    }
                  },
                  {
                    any_of: {
                      intervals: [
                        { match: { query: 'hot water' } },
                        { match: { query: 'cold porridge' } }
                      ]
                    }
                  }
                ]
              },
              _name: 'favourite_food'
            }
          }
        }
      }),
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-intervals-query.html',
      description: 'An intervals query allows fine-grained control over the order and proximity of matching terms. '
    },
  },
  [QUERIES.TERM_LEVEL]: {
    term: {
      example: stringifyPretty({
        "query": {
            "term": {
                "user": {
                    "value": "Kimchy",
                    "boost": 1.0
                }
            }
        }
      }),
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-term-query.html',
      description: 'Returns documents that contain an exact term in a provided field.'
    },
    terms: {
      example: stringifyPretty({
        "query" : {
            "terms" : {
                "user" : ["kimchy", "elasticsearch"],
                "boost" : 1.0
            }
        }
      }),
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-terms-query.html',
      description: 'Returns documents that contain one or more exact terms in a provided field.'
    },
    terms_set: {
      example: stringifyPretty({
        "query": {
            "terms_set": {
                "codes" : {
                    "terms" : ["abc", "def", "ghi"],
                    "minimum_should_match_field": "required_matches"
                }
            }
        }
      }),
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-terms-set-query.html',
      description: 'Returns any documents that match with at least one or more of the provided terms.'
    },
    range: {
      example: stringifyPretty({
        "query": {
            "range" : {
                "age" : {
                    "gte" : 10,
                    "lte" : 20,
                    "boost" : 2.0
                }
            }
        }
      }),
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-range-query.html',
      description: 'Matches documents with fields that have terms within a certain range.'
    },
    exists: {
      example: stringifyPretty({
        "query": {
            "exists": {
                "field": "user"
            }
        }
      }),
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-exists-query.html',
      description: 'Returns documents that contain a value other than null or [] in a provided field.'
    },
    prefix: {
      example: stringifyPretty({
        "query": {
          "prefix" : { "user" : "ki" }
        }
      }),
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-prefix-query.html',
      description: 'Matches documents that have fields containing terms with a specified prefix (not analyzed).'
    },
    wildcard: {
      example: stringifyPretty({
        "query": {
            "wildcard": {
                "user": {
                    "value": "ki*y",
                    "boost": 1.0,
                    "rewrite": "constant_score"
                }
            }
        }
      }),
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-wildcard-query.html',
      description: 'Returns documents that contain terms matching a wildcard pattern.'
    },
    regexp: {
      example: stringifyPretty({
        "query": {
            "regexp":{
                "name.first": "s.*y"
            }
        }
      }),
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-regexp-query.html',
      description: 'The regexp query allows you to use regular expression term queries.'
    },
    fuzzy: {
      example: stringifyPretty({
        "query": {
           "fuzzy" : { "user" : "ki" }
        }
      }),
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-fuzzy-query.html',
      description: 'The fuzzy query uses similarity based on Levenshtein edit distance.'
    },
    ids: {
      example: stringifyPretty({
        "query": {
            "ids" : {
                "values" : ["1", "4", "100"]
            }
        }
      }),
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-ids-query.html',
      description: 'Returns documents based on their IDs. This query uses document IDs stored in the _id field.'
    },
  },
  [QUERIES.COMPOUND]: {
    constant_score: {
      example: stringifyPretty({
        "query": {
            "constant_score" : {
                "filter" : {
                    "term" : { "user" : "kimchy"}
                },
                "boost" : 1.2
            }
        }
      }),
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-constant-score-query.html',
      description: 'A query that wraps another query and simply returns a constant score equal to the query boost for every document in the filter. Maps to Lucene ConstantScoreQuery.'
    },
    bool: {
      example: stringifyPretty({
        "query": {
          "bool" : {
            "must" : {
              "term" : { "user" : "kimchy" }
            },
            "filter": {
              "term" : { "tag" : "tech" }
            },
            "must_not" : {
              "range" : {
                "age" : { "gte" : 10, "lte" : 20 }
              }
            },
            "should" : [
              { "term" : { "tag" : "wow" } },
              { "term" : { "tag" : "elasticsearch" } }
            ],
            "minimum_should_match" : 1,
            "boost" : 1.0
          }
        }
      }),
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-bool-query.html',
      description: 'A query that matches documents matching boolean combinations of other queries.'
    },
    dis_max: {
      example: stringifyPretty({
        "query": {
            "dis_max" : {
                "tie_breaker" : 0.7,
                "boost" : 1.2,
                "queries" : [
                    {
                        "term" : { "age" : 34 }
                    },
                    {
                        "term" : { "age" : 35 }
                    }
                ]
            }
        }
      }),
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-dis-max-query.html',
      description: 'A query that generates the union of documents produced by its subqueries, and that scores each document with the maximum score for that document as produced by any subquery, plus a tie breaking increment for any additional matching subqueries.'
    },
    function_score: {
      example: stringifyPretty({
        "query": {
            "function_score": {
                "query": { "match_all": {} },
                "boost": "5",
                "random_score": {},
                "boost_mode":"multiply"
            }
        }
      }),
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-function-score-query.html',
      description: 'The function_score allows you to modify the score of documents that are retrieved by a query. '
    },
    boosting: {
      example: stringifyPretty({
        "query": {
            "boosting" : {
                "positive" : {
                    "term" : {
                        "field1" : "value1"
                    }
                },
                "negative" : {
                     "term" : {
                         "field2" : "value2"
                    }
                },
                "negative_boost" : 0.2
            }
        }
      }),
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-boosting-query.html',
      description: 'The boosting query can be used to effectively demote results that match a given query.'
    },
  },
  [QUERIES.JOIN]: {
    nested: {
      example: stringifyPretty({
        "query": {
            "nested" : {
                "path" : "obj1",
                "score_mode" : "avg",
                "query" : {
                    "bool" : {
                        "must" : [
                        { "match" : {"obj1.name" : "blue"} },
                        { "range" : {"obj1.count" : {"gt" : 5}} }
                        ]
                    }
                }
            }
        }
      }),
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-nested-query.html',
      description: 'Nested query allows to query nested objects / docs.'
    },
    has_child: {
      example: stringifyPretty({
        "query": {
            "has_child" : {
                "type" : "blog_tag",
                "query" : {
                    "term" : {
                        "tag" : "something"
                    }
                }
            }
        }
      }),
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-has-child-query.html',
      description: 'The has_child filter accepts a query and the child type to run against, and results in parent documents that have child docs matching the query.'
    },
    has_parent: {
      example: stringifyPretty({
        "query": {
            "has_parent" : {
                "parent_type" : "blog",
                "query" : {
                    "term" : {
                        "tag" : "something"
                    }
                }
            }
        }
      }),
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-has-parent-query.html',
      description: 'The has_parent query accepts a query and a parent type. '
    },
    parent_id: {
      example: stringifyPretty({
        "query": {
          "parent_id": {
            "type": "my_child",
            "id": "1"
          }
        }
      }),
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-parent-id-query.html',
      description: 'The parent_id query can be used to find child documents which belong to a particular parent. '
    },
  },
  [QUERIES.GEO_QUERIES]: {
    geoShape: {
      example: stringifyPretty({
        "query":{
             "bool": {
                 "must": {
                     "match_all": {}
                 },
                 "filter": {
                     "geo_shape": {
                         "location": {
                             "shape": {
                                 "type": "envelope",
                                 "coordinates" : [[13.0, 53.0], [14.0, 52.0]]
                             },
                             "relation": "within"
                         }
                     }
                 }
             }
         }
      }),
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-geo-shape-query.html',
      description: 'Filter documents indexed using the geo_shape type.'
    },
    geo_bounding: {
      example: stringifyPretty({
        "query": {
          "bool" : {
              "must" : {
                  "match_all" : {}
              },
              "filter" : {
                  "geo_bounding_box" : {
                      "pin.location" : {
                          "top_left" : {
                              "lat" : 40.73,
                              "lon" : -74.1
                          },
                          "bottom_right" : {
                              "lat" : 40.01,
                              "lon" : -71.12
                          }
                      }
                  }
              }
          }
        }
      }),
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-geo-bounding-box-query.html',
      description: 'A query allowing to filter hits based on a point location using a bounding box.'
    },
    geo_distance: {
      example: stringifyPretty({
        "query": {
            "bool" : {
                "must" : {
                    "match_all" : {}
                },
                "filter" : {
                    "geo_distance" : {
                        "distance" : "200km",
                        "pin.location" : {
                            "lat" : 40,
                            "lon" : -70
                        }
                    }
                }
            }
        }
      }),
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-geo-distance-query.html',
      description: 'Filters documents that include only hits that exists within a specific distance from a geo point. '
    },
    geo_polygon: {
      example: stringifyPretty({
        "query": {
            "bool" : {
                "must" : {
                    "match_all" : {}
                },
                "filter" : {
                    "geo_polygon" : {
                        "person.location" : {
                            "points" : [
                                {"lat" : 40, "lon" : -70},
                                {"lat" : 30, "lon" : -80},
                                {"lat" : 20, "lon" : -90}
                            ]
                        }
                    }
                }
            }
        }
      }),
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-geo-polygon-query.html',
      description: 'A query returning hits that only fall within a polygon of points.'
    },
  },
  [QUERIES.SPECIALIZED]: {
    more_like_this: {
      example: stringifyPretty({
        "query": {
          "more_like_this" : {
              "fields" : ["title", "description"],
              "like" : "Once upon a time",
              "min_term_freq" : 1,
              "max_query_terms" : 12
          }
        }
      }),
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-mlt-query.html',
      description: 'The More Like This Query finds documents that are "like" a given set of documents.'
    },
    script: {
      example: stringifyPretty({
        "query": {
            "bool" : {
                "filter" : {
                    "script" : {
                        "script" : {
                            "source": "doc['num1'].value > 1",
                            "lang": "painless"
                         }
                    }
                }
            }
        }
      }),
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-script-query.html',
      description: 'A query allowing to define scripts as queries. '
    },
    script_score: {
      example: stringifyPretty({
        "query" : {
           "script_score" : {
               "query" : {
                   "match": { "message": "elasticsearch" }
               },
               "script" : {
                   "source" : "doc['likes'].value / 10 "
               }
           }
        }
      }),
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-script-score-query.html',
      description: 'The script_score allows you to modify the score of documents that are retrieved by a query.'
    },
    percolate: {
      example: stringifyPretty({
        "query" : {
            "percolate" : {
                "field" : "query",
                "document" : {
                    "message" : "A new bonsai tree in the office"
                }
            }
        }
      }),
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-percolate-query.html',
      description: 'The percolate query can be used to match queries stored in an index. The percolate query itself contains the document that will be used as query to match with the stored queries.'
    },
    rank_feature: {
      example: stringifyPretty({
        "query": {
          "bool": {
            "must": [
              {
                "match": {
                  "content": "2016"
                }
              }
            ],
            "should": [
              {
                "rank_feature": {
                  "field": "pagerank"
                }
              },
              {
                "rank_feature": {
                  "field": "url_length",
                  "boost": 0.1
                }
              },
              {
                "rank_feature": {
                  "field": "topics.sports",
                  "boost": 0.4
                }
              }
            ]
          }
        }
      }),
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-rank-feature-query.html',
      description: 'The rank_feature query is a specialized query that only works on rank_feature fields and rank_features fields.'
    },
    wrapper: {
      example: stringifyPretty({
        "query" : {
            "wrapper": {
                "query" : "eyJ0ZXJtIiA6IHsgInVzZXIiIDogIktpbWNoeSIgfX0="
            }
        }
      }),
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-wrapper-query.html',
      description: 'A query that accepts any other query as base64 encoded string.'
    },
  },
  [QUERIES.SPAN]: {
    span_term: {
      example: stringifyPretty({
        "query": {
            "span_term" : { "user" : "kimchy" }
        }
      }),
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-span-term-query.html',
      description: 'Matches spans containing a term.'
    },
    span_multi_term: {
      example: stringifyPretty({
        "query": {
            "span_multi":{
                "match":{
                    "prefix" : { "user" :  { "value" : "ki" } }
                }
            }
        }
      }),
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-span-multi-term-query.html',
      description: 'The span_multi query allows you to wrap a multi term query (one of wildcard, fuzzy, prefix, range or regexp query) as a span query, so it can be nested.'
    },
    span_first: {
      example: stringifyPretty({
        "query": {
            "span_first" : {
                "match" : {
                    "span_term" : { "user" : "kimchy" }
                },
                "end" : 3
            }
        }
      }),
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-span-first-query.html',
      description: 'Matches spans near the beginning of a field. The span first query maps to Lucene SpanFirstQuery. '
    },
    span_near: {
      example: stringifyPretty({
        "query": {
          "span_near" : {
              "clauses" : [
                  { "span_term" : { "field" : "value1" } },
                  { "span_term" : { "field" : "value2" } },
                  { "span_term" : { "field" : "value3" } }
              ],
              "slop" : 12,
              "in_order" : false
          }
        }
      }),
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-span-near-query.html',
      description: 'Matches spans which are near one another. One can specify slop, the maximum number of intervening unmatched positions, as well as whether matches are required to be in-order.'
    },
    span_or: {
      example: stringifyPretty({
        "query": {
          "span_or" : {
              "clauses" : [
                  { "span_term" : { "field" : "value1" } },
                  { "span_term" : { "field" : "value2" } },
                  { "span_term" : { "field" : "value3" } }
              ]
          }
        }
      }),
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-span-or-query.html',
      description: 'Matches the union of its span clauses. The span or query maps to Lucene SpanOrQuery.'
    },
    span_not: {
      example: stringifyPretty({
        "query": {
          "span_not" : {
              "include" : {
                  "span_term" : { "field1" : "hoya" }
              },
              "exclude" : {
                  "span_near" : {
                      "clauses" : [
                          { "span_term" : { "field1" : "la" } },
                          { "span_term" : { "field1" : "hoya" } }
                      ],
                      "slop" : 0,
                      "in_order" : true
                  }
              }
          }
        }
      }),
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-span-not-query.html',
      description: 'Removes matches which overlap with another span query or which are within x tokens before (controlled by the parameter pre) or y tokens after (controlled by the parameter post) another SpanQuery.'
    },
    span_containing: {
      example: stringifyPretty({
        "query": {
            "span_containing" : {
                "little" : {
                    "span_term" : { "field1" : "foo" }
                },
                "big" : {
                    "span_near" : {
                        "clauses" : [
                            { "span_term" : { "field1" : "bar" } },
                            { "span_term" : { "field1" : "baz" } }
                        ],
                        "slop" : 5,
                        "in_order" : true
                    }
                }
            }
        }
      }),
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-span-containing-query.html',
      description: 'Returns matches which enclose another span query.'
    },
    span_within: {
      example: stringifyPretty({
        "query": {
          "span_within" : {
              "little" : {
                  "span_term" : { "field1" : "foo" }
              },
              "big" : {
                  "span_near" : {
                      "clauses" : [
                          { "span_term" : { "field1" : "bar" } },
                          { "span_term" : { "field1" : "baz" } }
                      ],
                      "slop" : 5,
                      "in_order" : true
                  }
              }
          }
        }
      }),
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-span-within-query.html',
      description: 'Returns matches which are enclosed inside another span query.'
    },
    span_field_masking: {
      example: stringifyPretty({
        "query": {
          "span_near": {
            "clauses": [
              {
                "span_term": {
                  "text": "quick brown"
                }
              },
              {
                "field_masking_span": {
                  "query": {
                    "span_term": {
                      "text.stems": "fox"
                    }
                  },
                  "field": "text"
                }
              }
            ],
            "slop": 5,
            "in_order": false
          }
        }
      }),
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-span-field-masking-query.html',
      description: 'Wrapper to allow span queries to participate in composite single-field span queries by lying about their search field.'
    },
  },
  [QUERIES.METRICS_AGGREGATIONS]: {
    avg: {
      example: stringifyPretty({
        "aggs" : {
            "avg_grade" : { "avg" : { "field" : "grade" } }
        }
      }),
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-metrics-avg-aggregation.html#search-aggregations-metrics-avg-aggregation',
      description: 'A single-value metrics aggregation that computes the average of numeric values that are extracted from the aggregated documents.'
    },
    weighted_avg: {
      example: stringifyPretty({
        "size": 0,
        "aggs" : {
            "weighted_grade": {
                "weighted_avg": {
                    "value": {
                        "field": "grade"
                    },
                    "weight": {
                        "field": "weight"
                    }
                }
            }
        }
      }),
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-metrics-weight-avg-aggregation.html',
      description: 'A single-value metrics aggregation that computes the weighted average of numeric values that are extracted from the aggregated documents. These values can be extracted either from specific numeric fields in the documents.'
    },
    cardinality: {
      example: stringifyPretty({
        "aggs" : {
            "type_count" : {
                "cardinality" : {
                    "field" : "type"
                }
            }
        }
      }),
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-metrics-cardinality-aggregation.html',
      description: 'A single-value metrics aggregation that calculates an approximate count of distinct values. Values can be extracted either from specific fields in the document or generated by a script.'
    },
    extended_stats: {
      example: stringifyPretty({
        "size": 0,
        "aggs" : {
            "grades_stats" : { "extended_stats" : { "field" : "grade" } }
        }
      }),
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-metrics-extendedstats-aggregation.html',
      description: 'A multi-value metrics aggregation that computes stats over numeric values extracted from the aggregated documents.'
    },
    geo_bounds: {
      example: stringifyPretty({
        "query" : {
            "match" : { "name" : "musée" }
        },
        "aggs" : {
            "viewport" : {
                "geo_bounds" : {
                    "field" : "location",
                    "wrap_longitude" : true
                }
            }
        }
      }),
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-metrics-geobounds-aggregation.html',
      description: 'A metric aggregation that computes the bounding box containing all geo_point values for a field.'
    },
    geo_centroid: {
      example: stringifyPretty({
        "aggs" : {
            "centroid" : {
                "geo_centroid" : {
                    "field" : "location"
                }
            }
        }
      }),
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-metrics-geocentroid-aggregation.html',
      description: 'A metric aggregation that computes the weighted centroid from all coordinate values for a Geo-point datatype field.'
    },
    max: {
      example: stringifyPretty({
        "aggs" : {
            "max_price" : { "max" : { "field" : "price" } }
        }
      }),
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-metrics-max-aggregation.html',
      description: 'A single-value metrics aggregation that keeps track and returns the maximum value among the numeric values extracted from the aggregated documents. These values can be extracted either from specific numeric fields in the documents, or be generated by a provided script.'
    },
    min: {
      example: stringifyPretty({
        "aggs" : {
            "min_price" : { "min" : { "field" : "price" } }
        }
      }),
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-metrics-min-aggregation.html',
      description: 'A single-value metrics aggregation that keeps track and returns the minimum value among numeric values extracted from the aggregated documents. '
    },
    percentiles: {
      example: stringifyPretty({
        "size": 0,
        "aggs" : {
            "load_time_outlier" : {
                "percentiles" : {
                    "field" : "load_time"
                }
            }
        }
      }),
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-metrics-percentile-aggregation.html',
      description: 'A multi-value metrics aggregation that calculates one or more percentiles over numeric values extracted from the aggregated documents.'
    },
    percentile_ranks: {
      example: stringifyPretty({
        "size": 0,
        "aggs" : {
            "load_time_ranks" : {
                "percentile_ranks" : {
                    "field" : "load_time",
                    "values" : [500, 600]
                }
            }
        }
      }),
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-metrics-percentile-rank-aggregation.html',
      description: 'A multi-value metrics aggregation that calculates one or more percentile ranks over numeric values extracted from the aggregated documents.'
    },
    scripted_metric: {
      example: stringifyPretty({
        "query" : {
          "match_all" : {}
        },
        "aggs": {
          "profit": {
              "scripted_metric": {
                  "init_script" : "state.transactions = []",
                  "map_script" : "state.transactions.add(doc.type.value == 'sale' ? doc.amount.value : -1 * doc.amount.value)",
                  "combine_script" : "double profit = 0; for (t in state.transactions) { profit += t } return profit",
                  "reduce_script" : "double profit = 0; for (a in states) { profit += a } return profit"
              }
          }
        }
      }),
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-metrics-scripted-metric-aggregation.html',
      description: 'A metric aggregation that executes using scripts to provide a metric output.'
    },
    stats: {
      example: stringifyPretty({
        "aggs" : {
            "grades_stats" : { "stats" : { "field" : "grade" } }
        }
      }),
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-metrics-stats-aggregation.html',
      description: 'A multi-value metrics aggregation that computes stats over numeric values extracted from the aggregated documents.'
    },
    sum: {
      example: stringifyPretty({
        "query" : {
          "constant_score" : {
              "filter" : {
                  "match" : { "type" : "hat" }
              }
          }
        },
        "aggs" : {
          "hat_prices" : { "sum" : { "field" : "price" } }
        }
      }),
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-metrics-sum-aggregation.html',
      description: 'A single-value metrics aggregation that sums up numeric values that are extracted from the aggregated documents. '
    },
    top_hits: {
      example: stringifyPretty({
        "aggs": {
             "top_tags": {
                 "terms": {
                     "field": "type",
                     "size": 3
                 },
                 "aggs": {
                     "top_sales_hits": {
                         "top_hits": {
                             "sort": [
                                 {
                                     "date": {
                                         "order": "desc"
                                     }
                                 }
                             ],
                             "_source": {
                                 "includes": [ "date", "price" ]
                             },
                             "size" : 1
                         }
                     }
                 }
             }
         }
      }),
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-metrics-top-hits-aggregation.html',
      description: 'A top_hits metric aggregator keeps track of the most relevant document being aggregated. This aggregator is intended to be used as a sub aggregator, so that the top matching documents can be aggregated per bucket.'
    },
    value_count: {
      example: stringifyPretty({
        "aggs" : {
          "types_count" : { "value_count" : { "field" : "type" } }
        }
      }),
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-metrics-valuecount-aggregation.html',
      description: 'A single-value metrics aggregation that counts the number of values that are extracted from the aggregated documents.'
    },
    median_absolute_deviation: {
      example: stringifyPretty({
        "size": 0,
        "aggs": {
          "review_average": {
            "avg": {
              "field": "rating"
            }
          },
          "review_variability": {
            "median_absolute_deviation": {
              "field": "rating"
            }
          }
        }
      }),
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-metrics-median-absolute-deviation-aggregation.html',
      description: 'Median absolute deviation is a measure of variability. It is a robust statistic, meaning that it is useful for describing data that may have outliers, or may not be normally distributed. For such data it can be more descriptive than standard deviation.'
    },
  },
  [QUERIES.BUCKET_AGGREGATIONS]: {
    adjacency_matrix: {
      example: stringifyPretty({
        "size": 0,
        "aggs" : {
          "interactions" : {
            "adjacency_matrix" : {
              "filters" : {
                "grpA" : { "terms" : { "accounts" : ["hillary", "sidney"] }},
                "grpB" : { "terms" : { "accounts" : ["donald", "mitt"] }},
                "grpC" : { "terms" : { "accounts" : ["vladimir", "nigel"] }}
              }
            }
          }
        }
      }),
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-bucket-adjacency-matrix-aggregation.html',
      description: 'A bucket aggregation returning a form of adjacency matrix. The request provides a collection of named filter expressions, similar to the filters aggregation request. Each bucket in the response represents a non-empty cell in the matrix of intersecting filters.'
    },
    auto_interval_date_histogram: {
      example: stringifyPretty({
        "aggs" : {
          "sales_over_time" : {
              "auto_date_histogram" : {
                  "field" : "date",
                  "buckets" : 10
              }
          }
        }
      }),
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-bucket-autodatehistogram-aggregation.html',
      description: 'A multi-bucket aggregation similar to the Date Histogram Aggregation except instead of providing an interval to use as the width of each bucket, a target number of buckets is provided indicating the number of buckets needed and the interval of the buckets is automatically chosen to best achieve that target. '
    },
    children: {
      example: stringifyPretty({
        "aggs": {
        "top-tags": {
          "terms": {
            "field": "tags.keyword",
            "size": 10
          },
          "aggs": {
            "to-answers": {
              "children": {
                "type" : "answer"
              },
              "aggs": {
                "top-names": {
                  "terms": {
                    "field": "owner.display_name.keyword",
                    "size": 10
                  }
                }
              }
            }
          }
        }
      }
      }),
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-bucket-children-aggregation.html',
      description: 'A special single bucket aggregation that selects child documents that have the specified type, as defined in a join field.'
    },
    composite: {
      example: stringifyPretty({
        "aggs" : {
           "my_buckets": {
               "composite" : {
                   "sources" : [
                       { "product": { "terms" : { "field": "product" } } }
                   ]
               }
           }
        }
      }),
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-bucket-composite-aggregation.html',
      description: 'A multi-bucket aggregation that creates composite buckets from different sources.'
    },
    date_histogram: {
      example: stringifyPretty({
        "aggs" : {
            "sales_over_time" : {
                "date_histogram" : {
                    "field" : "date",
                    "interval" : "month"
                }
            }
        }
      }),
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-bucket-datehistogram-aggregation.html',
      description: 'This multi-bucket aggregation is similar to the normal histogram, but it can only be used with date values. '
    },
    date_range: {
      example: stringifyPretty({
        "aggs": {
            "range": {
                "date_range": {
                    "field": "date",
                    "format": "MM-yyy",
                    "ranges": [
                        { "to": "now-10M/M" },
                        { "from": "now-10M/M" }
                    ]
                }
            }
        }
      }),
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-bucket-daterange-aggregation.html',
      description: 'A range aggregation that is dedicated for date values. The main difference between this aggregation and the normal range aggregation is that the from and to values can be expressed in Date Math expressions, and it is also possible to specify a date format by which the from and to response fields will be returned.'
    },
    diversified_sampler: {
      example: stringifyPretty({
        "query": {
            "query_string": {
                "query": "tags:elasticsearch"
            }
        },
        "aggs": {
            "my_unbiased_sample": {
                "diversified_sampler": {
                    "shard_size": 200,
                    "field" : "author"
                },
                "aggs": {
                    "keywords": {
                        "significant_terms": {
                            "field": "tags",
                            "exclude": ["elasticsearch"]
                        }
                    }
                }
            }
        }
      }),
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-bucket-diversified-sampler-aggregation.html',
      description: 'Like the sampler aggregation this is a filtering aggregation used to limit any sub aggregations\' processing to a sample of the top-scoring documents.'
    },
    filter: {
      example: stringifyPretty({
        "aggs" : {
            "t_shirts" : {
                "filter" : { "term": { "type": "t-shirt" } },
                "aggs" : {
                    "avg_price" : { "avg" : { "field" : "price" } }
                }
            }
        }
      }),
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-bucket-filter-aggregation.html',
      description: 'Defines a single bucket of all the documents in the current document set context that match a specified filter.'
    },
    filters: {
      example: stringifyPretty({
        "size": 0,
        "aggs" : {
        "messages" : {
          "filters" : {
            "filters" : {
              "errors" :   { "match" : { "body" : "error"   }},
              "warnings" : { "match" : { "body" : "warning" }}
            }
          }
        }
        }
      }),
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-bucket-filters-aggregation.html',
      description: 'Defines a multi bucket aggregation where each bucket is associated with a filter.'
    },
    geo_distance: {
      example: stringifyPretty({
        "aggs" : {
            "rings_around_amsterdam" : {
                "geo_distance" : {
                    "field" : "location",
                    "origin" : "52.3760, 4.894",
                    "ranges" : [
                        { "to" : 100000 },
                        { "from" : 100000, "to" : 300000 },
                        { "from" : 300000 }
                    ]
                }
            }
        }
      }),
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-bucket-geodistance-aggregation.html',
      description: 'A multi-bucket aggregation that works on geo_point fields and conceptually works very similar to the range aggregation. The user can define a point of origin and a set of distance range buckets.'
    },
    geoHash_grid: {
      example: stringifyPretty({
        "aggregations" : {
            "large-grid" : {
                "geohash_grid" : {
                    "field" : "location",
                    "precision" : 3
                }
            }
        }
      }),
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-bucket-geohashgrid-aggregation.html',
      description: 'A multi-bucket aggregation that works on geo_point fields and groups points into buckets that represent cells in a grid.'
    },
    geoTile_grid : {
      example: stringifyPretty({
        "aggregations" : {
            "large-grid" : {
                "geotile_grid" : {
                    "field" : "location",
                    "precision" : 8
                }
            }
        }
      }),
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-bucket-geotilegrid-aggregation.html',
      description: 'A multi-bucket aggregation that works on geo_point fields and groups points into buckets that represent cells in a grid. The resulting grid can be sparse and only contains cells that have matching data. Each cell corresponds to a map tile as used by many online map sites. Each cell is labeled using a "{zoom}/{x}/{y}" format, where zoom is equal to the user-specified precision.'
    },
    global: {
      example: stringifyPretty({
        "query" : {
            "match" : { "type" : "t-shirt" }
        },
        "aggs" : {
            "all_products" : {
                "global" : {},
                "aggs" : {
                    "avg_price" : { "avg" : { "field" : "price" } }
                }
            },
            "t_shirts": { "avg" : { "field" : "price" } }
        }
      }),
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-bucket-global-aggregation.html',
      description: 'Defines a single bucket of all the documents within the search execution context. This context is defined by the indices and the document types you’re searching on, but is not influenced by the search query itself.'
    },
    histogram: {
      example: stringifyPretty({
        "aggs" : {
            "prices" : {
                "histogram" : {
                    "field" : "price",
                    "interval" : 50
                }
            }
        }
      }),
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-bucket-histogram-aggregation.html',
      description: 'A multi-bucket values source based aggregation that can be applied on numeric values extracted from the documents. It dynamically builds fixed size (a.k.a. interval) buckets over the values.'
    },
    ip_range: {
      example: stringifyPretty({
        "size": 10,
        "aggs" : {
            "ip_ranges" : {
                "ip_range" : {
                    "field" : "ip",
                    "ranges" : [
                        { "to" : "10.0.0.5" },
                        { "from" : "10.0.0.5" }
                    ]
                }
            }
        }
      }),
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-bucket-iprange-aggregation.html',
      description: 'Just like the dedicated date range aggregation, there is also a dedicated range aggregation for IP typed fields.'
    },
    missing: {
      example: stringifyPretty({
        "aggs" : {
            "products_without_a_price" : {
                "missing" : { "field" : "price" }
            }
        }
      }),
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-bucket-missing-aggregation.html',
      description: 'A field data based single bucket aggregation, that creates a bucket of all documents in the current document set context that are missing a field value (effectively, missing a field or having the configured NULL value set).'
    },
    nested: {
      example: stringifyPretty({
        "query" : {
            "match" : { "name" : "led tv" }
        },
        "aggs" : {
            "resellers" : {
                "nested" : {
                    "path" : "resellers"
                },
                "aggs" : {
                    "min_price" : { "min" : { "field" : "resellers.price" } }
                }
            }
        }
      }),
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-bucket-nested-aggregation.html',
      description: 'A special single bucket aggregation that enables aggregating nested documents.'
    },
    parent: {
      example: stringifyPretty({
        "aggs": {
          "top-names": {
            "terms": {
              "field": "owner.display_name.keyword",
              "size": 10
            },
            "aggs": {
              "to-questions": {
                "parent": {
                  "type" : "answer"
                },
                "aggs": {
                  "top-tags": {
                    "terms": {
                      "field": "tags.keyword",
                      "size": 10
                    }
                  }
                }
              }
            }
          }
        }
      }),
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-bucket-parent-aggregation.html',
      description: 'A special single bucket aggregation that selects parent documents that have the specified type, as defined in a join field.'
    },
    range: {
      example: stringifyPretty({
        "aggs" : {
            "price_ranges" : {
                "range" : {
                    "field" : "price",
                    "ranges" : [
                        { "to" : 100.0 },
                        { "from" : 100.0, "to" : 200.0 },
                        { "from" : 200.0 }
                    ]
                }
            }
        }
      }),
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-bucket-range-aggregation.html',
      description: 'A multi-bucket value source based aggregation that enables the user to define a set of ranges - each representing a bucket. During the aggregation process, the values extracted from each document will be checked against each bucket range and "bucket" the relevant/matching document.'
    },
    reverse_nested: {
      example: stringifyPretty({
        "query": {
          "match_all": {}
        },
        "aggs": {
          "comments": {
            "nested": {
              "path": "comments"
            },
            "aggs": {
              "top_usernames": {
                "terms": {
                  "field": "comments.username"
                },
                "aggs": {
                  "comment_to_issue": {
                    "reverse_nested": {},
                    "aggs": {
                      "top_tags_per_comment": {
                        "terms": {
                          "field": "tags"
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }),
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-bucket-reverse-nested-aggregation.html',
      description: 'A special single bucket aggregation that enables aggregating on parent docs from nested documents. Effectively this aggregation can break out of the nested block structure and link to other nested structures or the root document, which allows nesting other aggregations that aren’t part of the nested object in a nested aggregation.'
    },
    sampler: {
      example: stringifyPretty({
        "query": {
            "query_string": {
                "query": "tags:kibana OR tags:javascript"
            }
        },
        "aggs": {
            "sample": {
                "sampler": {
                    "shard_size": 200
                },
                "aggs": {
                    "keywords": {
                        "significant_terms": {
                            "field": "tags",
                            "exclude": ["kibana", "javascript"]
                        }
                    }
                }
            }
        }
      }),
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-bucket-sampler-aggregation.html',
      description: 'A filtering aggregation used to limit any sub aggregations\' processing to a sample of the top-scoring documents.'
    },
    significant_terms: {
      example: stringifyPretty({
        "query" : {
            "terms" : {"force" : [ "British Transport Police" ]}
        },
        "aggregations" : {
            "significant_crime_types" : {
                "significant_terms" : { "field" : "crime_type" }
            }
        }
      }),
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-bucket-significantterms-aggregation.html',
      description: 'An aggregation that returns interesting or unusual occurrences of terms in a set.'
    },
    significant_text: {
      example: stringifyPretty({
        "query" : {
          "match" : {"content" : "Bird flu"}
        },
        "aggregations" : {
          "my_sample" : {
              "sampler" : {
                  "shard_size" : 100
              },
              "aggregations": {
                  "keywords" : {
                      "significant_text" : { "field" : "content" }
                  }
              }
          }
        }
      }),
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-bucket-significanttext-aggregation.html',
      description: 'An aggregation that returns interesting or unusual occurrences of free-text terms in a set.'
    },
    terms: {
      example: stringifyPretty({
        "aggs" : {
            "genres" : {
                "terms" : { "field" : "genre" }
            }
        }
      }),
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-bucket-terms-aggregation.html',
      description: 'A multi-bucket value source based aggregation where buckets are dynamically built - one per unique value.'
    },
  },
  [QUERIES.PIPELINE_AGGREGATIONS]: {
    avg_bucket: {
      example: stringifyPretty({
        "size": 0,
        "aggs": {
          "sales_per_month": {
            "date_histogram": {
              "field": "date",
              "interval": "month"
            },
            "aggs": {
              "sales": {
                "sum": {
                  "field": "price"
                }
              }
            }
          },
          "avg_monthly_sales": {
            "avg_bucket": {
              "buckets_path": "sales_per_month>sales"
            }
          }
        }
      }),
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-pipeline-avg-bucket-aggregation.html',
      description: 'A sibling pipeline aggregation which calculates the (mean) average value of a specified metric in a sibling aggregation. The specified metric must be numeric and the sibling aggregation must be a multi-bucket aggregation.'
    },
    derivative: {
      example: stringifyPretty({
        "size": 0,
        "aggs" : {
            "sales_per_month" : {
                "date_histogram" : {
                    "field" : "date",
                    "interval" : "month"
                },
                "aggs": {
                    "sales": {
                        "sum": {
                            "field": "price"
                        }
                    },
                    "sales_deriv": {
                        "derivative": {
                            "buckets_path": "sales"
                        }
                    }
                }
            }
        }
      }),
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-pipeline-derivative-aggregation.html',
      description: 'A parent pipeline aggregation which calculates the derivative of a specified metric in a parent histogram (or date_histogram) aggregation.'
    },
    max_bucket: {
      example: stringifyPretty({
        "size": 0,
        "aggs" : {
            "sales_per_month" : {
                "date_histogram" : {
                    "field" : "date",
                    "interval" : "month"
                },
                "aggs": {
                    "sales": {
                        "sum": {
                            "field": "price"
                        }
                    }
                }
            },
            "max_monthly_sales": {
                "max_bucket": {
                    "buckets_path": "sales_per_month>sales"
                }
            }
        }
      }),
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-pipeline-max-bucket-aggregation.html',
      description: 'A sibling pipeline aggregation which identifies the bucket(s) with the maximum value of a specified metric in a sibling aggregation and outputs both the value and the key(s) of the bucket(s).'
    },
    min_bucket: {
      example: stringifyPretty({
        "size": 0,
        "aggs" : {
            "sales_per_month" : {
                "date_histogram" : {
                    "field" : "date",
                    "interval" : "month"
                },
                "aggs": {
                    "sales": {
                        "sum": {
                            "field": "price"
                        }
                    }
                }
            },
            "min_monthly_sales": {
                "min_bucket": {
                    "buckets_path": "sales_per_month>sales"
                }
            }
        }
      }),
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-pipeline-min-bucket-aggregation.html',
      description: 'A sibling pipeline aggregation which identifies the bucket(s) with the minimum value of a specified metric in a sibling aggregation and outputs both the value and the key(s) of the bucket(s).'
    },
    sum_bucket: {
      example: stringifyPretty({
        "size": 0,
        "aggs" : {
            "sales_per_month" : {
                "date_histogram" : {
                    "field" : "date",
                    "interval" : "month"
                },
                "aggs": {
                    "sales": {
                        "sum": {
                            "field": "price"
                        }
                    }
                }
            },
            "sum_monthly_sales": {
                "sum_bucket": {
                    "buckets_path": "sales_per_month>sales"
                }
            }
        }
      }),
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-pipeline-sum-bucket-aggregation.html',
      description: 'A sibling pipeline aggregation which calculates the sum across all bucket of a specified metric in a sibling aggregation.'
    },
    stats_bucket: {
      example: stringifyPretty({
        "size": 0,
        "aggs" : {
            "sales_per_month" : {
                "date_histogram" : {
                    "field" : "date",
                    "interval" : "month"
                },
                "aggs": {
                    "sales": {
                        "sum": {
                            "field": "price"
                        }
                    }
                }
            },
            "stats_monthly_sales": {
                "stats_bucket": {
                    "buckets_path": "sales_per_month>sales"
                }
            }
        }
      }),
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-pipeline-stats-bucket-aggregation.html',
      description: 'A sibling pipeline aggregation which calculates a variety of stats across all bucket of a specified metric in a sibling aggregation.'
    },
    extended_stats_bucket: {
      example: stringifyPretty({
        "size": 0,
        "aggs" : {
            "sales_per_month" : {
                "date_histogram" : {
                    "field" : "date",
                    "interval" : "month"
                },
                "aggs": {
                    "sales": {
                        "sum": {
                            "field": "price"
                        }
                    }
                }
            },
            "stats_monthly_sales": {
                "extended_stats_bucket": {
                    "buckets_path": "sales_per_month>sales"
                }
            }
        }
      }),
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-pipeline-extended-stats-bucket-aggregation.html',
      description: 'A sibling pipeline aggregation which calculates a variety of stats across all bucket of a specified metric in a sibling aggregation.'
    },
    percentiles_bucket: {
      example: stringifyPretty({
        "size": 0,
        "aggs" : {
            "sales_per_month" : {
                "date_histogram" : {
                    "field" : "date",
                    "interval" : "month"
                },
                "aggs": {
                    "sales": {
                        "sum": {
                            "field": "price"
                        }
                    }
                }
            },
            "percentiles_monthly_sales": {
                "percentiles_bucket": {
                    "buckets_path": "sales_per_month>sales",
                    "percents": [ 25.0, 50.0, 75.0 ]
                }
            }
        }
      }),
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-pipeline-percentiles-bucket-aggregation.html',
      description: 'A sibling pipeline aggregation which calculates percentiles across all bucket of a specified metric in a sibling aggregation. '
    },
    moving_average: {
      example: stringifyPretty({
        "size": 0,
        "aggs": {
            "my_date_histo":{
                "date_histogram":{
                    "field":"date",
                    "interval":"1M"
                },
                "aggs":{
                    "the_sum":{
                        "sum":{ "field": "price" }
                    },
                    "the_movavg":{
                        "moving_avg":{ "buckets_path": "the_sum" }
                    }
                }
            }
        }
      }),
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-pipeline-movavg-aggregation.html',
      description: 'Given an ordered series of data, the Moving Average aggregation will slide a window across the data and emit the average value of that window.'
    },
    moving_function: {
      example: stringifyPretty({
        "size": 0,
        "aggs": {
            "my_date_histo":{
                "date_histogram":{
                    "field":"date",
                    "interval":"1M"
                },
                "aggs":{
                    "the_sum":{
                        "sum":{ "field": "price" }
                    },
                    "the_movfn": {
                        "moving_fn": {
                            "buckets_path": "the_sum",
                            "window": 10,
                            "script": "MovingFunctions.unweightedAvg(values)"
                        }
                    }
                }
            }
        }
      }),
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-pipeline-movfn-aggregation.html',
      description: 'Given an ordered series of data, the Moving Function aggregation will slide a window across the data and allow the user to specify a custom script that is executed on each window of data.'
    },
    cumulative_sum: {
      example: stringifyPretty({
        "size": 0,
        "aggs" : {
            "sales_per_month" : {
                "date_histogram" : {
                    "field" : "date",
                    "interval" : "month"
                },
                "aggs": {
                    "sales": {
                        "sum": {
                            "field": "price"
                        }
                    },
                    "cumulative_sales": {
                        "cumulative_sum": {
                            "buckets_path": "sales"
                        }
                    }
                }
            }
        }
      }),
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-pipeline-cumulative-sum-aggregation.html',
      description: 'A parent pipeline aggregation which calculates the cumulative sum of a specified metric in a parent histogram (or date_histogram) aggregation.'
    },
    bucket_script: {
      example: stringifyPretty({
        "size": 0,
        "aggs" : {
            "sales_per_month" : {
                "date_histogram" : {
                    "field" : "date",
                    "interval" : "month"
                },
                "aggs": {
                    "total_sales": {
                        "sum": {
                            "field": "price"
                        }
                    },
                    "t-shirts": {
                      "filter": {
                        "term": {
                          "type": "t-shirt"
                        }
                      },
                      "aggs": {
                        "sales": {
                          "sum": {
                            "field": "price"
                          }
                        }
                      }
                    },
                    "t-shirt-percentage": {
                        "bucket_script": {
                            "buckets_path": {
                              "tShirtSales": "t-shirts>sales",
                              "totalSales": "total_sales"
                            },
                            "script": "params.tShirtSales / params.totalSales * 100"
                        }
                    }
                }
            }
        }
      }),
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-pipeline-bucket-script-aggregation.html',
      description: 'A parent pipeline aggregation which executes a script which can perform per bucket computations on specified metrics in the parent multi-bucket aggregation.'
    },
    bucket_selector: {
      example: stringifyPretty({
        "size": 0,
        "aggs" : {
            "sales_per_month" : {
                "date_histogram" : {
                    "field" : "date",
                    "interval" : "month"
                },
                "aggs": {
                    "total_sales": {
                        "sum": {
                            "field": "price"
                        }
                    },
                    "sales_bucket_filter": {
                        "bucket_selector": {
                            "buckets_path": {
                              "totalSales": "total_sales"
                            },
                            "script": "params.totalSales > 200"
                        }
                    }
                }
            }
        }
      }),
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-pipeline-bucket-selector-aggregation.html',
      description: 'A parent pipeline aggregation which executes a script which determines whether the current bucket will be retained in the parent multi-bucket aggregation.'
    },
    bucket_sort: {
      example: stringifyPretty({
        "size": 0,
        "aggs" : {
            "sales_per_month" : {
                "date_histogram" : {
                    "field" : "date",
                    "interval" : "month"
                },
                "aggs": {
                    "total_sales": {
                        "sum": {
                            "field": "price"
                        }
                    },
                    "sales_bucket_sort": {
                        "bucket_sort": {
                            "sort": [
                              {"total_sales": {"order": "desc"}}
                            ],
                            "size": 3
                        }
                    }
                }
            }
        }
      }),
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-pipeline-bucket-sort-aggregation.html',
      description: 'A parent pipeline aggregation which sorts the buckets of its parent multi-bucket aggregation. Zero or more sort fields may be specified together with the corresponding sort order.'
    },
    serial_differencing: {
      example: stringifyPretty({
        "size": 0,
        "aggs": {
         "my_date_histo": {
            "date_histogram": {
               "field": "timestamp",
               "interval": "day"
            },
            "aggs": {
               "the_sum": {
                  "sum": {
                     "field": "lemmings"
                  }
               },
               "thirtieth_difference": {
                  "serial_diff": {
                     "buckets_path": "the_sum",
                     "lag" : 30
                  }
               }
            }
         }
        }
      }),
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-pipeline-serialdiff-aggregation.html',
      description: 'Serial differencing is a technique where values in a time series are subtracted from itself at different time lags or periods.'
    },
  },
  [QUERIES.MATRIX_AGGREGATIONS]: {
    matrix_stats: {
      example: stringifyPretty({
        "aggs": {
            "statistics": {
                "matrix_stats": {
                    "fields": ["poverty", "income"]
                }
            }
        }
      }),
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-matrix-stats-aggregation.html',
      description: 'The matrix_stats aggregation is a numeric aggregation that computes the following statistics over a set of document fields.'
    },
  },
  [QUERIES.CONDITIONS]: {
    script: {
      example: stringifyPretty({
        "type": "condition.script",
        "name": "newcondition",
        "source": "data.mysearch.aggregations.when.value > 2"
      }),
      link: `${DOC_LINKS.REPO}/tree/master/examples/watches`,
      description: 'The script condition triggers action after comparing with a value from payload.',
      type: 'condition'
    },
  },
};

export default templates;
