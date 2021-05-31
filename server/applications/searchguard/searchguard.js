/* eslint-disable @kbn/eslint/require-license-header */
import { registerRoutes } from './routes';
import { Kerberos, defineAuthInfoRoutes, rootScopedClientRequestWrapper } from './auth';
import {AUTH_TYPE_NAMES, AuthManager} from './auth/AuthManager';
import { defineAuthRoutes } from './auth/routes_auth';
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
    spacesService,
    elasticsearch,
  }) {
    this.logger.debug('Setup app');

    const kibanaVersionIndex =
      configService.get('kibana.index') + '_' + this.coreContext.env.packageInfo.version;

    elasticsearch.client.rootScopedClient.on(
      'request',
      rootScopedClientRequestWrapper({ configService, kibanaVersionIndex })
    );

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
      let AuthClass = null;
      let authInstance = null;

      const authManager = new AuthManager({
        kibanaCore: core,
        configService,
        sessionStorageFactory,
      });

      // Get the available configs. Or maybe the authManager will do this
      const authConfig = await searchGuardBackend.getAuthConfig();


      console.log(authConfig)
      /*
                  // @todo Dummy pending correct auth response
                  const authMethodConfig = authConfig.auth_methods.filter(
                    (config) => config.method === 'basic'
                  )[0];

                  // @todo This mapping will probably go away
                  const AUTH_METHODS = {
                    basic: 'basicauth',
                  };

                  console.log('AuthMethodConfig', {
                    authConfig,
                    authMethodConfig
                  })

                   */

      // @todo These routes should go somewhere else
      defineAuthRoutes({kibanaCore: core, authManager});

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

          // @todo PoC, this needs to be configurable
          const OpenId = require('./auth/types/openid/OpenId');
          const BasicAuth = require('./auth/types/basicauth/BasicAuth');
          const JWT = require('./auth/types/jwt/Jwt');
          const Saml = require('./auth/types/saml/Saml');

          switch (authType) {
            case 'openid':
              //AuthClass = require('./auth/types/openid/OpenId');
              break;

            case 'basicauth':
              //AuthClass = require('./auth/types/basicauth/BasicAuth');
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

          // @todo Check the spacesservice vs authmanager
          if (1 || AuthClass) {
            try {
              // Check that one of the auth types didn't already require an authInstance
              /*
              if (!authInstance) {
                authInstance = new AuthClass({
                  searchGuardBackend,
                  kibanaCore: core,
                  config: configService,
                  logger: this.coreContext.logger.get('searchguard-auth'),
                  sessionStorageFactory,
                  pluginDependencies,
                  spacesService,
                });
              }

              await authInstance.init();

               */


              const openId = new OpenId({
                searchGuardBackend,
                kibanaCore: core,
                config: configService,
                logger: this.coreContext.logger.get('searchguard-auth'),
                sessionStorageFactory,
                elasticsearch,
                pluginDependencies,
                authManager
              });

              openId.init();

              authManager.registerAuthInstance(AUTH_TYPE_NAMES.OIDC, openId);

              const jwt = new JWT({
                searchGuardBackend,
                kibanaCore: core,
                config: configService,
                logger: this.coreContext.logger.get('searchguard-auth'),
                sessionStorageFactory,
                elasticsearch,
                pluginDependencies,
                authManager
              });

              jwt.init();

              authManager.registerAuthInstance(AUTH_TYPE_NAMES.JWT, jwt);

              const saml = new Saml({
                searchGuardBackend,
                kibanaCore: core,
                config: configService,
                logger: this.coreContext.logger.get('searchguard-auth'),
                sessionStorageFactory,
                elasticsearch,
                pluginDependencies,
                authManager,
              });

              saml.init();

              authManager.registerAuthInstance(AUTH_TYPE_NAMES.SAML, saml);

              // @todo Check params after merge
              const basicAuth = new BasicAuth({
                searchGuardBackend,
                kibanaCore: core,
                config: configService,
                logger: this.coreContext.logger.get('searchguard-auth'),
                sessionStorageFactory,
                elasticsearch,
                pluginDependencies,
                authManager,
              });

              basicAuth.init();
              authManager.registerAuthInstance(AUTH_TYPE_NAMES.BASIC, basicAuth);
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

      //if (authInstance) {

        core.http.registerAuth(authManager.checkAuth);
        // @todo
        core.http.registerOnPostAuth(authManager.onPostAuth);
      //}


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
      }

      if (configService.get('searchguard.readonly_mode.enabled')) {
        const readOnlyMode = new ReadOnlyMode(this.coreContext.logger.get('searchguard-readonly'));
        readOnlyMode.setupSync({
          kibanaCoreSetup: core,
          searchGuardBackend,
          configService,
          authInstance,
        });
      }

      return { authManager, sessionStorageFactory };
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
