import { AuthManager } from "./AuthManager";

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
        kibanaCore: {
            http: {
                basePath: {
                    get: () => 'http://mockbasepath'
                }
            }
        },
        sessionStorageFactory: {
            asScoped: () => sessionMock
        },
        pluginDependencies: {},
        logger: {},
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

    describe("checkAuth()", () => {
        it('should detect an authenticated user if Authorization header is present', async () => {
            const request = {
                headers: {
                    authorization: "Bearer token"
                },
            };

            const response = {};

            const toolkit = {
                authenticated: jest.fn(),
                notHandled: jest.fn()
            }


            await authManager.checkAuth(request, response, toolkit);

            expect(toolkit.authenticated).toBeCalledWith({
                requestHeaders: {
                    authorization: request.headers.authorization
                }
            })
        });

        it("should detect unhandled route", async () => {
            const request = {
                headers: {},
                url: {
                    pathname: "/customerror" // An example route from this.routesToIgnore
                }
            };

            const response = {
                redirected: jest.fn()
            };

            const toolkit = {
                authenticated: jest.fn(),
                notHandled: jest.fn()
            }

            await authManager.checkAuth(request, response, toolkit);

            expect(toolkit.notHandled).toBeCalled()
        });

        it('should pass request as authenticated if the route does not require authentication', async () => {
            const request = {
                headers: {},
                url: {
                    pathname: unauthenticatedRoutes[0]
                }
            };

            const response = {};

            const toolkit = {
                authenticated: jest.fn(),
                notHandled: jest.fn()
            }

            await authManager.checkAuth(request, response, toolkit);

            expect(toolkit.authenticated).toBeCalled()
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

            const request = {
                headers: {},
                url: {
                    pathname: ""
                }
            };

            const response = {};

            const toolkit = {
                authenticated: jest.fn(),
                notHandled: jest.fn()
            }
            await authManager.checkAuth(request, response, toolkit);

            expect(mockAuthTypeDetectedByRequest.checkAuth).toBeCalled()
        });

        it('should process request with a checkAuth dedicated for AuthInstance if detected by a cookie', async () => {
            // Register an AuthType detected by cookie
            let mockAuthTypeDetectedByCookie = {
                checkAuth: jest.fn(),
                detectCredentialsByRequest: jest.fn(() => null),
            }

            authManager.registerAuthInstance('mockCookie', mockAuthTypeDetectedByCookie);

            const request = {
                headers: {},
                url: {
                    pathname: ""
                }
            };

            const response = {};

            const toolkit = {
                authenticated: jest.fn(),
                notHandled: jest.fn()
            }

            sessionMock.get.mockImplementation(() => ({ authType: 'mockCookie' }));

            await authManager.checkAuth(request, response, toolkit);

            expect(mockAuthTypeDetectedByCookie.checkAuth).toBeCalled();

            sessionMock.get.mockRestore();
        });

        it('should pass request without authType as authenticated if anonymous_auth_enabled is true', async () => {
            configServiceMock.get.mockImplementationOnce((route) => {
                if (route === 'searchguard.auth.anonymous_auth_enabled') {
                    return true;
                }
            });

            const request = {
                headers: {},
                url: {
                    pathname: "",
                }
            };

            const response = {};

            const toolkit = {
                authenticated: jest.fn(),
                notHandled: jest.fn()
            };

            await authManager.checkAuth(request, response, toolkit);

            expect(toolkit.authenticated).toBeCalled();
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

            const request = {
                headers: {},
                url: {
                    pathname: "",
                    search: "nextUrl"
                }
            };

            const response = {
                redirected: jest.fn()
            };

            const toolkit = {
                authenticated: jest.fn(),
                notHandled: jest.fn()
            };

            await authManager.checkAuth(request, response, toolkit);

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

            const request = {
                headers: {},
                url: {
                    pathname: "",
                    search: "nextUrl"
                }
            };

            const response = {
                redirected: jest.fn()
            };

            const toolkit = {
                authenticated: jest.fn(),
                notHandled: jest.fn()
            };

            await authManager.checkAuth(request, response, toolkit);

            expect(response.redirected).toBeCalledWith({
                headers: {
                    location: mockAuthConfig.auth_methods[1].sso_location
                }
            });
        });
    });
});
