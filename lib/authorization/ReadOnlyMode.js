/* eslint-disable @kbn/eslint/require-license-header */
import { parse } from 'url';
import { merge } from 'lodash';

export class ReadOnlyMode {
  constructor(server) {
    this.server = server;
    this.readOnlyModeRoles = null;
    this.multiTenancyEnabled = false;
  }

  setup(kibanaCoreSetup, searchGuardBackend, config) {
    this.readOnlyModeRoles = config.get('searchguard.readonly_mode.roles');

    this.multiTenancyEnabled = config.get('searchguard.multitenancy.enabled');

    if (this.readOnlyModeRoles.length || this.multiTenancyEnabled) {
      this.registerSwitcher(kibanaCoreSetup, searchGuardBackend, config);
    }
  }

  hasMultipleTenants(tenantsObject, globalTenantEnabled, privateTenantEnabled, userName) {
    const tenantsCopy = {
      ...tenantsObject,
    };

    if (!globalTenantEnabled) {
      delete tenantsCopy['SGS_GLOBAL_TENANT'];
    }

    if (!privateTenantEnabled) {
      delete tenantsCopy[userName];
    }

    return Object.keys(tenantsCopy).length > 1 ? true : false;
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
        this.server.log(['searchguard', 'error'], `Could not parse the referer for the capabilities: ${error.stack}`);
      }
    }

    return false;
  }

  registerSwitcher(kibanaCoreSetup, searchGuardBackend, config) {
    kibanaCoreSetup.capabilities.registerSwitcher(async (request, uiCapabilities) => {
      // Ignore for non authenticated paths
      if (this.isAnonymousPage(request)) {
        return uiCapabilities;
      }

      try {
        const authInfo = await searchGuardBackend.authinfo(request.headers);
        const hasReadOnlyRole = authInfo.sg_roles.filter(
          (role) => this.readOnlyModeRoles.indexOf(role) > -1
        );

        if (hasReadOnlyRole.length) {
          // A read only role trumps the tenant access rights
          return this.toggleForReadOnlyRole(uiCapabilities, config, authInfo);
        } else if (this.isReadOnlyTenant(authInfo)) {
          return this.toggleForReadOnlyTenant(uiCapabilities, config);
        }
      } catch (error) {
        this.server.log(['searchguard', 'error'], `Could not determine read only mode: ${error.stack}`);
      }

      return uiCapabilities;
    });
  }

  /**
   * Check if current tenant is read only for the user
   * @param authInfo
   * @returns {boolean}
   */
  isReadOnlyTenant(authInfo) {
    // The global tenant would be '' == falsey
    const currentTenant = authInfo.user_requested_tenant || 'SGS_GLOBAL_TENANT';
    if (currentTenant === '__user__') {
      // We don't limit the private tenant
      return false;
    }

    const isReadOnlyTenant = authInfo.sg_tenants[currentTenant] !== true ? true : false;

    return isReadOnlyTenant;
  }

  toggleForReadOnlyRole(uiCapabilities, config, authInfo) {
    const globalTenantEnabled = config.get('searchguard.multitenancy.tenants.enable_global');
    const privateTenantEnabled = config.get('searchguard.multitenancy.tenants.enable_private');

    const whitelist = ['home', 'dashboard', 'dashboards'];

    // Disable the MT app if user has more than one tenant
    if (
      this.hasMultipleTenants(
        authInfo.sg_tenants,
        globalTenantEnabled,
        privateTenantEnabled,
        authInfo.user_name
      )
    ) {
      whitelist.push('searchguard-multitenancy');
    }

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
      }
    }

    const finalCapabilities = merge(
      uiCapabilities,
      defaultUICapabilities,
    );

    return finalCapabilities;
  }


  toggleForReadOnlyTenant(uiCapabilities, config) {

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

    const finalCapabilities = merge(
      uiCapabilities,
      defaultTenantOnlyCapabilities,
    );

    return finalCapabilities;
  }
}
