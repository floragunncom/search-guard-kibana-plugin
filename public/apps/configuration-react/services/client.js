import { toastNotifications } from 'ui/notify';
import { uiModules } from 'ui/modules';
import { uniq, isPlainObject, isEmpty } from 'lodash';

import chrome from 'ui/chrome';

// TODO: refactor this service to JS

// taken from lodash, not provided by Kibana
const isString = function (val) {
  return typeof val === 'string' || ((!!val && typeof val === 'object') && Object.prototype.toString.call(val) === '[object String]');
};

/**
 * Backend API client service.
 */
uiModules.get('apps/searchguardConfiguration', [])
  .service('backendAPI', function (Promise, $http, $window, kbnUrl, searchGuardAccessControl) {

    // Take the basePath configuration value into account
    // @url https://www.elastic.co/guide/en/kibana/current/development-basepath.html
    const AUTH_BACKEND_API_ROOT = chrome.addBasePath('/api/v1');

    this.testConnection =  () => {

      return $http.post(`${AUTH_BACKEND_API_ROOT}/get/config`)
        .then(() => {
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

    this.get = function (resourceName, id) {
      return $http.get(`${AUTH_BACKEND_API_ROOT}/configuration/${resourceName}/${id}`)
        .then((response) => {
          return response.data;
        })
        .catch((error) => {
          if (error.status === 403) {
            searchGuardAccessControl.logout();
          } else {
            toastNotifications.addDanger({
              title: 'Unable to load data.',
              text: error.message,
            });
          }
          throw error;
        });
    };

    this.getSilent = function (resourceName, id) {
      return $http.get(`${AUTH_BACKEND_API_ROOT}/configuration/${resourceName}/${id}`)
        .then((response) => {
          return response.data;
        })
        .catch(() => {
          // nothing
        });
    };

    this.save = (resourceName, id, data) => {
      const url = `${AUTH_BACKEND_API_ROOT}/configuration/${resourceName}/${id}`;
      return $http.post(url, data)
        .then(() => {
          toastNotifications.addSuccess({
            title: `'${id}' saved.`
          });
        })
        .catch((error) => {
          if (error.status === 403) {
            searchGuardAccessControl.logout();
          } else {
            toastNotifications.addDanger({
              text: error.message
            });
          }
          throw error;
        });
    };

    this.delete = (resourceName, id) => {
      return $http.delete(`${AUTH_BACKEND_API_ROOT}/configuration/${resourceName}/${id}`)
        .then(() => {
          toastNotifications.addSuccess({
            title: `'${id}' deleted.`
          });
        })
        .catch((error) => {
          if (error.status === 403) {
            searchGuardAccessControl.logout();
          } else {
            toastNotifications.addDanger({
              title: 'Unable to delete data.',
              text: error.message,
            });
          }
          throw error;
        });
    };

    this.list = (resourceName)  => {
      return $http.get(`${AUTH_BACKEND_API_ROOT}/configuration/${resourceName}`)
        .then((response) => {
          return response.data;
        })
        .catch((error) => {
          if (error.status === 403) {
            searchGuardAccessControl.logout();
          } else {
            toastNotifications.addDanger({
              text: error.message
            });
          }
          toastNotifications.addDanger({
            title: 'Unable to load data.',
            text: error.message,
          });
        });
    };

    this.listSilent = (resourceName)  => {
      return $http.get(`${AUTH_BACKEND_API_ROOT}/configuration/${resourceName}`)
        .then((response) => {
          return response.data;
        })
        .catch(() => {
          // nothing
        });
    };

    this.listAutocomplete = (names) => {
      const completeList = [];
      names.sort().forEach(function (name) {
        const autocomplete = {};
        autocomplete.name = name;
        completeList.push(autocomplete);
      });
      return completeList;
    };

    this.clearCache = () => {
      return $http.delete(`${AUTH_BACKEND_API_ROOT}/configuration/cache`)
        .then((response) => {
          toastNotifications.addSuccess({
            title: response.data.message
          });
        })
        .catch((error) => {
          if (error.status === 403) {
            searchGuardAccessControl.logout();
          } else {
            toastNotifications.addDanger({
              title: 'Unable to clear cache.',
              text: error.message,
            });
          }
          throw error;
        });
    };

    this.cleanArraysFromDuplicates = function (theobject) {

      // We assume we don't have any mixed arrays,
      // i.e. only arrays of one type
      if (Array.isArray(theobject) && !isEmpty(theobject)) {

        const firstEntry = theobject[0];

        // string arrays, clean it
        if (isString(firstEntry)) {
          return this.cleanArray(theobject);
        }

        // object array, traverse down
        if (isPlainObject(firstEntry)) {
          for(let i = 0; i < theobject.length; i++) {
            theobject[i] = this.cleanArraysFromDuplicates(theobject[i]);
          }
        }
        // something else ...
        return theobject;
      }

      // Object, traverse keys
      if (isPlainObject(theobject)) {
        const keys = Object.keys(theobject);
        for (let i = 0; i < keys.length; i++) {
          theobject[keys[i]] = this.cleanArraysFromDuplicates(theobject[keys[i]]);
        }
      }
      return theobject;
    };

    this.mergeCleanArray = (array1, array2) => {
      let merged = [];
      if (array1) {
        merged = merged.concat(array1);
      }
      if (array2) {
        merged = merged.concat(array2);
      }
      merged = this.cleanArray(merged);
      return merged;
    };


    this.cleanArray = (thearray) => {
      if (!thearray) {
        return [];
      }
      if (!Array.isArray(thearray)) {
        return;
      }
      // remove empty entries
      thearray = thearray.filter(e => String(e).trim());
      // remove duplicate entries
      thearray = uniq(thearray);
      return thearray;
    };

    this.sortPermissions = (permissionsArray) => {
      const actiongroups = [];
      const permissions = [];
      if (permissionsArray && Array.isArray(permissionsArray)) {
        permissionsArray.forEach(function (entry) {
          if (entry.startsWith('cluster:') || entry.startsWith('indices:')) {
            permissions.push(entry);
          } else {
            actiongroups.push(entry);
          }
        });
      }
      return {
        actiongroups: actiongroups,
        permissions: permissions
      };
    };
  });
