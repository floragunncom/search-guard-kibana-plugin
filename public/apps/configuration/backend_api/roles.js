import { uiModules } from 'ui/modules';
import { merge } from 'lodash';
import { uniq } from 'lodash';
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

        this.list = () => {
            return backendAPI.list(RESOURCE);
        };

        this.get = (id) => {
            return backendAPI.get(RESOURCE, id);
        };

        this.save = (actiongroupname, data) => {
            var data = this.preSave(data);
            return backendAPI.save(RESOURCE, actiongroupname, data);
        };

        this.delete = (id) => {
            return backendAPI.delete(RESOURCE, id);
        };

        this.emptyModel = () => {
            var role = {};
            role["cluster"] = [];
            role["indices"] = {};
            return role;
        };

        this.preSave = (role) => {

//            console.log(JSON.stringify(role));
            delete role["indexnames"];
            // merge cluster permissions
            var clusterpermissions = this.mergeCleanArray(role.cluster.actiongroups, role.cluster.permissions);
            // delete tmp permissions
            delete role.cluster["actiongroups"];
            delete role.cluster["permissions"];
            role.cluster = clusterpermissions;

            // same for each index and each doctype
            for (var indexname in role.indices) {
                var index = role.indices[indexname];

                for (var doctypename in index) {
                    var doctype = index[doctypename];
                    var doctypepermissions = this.mergeCleanArray(doctype.actiongroups, doctype.permissions);
                    delete doctype["actiongroups"];
                    delete doctype["permissions"];
                    index[doctypename] = doctypepermissions;
                }

                // move back dls and fls
                var dlsfls = role.dlsfls[indexname];
                if(dlsfls) {
                    index["_dls_"] = dlsfls["_dls_"];
                    index["_fls_"] = dlsfls["_fls_"];
                }
            }

            delete role["dlsfls"];

            return role;
        };

        this.postFetch = (role) => {
            console.log(JSON.stringify(role));
            // separate action groups and single permissions on cluster level

            var clusterpermissions = this.sortPermissions(role.cluster);
            role["cluster"] = {};
            role.cluster["actiongroups"] = clusterpermissions.actiongroups;
            role.cluster["permissions"] = clusterpermissions.permissions;

            if (role.indices) {

                // flat list of indexnames, can't be done in view
                role["indexnames"] = Object.keys(role.indices).sort();

                // move dls and fls to separate section on top level
                // otherwise its on the same level as the document types
                // and it is hard to separate them in the views. We
                // should think about restructuring the config here, but
                // for the moment we're fiddling with the model directly
                role.dlsfls = {};

                for (var indexname in role.indices) {

                    var index = role.indices[indexname];

                    var dlsfls = {
                        _dls_: "",
                        _fls_: []
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
                    for (var doctypename in index) {
                        var doctype = index[doctypename];
                        var doctypepermissions = this.sortPermissions(doctype);
                        doctype = {
                            actiongroups: doctypepermissions.actiongroups,
                            permissions: doctypepermissions.permissions
                        }
                        index[doctypename] = doctype;
                    }
                }
            }
            console.log(JSON.stringify(role));
            return role;
        };

        this.mergeCleanArray = (array1, array2) => {
            var merged = [];
            merged = merged.concat(array1);
            merged = merged.concat(array2);
            merged = this.cleanArray(merged);
            return merged;
        };


        this.cleanArray = (thearray) => {
            // remove empty entries
            thearray = thearray.filter(e => String(e).trim());
            // remove duplicate entries
            thearray = uniq(thearray);
            return thearray;
        };

        this.sortPermissions = (permissionsArray) => {
            var actiongroups = [];
            var permissions = [];
            if (permissionsArray && Array.isArray(permissionsArray)) {
                permissionsArray.forEach(function (entry) {
                    if (entry.startsWith("cluster:") || entry.startsWith("indices:")) {
                        permissions.push(entry);
                    } else {
                        actiongroups.push(entry);
                    }
                });
            }
            return {
                actiongroups: actiongroups,
                permissions: permissions
            }
        };

    });
