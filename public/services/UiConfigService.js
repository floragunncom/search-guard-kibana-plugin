/* eslint-disable @kbn/eslint/require-license-header */
// eslint-disable-next-line no-restricted-imports
import { get as _get, defaultsDeep } from 'lodash';
import { ConfigService } from '../../common/config_service';

export const CONFIG_DEFAULTS = {
  restapiinfo: {},
  systeminfo: {},
  authinfo: {},
  searchguard: {},
  kibana: {},
  elasticsearch: {},
  server: {},
};

export class UiConfigService extends ConfigService {
  constructor({ config = {}, uiSettings, coreContext, apiService } = {}) {
    super(config);
    defaultsDeep(this.config, CONFIG_DEFAULTS);
    this.uiSettings = uiSettings;
    this.coreContext = coreContext;
    this.apiService = apiService;
  }

  init() {
    return Promise.allSettled([
      this.apiService.loadRestInfo(),
      this.apiService.loadSystemInfo(),
      this.apiService.loadAuthInfo(),
      this.apiService.loadKibanaConfig(),
    ]).then(([restapiinfoResp, systeminfoResp, authinfoResp, kibanaConfigResp]) => {
      let restapiinfo = {};
      let systeminfo = {};
      let authinfo = {};
      let kibanaConfig = {};

      if (restapiinfoResp.status === 'fulfilled') {
        restapiinfo = restapiinfoResp.value;
      } else {
        console.error(restapiinfoResp.reason);
      }

      if (systeminfoResp.status === 'fulfilled') {
        systeminfo = systeminfoResp.value;
      } else {
        console.error(systeminfoResp.reason);
      }

      if (authinfoResp.status === 'fulfilled') {
        authinfo = authinfoResp.value;
      } else {
        console.error(authinfoResp.reason);
      }

      if (kibanaConfigResp.status === 'fulfilled') {
        kibanaConfig = kibanaConfigResp.value;
      } else {
        console.error(kibanaConfigResp.reason);
      }

      const config = { searchguard: this.coreContext.config.get() };

      defaultsDeep(config, {
        ...kibanaConfig,
        restapiinfo,
        systeminfo,
        authinfo: {
          user_name: authinfo.user_name,
          user_requested_tenant: authinfo.user_requested_tenant,
        },
        is_dark_mode: this.uiSettings.get('theme:darkMode'),
      });

      // ATTENTION! We must not expose any sensitive data to the browser session storage.
      sessionStorage.setItem(
        'searchguard',
        JSON.stringify({
          restapiinfo: config.restapiinfo,
          systeminfo: config.systeminfo,
          authinfo: config.authinfo,
        })
      );

      console.debug('ConfigService, init, config', config);
      this.config = config;
    });
  }

  restApiEnabled() {
    return _get(this.config, 'systeminfo.modules.REST_MANAGEMENT_API', null) !== null;
  }

  hasApiAccess() {
    return this.restApiEnabled() && _get(this.config, 'restapiinfo.has_api_access', false);
  }

  dlsFlsEnabled() {
    return _get(this.config, 'systeminfo.modules.DLSFLS', null) != null;
  }

  multiTenancyEnabled() {
    return _get(this.config, 'systeminfo.modules.MULTITENANCY', null) != null;
  }

  complianceFeaturesEnabled() {
    const features = _get(this.getConfig(), 'systeminfo.sg_license.features', []);
    if (Array.isArray(features)) {
      return features.indexOf('COMPLIANCE') !== -1;
    }
    return false;
  }

  endpointAndMethodEnabled(endpoint, method) {
    const restInfo = this.get('restapiinfo');
    if (restInfo && restInfo.disabled_endpoints) {
      if (restInfo.disabled_endpoints[endpoint]) {
        return restInfo.disabled_endpoints[endpoint].indexOf(method) === -1;
      } else {
        return true;
      }
    }
    return false;
  }

  licenseRequired() {
    return _get(this.config, 'systeminfo.sg_license.license_required', false);
  }

  licenseValid() {
    // no license for community edition required
    if (!this.licenseRequired()) {
      return true;
    }
    return _get(this.config, 'systeminfo.sg_license.is_valid', true);
  }

  isTrialLicense() {
    if (!_get(this.config, 'systeminfo.sg_license.license_required', true)) {
      return false;
    }
    const licenseType = _get(this.getConfig(), 'systeminfo.sg_license.type', 'TRIAL');
    return licenseType.toLowerCase() === 'trial';
  }

  licenseExpiresIn() {
    return this.get('systeminfo.sg_license.expiry_in_days', 0);
  }
}
