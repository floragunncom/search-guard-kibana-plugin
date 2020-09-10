import {
  loginHandler,
  acsHandler,
  samlLogoutHandler,
  authLogoutHandler,
} from './routes';
import {
  setupSearchguardPluginMock,
  setupGetSearchGuardBackendMock,
  setupSgSessionStorageMock,
  setupHapiHMock,
  setupConfigMock,
} from '../../../utils/mocks';

describe('auth/types/saml/routes', () => {
  describe('loginHandler', () => {
    test('redirect to the SAML config error page if the backend error', async () => {
      const request = { auth: { isAuthenticated: false } };
      const h = setupHapiHMock();
      const error = new Error('nasty!');
      const mockGetSamlHeaderImplementation = jest.fn().mockRejectedValue(error);

      const server = {
        log: jest.fn(),
        plugins: {
          searchguard: setupSearchguardPluginMock({
            mockGetSearcGuardBackendImplementation: setupGetSearchGuardBackendMock({ mockGetSamlHeaderImplementation }),
          }),
        },
      };

      await loginHandler({ server, basePath: '' })(request, h);

      expect(server.plugins.searchguard.getSearchGuardBackend).toHaveBeenCalled();
      expect(mockGetSamlHeaderImplementation).toHaveBeenCalled();
      expect(server.log).toHaveBeenCalledWith(['searchguard', 'error'], `An error occurred while obtaining the SAML header ${error}`);
      expect(h.redirect).toHaveBeenCalledWith('/customerror?type=samlConfigError');

      await loginHandler({ server, basePath: '/abc' })(request, h);

      expect(server.plugins.searchguard.getSearchGuardBackend).toHaveBeenCalled();
      expect(mockGetSamlHeaderImplementation).toHaveBeenCalled();
      expect(server.log).toHaveBeenCalledWith(['searchguard', 'error'], `An error occurred while obtaining the SAML header ${error}`);
      expect(h.redirect).toHaveBeenCalledWith('/abc/customerror?type=samlConfigError');
    });

    test('redirect to Kibana if authenticated', async () => {
      const request = { auth: { isAuthenticated: true } };
      const h = setupHapiHMock();

      await loginHandler({ basePath: '' })(request, h);
      expect(h.redirect).toHaveBeenCalledWith('/app/kibana');

      await loginHandler({ basePath: '/abc' })(request, h);
      expect(h.redirect).toHaveBeenCalledWith('/abc/app/kibana');
    });

    test('redirect to IDP if not authenticated', async () => {
      const request = {
        auth: {
          isAuthenticated: false,
          sgSessionStorage: setupSgSessionStorageMock(),
        },
        url: {
          query: {
            nextUrl: '/app/kibana',
          },
        },
      };

      const samlHeader = {
        location: 'http://keycloak.example.com:8080/auth/realms/master/protocol/saml?SAMLRequest=fVLBbhoxEP2Vle%2FGXrrAxgIkGpIWiQIKJIdeqlnvJFhZ21uPt03%2BPmZJpOSQ3DzP88bvvfGUwDatWnTx6G7wb4cUsyfbOFL9xYx1wSkPZEg5sEgqarVf%2FFqr4UCqNvjotW%2FYO8rXDCDCEI13LFstZ2y7uVpvf6w2fwo5qUuJQz6pZMWLalLwqoScl7UeF7r8NpyMkGV3GChxZyyNSgOIOlw5iuBiguRQcnnBc3nIx6q4UPnoN8uWyY9xEHvWMcZWCfGIz7rx8DjAJ7BtgwPtrSplKQWkFERAaCwJCxQxiDeL4uSNZbvX8rtxtXEPX5utzk2kfh4OO77b7g8sW7wFcOkddRbDHsM%2Fo%2FH2Zn0WSCeFpgIHH%2FSNxjIXhBD08aGDUPd6BGhi8%2BnpqPo0whyJn8qpeA9Oz0veJIWr5c43Rj9n1z5YiJ8byAd5j5ia3%2FetqnPUojb3Buvko2n8%2F8uUVcQZi6FL2xHz86sff9P8BQ%3D%3D',
        requestId: 'ONELOGIN_407d80e2-7b0b-4b74-b8a1-8dc64c83275e',
      };

      const mockGetSamlHeaderImplementation = jest.fn().mockResolvedValueOnce(samlHeader);

      const server = {
        log: jest.fn(),
        plugins: {
          searchguard: setupSearchguardPluginMock({
            mockGetSearcGuardBackendImplementation: setupGetSearchGuardBackendMock({ mockGetSamlHeaderImplementation }),
          }),
        },
      };

      const mockTakeover = jest.fn();
      const h = setupHapiHMock({
        mockRedirectImplementation: jest.fn().mockReturnValueOnce({ takeover: mockTakeover }),
      });

      await loginHandler({ server, basePath: '' })(request, h);

      expect(server.plugins.searchguard.getSearchGuardBackend).toHaveBeenCalled();
      expect(mockGetSamlHeaderImplementation).toHaveBeenCalled();
      expect(request.auth.sgSessionStorage.putStorage).toHaveBeenCalledWith('temp-saml', {
        requestId: samlHeader.requestId,
        nextUrl: '/app/kibana',
      });
      expect(h.redirect).toHaveBeenCalledWith(samlHeader.location);
      expect(mockTakeover).toHaveBeenCalled();
    });
  });

  describe('acsHandler', () => {
    test('redirect to the SAML auth error page if the backend error', async () => {
      const storedRequestInfo = {
        requestId: 'ONELOGIN_34274ab8-f4b1-4d89-af88-84b9d2c9f7d9',
        nextUrl: '/app/kibana',
      };

      const request = {
        payload: {
          SAMLResponse: 'PHNhbWxwOlJlc3BvbnNlIHhtbG5zOnNhbWx+',
        },
        auth: {
          sgSessionStorage: setupSgSessionStorageMock({
            mockGetStorageImplementation: jest.fn().mockReturnValue(storedRequestInfo),
            mockClearStorageImplementation: jest.fn(),
          }),
        },
      };

      const error = new Error('nasty!');
      const mockAuthtokenImplementation = jest.fn().mockRejectedValue(error);

      const server = {
        log: jest.fn(),
        plugins: {
          searchguard: setupSearchguardPluginMock({
            mockGetSearcGuardBackendImplementation: setupGetSearchGuardBackendMock({ mockAuthtokenImplementation }),
          }),
        },
      };

      const h = setupHapiHMock();

      await acsHandler({ basePath: '', server })(request, h); 

      expect(request.auth.sgSessionStorage.getStorage).toHaveBeenCalledWith('temp-saml', {});
      expect(request.auth.sgSessionStorage.clearStorage).toHaveBeenCalledWith('temp-saml');
      expect(server.plugins.searchguard.getSearchGuardBackend).toHaveBeenCalled();
      expect(mockAuthtokenImplementation).toHaveBeenCalledWith(storedRequestInfo.requestId, request.payload.SAMLResponse);
      expect(h.redirect).toHaveBeenCalledWith('/customerror?type=samlAuthError');

      await acsHandler({ basePath: '/abc', server })(request, h); 

      expect(request.auth.sgSessionStorage.getStorage).toHaveBeenCalledWith('temp-saml', {});
      expect(request.auth.sgSessionStorage.clearStorage).toHaveBeenCalledWith('temp-saml');
      expect(server.plugins.searchguard.getSearchGuardBackend).toHaveBeenCalled();
      expect(mockAuthtokenImplementation).toHaveBeenCalledWith(storedRequestInfo.requestId, request.payload.SAMLResponse);
      expect(h.redirect).toHaveBeenCalledWith('/abc/customerror?type=samlAuthError');
    });

    test('redirect to the SAML auth error page if no requestId', async () => {
      const storedRequestInfo = {};

      const request = {
        auth: {
          sgSessionStorage: setupSgSessionStorageMock({
            mockGetStorageImplementation: jest.fn().mockReturnValue(storedRequestInfo),
            mockClearStorageImplementation: jest.fn(),
          }),
        },
      };

      const h = setupHapiHMock();

      await acsHandler({ basePath: '' })(request, h); 

      expect(request.auth.sgSessionStorage.getStorage).toHaveBeenCalledWith('temp-saml', {});
      expect(request.auth.sgSessionStorage.clearStorage).toHaveBeenCalledWith('temp-saml');
      expect(h.redirect).toHaveBeenCalledWith('/customerror?type=samlAuthError');

      await acsHandler({ basePath: '/abc' })(request, h); 

      expect(request.auth.sgSessionStorage.getStorage).toHaveBeenCalledWith('temp-saml', {});
      expect(request.auth.sgSessionStorage.clearStorage).toHaveBeenCalledWith('temp-saml');
      expect(h.redirect).toHaveBeenCalledWith('/abc/customerror?type=samlAuthError');
    });

    test('redirect to Kibana after successfull authentication by IDP', async () => {
      const storedRequestInfo = {
        requestId: 'ONELOGIN_34274ab8-f4b1-4d89-af88-84b9d2c9f7d9',
        nextUrl: '/app/kibana',
      };

      const credentials = {
        authorization: 'bearer eyJhbGciOiJIUzUxMiJ9'
      };

      const request = {
        payload: {
          SAMLResponse: 'PHNhbWxwOlJlc3BvbnNlIHhtbG5zOnNhbWx+',
        },
        auth: {
          sgSessionStorage: setupSgSessionStorageMock({
            mockGetStorageImplementation: jest.fn().mockReturnValue(storedRequestInfo),
            mockClearStorageImplementation: jest.fn(),
          }),
        },
      };

      const mockAuthtokenImplementation = jest.fn().mockResolvedValue(credentials);

      const server = {
        log: jest.fn(),
        plugins: {
          searchguard: setupSearchguardPluginMock({
            mockGetSearcGuardBackendImplementation: setupGetSearchGuardBackendMock({ mockAuthtokenImplementation }),
          }),
        },
      };

      const debugLog = jest.fn();
      const h = setupHapiHMock();

      await acsHandler({ server, basePath: '', debugLog })(request, h); 

      expect(request.auth.sgSessionStorage.getStorage).toHaveBeenCalledWith('temp-saml', {});
      expect(request.auth.sgSessionStorage.clearStorage).toHaveBeenCalledWith('temp-saml');
      expect(server.plugins.searchguard.getSearchGuardBackend).toHaveBeenCalled();
      expect(mockAuthtokenImplementation).toHaveBeenCalledWith(storedRequestInfo.requestId, request.payload.SAMLResponse);
      expect(debugLog).toHaveBeenCalledWith({ requestId: storedRequestInfo.requestId, SAMLResponse: request.payload.SAMLResponse });
      expect(request.auth.sgSessionStorage.authenticate).toHaveBeenCalledWith({ authHeaderValue: credentials.authorization });
      expect(h.redirect).toHaveBeenCalledWith('/app/kibana');

      await acsHandler({ server, basePath: '/abc', debugLog })(request, h); 

      expect(request.auth.sgSessionStorage.getStorage).toHaveBeenCalledWith('temp-saml', {});
      expect(request.auth.sgSessionStorage.clearStorage).toHaveBeenCalledWith('temp-saml');
      expect(server.plugins.searchguard.getSearchGuardBackend).toHaveBeenCalled();
      expect(mockAuthtokenImplementation).toHaveBeenCalledWith(storedRequestInfo.requestId, request.payload.SAMLResponse);
      expect(debugLog).toHaveBeenCalledWith({ requestId: storedRequestInfo.requestId, SAMLResponse: request.payload.SAMLResponse });
      expect(request.auth.sgSessionStorage.authenticate).toHaveBeenCalledWith({ authHeaderValue: credentials.authorization });
      expect(h.redirect).toHaveBeenCalledWith('/abc/app/kibana');
    });
  });

  describe('samlLogoutHandler', () => {
    test('redirect to a page that says "successfully logout"', () => {
      const request = {
        auth: {
          sgSessionStorage: setupSgSessionStorageMock(),
        },
      };

      const h = setupHapiHMock();
      
      samlLogoutHandler()(request, h);

      expect(request.auth.sgSessionStorage.clear).toHaveBeenCalled();
      expect(h.redirect).toHaveBeenCalledWith('/customerror?type=samlLogoutSuccess');
    });
  });

  describe('authLogoutHandler', () => {
    test('redirect to the IDP login page after user clicked the "Back to Kibana" button on the "successfully logout" page', async () => {
      const mockGetImplementation = jest.fn().mockReturnValue('searchguard_authentication');
      const config = setupConfigMock({ mockGetImplementation });

      const request = {
        state: {
          searchguard_authentication: {
            credentials: {
              authHeaderValue: 'bearer eyJhbGciOiJIUzUxMiJ9', 
            },
          },
        },
        auth: {
          sgSessionStorage: setupSgSessionStorageMock({
            mockGetAuthHeaderNameImplementation: jest.fn().mockReturnValue('authorization'),
          }),
        },
      };

      const authHeader = { authorization: request.state.searchguard_authentication.credentials.authHeaderValue };

      const authInfo = {
        sso_logout_url: 'http://keycloak.example.com:8080/auth/realms/master/protocol/saml?SAMLRequest=fVJda9wwEPwrRu86y7L8IXFnKFxbDJcLJKEPfSl78qoxsSTHkuHy7%2BPz5SAttE%2BLZmdmmdVuA9hhVAf%2F28%2FxAV9nDDE528EFtXZ2ZJ6c8hD6oBxYDCpq9fjl7qD4hqlx8tFrP5BPkv8rIAScYu8dSdr9jtwfvx7uv7fHX6WpauSyoKecd1RU2tCacaAiZyYvOqxkDiT5gVNYtDuyWC0GIczYuhDBxQVinFEmaZY9Mam4UHn9kyT7JU%2FvIK6q5xhHlaYv%2BKYHDy8bPIMdB9xob1XNapbCHJ%2FTCWGwIbUQIk7pLWJ6yUaSZnupah09NRjo5blNP4NXxnGJ3u6Tb36yEP%2B9k2yTrUjfUbNS1ezCiLo3PXakgc727sP%2B6tgk2%2BuXPWK47KJ1HZ6bkmEGUme0qERNhZQ5hVIUNC9ZLrmpZFGdlKqr7GRMxxcWQypAcwrsVNDScBCdBORaXIf9ZX8D%2FziT5h0%3D',
      };
      const mockAuthinfoImplementation = jest.fn().mockResolvedValue(authInfo);

      const server = {
        log: jest.fn(),
        plugins: {
          searchguard: setupSearchguardPluginMock({
            mockGetSearcGuardBackendImplementation: setupGetSearchGuardBackendMock({ mockAuthinfoImplementation }),
          }),
        },
      };
      
      const result = await authLogoutHandler({ server, config })(request);

      expect(mockGetImplementation).toHaveBeenCalledWith('searchguard.cookie.name');
      expect(mockAuthinfoImplementation).toHaveBeenCalledWith(authHeader);
      expect(request.auth.sgSessionStorage.clear).toHaveBeenCalled();
      expect(result).toEqual({ redirectURL: authInfo.sso_logout_url });
    });

    test('redirect to the "successfully logout" page after user clicked the "Back to Kibana" button on the "successfully logout" page if no authinfo', async () => {
      const mockGetImplementation = jest.fn().mockReturnValue('searchguard_authentication');
      const config = setupConfigMock({ mockGetImplementation });

      const request = {
        state: {
          searchguard_authentication: {
            credentials: {
              authHeaderValue: 'bearer eyJhbGciOiJIUzUxMiJ9', 
            },
          },
        },
        auth: {
          sgSessionStorage: setupSgSessionStorageMock({
            mockGetAuthHeaderNameImplementation: jest.fn().mockReturnValue('authorization'),
          }),
        },
      };

      const authHeader = { authorization: request.state.searchguard_authentication.credentials.authHeaderValue };

      const mockAuthinfoImplementation = jest.fn().mockResolvedValue({});

      const server = {
        log: jest.fn(),
        plugins: {
          searchguard: setupSearchguardPluginMock({
            mockGetSearcGuardBackendImplementation: setupGetSearchGuardBackendMock({ mockAuthinfoImplementation }),
          }),
        },
      };
      
      const result = await authLogoutHandler({ server, config })(request);

      expect(mockGetImplementation).toHaveBeenCalledWith('searchguard.cookie.name');
      expect(mockAuthinfoImplementation).toHaveBeenCalledWith(authHeader);
      expect(request.auth.sgSessionStorage.clear).toHaveBeenCalled();
      expect(result).toEqual({ redirectURL: '/customerror?type=samlLogoutSuccess' });
    });
  });
});
