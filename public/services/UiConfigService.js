/*
 *    Copyright 2020 floragunn GmbH
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { get as _get, defaultsDeep, cloneDeep } from 'lodash';
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
    this.uiSettings = uiSettings;
    this.coreContext = coreContext;
    this.apiService = apiService;

    defaultsDeep(this.config, CONFIG_DEFAULTS, {
      searchguard: cloneDeep(this.coreContext.config.get()),
      is_dark_mode: this.uiSettings.get('theme:darkMode'),
    });
  }

  async fetchConfig() {
    const [
      restapiinfoResp,
      authinfoResp,
      kibanaConfigResp,
      systeminfoResp,
    ] = await Promise.allSettled([
      this.apiService.loadRestInfo(),
      this.apiService.loadAuthInfo(),
      this.apiService.loadKibanaConfig(),
      this.apiService.loadSystemInfo(),
    ]);

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

    defaultsDeep(this.config, {
      ...kibanaConfig,
      restapiinfo,
      systeminfo,
      authinfo: {
        user_name: authinfo.user_name,
        user_requested_tenant: authinfo.user_requested_tenant,
      },
    });

    // ATTENTION! We must not expose any sensitive data to the browser session storage.
    sessionStorage.setItem(
      'searchguard',
      JSON.stringify({
        restapiinfo: this.config.restapiinfo,
        systeminfo: this.config.systeminfo,
        authinfo: this.config.authinfo,
      })
    );

    console.debug('UiConfigService, this.fetchConfig', this.config);
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
