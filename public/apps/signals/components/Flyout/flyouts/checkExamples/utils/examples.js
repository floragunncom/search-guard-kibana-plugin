import { DOC_LINKS } from '../../../../../utils/constants';
import { CHECKS } from './constants';

const staticExamples = {
  [CHECKS.STATIC]: {
    constants: {
      example: {
        type: 'static',
        name: 'constants',
        target: 'constants',
        value: {
          threshold: 0
        }
      },
      link: DOC_LINKS.INPUTS.STATIC,
      type: 'static'
    }
  }
};

const conditionExamples = {
  [CHECKS.CONDITION]: {
    comparison: {
      example: {
        type: 'condition.script',
        name: 'greater_then_threshold',
        source: 'data.mysearch.hits.total.value > data.constants.threshold'
      },
      link: DOC_LINKS.CONDITIONS,
      type: 'condition'
    }
  }
};

const transformExamples = {
  [CHECKS.TRANSFORM]: {
    reduce_payload_to_one_value: {
      example: {
        type: 'transform',
        name: 'total_4_dials_time',
        source: `  long total_hits = data.mysearch.hits.total.value;
  long dials = 4;
  long total_4dials = 0;
  for (long i = 0; i < total_hits; i++) {
    total_4dials += i%dials;
  }
  return total_4dials;`
      },
      link: DOC_LINKS.TRANSFORMS,
      type: 'transform'
    },
  }
};

const calcExamples = {
  [CHECKS.CALC]: {
    calculate_new_field_value: {
      example: {
        type: 'calc',
        name: 'calc_mean_amount',
        source: 'data.mysearch.hits.total100 = data.mysearch.hits.total.value * 100'
      },
      link: DOC_LINKS.CALCS,
      type: 'calc'
    },
  }
};

const inputExamples = {
  [CHECKS.HTTP]: {
    call_external_service_with_basic_auth: {
      example: {
        type: 'http',
        request: {
          method: 'GET',
          url: 'https://localhost:9200/_cluster/stats',
          auth: {
            type: 'basic',
            username: 'admin',
            password: 'admin'
          }
        }
      },
      link: DOC_LINKS.INPUTS.HTTP,
      type: 'http'
    },
    call_external_service_with_params: {
      example: {
        type: 'http',
        request: {
          method: 'POST',
          url: 'https://webhook.site/a663a74a-592b-4efd-ad22-54a6da966e47',
          query_params: '{ "lat": "45.692783", "long": "9.673531" }'
        }
      },
      link: DOC_LINKS.INPUTS.HTTP,
      type: 'http'
    },
  },
  [CHECKS.FULL_TEXT]: {
    match: {
      example: {
        query: {
          match: {
            message: 'this is a test'
          }
        }
      },
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-match-query.html',
    },
    match_phrase: {
      example: {
        query: {
          match_phrase: {
            message: 'this is a test'
          }
        }
      },
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-match-query-phrase.html',
    },
    match_phrase_prefix: {
      example: {
        query: {
          match_phrase_prefix: {
            message: 'quick brown f'
          }
        }
      },
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-match-query-phrase-prefix.html',
    },
    multi_match: {
      example: {
        query: {
          multi_match: {
            query: 'this is a test',
            fields: [ 'subject', 'message' ]
          }
        }
      },
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-multi-match-query.html',
    },
    common_terms: {
      example: {
        query: {
          common: {
            body: {
              query: 'this is bonsai cool',
              cutoff_frequency: 0.001
            }
          }
        }
      },
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-common-terms-query.html',
    },
    query_string: {
      example: {
        query: {
          query_string: {
            default_field: 'content',
            query: 'this AND that OR thus'
          }
        }
      },
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-query-string-query.html',
    },
    simple_query_string: {
      example: {
        query: {
          simple_query_string: {
            query: '\fried eggs\ +(eggplant | potato) -frittata',
            fields: '[title^5, body]',
            default_operator: 'and'
          }
        }
      },
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-simple-query-string-query.html',
    },
    intervals: {
      example: {
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
      },
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-intervals-query.html',
    },
  },
  [CHECKS.TERM_LEVEL]: {
    term: {
      example: {
        'query': {
          'term': {
            'user': {
              'value': 'Kimchy',
              'boost': 1.0
            }
          }
        }
      },
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-term-query.html',
    },
    terms: {
      example: {
        'query': {
          'terms': {
            'user': ['kimchy', 'elasticsearch'],
            'boost': 1.0
          }
        }
      },
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-terms-query.html',
    },
    terms_set: {
      example: {
        'query': {
          'terms_set': {
            'codes': {
              'terms': ['abc', 'def', 'ghi'],
              'minimum_should_match_field': 'required_matches'
            }
          }
        }
      },
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-terms-set-query.html',
    },
    range: {
      example: {
        'query': {
          'range': {
            'age': {
              'gte': 10,
              'lte': 20,
              'boost': 2.0
            }
          }
        }
      },
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-range-query.html',
    },
    exists: {
      example: {
        'query': {
          'exists': {
            'field': 'user'
          }
        }
      },
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-exists-query.html',
    },
    prefix: {
      example: {
        'query': {
          'prefix': { 'user': 'ki' }
        }
      },
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-prefix-query.html',
    },
    wildcard: {
      example: {
        'query': {
          'wildcard': {
            'user': {
              'value': 'ki*y',
              'boost': 1.0,
              'rewrite': 'constant_score'
            }
          }
        }
      },
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-wildcard-query.html',
    },
    regexp: {
      example: {
        'query': {
          'regexp': {
            'name.first': 's.*y'
          }
        }
      },
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-regexp-query.html',
    },
    fuzzy: {
      example: {
        'query': {
          'fuzzy': { 'user': 'ki' }
        }
      },
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-fuzzy-query.html',
    },
    ids: {
      example: {
        'query': {
          'ids': {
            'values': ['1', '4', '100']
          }
        }
      },
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-ids-query.html',
    },
  },
  [CHECKS.COMPOUND]: {
    constant_score: {
      example: {
        'query': {
          'constant_score': {
            'filter': {
              'term': { 'user': 'kimchy' }
            },
            'boost': 1.2
          }
        }
      },
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-constant-score-query.html',
    },
    bool: {
      example: {
        'query': {
          'bool': {
            'must': {
              'term': { 'user': 'kimchy' }
            },
            'filter': {
              'term': { 'tag': 'tech' }
            },
            'must_not': {
              'range': {
                'age': { 'gte': 10, 'lte': 20 }
              }
            },
            'should': [
              { 'term': { 'tag': 'wow' } },
              { 'term': { 'tag': 'elasticsearch' } }
            ],
            'minimum_should_match': 1,
            'boost': 1.0
          }
        }
      },
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-bool-query.html',
    },
    dis_max: {
      example: {
        'query': {
          'dis_max': {
            'tie_breaker': 0.7,
            'boost': 1.2,
            'queries': [
              {
                'term': { 'age': 34 }
              },
              {
                'term': { 'age': 35 }
              }
            ]
          }
        }
      },
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-dis-max-query.html',
    },
    function_score: {
      example: {
        'query': {
          'function_score': {
            'query': { 'match_all': {} },
            'boost': '5',
            'random_score': {},
            'boost_mode': 'multiply'
          }
        }
      },
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-function-score-query.html',
    },
    boosting: {
      example: {
        'query': {
          'boosting': {
            'positive': {
              'term': {
                'field1': 'value1'
              }
            },
            'negative': {
              'term': {
                'field2': 'value2'
              }
            },
            'negative_boost': 0.2
          }
        }
      },
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-boosting-query.html',
    },
  },
  [CHECKS.JOIN]: {
    nested: {
      example: {
        'query': {
          'nested': {
            'path': 'obj1',
            'score_mode': 'avg',
            'query': {
              'bool': {
                'must': [
                  { 'match': { 'obj1.name': 'blue' } },
                  { 'range': { 'obj1.count': { 'gt': 5 } } }
                ]
              }
            }
          }
        }
      },
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-nested-query.html',
    },
    has_child: {
      example: {
        'query': {
          'has_child': {
            'type': 'blog_tag',
            'query': {
              'term': {
                'tag': 'something'
              }
            }
          }
        }
      },
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-has-child-query.html',
    },
    has_parent: {
      example: {
        'query': {
          'has_parent': {
            'parent_type': 'blog',
            'query': {
              'term': {
                'tag': 'something'
              }
            }
          }
        }
      },
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-has-parent-query.html',
    },
    parent_id: {
      example: {
        'query': {
          'parent_id': {
            'type': 'my_child',
            'id': '1'
          }
        }
      },
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-parent-id-query.html',
    },
  },
  [CHECKS.GEO_QUERIES]: {
    geoShape: {
      example: {
        'query': {
          'bool': {
            'must': {
              'match_all': {}
            },
            'filter': {
              'geo_shape': {
                'location': {
                  'shape': {
                    'type': 'envelope',
                    'coordinates': [[13.0, 53.0], [14.0, 52.0]]
                  },
                  'relation': 'within'
                }
              }
            }
          }
        }
      },
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-geo-shape-query.html',
    },
    geo_bounding: {
      example: {
        'query': {
          'bool': {
            'must': {
              'match_all': {}
            },
            'filter': {
              'geo_bounding_box': {
                'pin.location': {
                  'top_left': {
                    'lat': 40.73,
                    'lon': -74.1
                  },
                  'bottom_right': {
                    'lat': 40.01,
                    'lon': -71.12
                  }
                }
              }
            }
          }
        }
      },
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-geo-bounding-box-query.html',
    },
    geo_distance: {
      example: {
        'query': {
          'bool': {
            'must': {
              'match_all': {}
            },
            'filter': {
              'geo_distance': {
                'distance': '200km',
                'pin.location': {
                  'lat': 40,
                  'lon': -70
                }
              }
            }
          }
        }
      },
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-geo-distance-query.html',
    },
    geo_polygon: {
      example: {
        'query': {
          'bool': {
            'must': {
              'match_all': {}
            },
            'filter': {
              'geo_polygon': {
                'person.location': {
                  'points': [
                    { 'lat': 40, 'lon': -70 },
                    { 'lat': 30, 'lon': -80 },
                    { 'lat': 20, 'lon': -90 }
                  ]
                }
              }
            }
          }
        }
      },
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-geo-polygon-query.html',
    },
  },
  [CHECKS.SPECIALIZED]: {
    more_like_this: {
      example: {
        'query': {
          'more_like_this': {
            'fields': ['title', 'description'],
            'like': 'Once upon a time',
            'min_term_freq': 1,
            'max_query_terms': 12
          }
        }
      },
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-mlt-query.html',
    },
    script: {
      example: {
        'query': {
          'bool': {
            'filter': {
              'script': {
                'script': {
                  'source': 'doc[\'num1\'].value > 1',
                  'lang': 'painless'
                }
              }
            }
          }
        }
      },
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-script-query.html',
    },
    script_score: {
      example: {
        'query': {
          'script_score': {
            'query': {
              'match': { 'message': 'elasticsearch' }
            },
            'script': {
              'source': 'doc[\'likes\'].value / 10 '
            }
          }
        }
      },
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-script-score-query.html',
    },
    percolate: {
      example: {
        'query': {
          'percolate': {
            'field': 'query',
            'document': {
              'message': 'A new bonsai tree in the office'
            }
          }
        }
      },
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-percolate-query.html',
    },
    rank_feature: {
      example: {
        'query': {
          'bool': {
            'must': [
              {
                'match': {
                  'content': '2016'
                }
              }
            ],
            'should': [
              {
                'rank_feature': {
                  'field': 'pagerank'
                }
              },
              {
                'rank_feature': {
                  'field': 'url_length',
                  'boost': 0.1
                }
              },
              {
                'rank_feature': {
                  'field': 'topics.sports',
                  'boost': 0.4
                }
              }
            ]
          }
        }
      },
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-rank-feature-query.html',
    },
    wrapper: {
      example: {
        'query': {
          'wrapper': {
            'query': 'eyJ0ZXJtIiA6IHsgInVzZXIiIDogIktpbWNoeSIgfX0='
          }
        }
      },
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-wrapper-query.html',
    },
  },
  [CHECKS.SPAN]: {
    span_term: {
      example: {
        'query': {
          'span_term': { 'user': 'kimchy' }
        }
      },
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-span-term-query.html',
    },
    span_multi_term: {
      example: {
        'query': {
          'span_multi': {
            'match': {
              'prefix': { 'user': { 'value': 'ki' } }
            }
          }
        }
      },
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-span-multi-term-query.html',
    },
    span_first: {
      example: {
        'query': {
          'span_first': {
            'match': {
              'span_term': { 'user': 'kimchy' }
            },
            'end': 3
          }
        }
      },
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-span-first-query.html',
    },
    span_near: {
      example: {
        'query': {
          'span_near': {
            'clauses': [
              { 'span_term': { 'field': 'value1' } },
              { 'span_term': { 'field': 'value2' } },
              { 'span_term': { 'field': 'value3' } }
            ],
            'slop': 12,
            'in_order': false
          }
        }
      },
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-span-near-query.html',
    },
    span_or: {
      example: {
        'query': {
          'span_or': {
            'clauses': [
              { 'span_term': { 'field': 'value1' } },
              { 'span_term': { 'field': 'value2' } },
              { 'span_term': { 'field': 'value3' } }
            ]
          }
        }
      },
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-span-or-query.html',
    },
    span_not: {
      example: {
        'query': {
          'span_not': {
            'include': {
              'span_term': { 'field1': 'hoya' }
            },
            'exclude': {
              'span_near': {
                'clauses': [
                  { 'span_term': { 'field1': 'la' } },
                  { 'span_term': { 'field1': 'hoya' } }
                ],
                'slop': 0,
                'in_order': true
              }
            }
          }
        }
      },
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-span-not-query.html',
    },
    span_containing: {
      example: {
        'query': {
          'span_containing': {
            'little': {
              'span_term': { 'field1': 'foo' }
            },
            'big': {
              'span_near': {
                'clauses': [
                  { 'span_term': { 'field1': 'bar' } },
                  { 'span_term': { 'field1': 'baz' } }
                ],
                'slop': 5,
                'in_order': true
              }
            }
          }
        }
      },
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-span-containing-query.html',
    },
    span_within: {
      example: {
        'query': {
          'span_within': {
            'little': {
              'span_term': { 'field1': 'foo' }
            },
            'big': {
              'span_near': {
                'clauses': [
                  { 'span_term': { 'field1': 'bar' } },
                  { 'span_term': { 'field1': 'baz' } }
                ],
                'slop': 5,
                'in_order': true
              }
            }
          }
        }
      },
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-span-within-query.html',
    },
    span_field_masking: {
      example: {
        'query': {
          'span_near': {
            'clauses': [
              {
                'span_term': {
                  'text': 'quick brown'
                }
              },
              {
                'field_masking_span': {
                  'query': {
                    'span_term': {
                      'text.stems': 'fox'
                    }
                  },
                  'field': 'text'
                }
              }
            ],
            'slop': 5,
            'in_order': false
          }
        }
      },
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-span-field-masking-query.html',
    },
  },
  [CHECKS.METRICS_AGGREGATIONS]: {
    avg: {
      example: {
        'aggregations': {
          'avg_grade': { 'avg': { 'field': 'grade' } }
        }
      },
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-metrics-avg-aggregation.html#search-aggregations-metrics-avg-aggregation',
    },
    weighted_avg: {
      example: {
        'size': 0,
        'aggregations': {
          'weighted_grade': {
            'weighted_avg': {
              'value': {
                'field': 'grade'
              },
              'weight': {
                'field': 'weight'
              }
            }
          }
        }
      },
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-metrics-weight-avg-aggregation.html',
    },
    cardinality: {
      example: {
        'aggregations': {
          'type_count': {
            'cardinality': {
              'field': 'type'
            }
          }
        }
      },
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-metrics-cardinality-aggregation.html',
    },
    extended_stats: {
      example: {
        'size': 0,
        'aggregations': {
          'grades_stats': { 'extended_stats': { 'field': 'grade' } }
        }
      },
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-metrics-extendedstats-aggregation.html',
    },
    geo_bounds: {
      example: {
        'query': {
          'match': { 'name': 'musée' }
        },
        'aggregations': {
          'viewport': {
            'geo_bounds': {
              'field': 'location',
              'wrap_longitude': true
            }
          }
        }
      },
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-metrics-geobounds-aggregation.html',
    },
    geo_centroid: {
      example: {
        'aggregations': {
          'centroid': {
            'geo_centroid': {
              'field': 'location'
            }
          }
        }
      },
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-metrics-geocentroid-aggregation.html',
    },
    max: {
      example: {
        'aggregations': {
          'max_price': { 'max': { 'field': 'price' } }
        }
      },
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-metrics-max-aggregation.html',
    },
    min: {
      example: {
        'aggregations': {
          'min_price': { 'min': { 'field': 'price' } }
        }
      },
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-metrics-min-aggregation.html',
    },
    percentiles: {
      example: {
        'size': 0,
        'aggregations': {
          'load_time_outlier': {
            'percentiles': {
              'field': 'load_time'
            }
          }
        }
      },
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-metrics-percentile-aggregation.html',
    },
    percentile_ranks: {
      example: {
        'size': 0,
        'aggregations': {
          'load_time_ranks': {
            'percentile_ranks': {
              'field': 'load_time',
              'values': [500, 600]
            }
          }
        }
      },
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-metrics-percentile-rank-aggregation.html',
    },
    scripted_metric: {
      example: {
        'query': {
          'match_all': {}
        },
        'aggregations': {
          'profit': {
            'scripted_metric': {
              'init_script': 'state.transactions = []',
              'map_script': 'state.transactions.add(doc.type.value == \'sale\' ? doc.amount.value : -1 * doc.amount.value)',
              'combine_script': 'double profit = 0; for (t in state.transactions) { profit += t } return profit',
              'reduce_script': 'double profit = 0; for (a in states) { profit += a } return profit'
            }
          }
        }
      },
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-metrics-scripted-metric-aggregation.html',
    },
    stats: {
      example: {
        'aggregations': {
          'grades_stats': { 'stats': { 'field': 'grade' } }
        }
      },
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-metrics-stats-aggregation.html',
    },
    sum: {
      example: {
        'query': {
          'constant_score': {
            'filter': {
              'match': { 'type': 'hat' }
            }
          }
        },
        'aggregations': {
          'hat_prices': { 'sum': { 'field': 'price' } }
        }
      },
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-metrics-sum-aggregation.html',
    },
    top_hits: {
      example: {
        'aggregations': {
          'top_tags': {
            'terms': {
              'field': 'type',
              'size': 3
            },
            'aggregations': {
              'top_sales_hits': {
                'top_hits': {
                  'sort': [
                    {
                      'date': {
                        'order': 'desc'
                      }
                    }
                  ],
                  '_source': {
                    'includes': [ 'date', 'price' ]
                  },
                  'size': 1
                }
              }
            }
          }
        }
      },
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-metrics-top-hits-aggregation.html',
    },
    value_count: {
      example: {
        'aggregations': {
          'types_count': { 'value_count': { 'field': 'type' } }
        }
      },
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-metrics-valuecount-aggregation.html',
    },
    median_absolute_deviation: {
      example: {
        'size': 0,
        'aggregations': {
          'review_average': {
            'avg': {
              'field': 'rating'
            }
          },
          'review_variability': {
            'median_absolute_deviation': {
              'field': 'rating'
            }
          }
        }
      },
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-metrics-median-absolute-deviation-aggregation.html',
    },
  },
  [CHECKS.BUCKET_AGGREGATIONS]: {
    adjacency_matrix: {
      example: {
        'size': 0,
        'aggregations': {
          'interactions': {
            'adjacency_matrix': {
              'filters': {
                'grpA': { 'terms': { 'accounts': ['hillary', 'sidney'] } },
                'grpB': { 'terms': { 'accounts': ['donald', 'mitt'] } },
                'grpC': { 'terms': { 'accounts': ['vladimir', 'nigel'] } }
              }
            }
          }
        }
      },
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-bucket-adjacency-matrix-aggregation.html',
    },
    auto_interval_date_histogram: {
      example: {
        'aggregations': {
          'sales_over_time': {
            'auto_date_histogram': {
              'field': 'date',
              'buckets': 10
            }
          }
        }
      },
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-bucket-autodatehistogram-aggregation.html',
    },
    children: {
      example: {
        'aggregations': {
          'top-tags': {
            'terms': {
              'field': 'tags.keyword',
              'size': 10
            },
            'aggregations': {
              'to-answers': {
                'children': {
                  'type': 'answer'
                },
                'aggregations': {
                  'top-names': {
                    'terms': {
                      'field': 'owner.display_name.keyword',
                      'size': 10
                    }
                  }
                }
              }
            }
          }
        }
      },
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-bucket-children-aggregation.html',
    },
    composite: {
      example: {
        'aggregations': {
          'my_buckets': {
            'composite': {
              'sources': [
                { 'product': { 'terms': { 'field': 'product' } } }
              ]
            }
          }
        }
      },
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-bucket-composite-aggregation.html',
    },
    date_histogram: {
      example: {
        'aggregations': {
          'sales_over_time': {
            'date_histogram': {
              'field': 'date',
              'fixed_interval': 'month'
            }
          }
        }
      },
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-bucket-datehistogram-aggregation.html',
    },
    date_range: {
      example: {
        'aggregations': {
          'range': {
            'date_range': {
              'field': 'date',
              'format': 'MM-yyy',
              'ranges': [
                { 'to': 'now-10M/M' },
                { 'from': 'now-10M/M' }
              ]
            }
          }
        }
      },
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-bucket-daterange-aggregation.html',
    },
    diversified_sampler: {
      example: {
        'query': {
          'query_string': {
            'query': 'tags:elasticsearch'
          }
        },
        'aggregations': {
          'my_unbiased_sample': {
            'diversified_sampler': {
              'shard_size': 200,
              'field': 'author'
            },
            'aggregations': {
              'keywords': {
                'significant_terms': {
                  'field': 'tags',
                  'exclude': ['elasticsearch']
                }
              }
            }
          }
        }
      },
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-bucket-diversified-sampler-aggregation.html',
    },
    filter: {
      example: {
        'aggregations': {
          't_shirts': {
            'filter': { 'term': { 'type': 't-shirt' } },
            'aggregations': {
              'avg_price': { 'avg': { 'field': 'price' } }
            }
          }
        }
      },
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-bucket-filter-aggregation.html',
    },
    filters: {
      example: {
        'size': 0,
        'aggregations': {
          'messages': {
            'filters': {
              'filters': {
                'errors': { 'match': { 'body': 'error'   } },
                'warnings': { 'match': { 'body': 'warning' } }
              }
            }
          }
        }
      },
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-bucket-filters-aggregation.html',
    },
    geo_distance: {
      example: {
        'aggregations': {
          'rings_around_amsterdam': {
            'geo_distance': {
              'field': 'location',
              'origin': '52.3760, 4.894',
              'ranges': [
                { 'to': 100000 },
                { 'from': 100000, 'to': 300000 },
                { 'from': 300000 }
              ]
            }
          }
        }
      },
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-bucket-geodistance-aggregation.html',
    },
    geoHash_grid: {
      example: {
        'aggregations': {
          'large-grid': {
            'geohash_grid': {
              'field': 'location',
              'precision': 3
            }
          }
        }
      },
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-bucket-geohashgrid-aggregation.html',
    },
    geoTile_grid: {
      example: {
        'aggregations': {
          'large-grid': {
            'geotile_grid': {
              'field': 'location',
              'precision': 8
            }
          }
        }
      },
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-bucket-geotilegrid-aggregation.html',
    },
    global: {
      example: {
        'query': {
          'match': { 'type': 't-shirt' }
        },
        'aggregations': {
          'all_products': {
            'global': {},
            'aggregations': {
              'avg_price': { 'avg': { 'field': 'price' } }
            }
          },
          't_shirts': { 'avg': { 'field': 'price' } }
        }
      },
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-bucket-global-aggregation.html',
    },
    histogram: {
      example: {
        'aggregations': {
          'prices': {
            'histogram': {
              'field': 'price',
              'interval': 50
            }
          }
        }
      },
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-bucket-histogram-aggregation.html',
    },
    ip_range: {
      example: {
        'size': 10,
        'aggregations': {
          'ip_ranges': {
            'ip_range': {
              'field': 'ip',
              'ranges': [
                { 'to': '10.0.0.5' },
                { 'from': '10.0.0.5' }
              ]
            }
          }
        }
      },
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-bucket-iprange-aggregation.html',
    },
    missing: {
      example: {
        'aggregations': {
          'products_without_a_price': {
            'missing': { 'field': 'price' }
          }
        }
      },
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-bucket-missing-aggregation.html',
    },
    nested: {
      example: {
        'query': {
          'match': { 'name': 'led tv' }
        },
        'aggregations': {
          'resellers': {
            'nested': {
              'path': 'resellers'
            },
            'aggregations': {
              'min_price': { 'min': { 'field': 'resellers.price' } }
            }
          }
        }
      },
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-bucket-nested-aggregation.html',
    },
    parent: {
      example: {
        'aggregations': {
          'top-names': {
            'terms': {
              'field': 'owner.display_name.keyword',
              'size': 10
            },
            'aggregations': {
              'to-questions': {
                'parent': {
                  'type': 'answer'
                },
                'aggregations': {
                  'top-tags': {
                    'terms': {
                      'field': 'tags.keyword',
                      'size': 10
                    }
                  }
                }
              }
            }
          }
        }
      },
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-bucket-parent-aggregation.html',
    },
    range: {
      example: {
        'aggregations': {
          'price_ranges': {
            'range': {
              'field': 'price',
              'ranges': [
                { 'to': 100.0 },
                { 'from': 100.0, 'to': 200.0 },
                { 'from': 200.0 }
              ]
            }
          }
        }
      },
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-bucket-range-aggregation.html',
    },
    reverse_nested: {
      example: {
        'query': {
          'match_all': {}
        },
        'aggregations': {
          'comments': {
            'nested': {
              'path': 'comments'
            },
            'aggregations': {
              'top_usernames': {
                'terms': {
                  'field': 'comments.username'
                },
                'aggregations': {
                  'comment_to_issue': {
                    'reverse_nested': {},
                    'aggregations': {
                      'top_tags_per_comment': {
                        'terms': {
                          'field': 'tags'
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-bucket-reverse-nested-aggregation.html',
    },
    sampler: {
      example: {
        'query': {
          'query_string': {
            'query': 'tags:kibana OR tags:javascript'
          }
        },
        'aggregations': {
          'sample': {
            'sampler': {
              'shard_size': 200
            },
            'aggregations': {
              'keywords': {
                'significant_terms': {
                  'field': 'tags',
                  'exclude': ['kibana', 'javascript']
                }
              }
            }
          }
        }
      },
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-bucket-sampler-aggregation.html',
    },
    significant_terms: {
      example: {
        'query': {
          'terms': { 'force': [ 'British Transport Police' ] }
        },
        'aggregations': {
          'significant_crime_types': {
            'significant_terms': { 'field': 'crime_type' }
          }
        }
      },
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-bucket-significantterms-aggregation.html',
    },
    significant_text: {
      example: {
        'query': {
          'match': { 'content': 'Bird flu' }
        },
        'aggregations': {
          'my_sample': {
            'sampler': {
              'shard_size': 100
            },
            'aggregations': {
              'keywords': {
                'significant_text': { 'field': 'content' }
              }
            }
          }
        }
      },
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-bucket-significanttext-aggregation.html',
    },
    terms: {
      example: {
        'aggregations': {
          'genres': {
            'terms': { 'field': 'genre' }
          }
        }
      },
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-bucket-terms-aggregation.html',
    },
  },
  [CHECKS.PIPELINE_AGGREGATIONS]: {
    avg_bucket: {
      example: {
        'size': 0,
        'aggregations': {
          'sales_per_month': {
            'date_histogram': {
              'field': 'date',
              'fixed_interval': 'month'
            },
            'aggregations': {
              'sales': {
                'sum': {
                  'field': 'price'
                }
              }
            }
          },
          'avg_monthly_sales': {
            'avg_bucket': {
              'buckets_path': 'sales_per_month>sales'
            }
          }
        }
      },
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-pipeline-avg-bucket-aggregation.html',
    },
    derivative: {
      example: {
        'size': 0,
        'aggregations': {
          'sales_per_month': {
            'date_histogram': {
              'field': 'date',
              'fixed_interval': 'month'
            },
            'aggregations': {
              'sales': {
                'sum': {
                  'field': 'price'
                }
              },
              'sales_deriv': {
                'derivative': {
                  'buckets_path': 'sales'
                }
              }
            }
          }
        }
      },
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-pipeline-derivative-aggregation.html',
    },
    max_bucket: {
      example: {
        'size': 0,
        'aggregations': {
          'sales_per_month': {
            'date_histogram': {
              'field': 'date',
              'fixed_interval': 'month'
            },
            'aggregations': {
              'sales': {
                'sum': {
                  'field': 'price'
                }
              }
            }
          },
          'max_monthly_sales': {
            'max_bucket': {
              'buckets_path': 'sales_per_month>sales'
            }
          }
        }
      },
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-pipeline-max-bucket-aggregation.html',
    },
    min_bucket: {
      example: {
        'size': 0,
        'aggregations': {
          'sales_per_month': {
            'date_histogram': {
              'field': 'date',
              'fixed_interval': 'month'
            },
            'aggregations': {
              'sales': {
                'sum': {
                  'field': 'price'
                }
              }
            }
          },
          'min_monthly_sales': {
            'min_bucket': {
              'buckets_path': 'sales_per_month>sales'
            }
          }
        }
      },
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-pipeline-min-bucket-aggregation.html',
    },
    sum_bucket: {
      example: {
        'size': 0,
        'aggregations': {
          'sales_per_month': {
            'date_histogram': {
              'field': 'date',
              'fixed_interval': 'month'
            },
            'aggregations': {
              'sales': {
                'sum': {
                  'field': 'price'
                }
              }
            }
          },
          'sum_monthly_sales': {
            'sum_bucket': {
              'buckets_path': 'sales_per_month>sales'
            }
          }
        }
      },
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-pipeline-sum-bucket-aggregation.html',
    },
    stats_bucket: {
      example: {
        'size': 0,
        'aggregations': {
          'sales_per_month': {
            'date_histogram': {
              'field': 'date',
              'fixed_interval': 'month'
            },
            'aggregations': {
              'sales': {
                'sum': {
                  'field': 'price'
                }
              }
            }
          },
          'stats_monthly_sales': {
            'stats_bucket': {
              'buckets_path': 'sales_per_month>sales'
            }
          }
        }
      },
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-pipeline-stats-bucket-aggregation.html',
    },
    extended_stats_bucket: {
      example: {
        'size': 0,
        'aggregations': {
          'sales_per_month': {
            'date_histogram': {
              'field': 'date',
              'fixed_interval': 'month'
            },
            'aggregations': {
              'sales': {
                'sum': {
                  'field': 'price'
                }
              }
            }
          },
          'stats_monthly_sales': {
            'extended_stats_bucket': {
              'buckets_path': 'sales_per_month>sales'
            }
          }
        }
      },
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-pipeline-extended-stats-bucket-aggregation.html',
    },
    percentiles_bucket: {
      example: {
        'size': 0,
        'aggregations': {
          'sales_per_month': {
            'date_histogram': {
              'field': 'date',
              'fixed_interval': 'month'
            },
            'aggregations': {
              'sales': {
                'sum': {
                  'field': 'price'
                }
              }
            }
          },
          'percentiles_monthly_sales': {
            'percentiles_bucket': {
              'buckets_path': 'sales_per_month>sales',
              'percents': [ 25.0, 50.0, 75.0 ]
            }
          }
        }
      },
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-pipeline-percentiles-bucket-aggregation.html',
    },
    moving_average: {
      example: {
        'size': 0,
        'aggregations': {
          'my_date_histo': {
            'date_histogram': {
              'field': 'date',
              'fixed_interval': '1M'
            },
            'aggregations': {
              'the_sum': {
                'sum': { 'field': 'price' }
              },
              'the_movavg': {
                'moving_avg': { 'buckets_path': 'the_sum' }
              }
            }
          }
        }
      },
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-pipeline-movavg-aggregation.html',
    },
    moving_function: {
      example: {
        'size': 0,
        'aggregations': {
          'my_date_histo': {
            'date_histogram': {
              'field': 'date',
              'fixed_interval': '1M'
            },
            'aggregations': {
              'the_sum': {
                'sum': { 'field': 'price' }
              },
              'the_movfn': {
                'moving_fn': {
                  'buckets_path': 'the_sum',
                  'window': 10,
                  'script': 'MovingFunctions.unweightedAvg(values)'
                }
              }
            }
          }
        }
      },
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-pipeline-movfn-aggregation.html',
    },
    cumulative_sum: {
      example: {
        'size': 0,
        'aggregations': {
          'sales_per_month': {
            'date_histogram': {
              'field': 'date',
              'fixed_interval': 'month'
            },
            'aggregations': {
              'sales': {
                'sum': {
                  'field': 'price'
                }
              },
              'cumulative_sales': {
                'cumulative_sum': {
                  'buckets_path': 'sales'
                }
              }
            }
          }
        }
      },
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-pipeline-cumulative-sum-aggregation.html',
    },
    bucket_script: {
      example: {
        'size': 0,
        'aggregations': {
          'sales_per_month': {
            'date_histogram': {
              'field': 'date',
              'fixed_interval': 'month'
            },
            'aggregations': {
              'total_sales': {
                'sum': {
                  'field': 'price'
                }
              },
              't-shirts': {
                'filter': {
                  'term': {
                    'type': 't-shirt'
                  }
                },
                'aggregations': {
                  'sales': {
                    'sum': {
                      'field': 'price'
                    }
                  }
                }
              },
              't-shirt-percentage': {
                'bucket_script': {
                  'buckets_path': {
                    'tShirtSales': 't-shirts>sales',
                    'totalSales': 'total_sales'
                  },
                  'script': 'params.tShirtSales / params.totalSales * 100'
                }
              }
            }
          }
        }
      },
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-pipeline-bucket-script-aggregation.html',
    },
    bucket_selector: {
      example: {
        'size': 0,
        'aggregations': {
          'sales_per_month': {
            'date_histogram': {
              'field': 'date',
              'fixed_interval': 'month'
            },
            'aggregations': {
              'total_sales': {
                'sum': {
                  'field': 'price'
                }
              },
              'sales_bucket_filter': {
                'bucket_selector': {
                  'buckets_path': {
                    'totalSales': 'total_sales'
                  },
                  'script': 'params.totalSales > 200'
                }
              }
            }
          }
        }
      },
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-pipeline-bucket-selector-aggregation.html',
    },
    bucket_sort: {
      example: {
        'size': 0,
        'aggregations': {
          'sales_per_month': {
            'date_histogram': {
              'field': 'date',
              'fixed_interval': 'month'
            },
            'aggregations': {
              'total_sales': {
                'sum': {
                  'field': 'price'
                }
              },
              'sales_bucket_sort': {
                'bucket_sort': {
                  'sort': [
                    { 'total_sales': { 'order': 'desc' } }
                  ],
                  'size': 3
                }
              }
            }
          }
        }
      },
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-pipeline-bucket-sort-aggregation.html',
    },
    serial_differencing: {
      example: {
        'size': 0,
        'aggregations': {
          'my_date_histo': {
            'date_histogram': {
              'field': 'timestamp',
              'fixed_interval': 'day'
            },
            'aggregations': {
              'the_sum': {
                'sum': {
                  'field': 'lemmings'
                }
              },
              'thirtieth_difference': {
                'serial_diff': {
                  'buckets_path': 'the_sum',
                  'lag': 30
                }
              }
            }
          }
        }
      },
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-pipeline-serialdiff-aggregation.html',
    },
  },
  [CHECKS.MATRIX_AGGREGATIONS]: {
    matrix_stats: {
      example: {
        'aggregations': {
          'statistics': {
            'matrix_stats': {
              'fields': ['poverty', 'income']
            }
          }
        }
      },
      link: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-matrix-stats-aggregation.html',
    },
  },
};

export default {
  staticExamples,
  inputExamples,
  conditionExamples,
  transformExamples,
  calcExamples
};
