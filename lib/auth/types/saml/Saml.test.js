import Saml from './Saml';
import { setupHapiConfigMock, setupSearchguardPluginMock, setupGetSearchGuardBackendMock } from '../../../utils/mocks';

describe('auth/types/saml/Saml', () => {
  describe('authenticate', () => {
    test('authenticate successfully', async () => {
      const pluginRoot = null;
      const kbnServer = jest.fn();
      const APP_ROOT = '';
      const API_ROOT = '/api/v1';

      const expectedUser = {
        username: 'hr_employee',
        credentials: {
          headerName: 'authorization',
          headerValue: 'Basic aHJfZW1wbG95ZWU6aHJfZW1wbG95ZWU='
        },
        proxyCredentials: null,
        roles: [
          'SGS_KIBANA_USER',
          'sg_human_resources'
        ],
        selectedTenant: null,
        backendroles: [
          'kibanauser'
        ],
        tenants: {
          performance_data: true,
          management: true,
          hr_employee: true,
          business_intelligence: false,
          SGS_GLOBAL_TENANT: true,
          human_resources: true
        }
      };

      const expectedSession = {
        username: 'hr_employee',
        credentials: {
          authHeaderValue: 'Basic aHJfZW1wbG95ZWU6aHJfZW1wbG95ZWU='
        },
        authType: 'saml',
        expiryTime: expect.any(Number)
      };

      const mockGetImplementation = jest.fn((path) => {
        if (path === 'searchguard.auth.unauthenticated_routes') return [ '/api/status' ];
        if (path === 'searchguard.session.ttl') return 3600000;
        if (path === 'searchguard.session.keepalive') return true;
        if (path === 'searchguard.auth.debug') return false;
      });

      const mockAuthenticateWithHeader = jest.fn().mockResolvedValue(expectedUser);

      const server = {
        config: setupHapiConfigMock({ mockGetImplementation }),
        plugins: {
          searchguard: setupSearchguardPluginMock({
            mockGetSearcGuardBackendImplementation: setupGetSearchGuardBackendMock({ mockAuthenticateWithHeaderImplementation: mockAuthenticateWithHeader }),
          }),
        },
      };

      const credentials = { authHeaderValue: 'Basic aHJfZW1wbG95ZWU6aHJfZW1wbG95ZWU=' };
      const options = {};
      const additionalAuthHeaders = {};
      const authHeaderName = 'authorization';

      const saml = new Saml(pluginRoot, server, kbnServer, APP_ROOT, API_ROOT);
      const result = await saml.authenticate(credentials, options, additionalAuthHeaders);

      expect(mockAuthenticateWithHeader).toHaveBeenCalledWith(authHeaderName, credentials.authHeaderValue, additionalAuthHeaders);
      expect(result).toEqual({ user: expectedUser, session: expectedSession });
    });

    test('handle error', async () => {
      const pluginRoot = null;
      const kbnServer = jest.fn();
      const APP_ROOT = '';
      const API_ROOT = '/api/v1';

      const mockGetImplementation = jest.fn((path) => {
        if (path === 'searchguard.auth.unauthenticated_routes') return [ '/api/status' ];
        if (path === 'searchguard.session.ttl') return 3600000;
        if (path === 'searchguard.session.keepalive') return true;
        if (path === 'searchguard.auth.debug') return false;
      });

      const error = new Error('nasty');
      const mockAuthenticateWithHeader = jest.fn().mockRejectedValue(error);

      const server = {
        config: setupHapiConfigMock({ mockGetImplementation }),
        plugins: {
          searchguard: setupSearchguardPluginMock({
            mockGetSearcGuardBackendImplementation: setupGetSearchGuardBackendMock({ mockAuthenticateWithHeaderImplementation: mockAuthenticateWithHeader }),
          }),
        },
      };

      const credentials = { authHeaderValue: 'Basic aHJfZW1wbG95ZWU6aHJfZW1wbG95ZWU=' };
      const options = {};
      const additionalAuthHeaders = {};
      const authHeaderName = 'authorization';

      const saml = new Saml(pluginRoot, server, kbnServer, APP_ROOT, API_ROOT);

      try {
        await saml.authenticate(credentials, options, additionalAuthHeaders);
      } catch (e) {
        expect(e).toEqual(error);
      }

      expect(mockAuthenticateWithHeader).toHaveBeenCalledWith(authHeaderName, credentials.authHeaderValue, additionalAuthHeaders);
    });
  });
});