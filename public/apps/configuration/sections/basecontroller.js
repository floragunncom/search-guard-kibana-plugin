import { uiModules } from 'ui/modules'
import { get } from 'lodash';
import '../backend_api/actiongroups';
const app = uiModules.get('apps/searchguard/configuration', []);

app.controller('sgBaseController', function ($scope, $element, $route, backendActionGroups, createNotifier, kbnUrl) {

    $scope.title = "Search Guard Base Controller";

    $scope.actiongroupsAutoComplete = "";

    $scope.query = "";

    // get actiongroups for autocomplete
    // todo: check lazy loading
    backendActionGroups.list().then((response) => {
        $scope.actiongroupsAutoComplete = backendActionGroups.listAutocomplete(Object.keys(response.data.data));
    });

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
        if (array && array == 'undefined') {
            return true;
        }
        return (array &&
        array.length > 0 &&
        array[array.length - 1].trim().length == 0);
    }

    $scope.removeObjectKey = function (theobject, key) {
        if (theobject[key]) {
            if (confirm(`Are you sure you want to delete '${key}'?`)) {
                delete theobject[key];
            }
        }
    }

    // helper function to use Object.keys in templates
    $scope.keys = function (object) {
        if (object) {
            return Object.keys(object).sort();
        }
    }
});

app.filter('escape', function() {
    return window.encodeURIComponent;
});
