import chrome from 'ui/chrome';
import { uiModules } from 'ui/modules'
import { get } from 'lodash';
import { uniq } from 'lodash';
import { orderBy } from 'lodash';
import { Notifier } from 'ui/notify/notifier';
import clusterpermissions  from '../permissions/clusterpermissions';
import indexpermissions  from '../permissions/indexpermissions';

import '../backend_api/actiongroups';
const app = uiModules.get('apps/searchguard/configuration', []);

app.controller('sgBaseController', function ($scope, $element, $route, backendActionGroups, $http, createNotifier, kbnUrl) {

    var APP_ROOT = `${chrome.getBasePath()}`;
    var API_ROOT = `${APP_ROOT}/api/v1`;
    let notify = new Notifier({});

    $scope.title = "Search Guard Base Controller";
    $scope.actiongroupsAutoComplete = "";
    $scope.clusterpermissionsAutoComplete = clusterpermissions;
    $scope.indexpermissionsAutoComplete = indexpermissions;
    $scope.allpermissionsAutoComplete = indexpermissions.concat(clusterpermissions);
    $scope.licensevalid = "";
    $scope.query = "";
    $scope.resource = {};
    $scope.showEditor = false;
    $scope.toggleEditorLabel = "Show JSON";
    $scope.resourceAsJson = null;


    $scope.loadActionGroups = () => {
        backendActionGroups.list().then((response) => {
            $scope.actiongroupsAutoComplete = backendActionGroups.listAutocomplete(Object.keys(response.data));
        });
    }

    $scope.getActionGroupsAutoComplete = () => {
        backendActionGroups.list().then((response) => {
            return backendActionGroups.listAutocomplete(Object.keys(response.data));
        });
    }

    $scope.checkValidLicense = () => {
        $http.get(`${API_ROOT}/systeminfo`)
            .then(
            (response) => {
                $scope.licensevalid = response.data.sg_license.is_valid;
            },
            (error) => notify.error(error)
        );
    }

    $scope.loadActionGroups();
    $scope.checkValidLicense();

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
});

app.filter('escape', function() {
    return window.encodeURIComponent;
});
