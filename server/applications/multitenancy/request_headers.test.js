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
import { ensureRawRequest } from '../../../../../src/core/server/http/router';
import {
  setupSearchGuardBackendMock,
  setupConfigMock,
  setupLoggerMock,
  setupSessionStorageFactoryMock,
  setupPluginDependenciesMock,
  setupHttpResponseMock,
  setupHttpToolkitMock,
  setupAuthInstanceMock,
} from '../../utils/mocks';

import {
  multiTenancyLifecycleHandler,
  getSelectedTenant,
  handleDefaultSpace,
} from './request_headers';

function setupConfigServiceMock() {
  return setupConfigMock({
    get: jest.fn((path) => {
      if (path === 'searchguard.multitenancy.enabled') return true;
      if (path === 'searchguard.multitenancy.tenants.enable_global') return false;
      if (path === 'searchguard.multitenancy.tenants.enable_private') return true;
      if (path === 'searchguard.multitenancy.tenants.preferred') return ['private'];
      if (path === 'searchguard.multitenancy.debug') return false;
    }),
  });
}

function setupGetElasticsearchMock({ clientAsScoped = jest.fn() } = {}) {
  return {
    client: {
      asScoped: clientAsScoped,
    },
  };
}

function setupSpacesMock({ spacesServiceScopedClient = jest.fn() } = {}) {
  return {
    spacesService: {
      scopedClient: spacesServiceScopedClient,
    },
  };
}

describe('request_headers', () => {
  describe('multiTenancyLifecycleHandler', () => {
    let authInstance;
    let response;
    let toolkit;
    let pluginDependencies;
    let getElasticsearch;
    let configService;
    let logger;

    beforeEach(() => {
      authInstance = setupAuthInstanceMock();
      response = setupHttpResponseMock();
      toolkit = setupHttpToolkitMock();
      pluginDependencies = setupPluginDependenciesMock();
      getElasticsearch = setupGetElasticsearchMock();
      configService = setupConfigServiceMock();
      logger = setupLoggerMock();
    });

    test('mt lifecycle handler assigns tenant to request headers', async () => {
      const sgtenant = 'admin_tenant';
      const sessionCookie = {
        username: 'admin',
        tenant: sgtenant,
      };
      const request = {
        headers: {},
        url: {
          pathname: '/app',
          searchParams: new URLSearchParams(),
        },
      };
      const authinfoResponse = {
        user: 'User [name=admin, backend_roles=[admin], requestedTenant=null]',
        user_name: 'admin',
        sg_tenants: { admin_tenant: true, admin: true, SGS_GLOBAL_TENANT: true },
      };

      const sessionStorageFactoryGet = jest.fn(() => sessionCookie);
      const sessionStorageFactory = setupSessionStorageFactoryMock({
        asScoped: jest.fn(() => ({
          get: sessionStorageFactoryGet,
        })),
      });

      const searchGuardBackend = setupSearchGuardBackendMock({
        authinfo: jest.fn().mockResolvedValue(authinfoResponse),
        validateTenant: jest.fn().mockReturnValue(sgtenant),
      });

      await multiTenancyLifecycleHandler({
        authInstance,
        searchGuardBackend,
        configService,
        sessionStorageFactory,
        logger,
        pluginDependencies,
        getElasticsearch,
      })(request, response, toolkit);

      expect(sessionStorageFactory.asScoped).toHaveBeenCalledWith(request);
      expect(sessionStorageFactoryGet).toHaveBeenCalledTimes(1);
      // Should happen if we have an authInstance
      expect(authInstance.getAllAuthHeaders).toHaveBeenCalledWith(request);
      // Internals of getSelectedTenant()
      expect(searchGuardBackend.authinfo).toHaveBeenCalledWith({ sgtenant });
      expect(searchGuardBackend.validateTenant).toHaveBeenCalledWith(
        authinfoResponse.user_name,
        sgtenant,
        authinfoResponse.sg_tenants,
        false,
        true
      );
      // If we have a selected tenant, the sgtenant header should be added to the request
      expect(request.headers.sgtenant).toEqual(sgtenant);
      expect(toolkit.next).toHaveBeenCalled();
    });

    test('add the default space when selected RO tenant', async () => {
      const sgtenant = 'admin_tenant';
      const sessionCookie = {
        username: 'admin',
        tenant: sgtenant,
      };
      const request = {
        headers: { sgtenant },
        url: {
          pathname: '/app',
          searchParams: new URLSearchParams(),
        },
      };
      const rawRequest = ensureRawRequest(cloneDeep(request));
      const isRWTenant = false;
      const authInfo = {
        sg_tenants: { [sgtenant]: isRWTenant },
      };
      const tenantInfo = {
        '.kibana_1100197146_pirates': 'Pirates',
        '.kibana_92668751_admin': '__private__',
        '.kibana_92668751_sgtenant': sgtenant,
      };

      const sessionStorageFactoryGet = jest.fn(() => sessionCookie);
      const sessionStorageFactory = setupSessionStorageFactoryMock({
        asScoped: jest.fn(() => ({
          get: sessionStorageFactoryGet,
        })),
      });

      const searchGuardBackend = setupSearchGuardBackendMock({
        validateTenant: jest.fn().mockReturnValue(sgtenant),
        authinfo: jest.fn().mockResolvedValue(authInfo),
        getTenantInfoWithInternalUser: jest.fn().mockResolvedValue(tenantInfo),
      });

      const clientAsScopedAsCurrentUserCreate = jest.fn();
      const clientAsScoped = jest.fn(() => ({
        asCurrentUser: {
          create: clientAsScopedAsCurrentUserCreate,
        },
      }));
      function getElasticsearch() {
        return {
          client: {
            asScoped: clientAsScoped,
          },
        };
      }

      const spacesClient = { get: jest.fn(() => null) };
      const spacesServiceScopedClient = jest.fn(() => spacesClient);
      pluginDependencies = { spaces: setupSpacesMock({ spacesServiceScopedClient }) };

      await multiTenancyLifecycleHandler({
        authInstance,
        searchGuardBackend,
        configService,
        sessionStorageFactory,
        logger,
        pluginDependencies,
        getElasticsearch,
      })(cloneDeep(request), response, toolkit);

      // Internals of handleDefaultSpace
      expect(spacesServiceScopedClient).toHaveBeenCalledWith(rawRequest);
      expect(searchGuardBackend.authinfo).toHaveBeenCalledWith(rawRequest.headers);
      expect(searchGuardBackend.getTenantInfoWithInternalUser).toHaveBeenCalled();
      expect(clientAsScoped).toHaveBeenCalledWith(request);
      expect(clientAsScopedAsCurrentUserCreate).toHaveBeenCalledWith({
        body: {
          space: {
            _reserved: true,
            color: '#00bfb3',
            description: 'This is your default space!',
            disabledFeatures: [],
            name: 'Default',
          },
          type: 'space',
          updated_at: expect.anything(),
        },
        id: 'space:default',
        index: '.kibana_92668751_sgtenant',
      });
      expect(toolkit.next).toHaveBeenCalled();
    });

    test('add the default space when RW tenant', async () => {
      const sgtenant = 'admin_tenant';
      const sessionCookie = {
        username: 'admin',
        tenant: sgtenant,
      };
      const request = {
        headers: { sgtenant },
        url: {
          pathname: '/app',
          searchParams: new URLSearchParams(),
        },
      };
      const rawRequest = ensureRawRequest(cloneDeep(request));
      const isRWTenant = true;
      const authInfo = {
        sg_tenants: { [sgtenant]: isRWTenant },
      };
      const tenantInfo = {
        '.kibana_1100197146_pirates': 'Pirates',
        '.kibana_92668751_admin': '__private__',
        '.kibana_92668751_sgtenant': sgtenant,
      };

      const sessionStorageFactoryGet = jest.fn(() => sessionCookie);
      const sessionStorageFactory = setupSessionStorageFactoryMock({
        asScoped: jest.fn(() => ({
          get: sessionStorageFactoryGet,
        })),
      });

      const searchGuardBackend = setupSearchGuardBackendMock({
        validateTenant: jest.fn().mockReturnValue(sgtenant),
        authinfo: jest.fn().mockResolvedValue(authInfo),
        getTenantInfoWithInternalUser: jest.fn().mockResolvedValue(tenantInfo),
      });

      const spacesClient = { get: jest.fn(() => null), create: jest.fn() };
      const spacesServiceScopedClient = jest.fn(() => spacesClient);
      pluginDependencies = { spaces: setupSpacesMock({ spacesServiceScopedClient }) };

      await multiTenancyLifecycleHandler({
        authInstance,
        searchGuardBackend,
        configService,
        sessionStorageFactory,
        logger,
        pluginDependencies,
        getElasticsearch,
      })(cloneDeep(request), response, toolkit);

      // Internals of handleDefaultSpace
      expect(spacesServiceScopedClient).toHaveBeenCalledWith(rawRequest);
      expect(searchGuardBackend.authinfo).toHaveBeenCalledWith(rawRequest.headers);
      expect(spacesClient.create).toHaveBeenCalledWith({
        _reserved: true,
        color: '#00bfb3',
        description: 'This is your default space!',
        disabledFeatures: [],
        id: 'default',
        name: 'Default',
      });
      expect(toolkit.next).toHaveBeenCalled();
    });
  });

  describe('getSelectedTenant', () => {
    let configService;
    let logger;

    beforeEach(() => {
      configService = setupConfigServiceMock();
      logger = setupLoggerMock();
    });

    test('tenant is read from the cookie and validated', async () => {
      const sgtenant = '__user__';
      const sessionCookie = {
        tenant: sgtenant,
      };
      const request = {
        headers: {
          cookie: 'searchguard_authentication=Fe26.2**925d29ddcc3aba',
        },
        url: {
          pathname: '/api/v1/searchguard/kibana_config',
          searchParams: new URLSearchParams(),
        },
      };
      const authHeaders = {
        authorization: 'Basic YWRtaW46YWRtaW4=',
      };
      const allAuthHeaders = {
        Authorization: 'Basic someValue',
      };
      const authinfoResponse = {
        user: 'User [name=admin, backend_roles=[admin], requestedTenant=null]',
        user_name: 'admin',
        sg_tenants: { admin_tenant: true, admin: true, SGS_GLOBAL_TENANT: true },
      };

      const searchGuardBackend = setupSearchGuardBackendMock({
        authinfo: jest.fn().mockResolvedValue(authinfoResponse),
        getAllAuthHeaders: jest.fn().mockReturnValue(allAuthHeaders),
        validateTenant: jest.fn().mockReturnValue('__user__'),
      });

      const sessionStorageFactoryGet = jest.fn(() => sessionCookie);
      const sessionStorageFactory = setupSessionStorageFactoryMock({
        asScoped: jest.fn(() => ({
          get: sessionStorageFactoryGet,
        })),
      });

      const selectedTenant = await getSelectedTenant({
        authHeaders: cloneDeep(authHeaders),
        request: cloneDeep(request),
        sessionCookie: cloneDeep(sessionCookie),
        searchGuardBackend,
        configService,
        sessionStorageFactory,
        logger,
      });

      expect(searchGuardBackend.authinfo).toHaveBeenCalledWith(authHeaders);
      expect(searchGuardBackend.validateTenant).toHaveBeenCalledWith(
        authinfoResponse.user_name,
        sgtenant,
        authinfoResponse.sg_tenants,
        false,
        true
      );
      expect(sessionStorageFactory.asScoped).toHaveBeenCalledTimes(0);
      expect(selectedTenant).toEqual(sgtenant);
    });

    test('cookie without tenant is updated with tenant preference', async () => {
      const sgtenant = 'admin_tenant';
      const sessionCookie = {
        tenant: null,
      };
      const request = {
        headers: {
          cookie: 'searchguard_authentication=Fe26.2**925d29ddcc3aba',
        },
        url: {
          pathname: '/api/v1/searchguard/kibana_config',
          searchParams: new URLSearchParams(),
        },
      };
      const authHeaders = {
        authorization: 'Basic YWRtaW46YWRtaW4=',
      };
      const authinfoResponse = {
        user: 'User [name=admin, backend_roles=[admin], requestedTenant=null]',
        user_name: 'admin',
        sg_tenants: { admin_tenant: true, admin: true, SGS_GLOBAL_TENANT: true },
      };

      const searchGuardBackend = setupSearchGuardBackendMock({
        authinfo: jest.fn().mockResolvedValue(authinfoResponse),
        getTenantByPreference: jest.fn().mockReturnValue('admin_tenant'),
      });

      const sessionStorageFactorySet = jest.fn();
      const sessionStorageFactoryGet = jest.fn(() => sessionCookie);
      const sessionStorageFactory = setupSessionStorageFactoryMock({
        asScoped: jest.fn(() => ({
          get: sessionStorageFactoryGet,
          set: sessionStorageFactorySet,
        })),
      });

      const selectedTenant = await getSelectedTenant({
        authHeaders: cloneDeep(authHeaders),
        request: cloneDeep(request),
        sessionCookie: cloneDeep(sessionCookie),
        searchGuardBackend,
        configService,
        sessionStorageFactory,
        logger,
      });

      expect(searchGuardBackend.authinfo).toHaveBeenCalledWith(authHeaders);
      expect(sessionStorageFactory.asScoped).toHaveBeenCalledWith(request);
      expect(sessionStorageFactorySet).toHaveBeenCalledWith({ tenant: sgtenant });
      expect(searchGuardBackend.validateTenant).toHaveBeenCalledTimes(0);
      expect(searchGuardBackend.getTenantByPreference).toHaveBeenCalledWith(
        request,
        authinfoResponse.user_name,
        authinfoResponse.sg_tenants,
        configService.get('searchguard.multitenancy.tenants.preferred'),
        false,
        true
      );
      expect(selectedTenant).toEqual(sgtenant);
    });
  });

  describe('handleDefaultSpace', () => {
    let pluginDependencies;
    let getElasticsearch;
    let logger;
    let searchGuardBackend;

    beforeEach(() => {
      pluginDependencies = setupPluginDependenciesMock();
      getElasticsearch = setupGetElasticsearchMock();
      logger = setupLoggerMock();
      searchGuardBackend = setupSearchGuardBackendMock();
    });

    test('skips default space check if spaces not enabled', async () => {
      const sgtenant = 'admin_tenant';
      const request = {
        headers: {
          cookie: 'searchguard_authentication=Fe26.2**925d29ddcc3aba',
        },
        url: {
          pathname: '/api/v1/searchguard/kibana_config',
          searchParams: new URLSearchParams(),
        },
      };
      const authHeaders = {
        authorization: 'Basic YWRtaW46YWRtaW4=',
      };

      const didHandleDefaultSpace = await handleDefaultSpace({
        request,
        authHeaders,
        selectedTenant: sgtenant,
        pluginDependencies,
        logger,
        searchGuardBackend,
        getElasticsearch,
      });

      // Internals of handleDefaultSpace
      expect(didHandleDefaultSpace).toEqual(false);
      expect(searchGuardBackend.authinfo).not.toHaveBeenCalled();
    });

    test('skips default space check if irrelevant path', async () => {
      const sgtenant = 'admin_tenant';
      const request = {
        headers: {
          sgtenant,
        },
        url: {
          pathname: '/irrelevant-path',
          searchParams: new URLSearchParams(),
        },
      };
      const authHeaders = {
        authorization: 'Basic YWRtaW46YWRtaW4=',
      };

      const didHandleDefaultSpace = await handleDefaultSpace({
        request,
        authHeaders,
        selectedTenant: sgtenant,
        pluginDependencies,
        logger,
        searchGuardBackend,
        getElasticsearch,
      });

      // Internals of handleDefaultSpace
      expect(didHandleDefaultSpace).toEqual(false);
      expect(searchGuardBackend.authinfo).not.toHaveBeenCalled();
    });

    test('skips default space check if we are on the global tenant', async () => {
      const sgtenant = '';
      const request = {
        headers: {
          cookie: 'searchguard_authentication=Fe26.2**925d29ddcc3aba',
        },
        url: {
          pathname: '/api/v1/searchguard/kibana_config',
          searchParams: new URLSearchParams(),
        },
      };
      const authHeaders = {
        authorization: 'Basic YWRtaW46YWRtaW4=',
      };

      const didHandleDefaultSpace = await handleDefaultSpace({
        request,
        authHeaders,
        selectedTenant: sgtenant,
        pluginDependencies,
        logger,
        searchGuardBackend,
        getElasticsearch,
      });

      // Internals of handleDefaultSpace
      expect(didHandleDefaultSpace).toEqual(false);
      expect(searchGuardBackend.authinfo).not.toHaveBeenCalled();
    });

    test('skips creation if default space exists', async () => {
      const sgtenant = 'admin_tenant';
      const request = {
        headers: {
          cookie: 'searchguard_authentication=Fe26.2**925d29ddcc3aba',
        },
        url: {
          pathname: '/api/v1/searchguard/kibana_config',
          searchParams: new URLSearchParams(),
        },
      };
      const authHeaders = {
        authorization: 'Basic YWRtaW46YWRtaW4=',
      };

      const spacesClient = { get: jest.fn(() => ({ someting: 'here' })) };
      const spacesServiceScopedClient = jest.fn(() => spacesClient);
      pluginDependencies = { spaces: setupSpacesMock({ spacesServiceScopedClient }) };

      const didHandleDefaultSpace = await handleDefaultSpace({
        request,
        authHeaders,
        selectedTenant: sgtenant,
        pluginDependencies,
        logger,
        searchGuardBackend,
        getElasticsearch,
      });

      // Internals of handleDefaultSpace
      expect(didHandleDefaultSpace).toEqual(false);
      expect(searchGuardBackend.authinfo).not.toHaveBeenCalled();
    });
  });
});
