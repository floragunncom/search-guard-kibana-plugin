import chrome from 'ui/chrome';
import { uiModules } from 'ui/modules';
import { get } from 'lodash';

/**
 * Role mappings API client service.
 */
uiModules.get('apps/searchguard/configuration', [])
    .service('systemstate', function ($http) {

        const ROOT = chrome.getBasePath();
        const APP_ROOT = `${ROOT}`;
        const API_ROOT = `${APP_ROOT}/api/v1`;
        const emptyPromise = new Promise(function(resolve, reject) {});

        this.licenseRequired = () => {
            // no license for community edition required
            return get(this.getSystemInfo(), 'sg_license.license_required', true);
        }

        this.licenseValid = () => {
            // no license for community edition required
            if (!this.licenseRequired()) {
                return true;
            }
            return get(this.getSystemInfo(), 'sg_license.is_valid', true);
        }

        this.isTrialLicense = () => {
            if (!get(this.getSystemInfo(), 'sg_license.license_required', true)) {
                return false;
            }
            var licenseType = get(this.getSystemInfo(), 'sg_license.type', "TRIAL")
            return licenseType.toLowerCase() == "trial";
        }

        this.expiresIn = () => {
            return get(this.getSystemInfo(), 'sg_license.expiry_in_days', 0);
        }

        this.dlsFlsEnabled = () => {
            return get(this.getSystemInfo(), 'modules.DLSFLS', null) != null;
        }

        this.multiTenancyEnabled = () => {
            return get(this.getSystemInfo(), 'modules.MULTITENANCY', null) != null;
        }

        this.restApiEnabled = () => {
            return get(this.getSystemInfo(), 'modules.REST_MANAGEMENT_API', null) != null;
        }

        this.hasApiAccess = () => {
            return this.restApiEnabled && get(this.getRestApiInfo(), 'has_api_access', false);
        }

        this.endpointAndMethodEnabled = (endpoint, method) => {
            var restInfo = this.getRestApiInfo();
            if (restInfo && restInfo.disabled_endpoints) {
                if (restInfo.disabled_endpoints[endpoint]) {
                    return restInfo.disabled_endpoints[endpoint].indexOf(method) == -1;
                } else {
                    return true;
                }
            }
            return false;
        }

        this.getSystemInfo = () => {
            return this.getAndParse('systeminfo');
        }

        this.getRestApiInfo = () => {
            return this.getAndParse('restapiinfo');
        }

        this.getAndParse = (key) => {
            var objectString = sessionStorage.getItem(key);
            try {
                return JSON.parse(objectString);
            } catch (e) {
                return {};
            }
        }

        this.loadSystemInfo = async function()  {
            // load systeminfo if not found in cache
            if (!sessionStorage.getItem('systeminfo')) {
                return $http.get(`${API_ROOT}/systeminfo`).then(function(response) {
                    sessionStorage.setItem('systeminfo', JSON.stringify(response.data));
                }).catch(function(error) {
                    sessionStorage.setItem('systeminfo', '{}');
                });
            }
        }

        this.loadRestInfo =  async function()  {
            // load restinfo if not found in cache
            if (!sessionStorage.getItem('restapiinfo') && this.restApiEnabled()) {
                return $http.get(`${API_ROOT}/restapiinfo`).then(function(response) {
                    sessionStorage.setItem('restapiinfo', JSON.stringify(response.data));
                }).catch(function(error) {
                    sessionStorage.setItem('restapiinfo', '{}');
                });
            }
        }

    });
