const pluginRoot = require('requirefrom')('');
import { resolve, join, sep } from 'path';
import { has } from 'lodash';
import indexTemplate from './lib/elasticsearch/setup_index_template';
import { migrateTenants } from './lib/multitenancy/migrate_tenants';
import { version as sgVersion } from './package.json';

export default function (kibana) {

    let APP_ROOT;
    let API_ROOT;
    let authenticationBackend;
    let searchGuardConfiguration;


    return new kibana.Plugin({
        name: 'searchguard',
        id: 'searchguard',
        require: ['kibana', 'elasticsearch'],

        config: function (Joi) {
            var obj = Joi.object({
                enabled: Joi.boolean().default(true),
                allow_client_certificates: Joi.boolean().default(false),
                readonly_mode: Joi.object().keys({
                    roles: Joi.array().default([]),
                }).default(),
                xff: Joi.object().keys({
                    enabled: Joi.boolean().default(false),
                }).default(),
                cookie: Joi.object().keys({
                    secure: Joi.boolean().default(false),
                    name: Joi.string().default('searchguard_authentication'),
                    password: Joi.string().min(32).default('searchguard_cookie_default_password'),
                    ttl: Joi.number().integer().min(0).default(60 * 60 * 1000),
                    domain: Joi.string(),
                    isSameSite: Joi.valid('Strict', 'Lax').allow(false).default(false),
                }).default(),
                session: Joi.object().keys({
                    ttl: Joi.number().integer().min(0).default(60 * 60 * 1000),
                    keepalive: Joi.boolean().default(true),
                }).default(),
                auth: Joi.object().keys({
                    type: Joi.string().valid(['', 'basicauth', 'jwt', 'openid', 'saml', 'proxy', 'kerberos', 'proxycache']).default(''),
                    anonymous_auth_enabled: Joi.boolean().default(false),
                    unauthenticated_routes: Joi.array().default(["/api/status"]),
                    logout_url: Joi.string().allow('').default(''),
                }).default(),
                basicauth: Joi.object().keys({
                    enabled: Joi.boolean().default(true),
                    unauthenticated_routes: Joi.array().default(["/api/status"]),
                    forbidden_usernames: Joi.array().default([]),
                    header_trumps_session: Joi.boolean().default(false),
                    alternative_login: Joi.object().keys({
                        headers: Joi.array().default([]),
                        show_for_parameter: Joi.string().allow('').default(''),
                        valid_redirects: Joi.array().default([]),
                        button_text: Joi.string().default('Login with provider'),
                        buttonstyle: Joi.string().allow('').default("")
                    }).default(),
                    loadbalancer_url: Joi.string().allow('', null).default(null),
                    login: Joi.object().keys({
                        title: Joi.string().allow('').default('Please login to Kibana'),
                        subtitle: Joi.string().allow('').default('If you have forgotten your username or password, please ask your system administrator'),
                        showbrandimage: Joi.boolean().default(true),
                        brandimage: Joi.string().default("/plugins/searchguard/assets/searchguard_logo.svg"),
                        buttonstyle: Joi.string().allow('').default("")
                    }).default(),
                }).default(),
                multitenancy: Joi.object().keys({
                    enabled: Joi.boolean().default(false),
                    show_roles: Joi.boolean().default(false),
                    enable_filter: Joi.boolean().default(false),
                    debug: Joi.boolean().default(false),
                    tenants: Joi.object().keys({
                        enable_private: Joi.boolean().default(true),
                        enable_global: Joi.boolean().default(true),
                        preferred: Joi.array(),
                    }).default(),
                }).default(),
                configuration: Joi.object().keys({
                    enabled: Joi.boolean().default(true)
                }).default(),
                accountinfo: Joi.object().keys({
                    enabled: Joi.boolean().default(false)
                }).default(),
                openid: Joi.object().keys({
                    connect_url: Joi.string(),
                    header: Joi.string().default('Authorization'),
                    client_id: Joi.string(),
                    client_secret: Joi.string().allow('').default(''),
                    scope: Joi.string().default('openid profile email address phone'),
                    base_redirect_url: Joi.string().allow('').default(''),
                    logout_url: Joi.string().allow('').default(''),
                    root_ca: Joi.string().allow('').default(''),
                    verify_hostnames: Joi.boolean().default(true)
                }).default().when('auth.type', {
                    is: 'openid',
                    then: Joi.object({
                        client_id: Joi.required(),
                        connect_url: Joi.required()
                    })
                }),
                proxycache: Joi.object().keys({
                    user_header: Joi.string(),
                    roles_header: Joi.string(),
                    proxy_header: Joi.string().default('x-forwarded-for'),
                    proxy_header_ip: Joi.string(),
                    login_endpoint: Joi.string().allow('', null).default(null),
                }).default().when('auth.type', {
                    is: 'proxycache',
                    then: Joi.object({
                        user_header: Joi.required(),
                        roles_header: Joi.required(),
                        proxy_header_ip: Joi.required()
                    })
                }),
                jwt: Joi.object().keys({
                    enabled: Joi.boolean().default(false),
                    login_endpoint: Joi.string(),
                    url_param: Joi.string().default('authorization'),
                    header: Joi.string().default('Authorization')
                }).default()
            }).default();
            return obj;
        },

        deprecations: function () {
            return [
                (settings, log) => {
                    if (has(settings, 'basicauth.enabled')) {
                        log('Config key "searchguard.basicauth.enabled" is deprecated. Please use "searchguard.auth.type" instead.');
                    }

                    if (has(settings, 'jwt.enabled')) {
                        log('Config key "searchguard.jwt.enabled" is deprecated. Please use "searchguard.auth.type" instead.');
                    }
                }
            ];
        },

        uiExports: {
            hacks: [
                'plugins/searchguard/chrome/readonly/enable_readonly',
                'plugins/searchguard/chrome/multitenancy/enable_multitenancy',
                'plugins/searchguard/chrome/accountinfo/enable_accountinfo',
                'plugins/searchguard/chrome/logout_button',
                'plugins/searchguard/chrome/configuration/enable_configuration',
                'plugins/searchguard/services/access_control',
                'plugins/searchguard/customizations/enable_customizations.js'
            ],
            replaceInjectedVars: async function(originalInjectedVars, request, server) {
                const authType = server.config().get('searchguard.auth.type');
                // Make sure sgDynamic is always available to the frontend, no matter what
                // Remember that these values are only updated on page load.
                let sgDynamic = {};
                let userInfo = null;

                try {
                    // If the user is authenticated, just get the regular values
                    if(request.auth.sgSessionStorage.isAuthenticated()) {
                        let sessionCredentials = request.auth.sgSessionStorage.getSessionCredentials();
                        userInfo = {
                            username: sessionCredentials.username,
                            isAnonymousAuth: sessionCredentials.isAnonymousAuth
                        };
                    } else if (['', 'kerberos', 'proxy'].indexOf(authType) > -1) {
                        // We should be able to use this with kerberos and proxy too
                        try {
                            let authInfo = await request.auth.sgSessionStorage.getAuthInfo();
                            userInfo = {
                                username: authInfo.user_name
                            };
                        } catch(error) {
                            // Not authenticated, so don't do anything
                        }
                    }

                    if (userInfo) {
                        sgDynamic.user = userInfo;
                    }
                } catch (error) {
                    // Don't to anything here.
                    // If there's an error, it's probably because x-pack security is enabled.
                }

                if(server.config().get('searchguard.multitenancy.enabled')) {
                    let currentTenantName = 'global';
                    let currentTenant = '';
                    if (typeof request.headers['sgtenant'] !== 'undefined') {
                        currentTenant = request.headers['sgtenant'];
                    } else if (request.headers['sg_tenant'] !== 'undefined') {
                        currentTenant = request.headers['sg_tenant'];
                    }

                    currentTenantName = currentTenant;

                    if (currentTenant === '') {
                        currentTenantName = 'global';
                    } else if (currentTenant === '__user__') {
                        currentTenantName = 'private';
                    }

                    sgDynamic.multiTenancy = {
                        currentTenantName: currentTenantName,
                        currentTenant: currentTenant
                    };
                }

                return {
                    ...originalInjectedVars,
                    sgDynamic
                }
            },
            apps: [
                {
                    id: 'searchguard-login',
                    title: 'Login',
                    main: 'plugins/searchguard/apps/login/login',
                    hidden: true,
                    auth: false
                },
                {
                    id: 'searchguard-customerror',
                    title: 'CustomError',
                    main: 'plugins/searchguard/apps/customerror/customerror',
                    hidden: true,
                    auth: false
                },
                {
                    id: 'searchguard-multitenancy',
                    title: 'Tenants',
                    main: 'plugins/searchguard/apps/multitenancy/multitenancy',
                    hidden: false,
                    auth: true,
                    order: 9010,
                    icon: 'plugins/searchguard/assets/networking.svg',
                    linkToLastSubUrl: false,
                    url: '/app/searchguard-multitenancy#/'
                },
                {
                    id: 'searchguard-accountinfo',
                    title: 'Account',
                    main: 'plugins/searchguard/apps/accountinfo/accountinfo',
                    hidden: false,
                    auth: true,
                    order: 9020,
                    icon: 'plugins/searchguard/assets/info.svg',
                    linkToLastSubUrl: false,
                    url: '/app/searchguard-accountinfo#/'
                },
                {
                    id: 'searchguard-configuration',
                    title: 'Search Guard Configuration',
                    main: 'plugins/searchguard/apps/configuration-react',
                    order: 9010,
                    auth: true,
                    icon: 'plugins/searchguard/assets/logo_left_navbar.svg',
                    linkToLastSubUrl: false,
                    url: '/app/searchguard-configuration#/'
                }
            ],
            chromeNavControls: [
                'plugins/searchguard/chrome/btn_logout/btn_logout.js'
            ]
            ,
            injectDefaultVars(server, options) {
                options.multitenancy_enabled = server.config().get('searchguard.multitenancy.enabled');
                options.accountinfo_enabled = server.config().get('searchguard.accountinfo.enabled');
                options.basicauth_enabled = server.config().get('searchguard.basicauth.enabled');
                options.kibana_index = server.config().get('kibana.index');
                options.kibana_server_user = server.config().get('elasticsearch.username');
                options.sg_version = sgVersion;

                return options;
            }

        },

        async init(server, options) {

            APP_ROOT = '';
            API_ROOT = `${APP_ROOT}/api/v1`;
            const config = server.config();

            // If X-Pack is installed it needs to be disabled for Search Guard to run.
            try {
                let xpackInstalled = false;
                Object.keys(server.plugins).forEach((plugin) => {
                    if (plugin.toLowerCase().indexOf('xpack') > -1) {
                        xpackInstalled = true;
                    }
                });

                if (xpackInstalled && config.get('xpack.security.enabled') !== false) {
                    // It seems like X-Pack is installed and enabled, so we show an error message and then exit.
                    this.status.red("X-Pack Security needs to be disabled for Search Guard to work properly. Please set 'xpack.security.enabled' to false in your kibana.yml");
                    return false;
                }
            } catch (error) {
                server.log(['error', 'searchguard'], `An error occurred while making sure that X-Pack isn't enabled`);
            }


            // all your routes are belong to us
            require('./lib/auth/routes_authinfo')(pluginRoot, server, this, APP_ROOT, API_ROOT);

            // provides authentication methods against Search Guard
            const BackendClass = pluginRoot(`lib/backend/searchguard`);
            const searchguardBackend = new BackendClass(server, server.config);
            server.expose('getSearchGuardBackend', () => searchguardBackend);

            // provides configuration methods against Search Guard
            const ConfigurationBackendClass = pluginRoot(`lib/configuration/backend/searchguard_configuration_backend`);
            const searchguardConfigurationBackend = new ConfigurationBackendClass(server, server.config);
            server.expose('getSearchGuardConfigurationBackend', () => searchguardConfigurationBackend);

            let authType = config.get('searchguard.auth.type');
            let authClass = null;

            // For legacy code
            if (! authType) {
                if (config.get('searchguard.basicauth.enabled')) {
                    authType = 'basicauth';
                } else if(config.get('searchguard.jwt.enabled')) {
                    authType = 'jwt';
                }

                // Dynamically update the auth.type to make it available to the frontend
                if (authType) {
                    config.set('searchguard.auth.type', authType);
                }
            }

            // Set up the storage cookie
            let storageCookieConf = {
                path: '/',
                ttl: null, // Cookie deleted when the browser is closed
                password: config.get('searchguard.cookie.password'),
                encoding: 'iron',
                isSecure: config.get('searchguard.cookie.secure'),
                isSameSite: config.get('searchguard.cookie.isSameSite')
            };

            if (config.get('searchguard.cookie.domain')) {
                storageCookieConf["domain"] = config.get('searchguard.cookie.domain');
            }

            server.state('searchguard_storage', storageCookieConf);



            if (authType && authType !== '' && ['basicauth', 'jwt', 'openid', 'saml', 'proxycache'].indexOf(authType) > -1) {
                try {
                    await server.register({
                        plugin: require('hapi-auth-cookie')
                    });
                    this.status.yellow('Initialising Search Guard authentication plugin.');

                    if (config.get("searchguard.cookie.password") == 'searchguard_cookie_default_password') {
                        this.status.yellow("Default cookie password detected, please set a password in kibana.yml by setting 'searchguard.cookie.password' (min. 32 characters).");
                    }

                    if (!config.get("searchguard.cookie.secure")) {
                        this.status.yellow("'searchguard.cookie.secure' is set to false, cookies are transmitted over unsecure HTTP connection. Consider using HTTPS and set this key to 'true'");
                    }

                    if (authType === 'openid') {
                        let OpenId = require('./lib/auth/types/openid/OpenId');
                        authClass = new OpenId(pluginRoot, server, this, APP_ROOT, API_ROOT);
                    } else if (authType == 'basicauth') {
                        let BasicAuth = require('./lib/auth/types/basicauth/BasicAuth');
                        authClass = new BasicAuth(pluginRoot, server, this, APP_ROOT, API_ROOT);
                    } else if (authType == 'jwt') {
                        let Jwt = require('./lib/auth/types/jwt/Jwt');
                        authClass = new Jwt(pluginRoot, server, this, APP_ROOT, API_ROOT);
                        this.status.yellow("Search Guard copy JWT params registered. This is an Enterprise feature.");
                    } else if (authType == 'saml') {
                        let Saml = require('./lib/auth/types/saml/Saml');
                        authClass = new Saml(pluginRoot, server, this, APP_ROOT, API_ROOT);
                    } else if (authType == 'proxycache') {
                        let ProxyCache = require('./lib/auth/types/proxycache/ProxyCache');
                        authClass = new ProxyCache(pluginRoot, server, this, APP_ROOT, API_ROOT);
                    }

                    if (authClass) {
                        try {
                            // At the moment this is mainly to catch an error where the openid connect_url is wrong
                            await authClass.init();
                        } catch (error) {
                            server.log(['error', 'searchguard'], `An error occurred while enabling session management: ${error}`);
                            this.status.red('An error occurred during initialisation, please check the logs.');
                            return;
                        }

                        this.status.yellow('Search Guard session management enabled.');
                    }
                } catch (error) {
                    server.log(['error', 'searchguard'], `An error occurred registering server plugins: ${error}`);
                    this.status.red('An error occurred during initialisation, please check the logs.');
                    return;
                }


            } else {
                // @todo await/async
                // Register the storage plugin for the other auth types
                server.register({
                    plugin: pluginRoot('lib/session/sessionPlugin'),
                    options: {
                        authType: null,
                    }
                })
            }

            if (authType != 'jwt') {
                this.status.yellow("Search Guard copy JWT params disabled");
            }

            if (config.get('searchguard.xff.enabled')) {
                require('./lib/xff/xff')(pluginRoot, server, this);
                this.status.yellow("Search Guard XFF enabled.");
            }
            if (config.get('searchguard.multitenancy.enabled')) {

                // sanity check - header whitelisted?
                var headersWhitelist = config.get('elasticsearch.requestHeadersWhitelist');
                if (headersWhitelist.indexOf('sgtenant') == -1) {
                    this.status.red('No tenant header found in whitelist. Please add sgtenant to elasticsearch.requestHeadersWhitelist in kibana.yml');
                    return;
                }

                require('./lib/multitenancy/routes')(pluginRoot, server, this, APP_ROOT, API_ROOT);
                require('./lib/multitenancy/headers')(pluginRoot, server, this, APP_ROOT, API_ROOT, authClass);

                let preferenceCookieConf = {
                    ttl: 2217100485000,
                    path: '/',
                    isSecure: false,
                    isHttpOnly: false,
                    clearInvalid: true, // remove invalid cookies
                    strictHeader: true, // don't allow violations of RFC 6265
                    encoding: 'iron',
                    password: config.get("searchguard.cookie.password"),
                    isSameSite: config.get('searchguard.cookie.isSameSite')
                };

                if (config.get('searchguard.cookie.domain')) {
                    preferenceCookieConf["domain"] = config.get('searchguard.cookie.domain');
                }

                server.state('searchguard_preferences', preferenceCookieConf);

                this.status.yellow("Search Guard multitenancy registered. This is an Enterprise feature.");
            } else {
                this.status.yellow("Search Guard multitenancy disabled");
            }

            // Assign auth header after MT
            if (authClass) {
                authClass.registerAssignAuthHeader();
            }

            if (config.get('searchguard.configuration.enabled')) {
                require('./lib/configuration/routes/routes')(pluginRoot, server, APP_ROOT, API_ROOT);
                this.status.yellow("Routes for Search Guard configuration GUI registered. This is an Enterprise feature.");
            } else {
                this.status.yellow("Search Guard configuration GUI disabled");
            }

            require('./lib/system/routes')(pluginRoot, server, APP_ROOT, API_ROOT);
            this.status.yellow('Search Guard system routes registered.');

            // create index template for tenant indices
            if(config.get('searchguard.multitenancy.enabled')) {
                const { setupIndexTemplate, waitForElasticsearchGreen } = indexTemplate(this, server);

                waitForElasticsearchGreen().then( () => {
                    this.status.yellow('Setting up index template.');
                    setupIndexTemplate();
                    migrateTenants(server)
                        .then(  () => {
                            this.status.green('Search Guard plugin version '+ sgVersion + ' initialised.');
                        })
                        .catch((error) => {
                            server.log(['error', 'Search Guard migration'], error);
                            this.status.yellow('Tenant indices migration failed');
                        });

                });

            } else {
                this.status.green('Search Guard plugin version '+ sgVersion + ' initialised.');
            }

            const backend = server.plugins.searchguard.getSearchGuardBackend();
            backend.getKibanaInfoWithInternalUser()
              .then((response) => {
                  if (response && response.not_fail_on_forbidden_enabled !== true) {
                      server.log(['warning', 'searchguard'], '"Do not fail on forbidden" is not enabled. Please refer to the documentation: https://docs.search-guard.com/latest/kibana-plugin-installation#configuring-elasticsearch-enable-do-not-fail-on-forbidden');
                  }
              });

            // Using an admin certificate may lead to unintended consequences
            if ((typeof config.get('elasticsearch.ssl.certificate') !== 'undefined' && typeof config.get('elasticsearch.ssl.certificate') !== false)) {
                if (config.get('searchguard.allow_client_certificates') !== true) {
                    this.status.red("'elasticsearch.ssl.certificate' can not be used without setting 'searchguard.allow_client_certificates' to 'true' in kibana.yml. Please refer to the documentation for more information about the implications of doing so.");
                } else if (config.get('elasticsearch.ssl.alwaysPresentCertificate') === true) {
                    this.status.red("'elasticsearch.ssl.alwaysPresentCertificate' may lead to requests being executed as the user attached to the certificate configured in 'elasticsearch.ssl.certificate'.");
                }
            }
        }
    });
};
