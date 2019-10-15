// TODO: make autocompletion context-aware
const attributeMap = {
  'check.static': {
    meta: 'Static object',
    snippet: `{
  "type": "static",
  "name": "constants",
  "target": "constants",
  "value": {
    "n": 1
  }
}`
  },
  'check.search': {
    meta: 'Search request',
    snippet: `{
  "type": "search",
  "name": "mysearch",
  "target": "mysearch",
  "request": {
    "indices": [],
    "body": {
      "from": 0,
      "size": 10,
      "query": {
        "match_all": {}
      }
    }
  }
}`
  },
  'check.condition': {
    meta: 'Condition to check on',
    snippet: `{
  "type": "condition.script",
  "name": "mycondition",
  "source": "data.mysearch.hits.hits.length > 0"
}`
  },
  'check.transform': {
    meta: 'Transform (reduce) paylod',
    snippet: `{
  "type": "transform",
  "name": "mytransfrom",
  "source": "return [ total_hits: data.mysearch.hits.hits.length ]"
}`
  },
  'query.bool': {
    meta: 'Compound query clauses',
    snippet: `"bool": {
  "must": {
    "term": { "user": "kimchy" }
  },
  "filter": {
    "term": { "tag": "tech" }
  },
  "must_not": {
    "range": {
      "age": { "gte": 10, "lte": 20 }
    }
  },
  "should": [
    { "term": { "tag": "wow" } },
    { "term": { "tag": "elasticsearch" } }
  ],
  "minimum_should_match": 1,
  "boost": 1.0
}`
  },
  'query.boosting': {
    meta: 'Demote documents',
    snippet: `"boosting": {
  "positive": {
    "term": {
      "text": "apple"
    }
  },
  "negative": {
    "term": {
      "text": "pie tart fruit crumble tree"
    }
  },
  "negative_boost": 0.5
}`
  },
  'query.constant_score': {
    meta: 'Doc rel score eq boost',
    snippet: `"constant_score": {
  "filter": {
    "term": { "user": "kimchy"}
  },
  "boost": 1.2
}`
  },
  'query.dis_max': {
    meta: 'Promote rel score',
    snippet: `"dis_max": {
  "queries": [
    { "term": { "title": "Quick pets" }},
    { "term": { "body": "Quick pets" }}
  ],
  "tie_breaker": 0.7
}`
  },
  'query.function_score': {
    meta: 'Modify doc score',
    snippet: `"function_score": {
  "query": { "match_all": {} },
  "boost": "5", 
  "functions": [
    {
      "filter": { "match": { "test": "bar" } },
      "random_score": {}, 
      "weight": 23
    },
    {
      "filter": { "match": { "test": "cat" } },
      "weight": 42
    }
  ],
  "max_boost": 42,
  "score_mode": "max",
  "boost_mode": "multiply",
  "min_score" : 42
}`
  },
  'query.intervals': {
    meta: 'Proximity of terms',
    snippet: `"intervals": {
  "my_text": {
    "match": {
      "query": "hot porridge",
      "max_gaps": 10,
      "filter": {
        "not_containing": {
          "match": {
            "query": "salty"
          }
        }
      }
    }
  }
}`
  },
  'query.match': {
    meta: 'Match a text',
    snippet: `"match": {
  "message": {
    "query": "this is a test"
  }
}`
  },
  'query.match_bool_prefix': {
    meta: 'Dynamic bool query',
    snippet: `"match_bool_prefix": {
  "message": "quick brown f"
}`
  },
  'query.match_phrase': {
    meta: 'Match phrase',
    snippet: `"match_phrase": {
  "message": "this is a test"
}`
  },
  'query.match_phrase_prefix': {
    meta: 'Match phrase prefix',
    snippet: `"match_phrase_prefix": {
  "message": {
    "query": "quick brown f"
  }
}`
  },
  'query.multi_match': {
    meta: 'Multi-field query',
    snippet: `"multi_match": {
  "query": "this is a test", 
  "fields": [ "subject", "message" ] 
}`
  },
  'query.common': {
    meta: 'Uncommon words',
    snippet: `"common": {
  "body": {
    "query": "this is bonsai cool",
    "cutoff_frequency": 0.001
  }
}`
  },
  'query.query_string': {
    meta: 'Lucene query string',
    snippet: `"query_string": {
  "query": "(new york city) OR (big apple)",
  "default_field": "content"
}`
  },
  'query.simple_query_string': {
    meta: 'Simple query string',
    snippet: `"simple_query_string": {
  "query": "\"fried eggs\" +(eggplant | potato) -frittata",
  "fields": ["title^5", "body"],
  "default_operator": "and"
}`
  },
  query: {
    meta: 'Query DSL',
    snippet: `"query": {}`
  },
  must: {
    meta: 'Must',
    snippet: `"must": {
  "term": { "user": "kimchy" }
}`
  },
  filter: {
    meta: 'Must be with no score',
    snippet: `"filter": {
  "term": { "tag": "tech" }
}`
  },
  should: {
    meta: 'Should appear',
    snippet: `"should": [
  { "term": { "tag": "wow" } },
  { "term": { "tag": "elasticsearch" } }
]`
  },
  must_not: {
    meta: 'Must not',
    snippet: `"must_not": {
  "range": {
    "age": { "gte": 10, "lte": 20 }
  }
}`
  },
  'query.geo_bounding_box': {
    meta: 'Geo bounding box',
    snippet: `"geo_bounding_box": {
  "pin.location": {
    "top_left": {
      "lat": 40.73,
      "lon": -74.1
    },
    "bottom_right": {
      "lat": 40.01,
      "lon": -71.12
    }
  }
}`
  },
  'query.geo_distance': {
    meta: 'Geo distance',
    snippet: `"geo_distance": {
  "distance": "200km",
  "pin.location": {
    "lat": 40,
    "lon": -70
  }
}`
  },
  'query.geo_polygon': {
    meta: 'Geo polygon',
    snippet: `"geo_polygon": {
  "person.location": {
    "points": [
      {"lat": 40, "lon": -70},
      {"lat": 30, "lon": -80},
      {"lat": 20, "lon": -90}
    ]
  }
}`
  },
  'query.geo_shape': {
    meta: 'Geo shape',
    snippet: `"geo_shape": {
  "location": {
    "shape": {
      "type": "envelope",
      "coordinates": [[13.0, 53.0], [14.0, 52.0]]
    },
    "relation": "within"
  }
}`
  },
  'query.shape': {
    meta: 'Shape',
    snippet: `"shape": {
  "geometry": {
    "shape": {
      "type": "envelope",
      "coordinates" : [[1355.0, 5355.0], [1400.0, 5200.0]]
    },
    "relation": "within"
  }
}`
  },
  'query.nested': {
    meta: 'Search nested fields',
    snippet: `"nested": {
  "path": "obj1",
  "query": {
    "bool": {
      "must": [
        { "match": { "obj1.name": "blue" } },
        { "range": { "obj1.count": { "gt": 5 } } }
      ]
    }
  },
  "score_mode": "avg"
}`
  },
  'query.has_child': {
    meta: 'Search joined child docs',
    snippet: `"has_child": {
  "type": "child",
  "query": {
    "match_all": {}
  },
  "max_children": 10,
  "min_children": 2,
  "score_mode": "min"
}`
  },
  'query.has_parent': {
    meta: 'Search joined parent docs',
    snippet: `"has_parent": {
  "parent_type": "parent",
  "query": {
    "term": {
      "tag": {
        "value": "Elasticsearch"
      }
    }
  }
}`
  },
  'query.parent_id': {
    meta: 'Search parent doc by id',
    snippet: `"parent_id": {
  "type": "my-child",
  "id": "1"
}`
  },
  'query.match_all': {
    meta: 'Match all',
    snippet: '"match_all": {}'
  },
  'query.match_none': {
    meta: 'Match none doc',
    snippet: '"match_none": {}'
  },
  'query.span_containing': {
    meta: 'Enclose another span query',
    snippet: `"span_containing": {
  "little": {
    "span_term": { "field1": "foo" }
  },
  "big": {
    "span_near": {
      "clauses": [
        { "span_term": { "field1": "bar" } },
        { "span_term": { "field1": "baz" } }
      ],
      "slop": 5,
      "in_order": true
    }
  }
}`
  },
  'query.field_masking_span': {
    meta: 'Field masking',
    snippet: `"field_masking_span": {
  "query": {
    "span_term": {
      "text.stems": "fox"
    }
  },
  "field": "text"
}`
  },
  'query.span_first': {
    meta: 'Lucene SpanFirstQuery',
    snippet: `"span_first": {
  "match": {
    "span_term": { "user": "kimchy" }
  },
  "end": 3
}`
  },
  'query.span_multi': {
    meta: 'Wrap multi term query',
    snippet: `"span_multi": {
  "match": {
    "prefix": { "user": { "value": "ki", "boost": 1.08 } }
  }
}`
  },
  'query.span_near': {
    meta: 'Matches spans which are near',
    snippet: `"span_near": {
  "clauses": [
    { "span_term": { "field": "value1" } },
    { "span_term": { "field": "value2" } },
    { "span_term": { "field": "value3" } }
  ],
  "slop": 12,
  "in_order": false
}`
  },
  'query.span_not': {
    meta: 'Removes matches which overlap',
    snippet: `"span_not": {
  "include": {
    "span_term": { "field1": "hoya" }
  },
  "exclude": {
    "span_near": {
      "clauses": [
        { "span_term": { "field1": "la" } },
        { "span_term": { "field1": "hoya" } }
      ],
      "slop": 0,
      "in_order": true
    }
  }
}`
  },
  'query.span_or': {
    meta: 'Matches the union of clauses',
    snippet: `"span_or": {
  "clauses": [
    { "span_term": { "field": "value1" } },
    { "span_term": { "field": "value2" } },
    { "span_term": { "field": "value3" } }
  ]
}`
  },
  'query.span_term': {
    meta: 'Matches spans containing a term',
    snippet: '"span_term" : { "user" : { "term" : "kimchy", "boost" : 2.0 } }'
  },
  'query.span_within': {
    meta: 'Matches enclosed inside another query',
    snippet: `"span_within": {
  "little": {
    "span_term": { "field1": "foo" }
  },
  "big": {
    "span_near": {
      "clauses": [
        { "span_term": { "field1": "bar" } },
        { "span_term": { "field1": "baz" } }
      ],
      "slop": 5,
      "in_order": true
    }
  }
}`
  },
  'query.distance_feature': {
    meta: 'Boost score of the docs close to origin',
    snippet: `"distance_feature": {
  "field": "location",
  "pivot": "1000m",
  "origin": [-71.3, 41.15]
}`
  },
  'query.more_like_this': {
    meta: 'Find docs that are "like"',
    snippet: `"more_like_this": {
  "fields": ["title", "description"],
  "like": "Once upon a time",
  "min_term_freq": 1,
  "max_query_terms": 12
}`
  },
  'query.percolate': {
    meta: 'Percolate',
    snippet: `"percolate": {
  "field": "query",
  "document": {
    "message": "A new bonsai tree in the office"
  }
}`
  },
  'query.rank_feature': {
    meta: 'Boost score based on field',
    snippet: `"rank_feature": {
  "field": "pagerank",
  "saturation": {
    "pivot": 8
  }
}`
  },
  'query.script': {
    meta: 'FIlter docs',
    snippet: `"script": {
  "script": {
    "source": "doc['num1'].value > 1",
    "lang": "painless"
  }
}`
  },
  'query.script_score': {
    meta: 'Provide custom score',
    snippet: `"script_score": {
  "query": {
    "match": { "message": "elasticsearch" }
  },
  "script": {
    "source": "doc['likes'].value / 10 "
  }
}`
  },
  'query.wrapper': {
    meta: 'Query as base64',
    snippet: `"wrapper": {
  "query": "eyJ0ZXJtIiA6IHsgInVzZXIiIDogIktpbWNoeSIgfX0=" 
}`
  },
  'query.pinned': {
    meta: 'Docs to rank higher',
    snippet: `"pinned": {
  "ids": ["1", "4", "100"],
  "organic": {
    "match": {
      "description": "iphone"
    }
  }
}`
  },
  'query.exists': {
    meta: 'Docs that have the field',
    snippet: `"exists": {
  "field": "user"
}`
  },
  'query.fuzzy': {
    meta: 'Similar terms',
    snippet: `"fuzzy": {
  "user": {
    "value": "ki",
    "fuzziness": "AUTO",
    "max_expansions": 50,
    "prefix_length": 0,
    "transpositions": true,
    "rewrite": "constant_score"
  }
}`
  },
  'query.ids': {
    meta: 'Search for ids',
    snippet: `"ids": {
  "values": ["1", "4", "100"]
}`
  },
  'query.prefix': {
    meta: 'Specific prefix in a provided field',
    snippet: `"prefix": {
  "user": {
    "value": "ki"
  }
}`
  },
  'query.range': {
    meta: 'Terms within a provided range',
    snippet: `"range": {
  "age": {
    "gte": 10,
    "lte": 20,
    "boost": 2.0
  }
}`
  },
  'query.regexp': {
    meta: 'Match regular exp',
    snippet: `"regexp": {
  "user": {
    "value": "k.*y",
    "flags": "ALL",
    "max_determinized_states": 10000,
    "rewrite": "constant_score"
  }
}`
  },
  'query.term': {
    meta: 'Exact term in field',
    snippet: `"term": {
  "user": {
    "value": "Kimchy",
    "boost": 1.0
  }
}`
  },
  'query.terms': {
    meta: 'Exact terms in field',
    snippet: `"terms": {
  "user": ["kimchy", "elasticsearch"],
  "boost": 1.0
}`
  },
  'query.terms_set': {
    meta: 'Min number of exact terms',
    snippet: `"terms_set": {
  "programming_languages": {
    "terms": ["c++", "java", "php"],
    "minimum_should_match_field": "required_matches"
  }
}`
  },
  'query.wildcard': {
    meta: 'Match wildcard pattern',
    snippet: `"wildcard": {
  "user": {
    "value": "ki*y",
    "boost": 1.0,
    "rewrite": "constant_score"
  }
}`
  },
  sort: {
    meta: '',
    snippet: `"sort": [
    { "name": "desc" }
]`
  },
  aggs: {
    meta: 'Aggregations',
    snippet: '"aggs": {}'
  },
  'aggs.avg_grade': {
    meta: 'Avg agg',
    snippet: '"avg_grade" : { "avg" : { "field" : "grade" } }'
  },
  'aggs.weighted_avg': {
    meta: 'Weighted avg agg',
    snippet: `"weighted_grade": {
  "weighted_avg": {
    "value": {
      "field": "grade"
    },
    "weight": {
      "field": "weight"
    }
  }
}`
  },
  'aggs.cardinality': {
    meta: 'Cardinality agg',
    snippet: `"type_count": {
  "cardinality": {
    "field": "type"
  }
}`
  },
  'aggs.extended_stats': {
    meta: 'Extended stats agg',
    snippet: `"grades_stats": { "extended_stats": { "field": "grade" } }`
  },
  'aggs.bounds': {
    meta: 'Bounds agg',
    snippet: `"viewport": {
  "geo_bounds": {
    "field": "location", 
    "wrap_longitude": true 
  }
}`
  },
  'aggs.centroid': {
    meta: 'Centroid agg',
    snippet: `"cities": {
  "terms": { "field": "city.keyword" },
  "aggs": {
    "centroid": {
      "geo_centroid": { "field": "location" }
    }
  }
}`
  },
  'aggs.max': {
    meta: 'Max agg',
    snippet: '"max_price" : { "max" : { "field" : "price" } }'
  },
  'aggs.min': {
    meta: 'Min agg',
    snippet: '"min_price" : { "min" : { "field" : "price" } }'
  },
  'aggs.percentiles': {
    meta: 'Percentiles agg',
    snippet: `"load_time_outlier": {
  "percentiles": {
    "field": "load_time",
    "percents": [95, 99, 99.9] 
  }
}`
  },
  'aggs.percentile_ranks': {
    meta: 'Percentile ranks agg',
    snippet: `"load_time_ranks": {
  "percentile_ranks": {
    "field": "load_time",
    "values": [500, 600],
    "missing": 10 
  }
}`
  },
  'aggs.scripted_metric': {
    meta: 'Scripted metric agg',
    snippet: `"profit": {
  "scripted_metric": {
    "init_script": "state.transactions = []", 
    "map_script": "state.transactions.add(doc.type.value == 'sale' ? doc.amount.value: -1 * doc.amount.value)",
    "combine_script": "double profit = 0; for (t in state.transactions) { profit += t } return profit",
    "reduce_script": "double profit = 0; for (a in states) { profit += a } return profit"
  }
}`
  },
  'aggs.stats': {
    meta: 'Stats agg',
    snippet: '"grades_stats" : { "stats" : { "field" : "grade" } }'
  },  
  'aggs.sum': {
    meta: 'Sum agg',
    snippet: '"hat_prices" : { "sum" : { "field" : "price" } }'
  },
  'aggs.top_hits': {
    meta: 'Top hits agg',
    snippet: `"top_sales_hits": {
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
    "size": 1
  }
}`
  },
  'aggs.value_count': {
    meta: 'Count agg',
    snippet: '"types_count" : { "value_count" : { "field" : "type" } }'
  },
  'aggs.median_absolute_deviation': {
    meta: 'Med absolute deviation agg',
    snippet: `"review_average": {
  "avg": {
    "field": "rating"
  }
},
"review_variability": {
  "median_absolute_deviation": {
    "field": "rating" 
  }
}`
  },
  'aggs.adjacency_matrix': {
    meta: 'Adjacency matrix agg',
    snippet: `"interactions": {
  "adjacency_matrix": {
    "filters": {
      "grpA": { "terms": { "accounts": ["hillary", "sidney"] }},
      "grpB": { "terms": { "accounts": ["donald", "mitt"] }},
      "grpC": { "terms": { "accounts": ["vladimir", "nigel"] }}
    }
  }
}`
  },
  'aggs.auto_date_histogram': {
    meta: 'Auto date histogram agg',
    snippet: `"sales_over_time": {
  "auto_date_histogram": {
    "field": "date",
    "buckets": 10
  }
}`
  },
  'aggs.composite': {
    meta: 'Composite agg',
    snippet: `"my_buckets": {
  "composite": {
    "sources": [
      { "product": { "terms": { "field": "product" } } }
    ]
  }
}`
  },
  'aggs.date_histogram': {
    meta: 'Date histogram agg',
    snippet: `"sales_over_time": {
  "date_histogram": {
    "field": "date",
    "calendar_interval": "month"
  }
}`
  },
  'aggs.date_range': {
    meta: 'Date range agg',
    snippet: `"range": {
  "date_range": {
    "field": "date",
    "format": "MM-yyyy",
    "ranges": [
      { "to": "now-10M/M" }, 
      { "from": "now-10M/M" } 
    ]
  }
}`
  },
  'aggs.diversified_sampler': {
    meta: 'Diversified sampler agg',
    snippet: `"my_unbiased_sample": {
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
}`
  },
  'aggs.filter': {
    meta: 'Filter agg',
    snippet: `"t_shirts": {
  "filter": { "term": { "type": "t-shirt" } },
  "aggs": {
    "avg_price": { "avg": { "field": "price" } }
  }
}`
  },
  'aggs.filters': {
    meta: 'Filters agg',
    snippet: `"messages": {
  "filters": {
    "filters": {
      "errors":   { "match": { "body": "error"   }},
      "warnings": { "match": { "body": "warning" }}
    }
  }
}`
  },
  'aggs.geo_distance': {
    meta: 'Geo distance agg',
    snippet: `"rings_around_amsterdam": {
  "geo_distance": {
    "field": "location",
    "origin": "52.3760, 4.894",
    "ranges": [
      { "to": 100000 },
      { "from": 100000, "to": 300000 },
      { "from": 300000 }
    ]
  }
}`
  },
  'aggs.geohash_grid': {
    meta: 'GeoHash grid agg',
    snippet: `"zoomed-in": {
  "filter": {
    "geo_bounding_box": {
      "location": {
        "top_left": "52.4, 4.9",
        "bottom_right": "52.3, 5.0"
      }
    }
  },
  "aggregations":{
    "zoom1":{
      "geohash_grid": {
        "field": "location",
        "precision": 8
      }
    }
  }
}`
  },
  'aggs.geotile_grid': {
    meta: 'GeoTile grid agg',
    snippet: `"zoomed-in": {
  "filter": {
    "geo_bounding_box": {
      "location": {
        "top_left": "52.4, 4.9",
        "bottom_right": "52.3, 5.0"
      }
    }
  },
  "aggregations":{
    "zoom1":{
      "geotile_grid": {
        "field": "location",
        "precision": 22
      }
    }
  }
}`
  },
  'aggs.global': {
    meta: 'Global agg',
    snippet: `"all_products": {
  "global": {}, 
  "aggs": { 
    "avg_price": { "avg": { "field": "price" } }
  }
},
"t_shirts": { "avg": { "field": "price" } }`
  },
  'aggs.histogram': {
    meta: 'Histogram agg',
    snippet: `"prices": {
  "histogram": {
    "field": "price",
    "interval": 50
  }
}`
  },
  'aggs.ip_range': {
    meta: 'IP range agg',
    snippet: `"ip_ranges": {
  "ip_range": {
    "field": "ip",
    "ranges": [
      { "to": "10.0.0.5" },
      { "from": "10.0.0.5" }
    ]
  }
}`
  },
  'aggs.missing': {
    meta: 'Missing agg',
    snippet: `"products_without_a_price": {
  "missing": { "field": "price" }
}`
  },
  'aggs.nested': {
    meta: 'Nested agg',
    snippet: `"resellers": {
  "nested": {
    "path": "resellers"
  },
  "aggs": {
    "min_price": { "min": { "field": "resellers.price" } }
  }
}`
  },
  'aggs.parent': {
    meta: 'Parent agg',
    snippet: `"to-questions": {
  "parent": {
    "type": "answer" 
  },
  "aggs": {
    "top-tags": {
      "terms": {
        "field": "tags.keyword",
        "size": 10
      }
    }
  }
}`
  },
  'aggs.range': {
    meta: 'Range agg',
    snippet: `"price_ranges": {
  "range": {
    "field": "price",
    "ranges": [
      { "to": 100.0 },
      { "from": 100.0, "to": 200.0 },
      { "from": 200.0 }
    ]
  }
}`
  },
  'aggs.rare_terms': {
    meta: 'Rare terms agg',
    snippet: `"genres": {
  "rare_terms": {
    "field": "genre"
  }
}`
  },
  'aggs.reverse_nested': {
    meta: 'Reversed nested agg',
    snippet: `"top_usernames": {
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
}`
  },
  'aggs.sampler': {
    meta: 'Sampler agg',
    snippet: `"sample": {
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
}`
  },
  'aggs.significant_terms': {
    meta: 'Significant terms agg',
    snippet: `"significant_crime_types": {
  "significant_terms": { "field": "crime_type" }
}`
  },
  'aggs.significant_text': {
    meta: 'Significant text agg',
    snippet: `"my_sample": {
  "sampler": {
    "shard_size": 100
  },
  "aggregations": {
    "keywords": {
      "significant_text": { "field": "content" }
    }
  }
}`
  },
  'aggs.terms': {
    meta: 'Terms agg',
    snippet: `"genres": {
  "terms": { "field": "genre" } 
}`
  },
  'aggs.avg_bucket': {
    meta: 'Avg bucket agg',
    snippet: `"sales_per_month": {
  "date_histogram": {
    "field": "date",
    "calendar_interval": "month"
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
}`
  },
  'aggs.derivative': {
    meta: 'Derivative agg',
    snippet: `"sales_per_month": {
  "date_histogram": {
    "field": "date",
    "calendar_interval": "month"
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
}`
  },
  'aggs.max_bucket': {
    meta: 'Max bucket agg',
    snippet: `"sales_per_month": {
  "date_histogram": {
    "field": "date",
    "calendar_interval": "month"
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
}`
  },
  'aggs.min_bucket': {
    meta: 'Min bucket agg',
    snippet: `"sales_per_month": {
  "date_histogram": {
    "field": "date",
    "calendar_interval": "month"
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
}`
  },
  'aggs.sum_bucket': {
    meta: 'Sum bucket agg',
    snippet: `"sales_per_month": {
  "date_histogram": {
    "field": "date",
    "calendar_interval": "month"
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
}`
  },
  'aggs.stats_bucket': {
    meta: 'Stats bucket agg',
    snippet: `"sales_per_month" : {
  "date_histogram": {
    "field": "date",
    "calendar_interval": "month"
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
}`
  },
  'aggs.extended_stats_bucket': {
    meta: 'Extended stats bucket agg',
    snippet: `"sales_per_month": {
  "date_histogram": {
    "field": "date",
    "calendar_interval": "month"
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
}`
  },
  'aggs.percentiles_bucket': {
    meta: 'Percentiles bucket agg',
    snippet: `"sales_per_month": {
  "date_histogram": {
    "field": "date",
    "calendar_interval": "month"
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
}`
  },
  'aggs.moving_avg': {
    meta: 'Moving avg agg',
    snippet: `"my_date_histo":{                
  "date_histogram":{
    "field":"date",
    "calendar_interval":"1M"
  },
  "aggs":{
    "the_sum":{
      "sum":{ "field": "price" } 
    },
    "the_movavg":{
      "moving_avg":{ "buckets_path": "the_sum" } 
    }
  }
}`
  },
  'aggs.moving_fn': {
    meta: 'Moving fn agg',
    snippet: `"my_date_histo":{                
  "date_histogram":{
    "field":"date",
    "calendar_interval":"1M"
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
}`
  },
  'aggs.cumulative_sum': {
    meta: 'Cumulative sum agg',
    snippet: `"sales_per_month" : {
  "date_histogram" : {
    "field" : "date",
    "calendar_interval" : "month"
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
}`
  },
  'aggs.cumulative_cardinality': {
    meta: 'Cumulative cardinality agg',
    snippet: `"users_per_day": {
  "date_histogram": {
    "field": "timestamp",
    "calendar_interval": "day"
  },
  "aggs": {
    "distinct_users": {
      "cardinality": {
        "field": "user_id"
      }
    },
    "total_new_users": {
      "cumulative_cardinality": {
        "buckets_path": "distinct_users" 
      }
    }
  }
}`
  },
  'aggs.bucket_script': {
    meta: 'Bucket script agg',
    snippet: `"sales_per_month": {
  "date_histogram": {
    "field": "date",
    "calendar_interval": "month"
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
}`
  },
  'aggs.bucket_selector': {
    meta: 'Bucket selector agg',
    snippet: `"sales_per_month": {
  "date_histogram": {
    "field": "date",
    "calendar_interval": "month"
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
}`
  },
  'aggs.bucket_sort': {
    meta: 'Bucket sort agg',
    snippet: `"sales_per_month": {
  "date_histogram": {
    "field": "date",
    "calendar_interval": "month"
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
}`
  },
  'aggs.serial_diff': {
    meta: 'Serial diff agg',
    snippet: `"my_date_histo": {                  
  "date_histogram": {
   "field": "timestamp",
   "calendar_interval": "day"
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
      "lag": 30
     }
   }
  }
}`
  },
  'aggs.matrix_stats': {
    meta: 'Matrix stats agg',
    snippet: `"statistics": {
  "matrix_stats": {
    "fields": ["poverty", "income"]
  }
}`
  }
};

const attributes = Object.keys(attributeMap);

export class WatchCompletions {
  getCompletions = function(state, session, pos, prefix) {
    const token = session.getTokenAt(pos.row, pos.column);
    if (!token) return [];

    return attributes.map(att => ({
      value: att,
      snippet: attributeMap[att].snippet,
      meta: attributeMap[att].meta,
      score: 1000000
    }));
  }
}
