import { first } from 'rxjs/operators';
import {PluginInitializerContext} from "../../../src/core/server/plugins";

import BasicAuth from '../lib/auth/types/basicauth/BasicAuth';
import SearchGuardBackend from '../lib/backend/searchguard';
import AuthInfoRoutes from '../lib/auth/routes_authinfo';

export class Plugin {


    constructor(initializerContext: PluginInitializerContext) {
        this.logger = initializerContext.logger.get();

        this.initContext = initializerContext;
        this.config$ = initializerContext.config.create();

    }

    async setup(core) {
        process.on("unhandledRejection", (error) => {
            console.error(error); // This prints error with stack included (as for normal errors)
            throw error; // Following best practices re-throw error and let the process exit with error code
        });
        /**
         * The patched values
         */
        const hapi = core.hapi;
        const server = hapi.server;


        const configValues = await this.config$.pipe(first()).toPromise();
        // @todo Dummy for development
        const config = {
            //return {
                legacyValues: {
                    'server.basePath': '',

                    // Auth
                    'auth.unauthenticated_routes': [
                        '/api/status'
                    ],
                    'auth.type': 'basicauth',
                    'auth.anonymous_auth_enabled': false,
                    'auth.logout_url': '',

                    // Sessions
                    'session.ttl': 60 * 60 * 1000,
                    'session.keepalive': true,

                    // Cookie
                    'cookie.secure': false,
                    'cookie.name': 'searchguard_authentication',
                    'cookie.storage_cookie_name': 'searchguard_storage',
                    'cookie.preferences_cookie_name': 'searchguard_preferences',
                    'cookie.password': 'searchguard_cookie_default_password',
                    'cookie.ttl': 60 * 60 * 1000,
                    'cookie.domain': null,
                    'cookie.isSameSite': false,

                    // Basic auth
                    'basicauth.forbidden_usernames': [],
                    'basicauth.allowed_usernames': null,
                    'basicauth.header_trumps_session': false,
                    'basicauth.loadbalancer_url': null,
                    'basicauth.alternative_login.headers': [],
                    // @todo Alternative basic auth login

                    // Multitenancy
                    'multitenancy.enabled': false,

                },
                values: {
                    basicauth: {
                        forbidden_usernames: ['yihaa'],
                        allowed_usernames: null,
                        header_trumps_session: false,
                        loadbalancer_ur: null,
                        alternative_login: {
                            headers: []
                        }
                    }
                },
                get(configKey, defaultValue = null) {
                    // Remove the searchguard prefix if available
                    if (configKey.indexOf('searchguard.') === 0) {
                        configKey = configKey.replace('searchguard.', '');
                    }

                    const result = configKey
                      .split('.')
                      .reduce((o, key) => {
                          if (o && typeof o[key] !== undefined) {
                              return o[key];
                          }

                          return;

                      }, configValues);

                    if (typeof result !== 'undefined') {
                        return result;
                    }

                    if (typeof this.legacyValues[configKey] !== 'undefined') {
                        return this.legacyValues[configKey];
                    }

                    console.log('Somebody wanted missing configKey: ', {configKey})

                    return defaultValue;
                }
            //}
        }


        // @todo Come up with a plan for this
        const legacyConfig = await this.initContext.config.legacy.globalConfig$
            .pipe(first())
            .toPromise()
            ;


        // Start auth MVP

        // Set up
        const APP_ROOT = '';
        const API_ROOT = `${APP_ROOT}/api/v1`;


        // @todo Come up with a plan for this
        const legacyEsConfig = {
            username: '',
            password: '',
            // @todo Needed for filtering headers in the client
            requestHeadersWhitelist: ["authorization", "sgtenant", "sg_impersonate_as", "x-forwarded-for", "x-proxy-user", "x-proxy-roles"]
        }

        // @todo Clean this stuff up
        new AuthInfoRoutes(null, server, null, APP_ROOT, API_ROOT);

        const backendClass: SearchGuardBackend = new SearchGuardBackend(core, server, config, legacyEsConfig);

        server.plugins.searchguard = {
            getSearchGuardBackend: () => backendClass
        };


        await server.register({
            plugin: require('hapi-auth-cookie')
        });


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

        server.state(config.get('searchguard.cookie.storage_cookie_name'), storageCookieConf);

        const basicAuth = new BasicAuth(null, server, null, APP_ROOT, API_ROOT, core, config)
        await basicAuth.init();
        // @todo Try to refactor this stuff back to onPostAuth, like before 6.5
        basicAuth.registerAssignAuthHeader();

        return {
            something: 'returned'
        }

    }

    start(core) {

        return {
            something: 'returned'
        }
    }

    stop() {
        return {
            something: 'returned'
        }
    }
}