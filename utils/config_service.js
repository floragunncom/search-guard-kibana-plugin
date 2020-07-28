/* eslint-disable @kbn/eslint/require-license-header */
/* eslint-disable no-restricted-imports */
import { get as _get, set as _set, cloneDeep } from 'lodash';

function assertDynamicPath(path) {
  if (path.split('.')[0] === 'dynamic') {
    throw new Error('The path must not start with "dynamic".');
  }
}

function assertSearchguardPath(path) {
  if (path.split('.')[0] === 'searchguard') {
    throw new Error('The path must not start with "searchguard".');
  }
}

export class ConfigService {
  constructor(config) {
    this.config = config;
  }

  get(path, defaultValue) {
    return _get(this.getConfig(), path, defaultValue);
  }

  getConfig() {
    return cloneDeep(this.config);
  }

  getSearchguardConfig(path = '', defaultValue) {
    assertSearchguardPath(path);
    path = path ? `searchguard.${path}` : 'searchguard';
    return this.get(path, defaultValue);
  }

  getDynamicConfig(path = '', defaultValue) {
    assertDynamicPath(path);
    path = path ? `dynamic.${path}` : 'dynamic';
    return this.get(path, defaultValue);
  }

  set(path, value) {
    _set(this.config, path, value);
  }

  setSearchguardConfig(path, value) {
    assertSearchguardPath(path);
    this.set(`searchguard.${path}`, value);
  }

  setDynamicConfig(path, value) {
    assertDynamicPath(path);
    this.set(`dynamic.${path}`, value);
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
