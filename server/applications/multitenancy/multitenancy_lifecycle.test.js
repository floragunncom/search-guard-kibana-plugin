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
import { SpacesService } from './spaces_service';
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
  let clusterClient;

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
        searchParams: new URLSearchParams(),
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
    clusterClient = setupClusterClientMock();
  });

  test('assign tenant to request headers and create the default space', async () => {
    const spacesService = new SpacesService({ clusterClient, logger, configService });
    spacesService.createDefaultSpace = jest.fn();

    const mtLifecycle = new MultitenancyLifecycle({
      authInstance,
      searchGuardBackend,
      configService,
      sessionStorageFactory,
      logger,
      pluginDependencies,
      spacesService,
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
    expect(spacesService.createDefaultSpace).toHaveBeenLastCalledWith({
      request: {
        headers: {
          sgtenant: 'admin_tenant',
        },
        url: {
          pathname: '/app',
          searchParams: new URLSearchParams(),
        },
      },
      selectedTenant: 'admin_tenant',
    });

    expect(toolkit.next).toHaveBeenCalled();
  });

  test('do not create the default space if Kibana spaces plugin disabled', async () => {
    const spacesService = new SpacesService({ clusterClient, logger, configService });
    spacesService.createDefaultSpace = jest.fn();
    pluginDependencies = {};

    const mtLifecycle = new MultitenancyLifecycle({
      authInstance,
      searchGuardBackend,
      configService,
      sessionStorageFactory,
      logger,
      pluginDependencies,
      spacesService,
    });
    await mtLifecycle.onPreAuth(request, response, toolkit);

    expect(spacesService.createDefaultSpace).toHaveBeenCalledTimes(0);
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

    const spacesService = new SpacesService({ clusterClient, logger, configService });
    spacesService.createDefaultSpace = jest.fn();

    const mtLifecycle = new MultitenancyLifecycle({
      authInstance,
      searchGuardBackend,
      configService,
      sessionStorageFactory,
      logger,
      pluginDependencies,
      spacesService,
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

    const spacesService = new SpacesService({ clusterClient, logger, configService });
    spacesService.createDefaultSpace = jest.fn();

    const mtLifecycle = new MultitenancyLifecycle({
      authInstance,
      searchGuardBackend,
      configService,
      sessionStorageFactory,
      logger,
      pluginDependencies,
      spacesService,
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
