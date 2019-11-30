import { cloneDeep } from 'lodash';
import {
  DEFAULT_DATEFIELD,
  INDEX,
  ES_SCROLL_SETTINGS
} from '../../../utils/constants';

export const buildAlertsESQuery = ({ query, gte, lte, order = 'desc', watchId }) => {
  console.log('buildAlertsESQuery -- args', { query, gte, lte, order, watchId });
  const boolQuery = cloneDeep(query);

  if (boolQuery.match_all) {
    delete boolQuery.match_all;
    boolQuery.bool = {
      must: [{ match_all: {} }]
    };
  }

  if (watchId) {
    boolQuery.bool.must.push({
      term: {
        'watch_id.keyword': {
          value: watchId
        }
      }
    });
  }

  boolQuery.bool.must.push({
    range: {
      [DEFAULT_DATEFIELD]: { gte, lte }
    }
  });

  console.log('es query res', {
    index: INDEX.ALERTS,
    scroll: ES_SCROLL_SETTINGS.KEEPALIVE,
    body: {
      size: ES_SCROLL_SETTINGS.PAGE_SIZE,
      sort: [
        {
          [DEFAULT_DATEFIELD]: order
        }
      ],
      query: boolQuery
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
      query: boolQuery
    }
  };
};
