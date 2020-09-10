import SearchGuardBackend from './searchguard';
import { setupElasticsearchPluginMock, setupHapiConfigMock } from '../utils/mocks';

jest.mock('./searchguard_plugin');

function setupEsConfigMock() {
  return {};
}

describe('backend/searchguard SearchGuardBackend', () => {
  test('constructor', () => {
    const esConfig = setupEsConfigMock();

    const mockGetImplementation = jest.fn().mockImplementation((path) => {
      if (path === 'elasticsearch') {
        return { enabled: true };
      }
    });

    const server = {
      config: setupHapiConfigMock({ mockGetImplementation }),
      plugins: {
        elasticsearch: setupElasticsearchPluginMock(),
      },
    };

    const sgb = new SearchGuardBackend(server, null, esConfig);

    expect(server.config).toHaveBeenCalled();
    expect(mockGetImplementation).toHaveBeenCalledWith('elasticsearch');
    expect(server.plugins.elasticsearch.createCluster.mock.calls[0][0]).toBe('searchguard');
    expect(server.plugins.elasticsearch.createCluster.mock.calls[0][1].auth).toBe(true);
    expect(server.plugins.elasticsearch.createCluster.mock.calls[0][1].enabled).toBe(true);
    expect(server.plugins.elasticsearch.createCluster.mock.calls[0][1].plugins[0].name).toBe('searchGuardPlugin');
  });

  test('authtoken, get credentials', async () => {
    const esConfig = setupEsConfigMock();

    const credentials = {
      authorization: 'bearer eyJhbGciOiJIUzUxMiJ9',
    };

    const mockClusterClient = {
      callWithRequest: jest.fn().mockResolvedValue(credentials),
    };

    const server = {
      config: setupHapiConfigMock(),
      plugins: {
        elasticsearch: setupElasticsearchPluginMock({ mockClusterClientImplementation: mockClusterClient }),
      },
    };

    const requestId = 'ONELOGIN_8fa21a4c-e44a-4123-94c8-c7eaef6a1a49';
    const responseOfSAML = 'PHNhbWxwOlJlc3BvbnNlIHhtbG5zOnN';
    const acsEndpoint = null;

    const sgb = new SearchGuardBackend(server, null, esConfig);
    const result = await sgb.authtoken(requestId, responseOfSAML, acsEndpoint);
    
    expect(mockClusterClient.callWithRequest)
      .toHaveBeenCalledWith(
        {},
        'searchguard.authtoken',
        {
          body: {
            RequestId: requestId,
            SAMLResponse: responseOfSAML,
            acsEndpoint: acsEndpoint,
          },
        },
        undefined
      );

    expect(result).toEqual(credentials);
  });

  describe('authenticateWithHeader', () => {
    test('handle error', async () => {
      const esConfig = setupEsConfigMock();
      esConfig.requestHeadersWhitelist = [];

      const error = new Error('nasty!');
      const mockClusterClient = {
        callWithRequest: jest.fn().mockRejectedValue(error),
      };

      const server = {
        config: setupHapiConfigMock(),
        plugins: {
          elasticsearch: setupElasticsearchPluginMock({ mockClusterClientImplementation: mockClusterClient }),
        },
      };

      const sgb = new SearchGuardBackend(server, null, esConfig);

      const headerName = 'authorization';
      const headerValue = 'bearer eyJhbGciOiJIUzUxMiJ9.eyJuYmYiOjE1OTk5OTQzMjIsImV4cCI6MTU5OTk5NzkyMiwic3ViIjoiYWRtaW4iLCJzYW1sX25pZiI6InUiLCJzYW1sX3NpIjoiNTNkZDFmNzgtOTg2Ny00MjE2LWExYTQtYjcwZTY0MjhmY2UwOjo4NzFiZmZkMi01NzBlLTRhYzItYTBiNS02ZjJhNGQ5YWUyYzQiLCJyb2xlcyI6WyJ1bWFfYXV0aG9yaXphdGlvbiIsImtpYmFuYXVzZXIiLCJhZG1pbiIsImNyZWF0ZS1yZWFsbSIsIm1hbmFnZS1pZGVudGl0eS1wcm92aWRlcnMiLCJ2aWV3LWlkZW50aXR5LXByb3ZpZGVycyIsImNyZWF0ZS1jbGllbnQiLCJ2aWV3LXVzZXJzIiwidmlldy1hdXRob3JpemF0aW9uIiwidmlldy1yZWFsbSIsInZpZXctZXZlbnRzIiwicXVlcnktcmVhbG1zIiwicXVlcnktdXNlcnMiLCJpbXBlcnNvbmF0aW9uIiwibWFuYWdlLWV2ZW50cyIsIm1hbmFnZS1yZWFsbSIsIm1hbmFnZS1jbGllbnRzIiwidmlldy1jbGllbnRzIiwicXVlcnktZ3JvdXBzIiwicXVlcnktY2xpZW50cyIsIm1hbmFnZS1hdXRob3JpemF0aW9uIiwibWFuYWdlLXVzZXJzIiwibWFuYWdlLWFjY291bnQiLCJtYW5hZ2UtYWNjb3VudC1saW5rcyIsInZpZXctcHJvZmlsZSJdfQ._doBynHPp3ASAk5DmSGkThxKvP0SrOBwpTEe5woG8rDg8mrjjwJr507ycl-UpPUjBWbpeKEp1DClhZUmQ9gzpg';
      const additionalAuthHeaders = {};
      const expectedHeaders = { authorization: headerValue };

      try {
        await sgb.authenticateWithHeader(headerName, headerValue, additionalAuthHeaders);
      } catch (e) {
        expect(e).toEqual(error);
      }

      expect(mockClusterClient.callWithRequest)
        .toHaveBeenCalledWith({ headers: expectedHeaders }, 'searchguard.authinfo', { headers: expectedHeaders }, undefined);
    });

    test('authenticate', async () => {
      const esConfig = setupEsConfigMock();
      esConfig.requestHeadersWhitelist = [
        'sgtenant',
        'Authorization',
        'authorization',
        'X-Forwarded-For',
        'x-proxy-user',
        'x-proxy-roles',
        'urltoken',
      ];

      const authInfo = {
        user: 'User [name=admin, backend_roles=[manage-account, impersonation, create-client, manage-users, admin, view-authorization, query-users, manage-events, manage-realm, view-users, manage-account-links, uma_authorization, manage-clients, view-profile, view-identity-providers, view-realm, manage-identity-providers, query-realms, kibanauser, query-clients, create-realm, view-events, view-clients, manage-authorization, query-groups], requestedTenant=null]',
        user_name: 'admin',
        user_requested_tenant: null,
        remote_address: '172.16.0.254:58590',
        backend_roles: [
          'manage-account',
          'impersonation',
          'create-client',
          'manage-users',
          'admin',
          'view-authorization',
          'query-users',
          'manage-events',
          'manage-realm',
          'view-users',
          'manage-account-links',
          'uma_authorization',
          'manage-clients',
          'view-profile',
          'view-identity-providers',
          'view-realm',
          'manage-identity-providers',
          'query-realms',
          'kibanauser',
          'query-clients',
          'create-realm',
          'view-events',
          'view-clients',
          'manage-authorization',
          'query-groups'
        ],
        custom_attribute_names: [
          'attr.jwt.roles',
          'attr.jwt.sub',
          'attr.jwt.saml_nif',
          'attr.jwt.nbf',
          'attr.jwt.exp',
          'attr.jwt.saml_si'
        ],
        attribute_names: [],
        sg_roles: [
          'SGS_ALL_ACCESS',
          'SGS_KIBANA_USER'
        ],
        sg_tenants: {
          performance_data: true,
          management: true,
          SGS_GLOBAL_TENANT: true,
          SELENIUM_TENANT: true,
          finance_management: true,
          admin_tenant: true,
          admin: true,
          business_intelligence: true,
          finance: true,
          SELENIUM_TENANT_2: true,
          human_resources: true
        },
        principal: null,
        peer_certificates: '0',
        sso_logout_url: 'http://keycloak.example.com:8080/auth/realms/master/protocol/saml?SAMLRequest=fVJdi9swEPwrRu%2BKLcmfIjEU0hZDmoPe0Ye%2BlI206pmzJNeSIf33VZweXAvt06LZnVlmtPsAdprlyX%2F3a%2FyMP1YMMbvayQW5dQ5kXZz0EMYgHVgMMir5%2BO7TSfJdIefFR6%2F8RN5Q%2Fs%2BAEHCJo3ckG44H8nB%2Bf3r4OJy%2FVSjqjiGjTW2Qlkoo2vJWUF2jrnTVcMCOZF9wCYl7IEkqCYSw4uBCBBcTVPCCFh1l4okxyYQUxVeSHZOf0UHcWM8xzjLPX%2FCnmjy87PAKdp5wp7yVbdEWOazxOV8QJhtyCyHikr9azG%2FeSNbvb1Vuq5ceA7099%2Flb8D5xTtaHY%2FbBLxbivzNhO7Yho6ZmG5WrCzOq0YyoSQ%2Faju63%2FF2xz%2Fb3L3vEcMticBqvfXthKaPWpLzampbGXCgYwWlZqVKIhtcaOinbhl2M0ZxWTZFCBsUpFJeK1oZDqTtArsr7sr%2FkX8E%2FzqT%2FBQ%3D%3D'
      };

      const expectedResult = {
        _username: 'admin',
        _credentials: {
          headerName: 'authorization',
          headerValue: 'bearer eyJhbGciOiJIUzUxMiJ9.eyJuYmYiOjE1OTk5OTQzMjIsImV4cCI6MTU5OTk5NzkyMiwic3ViIjoiYWRtaW4iLCJzYW1sX25pZiI6InUiLCJzYW1sX3NpIjoiNTNkZDFmNzgtOTg2Ny00MjE2LWExYTQtYjcwZTY0MjhmY2UwOjo4NzFiZmZkMi01NzBlLTRhYzItYTBiNS02ZjJhNGQ5YWUyYzQiLCJyb2xlcyI6WyJ1bWFfYXV0aG9yaXphdGlvbiIsImtpYmFuYXVzZXIiLCJhZG1pbiIsImNyZWF0ZS1yZWFsbSIsIm1hbmFnZS1pZGVudGl0eS1wcm92aWRlcnMiLCJ2aWV3LWlkZW50aXR5LXByb3ZpZGVycyIsImNyZWF0ZS1jbGllbnQiLCJ2aWV3LXVzZXJzIiwidmlldy1hdXRob3JpemF0aW9uIiwidmlldy1yZWFsbSIsInZpZXctZXZlbnRzIiwicXVlcnktcmVhbG1zIiwicXVlcnktdXNlcnMiLCJpbXBlcnNvbmF0aW9uIiwibWFuYWdlLWV2ZW50cyIsIm1hbmFnZS1yZWFsbSIsIm1hbmFnZS1jbGllbnRzIiwidmlldy1jbGllbnRzIiwicXVlcnktZ3JvdXBzIiwicXVlcnktY2xpZW50cyIsIm1hbmFnZS1hdXRob3JpemF0aW9uIiwibWFuYWdlLXVzZXJzIiwibWFuYWdlLWFjY291bnQiLCJtYW5hZ2UtYWNjb3VudC1saW5rcyIsInZpZXctcHJvZmlsZSJdfQ._doBynHPp3ASAk5DmSGkThxKvP0SrOBwpTEe5woG8rDg8mrjjwJr507ycl-UpPUjBWbpeKEp1DClhZUmQ9gzpg'
        },
        _proxyCredentials: null,
        _roles: authInfo.sg_roles,
        _selectedTenant: null,
        _backendroles: authInfo.backend_roles,
        _tenants: authInfo.sg_tenants,
      };

      const mockClusterClient = {
        callWithRequest: jest.fn().mockResolvedValue(authInfo),
      };

      const server = {
        config: setupHapiConfigMock(),
        plugins: {
          elasticsearch: setupElasticsearchPluginMock({ mockClusterClientImplementation: mockClusterClient }),
        },
      };

      const sgb = new SearchGuardBackend(server, null, esConfig);

      const headerName = 'authorization';
      const headerValue = 'bearer eyJhbGciOiJIUzUxMiJ9.eyJuYmYiOjE1OTk5OTQzMjIsImV4cCI6MTU5OTk5NzkyMiwic3ViIjoiYWRtaW4iLCJzYW1sX25pZiI6InUiLCJzYW1sX3NpIjoiNTNkZDFmNzgtOTg2Ny00MjE2LWExYTQtYjcwZTY0MjhmY2UwOjo4NzFiZmZkMi01NzBlLTRhYzItYTBiNS02ZjJhNGQ5YWUyYzQiLCJyb2xlcyI6WyJ1bWFfYXV0aG9yaXphdGlvbiIsImtpYmFuYXVzZXIiLCJhZG1pbiIsImNyZWF0ZS1yZWFsbSIsIm1hbmFnZS1pZGVudGl0eS1wcm92aWRlcnMiLCJ2aWV3LWlkZW50aXR5LXByb3ZpZGVycyIsImNyZWF0ZS1jbGllbnQiLCJ2aWV3LXVzZXJzIiwidmlldy1hdXRob3JpemF0aW9uIiwidmlldy1yZWFsbSIsInZpZXctZXZlbnRzIiwicXVlcnktcmVhbG1zIiwicXVlcnktdXNlcnMiLCJpbXBlcnNvbmF0aW9uIiwibWFuYWdlLWV2ZW50cyIsIm1hbmFnZS1yZWFsbSIsIm1hbmFnZS1jbGllbnRzIiwidmlldy1jbGllbnRzIiwicXVlcnktZ3JvdXBzIiwicXVlcnktY2xpZW50cyIsIm1hbmFnZS1hdXRob3JpemF0aW9uIiwibWFuYWdlLXVzZXJzIiwibWFuYWdlLWFjY291bnQiLCJtYW5hZ2UtYWNjb3VudC1saW5rcyIsInZpZXctcHJvZmlsZSJdfQ._doBynHPp3ASAk5DmSGkThxKvP0SrOBwpTEe5woG8rDg8mrjjwJr507ycl-UpPUjBWbpeKEp1DClhZUmQ9gzpg';
      const additionalAuthHeaders = {};
      const expectedHeaders = { authorization: headerValue };

      const result = await sgb.authenticateWithHeader(headerName, headerValue, additionalAuthHeaders);

      expect(mockClusterClient.callWithRequest)
        .toHaveBeenCalledWith({ headers: expectedHeaders }, 'searchguard.authinfo', { headers: expectedHeaders }, undefined);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('authinfo', () => {
    test('Authorized', async () => {
      const esConfig = setupEsConfigMock();
      esConfig.requestHeadersWhitelist = [
        'sgtenant',
        'Authorization',
        'authorization',
        'X-Forwarded-For',
        'x-proxy-user',
        'x-proxy-roles',
        'urltoken',
      ];

      const authInfo = {
        user: 'User [name=admin]',
        user_name: 'admin',
        sg_roles: [],
        sg_tenants: [],
      };

      const mockClusterClient = {
        callWithRequest: jest.fn().mockResolvedValue(authInfo),
      };

      const server = {
        config: setupHapiConfigMock(),
        plugins: {
          elasticsearch: setupElasticsearchPluginMock({ mockClusterClientImplementation: mockClusterClient }),
        },
      };

      const headers = {
        authorization: 'bearer eyJhbGciOiJIUzUxMiJ9',
      };

      const sgb = new SearchGuardBackend(server, null, esConfig);
      const result = await sgb.authinfo(headers);

      expect(mockClusterClient.callWithRequest)
        .toHaveBeenCalledWith({ headers }, 'searchguard.authinfo', { headers }, undefined);
      expect(result).toEqual(authInfo);
    });

    test('Unauthorized', async () => {
      const esConfig = setupEsConfigMock();
      esConfig.requestHeadersWhitelist = [
        'sgtenant',
        'Authorization',
        'authorization',
        'X-Forwarded-For',
        'x-proxy-user',
        'x-proxy-roles',
        'urltoken',
      ];

      const error = new Error('Unauthorized');

      const mockClusterClient = {
        callWithRequest: jest.fn().mockRejectedValue(error),
      };

      const server = {
        config: setupHapiConfigMock(),
        plugins: {
          elasticsearch: setupElasticsearchPluginMock({ mockClusterClientImplementation: mockClusterClient }),
        },
      };

      const headers = {
        'host': 'kibana.example.com:5601',
        'connection': 'keep-alive',
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6)',
      };

      const sgb = new SearchGuardBackend(server, null, esConfig);

      try {
        await sgb.authinfo(headers);
      } catch (e) {
        expect(e).toEqual(error);
      }

      expect(mockClusterClient.callWithRequest)
        .toHaveBeenCalledWith({ headers: {} }, 'searchguard.authinfo', { headers: {} }, undefined);
    });
  });

  describe('getSamlHeader', () => {
    test('get SAML header if the "Unauthorized" error (for example, when user is doing login)', async () => {
      const esConfig = setupEsConfigMock();

      const error = new Error('Unauthorized');
      error.wwwAuthenticateDirective = 'X-SG-IdP realm="Search Guard" location="http://keycloak.example.com:8080/auth/realms/master/protocol/saml?SAMLRequest=fVJdUyIxEPwrW3kP2eCqSwqo4sQ7qUKghLsHX67GMEjKfOxlsqf8e8OiVfqgb5me6Ul3J0MCZxs1adPe3%2BG%2FFikVL856Ul1jxNroVQAypDw4JJW0Wk9u56rfK1UTQwo6WPaB8j0DiDAmEzwrZtMRWy6u58tfs8Xfegd9CZXmWFXAK9k%2F44NK11xfIuDuAnJvwIo%2FGClzRyyvyguIWpx5SuBThsp%2BycsBl3IjpZK1qgb3rJhmP8ZD6lj7lBolxBMetA3w1MMXcI3Fng5O1WVdCsgpiIhgHQkHlDCKd4vi6I0Vq7fyh%2FFb4x%2B%2FN%2FtwGiJ1s9ms%2BGq53rBi8h7AVfDUOoxrjP%2BNxt9385NAOio0D%2BDhk77zi1IKQoh6%2F9hC3HZ6BGhi4%2BHxqLo04hiJH8uh%2BAgOT4%2B8yApn01WwRh%2BKnyE6SF8bkD3ZIWbLd92oaj01qM3O4Db7sDY8X%2BWsEo5Yii2yQoxPt37%2BTeNX" requestId="ONELOGIN_8fa21a4c-e44a-4123-94c8-c7eaef6a1a49"';

      const mockClusterClient = {
        callWithRequest: jest.fn().mockRejectedValue(error),
      };

      const server = {
        config: setupHapiConfigMock(),
        plugins: {
          elasticsearch: setupElasticsearchPluginMock({ mockClusterClientImplementation: mockClusterClient }),
        },
      };

      const sgb = new SearchGuardBackend(server, null, esConfig);
      const samlHeader = await sgb.getSamlHeader();

      expect(mockClusterClient.callWithRequest)
        .toHaveBeenCalledWith({}, 'searchguard.authinfo', {}, undefined);
      expect(samlHeader).toEqual({
        location: 'http://keycloak.example.com:8080/auth/realms/master/protocol/saml?SAMLRequest=fVJdUyIxEPwrW3kP2eCqSwqo4sQ7qUKghLsHX67GMEjKfOxlsqf8e8OiVfqgb5me6Ul3J0MCZxs1adPe3%2BG%2FFikVL856Ul1jxNroVQAypDw4JJW0Wk9u56rfK1UTQwo6WPaB8j0DiDAmEzwrZtMRWy6u58tfs8Xfegd9CZXmWFXAK9k%2F44NK11xfIuDuAnJvwIo%2FGClzRyyvyguIWpx5SuBThsp%2BycsBl3IjpZK1qgb3rJhmP8ZD6lj7lBolxBMetA3w1MMXcI3Fng5O1WVdCsgpiIhgHQkHlDCKd4vi6I0Vq7fyh%2FFb4x%2B%2FN%2FtwGiJ1s9ms%2BGq53rBi8h7AVfDUOoxrjP%2BNxt9385NAOio0D%2BDhk77zi1IKQoh6%2F9hC3HZ6BGhi4%2BHxqLo04hiJH8uh%2BAgOT4%2B8yApn01WwRh%2BKnyE6SF8bkD3ZIWbLd92oaj01qM3O4Db7sDY8X%2BWsEo5Yii2yQoxPt37%2BTeNX',
        requestId: 'ONELOGIN_8fa21a4c-e44a-4123-94c8-c7eaef6a1a49',
      });
    });

    test('rethrow error if not wwwAuthenticateDirective', async () => {
      const esConfig = setupEsConfigMock();

      const error = new Error('nasty!');

      const mockClusterClient = {
        callWithRequest: jest.fn().mockRejectedValue(error),
      };

      const server = {
        config: setupHapiConfigMock(),
        plugins: {
          elasticsearch: setupElasticsearchPluginMock({ mockClusterClientImplementation: mockClusterClient }),
        },
      };

      const sgb = new SearchGuardBackend(server, null, esConfig);

      try {
        await sgb.getSamlHeader();
      } catch (e) {
        expect(e).toEqual(error);
      }
    });
  });
});