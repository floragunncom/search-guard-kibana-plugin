import { uiModules } from 'ui/modules';
import { get } from 'lodash';
import '../../backend_api/rolemappings';

const app = uiModules.get('apps/searchguard/configuration', []);

app.controller('sgRoleMappingsController', function ($scope, $element, $route, createNotifier, backendRoleMappings, kbnUrl) {

    $scope.service = backendRoleMappings;

    $scope.numresources = "0";
    $scope.resources = {};

    $scope.title = "Manage Roles Mapping Groups";

    $scope.edit = function(rolemapping) {
        kbnUrl.change('/rolemappings/edit/' + rolemapping );
    }

    $scope.new = function(rolemapping) {
        kbnUrl.change('/rolemappings/new/');
    }

    $scope.delete = function(rolemapping) {

        if ($scope.resourcenames.indexOf(rolemapping) != -1) {
            if (confirm(`Are you sure you want to delete Role Mapping ${rolemapping}?`)) {
                $scope.service.delete(rolemapping)
                    .then(() => kbnUrl.change('/rolemappings'));
            }
        }
    }

    $scope.clone = function(rolemapping) {
        kbnUrl.change('/rolemappings/clone/' + rolemapping);
    }


    $scope.service.list().success(function (response) {
        $scope.resourcenames = Object.keys(response.data).sort();

        //$scope.resourcenames.forEach(function (entry) {
        //    $scope.resources[entry] = $scope.service.postFetch(response.data[entry]);
        //});
        $scope.resources = response.data;
        $scope.numresources = response.total;
    });

});

app.controller('sgEditRoleMappingsController', function ($scope, $element, $route, $location, $routeParams, createNotifier, backendRoleMappings, kbnUrl) {

    $scope.service = backendRoleMappings;

    $scope.resource = {};
    $scope.resourcename = "";
    $scope.resourcenames = [];
    $scope.isNew = false;
    $scope.query = "";

    $scope.title = function () {
        return $scope.isNew? "New Role Mapping" : "Edit Role Mapping '" + $scope.resourcename+"'";
    }

    // get all usernames and load pre-existing user, if any
    $scope.service.list().then((response) => {
        $scope.resourcenames = Object.keys(response.data.data);

        var rolemapping = $routeParams.resourcename;
        if (rolemapping) {
            $scope.service.get(rolemapping)
                .then((response) => {
                    $scope.resource = $scope.service.postFetch(response);
                    $scope.resourcename = rolemapping;
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

    $scope.addUser = function () {
        if (!$scope.resource.users) {
            $scope.resource.users = [];
        }
        $scope.resource.users.push("");
    }

    $scope.removeUser = function (user) {
        $scope.removeArrayEntry($scope.resource.users, user);
    }

    $scope.lastUserEmpty = function () {
        return $scope.lastArrayEntryEmpty($scope.resource.users);
    }

    $scope.addBackendRole = function () {
        if (!$scope.resource.backendroles) {
            $scope.resource.backendroles = [];
        }
        $scope.resource.backendroles.push("");
    }

    $scope.removeBackendRole = function (backendrole) {
        $scope.removeArrayEntry($scope.resource.backendroles, backendrole);
    }

    $scope.lastBackendRoleEmpty = function () {
        return $scope.lastArrayEntryEmpty($scope.resource.backendroles);
    }

    $scope.addHost = function () {
        if (!$scope.resource.hosts) {
            $scope.resource.hosts = [];
        }
        $scope.resource.hosts.push("");
    }

    $scope.removeHost = function (host) {
        $scope.removeArrayEntry($scope.resource.hosts, host);
    }

    $scope.lastHostEmpty = function () {
        return $scope.lastArrayEntryEmpty($scope.resource.hosts);
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
        kbnUrl.change('/rolemappings');
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

        $scope.service.save($scope.resourcename, $scope.resource).then(() => kbnUrl.change(`/rolemappings/`));

        $scope.errorMessage = null;

    };
});
