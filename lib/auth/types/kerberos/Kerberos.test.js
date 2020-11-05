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

import { cloneDeep } from 'lodash';
import { Kerberos as AuthClass, WWW_AUTHENTICATE_HEADER_NAME } from './Kerberos';
import {
  setupSearchGuardBackendMock,
  setupConfigMock,
  setupLoggerMock,
  setupHttpResponseMock,
  setupHttpToolkitMock,
} from '../../mocks';

describe(AuthClass.name, () => {
  test('handle request if the route path is in the whitelist', async () => {
    const logger = setupLoggerMock();
    const response = setupHttpResponseMock();
    const toolkit = setupHttpToolkitMock();

    const configGet = jest.fn((name) => {
      if (name === 'searchguard.auth.unauthenticated_routes') {
        return ['/api/status'];
      }
    });
    const config = setupConfigMock({ get: configGet });

    const authenticateWithHeaders = jest.fn().mockResolvedValue({
      _username: 'kerberos_kibana_admin',
    });
    const searchGuardBackend = setupSearchGuardBackendMock({ authenticateWithHeaders });

    const request = {
      route: { path: '/api/status' },
      headers: {},
    };

    const authInstance = new AuthClass({
      logger,
      config,
      searchGuardBackend,
    });

    await authInstance.checkAuth(cloneDeep(request), response, toolkit);

    // authInsance.authenticateWithSPNEGO
    expect(authenticateWithHeaders).not.toHaveBeenCalled();
    expect(toolkit.authenticated).toHaveBeenCalled();
  });

  test('handle authenticated request', async () => {
    const logger = setupLoggerMock();
    const response = setupHttpResponseMock();
    const toolkit = setupHttpToolkitMock();

    const configGet = jest.fn((name) => {
      if (name === 'searchguard.auth.unauthenticated_routes') {
        return ['/api/status'];
      }
      if (name === 'searchguard.auth.debug') {
        return false;
      }
    });
    const config = setupConfigMock({ get: configGet });

    const authenticateWithHeaders = jest.fn().mockResolvedValue({
      _username: 'kerberos_kibana_admin',
    });
    const searchGuardBackend = setupSearchGuardBackendMock({ authenticateWithHeaders });

    const request = {
      route: { path: 'path' },
      headers: {
        authorization: 'Negotiate a87421000492aa874209af8bc028',
        a: 1,
      },
    };

    const authInstance = new AuthClass({
      logger,
      config,
      searchGuardBackend,
    });

    await authInstance.checkAuth(cloneDeep(request), response, toolkit);

    // authInsance.authenticateWithSPNEGO
    expect(logger.debug).not.toHaveBeenCalled();
    expect(authenticateWithHeaders).toHaveBeenCalledWith({
      authorization: request.headers.authorization,
    });
    expect(toolkit.authenticated).toHaveBeenCalled();
  });

  describe('handle unauthenticated request', () => {
    let logger;
    let config;
    let response;
    let toolkit;
    let request;
    let configGet;

    beforeEach(() => {
      logger = setupLoggerMock();
      response = setupHttpResponseMock();
      toolkit = setupHttpToolkitMock();
      request = {
        route: { path: 'path' },
        headers: { a: 1 },
      };
      configGet = jest.fn(() => []);
      config = setupConfigMock({ get: configGet });
    });

    test('return error', async () => {
      const error = new Error('Invalid credentials.');
      error.statusCode = 401;

      const authenticateWithHeaders = jest.fn().mockRejectedValue(error);
      const searchGuardBackend = setupSearchGuardBackendMock({ authenticateWithHeaders });

      const authInstance = new AuthClass({
        logger,
        config,
        searchGuardBackend,
      });

      await authInstance.checkAuth(cloneDeep(request), response, toolkit);

      // authInsance.authenticateWithSPNEGO
      expect(authenticateWithHeaders).toHaveBeenCalledWith({});
      expect(response.unauthorized).toHaveBeenCalledWith({ body: error });
    });

    test('return the server proposal to negotiate Kerberos SPNEGO', async () => {
      const error = new Error('Invalid credentials.');
      error.statusCode = 401;
      error.inner = {
        output: {
          headers: {
            [WWW_AUTHENTICATE_HEADER_NAME]: 'Negotiate',
          },
        },
      };

      const backwardsCompatibilityError = new Error('Invalid credentials.');
      backwardsCompatibilityError.statusCode = 401;
      backwardsCompatibilityError.inner = {
        body: {
          error: {
            header: {
              [WWW_AUTHENTICATE_HEADER_NAME]: 'Negotiate',
            },
          },
        },
      };

      const errors = [error, backwardsCompatibilityError];

      for (const error of errors) {
        const authenticateWithHeaders = jest.fn().mockRejectedValue(error);
        const searchGuardBackend = setupSearchGuardBackendMock({ authenticateWithHeaders });

        const authInstance = new AuthClass({
          logger,
          config,
          searchGuardBackend,
        });

        await authInstance.checkAuth(cloneDeep(request), response, toolkit);

        // authInsance.authenticateWithSPNEGO
        expect(authenticateWithHeaders).toHaveBeenCalledWith({});
        expect(response.unauthorized).toHaveBeenCalledWith({
          headers: {
            [WWW_AUTHENTICATE_HEADER_NAME]: 'Negotiate',
          },
        });
      }
    });

    test('return the server proposal to do the basic authentication', async () => {
      const error = new Error('Unauthorized.');
      error.statusCode = 401;
      error.inner = {
        output: {
          headers: {
            [WWW_AUTHENTICATE_HEADER_NAME]: 'Basic realm="Authorization Required"',
          },
        },
      };

      const backwardsCompatibilityError = new Error('Unauthorized.');
      backwardsCompatibilityError.statusCode = 401;
      backwardsCompatibilityError.inner = {
        body: {
          error: {
            header: {
              [WWW_AUTHENTICATE_HEADER_NAME]: 'Basic realm="Authorization Required"',
            },
          },
        },
      };

      const errors = [error, backwardsCompatibilityError];

      for (const error of errors) {
        const authenticateWithHeaders = jest.fn().mockRejectedValue(error);
        const searchGuardBackend = setupSearchGuardBackendMock({ authenticateWithHeaders });

        const authInstance = new AuthClass({
          logger,
          config,
          searchGuardBackend,
        });

        await authInstance.checkAuth(cloneDeep(request), response, toolkit);

        // authInsance.authenticateWithSPNEGO
        expect(authenticateWithHeaders).toHaveBeenCalledWith({});
        expect(response.unauthorized).toHaveBeenCalledWith({
          headers: {
            [WWW_AUTHENTICATE_HEADER_NAME]: 'Basic realm="Authorization Required"',
          },
        });
      }
    });
  });
});
