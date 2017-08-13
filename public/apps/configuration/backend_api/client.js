import { uiModules } from 'ui/modules';
import { merge } from 'lodash';
import { uniq } from 'lodash';

/**
 * Backend API client service.
 */
uiModules.get('apps/searchguard/configuration', [])
    .service('backendAPI', function (Promise, $http, createNotifier) {

        const notify = createNotifier({
            location: 'Authentication backend'
        });

        const AUTH_BACKEND_API_ROOT = "/api/v1/configuration";

        this.get = (resourceName, id) => {
            return $http.get(`${AUTH_BACKEND_API_ROOT}/${resourceName}/${id}`)
                .then((response) => {
                    return response.data;
                })
                .catch((error) => {
                    notify.error(error);
                    throw error;
                });
        };

        this.save = (resourceName, id, data) => {
            let url = `${AUTH_BACKEND_API_ROOT}/${resourceName}/${id}`;
            return $http.put(url, data)
                .then((response) => {
                    notify.info(response.data.message);
                })
                .catch((error) => {
                    notify.error(error);
                    throw error;
                });
        };

        this.delete = (resourceName, id) => {
            return $http.delete(`${AUTH_BACKEND_API_ROOT}/${resourceName}/${id}`)
                .then((response) => {
                    notify.info(response.data.message);
                })
                .catch((error) => {
                    notify.error(error);
                    throw error;
                });
        };

        this.list = (resourceName) => {
            return $http.get(`${AUTH_BACKEND_API_ROOT}/${resourceName}`);
        };

        this.mergeCleanArray = (array1, array2) => {
            var merged = [];
            merged = merged.concat(array1);
            merged = merged.concat(array2);
            merged = this.cleanArray(merged);
            return merged;
        };


        this.cleanArray = (thearray) => {
            // remove empty entries
            thearray = thearray.filter(e => String(e).trim());
            // remove duplicate entries
            thearray = uniq(thearray);
            return thearray;
        };

        this.sortPermissions = (permissionsArray) => {
            var actiongroups = [];
            var permissions = [];
            if (permissionsArray && Array.isArray(permissionsArray)) {
                permissionsArray.forEach(function (entry) {
                    if (entry.startsWith("cluster:") || entry.startsWith("indices:")) {
                        permissions.push(entry);
                    } else {
                        actiongroups.push(entry);
                    }
                });
            }
            return {
                actiongroups: actiongroups,
                permissions: permissions
            }
        };

    });
