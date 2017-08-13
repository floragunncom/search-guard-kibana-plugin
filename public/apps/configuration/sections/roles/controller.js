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

    $scope.edit = function(rolename) {
        kbnUrl.change('/roles/edit/' + rolename );
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

app.controller('sgEditRolesController', function ($rootScope, $scope, $element, $route, $location, $routeParams, createNotifier, backendRoles, kbnUrl) {

    $scope.service = backendRoles;

    $scope.resourcelabel = "Role name";

    $scope.resource = {};
    $scope.resourcename = "";
    $scope.resourcenames = [];
    $scope.isNew = true;
    $scope.query = "";
    $scope.indexname = "";

    $scope.shownewresourcename = false;
    $scope.newresourcename = "";
    $scope.newresourcevalue = "";

    $scope.title = function () {
        return $scope.isNew? "New Role " : "Edit Role '" + $scope.resourcename+"'";
    }

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


    $scope.submitAddDocumentType = function () {
        $scope.resource.indices[$scope.indexname][$scope.newresourcename] = {};
        $scope.shownewresource = false;
        $scope.newresourcename = "";
    }

    $scope.submitAddIndex = function (newresourcename) {
        // not $scope.newresourcename, this element is inside accordeon
        // with its own scope
        $scope.resource.indices[newresourcename] = {};
        $scope.resource.indices[newresourcename]["*"] = {};
        $scope.service.save($scope.resourcename, $scope.resource).then(() => kbnUrl.change("/roles/edit/"+$scope.resourcename));
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

        $scope.service.save($scope.resourcename, $scope.resource).then(() => kbnUrl.change(`/roles/`));

        $scope.errorMessage = null;

    };

});
