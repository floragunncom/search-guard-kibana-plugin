import { get } from 'lodash';
import { ES_SCROLL_SETTINGS } from '../../../../utils/signals/constants';

export const fetchAllFromScroll = async (resp, callWithRequest) => {
  let hits = get(resp, 'hits.hits', []);
  let scrollId = get(resp, '_scroll_id');
  const allHits = [...hits];

  if (hits.length) {
    while (true) {
      const promisedResp = await callWithRequest('scroll', {
        body: {
          scroll: ES_SCROLL_SETTINGS.KEEPALIVE,
          scroll_id: scrollId
        }
      });

      hits = get(promisedResp, 'hits.hits', []);
      if (!hits.length) {
        return allHits;
      }

      scrollId = get(promisedResp, '_scroll_id');
      allHits.push(...hits);
    }
  }

  return allHits;
};
