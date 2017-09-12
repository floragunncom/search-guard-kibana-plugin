import { uiModules } from 'ui/modules';
import { get } from 'lodash';
import '../../backend_api/rolemappings';

const app = uiModules.get('apps/searchguard/configuration', []);

app.controller('sgRoleMappingsController', function ($scope, $element, $route, createNotifier, backendRoleMappings, kbnUrl) {

    $scope.service = backendRoleMappings;
    $scope.loaded = false;
    $scope.numresources = "0";
    $scope.resources = {};

    $scope.title = "Manage Role Mappings";

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


    $scope.service.list().then(function (response) {
        $scope.resourcenames = Object.keys(response.data).sort();
        $scope.resources = response.data;
        $scope.numresources = response.total;
        $scope.loaded = true;
    });

});

app.controller('sgEditRoleMappingsController', function ($scope, $element, $route, $location, $routeParams, createNotifier, backendRoleMappings, backendAPI, kbnUrl) {

    $scope.service = backendRoleMappings;
    $scope.$parent.service = backendRoleMappings;
    $scope.resourcelabel = "Search Guard role";
    $scope.loaded = false;
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
        $scope.resourcenames = Object.keys(response.data);

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
        $scope.loaded = true;
    });

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
            $scope.errorMessage = 'Role mapping for Search Guard group "'+$scope.resourcename+'"already exists, please choose another one.';
            return;
        }

        // check for empty arrays
        $scope.resource.users = backendAPI.cleanArray($scope.resource.users);
        $scope.resource.backendroles = backendAPI.cleanArray($scope.resource.backendroles);
        $scope.resource.hosts = backendAPI.cleanArray($scope.resource.hosts);

        if ($scope.resource.users.length == 0 && $scope.resource.backendroles.length == 0 && $scope.resource.hosts.length == 0) {
            $scope.errorMessage = 'Please configure at least one of users, backend roles or hosts.';
            return;
        }

        $scope.service.save($scope.resourcename, $scope.resource).then(() => kbnUrl.change(`/rolemappings/`));

        $scope.errorMessage = null;

    };
});
