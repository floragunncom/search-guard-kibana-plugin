import { uiModules } from 'ui/modules';
import { merge } from 'lodash';
import { uniq } from 'lodash';
import client from './client';

/**
 * Role mappings API client service.
 */
uiModules.get('apps/searchguard/configuration', [])
    .service('backendRoles', function (backendAPI, Promise, $http, createNotifier) {

//      #<sg_role_name>:
//      #  cluster:
//          #    - '<permission>'
//#  indices:
//          #    '<indexname or alias>':
//      #      '<type>':
//      #        - '<permission>'
//#      _dls_: '<querydsl query>'
//#      _fls_:
//          #        - '<field>'
//#        - '<field>'


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
            var rolemapping = {};
            rolemapping.users = [];
            rolemapping.hosts = [];
            rolemapping.backendroles = [];
            return rolemapping;
        };

        this.preSave = (role) => {
            delete role["indexnames"];
            // merge cluster permissions
            role.cluster = this.mergeCleanArray(role.cluster.actiongroups, role.cluster.permissions);
            // delete tmp permissions
            delete role.cluster[clusteractiongroups];
            delete role.cluster[clusterpermissions];

            // same for each index and each doctype
            for (var indexname in role.indices) {
                var index = role.indices[indexname];
                // caution! honor dls fls here
                for (var doctypename in index) {
                    var doctype = index[doctypename];
                    doctype = this.mergeCleanArray(doctype.actiongroups, doctype.permissions);
                    delete doctype[clusteractiongroups];
                    delete doctype[clusterpermissions];

                }
            }

            return role;
        };

        this.postFetch = (role) => {
            if (role.indices) {
                // flat list of indexnames, can't be done in view
                role["indexnames"] = Object.keys(role.indices).sort();
                // separate action groups and single permissions on cluster level
                var clusterpermissions = this.sortPermissions(role.cluster);
                role.cluster.actiongroups = clusterpermissions.actiongroups;
                role.cluster.permissions = clusterpermissions.permissions;
                // same for each index and each doctype

                // move dls and fls to separate section on top level
                // otherwise its on the same level as the document types
                // and it is hard to separate them in the views. We
                // should think about restructuring the config here, but
                // for the moment we're fiddling with the model directly
                role.dlsfls = {};

                for (var indexname in role.indices) {
                    role.dlsfls[indexname] = {
                        _dls_: "",
                        _fls_: []
                    }
                    var index = role.indices[indexname];
                    for (var doctypename in index) {
                        var doctype = index[doctypename];
                        // dlsfls
                        if (doctypename === "_dls_") {
                            role.dlsfls[indexname]._dls_ = doctype;
                        }
                        if (doctypename === "_fls_") {
                            role.dlsfls[indexname]._fls_ = doctype;
                        }
                        if (Array.isArray(doctype)) {
                            var doctypepermissions = this.sortPermissions(doctype);
                            doctype.actiongroups = doctypepermissions.actiongroups;
                            doctype.permissions = doctypepermissions.permissions;
                        }
                    }
                    // we moved dls/fls, delete them from index
                    delete index["_dls_"];
                    delete index["_fls_"];
                }
            }
            console.log(role);
            return role;
        };

        this.mergeCleanArray = (array1, array) => {
            var merged = [];
            merged.concat(role.cluster.clusteractiongroups);
            merged.concat(role.cluster.clusterpermissions);
            merged = cleanArray(merged);
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
