/* eslint-disable max-len */
/* eslint-disable quotes */
import { buildSearchRequest } from './searchRequests';

describe('searchRequests', () => {
  describe('formik to query: count all docs', () => {
    const formik = {
      "_ui": {
        "watchType": "graph",
        "index": [
          {
            "health": "green",
            "label": "opensearch_dashboards_sample_data_flights",
            "status": "open"
          }
        ],
        "timeField": "timestamp",
        "aggregationType": "count",
        "fieldName": [],
        "topHitsAgg": {
          "field": [],
          "size": 3,
          "order": "asc"
        },
        "topHitsTermsFieldName": [],
        "overDocuments": "all documents",
        "bucketValue": 1,
        "bucketUnitOfTime": "h",
        "thresholdValue": 10,
        "thresholdEnum": "ABOVE",
        "checksGraphResult": {},
        "checksResult": "",
        "checksBlocks": [
          {
            "response": "",
            "check": "{\n  \"type\": \"search\",\n  \"name\": \"mysearch\",\n  \"target\": \"mysearch\",\n  \"request\": {\n    \"indices\": [\n      \"opensearch_dashboards_sample_data_flights\"\n    ],\n    \"body\": {\n      \"size\": 0,\n      \"aggregations\": {},\n      \"query\": {\n        \"bool\": {\n          \"filter\": {\n            \"range\": {\n              \"timestamp\": {\n                \"gte\": \"now-1h\",\n                \"lte\": \"now\"\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n}",
            "index": 0
          },
          {
            "response": "",
            "check": "{\n  \"type\": \"condition\",\n  \"name\": \"mycondition\",\n  \"source\": \"data.mysearch.hits.total.value > 10\"\n}",
            "index": 1
          }
        ],
        "frequency": "interval",
        "period": {
          "interval": 1,
          "advInterval": "1h30m15s",
          "unit": "m"
        },
        "cron": "0 */1 * * * ?",
        "daily": 0,
        "weekly": {
          "mon": false,
          "tue": false,
          "wed": false,
          "thu": false,
          "fri": false,
          "sat": false,
          "sun": false
        },
        "monthly": {
          "type": "day",
          "day": 1
        },
        "timezone": [
          {
            "label": "Europe/Berlin"
          }
        ]
      }
    };

    test('graph query', () => {
      const searchQuery = {
        "type": "search",
        "name": "mysearch",
        "target": "mysearch",
        "request": {
          "indices": [
            "opensearch_dashboards_sample_data_flights"
          ],
          "body": {
            "size": 0,
            "aggregations": {
              "dateAgg": {
                "date_histogram": {
                  "field": "timestamp",
                  "fixed_interval": "900s",
                  "time_zone": expect.any(String),
                  "min_doc_count": 0,
                  "extended_bounds": {
                    "min": "now-5h",
                    "max": "now"
                  }
                },
                "aggregations": {}
              }
            },
            "query": {
              "bool": {
                "filter": {
                  "range": {
                    "timestamp": {
                      "gte": "now-5h",
                      "lte": "now"
                    }
                  }
                }
              }
            }
          }
        }
      };

      expect(buildSearchRequest(formik)).toEqual(searchQuery);
    });

    test('watch query', () => {
      const searchQuery = {
        "type": "search",
        "name": "mysearch",
        "target": "mysearch",
        "request": {
          "indices": [
            "opensearch_dashboards_sample_data_flights"
          ],
          "body": {
            "size": 0,
            "aggregations": {},
            "query": {
              "bool": {
                "filter": {
                  "range": {
                    "timestamp": {
                      "gte": "now-1h",
                      "lte": "now"
                    }
                  }
                }
              }
            }
          }
        }
      };

      expect(buildSearchRequest(formik, false)).toEqual(searchQuery);
    });
  });

  describe('formik to query: count top_hits', () => {
    const formik = {
      "_ui": {
        "watchType": "graph",
        "index": [
          {
            "health": "green",
            "label": "opensearch_dashboards_sample_data_flights",
            "status": "open"
          }
        ],
        "timeField": "timestamp",
        "aggregationType": "count",
        "fieldName": [],
        "topHitsAgg": {
          "field": [
            {
              "label": "Carrier"
            }
          ],
          "size": 3,
          "order": "asc"
        },
        "topHitsTermsFieldName": [],
        "overDocuments": "top_hits",
        "bucketValue": 1,
        "bucketUnitOfTime": "h",
        "thresholdValue": 100,
        "thresholdEnum": "ABOVE",
        "checksGraphResult": {},
        "checksResult": "",
        "checksBlocks": [
          {
            "response": "",
            "check": "{\n  \"type\": \"search\",\n  \"name\": \"mysearch\",\n  \"target\": \"mysearch\",\n  \"request\": {\n    \"indices\": [\n      \"opensearch_dashboards_sample_data_flights\"\n    ],\n    \"body\": {\n      \"size\": 0,\n      \"aggregations\": {\n        \"bucketAgg\": {\n          \"terms\": {\n            \"field\": \"Carrier\",\n            \"size\": 3,\n            \"order\": {\n              \"_count\": \"asc\"\n            }\n          }\n        }\n      },\n      \"query\": {\n        \"bool\": {\n          \"filter\": {\n            \"range\": {\n              \"timestamp\": {\n                \"gte\": \"now-5h\",\n                \"lte\": \"now\"\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n}",
            "index": 0
          },
          {
            "response": "",
            "check": "{\n  \"type\": \"condition\",\n  \"name\": \"mycondition\",\n  \"source\": \"ArrayList arr = data.mysearch.aggregations.bucketAgg.buckets; for (int i = 0; i < arr.length; i++) { if (arr[i].doc_count > 100) { return true; } } return false;\"\n}",
            "index": 1
          }
        ],
        "frequency": "interval",
        "period": {
          "interval": 1,
          "advInterval": "1h30m15s",
          "unit": "m"
        },
        "cron": "0 */1 * * * ?",
        "daily": 0,
        "weekly": {
          "mon": false,
          "tue": false,
          "wed": false,
          "thu": false,
          "fri": false,
          "sat": false,
          "sun": false
        },
        "monthly": {
          "type": "day",
          "day": 1
        },
        "timezone": [
          {
            "label": "Europe/Berlin"
          }
        ]
      }
    };

    test('graph query', () => {
      const searchQuery = {
        "type": "search",
        "name": "mysearch",
        "target": "mysearch",
        "request": {
          "indices": [
            "opensearch_dashboards_sample_data_flights"
          ],
          "body": {
            "size": 0,
            "aggregations": {
              "bucketAgg": {
                "terms": {
                  "field": "Carrier",
                  "size": 3,
                  "order": {
                    "_count": "asc"
                  }
                },
                "aggregations": {
                  "dateAgg": {
                    "date_histogram": {
                      "field": "timestamp",
                      "fixed_interval": "900s",
                      "time_zone": expect.any(String),
                      "min_doc_count": 0,
                      "extended_bounds": {
                        "min": "now-5h",
                        "max": "now"
                      }
                    }
                  }
                }
              }
            },
            "query": {
              "bool": {
                "filter": {
                  "range": {
                    "timestamp": {
                      "gte": "now-5h",
                      "lte": "now"
                    }
                  }
                }
              }
            }
          }
        }
      };

      expect(buildSearchRequest(formik)).toEqual(searchQuery);
    });

    test('watch query', () => {
      const searchQuery = {
        "type": "search",
        "name": "mysearch",
        "target": "mysearch",
        "request": {
          "indices": [
            "opensearch_dashboards_sample_data_flights"
          ],
          "body": {
            "size": 0,
            "aggregations": {
              "bucketAgg": {
                "terms": {
                  "field": "Carrier",
                  "size": 3,
                  "order": {
                    "_count": "asc"
                  }
                }
              }
            },
            "query": {
              "bool": {
                "filter": {
                  "range": {
                    "timestamp": {
                      "gte": "now-5h",
                      "lte": "now"
                    }
                  }
                }
              }
            }
          }
        }
      };

      expect(buildSearchRequest(formik, false)).toEqual(searchQuery);
    });
  });

  describe('formik to query: avg all docs', () => {
    const formik = {
      "_ui": {
        "watchType": "graph",
        "index": [
          {
            "health": "green",
            "label": "opensearch_dashboards_sample_data_flights",
            "status": "open"
          }
        ],
        "timeField": "timestamp",
        "aggregationType": "avg",
        "fieldName": [
          {
            "label": "AvgTicketPrice"
          }
        ],
        "topHitsAgg": {
          "field": [],
          "size": 3,
          "order": "asc"
        },
        "topHitsTermsFieldName": [],
        "overDocuments": "all documents",
        "bucketValue": 1,
        "bucketUnitOfTime": "h",
        "thresholdValue": 500,
        "thresholdEnum": "ABOVE",
        "checksGraphResult": {},
        "checksResult": "",
        "checksBlocks": [
          {
            "response": "",
            "check": "{\n  \"type\": \"search\",\n  \"name\": \"mysearch\",\n  \"target\": \"mysearch\",\n  \"request\": {\n    \"indices\": [\n      \"opensearch_dashboards_sample_data_flights\"\n    ],\n    \"body\": {\n      \"size\": 0,\n      \"aggregations\": {\n        \"metricAgg\": {\n          \"avg\": {\n            \"field\": \"AvgTicketPrice\"\n          }\n        }\n      },\n      \"query\": {\n        \"bool\": {\n          \"filter\": {\n            \"range\": {\n              \"timestamp\": {\n                \"gte\": \"now-1h\",\n                \"lte\": \"now\"\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n}",
            "index": 0
          },
          {
            "response": "",
            "check": "{\n  \"type\": \"condition\",\n  \"name\": \"mycondition\",\n  \"source\": \"data.mysearch.aggregations.metricAgg.value > 500\"\n}",
            "index": 1
          }
        ],
        "frequency": "interval",
        "period": {
          "interval": 1,
          "advInterval": "1h30m15s",
          "unit": "m"
        },
        "cron": "0 */1 * * * ?",
        "daily": 0,
        "weekly": {
          "mon": false,
          "tue": false,
          "wed": false,
          "thu": false,
          "fri": false,
          "sat": false,
          "sun": false
        },
        "monthly": {
          "type": "day",
          "day": 1
        },
        "timezone": [
          {
            "label": "Europe/Berlin"
          }
        ]
      }
    };

    test('graph query', () => {
      const searchQuery = {
        "type": "search",
        "name": "mysearch",
        "target": "mysearch",
        "request": {
          "indices": [
            "opensearch_dashboards_sample_data_flights"
          ],
          "body": {
            "size": 0,
            "aggregations": {
              "dateAgg": {
                "date_histogram": {
                  "field": "timestamp",
                  "fixed_interval": "900s",
                  "time_zone": expect.any(String),
                  "min_doc_count": 0,
                  "extended_bounds": {
                    "min": "now-5h",
                    "max": "now"
                  }
                },
                "aggregations": {
                  "metricAgg": {
                    "avg": {
                      "field": "AvgTicketPrice"
                    }
                  }
                }
              }
            },
            "query": {
              "bool": {
                "filter": {
                  "range": {
                    "timestamp": {
                      "gte": "now-5h",
                      "lte": "now"
                    }
                  }
                }
              }
            }
          }
        }
      };

      expect(buildSearchRequest(formik)).toEqual(searchQuery);
    });

    test('watch query', () => {
      const searchQuery = {
        "type": "search",
        "name": "mysearch",
        "target": "mysearch",
        "request": {
          "indices": [
            "opensearch_dashboards_sample_data_flights"
          ],
          "body": {
            "size": 0,
            "aggregations": {
              "metricAgg": {
                "avg": {
                  "field": "AvgTicketPrice"
                }
              }
            },
            "query": {
              "bool": {
                "filter": {
                  "range": {
                    "timestamp": {
                      "gte": "now-1h",
                      "lte": "now"
                    }
                  }
                }
              }
            }
          }
        }
      };

      expect(buildSearchRequest(formik, false)).toEqual(searchQuery);
    });
  });

  describe('formik to query: avg top_hits', () => {
    const formik = {
      "_ui": {
        "watchType": "graph",
        "index": [
          {
            "health": "green",
            "label": "opensearch_dashboards_sample_data_flights",
            "status": "open"
          }
        ],
        "timeField": "timestamp",
        "aggregationType": "avg",
        "fieldName": [
          {
            "label": "AvgTicketPrice"
          }
        ],
        "topHitsAgg": {
          "field": [
            {
              "label": "Carrier"
            }
          ],
          "size": 3,
          "order": "asc"
        },
        "topHitsTermsFieldName": [],
        "overDocuments": "top_hits",
        "bucketValue": 1,
        "bucketUnitOfTime": "h",
        "thresholdValue": 500,
        "thresholdEnum": "ABOVE",
        "checksGraphResult": {},
        "checksResult": "",
        "checksBlocks": [
          {
            "response": "",
            "check": "{\n  \"type\": \"search\",\n  \"name\": \"mysearch\",\n  \"target\": \"mysearch\",\n  \"request\": {\n    \"indices\": [\n      \"opensearch_dashboards_sample_data_flights\"\n    ],\n    \"body\": {\n      \"size\": 0,\n      \"aggregations\": {\n        \"bucketAgg\": {\n          \"terms\": {\n            \"field\": \"Carrier\",\n            \"size\": 3,\n            \"order\": {\n              \"metricAgg\": \"asc\"\n            }\n          },\n          \"aggregations\": {\n            \"metricAgg\": {\n              \"avg\": {\n                \"field\": \"AvgTicketPrice\"\n              }\n            }\n          }\n        }\n      },\n      \"query\": {\n        \"bool\": {\n          \"filter\": {\n            \"range\": {\n              \"timestamp\": {\n                \"gte\": \"now-5h\",\n                \"lte\": \"now\"\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n}",
            "index": 0
          },
          {
            "response": "",
            "check": "{\n  \"type\": \"condition\",\n  \"name\": \"mycondition\",\n  \"source\": \"ArrayList arr = data.mysearch.aggregations.bucketAgg.buckets; for (int i = 0; i < arr.length; i++) { if (arr[i]['metricAgg'].value > 500) { return true; } } return false;\"\n}",
            "index": 1
          }
        ],
        "frequency": "interval",
        "period": {
          "interval": 1,
          "advInterval": "1h30m15s",
          "unit": "m"
        },
        "cron": "0 */1 * * * ?",
        "daily": 0,
        "weekly": {
          "mon": false,
          "tue": false,
          "wed": false,
          "thu": false,
          "fri": false,
          "sat": false,
          "sun": false
        },
        "monthly": {
          "type": "day",
          "day": 1
        },
        "timezone": [
          {
            "label": "Europe/Berlin"
          }
        ]
      }
    };

    test('graph query', () => {
      const searchQuery = {
        "type": "search",
        "name": "mysearch",
        "target": "mysearch",
        "request": {
          "indices": [
            "opensearch_dashboards_sample_data_flights"
          ],
          "body": {
            "size": 0,
            "aggregations": {
              "bucketAgg": {
                "terms": {
                  "field": "Carrier",
                  "size": 3,
                  "order": {
                    "metricAgg": "asc"
                  }
                },
                "aggregations": {
                  "metricAgg": {
                    "avg": {
                      "field": "AvgTicketPrice"
                    }
                  },
                  "dateAgg": {
                    "date_histogram": {
                      "field": "timestamp",
                      "fixed_interval": "900s",
                      "time_zone": expect.any(String),
                      "min_doc_count": 0,
                      "extended_bounds": {
                        "min": "now-5h",
                        "max": "now"
                      }
                    },
                    "aggregations": {
                      "metricAgg": {
                        "avg": {
                          "field": "AvgTicketPrice"
                        }
                      }
                    }
                  }
                }
              }
            },
            "query": {
              "bool": {
                "filter": {
                  "range": {
                    "timestamp": {
                      "gte": "now-5h",
                      "lte": "now"
                    }
                  }
                }
              }
            }
          }
        }
      };

      expect(buildSearchRequest(formik)).toEqual(searchQuery);
    });

    test('watch query', () => {
      const searchQuery = {
        "type": "search",
        "name": "mysearch",
        "target": "mysearch",
        "request": {
          "indices": [
            "opensearch_dashboards_sample_data_flights"
          ],
          "body": {
            "size": 0,
            "aggregations": {
              "bucketAgg": {
                "terms": {
                  "field": "Carrier",
                  "size": 3,
                  "order": {
                    "metricAgg": "asc"
                  }
                },
                "aggregations": {
                  "metricAgg": {
                    "avg": {
                      "field": "AvgTicketPrice"
                    }
                  }
                }
              }
            },
            "query": {
              "bool": {
                "filter": {
                  "range": {
                    "timestamp": {
                      "gte": "now-5h",
                      "lte": "now"
                    }
                  }
                }
              }
            }
          }
        }
      };

      expect(buildSearchRequest(formik, false)).toEqual(searchQuery);
    });
  });

  describe('formik to query: sum all docs', () => {
    const formik = {
      "_ui": {
        "watchType": "graph",
        "index": [
          {
            "health": "green",
            "label": "opensearch_dashboards_sample_data_flights",
            "status": "open"
          }
        ],
        "timeField": "timestamp",
        "aggregationType": "sum",
        "fieldName": [
          {
            "label": "AvgTicketPrice"
          }
        ],
        "topHitsAgg": {
          "field": [],
          "size": 3,
          "order": "asc"
        },
        "topHitsTermsFieldName": [],
        "overDocuments": "all documents",
        "bucketValue": 1,
        "bucketUnitOfTime": "h",
        "thresholdValue": 500,
        "thresholdEnum": "ABOVE",
        "checksGraphResult": {},
        "checksResult": "",
        "checksBlocks": [
          {
            "response": "",
            "check": "{\n  \"type\": \"search\",\n  \"name\": \"mysearch\",\n  \"target\": \"mysearch\",\n  \"request\": {\n    \"indices\": [\n      \"opensearch_dashboards_sample_data_flights\"\n    ],\n    \"body\": {\n      \"size\": 0,\n      \"aggregations\": {\n        \"metricAgg\": {\n          \"sum\": {\n            \"field\": \"AvgTicketPrice\"\n          }\n        }\n      },\n      \"query\": {\n        \"bool\": {\n          \"filter\": {\n            \"range\": {\n              \"timestamp\": {\n                \"gte\": \"now-1h\",\n                \"lte\": \"now\"\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n}",
            "index": 0
          },
          {
            "response": "",
            "check": "{\n  \"type\": \"condition\",\n  \"name\": \"mycondition\",\n  \"source\": \"data.mysearch.aggregations.metricAgg.value > 500\"\n}",
            "index": 1
          }
        ],
        "frequency": "interval",
        "period": {
          "interval": 1,
          "advInterval": "1h30m15s",
          "unit": "m"
        },
        "cron": "0 */1 * * * ?",
        "daily": 0,
        "weekly": {
          "mon": false,
          "tue": false,
          "wed": false,
          "thu": false,
          "fri": false,
          "sat": false,
          "sun": false
        },
        "monthly": {
          "type": "day",
          "day": 1
        },
        "timezone": [
          {
            "label": "Europe/Berlin"
          }
        ]
      }
    };

    test('graph query', () => {
      const searchQuery = {
        "type": "search",
        "name": "mysearch",
        "target": "mysearch",
        "request": {
          "indices": [
            "opensearch_dashboards_sample_data_flights"
          ],
          "body": {
            "size": 0,
            "aggregations": {
              "dateAgg": {
                "date_histogram": {
                  "field": "timestamp",
                  "fixed_interval": "900s",
                  "time_zone": expect.any(String),
                  "min_doc_count": 0,
                  "extended_bounds": {
                    "min": "now-5h",
                    "max": "now"
                  }
                },
                "aggregations": {
                  "metricAgg": {
                    "sum": {
                      "field": "AvgTicketPrice"
                    }
                  }
                }
              }
            },
            "query": {
              "bool": {
                "filter": {
                  "range": {
                    "timestamp": {
                      "gte": "now-5h",
                      "lte": "now"
                    }
                  }
                }
              }
            }
          }
        }
      };

      expect(buildSearchRequest(formik)).toEqual(searchQuery);
    });

    test('watch query', () => {
      const searchQuery = {
        "type": "search",
        "name": "mysearch",
        "target": "mysearch",
        "request": {
          "indices": [
            "opensearch_dashboards_sample_data_flights"
          ],
          "body": {
            "size": 0,
            "aggregations": {
              "metricAgg": {
                "sum": {
                  "field": "AvgTicketPrice"
                }
              }
            },
            "query": {
              "bool": {
                "filter": {
                  "range": {
                    "timestamp": {
                      "gte": "now-1h",
                      "lte": "now"
                    }
                  }
                }
              }
            }
          }
        }
      };

      expect(buildSearchRequest(formik, false)).toEqual(searchQuery);
    });
  });

  describe('formik to query: sum top_hits', () => {
    const formik = {
      "_ui": {
        "watchType": "graph",
        "index": [
          {
            "health": "green",
            "label": "opensearch_dashboards_sample_data_flights",
            "status": "open"
          }
        ],
        "timeField": "timestamp",
        "aggregationType": "sum",
        "fieldName": [
          {
            "label": "AvgTicketPrice"
          }
        ],
        "topHitsAgg": {
          "field": [
            {
              "label": "Carrier"
            }
          ],
          "size": 3,
          "order": "asc"
        },
        "topHitsTermsFieldName": [],
        "overDocuments": "top_hits",
        "bucketValue": 1,
        "bucketUnitOfTime": "h",
        "thresholdValue": 500,
        "thresholdEnum": "ABOVE",
        "checksGraphResult": {},
        "checksResult": "",
        "checksBlocks": [
          {
            "response": "",
            "check": "{\n  \"type\": \"search\",\n  \"name\": \"mysearch\",\n  \"target\": \"mysearch\",\n  \"request\": {\n    \"indices\": [\n      \"opensearch_dashboards_sample_data_flights\"\n    ],\n    \"body\": {\n      \"size\": 0,\n      \"aggregations\": {\n        \"bucketAgg\": {\n          \"terms\": {\n            \"field\": \"Carrier\",\n            \"size\": 3,\n            \"order\": {\n              \"metricAgg\": \"asc\"\n            }\n          },\n          \"aggregations\": {\n            \"metricAgg\": {\n              \"sum\": {\n                \"field\": \"AvgTicketPrice\"\n              }\n            }\n          }\n        }\n      },\n      \"query\": {\n        \"bool\": {\n          \"filter\": {\n            \"range\": {\n              \"timestamp\": {\n                \"gte\": \"now-5h\",\n                \"lte\": \"now\"\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n}",
            "index": 0
          },
          {
            "response": "",
            "check": "{\n  \"type\": \"condition\",\n  \"name\": \"mycondition\",\n  \"source\": \"ArrayList arr = data.mysearch.aggregations.bucketAgg.buckets; for (int i = 0; i < arr.length; i++) { if (arr[i]['metricAgg'].value > 500) { return true; } } return false;\"\n}",
            "index": 1
          }
        ],
        "frequency": "interval",
        "period": {
          "interval": 1,
          "advInterval": "1h30m15s",
          "unit": "m"
        },
        "cron": "0 */1 * * * ?",
        "daily": 0,
        "weekly": {
          "mon": false,
          "tue": false,
          "wed": false,
          "thu": false,
          "fri": false,
          "sat": false,
          "sun": false
        },
        "monthly": {
          "type": "day",
          "day": 1
        },
        "timezone": [
          {
            "label": "Europe/Berlin"
          }
        ]
      }
    };

    test('graph query', () => {
      const searchQuery = {
        "type": "search",
        "name": "mysearch",
        "target": "mysearch",
        "request": {
          "indices": [
            "opensearch_dashboards_sample_data_flights"
          ],
          "body": {
            "size": 0,
            "aggregations": {
              "bucketAgg": {
                "terms": {
                  "field": "Carrier",
                  "size": 3,
                  "order": {
                    "metricAgg": "asc"
                  }
                },
                "aggregations": {
                  "metricAgg": {
                    "sum": {
                      "field": "AvgTicketPrice"
                    }
                  },
                  "dateAgg": {
                    "date_histogram": {
                      "field": "timestamp",
                      "fixed_interval": "900s",
                      "time_zone": expect.any(String),
                      "min_doc_count": 0,
                      "extended_bounds": {
                        "min": "now-5h",
                        "max": "now"
                      }
                    },
                    "aggregations": {
                      "metricAgg": {
                        "sum": {
                          "field": "AvgTicketPrice"
                        }
                      }
                    }
                  }
                }
              }
            },
            "query": {
              "bool": {
                "filter": {
                  "range": {
                    "timestamp": {
                      "gte": "now-5h",
                      "lte": "now"
                    }
                  }
                }
              }
            }
          }
        }
      };

      expect(buildSearchRequest(formik)).toEqual(searchQuery);
    });

    test('watch query', () => {
      const searchQuery = {
        "type": "search",
        "name": "mysearch",
        "target": "mysearch",
        "request": {
          "indices": [
            "opensearch_dashboards_sample_data_flights"
          ],
          "body": {
            "size": 0,
            "aggregations": {
              "bucketAgg": {
                "terms": {
                  "field": "Carrier",
                  "size": 3,
                  "order": {
                    "metricAgg": "asc"
                  }
                },
                "aggregations": {
                  "metricAgg": {
                    "sum": {
                      "field": "AvgTicketPrice"
                    }
                  }
                }
              }
            },
            "query": {
              "bool": {
                "filter": {
                  "range": {
                    "timestamp": {
                      "gte": "now-5h",
                      "lte": "now"
                    }
                  }
                }
              }
            }
          }
        }
      };

      expect(buildSearchRequest(formik, false)).toEqual(searchQuery);
    });
  });

  describe('formik to query: min all docs', () => {
    const formik = {
      "_ui": {
        "watchType": "graph",
        "index": [
          {
            "health": "green",
            "label": "opensearch_dashboards_sample_data_flights",
            "status": "open"
          }
        ],
        "timeField": "timestamp",
        "aggregationType": "min",
        "fieldName": [
          {
            "label": "AvgTicketPrice"
          }
        ],
        "topHitsAgg": {
          "field": [],
          "size": 3,
          "order": "asc"
        },
        "topHitsTermsFieldName": [],
        "overDocuments": "all documents",
        "bucketValue": 1,
        "bucketUnitOfTime": "h",
        "thresholdValue": 500,
        "thresholdEnum": "ABOVE",
        "checksGraphResult": {},
        "checksResult": "",
        "checksBlocks": [
          {
            "response": "",
            "check": "{\n  \"type\": \"search\",\n  \"name\": \"mysearch\",\n  \"target\": \"mysearch\",\n  \"request\": {\n    \"indices\": [\n      \"opensearch_dashboards_sample_data_flights\"\n    ],\n    \"body\": {\n      \"size\": 0,\n      \"aggregations\": {\n        \"metricAgg\": {\n          \"min\": {\n            \"field\": \"AvgTicketPrice\"\n          }\n        }\n      },\n      \"query\": {\n        \"bool\": {\n          \"filter\": {\n            \"range\": {\n              \"timestamp\": {\n                \"gte\": \"now-1h\",\n                \"lte\": \"now\"\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n}",
            "index": 0
          },
          {
            "response": "",
            "check": "{\n  \"type\": \"condition\",\n  \"name\": \"mycondition\",\n  \"source\": \"data.mysearch.aggregations.metricAgg.value > 500\"\n}",
            "index": 1
          }
        ],
        "frequency": "interval",
        "period": {
          "interval": 1,
          "advInterval": "1h30m15s",
          "unit": "m"
        },
        "cron": "0 */1 * * * ?",
        "daily": 0,
        "weekly": {
          "mon": false,
          "tue": false,
          "wed": false,
          "thu": false,
          "fri": false,
          "sat": false,
          "sun": false
        },
        "monthly": {
          "type": "day",
          "day": 1
        },
        "timezone": [
          {
            "label": "Europe/Berlin"
          }
        ]
      }
    };

    test('graph query', () => {
      const searchQuery = {
        "type": "search",
        "name": "mysearch",
        "target": "mysearch",
        "request": {
          "indices": [
            "opensearch_dashboards_sample_data_flights"
          ],
          "body": {
            "size": 0,
            "aggregations": {
              "dateAgg": {
                "date_histogram": {
                  "field": "timestamp",
                  "fixed_interval": "900s",
                  "time_zone": expect.any(String),
                  "min_doc_count": 0,
                  "extended_bounds": {
                    "min": "now-5h",
                    "max": "now"
                  }
                },
                "aggregations": {
                  "metricAgg": {
                    "min": {
                      "field": "AvgTicketPrice"
                    }
                  }
                }
              }
            },
            "query": {
              "bool": {
                "filter": {
                  "range": {
                    "timestamp": {
                      "gte": "now-5h",
                      "lte": "now"
                    }
                  }
                }
              }
            }
          }
        }
      };

      expect(buildSearchRequest(formik)).toEqual(searchQuery);
    });

    test('watch query', () => {
      const searchQuery = {
        "type": "search",
        "name": "mysearch",
        "target": "mysearch",
        "request": {
          "indices": [
            "opensearch_dashboards_sample_data_flights"
          ],
          "body": {
            "size": 0,
            "aggregations": {
              "metricAgg": {
                "min": {
                  "field": "AvgTicketPrice"
                }
              }
            },
            "query": {
              "bool": {
                "filter": {
                  "range": {
                    "timestamp": {
                      "gte": "now-1h",
                      "lte": "now"
                    }
                  }
                }
              }
            }
          }
        }
      };

      expect(buildSearchRequest(formik, false)).toEqual(searchQuery);
    });
  });

  describe('formik to query: min top_hits', () => {
    const formik = {
      "_ui": {
        "watchType": "graph",
        "index": [
          {
            "health": "green",
            "label": "opensearch_dashboards_sample_data_flights",
            "status": "open"
          }
        ],
        "timeField": "timestamp",
        "aggregationType": "min",
        "fieldName": [
          {
            "label": "AvgTicketPrice"
          }
        ],
        "topHitsAgg": {
          "field": [
            {
              "label": "Carrier"
            }
          ],
          "size": 3,
          "order": "asc"
        },
        "topHitsTermsFieldName": [],
        "overDocuments": "top_hits",
        "bucketValue": 1,
        "bucketUnitOfTime": "h",
        "thresholdValue": 500,
        "thresholdEnum": "ABOVE",
        "checksGraphResult": {},
        "checksResult": "",
        "checksBlocks": [
          {
            "response": "",
            "check": "{\n  \"type\": \"search\",\n  \"name\": \"mysearch\",\n  \"target\": \"mysearch\",\n  \"request\": {\n    \"indices\": [\n      \"opensearch_dashboards_sample_data_flights\"\n    ],\n    \"body\": {\n      \"size\": 0,\n      \"aggregations\": {\n        \"bucketAgg\": {\n          \"terms\": {\n            \"field\": \"Carrier\",\n            \"size\": 3,\n            \"order\": {\n              \"metricAgg\": \"asc\"\n            }\n          },\n          \"aggregations\": {\n            \"metricAgg\": {\n              \"min\": {\n                \"field\": \"AvgTicketPrice\"\n              }\n            }\n          }\n        }\n      },\n      \"query\": {\n        \"bool\": {\n          \"filter\": {\n            \"range\": {\n              \"timestamp\": {\n                \"gte\": \"now-5h\",\n                \"lte\": \"now\"\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n}",
            "index": 0
          },
          {
            "response": "",
            "check": "{\n  \"type\": \"condition\",\n  \"name\": \"mycondition\",\n  \"source\": \"ArrayList arr = data.mysearch.aggregations.bucketAgg.buckets; for (int i = 0; i < arr.length; i++) { if (arr[i]['metricAgg'].value > 500) { return true; } } return false;\"\n}",
            "index": 1
          }
        ],
        "frequency": "interval",
        "period": {
          "interval": 1,
          "advInterval": "1h30m15s",
          "unit": "m"
        },
        "cron": "0 */1 * * * ?",
        "daily": 0,
        "weekly": {
          "mon": false,
          "tue": false,
          "wed": false,
          "thu": false,
          "fri": false,
          "sat": false,
          "sun": false
        },
        "monthly": {
          "type": "day",
          "day": 1
        },
        "timezone": [
          {
            "label": "Europe/Berlin"
          }
        ]
      }
    };

    test('graph query', () => {
      const searchQuery = {
        "type": "search",
        "name": "mysearch",
        "target": "mysearch",
        "request": {
          "indices": [
            "opensearch_dashboards_sample_data_flights"
          ],
          "body": {
            "size": 0,
            "aggregations": {
              "bucketAgg": {
                "terms": {
                  "field": "Carrier",
                  "size": 3,
                  "order": {
                    "metricAgg": "asc"
                  }
                },
                "aggregations": {
                  "metricAgg": {
                    "min": {
                      "field": "AvgTicketPrice"
                    }
                  },
                  "dateAgg": {
                    "date_histogram": {
                      "field": "timestamp",
                      "fixed_interval": "900s",
                      "time_zone": expect.any(String),
                      "min_doc_count": 0,
                      "extended_bounds": {
                        "min": "now-5h",
                        "max": "now"
                      }
                    },
                    "aggregations": {
                      "metricAgg": {
                        "min": {
                          "field": "AvgTicketPrice"
                        }
                      }
                    }
                  }
                }
              }
            },
            "query": {
              "bool": {
                "filter": {
                  "range": {
                    "timestamp": {
                      "gte": "now-5h",
                      "lte": "now"
                    }
                  }
                }
              }
            }
          }
        }
      };

      expect(buildSearchRequest(formik)).toEqual(searchQuery);
    });

    test('watch query', () => {
      const searchQuery = {
        "type": "search",
        "name": "mysearch",
        "target": "mysearch",
        "request": {
          "indices": [
            "opensearch_dashboards_sample_data_flights"
          ],
          "body": {
            "size": 0,
            "aggregations": {
              "bucketAgg": {
                "terms": {
                  "field": "Carrier",
                  "size": 3,
                  "order": {
                    "metricAgg": "asc"
                  }
                },
                "aggregations": {
                  "metricAgg": {
                    "min": {
                      "field": "AvgTicketPrice"
                    }
                  }
                }
              }
            },
            "query": {
              "bool": {
                "filter": {
                  "range": {
                    "timestamp": {
                      "gte": "now-5h",
                      "lte": "now"
                    }
                  }
                }
              }
            }
          }
        }
      };

      expect(buildSearchRequest(formik, false)).toEqual(searchQuery);
    });
  });

  describe('formik to query: max all docs', () => {
    const formik = {
      "_ui": {
        "watchType": "graph",
        "index": [
          {
            "health": "green",
            "label": "opensearch_dashboards_sample_data_flights",
            "status": "open"
          }
        ],
        "timeField": "timestamp",
        "aggregationType": "max",
        "fieldName": [
          {
            "label": "AvgTicketPrice"
          }
        ],
        "topHitsAgg": {
          "field": [],
          "size": 3,
          "order": "asc"
        },
        "topHitsTermsFieldName": [],
        "overDocuments": "all documents",
        "bucketValue": 1,
        "bucketUnitOfTime": "h",
        "thresholdValue": 500,
        "thresholdEnum": "ABOVE",
        "checksGraphResult": {},
        "checksResult": "",
        "checksBlocks": [
          {
            "response": "",
            "check": "{\n  \"type\": \"search\",\n  \"name\": \"mysearch\",\n  \"target\": \"mysearch\",\n  \"request\": {\n    \"indices\": [\n      \"opensearch_dashboards_sample_data_flights\"\n    ],\n    \"body\": {\n      \"size\": 0,\n      \"aggregations\": {\n        \"metricAgg\": {\n          \"max\": {\n            \"field\": \"AvgTicketPrice\"\n          }\n        }\n      },\n      \"query\": {\n        \"bool\": {\n          \"filter\": {\n            \"range\": {\n              \"timestamp\": {\n                \"gte\": \"now-1h\",\n                \"lte\": \"now\"\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n}",
            "index": 0
          },
          {
            "response": "",
            "check": "{\n  \"type\": \"condition\",\n  \"name\": \"mycondition\",\n  \"source\": \"data.mysearch.aggregations.metricAgg.value > 500\"\n}",
            "index": 1
          }
        ],
        "frequency": "interval",
        "period": {
          "interval": 1,
          "advInterval": "1h30m15s",
          "unit": "m"
        },
        "cron": "0 */1 * * * ?",
        "daily": 0,
        "weekly": {
          "mon": false,
          "tue": false,
          "wed": false,
          "thu": false,
          "fri": false,
          "sat": false,
          "sun": false
        },
        "monthly": {
          "type": "day",
          "day": 1
        },
        "timezone": [
          {
            "label": "Europe/Berlin"
          }
        ]
      }
    };

    test('graph query', () => {
      const searchQuery = {
        "type": "search",
        "name": "mysearch",
        "target": "mysearch",
        "request": {
          "indices": [
            "opensearch_dashboards_sample_data_flights"
          ],
          "body": {
            "size": 0,
            "aggregations": {
              "dateAgg": {
                "date_histogram": {
                  "field": "timestamp",
                  "fixed_interval": "900s",
                  "time_zone": expect.any(String),
                  "min_doc_count": 0,
                  "extended_bounds": {
                    "min": "now-5h",
                    "max": "now"
                  }
                },
                "aggregations": {
                  "metricAgg": {
                    "max": {
                      "field": "AvgTicketPrice"
                    }
                  }
                }
              }
            },
            "query": {
              "bool": {
                "filter": {
                  "range": {
                    "timestamp": {
                      "gte": "now-5h",
                      "lte": "now"
                    }
                  }
                }
              }
            }
          }
        }
      };

      expect(buildSearchRequest(formik)).toEqual(searchQuery);
    });

    test('watch query', () => {
      const searchQuery = {
        "type": "search",
        "name": "mysearch",
        "target": "mysearch",
        "request": {
          "indices": [
            "opensearch_dashboards_sample_data_flights"
          ],
          "body": {
            "size": 0,
            "aggregations": {
              "metricAgg": {
                "max": {
                  "field": "AvgTicketPrice"
                }
              }
            },
            "query": {
              "bool": {
                "filter": {
                  "range": {
                    "timestamp": {
                      "gte": "now-1h",
                      "lte": "now"
                    }
                  }
                }
              }
            }
          }
        }
      };

      expect(buildSearchRequest(formik, false)).toEqual(searchQuery);
    });
  });

  describe('formik to query: max top_hits', () => {
    const formik = {
      "_ui": {
        "watchType": "graph",
        "index": [
          {
            "health": "green",
            "label": "opensearch_dashboards_sample_data_flights",
            "status": "open"
          }
        ],
        "timeField": "timestamp",
        "aggregationType": "max",
        "fieldName": [
          {
            "label": "AvgTicketPrice"
          }
        ],
        "topHitsAgg": {
          "field": [
            {
              "label": "Carrier"
            }
          ],
          "size": 3,
          "order": "asc"
        },
        "overDocuments": "top_hits",
        "bucketValue": 1,
        "bucketUnitOfTime": "h",
        "thresholdValue": 500,
        "thresholdEnum": "ABOVE",
        "checksGraphResult": {},
        "checksResult": "",
        "checksBlocks": [
          {
            "response": "",
            "check": "{\n  \"type\": \"search\",\n  \"name\": \"mysearch\",\n  \"target\": \"mysearch\",\n  \"request\": {\n    \"indices\": [\n      \"opensearch_dashboards_sample_data_flights\"\n    ],\n    \"body\": {\n      \"size\": 0,\n      \"aggregations\": {\n        \"bucketAgg\": {\n          \"terms\": {\n            \"field\": \"Carrier\",\n            \"size\": 3,\n            \"order\": {\n              \"metricAgg\": \"asc\"\n            }\n          },\n          \"aggregations\": {\n            \"metricAgg\": {\n              \"max\": {\n                \"field\": \"AvgTicketPrice\"\n              }\n            }\n          }\n        }\n      },\n      \"query\": {\n        \"bool\": {\n          \"filter\": {\n            \"range\": {\n              \"timestamp\": {\n                \"gte\": \"now-5h\",\n                \"lte\": \"now\"\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n}",
            "index": 0
          },
          {
            "response": "",
            "check": "{\n  \"type\": \"condition\",\n  \"name\": \"mycondition\",\n  \"source\": \"ArrayList arr = data.mysearch.aggregations.bucketAgg.buckets; for (int i = 0; i < arr.length; i++) { if (arr[i]['metricAgg'].value > 500) { return true; } } return false;\"\n}",
            "index": 1
          }
        ],
        "frequency": "interval",
        "period": {
          "interval": 1,
          "advInterval": "1h30m15s",
          "unit": "m"
        },
        "cron": "0 */1 * * * ?",
        "daily": 0,
        "weekly": {
          "mon": false,
          "tue": false,
          "wed": false,
          "thu": false,
          "fri": false,
          "sat": false,
          "sun": false
        },
        "monthly": {
          "type": "day",
          "day": 1
        },
        "timezone": [
          {
            "label": "Europe/Berlin"
          }
        ],
        "topHitsTermsFieldName": []
      }
    };

    test('graph query', () => {
      const searchQuery = {
        "type": "search",
        "name": "mysearch",
        "target": "mysearch",
        "request": {
          "indices": [
            "opensearch_dashboards_sample_data_flights"
          ],
          "body": {
            "size": 0,
            "aggregations": {
              "bucketAgg": {
                "terms": {
                  "field": "Carrier",
                  "size": 3,
                  "order": {
                    "metricAgg": "asc"
                  }
                },
                "aggregations": {
                  "metricAgg": {
                    "max": {
                      "field": "AvgTicketPrice"
                    }
                  },
                  "dateAgg": {
                    "date_histogram": {
                      "field": "timestamp",
                      "fixed_interval": "900s",
                      "time_zone": expect.any(String),
                      "min_doc_count": 0,
                      "extended_bounds": {
                        "min": "now-5h",
                        "max": "now"
                      }
                    },
                    "aggregations": {
                      "metricAgg": {
                        "max": {
                          "field": "AvgTicketPrice"
                        }
                      }
                    }
                  }
                }
              }
            },
            "query": {
              "bool": {
                "filter": {
                  "range": {
                    "timestamp": {
                      "gte": "now-5h",
                      "lte": "now"
                    }
                  }
                }
              }
            }
          }
        }
      };

      expect(buildSearchRequest(formik)).toEqual(searchQuery);
    });

    test('watch query', () => {
      const searchQuery = {
        "type": "search",
        "name": "mysearch",
        "target": "mysearch",
        "request": {
          "indices": [
            "opensearch_dashboards_sample_data_flights"
          ],
          "body": {
            "size": 0,
            "aggregations": {
              "bucketAgg": {
                "terms": {
                  "field": "Carrier",
                  "size": 3,
                  "order": {
                    "metricAgg": "asc"
                  }
                },
                "aggregations": {
                  "metricAgg": {
                    "max": {
                      "field": "AvgTicketPrice"
                    }
                  }
                }
              }
            },
            "query": {
              "bool": {
                "filter": {
                  "range": {
                    "timestamp": {
                      "gte": "now-5h",
                      "lte": "now"
                    }
                  }
                }
              }
            }
          }
        }
      };

      expect(buildSearchRequest(formik, false)).toEqual(searchQuery);
    });
  });
});
