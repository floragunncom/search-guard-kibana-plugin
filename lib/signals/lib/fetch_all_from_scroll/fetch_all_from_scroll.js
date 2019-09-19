import { ES_SCROLL_SETTINGS } from '../../../../utils/signals/constants';

export const fetchAllFromScroll = async (response, callWithRequest, allHits = []) => {
  const { _scroll_id: scrollId, hits: { hits = [] } = {} } = response;

  if (hits.length) {
    allHits.push(...hits);

    let scrollResp;
    try {
      scrollResp = await callWithRequest('scroll', {
        body: {
          scroll: ES_SCROLL_SETTINGS.KEEPALIVE,
          scroll_id: scrollId
        }
      });
    } catch (err) {
      throw err;
    }

    return fetchAllFromScroll(scrollResp, callWithRequest, allHits);
  }

  return allHits;
};
