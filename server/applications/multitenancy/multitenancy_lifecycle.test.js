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

import { MultitenancyLifecycle } from './multitenancy_lifecycle';
import {
  setupSearchGuardBackendMock,
  setupConfigMock,
  setupLoggerMock,
  setupSessionStorageFactoryMock,
  setupHttpResponseMock,
  setupHttpToolkitMock,
  setupAuthInstanceMock,
} from '../../utils/mocks';

function setupConfigServiceMock() {
  return setupConfigMock({
    get: jest.fn((path) => {
      if (path === 'searchguard.multitenancy.enabled') return true;
      if (path === 'searchguard.multitenancy.tenants.enable_global') return false;
      if (path === 'searchguard.multitenancy.tenants.enable_private') return true;
      if (path === 'searchguard.multitenancy.tenants.preferred') return ['private'];
      if (path === 'searchguard.multitenancy.debug') return false;
      if (path === 'kibana.index') return '.kibana';
    }),
  });
}

function setupClusterClientMock({ elasticsearchClientAsScoped = jest.fn() } = {}) {
  return {
    asScoped: elasticsearchClientAsScoped,
  };
}

function setupForCreateDefaultSpace() {
  const elasticsearchClientAsScopedAsCurrentUserTransportRequest = jest
    .fn()
    .mockResolvedValueOnce();
  const elasticsearchClientAsScopedAsCurrentUserCreate = jest.fn();
  const elasticsearchClientAsScoped = jest.fn(() => ({
    asCurrentUser: {
      create: elasticsearchClientAsScopedAsCurrentUserCreate,
      transport: {
        request: elasticsearchClientAsScopedAsCurrentUserTransportRequest,
      },
    },
  }));
  const clusterClient = setupClusterClientMock({ elasticsearchClientAsScoped });

  return {
    elasticsearchClientAsScopedAsCurrentUserCreate,
    elasticsearchClientAsScopedAsCurrentUserTransportRequest,
    elasticsearchClientAsScoped,
    clusterClient,
  };
}

function setupForCreateDefaultSpace404() {
  const error404 = new Error('No default space');
  error404.meta = { statusCode: 404 };
  const elasticsearchClientAsScopedAsCurrentUserTransportRequest = jest
    .fn()
    .mockRejectedValueOnce(error404);
  const elasticsearchClientAsScopedAsCurrentUserCreate = jest.fn();
  const elasticsearchClientAsScoped = jest.fn(() => ({
    asCurrentUser: {
      create: elasticsearchClientAsScopedAsCurrentUserCreate,
      transport: {
        request: elasticsearchClientAsScopedAsCurrentUserTransportRequest,
      },
    },
  }));
  const clusterClient = setupClusterClientMock({ elasticsearchClientAsScoped });

  return {
    elasticsearchClientAsScopedAsCurrentUserCreate,
    elasticsearchClientAsScopedAsCurrentUserTransportRequest,
    elasticsearchClientAsScoped,
    clusterClient,
  };
}

function setupPluginDependenciesMock() {
  return { spaces: {} };
}

describe('MultitenancyLifecycle.onPreAuth', () => {
  let authInstance;
  let response;
  let toolkit;
  let configService;
  let logger;
  let pluginDependencies;

  let sgtenant;
  let sessionCookie;
  let request;
  let authinfoResponse;

  let sessionStorageFactoryGet;
  let sessionStorageFactory;
  let searchGuardBackend;

  beforeEach(() => {
    authInstance = setupAuthInstanceMock();
    response = setupHttpResponseMock();
    toolkit = setupHttpToolkitMock();
    configService = setupConfigServiceMock();
    logger = setupLoggerMock();
    pluginDependencies = setupPluginDependenciesMock();

    sgtenant = 'admin_tenant';
    sessionCookie = {
      username: 'admin',
      tenant: sgtenant, // there is tenant in cookie
    };
    request = {
      headers: {}, // there is no tenant in the headers
      url: {
        pathname: '/app',
      },
    };
    authinfoResponse = {
      user: 'User [name=admin, backend_roles=[admin], requestedTenant=null]',
      user_name: 'admin',
      sg_tenants: { admin_tenant: true, admin: true, SGS_GLOBAL_TENANT: true },
    };

    sessionStorageFactoryGet = jest.fn(() => sessionCookie);
    sessionStorageFactory = setupSessionStorageFactoryMock({
      asScoped: jest.fn(() => ({
        get: sessionStorageFactoryGet,
      })),
    });
    searchGuardBackend = setupSearchGuardBackendMock({
      authinfo: jest.fn().mockResolvedValue(authinfoResponse),
      validateTenant: jest.fn().mockReturnValue(sgtenant),
    });
  });

  test.skip('assign tenant to request headers and create the default space', async () => {
    const {
      elasticsearchClientAsScopedAsCurrentUserCreate,
      elasticsearchClientAsScopedAsCurrentUserTransportRequest,
      elasticsearchClientAsScoped,
      clusterClient,
    } = setupForCreateDefaultSpace404();

    const mtLifecycle = new MultitenancyLifecycle({
      authInstance,
      searchGuardBackend,
      configService,
      sessionStorageFactory,
      logger,
      clusterClient,
      pluginDependencies,
    });
    await mtLifecycle.onPreAuth(request, response, toolkit);

    expect(sessionStorageFactory.asScoped).toHaveBeenCalledWith({
      ...request,
      headers: {
        sgtenant,
      },
    });
    expect(sessionStorageFactoryGet).toHaveBeenCalledTimes(1);

    // Should happen if we have an authInstance
    expect(authInstance.getAllAuthHeaders).toHaveBeenCalledWith({
      ...request,
      headers: {
        sgtenant,
      },
    });

    // Internals of getSelectedTenant()
    expect(searchGuardBackend.authinfo).toHaveBeenCalledWith({ sgtenant });
    expect(searchGuardBackend.validateTenant).toHaveBeenCalledWith(
      authinfoResponse.user_name,
      'admin_tenant',
      authinfoResponse.sg_tenants,
      false,
      true
    );

    // If we have a selected tenant, the sgtenant header should be added to the request
    expect(request.headers.sgtenant).toEqual(sgtenant);

    // Create the default space
    expect(elasticsearchClientAsScoped).toHaveBeenCalledTimes(2);
    expect(elasticsearchClientAsScoped).toHaveBeenCalledWith({
      ...request,
      headers: {
        sgtenant,
      },
    });
    expect(elasticsearchClientAsScopedAsCurrentUserTransportRequest).toHaveBeenCalledWith({
      method: 'get',
      path: '/.kibana/_doc/space:default',
    });
    expect(elasticsearchClientAsScopedAsCurrentUserCreate).toHaveBeenCalledWith({
      body: {
        space: {
          _reserved: true,
          color: '#00bfb3',
          description: 'This is your default space!',
          disabledFeatures: [],
          name: 'Default',
        },
        type: 'space',
        updated_at: expect.any(String),
      },
      id: 'space:default',
      index: '.kibana',
      refresh: true,
    });

    expect(toolkit.next).toHaveBeenCalled();
  });

  test('do not create the default space if exists', async () => {
    const {
      elasticsearchClientAsScopedAsCurrentUserCreate,
      elasticsearchClientAsScopedAsCurrentUserTransportRequest,
      elasticsearchClientAsScoped,
      clusterClient,
    } = setupForCreateDefaultSpace();

    const mtLifecycle = new MultitenancyLifecycle({
      authInstance,
      searchGuardBackend,
      configService,
      sessionStorageFactory,
      logger,
      clusterClient,
      pluginDependencies,
    });
    await mtLifecycle.onPreAuth(request, response, toolkit);

    expect(elasticsearchClientAsScoped).toHaveBeenCalledTimes(1);
    expect(elasticsearchClientAsScoped).toHaveBeenCalledWith({
      ...request,
      headers: {
        sgtenant,
      },
    });
    expect(elasticsearchClientAsScopedAsCurrentUserTransportRequest).toHaveBeenCalledWith({
      method: 'get',
      path: '/.kibana/_doc/space:default',
    });
    expect(elasticsearchClientAsScopedAsCurrentUserCreate).toHaveBeenCalledTimes(0);
  });

  test('do not create the default space if Kibana spaces plugin disabled', async () => {
    pluginDependencies = {};
    const {
      elasticsearchClientAsScopedAsCurrentUserCreate,
      elasticsearchClientAsScopedAsCurrentUserTransportRequest,
      clusterClient,
    } = setupForCreateDefaultSpace();

    const mtLifecycle = new MultitenancyLifecycle({
      authInstance,
      searchGuardBackend,
      configService,
      sessionStorageFactory,
      logger,
      clusterClient,
      pluginDependencies,
    });
    await mtLifecycle.onPreAuth(request, response, toolkit);

    expect(elasticsearchClientAsScopedAsCurrentUserTransportRequest).toHaveBeenCalledTimes(0);
    expect(elasticsearchClientAsScopedAsCurrentUserCreate).toHaveBeenCalledTimes(0);
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

    const { clusterClient } = setupForCreateDefaultSpace();

    const mtLifecycle = new MultitenancyLifecycle({
      authInstance,
      searchGuardBackend,
      configService,
      sessionStorageFactory,
      logger,
      clusterClient,
      pluginDependencies,
    });

    const selectedTenant = await mtLifecycle.getSelectedTenant({
      authHeaders,
      request,
      sessionCookie,
    });

    expect(searchGuardBackend.authinfo).toHaveBeenCalledWith(authHeaders);
    expect(searchGuardBackend.validateTenant).toHaveBeenCalledWith(
      authinfoResponse.user_name,
      sgtenant,
      authinfoResponse.sg_tenants,
      false,
      true
    );
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

    const { clusterClient } = setupForCreateDefaultSpace();

    const mtLifecycle = new MultitenancyLifecycle({
      authInstance,
      searchGuardBackend,
      configService,
      sessionStorageFactory,
      logger,
      clusterClient,
      pluginDependencies,
    });

    const selectedTenant = await mtLifecycle.getSelectedTenant({
      authHeaders,
      request,
      sessionCookie,
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
