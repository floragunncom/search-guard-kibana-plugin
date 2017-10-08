import { uiModules } from 'ui/modules'
import { get } from 'lodash';
import '../../backend_api/roles';
import '../../backend_api/actiongroups';

const app = uiModules.get('apps/searchguard/configuration', []);

app.controller('sgRolesController', function ($scope, $element, $route, createNotifier, backendRoles, kbnUrl) {

    $scope.endpoint = "ROLES";

    $scope.service = backendRoles;
    $scope.loaded = false;
    $scope.numresources = "0";
    $scope.resources = {};

    $scope.title = "Manage Roles";

    $scope.edit = function(rolename) {
        kbnUrl.change('/roles/edit/' + rolename );
    }

    $scope.new = function(actiongroup) {
        kbnUrl.change('/roles/add/');
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

    $scope.service.list().then(function (response) {
        $scope.resourcenames = Object.keys(response.data).sort();

        $scope.resourcenames.forEach(function (entry) {
            $scope.resources[entry] = $scope.service.postFetch(response.data[entry]);
        });

        $scope.resources = response.data;
        $scope.numresources = response.total;
        $scope.loaded = true;
    });
});

app.controller('sgEditRolesController', function ($rootScope, $scope, $element, $route, $location, $routeParams, createNotifier, backendRoles, backendRoleMappings, kbnUrl) {

    $scope.service = backendRoles;
    $scope.$parent.service = backendRoles;
    $scope.resourcelabel = "Role name";
    $scope.loaded = false;
    $scope.resource = {};
    $scope.resourcename = "";
    $scope.resourcenames = [];
    $scope.rolemapping = {};
    $scope.isNew = true;

    $scope.selectedTab = "";
    $scope.selectedIndex = "";
    $scope.selectedDocumentType = "";

    $scope.newIndexName = "";
    $scope.newDocumentTypeName = "";

    $scope.addingIndex = false;

    $scope.title = function () {
        return $scope.isNew? "New Role " : "Edit Role '" + $scope.resourcename+"'";
    }

    $scope.getTabCss = function(tabId) {
        if ($scope.selectedTab == tabId) {
            return "kuiLocalTab kuiLocalTab-isSelected";
        } else {
            return "kuiLocalTab";
        }
    }

    $scope.selectTab = function(tabId) {
        $scope.selectedTab = tabId;
    }

    $scope.selectIndex = function(indexName) {
        $scope.selectedIndex = indexName;
    }

    $scope.selectDocumentType = function(doctype) {
        $scope.selectedDocumentType = doctype;
    }

    $scope.onIndexChange = function() {
        if($scope.resource.indices && $scope.resource.indices[$scope.selectedIndex]) {
            $scope.selectedDocumentType = Object.keys($scope.resource.indices[$scope.selectedIndex]).sort()[0];
        }
    }

    $scope.addIndex = function() {
        $scope.addingIndex = true;
    }

    $scope.indicesEmpty = function() {
        if ($scope.resource.indices) {
            // flat list of indexnames
            return Object.keys($scope.resource.indices).length == 0;
        }
        return true;
    }

    $scope.deleteDocumentType = function() {
        if (!confirm("Are you sure you want to delete document type '"+$scope.selectedDocumentType+"' in index '"+$scope.selectedIndex+"'")) {
            return;
        }
        var index = $scope.selectedIndex;
        var doctype = $scope.selectedDocumentType;
        if ($scope.resource.indices && $scope.resource.indices[index] && $scope.resource.indices[index][doctype]) {
            delete $scope.resource.indices[index][doctype];
            // if last doctype, remove role as well
            var remainingDocTypes = Object.keys($scope.resource.indices[index]);
            if (remainingDocTypes.length == 0) {
                delete $scope.resource.indices[index];
                delete $scope.resource.dlsfls[index];
                $scope.selectedDocumentType = "";
                $scope.selectedIndex = "";
            } else {
                $scope.selectedDocumentType = remainingDocTypes[0];
            }
        }
    }

    $scope.submitAddIndex = function() {
        $scope.service.addEmptyIndex($scope.resource, $scope.newIndexName, $scope.newDocumentTypeName);
        $scope.selectedIndex = $scope.newIndexName;
        $scope.selectedDocumentType = $scope.newDocumentTypeName;
        $scope.newIndexName = "";
        $scope.newDocumentTypeName = "";
        $scope.addingIndex = false;
        $scope.errorMessage = null;
    }

    $scope.cancelAddIndex = function() {
        $scope.newIndexName = "";
        $scope.newDocumentTypeName = "";
        $scope.addingIndex = false;
        $scope.errorMessage = null;
    }

    $scope.service.list().then((response) => {
        // exisiting role names for form validation
        $scope.resourcenames = Object.keys(response.data);

        var rolename = $routeParams.resourcename;
        var indexname = $routeParams.indexname;

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
                    $scope.loadRoleMapping();
                    if(indexname) {
                        $scope.selectedIndex = indexname
                        $scope.selectedTab = "indexpermissions";

                    } else {
                        if($scope.resource.indices) {
                            $scope.selectedIndex = Object.keys($scope.resource.indices).sort()[0];
                        }
                        $scope.selectedTab = "overview";
                    }
                    if($scope.resource.indices && $scope.resource.indices[$scope.selectedIndex]) {
                        $scope.selectedDocumentType = Object.keys($scope.resource.indices[$scope.selectedIndex]).sort()[0];
                    }
                });
        } else {
            $scope.selectedTab = "overview";
            $scope.resource = $scope.service.postFetch($scope.service.emptyModel());
            $scope.isNew = true;
        }
        $scope.loaded = true;
    });

    $scope.loadRoleMapping = function() {
        backendRoleMappings.get($scope.resourcename, false)
            .then((response) => {
                $scope.rolemapping = response;
            });
    }

    $scope.cancel = function () {
        kbnUrl.change('/roles');
    }

    $scope.saveObject = (event) => {
        if (event) {
            event.preventDefault();
        }
        const form = $element.find('form[name="objectForm"]');

        // role name is required
        if ($scope.objectForm.objectId.$error.required) {
            $scope.displayErrorOnTab("Please provide a role name.", "overview");
            return;
        }

        // duplicate role name
        if ($scope.isNew && $scope.resourcenames.indexOf($scope.resourcename) != -1) {
            $scope.displayErrorOnTab("Role with same name already exists, please choose another one.", "overview");
            return;
        }

        // we need at least cluster permissions, index permissions, or tenants, empty roles
        // are not supported.
        if ($scope.service.isRoleEmpty($scope.resource)) {
            $scope.displayErrorOnTab("Please define at least cluster permissions, index permissions or tenants", "overview");
            return;
        }


        if (form.hasClass('ng-invalid-required')) {
            $scope.errorMessage = 'Please fill in all the required parameters.';
            return;
        }

        // we need to preserve the original resource,
        // because we stay on the same page after save
        $scope.service.save($scope.resourcename, JSON.parse(JSON.stringify($scope.resource)));

        $scope.errorMessage = null;

    };

    $scope.displayErrorOnTab = function(error, tab) {
        $scope.errorMessage = error;
        $scope.selectedTab = tab;

    }
});


