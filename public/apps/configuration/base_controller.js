import { uiModules } from 'ui/modules';
import chrome from 'ui/chrome';

import { get } from 'lodash';
import './directives/directives';
import '../../directives/licensewarning'
import client from './backend_api/client';
import { uniq } from 'lodash';
import { orderBy } from 'lodash';

import clusterpermissions  from './permissions/clusterpermissions';
import indexpermissions  from './permissions/indexpermissions';
import './backend_api/actiongroups';
import '../../directives/licensewarning'

const app = uiModules.get('apps/searchguard/configuration', ['ui.ace']);

app.controller('sgBaseController', function ($scope, $element, $route, $window, $http, createNotifier, backendAPI, backendActionGroups) {

    var APP_ROOT = `${chrome.getBasePath()}`;
    var API_ROOT = `${APP_ROOT}/api/v1`;

    const notify = createNotifier({
        location: 'Authentication Configuration'
    });


    $scope.title = "Search Guard Base Controller";
    $scope.errorMessage = "";
    $scope.actiongroupsAutoComplete = "";
    $scope.clusterpermissionsAutoComplete = clusterpermissions;
    $scope.indexpermissionsAutoComplete = indexpermissions;
    $scope.allpermissionsAutoComplete = indexpermissions.concat(clusterpermissions);
    $scope.query = "";
    $scope.resource = {};
    $scope.showEditor = false;
    $scope.toggleEditorLabel = "Show JSON";
    $scope.resourceAsJson = null;
    $scope.licensevalid = true;
    $scope.restapiinfo = {};
    $scope.systeminfo = {};
    $scope.accessState = "pending";

    $scope.title = "Search Guard Configuration";

    $scope.clearCache = function() {
        backendAPI.clearCache();
    }

    // todo: extra testConnection method
    $scope.loadActionGroups = () => {
        backendActionGroups.list().then((response) => {
            $scope.actiongroupsAutoComplete = backendActionGroups.listAutocomplete(Object.keys(response.data));
            $scope.accessState = "ok";
        }, (error) => {
            notify.error(error);
            $scope.accessState = "forbidden";
        });
    }

    $scope.loadLicense = () => {
        $http.get(`${API_ROOT}/systeminfo`)
            .then(
            (response) => {
                $scope.systeminfo = response.data;
                $scope.licensevalid = response.data.sg_license.is_valid
            },
            (error) => notify.error(error)
        );
    }

    $scope.loadAdminPermissions = () => {
        $http.get(`${API_ROOT}/restapiinfo`)
            .then(
            (response) => {
                $scope.restapiinfo = response.data;
            },
            (error) => notify.error(error)
        );
    }

    $scope.endpointEnabled = (endpoint) => {
        if ($scope.restapiinfo.disabled_endpoints) {
            return $scope.restapiinfo.disabled_endpoints.indexOf(endpoint) == -1;
        }
        return false;
    }


    $scope.aceLoaded = (editor) => {
        editor.session.setOptions({
            tabSize: 2,
            useSoftTabs: false
        });
        editor.$blockScrolling = Infinity;
        editor.setShowPrintMargin(false);
    };

    $scope.toggleEditor = (resource) => {
        if ($scope.resourceAsJson == null) {
            $scope.loadJSON(resource)
        }
        $scope.showEditor = !$scope.showEditor;
        $scope.toggleEditorLabel = $scope.showEditor? "Hide JSON" : "Show JSON";
    };

    $scope.loadJSON = function(resource) {
        // copy resource, we don't want to modify current edit session
        var resourceCopy = JSON.parse(JSON.stringify(resource));
        $scope.resourceAsJson = JSON.stringify($scope.service.preSave(resourceCopy), null, 2);
    }

    $scope.addArrayEntry = function (resource, fieldname, value) {
        if(!resource[fieldname] || !Array.isArray(resource[fieldname])) {
            resource[fieldname] = [];
        }
        resource[fieldname].push(value);

    }

    $scope.removeArrayEntry = function (array, item) {
        if(!Array.isArray(array)) {
            return;
        }
        if (item && item.length > 0) {
            if (!confirm(`Are you sure you want to delete '${item}'?`)) {
                return;
            }
        }
        var index = array.indexOf(item);
        array.splice(index, 1);
    }

    $scope.lastArrayEntryEmpty = function (array) {

        if (!array || typeof array == 'undefined' || array.length == 0) {
            return false;
        }

        var entry = array[array.length - 1];

        if (typeof entry === 'undefined' || entry.length == 0) {
            return true;
        }

        return false;
    }

    $scope.removeObjectKey = function (theobject, key) {
        if (theobject[key]) {
            if (confirm(`Are you sure you want to delete '${key}'?`)) {
                delete theobject[key];
            }
        }
    }

    $scope.addObjectKey = function (theobject, key, value) {
        theobject[key] = value;
    }

    $scope.sortObjectArray = function (objectArray, sortProperty) {
        //return orderBy(objectArray, [sortProperty], ["asc"]);
        return objectArray;
    }

    $scope.removeFromObjectArray = function (thearray, index, value) {
        if (confirm(`Are you sure you want to delete '${value}'?`)) {
            thearray.splice(index, 1);
        }
    }

    $scope.addToObjectArray = function (thearray, value) {
        return thearray.push(value);
    }

    // helper function to use Object.keys in templates
    $scope.keys = function (object) {
        if (object) {
            return Object.keys(object).sort();
        }
    }

    $scope.flatten = function (list, textAttribute) {
        return uniq(list.reduce((result, item) => {
            const text = item[textAttribute];
            if (text) {
                result.push(text);
            }
            return result;
        }, [])).sort();
    }


    // --- init ---
    $scope.loadActionGroups();
    $scope.loadLicense();
    $scope.loadAdminPermissions();

});

app.filter('escape', function() {
    return window.encodeURIComponent;
});
