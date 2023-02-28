/*
 * Copyright 2023 Excelerate Technology Limited T/A Eliatra
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 *
 * *    Copyright 2020 floragunn GmbH
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

import {
  setupLoggerMock,
  setupHttpResponseMock,
  setupContextMock,
  setupClusterClientMock,
} from '../../utils/mocks';
import { getAuthTokens } from './routes';

describe('security/configuration/routes', () => {
  describe('getAuthTokens', () => {
    test('get auth tokens with ES query DSL', async () => {
      const logger = setupLoggerMock();
      const response = setupHttpResponseMock();
      const context = setupContextMock();

      const firstResponse = {
        body: {
          hits: {
            hits: [
              {
                _id: '123',
                _source: {
                  token_name: 'token_1',
                  user_name: 'user',
                  expires_at: 1610733506000,
                },
              },
              {
                _id: '456',
                _source: {
                  token_name: 'token_2',
                  user_name: 'user',
                  expires_at: 1610733506000,
                },
              },
            ],
          },
        },
      };

      const asCurrentUserTransportRequest = jest.fn().mockResolvedValueOnce(firstResponse);
      const fetchAllFromScroll = jest.fn();
      const clusterClient = setupClusterClientMock({ asCurrentUserTransportRequest });

      const request = {
        body: { query: { match_all: {} }, size: 0 },
        headers: {},
      };

      await getAuthTokens({ clusterClient, fetchAllFromScroll, logger })(
        context,
        request,
        response
      );

      const expectedPath = '/_eliatra/security/authtoken/_search';
      const expectedResponse = [
        {
          _id: '123',
          token_name: 'token_1',
          user_name: 'user',
          expires_at: 1610733506000,
        },
        {
          _id: '456',
          token_name: 'token_2',
          user_name: 'user',
          expires_at: 1610733506000,
        },
      ];
      const expectedBody = { query: { match_all: {} }, size: 0 };

      expect(clusterClient.asScoped).toHaveBeenCalledWith({
        body: expectedBody,
        headers: {},
      });
      expect(asCurrentUserTransportRequest).toHaveBeenCalledWith({
        method: 'post',
        path: expectedPath,
        body: expectedBody,
      });
      expect(fetchAllFromScroll).toHaveBeenCalledTimes(0);
      expect(response.ok).toHaveBeenCalledWith({ body: expectedResponse });
    });

    test('get ALL auth tokens with ES query DSL and scroll', async () => {
      const logger = setupLoggerMock();
      const response = setupHttpResponseMock();
      const context = setupContextMock();

      const firstResponse = {
        body: {
          _scroll_id: 'FGluY2x1ZGVfY',
          hits: {
            hits: [
              {
                _id: '123',
                _source: {
                  token_name: 'token_1',
                  user_name: 'user',
                  expires_at: 1610733506000,
                },
              },
              {
                _id: '456',
                _source: {
                  token_name: 'token_2',
                  user_name: 'user',
                  expires_at: 1610733506000,
                },
              },
            ],
          },
        },
      };
      const secondResponse = [...firstResponse.body.hits.hits];

      const asCurrentUserTransportRequest = jest.fn().mockResolvedValueOnce(firstResponse);
      const fetchAllFromScroll = jest.fn().mockResolvedValue(secondResponse);
      const clusterClient = setupClusterClientMock({ asCurrentUserTransportRequest });

      const request = {
        body: {
          query: { match_all: {} },
          scroll: '30s',
          sort: [{ created_at: { order: 'desc' } }],
        },
        headers: {},
      };

      await getAuthTokens({ clusterClient, fetchAllFromScroll, logger })(
        context,
        request,
        response
      );

      const expectedPath = `/_eliatra/security/authtoken/_search?scroll=${request.body.scroll}`;
      const expectedFetchAllFromScrollOptions = {
        clusterClient,
        scroll: request.body.scroll,
        request,
        response: firstResponse.body,
      };
      const expectedResponse = [
        {
          _id: '123',
          token_name: 'token_1',
          user_name: 'user',
          expires_at: 1610733506000,
        },
        {
          _id: '456',
          token_name: 'token_2',
          user_name: 'user',
          expires_at: 1610733506000,
        },
      ];
      const expectedBody = {
        query: { match_all: {} },
        sort: [{ created_at: { order: 'desc' } }],
      };

      expect(clusterClient.asScoped).toHaveBeenCalledWith({
        body: { ...expectedBody, scroll: request.body.scroll },
        headers: {},
      });
      expect(asCurrentUserTransportRequest).toHaveBeenCalledWith({
        method: 'post',
        path: expectedPath,
        body: expectedBody,
      });
      expect(fetchAllFromScroll).toHaveBeenCalledWith(expectedFetchAllFromScrollOptions);
      expect(response.ok).toHaveBeenCalledWith({ body: expectedResponse });
    });

    test('there is an error', async () => {
      const logger = setupLoggerMock();
      const response = setupHttpResponseMock();
      const context = setupContextMock();
      const error = new Error('nasty!');

      const asCurrentUserTransportRequest = jest.fn().mockRejectedValue(error);
      const fetchAllFromScroll = jest.fn();
      const clusterClient = setupClusterClientMock({ asCurrentUserTransportRequest });

      const request = {
        headers: {},
        body: {},
      };

      await getAuthTokens({ clusterClient, fetchAllFromScroll, logger })(
        context,
        request,
        response
      );

      expect(asCurrentUserTransportRequest).toHaveBeenCalledTimes(1);
      expect(fetchAllFromScroll).toHaveBeenCalledTimes(0);
      expect(logger.error).toHaveBeenCalledWith(`getAuthTokens: ${error.stack}`);
      expect(response.customError).toHaveBeenCalledWith({
        body: {
          message: 'nasty!',
        },
        statusCode: 500,
      });
    });
  });
});
