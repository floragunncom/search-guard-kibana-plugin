import { ES_SCROLL_SETTINGS } from '../../../../utils/signals/constants';

interface Response {
  _scroll_id: string;
  hits: {
    hits: object[];
  };
}

export const fetchAllFromScroll = async (
  response: Response,
  callWithRequest: Function,
  allHits: object[] = []
): Promise<object[]> => {
  const { _scroll_id: scrollId, hits: { hits = [] } = {} } = response;

  if (hits.length) {
    allHits.push(...hits);

    let scrollResp: Response;
    try {
      scrollResp = await callWithRequest('scroll', {
        body: {
          scroll: ES_SCROLL_SETTINGS.KEEPALIVE,
          scroll_id: scrollId,
        },
      });
    } catch (err) {
      throw err;
    }

    return fetchAllFromScroll(scrollResp, callWithRequest, allHits);
  }

  return allHits;
};
