/* eslint-disable @kbn/eslint/require-license-header */
import { get, isEmpty } from 'lodash';
import chrome from 'ui/chrome';

const API_ROOT = `${chrome.getBasePath()}/api/v1`;

export class SystemStateService {
  constructor(httpClient) {
    this.httpClient = httpClient;
  }

  stateLoaded() {
    return !isEmpty(this.getSystemInfo());
  }

  licenseRequired() {
    // no license for community edition required
    return get(this.getSystemInfo(), 'sg_license.license_required', false);
  }

  licenseValid() {
    // no license for community edition required
    if (!this.licenseRequired()) {
      return true;
    }
    return get(this.getSystemInfo(), 'sg_license.is_valid', true);
  }

  isTrialLicense() {
    if (!get(this.getSystemInfo(), 'sg_license.license_required', true)) {
      return false;
    }
    const licenseType = get(this.getSystemInfo(), 'sg_license.type', 'TRIAL');
    return licenseType.toLowerCase() === 'trial';
  }

  complianceFeaturesEnabled() {
    const features = get(this.getSystemInfo(), 'sg_license.features', []);
    if (Array.isArray(features)) {
      return features.indexOf('COMPLIANCE') !== -1;
    }
    return false;
  }

  expiresIn() {
    return get(this.getSystemInfo(), 'sg_license.expiry_in_days', 0);
  }

  dlsFlsEnabled() {
    return get(this.getSystemInfo(), 'modules.DLSFLS', null) != null;
  }

  multiTenancyEnabled() {
    return get(this.getSystemInfo(), 'modules.MULTITENANCY', null) != null;
  }

  restApiEnabled() {
    return get(this.getSystemInfo(), 'modules.REST_MANAGEMENT_API', null) != null;
  }

  hasApiAccess() {
    return this.restApiEnabled && get(this.getRestApiInfo(), 'has_api_access', false);
  }

  endpointAndMethodEnabled(endpoint, method) {
    const restInfo = this.getRestApiInfo();
    if (restInfo && restInfo.disabled_endpoints) {
      if (restInfo.disabled_endpoints[endpoint]) {
        return restInfo.disabled_endpoints[endpoint].indexOf(method) === -1;
      } else {
        return true;
      }
    }
    return false;
  }

  getSystemInfo() {
    return this.getAndParse('systeminfo');
  }

  getRestApiInfo() {
    return this.getAndParse('restapiinfo');
  }

  getAndParse(key) {
    const objectString = sessionStorage.getItem(key);
    try {
      return JSON.parse(objectString);
    } catch (e) {
      return {};
    }
  }

  _assertHttpClient() {
    if (!this.httpClient) {
      throw new Error(
        'SystemStateService - the class must instantiated like "new SystemStateService(httpClient)" '
      );
    }
  }

  async loadSystemInfo() {
    this._assertHttpClient();
    // load systeminfo if not found in cache
    if (!sessionStorage.getItem('systeminfo')) {
      return this.httpClient
        .get(`${API_ROOT}/systeminfo`)
        .then(function(response) {
          sessionStorage.setItem('systeminfo', JSON.stringify(response.data));
        })
        .catch(function() {
          sessionStorage.setItem('systeminfo', '{}');
        });
    }
  }

  async loadRestInfo() {
    this._assertHttpClient();
    // load restinfo if not found in cache
    if (!sessionStorage.getItem('restapiinfo') && this.restApiEnabled()) {
      return this.httpClient
        .get(`${API_ROOT}/restapiinfo`)
        .then(function(response) {
          sessionStorage.setItem('restapiinfo', JSON.stringify(response.data));
        })
        .catch(function() {
          sessionStorage.setItem('restapiinfo', '{}');
        });
    }
  }
}
