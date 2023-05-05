/** @jest-environment jsdom */
import { getDataFromResponse } from './helpers';

describe('getDataFromResponse', () => {
  test('return [] if no response', () => {
    expect(getDataFromResponse()).toEqual([]);
  });

  describe('top hits agg', () => {
    test('avg agg', () => {
      const esResponse = {
        aggregations: {
          bucketAgg: {
            buckets: [
              {
                key: 'ES-Air',
                doc_count: 15,
                dateAgg: {
                  buckets: [
                    {
                      key_as_string: '2019-11-20T07:00:00.000+01:00',
                      key: 1574229600000,
                      doc_count: 0,
                      metricAgg: {
                        value: null
                      }
                    },
                    {
                      key_as_string: '2019-11-20T08:00:00.000+01:00',
                      key: 1574233200000,
                      doc_count: 3,
                      metricAgg: {
                        value: 383.9850718180339
                      }
                    },
                  ]
                },
                metricAgg: {
                  value: 622.4304718017578
                }
              },
              {
                key: 'Logstash Airways',
                doc_count: 16,
                dateAgg: {
                  buckets: [
                    {
                      key_as_string: '2019-11-20T07:00:00.000+01:00',
                      key: 1574229600000,
                      doc_count: 1,
                      metricAgg: {
                        value: 752.768310546875
                      }
                    },
                    {
                      key_as_string: '2019-11-20T08:00:00.000+01:00',
                      key: 1574233200000,
                      doc_count: 5,
                      metricAgg: {
                        value: 601.691650390625
                      }
                    },
                  ]
                },
                metricAgg: {
                  value: 630.0610842704773
                }
              }
            ]
          }
        }
      };

      const result = {
        'ES-Air': [
          {
            x: new Date('2019-11-20T08:00:00.000+01:00'),
            y: 383.9850718180339
          }
        ],
        'Logstash Airways': [
          {
            x: new Date('2019-11-20T07:00:00.000+01:00'),
            y: 752.768310546875
          },
          {
            x: new Date('2019-11-20T08:00:00.000+01:00'),
            y: 601.691650390625
          }
        ]
      };

      expect(getDataFromResponse(esResponse)).toEqual(result);
    });
  });

  describe('all documents agg', () => {
    test('count agg', () => {
      const esResponse = {
        aggregations: {
          dateAgg: {
            buckets: [
              {
                key_as_string: '2019-11-20T07:00:00.000+01:00',
                key: 1574229600000,
                doc_count: 2
              },
              {
                key_as_string: '2019-11-20T08:00:00.000+01:00',
                key: 1574233200000,
                doc_count: 14
              }
            ]
          }
        }
      };

      const result = {
        'all documents': [
          {
            x: new Date('2019-11-20T06:00:00.000Z'),
            y: 2
          },
          {
            x: new Date('2019-11-20T07:00:00.000Z'),
            y: 14
          }
        ]
      };

      expect(getDataFromResponse(esResponse)).toEqual(result);
    });

    test('avg agg', () => {
      const esResponse = {
        aggregations: {
          dateAgg: {
            buckets: [
              {
                key_as_string: '2019-11-20T07:00:00.000+01:00',
                key: 1574229600000,
                doc_count: 4,
                metricAgg: {
                  value: 599.6374893188477
                }
              },
              {
                key_as_string: '2019-11-20T08:00:00.000+01:00',
                key: 1574233200000,
                doc_count: 14,
                metricAgg: {
                  value: 546.6338032313755
                }
              }
            ]
          }
        }
      };

      const result = {
        'all documents': [
          {
            x: new Date('2019-11-20T06:00:00.000Z'),
            y: 599.6374893188477
          },
          {
            x: new Date('2019-11-20T07:00:00.000Z'),
            y: 546.6338032313755
          }
        ]
      };

      expect(getDataFromResponse(esResponse)).toEqual(result);
    });
  });
});
