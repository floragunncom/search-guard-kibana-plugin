import {
  DEFAULT_DATEFIELD,
  INDEX,
  ES_SCROLL_SETTINGS
} from '../../../utils/constants';

export const buildAlertsESQuery = ({ query, gte, lte, order = 'desc' }) => {
  if (query.match_all) {
    delete query.match_all;
    query.bool = {
      must: [{ match_all: {} }]
    };
  }

  query.bool.must.push({
    range: {
      [DEFAULT_DATEFIELD]: { gte, lte }
    }
  });

  return {
    index: INDEX.ALERTS,
    scroll: ES_SCROLL_SETTINGS.KEEPALIVE,
    body: {
      size: ES_SCROLL_SETTINGS.PAGE_SIZE,
      sort: [
        {
          [DEFAULT_DATEFIELD]: order
        }
      ],
      query: query
    }
  };
};
