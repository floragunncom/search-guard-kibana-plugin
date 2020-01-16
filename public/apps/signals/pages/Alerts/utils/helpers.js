import { get } from 'lodash';
import { DEFAULT_DATEFIELD } from '../../../utils/constants';

export const SIMPLE_QUERY_FIELDS = [
  'watch_id^3',
  'tenant',
  'status.code',
  'status.detail',
  'node',
  'actions.name',
  'actions.status.code',
  'actions.status.detail',
  'actions.error.message',
];

export const buildESQuery = ({ query, gte, lte, watchId }) => {
  if (query.match_all) {
    delete query.match_all;
    query.bool = {
      must: [{ match_all: {} }],
    };
  }

  if (watchId) {
    query.bool.must.push({
      term: {
        'watch_id.keyword': {
          value: watchId,
        },
      },
    });
  }

  query.bool.must.push({
    range: {
      [DEFAULT_DATEFIELD]: { gte, lte },
    },
  });

  const must = get(query, 'bool.must', []);

  if (!!must.length) {
    const index = must.findIndex(clause => clause.simple_query_string);

    if (index !== -1) {
      query.bool.must[index].simple_query_string.fields = SIMPLE_QUERY_FIELDS;
      if (query.bool.must[index].simple_query_string.query.slice(-1) !== '*') {
        query.bool.must[index].simple_query_string.query += '*';
      }
    }
  }

  return query;
};
