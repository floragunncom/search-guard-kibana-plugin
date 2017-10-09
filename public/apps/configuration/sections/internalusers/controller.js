import { uiModules } from 'ui/modules';
import { get } from 'lodash';
import '../../backend_api/internalusers';

const app = uiModules.get('apps/searchguard/configuration', []);

app.controller('sgInternalUsersController', function ($scope, $element, $route, createNotifier, backendInternalUsers, kbnUrl) {

    $scope.endpoint = "INTERNALUSERS";
    $scope.$parent.endpoint = "INTERNALUSERS";

    $scope.service = backendInternalUsers;
    $scope.$parent.service = backendInternalUsers;

    $scope.title = "Manage Internal User";

    $scope.delete = function(username) {

        if ($scope.resourcenames.indexOf(username) != -1) {
            if (confirm(`Are you sure you want to delete internal user ${username}?`)) {
                $scope.service.delete(username)
                    .then(() => kbnUrl.change('/internalusers'));
            }
        }
    }

    $scope.service.list().then(function (response) {
        $scope.resourcenames = Object.keys(response.data).sort();
        $scope.resources = response.data;
        $scope.numresources = response.total;
        $scope.loaded = true;
    });

});

app.controller('sgEditInternalUsersController', function ($scope, $element, $route, $location, $routeParams, createNotifier, backendInternalUsers, kbnUrl) {

    $scope.endpoint = "INTERNALUSERS";
    $scope.$parent.endpoint = "INTERNALUSERS";

    $scope.service = backendInternalUsers;
    $scope.$parent.service = backendInternalUsers;

    $scope.resourcelabel = "Username";

    $scope.resource = {};
    $scope.resourcename = "";
    $scope.resourcenames = [];
    $scope.isNew = false;

    $scope.title = function () {
        return $scope.isNew? "New Internal User" : "Edit Internal User '" + $scope.resourcename+"'";
    }

    // get all usernames and load pre-existing user, if any
    $scope.service.list().then((response) => {

        $scope.resourcenames = Object.keys(response.data);

        var username = $routeParams.resourcename;

        if (username) {
            $scope.service.get(username)
                .then((response) => {
                    $scope.service.postFetch(response);
                    $scope.resource = response;
                    $scope.resourcename = username;
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
        kbnUrl.change('/internalusers');
    }

    $scope.saveObject = (event) => {
        if (event) {
            event.preventDefault();
        }

        const form = $element.find('form[name="objectForm"]');

        if ($scope.isNew && $scope.resourcenames.indexOf($scope.resourcename) != -1) {
            $scope.errorMessage = 'Username already exists, please choose another one.';
            return;
        }

        if (form.hasClass('ng-invalid-required')) {
            $scope.errorMessage = 'Please fill in all the required parameters.';
            return;
        }

        if (!form.hasClass('ng-valid')) {
            $scope.errorMessage = 'Please correct all errors and try again.';
            return;
        }

        if ($scope.resource.password !== $scope.resource.passwordConfirmation) {
            $scope.errorMessage = 'Passwords do not match.';
            return;
        }

        $scope.service.save($scope.resourcename, $scope.resource).then(() => kbnUrl.change(`/internalusers/`));

        $scope.errorMessage = null;

    };
});
