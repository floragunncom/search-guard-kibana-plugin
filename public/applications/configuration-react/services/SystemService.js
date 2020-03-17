import { API } from '../utils/constants';
import { get, isEmpty } from 'lodash';

export default class SystemService {
  constructor(httpClient) {
    this.httpClient = httpClient;
  }

  _assertHttpClient() {
    if (!this.httpClient) {
      throw new Error(
        'SystemService - the class must instantiated like "new SystemService(httpClient)" '
      );
    }
  }

  _getAndParseFromSessionStorage(key) {
    const objectString = sessionStorage.getItem(key);
    try {
      return JSON.parse(objectString);
    } catch (e) {
      return {};
    }
  }

  getSystemInfo() {
    this._assertHttpClient();
    return this.httpClient.get(API.SYSTEM_INFO);
  }

  getSystemInfoFromSessionSorage() {
    return this._getAndParseFromSessionStorage('systeminfo');
  }

  uploadLicense(licenseString) {
    this._assertHttpClient();
    return this.httpClient.post(API.LICENSE, { sg_license: licenseString });
  }

  stateLoaded() {
    return !isEmpty(this.getSystemInfoFromSessionSorage());
  }

  licenseRequired() {
    // no license for community edition required
    return get(this.getSystemInfoFromSessionSorage(), 'sg_license.license_required', false);
  }

  licenseValid() {
    // no license for community edition required
    if (!this.licenseRequired()) {
      return true;
    }
    return get(this.getSystemInfoFromSessionSorage(), 'sg_license.is_valid', true);
  }

  isTrialLicense() {
    if (!get(this.getSystemInfoFromSessionSorage(), 'sg_license.license_required', true)) {
      return false;
    }
    const licenseType = get(this.getSystemInfoFromSessionSorage(), 'sg_license.type', 'TRIAL');
    return licenseType.toLowerCase() === 'trial';
  }

  complianceFeaturesEnabled() {
    const features = get(this.getSystemInfoFromSessionSorage(), 'sg_license.features', []);
    if (Array.isArray(features)) {
      return features.indexOf('COMPLIANCE') !== -1;
    }
    return false;
  }

  expiresIn() {
    return get(this.getSystemInfoFromSessionSorage(), 'sg_license.expiry_in_days', 0);
  }

  dlsFlsEnabled() {
    return get(this.getSystemInfoFromSessionSorage(), 'modules.DLSFLS', null) != null;
  }

  multiTenancyEnabled() {
    return get(this.getSystemInfoFromSessionSorage(), 'modules.MULTITENANCY', null) != null;
  }

  restApiEnabled() {
    return get(this.getSystemInfoFromSessionSorage(), 'modules.REST_MANAGEMENT_API', null) != null;
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

  getRestApiInfo() {
    return this._getAndParseFromSessionStorage('restapiinfo');
  }

  loadSystemInfo() {
    if (!sessionStorage.getItem('systeminfo')) {
      return this.getSystemInfo()
        .then(response => {
          sessionStorage.setItem('systeminfo', JSON.stringify(response.data));
        })
        .catch(() => {
          sessionStorage.setItem('systeminfo', '{}');
        });
    }
  }

  loadRestInfo() {
    this._assertHttpClient();
    // load restinfo if not found in cache
    if (!sessionStorage.getItem('restapiinfo') && this.restApiEnabled()) {
      return this.httpClient
        .get(API.REST_API_INFO)
        .then(response => {
          sessionStorage.setItem('restapiinfo', JSON.stringify(response.data));
        })
        .catch(() => {
          sessionStorage.setItem('restapiinfo', '{}');
        });
    }
  }
}
