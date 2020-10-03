/*
 *    Copyright 2020 floragunn GmbH
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
