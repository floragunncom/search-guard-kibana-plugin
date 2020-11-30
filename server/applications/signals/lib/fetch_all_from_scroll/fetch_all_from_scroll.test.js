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

import { fetchAllFromScroll } from './fetch_all_from_scroll';
import { setupClusterClientMock } from '../../../../utils/mocks';

describe('fetch_all_from_scroll', () => {
  test('return empty array if no hits', async () => {
    const mockResponse = {};
    const clusterClient = setupClusterClientMock();

    const scroll = '30s';
    const request = { a: 1 };

    const hits = await fetchAllFromScroll({
      clusterClient,
      response: mockResponse,
      scroll,
      request,
    });

    expect(clusterClient.asScoped).toHaveBeenCalledTimes(0);
    expect(hits).toEqual([]);
  });

  test('return the hits and scroll until there are no hits', async () => {
    const asCurrentUserScroll = jest.fn().mockResolvedValueOnce({
      body: {
        hits: { hits: ['z'] },
        _scroll_id: '2nd',
      },
    });
    asCurrentUserScroll.mockResolvedValue({
      body: {
        hits: { hits: [] },
        _scroll_id: '3rd',
      },
    });
    const clusterClient = setupClusterClientMock({ asCurrentUserScroll });

    const scroll = '30s';
    const request = { a: 1 };

    const hits = await fetchAllFromScroll({
      clusterClient,
      response: {
        hits: { hits: ['x', 'y'] },
        _scroll_id: '1st',
      },
      scroll,
      request,
    });

    expect(clusterClient.asScoped).toHaveBeenCalledTimes(2);
    expect(clusterClient.asScoped).toHaveBeenCalledWith(request);
    expect(hits).toEqual(['x', 'y', 'z']);
  });
});
