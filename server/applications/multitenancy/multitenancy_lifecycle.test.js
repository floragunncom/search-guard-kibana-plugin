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

import { MultitenancyLifecycle } from './multitenancy_lifecycle';
import {
  setupeliatraSuiteBackendMock,
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
      if (path === 'eliatra.security.multitenancy.enabled') return true;
      if (path === 'eliatra.security.multitenancy.tenants.enable_global') return false;
      if (path === 'eliatra.security.multitenancy.tenants.enable_private') return true;
      if (path === 'eliatra.security.multitenancy.tenants.preferred') return ['private'];
      if (path === 'eliatra.security.multitenancy.debug') return false;
      if (path === 'opensearchDashboards.index') return '.kibana';
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

  let sp_tenant;
  let sessionCookie;
  let request;
  let authinfoResponse;

  let sessionStorageFactoryGet;
  let sessionStorageFactory;
  let eliatraSuiteBackend;

  beforeEach(() => {
    authInstance = setupAuthInstanceMock();
    response = setupHttpResponseMock();
    toolkit = setupHttpToolkitMock();
    configService = setupConfigServiceMock();
    logger = setupLoggerMock();
    pluginDependencies = setupPluginDependenciesMock();

    sp_tenant = 'admin_tenant';
    sessionCookie = {
      username: 'admin',
      tenant: sp_tenant, // there is tenant in cookie
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
      effective_tenants: { admin_tenant: true, admin: true, GLOBAL_TENANT: true },
    };

    sessionStorageFactoryGet = jest.fn(() => sessionCookie);
    sessionStorageFactory = setupSessionStorageFactoryMock({
      asScoped: jest.fn(() => ({
        get: sessionStorageFactoryGet,
      })),
    });
    eliatraSuiteBackend = setupeliatraSuiteBackendMock({
      authinfo: jest.fn().mockResolvedValue(authinfoResponse),
      validateTenant: jest.fn().mockReturnValue(sp_tenant),
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
      eliatraSuiteBackend,
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
        sp_tenant,
      },
    });
    expect(sessionStorageFactoryGet).toHaveBeenCalledTimes(1);

    // Should happen if we have an authInstance
    expect(authInstance.getAllAuthHeaders).toHaveBeenCalledWith({
      ...request,
      headers: {
        sp_tenant,
      },
    });

    // Internals of getSelectedTenant()
    expect(eliatraSuiteBackend.authinfo).toHaveBeenCalledWith({ sp_tenant });
    expect(eliatraSuiteBackend.validateTenant).toHaveBeenCalledWith(
      authinfoResponse.user_name,
      'admin_tenant',
      authinfoResponse. effective_tenants,
      false,
      true
    );

    // If we have a selected tenant, the sp_tenant header should be added to the request
    expect(request.headers.sp_tenant).toEqual(sp_tenant);

    // Create the default space
    expect(elasticsearchClientAsScoped).toHaveBeenCalledTimes(2);
    expect(elasticsearchClientAsScoped).toHaveBeenCalledWith({
      ...request,
      headers: {
        sp_tenant,
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

  test('tenant is read from the cookie and validated', async () => {
    const sp_tenant = '__user__';
    const sessionCookie = {
      tenant: sp_tenant,
    };
    const request = {
      headers: {
        cookie: 'eliatra_security_authentication=Fe26.2**925d29ddcc3aba',
      },
      url: {
        pathname: '/api/v1/security/kibana_config',
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
       effective_tenants: { admin_tenant: true, admin: true, GLOBAL_TENANT: true },
    };

    const eliatraSuiteBackend = setupeliatraSuiteBackendMock({
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
      eliatraSuiteBackend,
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

    expect(eliatraSuiteBackend.authinfo).toHaveBeenCalledWith(authHeaders);
    expect(eliatraSuiteBackend.validateTenant).toHaveBeenCalledWith(
      authinfoResponse.user_name,
      sp_tenant,
      authinfoResponse. effective_tenants,
      false,
      true
    );
    expect(selectedTenant).toEqual(sp_tenant);
  });

  test('cookie without tenant is updated with tenant preference', async () => {
    const sp_tenant = 'admin_tenant';
    const sessionCookie = {
      tenant: null,
    };
    const request = {
      headers: {
        cookie: 'eliatra_security_authentication=Fe26.2**925d29ddcc3aba',
      },
      url: {
        pathname: '/api/v1/security/kibana_config',
      },
    };
    const authHeaders = {
      authorization: 'Basic YWRtaW46YWRtaW4=',
    };
    const authinfoResponse = {
      user: 'User [name=admin, backend_roles=[admin], requestedTenant=null]',
      user_name: 'admin',
       effective_tenants: { admin_tenant: true, admin: true, GLOBAL_TENANT: true },
    };

    const eliatraSuiteBackend = setupeliatraSuiteBackendMock({
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
      eliatraSuiteBackend,
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

    expect(eliatraSuiteBackend.authinfo).toHaveBeenCalledWith(authHeaders);
    expect(sessionStorageFactory.asScoped).toHaveBeenCalledWith(request);
    expect(sessionStorageFactorySet).toHaveBeenCalledWith({ tenant: sp_tenant });
    expect(eliatraSuiteBackend.validateTenant).toHaveBeenCalledTimes(0);
    expect(eliatraSuiteBackend.getTenantByPreference).toHaveBeenCalledWith(
      request,
      authinfoResponse.user_name,
      authinfoResponse. effective_tenants,
      configService.get('eliatra.security.multitenancy.tenants.preferred'),
      false,
      true
    );
    expect(selectedTenant).toEqual(sp_tenant);
  });
});
