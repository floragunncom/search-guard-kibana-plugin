/*
 *    Copyright 2021 floragunn GmbH
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

import { redirectOnSessionTimeout } from './redirectOnSessionTimeout';

describe('redirectOnSessionTimeout', () => {
  const originalWindow = global.window;

  afterEach(() => {
    global.window = originalWindow;
  });

  it('does not redirect 401 responses while already on the Search Guard login page', async () => {
    global.window = {
      location: {
        href: 'https://localhost:5601/searchguard/login?nextUrl=/',
        origin: 'https://localhost:5601',
        pathname: '/searchguard/login',
      },
    };

    let responseError;
    const coreHttp = {
      basePath: {
        remove: jest.fn((path) => path),
      },
      intercept: jest.fn((interceptor) => {
        responseError = interceptor.responseError;
      }),
    };
    const controller = { halt: jest.fn() };
    const headers = { get: jest.fn(() => '/searchguard/login') };

    redirectOnSessionTimeout('basicauth', coreHttp);
    await responseError({ body: { statusCode: 401 }, response: { headers } }, controller);

    expect(headers.get).not.toHaveBeenCalled();
    expect(controller.halt).not.toHaveBeenCalled();
    expect(global.window.location.href).toBe(
      'https://localhost:5601/searchguard/login?nextUrl=/'
    );
  });
});
