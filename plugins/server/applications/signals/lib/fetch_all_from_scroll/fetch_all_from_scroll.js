/* eslint-disable @kbn/eslint/require-license-header */
import { get } from 'lodash';

export const fetchAllFromScroll = async ({ clusterClient, scroll, request, response }) => {
  let hits = get(response, 'hits.hits', []);
  let scrollId = get(response, '_scroll_id');
  const allHits = [...hits];

  if (hits.length) {
    while (true) {
      const promisedResp = await clusterClient.asScoped(request).callAsCurrentUser('scroll', {
        body: { scroll, scroll_id: scrollId },
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
