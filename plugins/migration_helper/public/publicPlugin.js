/* eslint-disable @kbn/eslint/require-license-header */
import { addTenantToShareURL } from '../helpers/multitenancy';
import { redirectOnSessionTimeout } from '../helpers/redirectOnSessionTimeout';
import { SystemStateService } from '../services/SystemStateService';
import { HttpWrapper } from '../utils/httpWrapper';

export class PublicPlugin {
  /*
  ATTENTION! Kibana imposes restrictions to the plugin lifecycle methods:
  1. A method must not return promise.
  2. A method execution time limit is 10 seconds.
  */
  setup(core, plugins) {
    this.plugins = plugins;
    this.multiTenancyEnabled = core.injectedMetadata.getInjectedVar('multitenancy_enabled');
    this.accountInfoEnabled = core.injectedMetadata.getInjectedVar('accountinfo_enabled');

    const sgDynamicConfig = core.injectedMetadata.getInjectedVar('sgDynamic');
    const authConfig = core.injectedMetadata.getInjectedVar('auth');
    if (sgDynamicConfig) {
      addTenantToShareURL(sgDynamicConfig);
    }

    if (authConfig) {
      const isAnonymousAuth =
        authConfig.type === 'basicauth' &&
        sgDynamicConfig &&
        sgDynamicConfig.user &&
        sgDynamicConfig.user.isAnonymousAuth;
      redirectOnSessionTimeout(authConfig.type, core.http, isAnonymousAuth);
    }
  }

  start(core) {
    const httpWrapper = new HttpWrapper(core.http);
    const systemStateService = new SystemStateService(httpWrapper);
    const path = core.http.basePath.remove(window.location.pathname);

    // don't run on login or logout, we don't have any user on these pages
    if (path === '/login' || path === '/logout' || path === '/customerror') {
      return;
    }

    window.addEventListener('popstate', () => {
      if (window.location.href.indexOf('monitoring#/access-denied') > -1) {
        this.checkMonitoring(core);
      }
    });

    window.addEventListener('pushstate', () => {
      if (window.location.hash.indexOf('monitoring#/access-denied') > -1) {
        this.checkMonitoring(core);
      }
    });

    // make sure all infos are loaded since sessionStorage might
    // get cleared sporadically, especially on mobile
    systemStateService
      .loadSystemInfo()
      .then(() => {
        // if no REST module is installed the restinfo endpoint is not available, so fail fast
        if (!systemStateService.restApiEnabled()) {
          core.chrome.navLinks.update('searchguard-configuration', { hidden: true });
          return;
        }
        // rest module installed, check if user has access to the API
        return systemStateService.loadRestInfo().then(() => {
          if (systemStateService.hasApiAccess()) {
            core.chrome.navLinks.update('searchguard-configuration', { hidden: false });
            this.plugins.home.featureCatalogue.register({
              id: 'searchguard-configuration',
              title: 'Search Guard Configuration',
              description: 'Configure users, roles and permissions for Search Guard.',
              icon: 'securityApp',
              path: '/app/searchguard-configuration',
              showOnHomePage: true,
              category: 'admin',
            });
          } else {
            core.chrome.navLinks.update('searchguard-configuration', { hidden: true });
          }
        });
      })
      .catch(() => {
        core.chrome.navLinks.update('searchguard-configuration', { hidden: true });
      });

    if (this.multiTenancyEnabled) {
      this.plugins.home.featureCatalogue.register({
        id: 'searchguard-multitenancy',
        title: 'Search Guard Multi Tenancy',
        description: 'Separate searches, visualizations and dashboards by tenants.',
        icon: 'usersRolesApp',
        path: '/app/searchguard-multitenancy',
        showOnHomePage: true,
        category: 'data',
      });
    } else {
      core.chrome.navLinks.update('searchguard-multitenancy', { hidden: true });
    }

    if (!this.accountInfoEnabled) {
      core.chrome.navLinks.update('searchguard-accountinfo', { hidden: true });
    }
  }

  /**
   * This is a workaround for a bug in the monitoring app
   * which will cause an infinite redirect loop
   * @param core
   */
  checkMonitoring(core) {
    const angularScope = document.querySelector('.ng-scope');
    if (angularScope) {
      const angularInjector = angular.element(angularScope).injector();
      const $route = angularInjector.get('$route');

      if ($route.routes) {
        for (const routeUrl in $route.routes) {
          if ($route.routes.hasOwnProperty(routeUrl)) {
            const route = $route.routes[routeUrl];
            // Override the controller and the resolver for the access denied route
            if (
              routeUrl.indexOf('/access-denied') > -1 &&
              route.resolve &&
              route.resolve.initialCheck
            ) {
              route.controller = function () {
                this.goToKibanaURL = core.http.basePath.get() + '/app/home';
              };
              // Remove the original resolver
              route.resolve = {};
            }
          }
        }
      }
    }
  }
}
