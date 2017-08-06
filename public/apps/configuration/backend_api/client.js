import { uiModules } from 'ui/modules';
import chrome from 'ui/chrome';

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

    });
