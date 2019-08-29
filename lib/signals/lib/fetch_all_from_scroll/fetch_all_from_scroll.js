import { ES_SCROLL_SETTINGS } from '../../../../utils/signals/constants';

// TODO: add test
export function fetchAllFromScroll(response, callWithRequest, allHits = []) {
  const { _scroll_id: scrollId, hits: { hits = [] } } = response;

  if (hits.length) {
    allHits.push(...hits);

    return callWithRequest('scroll', {
      body: {
        scroll: ES_SCROLL_SETTINGS.KEEPALIVE,
        scroll_id: scrollId
      }
    }).then(_response => fetchAllFromScroll(_response, callWithRequest, allHits));
  }

  return Promise.resolve(allHits);
}
