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

import { AuthTokensService } from './AuthTokensService';

function setupHttpClientMock({
  mockPost = jest.fn(),
  mockGet = jest.fn(),
  mockDelete = jest.fn(),
} = {}) {
  return {
    get: mockGet,
    post: mockPost,
    delete: mockDelete,
  };
}

describe('AuthTokensService', () => {
  test('list', async () => {
    const mockHttpClientPost = jest.fn().mockResolvedValueOnce({ data: [{ a: 1 }] });
    const httpClient = setupHttpClientMock({ mockPost: mockHttpClientPost });
    const service = new AuthTokensService(httpClient);

    expect(await service.list()).toEqual([{ a: 1 }]);
    expect(mockHttpClientPost).toHaveBeenLastCalledWith(
      '../api/v1/searchguard_authtokens/authtoken/_search',
      {
        scroll: '30s',
        sort: [{ created_at: { order: 'desc' } }],
      }
    );
  });

  test('delete', async () => {
    const mockHttpClientDelete = jest.fn().mockResolvedValueOnce({ data: { statusCode: 200 } });
    const httpClient = setupHttpClientMock({ mockDelete: mockHttpClientDelete });
    const service = new AuthTokensService(httpClient);

    expect(await service.delete('a token')).toEqual({ statusCode: 200 });
    expect(mockHttpClientDelete).toHaveBeenLastCalledWith(
      '../api/v1/searchguard_authtokens/authtoken/a%20token'
    );
  });

  test('save', async () => {
    const mockHttpClientPost = jest.fn().mockResolvedValueOnce({ data: { statusCode: 200 } });
    const httpClient = setupHttpClientMock({ mockPost: mockHttpClientPost });
    const service = new AuthTokensService(httpClient);

    expect(await service.save({ a: 1 })).toEqual({ statusCode: 200 });
    expect(
      mockHttpClientPost
    ).toHaveBeenLastCalledWith('../api/v1/searchguard_authtokens/authtoken', { a: 1 });
  });

  test('get', async () => {
    const mockHttpClientGet = jest.fn().mockResolvedValueOnce({ data: { a: 1 } });
    const httpClient = setupHttpClientMock({ mockGet: mockHttpClientGet });
    const service = new AuthTokensService(httpClient);

    expect(await service.get('a token')).toEqual({ a: 1 });
    expect(mockHttpClientGet).toHaveBeenLastCalledWith(
      '../api/v1/searchguard_authtokens/authtoken/a%20token'
    );
  });

  test('isServiceEnabled', async () => {
    let mockHttpClientGet = jest.fn().mockResolvedValueOnce({ data: { enabled: true } });
    let httpClient = setupHttpClientMock({ mockGet: mockHttpClientGet });
    let service = new AuthTokensService(httpClient);

    expect(await service.isServiceEnabled()).toBe(true);
    expect(mockHttpClientGet).toHaveBeenLastCalledWith(
      '../api/v1/searchguard_authtokens/authtoken/_info'
    );

    mockHttpClientGet = jest.fn().mockResolvedValueOnce({ data: { enabled: false } });
    httpClient = setupHttpClientMock({ mockGet: mockHttpClientGet });
    service = new AuthTokensService(httpClient);

    expect(await service.isServiceEnabled()).toBe(false);
    expect(mockHttpClientGet).toHaveBeenLastCalledWith(
      '../api/v1/searchguard_authtokens/authtoken/_info'
    );

    mockHttpClientGet = jest.fn().mockResolvedValueOnce({});
    httpClient = setupHttpClientMock({ mockGet: mockHttpClientGet });
    service = new AuthTokensService(httpClient);

    expect(await service.isServiceEnabled()).toBe(false);
    expect(mockHttpClientGet).toHaveBeenLastCalledWith(
      '../api/v1/searchguard_authtokens/authtoken/_info'
    );
  });

  describe('hasUserPermissionsToAccessTheApp', () => {
    test('has permissions if resolved', async () => {
      const mockHttpClientPost = jest.fn().mockResolvedValueOnce();
      const httpClient = setupHttpClientMock({ mockPost: mockHttpClientPost });
      const service = new AuthTokensService(httpClient);

      expect(await service.hasUserPermissionsToAccessTheApp()).toBe(true);
      expect(mockHttpClientPost).toHaveBeenCalledWith(
        '../api/v1/searchguard_authtokens/authtoken/_search',
        {
          query: { match_all: {} },
          size: 0,
        }
      );
    });

    test('has permissions if rejected', async () => {
      const error = new Error('Unauthorized');
      error.body = { statusCode: 500 };

      const mockHttpClientPost = jest.fn().mockRejectedValueOnce(error);
      const httpClient = setupHttpClientMock({ mockPost: mockHttpClientPost });
      const service = new AuthTokensService(httpClient);

      expect(await service.hasUserPermissionsToAccessTheApp()).toBe(true);
      expect(mockHttpClientPost).toHaveBeenCalledWith(
        '../api/v1/searchguard_authtokens/authtoken/_search',
        {
          query: { match_all: {} },
          size: 0,
        }
      );
    });

    test('has NO permissions if rejected with HTTP 403', async () => {
      const error = new Error('Unauthorized');
      error.body = { statusCode: 403 };

      const mockHttpClientPost = jest.fn().mockRejectedValueOnce(error);
      const httpClient = setupHttpClientMock({ mockPost: mockHttpClientPost });
      const service = new AuthTokensService(httpClient);

      expect(await service.hasUserPermissionsToAccessTheApp()).toBe(false);
      expect(mockHttpClientPost).toHaveBeenCalledWith(
        '../api/v1/searchguard_authtokens/authtoken/_search',
        {
          query: { match_all: {} },
          size: 0,
        }
      );
    });
  });
});
