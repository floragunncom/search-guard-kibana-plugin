import { buildSearchRequest } from './searchRequests';

describe('build graph watch search requests', () => {
  test('count()', () => {
    const formik = {
      _fieldName: [],
      _aggregationType: 'count',
      _index: [
        {
          health: 'green',
          label: 'kibana_sample_data_ecommerce',
          status: 'open'
        },
        {
          health: 'green',
          label: 'kibana_sample_data_flights',
          status: 'open'
        }
      ],
      _timeField: 'timestamp',
      _bucketUnitOfTime: 'h',
      _bucketValue: 1,
    };

    const uiSearchRequest = {
      type: 'search',
      name: 'mysearch',
      target: 'mysearch',
      request: {
        indices: [
          'kibana_sample_data_ecommerce',
          'kibana_sample_data_flights'
        ],
        body: {
          size: 0,
          aggregations: {
            over: {
              date_histogram: {
                field: 'timestamp',
                interval: '1h',
                min_doc_count: 0,
                extended_bounds: {
                  min: 'now-5h',
                  max: 'now'
                }
              },
              aggregations: {}
            }
          },
          query: {
            bool: {
              filter: {
                range: {
                  timestamp: {
                    gte: 'now-5h',
                    lte: 'now'
                  }
                }
              }
            }
          }
        }
      }
    };

    const watchSearchRequest = {
      type: 'search',
      name: 'mysearch',
      target: 'mysearch',
      request: {
        indices: [
          'kibana_sample_data_ecommerce',
          'kibana_sample_data_flights'
        ],
        body: {
          size: 0,
          aggregations: {},
          query: {
            bool: {
              filter: {
                range: {
                  timestamp: {
                    gte: 'now-1h',
                    lte: 'now'
                  }
                }
              }
            }
          }
        }
      }
    };

    expect(buildSearchRequest(formik)).toEqual(uiSearchRequest);
    expect(buildSearchRequest(formik, false)).toEqual(watchSearchRequest);
  });

  test('average()', () => {
    const formik = {
      _fieldName: [
        {
          label: 'FlightDelayMin'
        }
      ],
      _aggregationType: 'avg',
      _index: [
        {
          health: 'green',
          label: 'kibana_sample_data_ecommerce',
          status: 'open'
        },
        {
          health: 'green',
          label: 'kibana_sample_data_flights',
          status: 'open'
        }
      ],
      _timeField: 'timestamp',
      _bucketUnitOfTime: 'h',
      _bucketValue: 1,
    };

    const uiSearchRequest = {
      type: 'search',
      name: 'mysearch',
      target: 'mysearch',
      request: {
        indices: [
          'kibana_sample_data_ecommerce',
          'kibana_sample_data_flights'
        ],
        body: {
          size: 0,
          aggregations: {
            over: {
              date_histogram: {
                field: 'timestamp',
                interval: '1h',
                min_doc_count: 0,
                extended_bounds: {
                  min: 'now-5h',
                  max: 'now'
                }
              },
              aggregations: {
                when: {
                  avg: {
                    field: 'FlightDelayMin'
                  }
                }
              }
            }
          },
          query: {
            bool: {
              filter: {
                range: {
                  timestamp: {
                    gte: 'now-5h',
                    lte: 'now'
                  }
                }
              }
            }
          }
        }
      }
    };

    const watchSearchRequest = {
      type: 'search',
      name: 'mysearch',
      target: 'mysearch',
      request: {
        indices: [
          'kibana_sample_data_ecommerce',
          'kibana_sample_data_flights'
        ],
        body: {
          size: 0,
          aggregations: {
            when: {
              avg: {
                field: 'FlightDelayMin'
              }
            }
          },
          query: {
            bool: {
              filter: {
                range: {
                  timestamp: {
                    gte: 'now-1h',
                    lte: 'now'
                  }
                }
              }
            }
          }
        }
      }
    };

    expect(buildSearchRequest(formik)).toEqual(uiSearchRequest);
    expect(buildSearchRequest(formik, false)).toEqual(watchSearchRequest);
  });

  test('sum()', () => {
    const formik = {
      _fieldName: [
        {
          label: 'FlightDelayMin'
        }
      ],
      _aggregationType: 'sum',
      _index: [
        {
          health: 'green',
          label: 'kibana_sample_data_ecommerce',
          status: 'open'
        },
        {
          health: 'green',
          label: 'kibana_sample_data_flights',
          status: 'open'
        }
      ],
      _timeField: 'timestamp',
      _bucketUnitOfTime: 'h',
      _bucketValue: 1,
    };

    const uiSearchRequest = {
      type: 'search',
      name: 'mysearch',
      target: 'mysearch',
      request: {
        indices: [
          'kibana_sample_data_ecommerce',
          'kibana_sample_data_flights'
        ],
        body: {
          size: 0,
          aggregations: {
            over: {
              date_histogram: {
                field: 'timestamp',
                interval: '1h',
                min_doc_count: 0,
                extended_bounds: {
                  min: 'now-5h',
                  max: 'now'
                }
              },
              aggregations: {
                when: {
                  sum: {
                    field: 'FlightDelayMin'
                  }
                }
              }
            }
          },
          query: {
            bool: {
              filter: {
                range: {
                  timestamp: {
                    gte: 'now-5h',
                    lte: 'now'
                  }
                }
              }
            }
          }
        }
      }
    };

    const watchSearchRequest = {
      type: 'search',
      name: 'mysearch',
      target: 'mysearch',
      request: {
        indices: [
          'kibana_sample_data_ecommerce',
          'kibana_sample_data_flights'
        ],
        body: {
          size: 0,
          aggregations: {
            when: {
              sum: {
                field: 'FlightDelayMin'
              }
            }
          },
          query: {
            bool: {
              filter: {
                range: {
                  timestamp: {
                    gte: 'now-1h',
                    lte: 'now'
                  }
                }
              }
            }
          }
        }
      }
    };

    expect(buildSearchRequest(formik)).toEqual(uiSearchRequest);
    expect(buildSearchRequest(formik, false)).toEqual(watchSearchRequest);
  });

  test('min()', () => {
    const formik = {
      _fieldName: [
        {
          label: 'FlightDelayMin'
        }
      ],
      _aggregationType: 'min',
      _index: [
        {
          health: 'green',
          label: 'kibana_sample_data_ecommerce',
          status: 'open'
        },
        {
          health: 'green',
          label: 'kibana_sample_data_flights',
          status: 'open'
        }
      ],
      _timeField: 'timestamp',
      _bucketUnitOfTime: 'h',
      _bucketValue: 1,
    };

    const uiSearchRequest = {
      type: 'search',
      name: 'mysearch',
      target: 'mysearch',
      request: {
        indices: [
          'kibana_sample_data_ecommerce',
          'kibana_sample_data_flights'
        ],
        body: {
          size: 0,
          aggregations: {
            over: {
              date_histogram: {
                field: 'timestamp',
                interval: '1h',
                min_doc_count: 0,
                extended_bounds: {
                  min: 'now-5h',
                  max: 'now'
                }
              },
              aggregations: {
                when: {
                  min: {
                    field: 'FlightDelayMin'
                  }
                }
              }
            }
          },
          query: {
            bool: {
              filter: {
                range: {
                  timestamp: {
                    gte: 'now-5h',
                    lte: 'now'
                  }
                }
              }
            }
          }
        }
      }
    };

    const watchSearchRequest = {
      type: 'search',
      name: 'mysearch',
      target: 'mysearch',
      request: {
        indices: [
          'kibana_sample_data_ecommerce',
          'kibana_sample_data_flights'
        ],
        body: {
          size: 0,
          aggregations: {
            when: {
              min: {
                field: 'FlightDelayMin'
              }
            }
          },
          query: {
            bool: {
              filter: {
                range: {
                  timestamp: {
                    gte: 'now-1h',
                    lte: 'now'
                  }
                }
              }
            }
          }
        }
      }
    };

    expect(buildSearchRequest(formik)).toEqual(uiSearchRequest);
    expect(buildSearchRequest(formik, false)).toEqual(watchSearchRequest);
  });

  test('max()', () => {
    const formik = {
      _fieldName: [
        {
          label: 'FlightDelayMin'
        }
      ],
      _aggregationType: 'max',
      _index: [
        {
          health: 'green',
          label: 'kibana_sample_data_ecommerce',
          status: 'open'
        },
        {
          health: 'green',
          label: 'kibana_sample_data_flights',
          status: 'open'
        }
      ],
      _timeField: 'timestamp',
      _bucketUnitOfTime: 'h',
      _bucketValue: 1,
    };

    const uiSearchRequest = {
      type: 'search',
      name: 'mysearch',
      target: 'mysearch',
      request: {
        indices: [
          'kibana_sample_data_ecommerce',
          'kibana_sample_data_flights'
        ],
        body: {
          size: 0,
          aggregations: {
            over: {
              date_histogram: {
                field: 'timestamp',
                interval: '1h',
                min_doc_count: 0,
                extended_bounds: {
                  min: 'now-5h',
                  max: 'now'
                }
              },
              aggregations: {
                when: {
                  max: {
                    field: 'FlightDelayMin'
                  }
                }
              }
            }
          },
          query: {
            bool: {
              filter: {
                range: {
                  timestamp: {
                    gte: 'now-5h',
                    lte: 'now'
                  }
                }
              }
            }
          }
        }
      }
    };

    const watchSearchRequest = {
      type: 'search',
      name: 'mysearch',
      target: 'mysearch',
      request: {
        indices: [
          'kibana_sample_data_ecommerce',
          'kibana_sample_data_flights'
        ],
        body: {
          size: 0,
          aggregations: {
            when: {
              max: {
                field: 'FlightDelayMin'
              }
            }
          },
          query: {
            bool: {
              filter: {
                range: {
                  timestamp: {
                    gte: 'now-1h',
                    lte: 'now'
                  }
                }
              }
            }
          }
        }
      }
    };

    expect(buildSearchRequest(formik)).toEqual(uiSearchRequest);
    expect(buildSearchRequest(formik, false)).toEqual(watchSearchRequest);
  });
});
