import { SgSessionStorage } from './sessionPlugin';
import { setupHapiHMock } from '../utils/mocks';

function setupSettingsMock() {
  return {
    storageCookieName: 'searchguard_storage',
  };
}

function setupRequestMock() {
  return {
    state: {},
    headers: [],
  };
}

function setupHapiServerMock({
  mockConfigImplementation = () => null,
} = {}) {
  return {
    config: jest.fn().mockImplementation(mockConfigImplementation),
  };
}

describe('/lib/session/sessionPlugin SgSessionStorage', () => {
  test('getAuthHeaderName', () => {
    const settings = setupSettingsMock();
    settings.authHeaderName = 'authorization';

    const server = setupHapiServerMock();
    const request = setupRequestMock();
    const h = setupHapiHMock();

    const sessionStorage = new SgSessionStorage({ settings, server, request, h });
    const result = sessionStorage.getAuthHeaderName();

    expect(result).toEqual(settings.authHeaderName);
  });

  describe('authenticate', () => {
    test('SAML, successfully authenticate admin', async () => {
      const options = {};
      const credentials = {
        authHeaderValue: 'bearer eyJhbGciOiJIUzUxMiJ9.eyJuYmYiOjE1OTk5MjcxODMsImV4cCI6MTU5OTkzMDc4Mywic3ViIjoiYWRtaW4iLCJzYW1sX25pZiI6InUiLCJzYW1sX3NpIjoiNjZjYzI4ZmEtNDdmNC00ZmY1LTk2MTctYzgxZWMwMjg2ZjhmOjo4NzFiZmZkMi01NzBlLTRhYzItYTBiNS02ZjJhNGQ5YWUyYzQiLCJyb2xlcyI6WyJ1bWFfYXV0aG9yaXphdGlvbiIsImtpYmFuYXVzZXIiLCJhZG1pbiIsImNyZWF0ZS1yZWFsbSIsIm1hbmFnZS1pZGVudGl0eS1wcm92aWRlcnMiLCJ2aWV3LWlkZW50aXR5LXByb3ZpZGVycyIsImNyZWF0ZS1jbGllbnQiLCJ2aWV3LXVzZXJzIiwidmlldy1hdXRob3JpemF0aW9uIiwidmlldy1yZWFsbSIsInZpZXctZXZlbnRzIiwicXVlcnktcmVhbG1zIiwicXVlcnktdXNlcnMiLCJpbXBlcnNvbmF0aW9uIiwibWFuYWdlLWV2ZW50cyIsIm1hbmFnZS1yZWFsbSIsIm1hbmFnZS1jbGllbnRzIiwidmlldy1jbGllbnRzIiwicXVlcnktZ3JvdXBzIiwicXVlcnktY2xpZW50cyIsIm1hbmFnZS1hdXRob3JpemF0aW9uIiwibWFuYWdlLXVzZXJzIiwibWFuYWdlLWFjY291bnQiLCJtYW5hZ2UtYWNjb3VudC1saW5rcyIsInZpZXctcHJvZmlsZSJdfQ.AfcxemzNu3REfyd_KOuc5KpFPuZ1TD5jF2t2CDofrCGYsr6KuTDbt7GJtReS1SNnyRYv_8G5U7SNd44sImR3Og',
      };

      const expectedAuthResponse = {
        session: {
          username: 'admin',
          credentials: {
            authHeaderValue: 'bearer eyJhbGciOiJIUzUxMiJ9.eyJuYmYiOjE1OTk5MjcxODMsImV4cCI6MTU5OTkzMDc4Mywic3ViIjoiYWRtaW4iLCJzYW1sX25pZiI6InUiLCJzYW1sX3NpIjoiNjZjYzI4ZmEtNDdmNC00ZmY1LTk2MTctYzgxZWMwMjg2ZjhmOjo4NzFiZmZkMi01NzBlLTRhYzItYTBiNS02ZjJhNGQ5YWUyYzQiLCJyb2xlcyI6WyJ1bWFfYXV0aG9yaXphdGlvbiIsImtpYmFuYXVzZXIiLCJhZG1pbiIsImNyZWF0ZS1yZWFsbSIsIm1hbmFnZS1pZGVudGl0eS1wcm92aWRlcnMiLCJ2aWV3LWlkZW50aXR5LXByb3ZpZGVycyIsImNyZWF0ZS1jbGllbnQiLCJ2aWV3LXVzZXJzIiwidmlldy1hdXRob3JpemF0aW9uIiwidmlldy1yZWFsbSIsInZpZXctZXZlbnRzIiwicXVlcnktcmVhbG1zIiwicXVlcnktdXNlcnMiLCJpbXBlcnNvbmF0aW9uIiwibWFuYWdlLWV2ZW50cyIsIm1hbmFnZS1yZWFsbSIsIm1hbmFnZS1jbGllbnRzIiwidmlldy1jbGllbnRzIiwicXVlcnktZ3JvdXBzIiwicXVlcnktY2xpZW50cyIsIm1hbmFnZS1hdXRob3JpemF0aW9uIiwibWFuYWdlLXVzZXJzIiwibWFuYWdlLWFjY291bnQiLCJtYW5hZ2UtYWNjb3VudC1saW5rcyIsInZpZXctcHJvZmlsZSJdfQ.AfcxemzNu3REfyd_KOuc5KpFPuZ1TD5jF2t2CDofrCGYsr6KuTDbt7GJtReS1SNnyRYv_8G5U7SNd44sImR3Og'
          },
          authType: 'saml',
          exp: 1599930783
        },
        user: {
          username: 'admin',
          credentials: {
            headerName: 'authorization',
            headerValue: 'bearer eyJhbGciOiJIUzUxMiJ9.eyJuYmYiOjE1OTk5MjcxODMsImV4cCI6MTU5OTkzMDc4Mywic3ViIjoiYWRtaW4iLCJzYW1sX25pZiI6InUiLCJzYW1sX3NpIjoiNjZjYzI4ZmEtNDdmNC00ZmY1LTk2MTctYzgxZWMwMjg2ZjhmOjo4NzFiZmZkMi01NzBlLTRhYzItYTBiNS02ZjJhNGQ5YWUyYzQiLCJyb2xlcyI6WyJ1bWFfYXV0aG9yaXphdGlvbiIsImtpYmFuYXVzZXIiLCJhZG1pbiIsImNyZWF0ZS1yZWFsbSIsIm1hbmFnZS1pZGVudGl0eS1wcm92aWRlcnMiLCJ2aWV3LWlkZW50aXR5LXByb3ZpZGVycyIsImNyZWF0ZS1jbGllbnQiLCJ2aWV3LXVzZXJzIiwidmlldy1hdXRob3JpemF0aW9uIiwidmlldy1yZWFsbSIsInZpZXctZXZlbnRzIiwicXVlcnktcmVhbG1zIiwicXVlcnktdXNlcnMiLCJpbXBlcnNvbmF0aW9uIiwibWFuYWdlLWV2ZW50cyIsIm1hbmFnZS1yZWFsbSIsIm1hbmFnZS1jbGllbnRzIiwidmlldy1jbGllbnRzIiwicXVlcnktZ3JvdXBzIiwicXVlcnktY2xpZW50cyIsIm1hbmFnZS1hdXRob3JpemF0aW9uIiwibWFuYWdlLXVzZXJzIiwibWFuYWdlLWFjY291bnQiLCJtYW5hZ2UtYWNjb3VudC1saW5rcyIsInZpZXctcHJvZmlsZSJdfQ.AfcxemzNu3REfyd_KOuc5KpFPuZ1TD5jF2t2CDofrCGYsr6KuTDbt7GJtReS1SNnyRYv_8G5U7SNd44sImR3Og'
          },
          proxyCredentials: null,
          roles: [
            'SGS_ALL_ACCESS',
            'SGS_KIBANA_USER'
          ],
          selectedTenant: null,
          backendroles: [
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
          tenants: {
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
          }
        }            
      };

      const originalCookie = {
        tenant: { selected: '' },
      };

      const expectedCookie = {
        authInfo: {
          user_name: 'admin',
          backend_roles: expectedAuthResponse.user.backendroles,
          sg_roles: expectedAuthResponse.user.roles,
          sg_tenants: expectedAuthResponse.user.tenants,
          user_requested_tenant: null
        },
        tenant: { selected: '' }
      };

      const settings = setupSettingsMock();
      settings.allowedAdditionalAuthHeaders = ['sg_impersonate_as'];
      settings.validateAvailableTenants = true;
      settings.validateAvailableRoles = true;
      settings.authenticateFunction = jest.fn().mockResolvedValue(expectedAuthResponse);

      const mockConfigGet = jest.fn((path) => {
        if (path === 'searchguard.multitenancy.enabled') return true;
        if (path === 'searchguard.multitenancy.tenants.enable_global') return true;
        if (path === 'searchguard.multitenancy.tenants.enable_private') return true;
        if (path === 'searchguard.auth.disable_authinfo_cache') return false;
      });
      const mockConfig = jest.fn().mockImplementation(() => ({ get: mockConfigGet }));
      const server = setupHapiServerMock({
        mockConfigImplementation: mockConfig,
      });

      const mockHState = jest.fn();
      const h = setupHapiHMock({
        mockStateImplementation: mockHState,
      });

      const request = setupRequestMock();
      request.cookieAuth = {
        set: jest.fn(),
      };
      request.state = { [settings.storageCookieName]: originalCookie };
      request.headers = {
        host: 'kibana.example.com:5601',
        connection: 'keep-alive',
        'content-length': '12001',
        'cache-control': 'max-age=0',
        'upgrade-insecure-requests': '1',
        origin: 'http://keycloak.example.com:8080',
        'content-type': 'application/x-www-form-urlencoded',
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.102 Safari/537.36',
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
        'sec-fetch-site': 'cross-site',
        'sec-fetch-mode': 'navigate',
        'sec-fetch-dest': 'document',
        referer: 'http://keycloak.example.com:8080/auth/realms/master/login-actions/authenticate?client_id=es-saml&tab_id=s6HHPPr1G20',
        'accept-encoding': 'gzip, deflate, br',
        'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
        cookie: 'searchguard_storage=Fe26.2**d326013b3d80ec59472e04ff12a13f2fb4bca6efdc44418d8f53146b61598788*z2eAsOhqRLLyrpRtT7Cwfw*yJ-TUk_7iH5KwIIu9iie73gwlai_YqK16y11rP0BYcZWTVWj1TejBkDPFOIuuYbK1JgZpFMhSQ4aG3OkkCjNOpQ8_7qYkSKMFDxkez5pJoJ5adng-xrEvwCTb7cYnFfSmIrtJLjmKTkb0swzYCnC-w**ec029dcedf19a92c01b586cdfbe9542680fa2308e965fd624c15d54e502311e1*O1Pd6wCtl_qkBB8KkY8HVl4z005MxVcWrGNc7tc5VzY',
      };

      const sessionStorage = new SgSessionStorage({ settings, server, request, h });

      const result = await sessionStorage.authenticate(credentials, options);

      expect(settings.authenticateFunction).toHaveBeenCalledWith(credentials, options, {});
      expect(request.cookieAuth.set).toHaveBeenCalledWith(expectedAuthResponse.session);
      expect(mockHState).toHaveBeenCalledWith(settings.storageCookieName, expectedCookie);
      expect(result).toEqual(expectedAuthResponse);
    });
  });

  describe('clear', () => {
    test('clear the cookies associated with the authenticated user', () => {
      const settings = setupSettingsMock();
      const server = setupHapiServerMock();

      const mockUnstate = jest.fn();
      const h = setupHapiHMock({ mockUnstateImplementation: mockUnstate });

      const request = setupRequestMock();
      request.cookieAuth = {
        clear: jest.fn(),
      };

      const sessionStorage = new SgSessionStorage({ settings, server, request, h });

      sessionStorage.clear();

      expect(request.cookieAuth.clear).toHaveBeenCalled();
      expect(mockUnstate).toHaveBeenCalledWith(settings.storageCookieName);
    });
  });

  describe('clearStorage', () => {
    test('remove value from storage', () => {
      const settings = setupSettingsMock();
      const server = setupHapiServerMock();

      const mockState = jest.fn();
      const h = setupHapiHMock({
        mockStateImplementation: mockState,
      });

      const request = setupRequestMock();
      request.state.searchguard_storage = {
        'temp-saml': {
          requestId: 'ONELOGIN_ca72d1b8-5729-4d74-a59c-138ea4e1d720',
          nextUrl: '/app/kibana',
        },
        a: { b: 1 },
      };

      const sessionStorage = new SgSessionStorage({ settings, server, request, h });

      const key = 'temp-saml';
      sessionStorage.clearStorage(key);

      expect(mockState).toHaveBeenCalledWith(settings.storageCookieName, { a: { b: 1 } });
    });

    test('unstate storage if no key', () => {
      const settings = setupSettingsMock();
      const server = setupHapiServerMock();

      const mockUnstate = jest.fn();
      const h = setupHapiHMock({
        mockUnstateImplementation: mockUnstate,
      });

      const request = setupRequestMock();
      request.state.searchguard_storage = {
        'temp-saml': {
          requestId: 'ONELOGIN_ca72d1b8-5729-4d74-a59c-138ea4e1d720',
          nextUrl: '/app/kibana',
        },
      };

      const sessionStorage = new SgSessionStorage({ settings, server, request, h });

      const key = undefined;
      const result = sessionStorage.clearStorage(key);

      expect(mockUnstate).toHaveBeenCalledWith(settings.storageCookieName);
      expect(result).toBe(undefined);
    });
  });

  describe('getStorage', () => {
    test('get value from storage', () => {
      const settings = setupSettingsMock();
      const server = setupHapiServerMock();
      const h = setupHapiHMock();
      const request = setupRequestMock();
      request.state.searchguard_storage = {
        'temp-saml': {
          requestId: 'ONELOGIN_ca72d1b8-5729-4d74-a59c-138ea4e1d720',
          nextUrl: '/app/kibana',
        },
      };

      const sessionStorage = new SgSessionStorage({ settings, server, request, h });

      const key = 'temp-saml';
      const value = {};

      const result = sessionStorage.getStorage(key, value);

      expect(result).toEqual(request.state.searchguard_storage['temp-saml']);
    });

    test('return default value if no storage', () => {
      const settings = setupSettingsMock();
      const server = setupHapiServerMock();
      const h = setupHapiHMock();
      const request = setupRequestMock();

      const sessionStorage = new SgSessionStorage({ settings, server, request, h });

      const key = 'temp-saml';
      const value = {};

      let result = sessionStorage.getStorage(key, value);

      expect(result).toEqual({});

      result = sessionStorage.getStorage(key);

      expect(result).toEqual(null);
    });

    test('return storage if no key', () => {
      const settings = setupSettingsMock();
      const server = setupHapiServerMock();
      const h = setupHapiHMock();
      const request = setupRequestMock();
      request.state.searchguard_storage = {
        'temp-saml': {
          requestId: 'ONELOGIN_ca72d1b8-5729-4d74-a59c-138ea4e1d720',
          nextUrl: '/app/kibana',
        },
      };

      const sessionStorage = new SgSessionStorage({ settings, server, request, h });

      const key = undefined;
      const value = {};

      let result = sessionStorage.getStorage(key, value);

      expect(result).toEqual(request.state.searchguard_storage);
    });
  });

  describe('putStorage', () => {
    test('put value in storage', () => {
      const settings = setupSettingsMock();
      const request = setupRequestMock();
      const server = setupHapiServerMock();

      const mockState = jest.fn();
      const h = setupHapiHMock({ mockStateImplementation: mockState });

      const sessionStorage = new SgSessionStorage({ settings, server, request, h });

      const key = 'temp-saml';
      const value = {
        requestId: 'ONELOGIN_03eb0dd4-bf37-4486-b46d-0f27d230bcca',
        nextUrl: '/app/kibana',
      };

      sessionStorage.putStorage(key, value);

      expect(mockState).toHaveBeenCalledWith(settings.storageCookieName, { 'temp-saml': value });
    });

    test('return if no key', () => {
      const settings = setupSettingsMock();
      const request = setupRequestMock();
      const server = setupHapiServerMock();
      const h = setupHapiHMock();

      const sessionStorage = new SgSessionStorage({ settings, server, request, h });

      const key = undefined;
      const value = {};

      const result = sessionStorage.putStorage(key, value);

      expect(result).toBe(undefined);
    });
  });
});