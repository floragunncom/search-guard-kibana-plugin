import { uiModules } from 'ui/modules';
import { merge } from 'lodash';
import { uniq } from 'lodash';

/**
 * Backend API client service.
 */
uiModules.get('apps/searchguard/configuration', [])
    .service('backendAPI', function (Promise, $http, $window, createNotifier, kbnUrl) {

        const notify = createNotifier({
            location: 'Authentication backend'
        });

        const AUTH_BACKEND_API_ROOT = "/api/v1/configuration";

        this.testConnection = () => {

            return $http.post(`${AUTH_BACKEND_API_ROOT}/get/config`, this.getPayloadDataWithCertificates(null))
                .then((response) => {
                    return 200;
                })
                .catch((error) => {
                    if (error.status) {
                        return error.status;
                    } else {
                        return 500;
                    }
                });
        };

        this.get = (resourceName, id) => {
            return $http.post(`${AUTH_BACKEND_API_ROOT}/get/${resourceName}/${id}`, this.getPayloadDataWithCertificates(null))
                .then((response) => {
                    return response.data;
                })
                .catch((error) => {
                    if(error.status == 403) {
                        kbnUrl.change('/');
                        notify.error("Authentication failed");
                    } else {
                        notify.error(error);
                    }
                    throw error;
                });
        };

        this.save = (resourceName, id, data) => {
            let url = `${AUTH_BACKEND_API_ROOT}/save/${resourceName}/${id}`;
            return $http.post(url, this.getPayloadDataWithCertificates(data))
                .then((response) => {
                    notify.info(response.data.message);
                })
                .catch((error) => {
                    if(error.status == 403) {
                        kbnUrl.change('/');
                        notify.error("Authentication failed");
                    } else {
                        notify.error(error);
                    }
                    throw error;
                });
        };

        this.delete = (resourceName, id) => {
            return $http.post(`${AUTH_BACKEND_API_ROOT}/delete/${resourceName}/${id}`, this.getPayloadDataWithCertificates(null))
                .then((response) => {
                    notify.info(response.data.message);
                })
                .catch((error) => {
                    if(error.status == 403) {
                        kbnUrl.change('/');
                        notify.error("Authentication failed");
                    } else {
                        notify.error(error);
                    }
                    throw error;
                });
        };

        this.list = (resourceName) => {
            return $http.post(`${AUTH_BACKEND_API_ROOT}/get/${resourceName}`, this.getPayloadDataWithCertificates(null))
                .then((response) => {
                    return response.data;
                })
                .catch((error) => {
                    if(error.status == 403) {
                        kbnUrl.change('/');
                        notify.error("Authentication failed");
                    } else {
                        notify.error(error);
                    }
                    throw error;
                });
        };

        this.clearCache = () => {
            return $http.post(`${AUTH_BACKEND_API_ROOT}/clearcache`, this.getPayloadDataWithCertificates(null))
                .then((response) => {
                    notify.info(response.data.message);
                })
                .catch((error) => {
                    if(error.status == 403) {
                        kbnUrl.change('/');
                        notify.error("Authentication failed");
                    } else {
                        notify.error(error);
                    }
                    throw error;
                });
        };

        //this.setCertificates = (certificates) => {
        //    return $http.post(`${AUTH_BACKEND_API_ROOT}/certificates`, certificates)
        //        .catch((error) => {
        //            notify.error(error);
        //            throw error;
        //        });
        //};

        // ----

        this.getPayloadDataWithCertificates = (data) => {
            var certificates = sessionStorage.getItem('searchguard_certificates');
            return {
                certificates: certificates,
                data: data
            }
        }

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
