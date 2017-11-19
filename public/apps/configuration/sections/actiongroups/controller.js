import { uiModules } from 'ui/modules';
import { get } from 'lodash';
import '../../backend_api/actiongroups';

const app = uiModules.get('apps/searchguard/configuration', []);

app.controller('sgActionGroupsController', function ($scope, $element, $route, createNotifier, backendActionGroups, kbnUrl) {

    const notify = createNotifier({});

    $scope.endpoint = "ACTIONGROUPS";
    $scope.$parent.endpoint = "ACTIONGROUPS";

    $scope.service = backendActionGroups;
    $scope.$parent.service = backendActionGroups;

    $scope.resources = {};

    $scope.title = "Manage Action Groups";

    $scope.service.list()
        .then((response) => {
            $scope.resourcenames = Object.keys(response.data).sort();

            $scope.resourcenames.forEach(function (entry) {
                $scope.resources[entry] = $scope.service.postFetch(response.data[entry]);
            });
            $scope.numresources = response.total;
            $scope.loaded = true;
        });
});

app.controller('sgEditActionGroupsController', function ($scope, $element, $route, $location, $routeParams, createNotifier, backendActionGroups, backendAPI,  kbnUrl) {

    $scope.endpoint = "ACTIONGROUPS";
    $scope.$parent.endpoint = "ACTIONGROUPS";

    $scope.service = backendActionGroups;
    $scope.$parent.service = backendActionGroups;

    $scope.resourcelabel = "Action Group";

    $scope.loaded = false;
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
        $scope.resourcenames = Object.keys(response.data);

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
                        delete($scope.resource.readonly);
                    }
                });
        } else {
            $scope.resource = $scope.service.emptyModel();
            if ($routeParams.name) {
                $scope.resourcename = $routeParams.name;
            }
            $scope.isNew = true;
        }
        $scope.loaded = true;
    });

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
            $scope.errorMessage = 'Action Group name already exists, please choose another one.';
            return;
        }

        if ($scope.resource.actiongroups.indexOf($scope.resourcename) != -1) {
            $scope.errorMessage = 'An Action Group can not reference itself, please remove entry with name "'+$scope.resourcename+'".';
            return;
        }

        // check for empty arrays
        $scope.resource.actiongroups = backendAPI.cleanArray($scope.resource.actiongroups);
        $scope.resource.permissions = backendAPI.cleanArray($scope.resource.permissions);

        if ($scope.resource.actiongroups.length == 0 && $scope.resource.permissions.length == 0) {
            $scope.errorMessage = 'Please configure at least one Action Group or Permission';
            return;
        }

        $scope.service.save($scope.resourcename, $scope.resource).then(() => kbnUrl.change(`/actiongroups/`));

        $scope.errorMessage = null;

    };
});
