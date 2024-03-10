/* eslint-disable @kbn/eslint/require-license-header */
import { parse } from 'url';
import { merge } from 'lodash';

export class ReadOnlyMode {
  constructor(logger) {
    this.logger = logger;
    this.readOnlyModeRoles = null;
    this.searchGuardBackend = null;
    this.configService = null;

  }

  async setupSync({ kibanaCoreSetup, searchGuardBackend, configService }) {
    this.readOnlyModeRoles = configService.get('searchguard.readonly_mode.roles');
    this.searchGuardBackend = searchGuardBackend;
    this.configService = configService;
    this.kibanaCoreSetup = kibanaCoreSetup;
  }

  isAnonymousPage(request) {
    if (request.headers && request.headers.referer) {
      try {
        const { pathname } = parse(request.headers.referer);
        const pathsToIgnore = ['login', 'logout', 'customerror'];
        if (pathsToIgnore.indexOf(pathname.split('/').pop()) > -1) {
          return true;
        }
      } catch (error) {
        this.logger.error(`Could not parse the referer for the capabilites: ${error.stack}`);
      }
    }

    return false;
  }

  async switcherHandler(request, uiCapabilities) {
      // Only change capabilities if relevant
      const isMTEnabled = this.configService.get('searchguard.multitenancy.enabled');
      if (this.readOnlyModeRoles.length === 0 && !isMTEnabled) {
        return uiCapabilities;
      }

      // Ignore for non authenticated paths
      if (this.isAnonymousPage(request)) {
        return uiCapabilities;
      }

      try {
        // TODO concurrent calls
        const authInfo = await this.searchGuardBackend.authinfo(request.headers);
        /**
         * @type {Record<string, boolean>}
         */
        let userTenants = authInfo.sg_tenants;

        if (this.hasReadOnlyRole(authInfo, this.readOnlyModeRoles)) {
          // A read only role trumps the tenant access rights
          return this.toggleForReadOnlyRole(uiCapabilities);
        } else if (isMTEnabled && this.isReadOnlyTenant(authInfo, userTenants)) {
          return this.toggleForReadOnlyTenant(uiCapabilities, this.configService);
        }
      } catch (error) {
        this.logger.error(`Could not check auth info: ${error.stack}`);
      }

      return uiCapabilities;

  }

  hasReadOnlyRole(authInfo, readOnlyModeRoles) {
    return authInfo.sg_roles.some((role) => readOnlyModeRoles.includes(role));
  }

  /**
   * Check if current tenant is read only for the user
   * @param authInfo
   * @returns {boolean}
   */
  isReadOnlyTenant(authInfo, userTenants) {
    // The global tenant would be '' == falsey
    const currentTenant = authInfo.user_requested_tenant;
    if (currentTenant === '__user__') {
      // We don't limit the private tenant
      return false;
    }


    const isReadOnlyTenant = userTenants[currentTenant] !== true ? true : false;
    return isReadOnlyTenant;
  }

  toggleForReadOnlyRole(uiCapabilities) {
    const whitelist = ['home', 'dashboard', 'dashboards'];

    Object.keys(uiCapabilities).forEach((capability) => {
      if (capability === 'navLinks') {
        // Hide navLinks
        Object.keys(uiCapabilities.navLinks).forEach((navLinkId) => {
          uiCapabilities.navLinks[navLinkId] = whitelist.indexOf(navLinkId) > -1;
        });
      } else if (capability === 'catalogue') {
        // Hide features from the catalogue
        Object.keys(uiCapabilities.catalogue).forEach((appId) => {
          uiCapabilities.catalogue[appId] = whitelist.indexOf(appId) > -1;
        });
      } else if (
        // Here we're looking for a show property
        typeof uiCapabilities[capability] === 'object' &&
        typeof uiCapabilities[capability].show !== 'undefined'
      ) {
        // If an app has show = false, Kibana will redirect away from its url.
        uiCapabilities[capability].show = whitelist.indexOf(capability) > -1;
      }
    });

    const defaultUICapabilities = {
      dashboard: {
        createNew: false,
        showWriteControls: false,
        saveQuery: false,
      },
    };

    const finalCapabilities = merge(uiCapabilities, defaultUICapabilities);

    return finalCapabilities;
  }

  toggleForReadOnlyTenant(uiCapabilities) {
    const defaultTenantOnlyCapabilities = {
      navLinks: {
        'kibana:stack_management': false,
        management: false,
      },
      catalogue: {
        advanced_settings: false,
        index_patterns: false,
      },
      dashboard: {
        createNew: false,
        showWriteControls: false,
        saveQuery: false,
      },
      visualize: {
        createShortUrl: false,
        delete: false,
        save: false,
        saveQuery: false,
      },
      management: {
        kibana: {
          indexPatterns: false,
        },
      },
    };

    const finalCapabilities = merge(uiCapabilities, defaultTenantOnlyCapabilities);

    return finalCapabilities;
  }
}
