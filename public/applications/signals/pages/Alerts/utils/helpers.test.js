import { buildESQuery, SIMPLE_QUERY_FIELDS } from './helpers';

describe('buildESQuery', () => {
  test('can enrich ES query', () => {
    const input = {
      query: {
        match_all: {},
      },
      gte: 'now-30m',
      lte: 'now',
      watchId: 'jirawatch',
    };

    const output = {
      bool: {
        must: [
          {
            match_all: {},
          },
          {
            term: {
              'watch_id.keyword': {
                value: 'jirawatch',
              },
            },
          },
          {
            range: {
              execution_end: {
                gte: 'now-30m',
                lte: 'now',
              },
            },
          },
        ],
      },
    };

    expect(buildESQuery(input)).toEqual(output);
  });

  test('can enrich ES query if match_all', () => {
    const input = {
      query: {
        bool: {
          must: [
            {
              simple_query_string: {
                query: 'failed',
              },
            },
          ],
        },
      },
      gte: 'now-15d',
      lte: 'now',
      watchId: 'jirawatch',
    };

    const output = {
      bool: {
        must: [
          {
            simple_query_string: {
              fields: SIMPLE_QUERY_FIELDS,
              query: 'failed*',
            },
          },
          {
            term: {
              'watch_id.keyword': {
                value: 'jirawatch',
              },
            },
          },
          {
            range: {
              execution_end: {
                gte: 'now-15d',
                lte: 'now',
              },
            },
          },
        ],
      },
    };

    expect(buildESQuery(input)).toEqual(output);
  });
});
