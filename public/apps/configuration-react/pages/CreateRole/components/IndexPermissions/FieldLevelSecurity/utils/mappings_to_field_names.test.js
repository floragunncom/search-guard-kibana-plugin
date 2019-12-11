import mappingsToFieldNames from './mappings_to_field_names';

describe('Elasticsearch mappings to field names', () => {
  test(`can build field names aggregated by type`, () => {
    const mappings = {
      no_mappings_index: {
        mappings: {}
      },
      kibana_sample_data_ecommerce: {
        mappings: {
          properties: {
            currency: {
              type: 'keyword'
            },
            customer_birth_date: {
              type: 'date'
            },
            customer_first_name: {
              type: 'text',
              fields: {
                keyword: {
                  type: 'keyword',
                  ignore_above: 256
                }
              }
            },
            day_of_week_i: {
              type: 'integer'
            },
            geoip: {
              properties: {
                city_name: {
                  type: 'keyword'
                },
                location: {
                  type: 'geo_point'
                },
              }
            },
            products: {
              properties: {
                _id: {
                  type: 'text',
                  fields: {
                    keyword: {
                      type: 'keyword',
                      ignore_above: 256
                    }
                  }
                },
                base_price: {
                  type: 'half_float'
                },
                created_on: {
                  type: 'date'
                },
              }
            },
          }
        }
      },
      kibana_sample_data_logs: {
        mappings: {
          properties: {
            '@timestamp': {
              type: 'alias',
              path: 'timestamp'
            },
            agent: {
              type: 'text',
              fields: {
                keyword: {
                  type: 'keyword',
                  ignore_above: 256
                }
              }
            },
            bytes: {
              type: 'long'
            },
            clientip: {
              type: 'ip'
            },
            geo: {
              properties: {
                coordinates: {
                  type: 'geo_point'
                },
                dest: {
                  type: 'keyword'
                },
              }
            },
            machine: {
              properties: {
                os: {
                  type: 'text',
                  fields: {
                    keyword: {
                      type: 'keyword',
                      ignore_above: 256
                    }
                  }
                },
                ram: {
                  type: 'long'
                }
              }
            },
            memory: {
              type: 'double'
            },
            utc_time: {
              type: 'date'
            }
          }
        }
      }
    };

    const result = {
      alias: new Set (['@timestamp']),
      date: new Set (['customer_birth_date', 'products.created_on', 'utc_time']),
      double: new Set (['memory']),
      geo_point: new Set (['geoip.location', 'geo.coordinates']),
      half_float: new Set (['products.base_price']),
      integer: new Set (['day_of_week_i']),
      ip: new Set (['clientip']),
      keyword: new Set (['currency', 'geoip.city_name', 'geo.dest']),
      long: new Set (['bytes', 'machine.ram']),
      text: new Set (['customer_first_name', 'products._id', 'agent', 'machine.os'])
    };

    expect(mappingsToFieldNames(mappings)).toEqual(result);
  });
});
