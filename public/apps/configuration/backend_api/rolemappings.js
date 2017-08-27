import { uiModules } from 'ui/modules';
import { merge } from 'lodash';
import { uniq } from 'lodash';
import client from './client';

/**
 * Role mappings API client service.
 */
uiModules.get('apps/searchguard/configuration', [])
    .service('backendRoleMappings', function (backendAPI, Promise, $http, createNotifier) {

        const RESOURCE = 'rolemappings';

        const notify = createNotifier({
            location: 'Role mappings'
        });

        this.title = {
            singular: 'Role mapping',
            plural: 'Role mappings'
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

        this.preSave = (rolemapping) => {
            rolemapping.users = this.cleanArray(rolemapping.users);
            rolemapping.backendroles = this.cleanArray(rolemapping.backendroles);
            rolemapping.hosts = this.cleanArray(rolemapping.hosts);
            return rolemapping;
        };

        this.postFetch = (rolemapping) => {
            rolemapping = backendAPI.cleanArraysFromDuplicates(rolemapping);
            return rolemapping;
        };

        this.cleanArray = (thearray) => {
            if (thearray && Array.isArray(thearray)) {
                // remove empty entries
                thearray = thearray.filter(e => String(e).trim());
                // remove duplicate entries
                thearray = uniq(thearray);
                return thearray;
            }
        };

    });
