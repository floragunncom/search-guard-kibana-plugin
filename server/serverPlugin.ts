import { first } from 'rxjs/operators';
import {PluginInitializerContext} from "../../../src/core/server/plugins";

import BasicAuth from '../lib/auth/types/basicauth/BasicAuth';
import SearchGuardBackend from '../lib/backend/searchguard';
import SearchGuardConfigurationBackend from '../lib/configuration/backend/searchguard_configuration_backend';

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

        const config = {
            //return {
                legacyValues: {
                    'server.basePath': '',
                },
                get(configKey, defaultValue = undefined) {
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
        /*
        const legacyConfig = await this.initContext.config.legacy.globalConfig$
            .pipe(first())
            .toPromise()
            ;

         */


        // Start auth MVP

        // Set up
        const APP_ROOT = '';
        const API_ROOT = `${APP_ROOT}/api/v1`;


        // @todo Come up with a plan for this
        const legacyEsConfig = {
            username: '',
            password: '',
            // @todo Needed for filtering headers in the client
            requestHeadersWhitelist: ["authorization", 'sgtenant', "sg_impersonate_as", "x-forwarded-for", "x-proxy-user", "x-proxy-roles"]
        }

        // @todo Clean this stuff up
        new AuthInfoRoutes(null, server, null, APP_ROOT, API_ROOT);

        const searchguardBackend = new SearchGuardBackend(core, server, config, legacyEsConfig);
        const searchguardConfigurationBackend = new SearchGuardConfigurationBackend(core, server, config, legacyEsConfig);

        server.plugins.searchguard = {
            getSearchGuardBackend: () => searchguardBackend,
            getSearchGuardConfigurationBackend: () => searchguardConfigurationBackend
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

        // @todo
        const authClass = basicAuth;

        // @todo XFF - check legacyindex

        // MT
        if (config.get('searchguard.multitenancy.enabled')) {
            const headersWhitelist = legacyEsConfig.requestHeadersWhitelist;
            if (headersWhitelist.indexOf('sgtenant') == -1) {
                // @todo Re-implement
                //throw new Error('No tenant header found in whitelist. Please add sgtenant to elasticsearch.requestHeadersWhitelist in kibana.yml');
                //this.status.red('No tenant header found in whitelist. Please add sgtenant to elasticsearch.requestHeadersWhitelist in kibana.yml');
                return;
            }

            require('../lib/multitenancy/routes')(null, server, this, APP_ROOT, API_ROOT, config);
            require('../lib/multitenancy/headers')(null, server, this, APP_ROOT, API_ROOT, authClass, config);

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

            server.state(config.get('searchguard.cookie.preferences_cookie_name'), preferenceCookieConf);
        }



        // @todo Try to refactor this stuff back to onPostAuth, like before 6.5
        basicAuth.registerAssignAuthHeader();

        if (config.get('searchguard.configuration.enabled')) {
            require('../lib/configuration/routes/routes')(null, server, APP_ROOT, API_ROOT, config);
            //this.status.yellow("Routes for Search Guard configuration GUI registered. This is an Enterprise feature.");
        } else {
            // @todo Somehow set status yellow?
            // this.status.yellow("Search Guard configuration GUI disabled");
        }

        require('../lib/system/routes')(null, server, APP_ROOT, API_ROOT, config);
        // @todo Status?
        //this.status.yellow('Search Guard system routes registered.');


        // @todo MT Saved Objects Migration

        // @todo Sanity check - do not fail on forbidden
        // @todo Sanity check - ssl certificates
        // @todo Signals app access
        // @todo Register Signals routes

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