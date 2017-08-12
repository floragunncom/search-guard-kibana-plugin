import { uiModules } from 'ui/modules'
import { get } from 'lodash';
import '../../backend_api/roles';
import '../../backend_api/actiongroups';

const app = uiModules.get('apps/searchguard/configuration', []);

app.controller('sgRolesController', function ($scope, $element, $route, createNotifier, backendRoles, kbnUrl) {

    $scope.service = backendRoles;

    $scope.numresources = "0";
    $scope.resources = {};

    $scope.title = "Manage Roles";

    $scope.edit = function(actiongroup) {
        kbnUrl.change('/roles/edit/' + actiongroup );
    }

    $scope.new = function(actiongroup) {
        kbnUrl.change('/roles/new/');
    }

    $scope.delete = function(actiongroup) {

        if ($scope.resourcenames.indexOf(actiongroup) != -1) {
            if (confirm(`Are you sure you want to delete Action Group ${actiongroup}?`)) {
                $scope.service.delete(actiongroup)
                    .then(() => kbnUrl.change('/roles'));
            }
        }
    }

    $scope.clone = function(actiongroupname) {
        kbnUrl.change('/rolemappings/clone/' + actiongroupname);
    }


    $scope.service.list().success(function (response) {
        $scope.resourcenames = Object.keys(response.data).sort();

        $scope.resourcenames.forEach(function (entry) {
            $scope.resources[entry] = $scope.service.postFetch(response.data[entry]);
        });

        $scope.resources = response.data;
        $scope.numresources = response.total;
    });

});

app.controller('sgEditRolesController', function ($rootScope, $scope, $element, $route, $location, $routeParams, createNotifier, backendRoles, backendActionGroups, kbnUrl) {

    $scope.service = backendRoles;

    $scope.resourcelabel = "Role name";

    $scope.resource = {};
    $scope.resourcename = "";
    $scope.resourcenames = [];
    $scope.isNew = false;
    $scope.query = "";
    $scope.actiongroupsAutoComplete = "";
    $scope.indexname = "";

    $scope.shownewdocumenttypename = false;
    $scope.newdocumenttypename = "";

    $scope.title = function () {
        return $scope.isNew? "New Role " : "Edit Role '" + $scope.resourcename+"'";
    }

    // get actiongroups for autocomplete
    backendActionGroups.list().then((response) => {
        $scope.actiongroupsAutoComplete = backendActionGroups.listAutocomplete(Object.keys(response.data.data));
    });

    // get all usernames and load pre-existing user, if any
    $scope.service.list().then((response) => {
        $scope.resourcenames = Object.keys(response.data.data);

        var rolename = $routeParams.resourcename;
        if (rolename) {
            $scope.service.get(rolename)
                .then((response) => {
                    $scope.resource = $scope.service.postFetch(response);
                    $scope.resourcename = rolename;
                    if($location.path().indexOf("clone") == -1) {
                        $scope.isNew = false;
                    } else {
                        $scope.resourcename = $scope.resourcename + " (COPY)";
                        $scope.isNew = true;
                    }
                    $scope.indexname = $routeParams.indexname;
                });
        } else {
            $scope.resource = $scope.service.emptyModel();
            $scope.isNew = true;
        }
    });

    // helper function to use Object.keys in templates
    // todo: move to root?
    $scope.keys = function (object) {
        if (object) {
            return Object.keys(object).sort();
        }
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


    $scope.cancelAddDocumentType = function () {
        $scope.shownewdocumenttypename = false;
        $scope.newdocumenttypename = "";
    }

    $scope.submitAddDocumentType = function () {
        $scope.resource.indices[$scope.indexname][$scope.newdocumenttypename] = {};
        $scope.shownewdocumenttypename = false;
        $scope.newdocumenttypename = "";
    }


    $scope.cancel = function () {
        kbnUrl.change('/roles');
    }

    $scope.saveObject = (event) => {
        if (event) {
            event.preventDefault();
        }

        const form = $element.find('form[name="objectForm"]');

        if (form.hasClass('ng-invalid-required')) {
            $scope.errorMessage = 'Please fill in all the required parameters.';
            return;
        }

        if (!form.hasClass('ng-valid')) {
            $scope.errorMessage = 'Please correct all errors and try again.';
            return;
        }

        if ($scope.isNew && $scope.resourcenames.indexOf($scope.resourcename) != -1) {
            $scope.errorMessage = 'Username already exists, please choose another one.';
            return;
        }

        if ($scope.resource.password !== $scope.resource.passwordConfirmation) {
            $scope.errorMessage = 'Passwords do not match.';
            return;
        }

        $scope.service.save($scope.resourcename, $scope.resource).then(() => kbnUrl.change(`/roles/`));

        $scope.errorMessage = null;

    };

});

app.filter('escape', function() {
    return window.encodeURIComponent;
});
