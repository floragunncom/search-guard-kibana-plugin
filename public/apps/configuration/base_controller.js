import { uiModules } from 'ui/modules';
import chrome from 'ui/chrome';
import { SavedObjectsClientProvider } from 'ui/saved_objects';

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
import './systemstate'

const app = uiModules.get('apps/searchguard/configuration', ['ui.ace']);

app.controller('sgBaseController', function ($scope, $element, $route, $window, $http, createNotifier, backendAPI, backendActionGroups, backendRoles, kbnUrl, systemstate) {

    var APP_ROOT = `${chrome.getBasePath()}`;
    var API_ROOT = `${APP_ROOT}/api/v1`;

    const notify = createNotifier({});

    // props of the child controller
    $scope.service = null;
    $scope.endpoint = null;

    // loading state and loaded resources
    $scope.numresources = "0";
    $scope.loaded = false;

    $scope.title = "Search Guard Base Controller";
    $scope.errorMessage = "";
    $scope.query = "";
    $scope.resource = {};
    $scope.showEditor = false;
    $scope.toggleEditorLabel = "Show JSON";
    $scope.resourceAsJson = null;
    $scope.licensevalid = true;
    $scope.accessState = "pending";

    // objects for autocomplete
    $scope.actiongroupsAutoComplete = {};
    $scope.rolesAutoComplete = {};
    $scope.clusterpermissionsAutoComplete = clusterpermissions;
    $scope.indexpermissionsAutoComplete = indexpermissions;
    $scope.allpermissionsAutoComplete = indexpermissions.concat(clusterpermissions);
    $scope.currentuser = "";

    // modal delete dialogue
    $scope.displayModal = false;
    $scope.deleteModalResourceName = "";

    $scope.title = "Search Guard Configuration";

    $scope.initialiseStates = () => {
        systemstate.loadSystemInfo().then(function(){
            if (!systemstate.restApiEnabled()) {
                $scope.accessState = "notenabled";
            } else {
                systemstate.loadRestInfo().then(function(){
                    if (!systemstate.hasApiAccess()) {
                        $scope.accessState = "forbidden";
                    } else {
                        $scope.accessState = "ok";
                        $scope.loadActionGroups();
                        $scope.loadRoles();
                    }
                });
            }
        });
        systemstate.loadRestInfo().then(function(){
            $scope.currentuser = systemstate.getRestApiInfo().user_name;
        });

    }

    $scope.loadActionGroups = () => {
        var cachedActionGroups = sessionStorage.getItem("actiongroupsautocomplete");

        if (cachedActionGroups) {
            $scope.actiongroupsAutoComplete = JSON.parse(cachedActionGroups);
            return;
        }

        if(systemstate.endpointAndMethodEnabled("ACTIONGROUPS","GET")) {
            backendActionGroups.listSilent().then((response) => {
                $scope.actiongroupsAutoComplete = backendActionGroups.listAutocomplete(Object.keys(response.data));
                sessionStorage.setItem("actiongroupsautocomplete", JSON.stringify($scope.actiongroupsAutoComplete));
            }, (error) => {
                notify.error(error);
                $scope.accessState = "forbidden";
            });
        }
    }

    $scope.loadRoles = () => {
        var cachedRoles = sessionStorage.getItem("rolesautocomplete");

        if (cachedRoles) {
            $scope.rolesAutoComplete = JSON.parse(cachedRoles);
            return;
        }

        if(systemstate.endpointAndMethodEnabled("ROLES","GET")) {
            backendRoles.listSilent().then((response) => {
                $scope.rolesAutoComplete = backendRoles.listAutocomplete(Object.keys(response.data));
                sessionStorage.setItem("rolesautocomplete", JSON.stringify($scope.rolesAutoComplete));
            }, (error) => {
                notify.error(error);
                $scope.accessState = "forbidden";
            });
        }
    }

    $scope.clearCache = function() {
        backendAPI.clearCache();
    }

    $scope.getDocTypeAutocomplete = () => {
        $scope.indexAutoComplete = backendAPI.indexAutocomplete();
    }

    $scope.endpointAndMethodEnabled = (endpoint, method) => {
        return systemstate.endpointAndMethodEnabled(endpoint, method);
    }

    // +++ START common functions for all controllers +++

    // --- Start navigation
    $scope.edit = function(resourcename) {
        kbnUrl.change('/' +$scope.endpoint.toLowerCase() + '/edit/' + resourcename );
    }

    $scope.new = function() {
        kbnUrl.change('/' +$scope.endpoint.toLowerCase() + '/new/');
    }

    $scope.clone = function(resourcename) {
        kbnUrl.change('/' +$scope.endpoint.toLowerCase() + '/clone/' + resourcename);
    }

    $scope.cancel = function () {
        kbnUrl.change('/' +$scope.endpoint.toLowerCase() );
    }
    // --- End navigation

    $scope.delete = function() {
        $scope.displayModal = false;
        var name = $scope.deleteModalResourceName;
        $scope.deleteModalResourceName = "";
        $scope.service.delete(name)
            .then(() => $scope.cancel());
    }

    $scope.confirmDelete = function(resourcename) {
        $scope.deleteModalResourceName = resourcename;
        $scope.displayModal = true;
    }

    $scope.closeDeleteModal = () => {
        $scope.deleteModalResourceName = "";
        $scope.displayModal = false;
    };


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
    $scope.initialiseStates();

});

app.filter('escape', function() {
    return window.encodeURIComponent;
});

app.filter('unsafe', function($sce) {
    return $sce.trustAsHtml;
});
