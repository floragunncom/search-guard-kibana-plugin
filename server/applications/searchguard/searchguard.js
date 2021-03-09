/* eslint-disable @kbn/eslint/require-license-header */
import { registerRoutes } from './routes';
import { Kerberos } from './auth/types';
import { defineAuthInfoRoutes } from './auth/routes_authinfo';
import { defineSystemRoutes } from './system/routes';
import { defineConfigurationRoutes } from './configuration/routes/routes';
import SearchGuardBackend from './backend/searchguard';
import SearchGuardConfigurationBackend from './configuration/backend/searchguard_configuration_backend';
import {
  checkDoNotFailOnForbidden,
  checkXPackSecurityDisabled,
  checkCookieConfig,
} from './sanity_checks';
import { getSecurityCookieOptions, extendSecurityCookieOptions } from './session/security_cookie';
import { ReadOnlyMode } from './authorization/ReadOnlyMode';

export class SearchGuard {
  constructor(coreContext) {
    this.coreContext = coreContext;
    this.logger = this.coreContext.logger.get('searchguard');
  }

  setupSync({ core, pluginDependencies }) {
    this.logger.debug('Setup sync app');

    try {
      this.searchGuardBackend = new SearchGuardBackend({
        getElasticsearch: async () => {
          const [{ elasticsearch }] = await core.getStartServices();
          return elasticsearch;
        },
      });

      this.searchGuardConfigurationBackend = new SearchGuardConfigurationBackend({
        getElasticsearch: async () => {
          const [{ elasticsearch }] = await core.getStartServices();
          return elasticsearch;
        },
      });

      pluginDependencies.securityOss.showInsecureClusterWarning$.next(false);
      // Sanity checks
      checkXPackSecurityDisabled({ pluginDependencies, logger: this.logger });
      checkDoNotFailOnForbidden({
        searchGuardBackend: this.searchGuardBackend,
        logger: this.logger,
      });

      // Inits the authInfo route
      defineAuthInfoRoutes({
        searchGuardBackend: this.searchGuardBackend,
        kibanaCore: core,
        logger: this.logger,
      });

      return {
        searchGuardBackend: this.searchGuardBackend,
        searchGuardConfigurationBackend: this.searchGuardConfigurationBackend,
      };
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async setup({ core, elasticsearch, pluginDependencies, configService, kibanaRouter }) {
    this.logger.debug('Setup app');

    try {
      const didSetupSyncRun = this.searchGuardBackend && this.searchGuardConfigurationBackend;
      checkCookieConfig({ configService, logger: this.logger });

      registerRoutes({
        router: kibanaRouter,
        config: configService.getConfig(),
        logger: this.logger,
      });

      if (!didSetupSyncRun) {
        throw new Error('You must run setupSync first!');
      }

      const cookieOptions = getSecurityCookieOptions(configService);
      const sessionStorageFactory = await core.http.createCookieSessionStorageFactory(
        cookieOptions
      );

      // We must extend the cookie options.
      // Because Kibana doesn't support all the options we need.
      extendSecurityCookieOptions(cookieOptions);

      const authType = configService.get('searchguard.auth.type', null);
      let AuthClass = null;
      let authInstance = null;

      // Proxy authentication is handled implicitly.
      if (
        authType &&
        authType !== '' &&
        ['basicauth', 'jwt', 'openid', 'saml', 'proxycache'].indexOf(authType) > -1
      ) {
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

          switch (authType) {
            case 'openid':
              AuthClass = require('./auth/types/openid/OpenId');
              break;

            case 'basicauth':
              AuthClass = require('./auth/types/basicauth/BasicAuth');
              break;

            case 'jwt':
              AuthClass = require('./auth/types/jwt/Jwt');
              break;

            case 'saml':
              AuthClass = require('./auth/types/saml/Saml');
              break;

            case 'proxycache':
              AuthClass = require('./auth/types/proxycache/ProxyCache');
              break;
          }

          if (AuthClass) {
            try {
              // Check that one of the auth types didn't already require an authInstance
              if (!authInstance) {
                authInstance = new AuthClass({
                  searchGuardBackend: this.searchGuardBackend,
                  kibanaCore: core,
                  config: configService,
                  logger: this.coreContext.logger.get('searchguard-auth'),
                  sessionStorageFactory,
                  elasticsearch,
                  pluginDependencies,
                });
              }

              await authInstance.init();
              this.logger.info('Search Guard session management enabled.');
            } catch (error) {
              this.logger.error(`An error occurred while enabling session management: ${error}`);
              throw error;
            }
          }
        } catch (error) {
          this.logger.error(`An error occurred registering server plugins: ${error}`);
          throw error;
        }
      }

      if (authType !== 'jwt') {
        this.logger.warn('Search Guard copy JWT params disabled');
      }

      // @todo TEST
      if (configService.get('searchguard.xff.enabled')) {
        require('./xff/xff')(core);
        this.logger.info('Search Guard XFF enabled.');
      }

      if (configService.get('searchguard.configuration.enabled')) {
        defineConfigurationRoutes({
          searchGuardConfigurationBackend: this.searchGuardConfigurationBackend,
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
        searchGuardBackend: this.searchGuardBackend,
        logger: this.logger,
        kibanaCore: core,
      });

      this.logger.info('Search Guard system routes registered.');

      if (authInstance) {
        core.http.registerAuth(authInstance.checkAuth);
      }

      // Handle Kerberos separately because we don't want to bring up entire jungle from AuthType here.
      if (authType === 'kerberos') {
        core.http.registerAuth(
          new Kerberos({
            pluginDependencies,
            config: configService,
            searchGuardBackend: this.searchGuardBackend,
            logger: this.coreContext.logger.get('searchguard-kerberos-auth'),
          }).checkAuth
        );
      }

      if (configService.get('searchguard.readonly_mode.enabled')) {
        const readOnlyMode = new ReadOnlyMode(this.coreContext.logger.get('searchguard-readonly'));
        readOnlyMode.setupSync({
          kibanaCoreSetup: core,
          searchGuardBackend: this.searchGuardBackend,
          configService,
          authInstance,
        });
      }

      return { authInstance, sessionStorageFactory };
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
