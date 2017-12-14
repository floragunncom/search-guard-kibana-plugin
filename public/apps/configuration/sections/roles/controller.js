import chrome from 'ui/chrome';
import { uiModules } from 'ui/modules'
import { get } from 'lodash';
import '../../backend_api/roles';
import '../../backend_api/actiongroups';
import '../../systemstate'

const app = uiModules.get('apps/searchguard/configuration', []);

app.controller('sgRolesController', function ($scope, $element, $route, createNotifier, backendRoles, kbnUrl) {

    $scope.endpoint = "ROLES";
    $scope.$parent.endpoint = "ROLES";

    $scope.service = backendRoles;
    $scope.$parent.service = backendRoles;

    $scope.resources = {};

    $scope.title = "Manage Roles";

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

app.controller('sgEditRolesController', function ($rootScope, $scope, $element, $route, $location, $routeParams, $http, $window, createNotifier, backendRoles, backendrolesmapping, backendAPI, kbnUrl, systemstate) {

    var APP_ROOT = `${chrome.getBasePath()}`;
    var API_ROOT = `${APP_ROOT}/api/v1`;

    $scope.endpoint = "ROLES";
    $scope.$parent.endpoint = "ROLES";

    $scope.service = backendRoles;
    $scope.$parent.service = backendRoles;

    $scope.resourcelabel = "Search Guard Role";
    $scope.loaded = false;
    $scope.resource = {};
    $scope.resourcename = "";
    $scope.resourcenames = [];
    $scope.rolemapping = {};
    $scope.isNew = true;

    $scope.dlsFlsEnabled = false;
    $scope.multiTenancy = false;

    $scope.selectedTab = "";
    $scope.selectedIndex = '';
    $scope.selectedDocumentType = "";

    $scope.newIndexName = "";
    $scope.newDocumentTypeName = "";

    $scope.addingIndex = false;

    // autocomplete
    $scope.indices = {};
    $scope.indexAutoComplete = [];
    $scope.doctypeAutoComplete = [];

    const notify = createNotifier();


    $scope.title = function () {
        return $scope.isNew? "New Role " : "Edit Role '" + $scope.resourcename+"'";
    }

    $scope.initialiseStates = () => {
        systemstate.loadSystemInfo().then(function(){
            $scope.dlsFlsEnabled = systemstate.dlsFlsEnabled();
            $scope.multiTenancyEnabled = systemstate.multiTenancyEnabled();
        });
    }

    $scope.loadIndices = () => {

        $scope.indices = {};
        $scope.indexAutoComplete = [];
        $scope.doctypeAutoComplete = [];

        $http.get(`${API_ROOT}/configuration/indices`)
            .then(
            (response) => {
                Object.keys(response.data).sort().forEach(function (indexname) {
                        var index = {};
                        index["name"] = indexname;
                        var doctypesList = [];
                        Object.keys(response.data[indexname].mappings).sort().forEach(function (doctypename) {
                            var doctype = {};
                            doctype["name"] = doctypename;
                            doctypesList.push(doctype);
                        });
                        index["doctypes"] = doctypesList;
                        $scope.indices[indexname] = index;
                        $scope.indexAutoComplete.push(index);
                    }
                );
            },
            (error) => {
                notify.error(error)
            }
        );
    };

    $scope.$watch('newIndexName', function(newvalue, oldvalue) {
        if(!newvalue || !$scope.indices[newvalue]) {
            $scope.doctypeAutoComplete = [];
        } else {
            $scope.doctypeAutoComplete = $scope.indices[newvalue].doctypes;
        }
    }, true);

    $scope.getTabCss = function(tabId) {
        if ($scope.selectedTab == tabId) {
            return "kuiLocalTab kuiLocalTab-isSelected";
        } else {
            return "kuiLocalTab";
        }
    }

    $scope.selectTab = function(tabId) {
        $scope.selectedTab = tabId;
        if (tabId == 'dlsfls') {
            // resize editor, see https://github.com/angular-ui/ui-ace/issues/18
            var editor = ace.edit("object-form-dls-json-raw");
            editor.session.setMode("ace/mode/json")
            editor.resize();
            editor.renderer.updateFull();
            // try to beautify
            var code = editor.getSession().getValue();
            try {
                var codeAsJson = JSON.parse(code);
                editor.getSession().setValue(JSON.stringify(codeAsJson, null, 2));
            } catch(exception) {
                // no valid json
            }
        }
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
        if($scope.newIndexName.trim().length == 0 || $scope.newDocumentTypeName.trim().length == 0 ) {
            $scope.errorMessage = "Please define both index and document type.";
            return;
        }
        if($scope.resource.indices[$scope.newIndexName] && $scope.resource.indices[$scope.newIndexName][$scope.newDocumentTypeName] ) {
            $scope.errorMessage = "This index and document type is already defined, please choose another one.";
            return;
        }
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

    $scope.loadRoleMapping = function() {
        backendrolesmapping.getSilent($scope.resourcename, false)
            .then((response) => {
                $scope.rolemapping = response;
            });
    }

    $scope.testDls = function() {
        // try to beautify
        var editor = ace.edit("object-form-dls-json-raw");
        var code = editor.getSession().getValue();
        try {
            var codeAsJson = JSON.parse(code);
            editor.getSession().setValue(JSON.stringify(codeAsJson, null, 2));
        } catch(exception) {
            // no valid json
        }

        var encodedIndex = $window.encodeURIComponent($scope.selectedIndex);
        var query = "{\"query\": " + $scope.resource.dlsfls[$scope.selectedIndex]['_dls_'] + "}";
        $http.post(`${API_ROOT}/configuration/validatedls/`+encodedIndex, query)
            .then(
            (response) => {
                if (!response.data.valid) {
                    notify.error(response.data.error);
                } else {
                    $scope.errorMessage = "";
                    notify.info("DLS query syntax valid.");
                }
            },
            (error) => {
                notify.error(error);
            }
        );
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

        // faulty index settings
        var indicesStatus = $scope.service.checkIndicesStatus($scope.resource);

        if(indicesStatus.faultyIndices.length > 0) {
            var error = "One or more indices / document types have empty permissions:";
            // todo: format error in view, not here.
            error += "<ul>";
            indicesStatus.faultyIndices.forEach(function(faultyIndex) {
                error += "<li>" + faultyIndex + "</li>"
            });
            error += "</ul>";
            $scope.displayErrorOnTab(error, "indexpermissions");
            return;
        }

        // we need at least cluster permissions, index permissions, or tenants, empty roles
        // are not supported.
        if ($scope.service.isRoleEmpty($scope.resource)) {
            $scope.displayErrorOnTab("Please define at least cluster permissions or index permissions", "indexpermissions");
            return;
        }

        if (form.hasClass('ng-invalid-required')) {
            $scope.errorMessage = 'Please fill in all the required parameters.';
            return;
        }
        backendAPI.cleanArraysFromDuplicates($scope.resource);
        $scope.service.save($scope.resourcename, $scope.resource).then(() => kbnUrl.change(`/roles/`));;

        $scope.errorMessage = null;

    };

    $scope.displayErrorOnTab = function(error, tab) {
        $scope.errorMessage = error;
        $scope.selectedTab = tab;

    }

    // -- init
    $scope.initialiseStates();
    $scope.loadIndices();

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
                        delete($scope.resource.readonly);
                        $scope.selectedTab = "overview";
                    }
                    $scope.indexname = $routeParams.indexname;
                    $scope.loadRoleMapping();
                    if(indexname) {
                        $scope.selectedIndex = indexname;
                        $scope.selectedTab = "indexpermissions";

                    } else {
                        if($scope.resource.indices && Object.keys($scope.resource.indices).length > 0) {
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
            if ($routeParams.name) {
                $scope.resourcename = $routeParams.name;
            }
            $scope.isNew = true;
        }
        $scope.loaded = true;
    });

});


