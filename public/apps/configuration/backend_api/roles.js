import { uiModules } from 'ui/modules';
import { isEmpty } from 'lodash';
import client from './client';

/**
 * Role mappings API client service.
 */
uiModules.get('apps/searchguard/configuration', [])
    .service('backendRoles', function (backendAPI, Promise, $http, createNotifier) {

        const RESOURCE = 'roles';

        const notify = createNotifier({
            location: 'Roles'
        });

        this.title = {
            singular: 'Role',
            plural: 'Roles'
        };

        this.newLabel = "Role name";

        this.list = () => {
            return backendAPI.list(RESOURCE);
        };

        this.get = (id) => {
            return backendAPI.get(RESOURCE, id);
        };

        this.save = (rolename, data) => {
            var data = this.preSave(data);
            return backendAPI.save(RESOURCE, rolename, data);
        };

        this.delete = (id) => {
            return backendAPI.delete(RESOURCE, id);
        };

        this.emptyModel = () => {
            var role = {};
            role["cluster"] = [""];
            role["indices"] = {};
            role["tenants"] = {};
            return role;
        };

        this.addEmptyIndex = (role, indexname, doctypename) => {
            if (!role.indices) {
                role["indices"] = {};
            }
            if (!role.indices[indexname]) {
                role.indices[indexname] = {};
                role.dlsfls[indexname] = {
                    _dls_: "",
                    _fls_: [],
                    _flsmode_: "whitelist"
                };
            }
            role.indices[indexname][doctypename] = {
                "actiongroups": [],
                "permissions": []
            };
        }

        this.preSave = (role) => {
            delete role["indexnames"];
            // merge cluster permissions
            var clusterpermissions = backendAPI.mergeCleanArray(role.cluster.actiongroups, role.cluster.permissions);
            // delete tmp permissions
            delete role.cluster["actiongroups"];
            delete role.cluster["permissions"];
            role.cluster = clusterpermissions;

            // same for each index and each doctype
            for (var indexname in role.indices) {
                var index = role.indices[indexname];

                for (var doctypename in index) {
                    var doctype = index[doctypename];
                    var doctypepermissions = backendAPI.mergeCleanArray(doctype.actiongroups, doctype.permissions);
                    delete doctype["actiongroups"];
                    delete doctype["permissions"];
                    index[doctypename] = doctypepermissions;
                }

                // set field prefixes according to FLS mode
                this.setFlsModeToFields(role.dlsfls[indexname]);

                // move back dls and fls
                var dlsfls = role.dlsfls[indexname];
                if(dlsfls) {
                    if (dlsfls["_dls_"].length > 0) {
                        index["_dls_"] = dlsfls["_dls_"];
                    }
                    if (dlsfls["_fls_"].length > 0) {
                        index["_fls_"] = dlsfls["_fls_"];
                    }
                }
            }

            delete role["dlsfls"];

            // tenants
            role["tenants"] = {};
            for (var tenant in role.tenantsArray) {
                if (tenant && tenant.name != "") {
                    role.tenants[tenant.name] = tenant.permissions;
                }
            }

            delete role["tenantsArray"];
            return role;
        };

        this.postFetch = (role) => {

            role = backendAPI.cleanArraysFromDuplicates(role);

            // separate action groups and single permissions on cluster level
            var clusterpermissions = backendAPI.sortPermissions(role.cluster);
            role["cluster"] = {};
            role.cluster["actiongroups"] = clusterpermissions.actiongroups;
            role.cluster["permissions"] = clusterpermissions.permissions;

            // move dls and fls to separate section on top level
            // otherwise its on the same level as the document types
            // and it is hard to separate them in the views. We
            // should think about restructuring the config here, but
            // for the moment we're fiddling with the model directly
            role.dlsfls = {};

            if (role.indices) {

                // flat list of indexnames, can't be done in view
                role["indexnames"] = Object.keys(role.indices).sort();

                for (var indexname in role.indices) {

                    var index = role.indices[indexname];

                    var dlsfls = {
                        _dls_: "",
                        _fls_: [],
                        _flsmode_: "whitelist"
                    };

                    if (index["_dls_"]) {
                        dlsfls._dls_ = index["_dls_"];
                    }
                    if (index["_fls_"]) {
                        dlsfls._fls_ = index["_fls_"];
                    }
                    delete role.indices[indexname]["_fls_"];
                    delete role.indices[indexname]["_dls_"];
                    role.dlsfls[indexname] = dlsfls;

                    // determine the fls mode and strip any prefixes
                    this.determineFlsMode(role.dlsfls[indexname]);

                    // sort permissions into actiongroups and single permissions
                    for (var doctypename in index) {
                        var doctype = index[doctypename];
                        var doctypepermissions = backendAPI.sortPermissions(doctype);
                        doctype = {
                            actiongroups: doctypepermissions.actiongroups,
                            permissions: doctypepermissions.permissions
                        }
                        index[doctypename] = doctype;
                    }
                }
            }

            // transform tenants to object
            role["tenantsArray"] = [];
            if (role.tenants) {
                var tenantNames = Object.keys(role.tenants).sort();
                tenantNames.forEach(function(tenantName){

                    role.tenantsArray.push(
                        {
                            name: tenantName,
                            permissions: role.tenants[tenantName]
                        }
                    );
                });
            }
            delete role["tenants"];
            return role;
        };

        /**
         * Determine the FLS mode (exclude/include) and
         * strip the prefixes from the fields for
         * display purposes. Rule here is that if one field
         * is excluded, i.e. prefixed with a tilde, we
         * assume exclude (blacklist) mode.
         * @param dlsfls
         */
        this.determineFlsMode = function (dlsfls) {
            // default is whitelisting
            dlsfls["_flsmode_"] = "whitelist";
            // any fields to set?
            var flsFields = dlsfls["_fls_"];
            if (isEmpty(flsFields) || !Array.isArray(flsFields)) {
                return;
            }
            for (var index = 0; index < flsFields.length; ++index) {
                var field = flsFields[index];
                if (field.startsWith("~")) {
                    // clean multiple tildes at the beginning, just in case
                    flsFields[index] = field.replace(/^\~+/, '');
                    dlsfls["_flsmode_"] = "blacklist";
                }
            }
        }

        /**
         * Ensure that all fields are either prefixed with
         * a tilde, or no field is prefixed with a tilde, based
         * on the exclude/include mode of FLS.
         * @param dlsfls
         */
        this.setFlsModeToFields = function(dlsfls) {
            if (!dlsfls) {
                return;
            }
            // any fields to set?
            var flsFields = dlsfls["_fls_"];
            if (isEmpty(flsFields) || !Array.isArray(flsFields)) {
                return;
            }

            for (var index = 0; index < flsFields.length; ++index) {
                var field = flsFields[index];
                // remove any tilde from beginning of string, in case
                // the user has added it in addition to setting mode to blacklist
                // We need just a single tilde here.
                field = field.replace(/^\~+/, '');
                if (!field.startsWith("~") && dlsfls["_flsmode_"] == "blacklist") {
                    flsFields[index] = "~" + field;
                }
            }
        }

        /**
         * Checks whether a role definition is empty. Empty
         * roles are not supported and cannot be saved. We need
         * at least some index or clusterpermissions, DLSFLS or tenants
         * @param role
         */
        this.isRoleEmpty = function (role) {

            // clean duplicates and remove empty arrays
            role = backendAPI.cleanArraysFromDuplicates(role);
            // tenants and clusterpermissions
            var tenantsEmpty = role.tenantsArray.length == 0;
            var clusterPermsEmpty = role.cluster.actiongroups.length == 0 && role.cluster.permissions.length == 0;
            var dlsFlsEmpty = true;

            if (role.dlsfls && Object.keys(role.dlsfls).length > 0) {
                dlsFlsEmpty = false;
            }

            var indicesEmpty = this.indicesEmpty(role);

            return tenantsEmpty && clusterPermsEmpty && dlsFlsEmpty && indicesEmpty;
        }

        this.indicesEmpty = function (role) {
            // index, we need at least one index with one document type with one role
            var indicesEmpty = true;
            if (role.indices) {
                // flat list of indexnames
                var indexNames = Object.keys(role.indices);
                for (var indexName in indexNames) {
                    // get index definition
                    var index = role.indices[indexName];
                    // check all document types
                    for (var doctype in index) {
                        if (doctype) {
                            // we just need one permissions to satisfy non-emptiness
                            if (doctype.actiongroups && doctype.actiongroups.length > 0) {
                                indicesEmpty = true;
                                break;
                            }
                            if (doctype.permissions && doctype.permissions.length > 0) {
                                indicesEmpty = true;
                                break;
                            }
                        }
                    }

                }
            }
            return indicesEmpty;
        }

    });
