import { uiModules } from 'ui/modules';
import { merge } from 'lodash';
import { uniq } from 'lodash';

/**
 * Action groups API client service.
 */
uiModules.get('apps/searchguard/configuration', [])
    .service('backendActionGroups', function (backendAPI, Promise, $http, createNotifier) {

        const RESOURCE = 'actiongroups';

        const notify = createNotifier({
            location: 'Action groups'
        });

        this.title = {
            singular: 'Action group',
            plural: 'Action groups'
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
            console.log(actiongroup);
            // we want to have two arrays, one with other action groups, one with single permissions
            var actiongroups = [];
            var permissions = [];
            actiongroup.forEach(function (entry) {
                if (entry.startsWith("cluster:") || entry.startsWith("indices:")) {
                    permissions.push(entry);
                } else {
                    actiongroups.push(entry);
                }
            });
            actiongroups.sort();
            permissions.sort();
            return {
                actiongroups: actiongroups,
                permissions: permissions
            }
        };

    });

