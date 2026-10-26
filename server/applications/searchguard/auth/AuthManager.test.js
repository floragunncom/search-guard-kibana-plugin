import { AuthManager } from "./AuthManager";
import {
    setupKibanaCoreMock,
    setupKibanaRequestMock,
    setupHttpResponseMock,
    setupHttpToolkitMock,
    setupLoggerMock,
} from "../../../utils/mocks";

describe('AuthManager', () => {
    let authManager;

    let unauthenticatedRoutes = [
        '/unauthenticated-route'
    ];

    let sessionMock = {
        get: jest.fn()
    }

    let configServiceMock = {
        get: jest.fn((route) => {
            switch (route) {
                case 'searchguard.auth.unauthenticated_routes':
                    return unauthenticatedRoutes;
                default:
                    throw Error(`Unexpected call to mockConfigService: ${route}. Tests need to be updated.`);
            }
        })
    };

    const mockConfig = {
        kibanaCore: setupKibanaCoreMock({ serverBasePath: '/mockbasepath' }),
        sessionStorageFactory: {
            asScoped: () => sessionMock
        },
        pluginDependencies: {},
        logger: setupLoggerMock(),
        searchGuardBackend: {
            getAuthConfig: jest.fn()
        },
        configService: configServiceMock,
        spacesService: {},
    };

    beforeEach(() => {
        authManager = new AuthManager(mockConfig);
    });

    it('should be defined', () => {
        expect(authManager).toBeDefined();
    });

    it('should use the server base path during initialization', () => {
        expect(authManager.basePath).toBe('/mockbasepath');
    });

    describe("checkAuth()", () => {
        it('should detect an authenticated user if Authorization header is present', async () => {
            const request = setupKibanaRequestMock({ headers: { authorization: "Bearer token" } });

            const toolkit = setupHttpToolkitMock();


            await authManager.checkAuth(request, {}, toolkit);

            expect(toolkit.next).toBeCalled();
        });

        it('should pass request as authenticated if the route does not require authentication', async () => {
            const request = setupKibanaRequestMock({ path: unauthenticatedRoutes[0] });

            const toolkit = setupHttpToolkitMock();

            await authManager.checkAuth(request, {}, toolkit);

            expect(toolkit.next).toBeCalled()
        });

        it('should process request with a checkAuth dedicated for AuthInstance if detected by a request', async () => {
            // Register an AuthType detected by Request
            let mockAuthTypeDetectedByRequest = {
                checkAuth: jest.fn(),
                detectCredentialsByRequest: jest.fn(() => ({
                    mode: 'mock'
                }))
            }

            authManager.registerAuthInstance('mock', mockAuthTypeDetectedByRequest);

            const request = setupKibanaRequestMock({ path: '/' });

            await authManager.checkAuth(request, setupHttpResponseMock(), setupHttpToolkitMock());

            expect(mockAuthTypeDetectedByRequest.checkAuth).toBeCalled()
        });

        it('should process request with a checkAuth dedicated for AuthInstance if detected by a cookie', async () => {
            // Register an AuthType detected by cookie
            let mockAuthTypeDetectedByCookie = {
                checkAuth: jest.fn(),
                detectCredentialsByRequest: jest.fn(() => null),
            }

            authManager.registerAuthInstance('mockCookie', mockAuthTypeDetectedByCookie);

            const request = setupKibanaRequestMock({ path: '/' });

            sessionMock.get.mockImplementation(() => ({ authType: 'mockCookie' }));

            await authManager.checkAuth(request, setupHttpResponseMock(), setupHttpToolkitMock());

            expect(mockAuthTypeDetectedByCookie.checkAuth).toBeCalled();

            sessionMock.get.mockRestore();
        });

        it('should pass request without authType as authenticated if anonymous_auth_enabled is true', async () => {
            configServiceMock.get.mockImplementationOnce((route) => {
                if (route === 'searchguard.auth.anonymous_auth_enabled') {
                    return true;
                }
            });

            const request = setupKibanaRequestMock({ path: '/' });

            const toolkit = setupHttpToolkitMock();

            await authManager.checkAuth(request, {}, toolkit);

            expect(toolkit.next).toBeCalled();
        });

        it('should redirect request to loginURL if there is only one available method', async () => {
            configServiceMock.get.mockImplementationOnce((route) => {
                if (route === 'searchguard.auth.anonymous_auth_enabled') {
                    return false;
                }
            });

            const mockAuthConfig = {
                auth_methods: [
                    {
                        "method": "oidc",
                        "id": "example-oidc",
                        "session": true,
                        "label": "OIDC Example Login",
                        "sso_location": "http://example.com/",
                        "sso_context": "oidc_s:mock;oidc_cv:mock"
                    }
                ]
            }

            mockConfig.searchGuardBackend.getAuthConfig.mockImplementationOnce(() => mockAuthConfig);

            const request = setupKibanaRequestMock({ path: '/', query: { nextUrl: '/app/home' } });

            const response = setupHttpResponseMock();

            await authManager.checkAuth(request, response, setupHttpToolkitMock());

            expect(response.redirected).toBeCalledWith({
                headers: {
                    location: mockAuthConfig.auth_methods[0].sso_location
                }
            });
        });

        it('should redirect request to default loginURL if method has auto_select property', async () => {
            configServiceMock.get.mockImplementationOnce((route) => {
                if (route === 'searchguard.auth.anonymous_auth_enabled') {
                    return false;
                }
            });

            const mockAuthConfig = {
                auth_methods: [
                    {
                        "method": "oidc",
                        "id": "example-oidc",
                        "session": true,
                        "label": "OIDC Example Login",
                        "sso_location": "http://example.com/",
                        "sso_context": "oidc_s:mock;oidc_cv:mock"
                    },
                    {
                        "method": "oidc",
                        "id": "example-oidc2",
                        "auto_select": true,
                        "session": true,
                        "label": "OIDC Default Login",
                        "sso_location": "http://example2.com/",
                        "sso_context": "oidc_s:mock;oidc_cv:mock"
                    }
                ]
            }

            mockConfig.searchGuardBackend.getAuthConfig.mockImplementationOnce(() => mockAuthConfig);

            const request = setupKibanaRequestMock({ path: '/', query: { nextUrl: '/app/home' } });

            const response = setupHttpResponseMock();

            await authManager.checkAuth(request, response, setupHttpToolkitMock());

            expect(response.redirected).toBeCalledWith({
                headers: {
                    location: mockAuthConfig.auth_methods[1].sso_location
                }
            });
        });
    });
});
