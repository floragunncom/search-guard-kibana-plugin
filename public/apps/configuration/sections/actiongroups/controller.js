import { uiModules } from 'ui/modules';
import { get } from 'lodash';
import '../../backend_api/actiongroups';

const app = uiModules.get('apps/searchguard/configuration', []);

app.controller('sgActionGroupsController', function ($scope, $element, $route, createNotifier, backendActionGroups, kbnUrl) {

    $scope.service = backendActionGroups;

    $scope.numresources = "0";
    $scope.resources = {};

    $scope.title = "Manage Action Groups";

    $scope.edit = function(actiongroup) {
        kbnUrl.change('/actiongroups/edit/' + actiongroup );
    }

    $scope.new = function(actiongroup) {
        kbnUrl.change('/actiongroups/new/');
    }

    $scope.delete = function(actiongroup) {

        if ($scope.resourcenames.indexOf(actiongroup) != -1) {
            if (confirm(`Are you sure you want to delete Action Group ${actiongroup}?`)) {
                $scope.service.delete(actiongroup)
                    .then(() => kbnUrl.change('/actiongroups'));
            }
        }
    }

    $scope.clone = function(actiongroupname) {
        kbnUrl.change('/actiongroups/clone/' + actiongroupname);
    }


    $scope.service.list().success(function (response) {
        $scope.resourcenames = Object.keys(response.data).sort();

        $scope.resourcenames.forEach(function (entry) {
            $scope.resources[entry] = $scope.service.postFetch(response.data[entry]);
        });
        $scope.numresources = response.total;
    });

});

app.controller('sgEditActionGroupsController', function ($scope, $element, $route, $location, $routeParams, createNotifier, backendActionGroups, kbnUrl) {

    $scope.service = backendActionGroups;

    $scope.resource = {};
    $scope.resourcename = "";
    $scope.resourcenames = [];
    $scope.isNew = false;
    $scope.query = "";

    $scope.title = function () {
        return $scope.isNew? "New Action Groups" : "Edit Action Group '" + $scope.resourcename+"'";
    }

    // get all usernames and load pre-existing user, if any
    $scope.service.list().then((response) => {
        $scope.resourcenames = Object.keys(response.data.data);

        var actiongroupname = $routeParams.resourcename;
        if (actiongroupname) {
            $scope.service.get(actiongroupname)
                .then((response) => {
                    $scope.resource = $scope.service.postFetch(response);
                    $scope.resourcename = actiongroupname;
                    if($location.path().indexOf("clone") == -1) {
                        $scope.isNew = false;
                    } else {
                        $scope.resourcename = $scope.resourcename + " (COPY)";
                        $scope.isNew = true;
                    }
                });
        } else {
            $scope.resource = $scope.service.emptyModel();
            $scope.isNew = true;
        }
    });

    $scope.addActionGroup = function () {
        $scope.resource.actiongroups.push("");
    }

    $scope.removeActionGroup = function (actiongroupname) {
        $scope.removeArrayEntry($scope.resource.actiongroups, actiongroupname);
    }

    $scope.lastActionGroupEmpty = function () {
        return $scope.lastArrayEntryEmpty($scope.resource.actiongroups);
    }

    $scope.addPermission = function () {
        $scope.resource.permissions.push("");
    }

    $scope.removePermission = function (actiongroupname) {
        $scope.removeArrayEntry($scope.resource.permissions, actiongroupname);
    }

    $scope.lastPermissionEmpty = function () {
        return $scope.lastArrayEntryEmpty($scope.resource.permissions);
    }

    $scope.removeArrayEntry = function (array, item) {
        if (confirm(`Are you sure you want to delete '${item}'?`)) {
            var index = array.indexOf(item);
            array.splice(index, 1);
        }
    }

    $scope.lastArrayEntryEmpty = function (array) {
        return (array &&
        array.length > 0 &&
        array[array.length - 1].trim().length == 0);
    }

    $scope.cancel = function () {
        kbnUrl.change('/actiongroups');
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

        $scope.service.save($scope.resourcename, $scope.resource).then(() => kbnUrl.change(`/actiongroups/`));

        $scope.errorMessage = null;

    };
});
