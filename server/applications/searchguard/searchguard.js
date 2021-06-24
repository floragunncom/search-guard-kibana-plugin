/* eslint-disable @kbn/eslint/require-license-header */
import { registerRoutes } from './routes';
import { Kerberos } from './auth/types';
import { defineAuthInfoRoutes } from './auth/routes_authinfo';
import { defineSystemRoutes } from './system/routes';
import { defineConfigurationRoutes } from './configuration/routes/routes';
import {
  checkDoNotFailOnForbidden,
  checkXPackSecurityDisabled,
  checkCookieConfig,
  checkTLSConfig,
} from './sanity_checks';
import { getSecurityCookieOptions, extendSecurityCookieOptions } from './session/security_cookie';
import { ReadOnlyMode } from './authorization/ReadOnlyMode';
import { AuthManager } from './auth/AuthManager';
import { defineAuthRoutes } from './auth/routes_auth';

export class SearchGuard {
  constructor(coreContext) {
    this.coreContext = coreContext;
    this.logger = this.coreContext.logger.get('searchguard');
  }

  async setup({
    core,
    pluginDependencies,
    configService,
    kibanaRouter,
    searchGuardBackend,
    searchGuardConfigurationBackend,
  }) {
    this.logger.debug('Setup app');

    try {
      // Sanity checks
      checkTLSConfig({ configService, logger: this.logger });
      checkCookieConfig({ configService, logger: this.logger });
      checkXPackSecurityDisabled({ pluginDependencies, logger: this.logger });
      checkDoNotFailOnForbidden({
        searchGuardBackend,
        logger: this.logger,
      });

      // Inits the authInfo route
      defineAuthInfoRoutes({
        searchGuardBackend,
        kibanaCore: core,
        logger: this.logger,
      });

      registerRoutes({
        router: kibanaRouter,
        config: configService.getConfig(),
        logger: this.logger,
      });

      const cookieOptions = getSecurityCookieOptions(configService);
      const sessionStorageFactory = await core.http.createCookieSessionStorageFactory(
        cookieOptions
      );

      // We must extend the cookie options.
      // Because Kibana doesn't support all the options we need.
      extendSecurityCookieOptions(cookieOptions);
      const authType = configService.get('searchguard.auth.type', null);
      /* @todo Use the API endpoint to get the config. Probably move this to the auth manager.
      const username = configService.get('elasticsearch.username');
      const password = configService.get('elasticsearch.password');
      const authConfig = await searchGuardBackend.getAuthConfig(username, password);
       */

      let authManager = null;

      // @todo How to handle Proxy?
      // Handle Kerberos separately because we don't want to bring up entire jungle from AuthType here.
      if (authType === 'kerberos') {
        core.http.registerAuth(
          new Kerberos({
            pluginDependencies,
            config: configService,
            searchGuardBackend,
            logger: this.coreContext.logger.get('searchguard-kerberos-auth'),
          }).checkAuth
        );
      } else if (authType !== 'proxy') {
        authManager = new AuthManager({
          kibanaCore: core,
          sessionStorageFactory,
          pluginDependencies,
          logger: this.coreContext.logger.get('searchguard-auth'),
          searchGuardBackend,
          configService,
        });
        authManager.registerAuthInstances();
        defineAuthRoutes({ kibanaCore: core, authManager, searchGuardBackend, configService });
        if (authManager) {
          // authManager.onPreAuth needs to run before any other handler
          // that manipulates the request headers (e.g. MT)
          core.http.registerOnPreAuth(authManager.onPreAuth);
          core.http.registerAuth(authManager.checkAuth);
        }
      }

      if (authType && ['proxy', 'kerberos'].indexOf(authType) === -1) {
        try {
          this.logger.info('Initialising Search Guard authentication plugin.');

          if (
            configService.get('searchguard.cookie.password') ===
            'searchguard_cookie_default_password'
          ) {
            this.logger.warn(
              "Default cookie password detected, please set a password in kibana.yml by setting 'searchguard.cookie.password' (min. 32 characters)."
            );
          }

          if (!configService.get('searchguard.cookie.secure')) {
            this.logger.warn(
              "'searchguard.cookie.secure' is set to false, cookies are transmitted over unsecure HTTP connection. Consider using HTTPS and set this key to 'true'"
            );
          }
        } catch (error) {
          this.logger.error(`An error occurred registering server plugins: ${error}`);
          throw error;
        }
      }

      if (!configService.get('searchguard.jwt.enabled')) {
        this.logger.warn('Search Guard copy JWT params disabled');
      }

      // @todo TEST
      if (configService.get('searchguard.xff.enabled')) {
        require('./xff/xff')(core);
        this.logger.info('Search Guard XFF enabled.');
      }

      if (configService.get('searchguard.configuration.enabled')) {
        defineConfigurationRoutes({
          searchGuardConfigurationBackend,
          logger: this.logger,
          kibanaCore: core,
        });
        this.logger.info(
          'Routes for Search Guard configuration GUI registered. This is an Enterprise feature.'
        );
      } else {
        this.logger.warn('Search Guard configuration GUI disabled');
      }

      defineSystemRoutes({
        searchGuardBackend,
        logger: this.logger,
        kibanaCore: core,
      });

      this.logger.info('Search Guard system routes registered.');

      if (configService.get('searchguard.readonly_mode.enabled')) {
        const readOnlyMode = new ReadOnlyMode(this.coreContext.logger.get('searchguard-readonly'));
        readOnlyMode.setupSync({
          kibanaCoreSetup: core,
          searchGuardBackend,
          configService,
        });
      }

      return { authManager, sessionStorageFactory };
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
