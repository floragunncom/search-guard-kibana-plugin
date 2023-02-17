/* eslint-disable @osd/eslint/require-license-header */
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

export class Security {
  constructor(coreContext) {
    this.coreContext = coreContext;
    this.logger = this.coreContext.logger.get('security');
  }

  async setup({
    core,
    pluginDependencies,
    configService,
    kibanaRouter,
    eliatraSuiteBackend,
    eliatraSuiteConfigurationBackend,
  }) {
    this.logger.debug('Setup app');

    try {
      // Sanity checks
      checkTLSConfig({ configService, logger: this.logger });
      checkCookieConfig({ configService, logger: this.logger });
      checkXPackSecurityDisabled({ pluginDependencies, logger: this.logger });
      checkDoNotFailOnForbidden({
        eliatraSuiteBackend,
        logger: this.logger,
      });

      // Inits the authInfo route
      defineAuthInfoRoutes({
        eliatraSuiteBackend,
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
      const authType = configService.get('eliatra.security.auth.type', null);

      let authManager = null;
      let kerberos = null;

      // Handle Kerberos separately because we don't want to bring up entire jungle from AuthType here.
      if (authType === 'kerberos') {
        kerberos = new Kerberos({
            pluginDependencies,
            config: configService,
            eliatraSuiteBackend,
            logger: this.coreContext.logger.get('security-kerberos-auth'),
            basePath: core.http.basePath.get(),
            sessionStorageFactory: sessionStorageFactory,
          });
        core.http.registerAuth(
          kerberos.checkAuth
        );
      } else if (authType !== 'proxy') {
        authManager = new AuthManager({
          kibanaCore: core,
          sessionStorageFactory,
          pluginDependencies,
          logger: this.coreContext.logger.get('security-auth'),
          eliatraSuiteBackend,
          configService,
        });
        authManager.registerAuthInstances();
        defineAuthRoutes({ kibanaCore: core, authManager, eliatraSuiteBackend, configService });
        if (authManager) {
          // authManager.onPreAuth needs to run before any other handler
          // that manipulates the request headers (e.g. MT)
          core.http.registerOnPreAuth(authManager.onPreAuth);
          core.http.registerAuth(authManager.checkAuth);
        }
      }

      if (authType && ['proxy', 'kerberos'].indexOf(authType) === -1) {
        try {
          this.logger.info('Initialising Eliatra Suite Security authentication plugin.');

          if (
            configService.get('eliatra.security.cookie.password') ===
            'eliatra_security_cookie_default_password'
          ) {
            this.logger.warn(
              "Default cookie password detected, please set a password in opensearch_dashboards.yml by setting 'eliatra.security.cookie.password' (min. 32 characters)."
            );
          }

          if (!configService.get('eliatra.security.cookie.secure')) {
            this.logger.warn(
              "'eliatra.security.cookie.secure' is set to false, cookies are transmitted over unsecure HTTP connection. Consider using HTTPS and set this key to 'true'"
            );
          }
        } catch (error) {
          this.logger.error(`An error occurred registering server plugins: ${error}`);
          throw error;
        }
      }

      // @todo TEST
      if (configService.get('eliatra.security.xff.enabled')) {
        require('./xff/xff')(core);
        this.logger.info('Eliatra Suite Security XFF enabled.');
      }

      if (configService.get('eliatra.security.configuration.enabled')) {
        defineConfigurationRoutes({
          eliatraSuiteConfigurationBackend,
          logger: this.logger,
          kibanaCore: core,
        });
        this.logger.info(
          'Routes for Eliatra Suite Security configuration GUI registered. This is an Enterprise feature.'
        );
      } else {
        this.logger.warn('Eliatra Suite Security configuration GUI disabled');
      }

      defineSystemRoutes({
        eliatraSuiteBackend,
        logger: this.logger,
        kibanaCore: core,
      });

      this.logger.info('Eliatra Suite Security system routes registered.');

      if (configService.get('eliatra.security.readonly_mode.enabled')) {
        const readOnlyMode = new ReadOnlyMode(this.coreContext.logger.get('security-readonly'));
        readOnlyMode.setupSync({
          kibanaCoreSetup: core,
          eliatraSuiteBackend,
          configService,
        });
      }

      return { authManager, sessionStorageFactory, kerberos };
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
