const pluginRoot = require('requirefrom')('');
import { resolve, join, sep } from 'path';
import indexTemplate from './lib/elasticsearch/setup_index_template';

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
                cookie: Joi.object().keys({
                    secure: Joi.boolean().default(false),
                    name: Joi.string().default('searchguard_authentication'),
                    password: Joi.string().min(32).default('searchguard_cookie_default_password'),
                    ttl: Joi.number().integer().min(0).default(60 * 60 * 1000),
                }).default(),
                session: Joi.object().keys({
                    ttl: Joi.number().integer().min(0).default(60 * 60 * 1000),
                    keepalive: Joi.boolean().default(true),
                }).default(),
                basicauth: Joi.object().keys({
                    enabled: Joi.boolean().default(true),
                    unauthenticated_routes: Joi.array().default(["/api/status"]),
                    forbidden_usernames: Joi.array().default([]),
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
                    tenants: Joi.object().keys({
                        enable_private: Joi.boolean().default(true),
                        enable_global: Joi.boolean().default(true),
                        preferred: Joi.array(),
                    }).default(),
                }).default(),
                configuration: Joi.object().keys({
                    enabled: Joi.boolean().default(true)
                }).default(),
                jwt: Joi.object().keys({
                    enabled: Joi.boolean().default(false),
                    url_param: Joi.string().default('authorization'),
                    header: Joi.string().default('Authorization')
                }).default()
            }).default();
            return obj;
        },

        uiExports: {
            hacks: [
                'plugins/searchguard/chrome/readonly/enable_readonly',
                'plugins/searchguard/chrome/multitenancy/enable_multitenancy',
                'plugins/searchguard/chrome/logout_button',
                'plugins/searchguard/chrome/configuration/enable_configuration',
                'plugins/searchguard/services/access_control'
            ],
            apps: [
                {
                    id: 'searchguard-login',
                    title: 'Login',
                    main: 'plugins/searchguard/apps/login/login',
                    hidden: true,
                    auth: false
                }
                ,
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
                    id: 'searchguard-configuration',
                    title: 'Search Guard',
                    main: 'plugins/searchguard/apps/configuration/configuration',
                    order: 9009,
                    auth: true,
                    icon: 'plugins/searchguard/assets/searchguard_logo_nav.svg',
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
                options.basicauth_enabled = server.config().get('searchguard.basicauth.enabled');
                options.kibana_index = server.config().get('kibana.index');
                options.kibana_server_user = server.config().get('elasticsearch.username');

                return options;
            }

        },

        init(server, options) {

            APP_ROOT = '';
            API_ROOT = `${APP_ROOT}/api/v1`;
            const config = server.config();

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

            server.register([require('hapi-async-handler')]);

            if(config.get('searchguard.basicauth.enabled')) {
                server.register([
                    require('hapi-auth-cookie'),
                    require('hapi-authorization')
                ], (error) => {

                    if (error) {
                        server.log(['error', 'searchguard'], `An error occurred registering server plugins: ${error}`);
                        this.status.red('An error occurred during initialisation, please check the logs.');
                        return;
                    }

                    this.status.yellow('Initialising Search Guard authentication plugin.');

                    if(config.get("searchguard.cookie.password") == 'searchguard_cookie_default_password') {
                        this.status.yellow("Default cookie password detected, please set a password in kibana.yml by setting 'searchguard.cookie.password' (min. 32 characters).");
                    }

                    if(!config.get("searchguard.cookie.secure")) {
                        this.status.yellow("'searchguard.cookie.secure' is set to false, cookies are transmitted over unsecure HTTP connection. Consider using HTTPS and set this key to 'true'");
                    }

                    // we use the cookie strategy
                    require('./lib/hapi/auth')(pluginRoot, server, APP_ROOT, API_ROOT);

                    // all your routes are belong to us
                    require('./lib/auth/routes')(pluginRoot, server, this, APP_ROOT, API_ROOT);

                    this.status.yellow('Search Guard session management enabled.');

                });

            } else {
                this.status.yellow('Search Guard session management is disabled.');
            }


            if(config.get('searchguard.multitenancy.enabled')) {

                // sanity check - header whitelisted?
                var headersWhitelist = config.get('elasticsearch.requestHeadersWhitelist');
                if (headersWhitelist.indexOf('sgtenant') == -1) {
                    this.status.red('No tenant header found in whitelist. Please add sgtenant to elasticsearch.requestHeadersWhitelist in kibana.yml');
                    return;
                }

                require('./lib/multitenancy/routes')(pluginRoot, server, this, APP_ROOT, API_ROOT);
                require('./lib/multitenancy/headers')(pluginRoot, server, this, APP_ROOT, API_ROOT);

                server.state('searchguard_preferences', {
                    ttl: 2217100485000,
                    path: '/',
                    isSecure: false,
                    isHttpOnly: false,
                    clearInvalid: true, // remove invalid cookies
                    strictHeader: true, // don't allow violations of RFC 6265
                    encoding: 'iron',
                    password: config.get("searchguard.cookie.password")
                });

                server.state('searchguard_tenant', {
                    ttl: null,
                    path: '/',
                    isSecure: false,
                    isHttpOnly: false,
                    clearInvalid: true, // remove invalid cookies
                    strictHeader: true, // don't allow violations of RFC 6265
                    encoding: 'iron',
                    password: config.get("searchguard.cookie.password")
                });

                this.status.yellow("Search Guard multitenancy registered. This is an Enterprise feature.");
            } else {
                this.status.yellow("Search Guard multitenancy disabled");
            }

            if(config.get('searchguard.jwt.enabled')) {

                require('./lib/jwt/headers')(pluginRoot, server, this, APP_ROOT, API_ROOT);

                server.state('searchguard_jwt', {
                    ttl: null,
                    path: '/',
                    isSecure: false,
                    isHttpOnly: false,
                    clearInvalid: true, // remove invalid cookies
                    strictHeader: true, // don't allow violations of RFC 6265
                    encoding: 'iron',
                    password: config.get("searchguard.cookie.password")
                });

                this.status.yellow("Search Guard copy JWT params registered. This is an Enterprise feature.");
            } else {
                this.status.yellow("Search Guard copy JWT params disabled");
            }

            if(config.get('searchguard.configuration.enabled')) {
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
                    this.status.green('Search Guard plugin initialised.');
                });

            } else {
                this.status.green('Search Guard plugin initialised.');
            }

            // Using an admin certificate may lead to unintended consequences
            if ((typeof config.get('elasticsearch.ssl.certificate') !== 'undefined' && typeof config.get('elasticsearch.ssl.certificate') !== false) && config.get('searchguard.allow_client_certificates') !== true) {
                this.status.red("'elasticsearch.ssl.certificate' can not be used without setting 'searchguard.allow_client_certificates' to 'true' in kibana.yml. Please refer to the documentation for more information about the implications of doing so.");
            }

        }
    });
};
