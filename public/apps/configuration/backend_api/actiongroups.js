import { uiModules } from 'ui/modules';
import { merge } from 'lodash';
import { uniq } from 'lodash';
import client from './client';

/**
 * Action groups API client service.
 */
uiModules.get('apps/searchguard/configuration', [])
    .service('backendActionGroups', function (backendAPI, Promise, $http, createNotifier, kbnUrl) {

        const RESOURCE = 'actiongroups';

        const notify = createNotifier({});

        this.title = {
            singular: 'action group',
            plural: 'action groups'
        };

        this.newLabel = "Action Group name";

        this.list = () => {
            return backendAPI.list(RESOURCE);
        };

        this.listSilent = () => {
            return backendAPI.listSilent(RESOURCE);
        };

        this.get = (id) => {
            return backendAPI.get(RESOURCE, id);
        };

        this.save = (actiongroupname, data) => {
            sessionStorage.removeItem("actiongroupsautocomplete");
            sessionStorage.removeItem("actiongroupnames");
            var data = this.preSave(data);
            return backendAPI.save(RESOURCE, actiongroupname, data);
        };

        this.delete = (id) => {
            sessionStorage.removeItem("actiongroupsautocomplete");
            sessionStorage.removeItem("actiongroupnames");
            return backendAPI.delete(RESOURCE, id);
        };

        this.listAutocomplete = (names) => {
            return backendAPI.listAutocomplete(names);
        };

        this.emptyModel = () => {
            var actiongroup = {};
            actiongroup.permissions = [];
            actiongroup.actiongroups = [];
            return actiongroup;
        };

        this.preSave = (actiongroup) => {
            var result = {};
            var all = [];
            all = all.concat(actiongroup.actiongroups);
            all = all.concat(actiongroup.permissions);
            // remove empty roles
            all = all.filter(e => String(e).trim());
            // remove duplicate roles
            all = uniq(all);
            result["permissions"] = all;
            return result;
        };

        this.postFetch = (actiongroup) => {
            // we need to support old and new format of actiongroups,
            // normalize both formats to common representation

            var permissionsArray = actiongroup;

            // new SG6 format, explicit permissions entry
            if (actiongroup.permissions) {
                permissionsArray = actiongroup.permissions;
            }
            // determine which format to use
            permissionsArray = backendAPI.cleanArraysFromDuplicates(permissionsArray);

            var permissions = backendAPI.sortPermissions(permissionsArray);

            // if readonly flag is set for SG6 format, add as well
            if (actiongroup.readonly) {
                permissions["readonly"] = actiongroup.readonly;
            }

            return permissions;
        };

    });

