/* eslint-disable @kbn/eslint/require-license-header */
import { get } from 'lodash';
import { registerRoutes } from './routes';
import { readKibanaConfig } from './read_kibana_config';
import { ConfigService } from '../../../common/config_service';
import { Kerberos } from './auth/types';
import { defineAuthInfoRoutes } from './auth/routes_authinfo';
import { defineSystemRoutes } from './system/routes';
import { defineConfigurationRoutes } from './configuration/routes/routes';
import SearchGuardBackend from './backend/searchguard';
import SearchGuardConfigurationBackend from './configuration/backend/searchguard_configuration_backend';
import {
  checkDoNotFailOnForbidden,
  checkTLSConfig,
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

  setupSync({ core, pluginDependencies, kibanaRouter }) {
    this.logger.debug('Setup sync app');

    try {
      const isDev = get(this.coreContext, 'env.mode.dev', false);
      this.configService = new ConfigService(readKibanaConfig({ isDev }));

      registerRoutes({
        router: kibanaRouter,
        config: this.configService.getConfig(),
        logger: this.logger,
      });

      this.searchGuardBackend = new SearchGuardBackend({
        configService: this.configService,
        getElasticsearch: async () => {
          const [{ elasticsearch }] = await core.getStartServices();
          return elasticsearch;
        },
      });

      this.searchGuardConfigurationBackend = new SearchGuardConfigurationBackend({
        configService: this.configService,
        getElasticsearch: async () => {
          const [{ elasticsearch }] = await core.getStartServices();
          return elasticsearch;
        },
      });

      // Sanity checks
      checkXPackSecurityDisabled({ pluginDependencies, logger: this.logger });
      checkTLSConfig({ configService: this.configService, logger: this.logger });
      checkDoNotFailOnForbidden({
        searchGuardBackend: this.searchGuardBackend,
        logger: this.logger,
      });
      checkCookieConfig({ configService: this.configService, logger: this.logger });

      // Inits the authInfo route
      defineAuthInfoRoutes({
        searchGuardBackend: this.searchGuardBackend,
        kibanaCore: core,
        logger: this.logger,
      });

      return {
        configService: this.configService,
        searchGuardBackend: this.searchGuardBackend,
        searchGuardConfigurationBackend: this.searchGuardConfigurationBackend,
      };
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async setup({ core, elasticsearch, pluginDependencies }) {
    this.logger.debug('Setup app');

    try {
      const didSetupSyncRun =
        this.configService && this.searchGuardBackend && this.searchGuardConfigurationBackend;

      if (!didSetupSyncRun) {
        throw new Error('You must run setupSync first!');
      }

      const cookieOptions = getSecurityCookieOptions(this.configService);
      const sessionStorageFactory = await core.http.createCookieSessionStorageFactory(
        cookieOptions
      );

      // We must extend the cookie options.
      // Because Kibana doesn't support all the options we need.
      extendSecurityCookieOptions(cookieOptions);

      const authType = this.configService.get('searchguard.auth.type', null);
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
            this.configService.get('searchguard.cookie.password') ===
            'searchguard_cookie_default_password'
          ) {
            this.logger.warn(
              "Default cookie password detected, please set a password in kibana.yml by setting 'searchguard.cookie.password' (min. 32 characters)."
            );
          }

          if (!this.configService.get('searchguard.cookie.secure')) {
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
                  config: this.configService,
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
      if (this.configService.get('searchguard.xff.enabled')) {
        require('./xff/xff')(core);
        this.logger.info('Search Guard XFF enabled.');
      }

      if (this.configService.get('searchguard.configuration.enabled')) {
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
            config: this.configService,
            searchGuardBackend: this.searchGuardBackend,
            logger: this.coreContext.logger.get('searchguard-kerberos-auth'),
          }).checkAuth
        );
      }

      if (this.configService.get('searchguard.readonly_mode.enabled')) {
        const readOnlyMode = new ReadOnlyMode(this.coreContext.logger.get('searchguard-readonly'));
        readOnlyMode.setupSync({
          kibanaCoreSetup: core,
          searchGuardBackend: this.searchGuardBackend,
          configService: this.configService,
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
