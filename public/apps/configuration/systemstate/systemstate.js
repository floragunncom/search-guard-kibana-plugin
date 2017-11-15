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

        this.initialise = function() {
            return Promise.all([this.loadSystemInfo(), this.loadRestInfo()]);
        };

        this.licenseValid = () => {
            return get(this.getSystemInfo(), 'sg_license.is_valid', false);
        }

        this.restApiEnabled = () => {
            return get(this.getSystemInfo(), 'modules.REST_MANAGEMENT_API', false);
        }

        this.hasApiAccess = () => {
            return this.restApiEnabled && get(this.getRestApiInfo(), 'has_api_access', false);
        }

        this.endpointAndMethodEnabled = (endpoint, method) => {
            var restInfo = this.getRestApiInfo();
            if (restInfo.disabled_endpoints) {
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

        this.loadSystemInfo = () => {
            return $http.get(`${API_ROOT}/systeminfo`).then(function(response) {
                sessionStorage.setItem('systeminfo', JSON.stringify(response.data));
            }).catch(function(error) {
                sessionStorage.setItem('systeminfo', '{}');
            });
        }

        this.loadRestInfo =  () => {
            return $http.get(`${API_ROOT}/restapiinfo`).then(function(response) {
                sessionStorage.setItem('restapiinfo', JSON.stringify(response.data));
            }).catch(function(error) {
                sessionStorage.setItem('restapiinfo', '{}');
            });
        }
    });
