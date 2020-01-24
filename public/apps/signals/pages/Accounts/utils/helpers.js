import { get } from 'lodash';

export const buildESQuery = query => {
  const must = get(query, 'bool.must', []);

  if (!!must.length) {
    const index = must.findIndex(clause => clause.simple_query_string);

    if (index !== -1) {
      query.bool.must[index].simple_query_string.fields = ['_name', 'type'];
      if (query.bool.must[index].simple_query_string.query.slice(-1) !== '*') {
        query.bool.must[index].simple_query_string.query += '*';
      }
    }
  }

  return query;
};
