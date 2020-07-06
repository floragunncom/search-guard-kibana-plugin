/* eslint-disable @kbn/eslint/require-license-header */
/**
 *    Copyright 2020 floragunn GmbH

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

import { first } from 'rxjs/operators';
import { defaultsDeep, get } from 'lodash';

import SearchGuardBackend from '../lib/backend/searchguard';
import SearchGuardConfigurationBackend from '../lib/configuration/backend/searchguard_configuration_backend';
import { Signals, Multitenancy } from './applications';

import authInfoRoutes from '../lib/auth/routes_authinfo';
import { ConfigService, readKibanaConfig } from './utils';
import { APP_ROOT, API_ROOT, APP_NAME } from './utils/constants';

export class Plugin {
  constructor(initializerContext) {
    this.logger = initializerContext.logger.get();
    this.initContext = initializerContext;
    this.config$ = initializerContext.config.create();
    this.signalsApp = new Signals(this.initContext);
  }

  async setup(core, pluginDependencies) {
    const router = core.http.createRouter();

    process.on('unhandledRejection', (error) => {
      console.error(error); // This prints error with stack included (as for normal errors)
      throw error; // Following best practices re-throw error and let the process exit with error code
    });
    /**
     * The patched values
     */
    const server = core.hapiServer;

    const [kibanaConfig, pluginConfig] = await Promise.all([
      readKibanaConfig({ isDev: get(this.initContext, 'env.mode.dev', false) }),
      this.config$.pipe(first()).toPromise(),
    ]);

    kibanaConfig[APP_NAME] = defaultsDeep(kibanaConfig[APP_NAME], pluginConfig);
    this.configService = new ConfigService(kibanaConfig);

    const searchGuardBackend = new SearchGuardBackend(core, server, this.configService);
    const searchGuardConfigurationBackend = new SearchGuardConfigurationBackend(
      core,
      server,
      this.configService
    );

    // Inits the authInfo route
    authInfoRoutes(searchGuardBackend, server, APP_ROOT, API_ROOT);

    // Set up the storage cookie
    const storageCookieConf = {
      path: '/',
      ttl: null, // Cookie deleted when the browser is closed
      password: this.configService.get('searchguard.cookie.password'),
      encoding: 'iron',
      isSecure: this.configService.get('searchguard.cookie.secure'),
      isSameSite: this.configService.get('searchguard.cookie.isSameSite'),
    };

    if (this.configService.get('searchguard.cookie.domain')) {
      storageCookieConf.domain = this.configService.get('searchguard.cookie.domain');
    }

    server.state(
      this.configService.get('searchguard.cookie.storage_cookie_name'),
      storageCookieConf
    );

    const authType = this.configService.get('searchguard.auth.type', null);
    let AuthClass = null;
    let authInstance = null;
    if (
      authType &&
      authType !== '' &&
      ['basicauth', 'jwt', 'openid', 'saml', 'proxycache'].indexOf(authType) > -1
    ) {
      try {
        await server.register({
          plugin: require('hapi-auth-cookie'),
        });

        // @todo Replacement for status
        // this.status.yellow('Initialising Search Guard authentication plugin.');

        if (
          this.configService.get('searchguard.cookie.password') ===
          'searchguard_cookie_default_password'
        ) {
          // @todo Replacement for status
          // this.status.yellow("Default cookie password detected, please set a password in kibana.yml by setting 'searchguard.cookie.password' (min. 32 characters).");
        }

        if (!this.configService.get('searchguard.cookie.secure')) {
          // @todo Replacement for status
          // this.status.yellow("'searchguard.cookie.secure' is set to false, cookies are transmitted over unsecure HTTP connection. Consider using HTTPS and set this key to 'true'");
        }

        switch (authType) {
          case 'openid':
            AuthClass = require('../lib/auth/types/openid/OpenId');
            break;

          case 'basicauth':
            AuthClass = require('../lib/auth/types/basicauth/BasicAuth');
            break;

          case 'jwt':
            AuthClass = require('../lib/auth/types/jwt/Jwt');
            break;

          case 'saml':
            AuthClass = require('../lib/auth/types/saml/Saml');
            break;

          case 'proxycache':
            AuthClass = require('../lib/auth/types/proxycache/ProxyCache');
            break;
        }

        if (AuthClass) {
          try {
            // Check that one of the auth types didn't already require an authInstance
            if (!authInstance) {
              // @todo Clean up the null parameters here
              authInstance = new AuthClass(
                searchGuardBackend,
                server,
                APP_ROOT,
                API_ROOT,
                core,
                this.configService
              );
            }

            await authInstance.init();
            // @todo Replacement for status
            // this.status.yellow('Search Guard session management enabled.');
          } catch (error) {
            server.log(
              ['error', 'searchguard'],
              `An error occurred while enabling session management: ${error}`
            );
            // @todo Replacement for status.red
            // this.status.red('An error occurred during initialisation, please check the logs.');
            return;
          }
        }
      } catch (error) {
        server.log(
          ['error', 'searchguard'],
          `An error occurred registering server plugins: ${error}`
        );
        // @todo Replacement for status.red
        // this.status.red('An error occurred during initialisation, please check the logs.');
        return;
      }
    } else {
      // Register the storage plugin for the other auth types
      await server.register({
        plugin: require('../lib/session/sessionPlugin'),
        options: {
          searchGuardBackend: searchGuardBackend,
          authType: null,
          storageCookieName: this.configService.get('searchguard.cookie.storage_cookie_name'),
        },
      });
    }

    // @todo We can probably remove this right?
    if (authType !== 'jwt') {
      // @todo Replacement for status
      // this.status.yellow("Search Guard copy JWT params disabled");
    }

    // @todo TEST
    if (this.configService.get('searchguard.xff.enabled')) {
      require('../lib/xff/xff')(server);
      // @todo Replacement for status
      // this.status.yellow("Search Guard XFF enabled.");
    }

    // MT
    if (this.configService.get('searchguard.multitenancy.enabled')) {
      // ATTENTION! We want to make sure the multitenancy app migrates saved objects
      // in the tenants indices before doing any any operation on indices
      this.multinenancyApp = new Multitenancy(this.initContext);

      try {
        await this.multinenancyApp.setup({
          hapiServer: core.hapiServer,
          elasticsearch: core.elasticsearch,
          configService: this.configService,
          spacesPlugin: pluginDependencies.spaces || null,
          router,
          authInstance,
          searchGuardBackend,
        });
      } catch (error) {
        this.logger.error(error);
        throw new Error(error);
      }
    }

    // @todo Try to refactor this stuff back to onPostAuth, like before 6.5
    if (authInstance) {
      authInstance.registerAssignAuthHeader();
    }

    if (this.configService.get('searchguard.configuration.enabled')) {
      require('../lib/configuration/routes/routes')(
        searchGuardConfigurationBackend,
        server,
        APP_ROOT,
        API_ROOT
      );
      // this.status.yellow("Routes for Search Guard configuration GUI registered. This is an Enterprise feature.");
    } else {
      // @todo Somehow set status yellow?
      // this.status.yellow("Search Guard configuration GUI disabled");
    }

    require('../lib/system/routes')(
      searchGuardBackend,
      server,
      APP_ROOT,
      API_ROOT,
      this.configService
    );
    // @todo Status?
    // this.status.yellow('Search Guard system routes registered.');

    // @todo Sanity check - do not fail on forbidden
    // @todo Sanity check - ssl certificates
    // @todo Signals app access
    this.signalsApp.setup({
      core,
      router,
      hapiServer: core.hapiServer,
      searchguardBackendService: searchGuardBackend,
    });

    return {
      something: 'returned',
    };
  }

  async start(core) {
    try {
      if (this.configService.get('searchguard.multitenancy.enabled')) {
        await this.multinenancyApp.start(core.savedObjects);
      } else {
        this.logger.info('Multitenancy is disabled');
      }
    } catch (error) {
      this.logger.error(error);
      throw new Error(error);
    }

    return {
      something: 'returned',
    };
  }

  stop() {
    return {
      something: 'returned',
    };
  }
}
