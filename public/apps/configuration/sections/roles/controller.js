import { toastNotifications } from 'ui/notify';
import chrome from 'ui/chrome';
import { uiModules } from 'ui/modules'
import { get } from 'lodash';
import '../../backend_api/roles';
import '../../backend_api/actiongroups';
import '../../systemstate/systemstate'

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

    /**
     * Holds table sorting info
     * @type {{byKey: string, descending: boolean}}
     */
    $scope.sortTable = {
        byKey: 'resourcename',
        descending: false
    };

    /**
     * Handle changed sorting conditions.
     * Since we only have one column sortable, changing the key doesn't really do anything.
     * Until we have more sortable columns, only the sort order is changed
     * @param {string} key
     */
    $scope.onSortChange = function(key) {
        if ($scope.sortTable.byKey === key) {
            $scope.sortTable.descending = ! $scope.sortTable.descending;
        } else {
            $scope.sortTable.byKey = key;
        }
    };
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

    /**
     * The newIndexName and newDocumentTypeName as used by the autocomplete
     * @type {{index: null, documentType: null}}
     */
    $scope.newIndexValues = {
        index: null,
        documentType: null
    };

    $scope.addingIndex = false;

    // autocomplete
    $scope.indices = {};
    $scope.indexAutoComplete = [];
    $scope.doctypeAutoComplete = [];

    $scope.multiTenancyOptions = chrome.getInjected('multitenancy') || {enabled: false, tenants: {}};

    // Application permissions
    $scope.applicationPermissions = {
        tabTitle: ($scope.multiTenancyOptions.enabled) ? 'Tenants' : 'Application Permissions',
        selectedTenant: null,
        availableTenants: [],
        tenant: null,
        /**
         * This is a helper for when the autocomplete was closed an item being explicitly selected (mouse, tab or enter).
         * When you e.g. type a custom value and then click somewhere outside of the autocomplete, it looks like the
         * custom value was selected, but it is never saved to the model. This function calls the "select" method
         * every time the autocomplete is closed, no matter how. This may mean that the select function is called
         * twice, so the select handler should mitigate that if necessary.
         * @param isOpen
         * @param $select
         */
        onCloseNewTenantAutocomplete: function(isOpen, $select) {
            if (isOpen || !$select.select || !$select.selected) {
                return;
            }

            $select.select($select.selected);
        },
        onSelectedTenant: (item) => {

            // If we want to enable adding tenants here...
            if (item.id === -1) {
                let newTenant = {
                    name: item.name,
                    permissions: [],
                    actiongroups: []
                };

                $scope.applicationPermissions.availableTenants.push(newTenant);
                $scope.resource.tenantsArray.push(newTenant);
                $scope.applicationPermissions.tenant = newTenant;

            } else {
                $scope.applicationPermissions.tenant = $scope.applicationPermissions.availableTenants.find(tenant => item.name === tenant.name);
            }

            if (! $scope.applicationPermissions.tenant) {
                $scope.applicationPermissions.tenant = item;
            }
        },

        confirmRemoveSelectedTenant: function() {
            // We're not checking the value here, so we may need to adjust the body
            if (! $scope.applicationPermissions.selectedTenant || $scope.applicationPermissions.selectedTenant.isDeletable === false) {
                return;
            }

            $scope.deleteFromEditModal = {
                displayModal: true,
                header: 'Confirm Delete',
                body: `Are you sure you want to remove '${$scope.applicationPermissions.selectedTenant.name}'?`,
                onConfirm: function() {
                    const selectedTenant = $scope.applicationPermissions.selectedTenant;
                    $scope.applicationPermissions.availableTenants = $scope.applicationPermissions.availableTenants.filter(tenant => tenant.name !== selectedTenant.name);
                    $scope.resource.tenantsArray = $scope.resource.tenantsArray.filter(tenant => tenant.name !== selectedTenant.name);

                    $scope.applicationPermissions.selectedTenant = null;

                    if ($scope.applicationPermissions.availableTenants.length) {
                        $scope.applicationPermissions.tenant = $scope.applicationPermissions.availableTenants[0];
                        $scope.applicationPermissions.selectedTenant = $scope.applicationPermissions.tenant
                    }

                    $scope.deleteFromEditModal.displayModal = false;
                },
                onClose: function() {
                    $scope.deleteFromEditModal.displayModal = false;
                }
            }
        }
    };

    // @todo Handle config settings for MT
    const setTenantsForApplicationPermissions = function() {
        let tenants = [];
        tenants = tenants.concat($scope.resource.tenantsArray);
        tenants.sort();

        // Add the global tenant if multitenacy isn't enabled, or if it is enabled and the global tenant is also enabled.
        if (!$scope.multiTenancyOptions.enabled || $scope.multiTenancyOptions.tenants.enable_global) {
            tenants.unshift({
                isDeletable: false,
                name: 'global',
                permissions: $scope.resource.applications.permissions || [],
                actiongroups: $scope.resource.applications.actiongroups || [],
            });
        }

        $scope.applicationPermissions.availableTenants = tenants;

        if ($scope.applicationPermissions.availableTenants.length) {
            $scope.applicationPermissions.tenant = $scope.applicationPermissions.availableTenants[0];
            $scope.applicationPermissions.selectedTenant = $scope.applicationPermissions.tenant;
        }

    };

    /**
     * Ask for confirmation before deleting an entry
     * @param {array} thearray
     * @param {int} index
     * @param {string} value
     */
    $scope.confirmRemoveTenant = function(item) {
        // We're not checking the value here, so we may need to adjust the body
        let body = (value === '') ? 'Are you sure you want to delete this?' : `Are you sure you want to delete '${value}'?`;
        $scope.deleteFromEditModal = {
            displayModal: true,
            header: 'Confirm Delete',
            body: body,
            onConfirm: function() {
                thearray.splice(index, 1);
                $scope.closeDeleteFromEditModal()
            },
            onClose: $scope.closeDeleteFromEditModal
        }
    };

    /**
     * Add a new tenant in the Application Permissions tab
     * @param $select
     */
    $scope.refreshNewTenant = function($select) {
        var search = $select.search,
            list = angular.copy($select.items),
            FLAG = -1; // Identifies the custom value

        // Clean up any previous custom input
        list = list.filter(function(item) {
            return item.id !== FLAG;
        });

        if (!search) {
            $select.items = list;
        } else {
            // Add and select the custom value
            let customItem = {
                id: FLAG,
                name: search
            };
            $select.items = [customItem].concat(list);

            $select.selected = customItem;
        }
    };

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
        var css = "";

        if ($scope.selectedTab == tabId) {
            css = " kuiLocalTab kuiLocalTab-isSelected";
        } else {
            css = " kuiLocalTab";
        }
        if (tabId != "indexpermissions" && $scope.addingIndex) {
            css += " tab-inactive";
        }
        return css;
    }

    $scope.selectTab = function(tabId) {
        // ITT-1034 disable other tabs when addind a new index
        if ($scope.addingIndex) {
            return;
        }
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

    /**
     * This is a weird workaround for the autocomplete where
     * we have can't or don't want to use the model item
     * directly in the view. Instead, we use the on-select
     * event to set the target value
     * @type {{}}
     */
    $scope.onSelectedNewIndexName = function(event) {
        $scope.newIndexName = event.item.name;
    };

    /**
     * This is a weird workaround for the autocomplete where
     * we have can't or don't want to use the model item
     * directly in the view. Instead, we use the on-select
     * event to set the target value
     * @type {{}}
     */
    $scope.onSelectedNewDocumentTypeName = function(event) {
        $scope.newDocumentTypeName = event.item.name;

    };

    /**
     * This is a helper for when the autocomplete was closed an item being explicitly selected (mouse, tab or enter).
     * When you e.g. type a custom value and then click somewhere outside of the autocomplete, it looks like the
     * custom value was selected, but it is never saved to the model. This function calls the "select" method
     * every time the autocomplete is closed, no matter how. This may mean that the select function is called
     * twice, so the select handler should mitigate that if necessary.
     * @param isOpen
     * @param $select
     */
    $scope.onCloseNewIndexAutocompletes = function(isOpen, $select) {
        if (isOpen || !$select.select || !$select.selected) {
            return;
        }

        $select.select($select.selected);
    };

    /**
     * Allow custom values for the index autocomplete
     *
     * @credit https://medium.com/angularjs-meetup-south-london/angular-extending-ui-select-to-accept-user-input-937bc925267c
     * @param $select
     */
    $scope.refreshNewIndexName = function($select) {

        var search = $select.search,
            list = angular.copy($select.items),
            FLAG = -1; // Identifies the custom value

        // Clean up any previous custom input
        list = list.filter(function(item) {
            return item.id !== FLAG;
        });

        if (!search) {
            $select.items = list;
        } else {
            // Add and select the custom value
            let customItem = {
                id: FLAG,
                name: search
            };
            $select.items = [customItem].concat(list);

            $select.selected = customItem;
        }
    };


    /**
     * Allow custom values for the document types autocomplete
     *
     * @credit https://medium.com/angularjs-meetup-south-london/angular-extending-ui-select-to-accept-user-input-937bc925267c
     * @param $select
     */
    $scope.refreshNewDocumentTypeNames = function($select) {

        var search = $select.search,
            list = angular.copy($select.items),
            FLAG = -1;

        // Clean up any previous custom input
        list = list.filter(function(item) {
            return item.id !== FLAG;
        });

        if (!search) {
            $select.items = list;
        } else {
            // Add and select the custom value
            let customItem = {
                id: FLAG,
                name: search
            };
            $select.items = [customItem].concat(list);

            $select.selected = customItem;
        }
    };


    /**
     * Delete an entry after user confirmation
     */
    let deleteDocumentTypeConfirmed = function() {
        var index = $scope.selectedIndex;
        var doctype = $scope.selectedDocumentType;
        if ($scope.resource.indices && $scope.resource.indices[index] && $scope.resource.indices[index][doctype]) {
            delete $scope.resource.indices[index][doctype];
            // if last doctype, remove index as well
            var remainingDocTypes = Object.keys($scope.resource.indices[index]);
            if (remainingDocTypes.length == 0) {
                // Manually select another index if available to avoid a broken UI state
                let newIndex = null;
                let availableIndices = Object.keys($scope.resource.indices).sort();

                if (availableIndices.length > 1) {
                    const listPosition = availableIndices.indexOf(index);
                    // Get the next index in the list if available, otherwise the previous one
                    newIndex = (availableIndices.length -1 > listPosition)
                        ? availableIndices[listPosition + 1]
                        : availableIndices[listPosition - 1]
                    ;
                }

                delete $scope.resource.indices[index];
                delete $scope.resource.dlsfls[index];

                $scope.selectedDocumentType = "";
                if (newIndex !== null) {
                    $scope.selectedIndex = newIndex;
                    // The change handler takes care of the selectedDocumentType
                    $scope.onIndexChange();
                } else {
                    $scope.selectedIndex = "";
                }

            } else {
                $scope.selectedDocumentType = remainingDocTypes[0];
            }
        }

        $scope.closeDeleteFromEditModal();
    };

    /**
     * Ask for confirmation before deleting
     */
    $scope.confirmDeleteDocumentType = function() {
        // Since we're acting on the parent scope here,
        // make sure we don't change the deleteFromEditModal
        // reference directly. Only change single properties.
        $scope.deleteFromEditModal.displayModal = true;
        $scope.deleteFromEditModal.header = 'Confirm Delete';
        $scope.deleteFromEditModal.body = "Are you sure you want to delete document type '"+$scope.selectedDocumentType+"' in index '"+$scope.selectedIndex+"'";
        $scope.deleteFromEditModal.onConfirm = deleteDocumentTypeConfirmed;
        $scope.deleteFromEditModal.onClose = $scope.closeDeleteFromEditModal;
    };

    /**
     *
     * @deprecated
     */
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
        // dots in index names are not supported
        $scope.newIndexName = $scope.newIndexName.replace(/\./g, '?');
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

        $scope.newIndexValues = {
            index: null,
            documentType: null
        };
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
                    toastNotifications.addDanger({
                        title: "DLS query syntax not valid.",
                        text: response.data.error
                    });
                } else {
                    $scope.errorMessage = "";
                    toastNotifications.addSuccess({
                        title: "DLS query syntax valid."
                    });
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

        // not dots in keys allowed
        if ($scope.resourcename.indexOf('.') != -1) {
            $scope.errorMessage = 'Please do not use dots in the role name.';
            return;
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
                    $scope.resource = $scope.service.postFetch(response, $scope.applicationActionGroups['kibana'] || []);
                    setTenantsForApplicationPermissions();
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
            setTenantsForApplicationPermissions();
            if ($routeParams.name) {
                $scope.resourcename = $routeParams.name;
            }
            $scope.isNew = true;
        }
        $scope.loaded = true;
    });

});


